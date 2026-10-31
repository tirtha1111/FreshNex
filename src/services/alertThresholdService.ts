import { ref, set, get, onValue, off, remove, update } from 'firebase/database';
import { 
  collection, 
  doc, 
  setDoc, 
  getDocs, 
  onSnapshot, 
  updateDoc, 
  deleteDoc, 
  query, 
  orderBy, 
  limit 
} from 'firebase/firestore';
import { getDirectDatabase, getDirectFirestore } from './firebaseService';
import { SensorData, FoodItem } from '../types';

export interface SensorThresholdConfig {
  tempMin: number; // Minimum safe temp (°C), e.g. 0°C
  tempMax: number; // Maximum safe temp (°C), e.g. 8°C (warning) or 15°C (critical)
  tempCritical: number; // Severe thermal abuse (°C), e.g. 20°C
  gasWarning: number; // VOC / Gas warning threshold in PPM, e.g. 250 PPM
  gasCritical: number; // Hazardous decomposition gas threshold in PPM, e.g. 400 PPM
  humidityMin: number; // Min humidity (%), e.g. 40%
  humidityMax: number; // Max humidity (%), e.g. 85%
  enableAudio: boolean; // Play sound on breach
  autoResolve: boolean; // Auto-resolve when reading returns to normal
}

export const DEFAULT_THRESHOLDS: SensorThresholdConfig = {
  tempMin: 0.0,
  tempMax: 8.0,
  tempCritical: 15.0,
  gasWarning: 250,
  gasCritical: 400,
  humidityMin: 40,
  humidityMax: 85,
  enableAudio: true,
  autoResolve: false,
};

export interface SensorAlertEvent {
  id: string;
  type: string;
  title: string;
  message: string;
  severity: 'warning' | 'critical' | 'info' | 'success';
  metric: 'temperature' | 'gas' | 'humidity' | 'general';
  currentValue: number;
  thresholdValue: number;
  unit: string;
  deviceId?: string;
  itemId?: string;
  itemName?: string;
  timestamp: number;
  read: boolean;
  resolved: boolean;
  userId?: string;
}

// Memory cache for recent alert cooldown to prevent notification fatigue (30 seconds cooldown per metric/item)
const recentAlertCooldowns: Record<string, number> = {};
const ALERT_COOLDOWN_MS = 25000;

/**
 * Evaluates live sensor reading against threshold configuration
 */
export function evaluateSensorReading(
  sensor: SensorData,
  item?: FoodItem | null,
  customThresholds?: Partial<SensorThresholdConfig>
): SensorAlertEvent[] {
  const config = { ...DEFAULT_THRESHOLDS, ...customThresholds };
  const newAlerts: SensorAlertEvent[] = [];
  const now = Date.now();
  const itemId = item?.id || 'UNKNOWN_ITEM';
  const itemName = item?.name || 'Monitored Unit';

  // 1. Temperature Threshold Checks
  if (sensor.temperature > config.tempCritical) {
    const key = `${itemId}_temp_crit`;
    if (!recentAlertCooldowns[key] || now - recentAlertCooldowns[key] > ALERT_COOLDOWN_MS) {
      recentAlertCooldowns[key] = now;
      newAlerts.push({
        id: `alert-temp-crit-${now}-${Math.random().toString(36).substring(2, 6)}`,
        type: 'Temperature Critical',
        title: 'Critical Temperature Spike Exceeded',
        message: `${itemName} temperature reached ${sensor.temperature.toFixed(1)}°C (Critical Limit: ${config.tempCritical}°C). Immediate refrigeration required to prevent rapid spoilage.`,
        severity: 'critical',
        metric: 'temperature',
        currentValue: +sensor.temperature.toFixed(1),
        thresholdValue: config.tempCritical,
        unit: '°C',
        deviceId: item?.tagId || `#${itemId}`,
        itemId: itemId,
        itemName: itemName,
        timestamp: now,
        read: false,
        resolved: false,
      });
    }
  } else if (sensor.temperature > config.tempMax) {
    const key = `${itemId}_temp_warn`;
    if (!recentAlertCooldowns[key] || now - recentAlertCooldowns[key] > ALERT_COOLDOWN_MS) {
      recentAlertCooldowns[key] = now;
      newAlerts.push({
        id: `alert-temp-warn-${now}-${Math.random().toString(36).substring(2, 6)}`,
        type: 'Temperature Warning',
        title: 'Temperature Threshold Exceeded',
        message: `${itemName} temperature elevated to ${sensor.temperature.toFixed(1)}°C (Safe Max: ${config.tempMax}°C). Storage temperature is rising above cold-chain limits.`,
        severity: 'warning',
        metric: 'temperature',
        currentValue: +sensor.temperature.toFixed(1),
        thresholdValue: config.tempMax,
        unit: '°C',
        deviceId: item?.tagId || `#${itemId}`,
        itemId: itemId,
        itemName: itemName,
        timestamp: now,
        read: false,
        resolved: false,
      });
    }
  } else if (sensor.temperature < config.tempMin) {
    const key = `${itemId}_temp_freeze`;
    if (!recentAlertCooldowns[key] || now - recentAlertCooldowns[key] > ALERT_COOLDOWN_MS) {
      recentAlertCooldowns[key] = now;
      newAlerts.push({
        id: `alert-temp-freeze-${now}-${Math.random().toString(36).substring(2, 6)}`,
        type: 'Freezing Hazard',
        title: 'Sub-Zero Freezing Alert',
        message: `${itemName} temperature dropped to ${sensor.temperature.toFixed(1)}°C (Min: ${config.tempMin}°C). Risk of cell rupture from frost damage.`,
        severity: 'warning',
        metric: 'temperature',
        currentValue: +sensor.temperature.toFixed(1),
        thresholdValue: config.tempMin,
        unit: '°C',
        deviceId: item?.tagId || `#${itemId}`,
        itemId: itemId,
        itemName: itemName,
        timestamp: now,
        read: false,
        resolved: false,
      });
    }
  }

  // 2. Gas / VOC Level Threshold Checks
  const isRawAdc = sensor.gas > 500;
  const gasWarningLimit = isRawAdc ? 1400 : config.gasWarning;
  const gasCriticalLimit = isRawAdc ? 1800 : config.gasCritical;
  const gasUnit = isRawAdc ? 'ADC' : 'ppm';

  if (sensor.gas > gasCriticalLimit) {
    const key = `${itemId}_gas_crit`;
    if (!recentAlertCooldowns[key] || now - recentAlertCooldowns[key] > ALERT_COOLDOWN_MS) {
      recentAlertCooldowns[key] = now;
      newAlerts.push({
        id: `alert-gas-crit-${now}-${Math.random().toString(36).substring(2, 6)}`,
        type: 'Hazardous VOC Spike',
        title: 'Severe Gas / Spoilage Threshold Exceeded',
        message: `${itemName} VOC / Gas sensor spiked to ${Math.round(sensor.gas)} ${gasUnit} (Hazard Limit: ${gasCriticalLimit} ${gasUnit}). Elevated bacterial amine off-gassing detected!`,
        severity: 'critical',
        metric: 'gas',
        currentValue: Math.round(sensor.gas),
        thresholdValue: gasCriticalLimit,
        unit: gasUnit,
        deviceId: item?.tagId || `#${itemId}`,
        itemId: itemId,
        itemName: itemName,
        timestamp: now,
        read: false,
        resolved: false,
      });
    }
  } else if (sensor.gas > gasWarningLimit) {
    const key = `${itemId}_gas_warn`;
    if (!recentAlertCooldowns[key] || now - recentAlertCooldowns[key] > ALERT_COOLDOWN_MS) {
      recentAlertCooldowns[key] = now;
      newAlerts.push({
        id: `alert-gas-warn-${now}-${Math.random().toString(36).substring(2, 6)}`,
        type: 'Gas Level Elevated',
        title: 'Volatile Gas Threshold Exceeded',
        message: `${itemName} VOC reading is ${Math.round(sensor.gas)} ${gasUnit} (Threshold: ${gasWarningLimit} ${gasUnit}). Early ethylene / ripening gas buildup observed.`,
        severity: 'warning',
        metric: 'gas',
        currentValue: Math.round(sensor.gas),
        thresholdValue: gasWarningLimit,
        unit: gasUnit,
        deviceId: item?.tagId || `#${itemId}`,
        itemId: itemId,
        itemName: itemName,
        timestamp: now,
        read: false,
        resolved: false,
      });
    }
  }

  // 3. Humidity Level Threshold Checks
  if (sensor.humidity > config.humidityMax) {
    const key = `${itemId}_hum_high`;
    if (!recentAlertCooldowns[key] || now - recentAlertCooldowns[key] > ALERT_COOLDOWN_MS) {
      recentAlertCooldowns[key] = now;
      newAlerts.push({
        id: `alert-hum-high-${now}-${Math.random().toString(36).substring(2, 6)}`,
        type: 'High Humidity Anomaly',
        title: 'Excessive Moisture Threshold Exceeded',
        message: `${itemName} relative humidity reached ${Math.round(sensor.humidity)}% (Max: ${config.humidityMax}%). Condensation creates severe mold hazard.`,
        severity: 'warning',
        metric: 'humidity',
        currentValue: Math.round(sensor.humidity),
        thresholdValue: config.humidityMax,
        unit: '%',
        deviceId: item?.tagId || `#${itemId}`,
        itemId: itemId,
        itemName: itemName,
        timestamp: now,
        read: false,
        resolved: false,
      });
    }
  }

  return newAlerts;
}

/**
 * Dispatch and persist a sensor alert to Firebase
 */
export async function pushAlertToFirebase(alert: SensorAlertEvent, userUid?: string): Promise<void> {
  const db = getDirectDatabase();
  const firestoreDb = getDirectFirestore();
  const alertPayload = {
    ...alert,
    userId: userUid || 'anonymous',
  };

  // 1. Save to LocalStorage cache
  try {
    const stored = localStorage.getItem('freshnex_realtime_alerts');
    const list: SensorAlertEvent[] = stored ? JSON.parse(stored) : [];
    const updated = [alertPayload, ...list.filter(a => a.id !== alert.id)].slice(0, 50);
    localStorage.setItem('freshnex_realtime_alerts', JSON.stringify(updated));
  } catch (e) {
    console.warn('Local alerts cache update error:', e);
  }

  // 2. Push to Firebase Realtime Database at alerts/{alertId}
  if (db) {
    try {
      const alertRef = ref(db, `alerts/${alert.id}`);
      await set(alertRef, alertPayload);
    } catch (err) {
      console.warn('Realtime Database alert publish error:', err);
    }
  }

  // 3. Push to Firestore if configured
  if (firestoreDb) {
    try {
      const alertDoc = doc(firestoreDb, 'alerts', alert.id);
      await setDoc(alertDoc, alertPayload);
    } catch (err) {
      console.warn('Firestore alert publish error:', err);
    }
  }
}

/**
 * Subscribe to real-time alerts stream from Firebase
 */
export function subscribeToFirebaseAlerts(
  callback: (alerts: SensorAlertEvent[]) => void
): () => void {
  const db = getDirectDatabase();
  const firestoreDb = getDirectFirestore();
  let unsubscribed = false;

  const getCachedAlerts = (): SensorAlertEvent[] => {
    try {
      const stored = localStorage.getItem('freshnex_realtime_alerts');
      if (stored) return JSON.parse(stored);
    } catch {}
    return [];
  };

  // Immediate callback with initial state
  callback(getCachedAlerts());

  let unsubscribeRtdb: (() => void) | null = null;
  let unsubscribeFirestore: (() => void) | null = null;

  // 1. Realtime Database listener
  if (db) {
    try {
      const alertsRef = ref(db, 'alerts');
      const handleRtdb = (snapshot: any) => {
        if (snapshot.exists()) {
          const val = snapshot.val();
          const list: SensorAlertEvent[] = val ? Object.keys(val).map(k => ({
            id: k,
            ...val[k]
          })) : [];
          list.sort((a, b) => b.timestamp - a.timestamp);
          localStorage.setItem('freshnex_realtime_alerts', JSON.stringify(list));
          callback(list);
        } else {
          try {
            localStorage.removeItem('freshnex_realtime_alerts');
          } catch {}
          callback([]);
        }
      };

      onValue(alertsRef, handleRtdb);
      unsubscribeRtdb = () => off(alertsRef, 'value', handleRtdb);
    } catch (e) {
      console.warn('Alerts RTDB subscription error:', e);
    }
  }

  // 2. Firestore listener fallback
  if (firestoreDb) {
    try {
      const alertsCol = collection(firestoreDb, 'alerts');
      const q = query(alertsCol, orderBy('timestamp', 'desc'), limit(50));
      unsubscribeFirestore = onSnapshot(q, (snapshot) => {
        if (!snapshot.empty) {
          const list: SensorAlertEvent[] = snapshot.docs.map(d => ({
            id: d.id,
            ...(d.data() as any)
          }));
          list.sort((a, b) => b.timestamp - a.timestamp);
          localStorage.setItem('freshnex_realtime_alerts', JSON.stringify(list));
          callback(list);
        } else {
          try {
            localStorage.removeItem('freshnex_realtime_alerts');
          } catch {}
          callback([]);
        }
      }, (err) => {
        console.warn('Firestore alerts onSnapshot error:', err);
      });
    } catch (e) {
      console.warn('Firestore alert listener error:', e);
    }
  }

  return () => {
    unsubscribed = true;
    if (unsubscribeRtdb) unsubscribeRtdb();
    if (unsubscribeFirestore) unsubscribeFirestore();
  };
}

/**
 * Mark an alert as read in Firebase
 */
export async function updateAlertReadState(alertId: string, read: boolean = true): Promise<void> {
  const db = getDirectDatabase();
  const firestoreDb = getDirectFirestore();

  // Local storage update
  try {
    const stored = localStorage.getItem('freshnex_realtime_alerts');
    if (stored) {
      const list: SensorAlertEvent[] = JSON.parse(stored);
      const updated = list.map(a => a.id === alertId ? { ...a, read } : a);
      localStorage.setItem('freshnex_realtime_alerts', JSON.stringify(updated));
    }
  } catch (e) {
    console.warn(e);
  }

  // Firebase Realtime DB
  if (db) {
    try {
      const alertRef = ref(db, `alerts/${alertId}/read`);
      await set(alertRef, read);
    } catch (e) {
      console.warn(e);
    }
  }

  // Firestore
  if (firestoreDb) {
    try {
      const docRef = doc(firestoreDb, 'alerts', alertId);
      await updateDoc(docRef, { read });
    } catch (e) {
      console.warn(e);
    }
  }
}

/**
 * Mark all alerts as read in Firebase
 */
export async function markAllAlertsReadFirebase(alerts: SensorAlertEvent[]): Promise<void> {
  const db = getDirectDatabase();
  const firestoreDb = getDirectFirestore();

  // LocalStorage update
  try {
    const stored = localStorage.getItem('freshnex_realtime_alerts');
    if (stored) {
      const list: SensorAlertEvent[] = JSON.parse(stored);
      const updated = list.map(a => ({ ...a, read: true }));
      localStorage.setItem('freshnex_realtime_alerts', JSON.stringify(updated));
    }
  } catch (e) {}

  if (db) {
    const updates: Record<string, any> = {};
    alerts.forEach(a => {
      updates[`alerts/${a.id}/read`] = true;
    });
    try {
      await update(ref(db), updates);
    } catch (e) {
      console.warn(e);
    }
  }
}

/**
 * Resolve an alert in Firebase
 */
export async function resolveAlertInFirebase(alertId: string): Promise<void> {
  const db = getDirectDatabase();
  const firestoreDb = getDirectFirestore();

  try {
    const stored = localStorage.getItem('freshnex_realtime_alerts');
    if (stored) {
      const list: SensorAlertEvent[] = JSON.parse(stored);
      const updated = list.map(a => a.id === alertId ? { ...a, resolved: true, read: true } : a);
      localStorage.setItem('freshnex_realtime_alerts', JSON.stringify(updated));
    }
  } catch (e) {}

  if (db) {
    try {
      await update(ref(db, `alerts/${alertId}`), { resolved: true, read: true });
    } catch (e) {
      console.warn(e);
    }
  }

  if (firestoreDb) {
    try {
      await updateDoc(doc(firestoreDb, 'alerts', alertId), { resolved: true, read: true });
    } catch (e) {
      console.warn(e);
    }
  }
}

/**
 * Clear or delete an alert
 */
export async function deleteAlertFromFirebase(alertId: string): Promise<void> {
  const db = getDirectDatabase();
  const firestoreDb = getDirectFirestore();

  try {
    const stored = localStorage.getItem('freshnex_realtime_alerts');
    if (stored) {
      const list: SensorAlertEvent[] = JSON.parse(stored);
      const updated = list.filter(a => a.id !== alertId);
      localStorage.setItem('freshnex_realtime_alerts', JSON.stringify(updated));
    }
  } catch (e) {}

  if (db) {
    try {
      await remove(ref(db, `alerts/${alertId}`));
    } catch (e) {
      console.warn(e);
    }
  }

  if (firestoreDb) {
    try {
      await deleteDoc(doc(firestoreDb, 'alerts', alertId));
    } catch (e) {
      console.warn(e);
    }
  }
}

/**
 * Clear or delete all alerts from local storage, Realtime DB, and Firestore
 */
export async function clearAllAlertsFromFirebase(): Promise<void> {
  const db = getDirectDatabase();
  const firestoreDb = getDirectFirestore();

  try {
    localStorage.removeItem('freshnex_realtime_alerts');
  } catch (e) {
    console.warn(e);
  }

  if (db) {
    try {
      await remove(ref(db, 'alerts'));
    } catch (e) {
      console.warn(e);
    }
  }

  if (firestoreDb) {
    try {
      const alertsCol = collection(firestoreDb, 'alerts');
      const snap = await getDocs(alertsCol);
      const deletions = snap.docs.map(d => deleteDoc(d.ref));
      await Promise.all(deletions);
    } catch (e) {
      console.warn(e);
    }
  }
}

/**
 * Save global sensor thresholds to Firebase Realtime Database & Firestore so all users/admins sync instantly
 */
export async function saveGlobalThresholdsToFirebase(config: SensorThresholdConfig): Promise<void> {
  const db = getDirectDatabase();
  const firestoreDb = getDirectFirestore();
  try {
    localStorage.setItem('freshnex_sensor_thresholds', JSON.stringify(config));
  } catch (e) {}

  if (db) {
    try {
      await set(ref(db, 'system/thresholds'), config);
    } catch (e) {
      console.warn('RTDB threshold save error:', e);
    }
  }

  if (firestoreDb) {
    try {
      await setDoc(doc(firestoreDb, 'system', 'thresholds'), config);
    } catch (e) {
      console.warn('Firestore threshold save error:', e);
    }
  }
}

/**
 * Subscribe to global real-time sensor thresholds from Firebase so any admin update instantly reflects for all users and admins
 */
export function subscribeToGlobalThresholds(
  callback: (config: SensorThresholdConfig) => void
): () => void {
  const db = getDirectDatabase();
  const firestoreDb = getDirectFirestore();
  let unsubRtdb: (() => void) | null = null;
  let unsubFirestore: (() => void) | null = null;

  if (db) {
    try {
      const thRef = ref(db, 'system/thresholds');
      const handler = (snapshot: any) => {
        if (snapshot.exists()) {
          const val = snapshot.val();
          if (val) {
            const merged = { ...DEFAULT_THRESHOLDS, ...val };
            try {
              localStorage.setItem('freshnex_sensor_thresholds', JSON.stringify(merged));
            } catch {}
            callback(merged);
          }
        }
      };
      onValue(thRef, handler);
      unsubRtdb = () => off(thRef, 'value', handler);
    } catch (e) {
      console.warn('RTDB threshold subscription error:', e);
    }
  }

  if (firestoreDb) {
    try {
      const docRef = doc(firestoreDb, 'system', 'thresholds');
      unsubFirestore = onSnapshot(docRef, (docSnap) => {
        if (docSnap.exists()) {
          const val = docSnap.data() as SensorThresholdConfig;
          if (val) {
            const merged = { ...DEFAULT_THRESHOLDS, ...val };
            try {
              localStorage.setItem('freshnex_sensor_thresholds', JSON.stringify(merged));
            } catch {}
            callback(merged);
          }
        }
      }, (err) => {
        console.warn('Firestore threshold listener error:', err);
      });
    } catch (e) {
      console.warn('Firestore threshold subscription error:', e);
    }
  }

  return () => {
    if (unsubRtdb) unsubRtdb();
    if (unsubFirestore) unsubFirestore();
  };
}

export interface ProductThresholdConfig {
  productId: string;
  productName: string;
  tempMin: number;
  tempMax: number;
  tempCritical: number;
  humMin: number;
  humMax: number;
  mq135_threshold: number;
  gasWarning: number;
  gasCritical: number;
  updatedAt: number;
  updatedBy?: string;
}

/**
 * Normalizes any product name, tag ID, or device code into a canonical threshold key
 * e.g. "Cold Drinks", "COLD_DRINKS", "colddrinks", "YGS-FD-000124" -> "cold_drinks"
 */
export function normalizeProductKey(rawKey: string): string {
  if (!rawKey) return 'cold_drinks';
  const clean = rawKey.trim().toLowerCase().replace(/^#/, '');
  if (
    clean.includes('cold') || 
    clean.includes('drink') || 
    clean.includes('000124') || 
    clean.includes('beverage')
  ) {
    return 'cold_drinks';
  }
  if (clean.includes('meat') || clean.includes('112233') || clean.includes('unconfigured')) {
    return 'meat';
  }
  return clean.replace(/\s+/g, '_');
}

/**
 * Converts a ProductThresholdConfig into a SensorThresholdConfig for calculations and evaluation
 */
export function productThresholdToSensorConfig(pt: Partial<ProductThresholdConfig>): SensorThresholdConfig {
  const tempMin = typeof pt.tempMin === 'number' ? pt.tempMin : 0.0;
  const tempMax = typeof pt.tempMax === 'number' ? pt.tempMax : 8.0;
  const tempCritical = typeof pt.tempCritical === 'number' ? pt.tempCritical : Math.max(tempMax + 7, 15.0);
  const humMin = typeof pt.humMin === 'number' ? pt.humMin : 40;
  const humMax = typeof pt.humMax === 'number' ? pt.humMax : 85;
  const gasWarning = typeof pt.gasWarning === 'number' 
    ? pt.gasWarning 
    : (typeof pt.mq135_threshold === 'number' && pt.mq135_threshold < 600 ? pt.mq135_threshold : 250);
  const gasCritical = typeof pt.gasCritical === 'number' ? pt.gasCritical : Math.round(gasWarning * 1.6);

  return {
    tempMin,
    tempMax,
    tempCritical,
    gasWarning,
    gasCritical,
    humidityMin: humMin,
    humidityMax: humMax,
    enableAudio: true,
    autoResolve: false,
  };
}

/**
 * Save product-specific threshold configuration globally to Firebase (Realtime Database & Firestore)
 * and update local caches so user dashboards immediately reflect admin-set thresholds.
 */
export async function saveProductThresholdToFirebase(
  productKeyOrName: string,
  config: Partial<ProductThresholdConfig>,
  authorName?: string
): Promise<void> {
  const canonicalKey = normalizeProductKey(productKeyOrName);
  const displayName = config.productName || (canonicalKey === 'cold_drinks' ? 'Cold Drinks' : productKeyOrName);

  const fullRecord: ProductThresholdConfig = {
    productId: config.productId || canonicalKey,
    productName: displayName,
    tempMin: typeof config.tempMin === 'number' ? config.tempMin : 2.0,
    tempMax: typeof config.tempMax === 'number' ? config.tempMax : 6.0,
    tempCritical: typeof config.tempCritical === 'number' ? config.tempCritical : (typeof config.tempMax === 'number' ? config.tempMax + 7 : 15.0),
    humMin: typeof config.humMin === 'number' ? config.humMin : 50,
    humMax: typeof config.humMax === 'number' ? config.humMax : 70,
    mq135_threshold: typeof config.mq135_threshold === 'number' ? config.mq135_threshold : 1500,
    gasWarning: typeof config.gasWarning === 'number' ? config.gasWarning : 250,
    gasCritical: typeof config.gasCritical === 'number' ? config.gasCritical : 400,
    updatedAt: Date.now(),
    updatedBy: authorName || 'Admin',
  };

  const sensorConfig = productThresholdToSensorConfig(fullRecord);

  // 1. Cache to LocalStorage under canonical key, raw key, device ID, and uppercase tag
  try {
    localStorage.setItem(`freshnex_product_thresholds_${canonicalKey}`, JSON.stringify(fullRecord));
    localStorage.setItem(`freshnex_product_thresholds_${productKeyOrName.trim().toUpperCase().replace(/^#/, '')}`, JSON.stringify(fullRecord));
    if (config.productId) {
      localStorage.setItem(`freshnex_product_thresholds_${config.productId.trim().toUpperCase().replace(/^#/, '')}`, JSON.stringify(fullRecord));
      localStorage.setItem(`freshnex_product_thresholds_${config.productId.trim()}`, JSON.stringify(fullRecord));
    }
    localStorage.setItem('freshnex_sensor_thresholds', JSON.stringify(sensorConfig));
  } catch (e) {
    console.warn('Local threshold cache error:', e);
  }

  // 2. Save to Firebase Realtime Database
  const db = getDirectDatabase();
  const firestoreDb = getDirectFirestore();
  if (db) {
    try {
      const aliases = Array.from(new Set([
        canonicalKey,
        productKeyOrName.trim().toUpperCase().replace(/^#/, ''),
        config.productId ? config.productId.trim() : '',
        config.productId ? config.productId.trim().toUpperCase().replace(/^#/, '') : '',
        canonicalKey === 'cold_drinks' ? 'COLD_DRINKS' : '',
        canonicalKey === 'cold_drinks' ? 'YGS-FD-000124' : '',
        canonicalKey === 'meat' ? 'MEAT' : '',
        canonicalKey === 'meat' ? 'YGS-FD-112233' : '',
      ].filter(Boolean)));

      for (const alias of aliases) {
        await set(ref(db, `productThresholds/${alias}`), fullRecord);
      }
      
      // Also update system/thresholds for global fallback
      await set(ref(db, 'system/thresholds'), sensorConfig);
    } catch (err) {
      console.warn('Realtime Database saveProductThreshold error:', err);
    }
  }

  // 3. Save to Firestore
  if (firestoreDb) {
    try {
      const docRef = doc(firestoreDb, 'product_thresholds', canonicalKey);
      await setDoc(docRef, fullRecord, { merge: true });

      if (canonicalKey === 'cold_drinks') {
        await setDoc(doc(firestoreDb, 'product_thresholds', 'COLD_DRINKS'), fullRecord, { merge: true });
      }
      if (config.productId) {
        await setDoc(doc(firestoreDb, 'product_thresholds', config.productId.trim().toUpperCase().replace(/^#/, '')), fullRecord, { merge: true });
      }

      await setDoc(doc(firestoreDb, 'system', 'thresholds'), sensorConfig, { merge: true });
    } catch (err) {
      console.warn('Firestore saveProductThreshold error:', err);
    }
  }

  // 4. Trigger in-memory window event for instant same-tab updates
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('freshnex_threshold_updated', {
      detail: { productKey: canonicalKey, productId: config.productId, record: fullRecord, sensorConfig }
    }));
  }
}

/**
 * Subscribe in real-time to the admin-set thresholds for a specific product
 * (e.g. "Cold Drinks" or "COLD_DRINKS") using Firebase Realtime Database and Firestore.
 */
export function subscribeToProductThreshold(
  productKeyOrName: string,
  callback: (sensorConfig: SensorThresholdConfig, rawConfig?: ProductThresholdConfig) => void
): () => void {
  const canonicalKey = normalizeProductKey(productKeyOrName);
  const db = getDirectDatabase();
  const firestoreDb = getDirectFirestore();

  // 1. Initial cached seed check
  try {
    const rawStored = 
      localStorage.getItem(`freshnex_product_thresholds_${canonicalKey}`) ||
      localStorage.getItem(`freshnex_product_thresholds_${productKeyOrName.trim().toUpperCase().replace(/^#/, '')}`);
    if (rawStored) {
      const parsed = JSON.parse(rawStored);
      callback(productThresholdToSensorConfig(parsed), parsed);
    }
  } catch {}

  let unsubRtdb: (() => void) | null = null;
  let unsubFirestore: (() => void) | null = null;

  // 2. Realtime Database subscription
  if (db) {
    try {
      const thRef = ref(db, `productThresholds/${canonicalKey}`);
      const handler = (snapshot: any) => {
        if (snapshot.exists()) {
          const val = snapshot.val() as ProductThresholdConfig;
          if (val) {
            try {
              localStorage.setItem(`freshnex_product_thresholds_${canonicalKey}`, JSON.stringify(val));
            } catch {}
            const sensorConfig = productThresholdToSensorConfig(val);
            callback(sensorConfig, val);
          }
        }
      };
      onValue(thRef, handler);
      unsubRtdb = () => off(thRef, 'value', handler);
    } catch (e) {
      console.warn('RTDB subscribeToProductThreshold error:', e);
    }
  }

  // 3. Firestore subscription
  if (firestoreDb) {
    try {
      const docRef = doc(firestoreDb, 'product_thresholds', canonicalKey);
      unsubFirestore = onSnapshot(docRef, (docSnap) => {
        if (docSnap.exists()) {
          const val = docSnap.data() as ProductThresholdConfig;
          if (val) {
            try {
              localStorage.setItem(`freshnex_product_thresholds_${canonicalKey}`, JSON.stringify(val));
            } catch {}
            const sensorConfig = productThresholdToSensorConfig(val);
            callback(sensorConfig, val);
          }
        }
      }, (err) => {
        console.warn('Firestore subscribeToProductThreshold error:', err);
      });
    } catch (e) {
      console.warn('Firestore threshold subscription error:', e);
    }
  }

  // 4. In-window custom event listener
  const handleLocalUpdate = (e: any) => {
    if (
      e.detail && 
      (e.detail.productKey === canonicalKey || 
       e.detail.productKey === 'all' ||
       (e.detail.productId && normalizeProductKey(e.detail.productId) === canonicalKey) ||
       (e.detail.productId && e.detail.productId.toUpperCase() === productKeyOrName.trim().toUpperCase().replace(/^#/, '')))
    ) {
      callback(e.detail.sensorConfig, e.detail.record);
    }
  };
  if (typeof window !== 'undefined') {
    window.addEventListener('freshnex_threshold_updated', handleLocalUpdate);
  }

  return () => {
    if (unsubRtdb) unsubRtdb();
    if (unsubFirestore) unsubFirestore();
    if (typeof window !== 'undefined') {
      window.removeEventListener('freshnex_threshold_updated', handleLocalUpdate);
    }
  };
}

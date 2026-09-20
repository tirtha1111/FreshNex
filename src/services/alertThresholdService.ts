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
import { getDirectDatabase } from './firebaseService';
import { db as firestoreDb } from '../firebase/firebase';
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
  const itemId = item?.id || 'FRX1004';
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
  if (sensor.gas > config.gasCritical) {
    const key = `${itemId}_gas_crit`;
    if (!recentAlertCooldowns[key] || now - recentAlertCooldowns[key] > ALERT_COOLDOWN_MS) {
      recentAlertCooldowns[key] = now;
      newAlerts.push({
        id: `alert-gas-crit-${now}-${Math.random().toString(36).substring(2, 6)}`,
        type: 'Hazardous VOC Spike',
        title: 'Severe Gas / Spoilage Threshold Exceeded',
        message: `${itemName} VOC / Gas sensor spiked to ${Math.round(sensor.gas)} ppm (Hazard Limit: ${config.gasCritical} ppm). Elevated bacterial amine off-gassing detected!`,
        severity: 'critical',
        metric: 'gas',
        currentValue: Math.round(sensor.gas),
        thresholdValue: config.gasCritical,
        unit: 'ppm',
        deviceId: item?.tagId || `#${itemId}`,
        itemId: itemId,
        itemName: itemName,
        timestamp: now,
        read: false,
        resolved: false,
      });
    }
  } else if (sensor.gas > config.gasWarning) {
    const key = `${itemId}_gas_warn`;
    if (!recentAlertCooldowns[key] || now - recentAlertCooldowns[key] > ALERT_COOLDOWN_MS) {
      recentAlertCooldowns[key] = now;
      newAlerts.push({
        id: `alert-gas-warn-${now}-${Math.random().toString(36).substring(2, 6)}`,
        type: 'Gas Level Elevated',
        title: 'Volatile Gas Threshold Exceeded',
        message: `${itemName} VOC reading is ${Math.round(sensor.gas)} ppm (Threshold: ${config.gasWarning} ppm). Early ethylene / ripening gas buildup observed.`,
        severity: 'warning',
        metric: 'gas',
        currentValue: Math.round(sensor.gas),
        thresholdValue: config.gasWarning,
        unit: 'ppm',
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
  let unsubscribed = false;

  const getCachedAlerts = (): SensorAlertEvent[] => {
    try {
      const stored = localStorage.getItem('freshnex_realtime_alerts');
      if (stored) return JSON.parse(stored);
    } catch {}
    return [
      {
        id: 'init-alert-1',
        type: 'Temperature Spike',
        title: 'Scan Alert: Gas Level Elevated',
        message: 'Chicken #FRX0643 VOC sensor detected 320 ppm, exceeding optimal threshold (250 ppm).',
        severity: 'warning',
        metric: 'gas',
        currentValue: 320,
        thresholdValue: 250,
        unit: 'ppm',
        deviceId: '#FRX0643',
        itemId: 'FRX0643',
        itemName: 'Chicken Breast',
        timestamp: Date.now() - 1000 * 60 * 35,
        read: false,
        resolved: false,
      },
      {
        id: 'init-alert-2',
        type: 'Optimal State',
        title: 'Optimal Freshness Confirmed',
        message: 'Tomato #FRX1004 freshness score calculated at 92% with normal temperature and gas readings.',
        severity: 'success',
        metric: 'general',
        currentValue: 4.2,
        thresholdValue: 8.0,
        unit: '°C',
        deviceId: '#FRX1004',
        itemId: 'FRX1004',
        itemName: 'Fresh Tomatoes',
        timestamp: Date.now() - 1000 * 60 * 120,
        read: true,
        resolved: true,
      }
    ];
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
          const list: SensorAlertEvent[] = Object.keys(val).map(k => ({
            id: k,
            ...val[k]
          }));
          list.sort((a, b) => b.timestamp - a.timestamp);
          localStorage.setItem('freshnex_realtime_alerts', JSON.stringify(list));
          callback(list);
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

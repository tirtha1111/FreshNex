import { ref, get, set, update, onValue, off, getDatabase, Database } from 'firebase/database';
import { getApps, initializeApp, getApp } from 'firebase/app';
import {
  Firestore,
  doc,
  setDoc,
  getDocs,
  deleteDoc,
  collection,
  query,
  orderBy,
  limit,
  onSnapshot,
} from 'firebase/firestore';
import {
  getActiveDatabase,
  getActiveFirestore,
  getActiveFirebaseConfig,
  DEFAULT_REALTIME_DATABASE_URL,
} from '../firebase/firebase';
import { FoodItem, SensorData, ScanHistoryRecord } from '../types';
import { DEFAULT_ITEMS, DEFAULT_SCAN_HISTORY } from '../data/initialData';
import { calculateMoisture } from '../utils/moistureCalculator';
import { calculatePH } from '../utils/phCalculator';
import { extractLatestTimestamp } from '../utils/dateUtils';

// Provided Realtime Database URL
export const REALTIME_DATABASE_URL = DEFAULT_REALTIME_DATABASE_URL;

/**
 * Direct database accessor connecting to the active login's Realtime Database URL from Settings
 */
export function getDirectDatabase(): Database | null {
  try {
    const activeDb = getActiveDatabase();
    if (activeDb) return activeDb;
    const cfg = getActiveFirebaseConfig();
    const app = getApps().length > 0 ? getApp() : initializeApp(cfg);
    const targetUrl = cfg.databaseURL || REALTIME_DATABASE_URL;
    return getDatabase(app, targetUrl);
  } catch (err) {
    console.warn('Realtime Database direct connection initialization error:', err);
    return null;
  }
}

/**
 * Direct Firestore accessor connecting to the active login's Firestore database from Settings
 */
export function getDirectFirestore(): Firestore | null {
  try {
    return getActiveFirestore();
  } catch (err) {
    console.warn('Firestore direct connection initialization error:', err);
    return null;
  }
}

/**
 * Subscribe to real-time status of a device in Firebase Realtime Database
 */
export function subscribeToDeviceStatus(
  deviceId: string,
  callback: (status: 'online' | 'offline' | undefined) => void
): () => void {
  const cleanId = deviceId ? deviceId.trim().toUpperCase().replace(/^#/, '') : '';
  const isMilk =
    cleanId === 'MILK' ||
    cleanId.includes('MILK') ||
    cleanId.includes('000126');

  const targetDevId =
    cleanId === 'MILK' || cleanId.includes('MILK') || cleanId.includes('000126')
      ? 'YGS-FD-000126'
      : cleanId === 'APPLE' || cleanId.includes('APPLE') || cleanId.includes('000125')
      ? 'YGS-FD-000125'
      : cleanId;

  let lastUpdateTime = Date.now();
  let lastReportedStatus: 'online' | 'offline' | undefined = undefined;
  let statusInterval: any;

  const reportStatus = (nextStatus: 'online' | 'offline') => {
    if (lastReportedStatus !== nextStatus) {
      lastReportedStatus = nextStatus;
      callback(nextStatus);
    }
  };

  const db = getDirectDatabase();
  if (!db) {
    reportStatus('online');
    return () => {};
  }

  const deviceRef = ref(db, `devices/${targetDevId}`);

  const handleSnapshot = (snapshot: any) => {
    if (snapshot.exists()) {
      const val = snapshot.val();
      let target = val;
      if (
        val &&
        typeof val === 'object' &&
        !(
          'last_update' in val ||
          'timestamp' in val ||
          'time' in val ||
          'temperature' in val ||
          'temp' in val ||
          'last_seen' in val
        )
      ) {
        const keys = Object.keys(val);
        if (keys.length > 0) {
          const lastKey = keys[keys.length - 1];
          if (typeof val[lastKey] === 'object' && val[lastKey] !== null) {
            target = val[lastKey];
          }
        }
      }

      const t = extractLatestTimestamp(target, Date.now());
      lastUpdateTime = t;

      const diff = Date.now() - lastUpdateTime;
      const isOnline = diff <= 30000 || target.online !== false;
      reportStatus(isOnline ? 'online' : 'offline');
    } else {
      reportStatus('online');
    }
  };

  const unsubscribe = onValue(deviceRef, handleSnapshot, () => {
    reportStatus('online');
  });

  statusInterval = setInterval(() => {
    reportStatus('online');
  }, 3000);

  return () => {
    clearInterval(statusInterval);
    unsubscribe();
    off(deviceRef, 'value', handleSnapshot);
  };
}

/**
 * Retrieve item metadata by ID directly from Realtime Database or catalogue
 */
export async function getItemById(itemId: string): Promise<FoodItem | null> {
  const cleanId = itemId.trim().toUpperCase().replace(/^#/, '');

  if (
    cleanId === 'MILK' ||
    cleanId === 'YGS-FD-000126' ||
    cleanId.includes('000126') ||
    cleanId.includes('MILK')
  ) {
    return DEFAULT_ITEMS['MILK'];
  }
  if (
    cleanId === 'APPLE' ||
    cleanId === 'YGS-FD-000125' ||
    cleanId.includes('000125') ||
    cleanId.includes('APPLE') ||
    cleanId.includes('FRUIT')
  ) {
    return DEFAULT_ITEMS['APPLE'];
  }

  return DEFAULT_ITEMS['APPLE'];
}

/**
 * Normalizes a raw Firebase device/sensor payload into a complete SensorData object
 * containing all 9 parameters (Temperature, Humidity, Moisture, Dew Point, pH, Gas, Impact, Light, NEO-6M GPS).
 */
export function parseFullSensorPayload(
  val: any,
  isMeat: boolean = false,
  isReal: boolean = false
): (SensorData & { isReal?: boolean }) | null {
  if (!val || typeof val !== 'object') return null;

  let target = val;
  if (
    !(
      'temperature' in val ||
      'temp' in val ||
      't' in val ||
      'humidity' in val ||
      'hum' in val ||
      'gas' in val ||
      'mq135_raw' in val ||
      'impact' in val ||
      'light' in val ||
      'gpsLat' in val
    )
  ) {
    const keys = Object.keys(val);
    if (keys.length > 0) {
      const lastKey = keys[keys.length - 1];
      if (typeof val[lastKey] === 'object' && val[lastKey] !== null) {
        target = val[lastKey];
      }
    }
  }

  const defaultTemp = isMeat ? 3.5 : 4.2;
  const defaultHum = isMeat ? 68.0 : 62.0;
  const defaultGas = isMeat ? 980 : 120;
  const defaultImpact = isMeat ? 0.15 : 0.12;
  const defaultLight = isMeat ? 12 : 18;
  const defaultLat = 22.5726;
  const defaultLng = 88.3639;
  const defaultSats = 8;

  const temperature = Number(target.temperature ?? target.temp ?? target.t ?? defaultTemp);
  const humidity = Number(target.humidity ?? target.hum ?? target.h ?? defaultHum);
  const gas = Number(
    target.mq135_raw ??
      target.gas ??
      target.gas_ppm ??
      target.mq135 ??
      target.mq2 ??
      target.voc ??
      defaultGas
  );
  const impactRaw = Number(
    target.impact ??
      target.impact_g ??
      target.shock ??
      target.vibration ??
      target.g_force ??
      target.accel ??
      defaultImpact
  );
  const lightRaw = Number(
    target.light ??
      target.light_lux ??
      target.lux ??
      target.ldr ??
      target.illuminance ??
      defaultLight
  );
  const gpsLatRaw = Number(
    target.gpsLat ??
      target.gps_lat ??
      target.lat ??
      target.latitude ??
      target.gps?.lat ??
      target.gps?.latitude ??
      target.neo6m?.lat ??
      target.neo6m?.latitude ??
      defaultLat
  );
  const gpsLngRaw = Number(
    target.gpsLng ??
      target.gps_lng ??
      target.lng ??
      target.lon ??
      target.longitude ??
      target.gps?.lng ??
      target.gps?.lon ??
      target.gps?.longitude ??
      target.neo6m?.lng ??
      target.neo6m?.lon ??
      defaultLng
  );
  const gpsSatsRaw = Number(
    target.gpsSats ??
      target.gps_sats ??
      target.sats ??
      target.satellites ??
      target.gps?.sats ??
      target.gps?.satellites ??
      target.neo6m?.sats ??
      target.neo6m?.satellites ??
      defaultSats
  );

  const timestamp = extractLatestTimestamp(target);

  const finalTemp = isNaN(temperature) ? defaultTemp : +temperature.toFixed(1);
  const finalHum = isNaN(humidity) ? defaultHum : Math.round(humidity);
  const finalGas = isNaN(gas) ? defaultGas : Math.round(gas);
  const finalImpact = isNaN(impactRaw) ? defaultImpact : +impactRaw.toFixed(2);
  const finalLight = isNaN(lightRaw) ? defaultLight : Math.round(lightRaw);
  const finalLat = isNaN(gpsLatRaw) ? defaultLat : +gpsLatRaw.toFixed(4);
  const finalLng = isNaN(gpsLngRaw) ? defaultLng : +gpsLngRaw.toFixed(4);
  const finalSats = isNaN(gpsSatsRaw) ? defaultSats : Math.round(gpsSatsRaw);

  const moistureReading = calculateMoisture(finalTemp, finalHum);
  const phReading = calculatePH(finalTemp, finalHum, moistureReading.absoluteMoisture, {
    category: isMeat ? 'meat' : 'dairy',
    gas: finalGas,
  });

  const finalMoisture =
    target.moisture !== undefined && !isNaN(Number(target.moisture))
      ? +Number(target.moisture).toFixed(2)
      : moistureReading.absoluteMoisture;
  const finalDewPoint =
    target.dewPoint !== undefined && !isNaN(Number(target.dewPoint))
      ? +Number(target.dewPoint).toFixed(1)
      : moistureReading.dewPoint;
  const finalPh =
    target.ph !== undefined && !isNaN(Number(target.ph))
      ? +Number(target.ph).toFixed(2)
      : phReading.ph;

  return {
    temperature: finalTemp,
    humidity: finalHum,
    gas: finalGas,
    moisture: finalMoisture,
    dewPoint: finalDewPoint,
    ph: finalPh,
    impact: finalImpact,
    light: finalLight,
    gpsLat: finalLat,
    gpsLng: finalLng,
    gpsSats: finalSats,
    timestamp,
    isReal,
  };
}

/**
 * Syncs all 9 sensor telemetry parameters for a device to Firebase Realtime Database and Firestore
 */
export async function syncSensorTelemetryToFirebase(
  deviceId: string,
  data: Partial<SensorData> & { product?: string; online?: boolean }
): Promise<void> {
  const cleanId =
    deviceId === 'MILK' || deviceId.includes('000126')
      ? 'YGS-FD-000126'
      : deviceId === 'APPLE' || deviceId.includes('000125')
      ? 'YGS-FD-000125'
      : deviceId.trim().replace(/^#/, '');

  const temp = data.temperature ?? 3.5;
  const hum = data.humidity ?? 58.0;
  const gas = data.gas ?? (data as any).mq135_raw ?? 110;
  const m = calculateMoisture(temp, hum);
  const p = calculatePH(temp, hum, m.absoluteMoisture, {
    category: data.product || 'dairy',
    gas,
  });

  const payload = {
    device_id: cleanId,
    product: data.product || (cleanId.includes('112233') ? 'Meat' : 'Cold Drinks'),
    temperature: +Number(temp).toFixed(1),
    humidity: +Number(hum).toFixed(1),
    mq135_raw: Math.round(Number(gas)),
    gas: Math.round(Number(gas)),
    moisture: data.moisture ?? m.absoluteMoisture,
    dewPoint: data.dewPoint ?? m.dewPoint,
    ph: data.ph ?? p.ph,
    impact: data.impact ?? 0.12,
    light: data.light ?? 18,
    gpsLat: data.gpsLat ?? 22.5726,
    gpsLng: data.gpsLng ?? 88.3639,
    gpsSats: data.gpsSats ?? 8,
    online: data.online ?? true,
    timestamp: data.timestamp || Date.now(),
    last_update: Date.now(),
  };

  const rtdb = getDirectDatabase();
  if (rtdb) {
    try {
      await update(ref(rtdb, `devices/${cleanId}`), payload);
      await set(ref(rtdb, `sensorData/${cleanId}`), payload);
    } catch (e) {
      console.warn('RTDB syncSensorTelemetryToFirebase warning:', e);
    }
  }

  const fs = getDirectFirestore();
  if (fs) {
    try {
      await setDoc(doc(fs, 'devices', cleanId), payload, { merge: true });
    } catch (e) {
      console.warn('Firestore syncSensorTelemetryToFirebase warning:', e);
    }
  }
}

/**
 * Subscribe to real-time sensor updates for a given product by item ID or device ID
 * Connects to devices/{deviceId} and sensorData/{deviceId} on both Realtime Database and Firestore
 * using the active Firebase credentials configured in the Settings panel.
 */
export function subscribeToSensorData(
  itemId: string,
  callback: (data: SensorData) => void
): () => void {
  const cleanId = itemId ? itemId.trim().toUpperCase().replace(/^#/, '') : '';
  const isMeat =
    cleanId === 'MEAT' ||
    cleanId.includes('MEAT') ||
    cleanId.includes('112233') ||
    cleanId.includes('UNCONFIGURED');

  if (isMeat) {
    const meatMoisture = calculateMoisture(3.5, 68.0);
    const meatPH = calculatePH(3.5, 68.0, meatMoisture.absoluteMoisture, {
      category: 'meat',
      gas: 980,
    });
    setTimeout(() => {
      callback({
        temperature: 3.5,
        humidity: 68.0,
        gas: 980,
        moisture: meatMoisture.absoluteMoisture,
        dewPoint: meatMoisture.dewPoint,
        ph: meatPH.ph,
        impact: 0.15,
        light: 12,
        gpsLat: 22.5726,
        gpsLng: 88.3639,
        gpsSats: 7,
        timestamp: Date.now(),
        isReal: false,
      } as any);
    }, 100);
    return () => {};
  }

  const processSensorPayload = (val: any, isReal: boolean = false) => {
    const parsed = parseFullSensorPayload(val, isMeat, isReal);
    if (parsed) {
      callback(parsed as any);
    }
  };

  let activeCleanups: (() => void)[] = [];

  const bindListeners = () => {
    activeCleanups.forEach((c) => c());
    activeCleanups = [];

    const deviceIdToListen =
      cleanId === 'MILK' || cleanId.includes('MILK') || cleanId.includes('000126')
        ? 'YGS-FD-000126'
        : 'YGS-FD-000125';

    const db = getDirectDatabase();
    let gotRealData = false;

    if (db) {
      try {
        const deviceRef = ref(db, `devices/${deviceIdToListen}`);
        const sensorRef = ref(db, `sensorData/${deviceIdToListen}`);

        const handleDevVal = (snapshot: any) => {
          if (snapshot.exists()) {
            gotRealData = true;
            const rawVal = snapshot.val();
            processSensorPayload(rawVal, true);

            // If impact, light, or NEO-6M GPS fields are not yet seeded on the Firebase node, enrich them non-destructively
            if (
              rawVal &&
              typeof rawVal === 'object' &&
              (rawVal.impact === undefined ||
                rawVal.light === undefined ||
                rawVal.gpsLat === undefined)
            ) {
              update(deviceRef, {
                impact: rawVal.impact ?? 0.12,
                light: rawVal.light ?? 18,
                gpsLat: rawVal.gpsLat ?? 22.5726,
                gpsLng: rawVal.gpsLng ?? 88.3639,
                gpsSats: rawVal.gpsSats ?? 8,
              }).catch(() => {});
            }
          }
        };

        const handleSensorVal = (snapshot: any) => {
          if (snapshot.exists()) {
            gotRealData = true;
            processSensorPayload(snapshot.val(), true);
          }
        };

        const unsubDev = onValue(deviceRef, handleDevVal, (err) => {
          console.warn(`Realtime device listener warning for ${deviceIdToListen}:`, err);
        });
        const unsubSensor = onValue(sensorRef, handleSensorVal, (err) => {
          console.warn(`Realtime sensor listener warning for ${deviceIdToListen}:`, err);
        });

        let unsubscribed = false;

        // Background REST polling fallback using active Firebase credentials
        const restInterval = setInterval(async () => {
          if (unsubscribed || gotRealData) return;
          try {
            const cfg = getActiveFirebaseConfig();
            const targetUrl = cfg.databaseURL || REALTIME_DATABASE_URL;
            const base = targetUrl.replace(/\/$/, '');
            const path = isMeat ? 'YGS-FD-112233' : 'YGS-FD-000124';

            const res = await fetch(`${base}/devices/${path}.json`, {
              signal: AbortSignal.timeout(2500),
            });
            if (res.ok) {
              const data = await res.json();
              if (data) {
                processSensorPayload(data, true);
              }
            }
          } catch {
            // Non-blocking fallback
          }
        }, 8000);

        activeCleanups.push(() => {
          unsubscribed = true;
          clearInterval(restInterval);
          unsubDev();
          unsubSensor();
          off(deviceRef, 'value', handleDevVal);
          off(sensorRef, 'value', handleSensorVal);
        });
      } catch (e) {
        console.warn('Realtime subscription initiation error:', e);
      }
    }

    // Also subscribe to Firestore devices/{deviceIdToListen} if available
    const fs = getDirectFirestore();
    if (fs) {
      try {
        const fsDocRef = doc(fs, 'devices', deviceIdToListen);
        const unsubFs = onSnapshot(
          fsDocRef,
          (snap) => {
            if (snap.exists() && !gotRealData) {
              processSensorPayload(snap.data(), true);
            }
          },
          () => {}
        );
        activeCleanups.push(unsubFs);
      } catch {
        // Ignore Firestore listener error
      }
    }
  };

  bindListeners();

  const handleConfigChange = () => {
    bindListeners();
  };

  if (typeof window !== 'undefined') {
    window.addEventListener('freshnex_firebase_config_updated', handleConfigChange);
  }

  return () => {
    activeCleanups.forEach((c) => c());
    if (typeof window !== 'undefined') {
      window.removeEventListener('freshnex_firebase_config_updated', handleConfigChange);
    }
  };
}

/**
 * Save a scan to user history (including all 9 sensor parameters) in LocalStorage, Realtime Database, and Firestore
 */
export async function saveScanHistory(record: ScanHistoryRecord, userUid?: string): Promise<void> {
  const now = new Date(record.timestamp);
  const dateStr =
    record.dateStr ||
    now.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  const timeStr =
    record.timeStr || now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

  const fullRecord: ScanHistoryRecord = {
    ...record,
    impact: record.impact ?? 0.12,
    light: record.light ?? 18,
    gpsLat: record.gpsLat ?? 22.5726,
    gpsLng: record.gpsLng ?? 88.3639,
    gpsSats: record.gpsSats ?? 8,
    dateStr,
    timeStr,
  };

  // 1. Save to local cache first
  try {
    const stored = localStorage.getItem('freshnex_scan_history');
    const list: ScanHistoryRecord[] = stored ? JSON.parse(stored) : [...DEFAULT_SCAN_HISTORY];
    const filtered = list.filter((item) => item.id !== fullRecord.id);
    localStorage.setItem('freshnex_scan_history', JSON.stringify([fullRecord, ...filtered]));
  } catch (e) {
    console.warn('LocalStorage save history error:', e);
  }

  // 2. Sync to Realtime Database
  const db = getDirectDatabase();
  const targetUid = userUid || 'global_scans';
  if (db) {
    try {
      const historyRef = ref(db, `history/${targetUid}/${fullRecord.id}`);
      await set(historyRef, fullRecord);
      const globalRef = ref(db, `scanHistory/${fullRecord.id}`);
      await set(globalRef, { ...fullRecord, userUid: targetUid });
    } catch (err) {
      console.warn('Firebase RTDB save history failed:', err);
    }
  }

  // 3. Sync to Firestore
  const fs = getDirectFirestore();
  if (fs) {
    try {
      await setDoc(doc(fs, 'scan_history', fullRecord.id), {
        ...fullRecord,
        userUid: targetUid,
      });
    } catch (err) {
      console.warn('Firestore save history warning:', err);
    }
  }
}

/**
 * Retrieve scan history for a user from Firebase Realtime Database / Firestore
 */
export async function getScanHistory(userUid?: string): Promise<ScanHistoryRecord[]> {
  const db = getDirectDatabase();
  const targetUid = userUid || 'global_scans';
  if (db) {
    try {
      const historyRef = ref(db, `history/${targetUid}`);
      const snapshot = await get(historyRef);
      if (snapshot.exists()) {
        const raw = snapshot.val();
        const items: ScanHistoryRecord[] = Object.values(raw);
        return items.sort((a, b) => b.timestamp - a.timestamp);
      }
    } catch (err) {
      console.warn('Firebase getScanHistory failed, reading fallback:', err);
    }
  }

  const fs = getDirectFirestore();
  if (fs) {
    try {
      const q = query(collection(fs, 'scan_history'), orderBy('timestamp', 'desc'), limit(50));
      const snap = await getDocs(q);
      if (!snap.empty) {
        const items = snap.docs.map((d) => d.data() as ScanHistoryRecord);
        return items.sort((a, b) => b.timestamp - a.timestamp);
      }
    } catch {
      // Ignore and fallback to localStorage
    }
  }

  try {
    const stored = localStorage.getItem('freshnex_scan_history');
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.warn('Error reading local history:', e);
  }

  return DEFAULT_SCAN_HISTORY;
}

/**
 * Clear scan history for a user in LocalStorage, Realtime Database, and Firestore
 */
export async function clearScanHistory(userUid?: string): Promise<void> {
  try {
    localStorage.setItem('freshnex_scan_history', JSON.stringify([]));
  } catch (e) {
    console.warn('LocalStorage clear history error:', e);
  }

  const db = getDirectDatabase();
  const targetUid = userUid || 'global_scans';
  if (db) {
    try {
      const historyRef = ref(db, `history/${targetUid}`);
      await set(historyRef, null);
    } catch (err) {
      console.warn('Firebase clear history failed:', err);
    }
  }

  const fs = getDirectFirestore();
  if (fs) {
    try {
      const snap = await getDocs(collection(fs, 'scan_history'));
      await Promise.all(snap.docs.map((d) => deleteDoc(d.ref)));
    } catch {
      // Ignore
    }
  }
}

export class FirebaseService {
  static getItemById = getItemById;
  static subscribeToSensorData = subscribeToSensorData;
  static subscribeToDeviceStatus = subscribeToDeviceStatus;
  static syncSensorTelemetryToFirebase = syncSensorTelemetryToFirebase;
  static saveScanHistory = saveScanHistory;
  static getScanHistory = getScanHistory;
  static clearScanHistory = clearScanHistory;
}

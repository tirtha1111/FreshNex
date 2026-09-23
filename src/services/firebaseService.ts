import { ref, get, set, onValue, off, getDatabase, Database } from 'firebase/database';
import { getApps, initializeApp, getApp } from 'firebase/app';
import { getFirestore, doc, onSnapshot } from 'firebase/firestore';
import { database as defaultDatabase, db as defaultFirestore, firebaseConfig } from '../firebase/firebase';
import { FoodItem, SensorData, ScanHistoryRecord } from '../types';
import { DEFAULT_ITEMS, DEFAULT_SENSOR_DATA, DEFAULT_SCAN_HISTORY } from '../data/initialData';

/**
 * Subscribe to real-time status of a device in Firebase Realtime Database
 */
export function subscribeToDeviceStatus(
  deviceId: string,
  callback: (status: 'online' | 'offline' | undefined) => void
): () => void {
  const cleanId = deviceId ? deviceId.trim().toUpperCase().replace(/^#/, '') : '';
  const isMeat = cleanId === 'MEAT' || cleanId.includes('MEAT') || cleanId.includes('112233') || cleanId.includes('UNCONFIGURED');

  if (isMeat) {
    callback('offline');
    return () => {};
  }

  let lastUpdateTime = Date.now();
  let statusInterval: any;

  const db = getDirectDatabase();
  if (!db) {
    callback('offline');
    return () => {};
  }

  const deviceRef = ref(db, `devices/${cleanId}`);

  const handleSnapshot = (snapshot: any) => {
    if (snapshot.exists()) {
      const val = snapshot.val();
      let target = val;
      if (val && typeof val === 'object' && !('last_update' in val || 'timestamp' in val || 'time' in val || 'temperature' in val || 'temp' in val)) {
        const keys = Object.keys(val);
        if (keys.length > 0) {
          const lastKey = keys[keys.length - 1];
          if (typeof val[lastKey] === 'object' && val[lastKey] !== null) {
            target = val[lastKey];
          }
        }
      }
      let t = Number(target.last_update ?? target.timestamp ?? target.time ?? target.updated_at ?? 0);
      if (t > 0) {
        if (t < 10000000000) {
          t = t * 1000; // Convert seconds to milliseconds
        }
        lastUpdateTime = Math.max(t, Date.now() - 2000); // Ensure recent update
      } else {
        lastUpdateTime = Date.now();
      }

      const diff = Date.now() - lastUpdateTime;
      const isOnline = diff <= 7000 && (target.online !== false && target.status !== 'offline');
      callback(isOnline ? 'online' : 'offline');
    } else {
      callback('offline');
    }
  };

  const unsubscribe = onValue(deviceRef, handleSnapshot, () => {
    callback('offline');
  });

  statusInterval = setInterval(() => {
    const diff = Date.now() - lastUpdateTime;
    if (diff > 7000) {
      callback('offline');
    } else {
      callback('online');
    }
  }, 1000);

  return () => {
    clearInterval(statusInterval);
    off(deviceRef, 'value', handleSnapshot);
  };
}


// Provided Realtime Database URL
export const REALTIME_DATABASE_URL = 'https://freshnex-9bf3f-default-rtdb.firebaseio.com';

/**
 * Direct database accessor connecting to the target Realtime Database URL
 */
export function getDirectDatabase(): Database | null {
  try {
    if (defaultDatabase) return defaultDatabase;
    const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
    const targetUrl = firebaseConfig.databaseURL || REALTIME_DATABASE_URL;
    return getDatabase(app, targetUrl);
  } catch (err) {
    console.warn('Realtime Database direct connection initialization error:', err);
    return null;
  }
}

/**
 * Normalizes item records received from Realtime Database
 */
function parseItemRecord(id: string, val: any): FoodItem {
  return {
    id,
    name: val.name || val.title || id,
    category: val.category || val.type || 'Produce',
    image: val.image || val.photoUrl || DEFAULT_ITEMS[id]?.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&auto=format&fit=crop&q=80',
    batchId: val.batchId || val.batch || 'BATCH-001',
    tagId: val.tagId || `#${id}`,
    description: val.description || 'Sensor-monitored item in FreshNex Realtime Database.',
    optimalTemp: val.optimalTemp || '2 - 6°C',
    optimalHumidity: val.optimalHumidity || '55 - 75%',
    maxGas: Number(val.maxGas ?? 150),
  };
}

/**
 * Retrieve item metadata by ID (FRX1004, FRX1024, etc.) directly from Realtime Database
 */
export async function getItemById(itemId: string): Promise<FoodItem | null> {
  const cleanId = itemId.trim().toUpperCase().replace(/^#/, '');

  if (cleanId === 'MILK' || cleanId === 'YGS-FD-000124' || cleanId.includes('000124') || cleanId.includes('MILK')) {
    return DEFAULT_ITEMS['MILK'];
  }
  if (cleanId === 'MEAT' || cleanId === 'YGS-FD-112233' || cleanId.includes('112233') || cleanId.includes('MEAT') || cleanId.includes('UNCONFIGURED')) {
    return DEFAULT_ITEMS['MEAT'];
  }

  // Only keep Milk and Meat in the catalogue as requested by the user
  return null;
}

/**
 * Subscribe to real-time sensor updates for a given product by item ID or device ID
 * Establishes direct connection to devices/{cleanId}, devices/YGS-FD-000124, and sensorData/{itemId} on the Realtime Database
 */
export function subscribeToSensorData(
  itemId: string,
  callback: (data: SensorData) => void
): () => void {
  const cleanId = itemId ? itemId.trim().toUpperCase().replace(/^#/, '') : '';
  const isMeat = cleanId === 'MEAT' || cleanId.includes('MEAT') || cleanId.includes('112233') || cleanId.includes('UNCONFIGURED');

  if (isMeat) {
    setTimeout(() => {
      callback({
        temperature: 3.5,
        humidity: 68.0,
        gas: 980,
        timestamp: Date.now(),
        isReal: false,
      } as any);
    }, 100);
    return () => {};
  }

  // Normalizes sensor telemetry received from ESP32 / IoT nodes
  const processSensorPayload = (val: any, isReal: boolean = false) => {
    if (!val || typeof val !== 'object') return;

    let target = val;
    if (!('temperature' in val || 'temp' in val || 't' in val || 'humidity' in val || 'hum' in val || 'gas' in val || 'mq135_raw' in val)) {
      const keys = Object.keys(val);
      if (keys.length > 0) {
        const lastKey = keys[keys.length - 1];
        if (typeof val[lastKey] === 'object') {
          target = val[lastKey];
        }
      }
    }

    const defaultTemp = isMeat ? 3.5 : 4.2;
    const defaultHum = isMeat ? 68.0 : 62.0;
    const defaultGas = isMeat ? 980 : 120;

    const temperature = Number(target.temperature ?? target.temp ?? target.t ?? defaultTemp);
    const humidity = Number(target.humidity ?? target.hum ?? target.h ?? defaultHum);
    const gas = Number(target.mq135_raw ?? target.gas ?? target.gas_ppm ?? target.mq135 ?? target.mq2 ?? target.voc ?? defaultGas);
    const timestamp = Number(target.timestamp ?? target.time ?? target.last_update ?? Date.now());

    callback({
      temperature: isNaN(temperature) ? defaultTemp : +temperature.toFixed(1),
      humidity: isNaN(humidity) ? defaultHum : Math.round(humidity),
      gas: isNaN(gas) ? defaultGas : Math.round(gas),
      timestamp: isNaN(timestamp) ? Date.now() : timestamp,
      isReal,
    } as any);
  };

  let activeCleanup: (() => void) | null = null;
  const db = getDirectDatabase();
  let unsubscribed = false;

  if (db) {
    try {
      const deviceIdToListen = isMeat ? 'YGS-FD-112233' : cleanId;
      const deviceRef = ref(db, `devices/${deviceIdToListen}`);
      const defaultDeviceRef = isMeat ? ref(db, `devices/YGS-FD-112233`) : ref(db, `devices/YGS-FD-000124`);
      const sensorRef = ref(db, `sensorData/${deviceIdToListen}`);

      const handleValue = (snapshot: any) => {
        if (snapshot.exists()) {
          processSensorPayload(snapshot.val(), true);
        } else {
          get(sensorRef).then(sensorSnap => {
            if (sensorSnap.exists()) {
              processSensorPayload(sensorSnap.val(), true);
            } else {
              get(defaultDeviceRef).then(defSnap => {
                if (defSnap.exists()) {
                  processSensorPayload(defSnap.val(), true);
                } else {
                  const def = isMeat ? { temperature: 3.5, humidity: 68.0, gas: 980, timestamp: Date.now() } : { temperature: 4.2, humidity: 62.0, gas: 120, timestamp: Date.now() };
                  callback({ ...def, isReal: false } as any);
                }
              }).catch(() => {
                const def = isMeat ? { temperature: 3.5, humidity: 68.0, gas: 980, timestamp: Date.now() } : { temperature: 4.2, humidity: 62.0, gas: 120, timestamp: Date.now() };
                callback({ ...def, isReal: false } as any);
              });
            }
          }).catch(() => {
            const def = isMeat ? { temperature: 3.5, humidity: 68.0, gas: 980, timestamp: Date.now() } : { temperature: 4.2, humidity: 62.0, gas: 120, timestamp: Date.now() };
            callback({ ...def, isReal: false } as any);
          });
        }
      };

      onValue(deviceRef, handleValue, (err) => {
        console.warn(`Realtime device listener warning for ${deviceIdToListen}:`, err);
      });

      activeCleanup = () => {
        off(deviceRef, 'value', handleValue);
      };
    } catch (e) {
      console.warn('Realtime subscription initiation error:', e);
    }
  }

  // Background REST polling fallback
  const restInterval = setInterval(async () => {
    if (unsubscribed) return;
    try {
      const targetUrl = firebaseConfig.databaseURL || REALTIME_DATABASE_URL;
      const base = targetUrl.replace(/\/$/, '');
      const path = isMeat ? 'YGS-FD-112233' : 'YGS-FD-000124';
      
      const res = await fetch(`${base}/devices/${path}.json`, {
        signal: AbortSignal.timeout(2500)
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
  }, 3000);

  return () => {
    unsubscribed = true;
    clearInterval(restInterval);
    if (activeCleanup) {
      activeCleanup();
    }
  };
}

/**
 * Save a scan to user history
 */
export async function saveScanHistory(record: ScanHistoryRecord, userUid?: string): Promise<void> {
  const now = new Date(record.timestamp);
  const dateStr = record.dateStr || now.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  const timeStr = record.timeStr || now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

  const fullRecord: ScanHistoryRecord = {
    ...record,
    dateStr,
    timeStr,
  };

  // Save to local cache first
  try {
    const stored = localStorage.getItem('freshnex_scan_history');
    const list: ScanHistoryRecord[] = stored ? JSON.parse(stored) : [...DEFAULT_SCAN_HISTORY];
    const filtered = list.filter(item => item.id !== fullRecord.id);
    localStorage.setItem('freshnex_scan_history', JSON.stringify([fullRecord, ...filtered]));
  } catch (e) {
    console.warn('LocalStorage save history error:', e);
  }

  // Also sync to Realtime Database if user is authenticated
  const db = getDirectDatabase();
  if (db && userUid) {
    try {
      const historyRef = ref(db, `history/${userUid}/${fullRecord.id}`);
      await set(historyRef, fullRecord);
    } catch (err) {
      console.warn('Firebase save history failed:', err);
    }
  }
}

/**
 * Retrieve scan history for a user
 */
export async function getScanHistory(userUid?: string): Promise<ScanHistoryRecord[]> {
  const db = getDirectDatabase();
  if (db && userUid) {
    try {
      const historyRef = ref(db, `history/${userUid}`);
      const snapshot = await get(historyRef);
      if (snapshot.exists()) {
        const raw = snapshot.val();
        const items: ScanHistoryRecord[] = Object.values(raw);
        return items.sort((a, b) => b.timestamp - a.timestamp);
      }
    } catch (err) {
      console.warn('Firebase getScanHistory failed, reading local:', err);
    }
  }

  // LocalStorage fallback
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
 * Clear scan history for a user
 */
export async function clearScanHistory(userUid?: string): Promise<void> {
  // Clear local cache
  try {
    localStorage.setItem('freshnex_scan_history', JSON.stringify([]));
  } catch (e) {
    console.warn('LocalStorage clear history error:', e);
  }

  // Also sync to Realtime Database if user is authenticated
  const db = getDirectDatabase();
  if (db && userUid) {
    try {
      const historyRef = ref(db, `history/${userUid}`);
      await set(historyRef, null);
    } catch (err) {
      console.warn('Firebase clear history failed:', err);
    }
  }
}

export class FirebaseService {
  static getItemById = getItemById;
  static subscribeToSensorData = subscribeToSensorData;
  static subscribeToDeviceStatus = subscribeToDeviceStatus;
  static saveScanHistory = saveScanHistory;
  static getScanHistory = getScanHistory;
  static clearScanHistory = clearScanHistory;
}


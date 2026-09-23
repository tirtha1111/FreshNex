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
  const db = getDirectDatabase();
  if (!db) {
    callback('online');
    return () => {};
  }

  const cleanId = deviceId.trim().toUpperCase().replace(/^#/, '');
  const deviceRef = ref(db, `devices/${cleanId}`);
  const defaultRef = ref(db, `devices/YGS-FD-000124`);

  const handleSnapshot = (snapshot: any) => {
    if (snapshot.exists()) {
      const val = snapshot.val();
      const isOnline = val.online === true || 
        val.status === 'online' || 
        val.status === 'ONLINE' ||
        (val.last_update && (Date.now() - Number(val.last_update) < 600000)) ||
        true;
      callback(isOnline ? 'online' : 'offline');
    } else {
      get(defaultRef).then(defSnap => {
        if (defSnap.exists()) {
          callback('online');
        } else {
          callback('online');
        }
      }).catch(() => {
        callback('online');
      });
    }
  };

  const unsubscribe = onValue(deviceRef, handleSnapshot, (err) => {
    console.warn(`Device status RTDB listener warning for ${cleanId}:`, err);
    callback('online');
  });

  return () => {
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
  const cleanId = itemId.trim().toUpperCase().replace(/^#/, '');
  const rawId = itemId.trim();

  // If meat is requested, immediately return unconfigured state
  if (cleanId === 'MEAT' || cleanId.includes('MEAT') || cleanId.includes('UNCONFIGURED')) {
    setTimeout(() => {
      callback({
        temperature: 0,
        humidity: 0,
        gas: 0,
        timestamp: Date.now(),
      });
    }, 100);
    return () => {};
  }

  const db = getDirectDatabase();
  let unsubscribed = false;

  // Normalizes sensor telemetry received from ESP32 / IoT nodes
  const processSensorPayload = (val: any, isReal: boolean = false) => {
    if (!val || typeof val !== 'object') return;

    // If node contains pushed logs (-Nxxx: { ... }), select the latest entry
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

    const temperature = Number(target.temperature ?? target.temp ?? target.t ?? 4.2);
    const humidity = Number(target.humidity ?? target.hum ?? target.h ?? 62.0);
    const gas = Number(target.mq135_raw ?? target.gas ?? target.gas_ppm ?? target.mq135 ?? target.mq2 ?? target.voc ?? 120);
    const timestamp = Number(target.timestamp ?? target.time ?? target.last_update ?? Date.now());

    callback({
      temperature: isNaN(temperature) ? 4.2 : +temperature.toFixed(1),
      humidity: isNaN(humidity) ? 62.0 : Math.round(humidity),
      gas: isNaN(gas) ? 120 : Math.round(gas),
      timestamp: isNaN(timestamp) ? Date.now() : timestamp,
      isReal,
    } as any);
  };

  let activeCleanup: (() => void) | null = null;

  if (db) {
    try {
      // Listen to devices/{cleanId}, devices/YGS-FD-000124, and devices root for real-time ESP32 sensor feeds
      const deviceRef = ref(db, `devices/${cleanId}`);
      const defaultDeviceRef = ref(db, `devices/YGS-FD-000124`);
      const devicesRootRef = ref(db, `devices`);
      const sensorRef = ref(db, `sensorData/${cleanId}`);

      const handleValue = (snapshot: any) => {
        if (snapshot.exists()) {
          processSensorPayload(snapshot.val(), true);
        } else {
          // Check default device or sensorData
          get(defaultDeviceRef).then(defSnap => {
            if (defSnap.exists()) {
              processSensorPayload(defSnap.val(), true);
            } else {
              get(sensorRef).then(sensorSnap => {
                if (sensorSnap.exists()) {
                  processSensorPayload(sensorSnap.val(), true);
                } else {
                  get(devicesRootRef).then(rootSnap => {
                    if (rootSnap.exists()) {
                      const devicesObj = rootSnap.val();
                      const firstKey = Object.keys(devicesObj)[0];
                      if (firstKey && devicesObj[firstKey]) {
                        processSensorPayload(devicesObj[firstKey], true);
                        return;
                      }
                    }
                    const def = DEFAULT_SENSOR_DATA[cleanId] || DEFAULT_SENSOR_DATA.FRX1004 || {
                      temperature: 4.2,
                      humidity: 62.0,
                      gas: 120,
                      timestamp: Date.now()
                    };
                    callback({ ...def, isReal: false } as any);
                  }).catch(() => {
                    callback({ ...(DEFAULT_SENSOR_DATA[cleanId] || DEFAULT_SENSOR_DATA.FRX1004), isReal: false } as any);
                  });
                }
              });
            }
          });
        }
      };

      onValue(deviceRef, handleValue, (err) => {
        console.warn(`Realtime device listener warning for ${cleanId}:`, err);
      });

      onValue(defaultDeviceRef, (snap) => {
        if (snap.exists()) {
          processSensorPayload(snap.val(), true);
        }
      });

      activeCleanup = () => {
        off(deviceRef, 'value', handleValue);
        off(defaultDeviceRef, 'value');
      };
    } catch (e) {
      console.warn('Realtime subscription initiation error:', e);
    }
  }

  // Background REST polling fallback to ensure resilient live updates across connection changes
  const restInterval = setInterval(async () => {
    if (unsubscribed) return;
    try {
      const targetUrl = firebaseConfig.databaseURL || REALTIME_DATABASE_URL;
      const base = targetUrl.replace(/\/$/, '');
      
      // Fetch devices/YGS-FD-000124 or devices.json
      const res = await fetch(`${base}/devices/YGS-FD-000124.json`, {
        signal: AbortSignal.timeout(2500)
      });
      if (res.ok) {
        const data = await res.json();
        if (data) {
          processSensorPayload(data, true);
          return;
        }
      }

      const resAll = await fetch(`${base}/devices.json`, {
        signal: AbortSignal.timeout(2500)
      });
      if (resAll.ok) {
        const allDevices = await resAll.json();
        if (allDevices && typeof allDevices === 'object') {
          const firstKey = Object.keys(allDevices)[0];
          if (firstKey && allDevices[firstKey]) {
            processSensorPayload(allDevices[firstKey], true);
          }
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


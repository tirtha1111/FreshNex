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
import { socketTelemetryService } from './socketService';

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
 * Subscribe to real-time status of a device driven by the backend 30-second WebSocket timer.
 * When new data is received at the frontend, the backend starts a 30-second timer.
 * If no new data is updated within 30 seconds, the backend marks the device 'offline'; otherwise 'online'.
 */
export function subscribeToDeviceStatus(
  deviceId: string,
  callback: (status: 'online' | 'offline' | undefined) => void
): () => void {
  const cleanId = deviceId ? deviceId.trim().toUpperCase().replace(/^#/, '') : '';
  let lastReportedStatus: 'online' | 'offline' | undefined = undefined;

  return socketTelemetryService.subscribeStatus(cleanId, (wsStatus) => {
    if (lastReportedStatus !== wsStatus) {
      lastReportedStatus = wsStatus;
      callback(wsStatus);
    }
  });
}

/**
 * Verify a User Login parameter (Device ID, Tag UID, or Product Name) directly against
 * the Firebase Realtime Database (/devices and /rfid_registry) and return the resolved device & live data.
 */
export async function verifyDeviceLoginInRTDB(loginInput: string): Promise<{
  deviceId: string;
  productName: string;
  tagUid?: string;
  rawDeviceData?: any;
}> {
  const raw = (loginInput || '').trim().toUpperCase().replace(/^#/, '');
  if (!raw) {
    throw new Error('Please enter a valid Device ID (e.g. YGS-FD-001 or YGS-FD-124).');
  }

  let devicesObj: Record<string, any> | null = null;
  let registryObj: Record<string, any> | null = null;

  const db = getDirectDatabase();
  if (db) {
    try {
      const [devSnap, regSnap] = await Promise.all([
        get(ref(db, 'devices')).catch(() => null),
        get(ref(db, 'rfid_registry')).catch(() => null),
      ]);
      if (devSnap && devSnap.exists()) {
        devicesObj = devSnap.val();
      }
      if (regSnap && regSnap.exists()) {
        registryObj = regSnap.val();
      }
    } catch {
      // Fallback to REST if SDK read fails
    }
  }

  if (!devicesObj || !registryObj) {
    try {
      const cfg = getActiveFirebaseConfig();
      const base = (cfg.databaseURL || REALTIME_DATABASE_URL).replace(/\/$/, '');
      const [devRes, regRes] = await Promise.all([
        !devicesObj ? fetch(`${base}/devices.json`, { signal: AbortSignal.timeout(3500) }).catch(() => null) : null,
        !registryObj ? fetch(`${base}/rfid_registry.json`, { signal: AbortSignal.timeout(3500) }).catch(() => null) : null,
      ]);
      if (devRes && devRes.ok) {
        devicesObj = await devRes.json();
      }
      if (regRes && regRes.ok) {
        registryObj = await regRes.json();
      }
    } catch {
      // Non-blocking fallback
    }
  }

  // 1. Check if input matches an RFID Tag UID in /rfid_registry
  if (registryObj && typeof registryObj === 'object') {
    for (const [uidKey, regVal] of Object.entries(registryObj)) {
      if (!regVal || typeof regVal !== 'object') continue;
      const regDevId = String(regVal.device_id || '').trim().toUpperCase();
      const regProd = String(regVal.product || '').trim().toUpperCase();
      if (
        uidKey.trim().toUpperCase() === raw ||
        regDevId === raw ||
        (raw.length >= 3 && regDevId.endsWith(`-${raw}`)) ||
        regProd === raw
      ) {
        const resolvedId = regDevId || (regProd === 'MILK' ? 'YGS-FD-124' : 'YGS-FD-001');
        const rawDev = devicesObj?.[resolvedId] || null;
        const prodName =
          regProd === 'MILK' || resolvedId.includes('124')
            ? 'Milk'
            : regProd === 'APPLE' || resolvedId.includes('001')
            ? 'Apple'
            : regVal.product
            ? String(regVal.product).charAt(0).toUpperCase() + String(regVal.product).slice(1).toLowerCase()
            : 'Apple';
        return {
          deviceId: resolvedId,
          productName: prodName,
          tagUid: uidKey.trim().toUpperCase(),
          rawDeviceData: rawDev,
        };
      }
    }
  }

  // 2. Check if input matches any device in /devices
  if (devicesObj && typeof devicesObj === 'object') {
    for (const [devKey, devVal] of Object.entries(devicesObj)) {
      if (devKey === 'YGS-FD-000124' || devKey === 'YGS-FD-112233') continue;
      if (!devVal || typeof devVal !== 'object') continue;
      const cleanKey = devKey.trim().toUpperCase();
      const devIdField = String(devVal.device_id || devKey).trim().toUpperCase();
      const devType = String(devVal.device_type || devVal.product || devVal.product_name || '').trim().toUpperCase();
      const lastTagUid = String(devVal.last_tag_uid || '').trim().toUpperCase();

      if (
        cleanKey === raw ||
        devIdField === raw ||
        (raw.length >= 3 && cleanKey.endsWith(`-${raw}`)) ||
        (devType && devType === raw) ||
        (lastTagUid && lastTagUid === raw) ||
        (raw === 'APPLE' && cleanKey === 'YGS-FD-001') ||
        (raw === 'MILK' && cleanKey === 'YGS-FD-124')
      ) {
        const prodName =
          devType === 'MILK' || cleanKey.includes('124')
            ? 'Milk'
            : devType === 'APPLE' || cleanKey.includes('001')
            ? 'Apple'
            : devType
            ? devType.charAt(0) + devType.slice(1).toLowerCase()
            : 'Apple';
        return {
          deviceId: cleanKey,
          productName: prodName,
          tagUid: lastTagUid || undefined,
          rawDeviceData: devVal,
        };
      }
    }

    // If RTDB was reachable and had devices, but the user's input matched neither /devices nor /rfid_registry:
    const availableIds = Object.keys(devicesObj).filter(
      (k) => k !== 'YGS-FD-000124' && k !== 'YGS-FD-112233'
    );
    if (availableIds.length > 0) {
      throw new Error(
        `Device ID "${raw}" was not found in Firebase Realtime Database. Registered devices: ${availableIds.join(', ')}.`
      );
    }
  }

  // 3. Offline fallback if RTDB could not be reached
  if (raw === '124' || raw === 'MILK' || raw === 'YGS-FD-124' || raw === '61896F06') {
    return {
      deviceId: 'YGS-FD-124',
      productName: 'Milk',
      tagUid: '61896F06',
    };
  }
  if (raw === '001' || raw === 'APPLE' || raw === 'YGS-FD-001' || raw === '6D66F406') {
    return {
      deviceId: 'YGS-FD-001',
      productName: 'Apple',
      tagUid: '6D66F406',
    };
  }

  throw new Error(
    `Device ID "${raw}" is not registered. Please enter a valid Device ID (e.g. YGS-FD-001 or YGS-FD-124).`
  );
}

/**
 * Retrieve item metadata by ID directly from Realtime Database or catalogue
 */
export async function getItemById(itemId: string): Promise<FoodItem | null> {
  const cleanId = itemId.trim().toUpperCase().replace(/^#/, '');

  if (
    cleanId === 'MILK' ||
    cleanId === '124' ||
    cleanId === 'YGS-FD-124' ||
    cleanId === '61896F06' ||
    cleanId.includes('124') ||
    cleanId.includes('MILK') ||
    cleanId.includes('DAIRY')
  ) {
    return DEFAULT_ITEMS['MILK'];
  }
  if (
    cleanId === 'APPLE' ||
    cleanId === '001' ||
    cleanId === 'YGS-FD-001' ||
    cleanId === '6D66F406' ||
    cleanId.includes('001') ||
    cleanId.includes('APPLE') ||
    cleanId.includes('FRESORA') ||
    cleanId.includes('FRUIT')
  ) {
    return DEFAULT_ITEMS['APPLE'];
  }

  return DEFAULT_ITEMS['APPLE'];
}

/**
 * Normalizes a raw Firebase device/sensor payload into a complete SensorData object
 * containing all 9 parameters (Temperature, Humidity, Moisture, Dew Point, pH, Gas, Impact, Light, NEO-6M GPS)
 * plus hardware diagnostics from Firebase Realtime Database.
 */
export function parseFullSensorPayload(
  val: any,
  isMeat: boolean = false,
  isReal: boolean = false
): (SensorData & { isReal?: boolean; [key: string]: any }) | null {
  if (!val || typeof val !== 'object') return null;

  let target = val;
  if (
    !(
      'temperature_c' in val ||
      'temperature' in val ||
      'temp' in val ||
      't' in val ||
      'humidity_percent' in val ||
      'humidity' in val ||
      'hum' in val ||
      'gas' in val ||
      'mq135_raw' in val ||
      'acceleration_change' in val ||
      'light_lux' in val ||
      'impact' in val ||
      'light' in val ||
      'gpsLat' in val
    )
  ) {
    const keys = Object.keys(val).filter((k) => k !== 'commands' && k !== 'rfid_scans');
    if (keys.length > 0) {
      const lastKey = keys[keys.length - 1];
      if (typeof val[lastKey] === 'object' && val[lastKey] !== null) {
        target = val[lastKey];
      }
    }
  }

  const devIdHint = String(target.device_id || target.id || (isMeat ? 'MEAT' : 'YGS-FD-001'))
    .trim()
    .toUpperCase();
  const isMilkDevice =
    devIdHint.includes('124') ||
    String(target.device_type || target.product || '')
      .toLowerCase()
      .includes('milk');

  const defaultTemp = isMeat ? 3.5 : isMilkDevice ? 30.6 : 31.6;
  const defaultHum = isMeat ? 68.0 : isMilkDevice ? 72.2 : 71.2;
  const defaultGas = isMeat ? 980 : isMilkDevice ? 47 : 79;
  const defaultImpact = isMeat ? 0.15 : isMilkDevice ? 0 : 0.147;
  const defaultLight = isMeat ? 12 : isMilkDevice ? 33.3 : 12.5;
  const defaultLat = isMilkDevice ? 0 : 31.2536;
  const defaultLng = isMilkDevice ? 0 : 75.7037;
  const defaultSats = target.gps_satellites !== undefined ? Number(target.gps_satellites) : 0;

  // Prefer hardware-native RTDB fields (temperature_c, humidity_percent) first
  const temperature = Number(
    target.temperature_c ?? target.temperature ?? target.temp ?? target.t ?? defaultTemp
  );
  const humidity = Number(
    target.humidity_percent ?? target.humidity ?? target.hum ?? target.h ?? defaultHum
  );
  const gas = Number(
    target.mq135_raw ??
      target.gas ??
      target.gas_ppm ??
      target.mq135 ??
      target.mq2 ??
      target.voc ??
      defaultGas
  );

  let rawImpactCandidate =
    target.acceleration_change ??
    target.acceleration ??
    target.impact ??
    target.impact_g ??
    target.shock ??
    target.vibration ??
    target.g_force ??
    target.accel;

  if (
    rawImpactCandidate === undefined &&
    (target.accel_x !== undefined || target.accel_y !== undefined || target.accel_z !== undefined)
  ) {
    const ax = Number(target.accel_x || 0);
    const ay = Number(target.accel_y || 0);
    const az = Number(target.accel_z || 0);
    const mag = Math.sqrt(ax * ax + ay * ay + az * az);
    rawImpactCandidate = Math.abs(mag - 9.8) / 9.8;
  }

  const impactRaw = Number(rawImpactCandidate ?? defaultImpact);
  const lightRaw = Number(
    target.light_lux ??
      target.light ??
      target.lux ??
      target.ldr ??
      target.illuminance ??
      defaultLight
  );
  const rawLatCandidate =
    target.gpsLat ??
    target.gps_lat ??
    target.lat ??
    target.latitude ??
    target.gps?.lat ??
    target.gps?.latitude ??
    target.neo6m?.lat ??
    target.neo6m?.latitude;
  const rawLngCandidate =
    target.gpsLng ??
    target.gps_lng ??
    target.lng ??
    target.lon ??
    target.longitude ??
    target.gps?.lng ??
    target.gps?.lon ??
    target.gps?.longitude ??
    target.neo6m?.lng ??
    target.neo6m?.lon;

  const gpsLatRaw =
    !isMilkDevice &&
    (rawLatCandidate === undefined ||
      Number(rawLatCandidate) === 0 ||
      Number(rawLatCandidate) === 22.5726 ||
      Number(rawLatCandidate) === 28.6139)
      ? 31.2536
      : Number(rawLatCandidate ?? defaultLat);
  const gpsLngRaw =
    !isMilkDevice &&
    (rawLngCandidate === undefined ||
      Number(rawLngCandidate) === 0 ||
      Number(rawLngCandidate) === 88.3639 ||
      Number(rawLngCandidate) === 77.209)
      ? 75.7037
      : Number(rawLngCandidate ?? defaultLng);
  const gpsSatsRaw = Number(
    target.gps_satellites ??
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

  const timestamp = socketTelemetryService.getLastResponseTimestamp(devIdHint);

  const finalTemp = isNaN(temperature) ? defaultTemp : +temperature.toFixed(1);
  const finalHum = isNaN(humidity) ? defaultHum : +humidity.toFixed(1);
  const finalGas = isNaN(gas) ? defaultGas : Math.round(gas);
  const finalImpact = isNaN(impactRaw) ? defaultImpact : +impactRaw.toFixed(3);
  const finalLight = isNaN(lightRaw) ? defaultLight : +lightRaw.toFixed(1);
  const finalLat = isNaN(gpsLatRaw) ? defaultLat : +gpsLatRaw.toFixed(4);
  const finalLng = isNaN(gpsLngRaw) ? defaultLng : +gpsLngRaw.toFixed(4);
  const finalSats = isNaN(gpsSatsRaw) ? defaultSats : Math.round(gpsSatsRaw);

  const moistureReading = calculateMoisture(finalTemp, finalHum);
  const phReading = calculatePH(finalTemp, finalHum, moistureReading.absoluteMoisture, {
    category: isMeat ? 'meat' : isMilkDevice ? 'milk' : 'apple',
    gas: finalGas,
  });

  // Always derive moisture, dewPoint, and pH from the live hardware temperature/humidity/gas
  const finalMoisture = moistureReading.absoluteMoisture;
  const finalDewPoint = moistureReading.dewPoint;
  const finalPh = phReading.ph;

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
    device_id: devIdHint,
    device_type: target.device_type,
    dht22_ok: target.dht22_ok,
    light_sensor_ok: target.light_sensor_ok,
    mq135_adc_voltage: target.mq135_adc_voltage,
    mq135_sensor_voltage: target.mq135_sensor_voltage,
    last_tag_uid: target.last_tag_uid,
    gps_valid: target.gps_valid,
    impact_detected: target.impact_detected,
    accel_x: target.accel_x,
    accel_y: target.accel_y,
    accel_z: target.accel_z,
    gyro_x: target.gyro_x,
    gyro_y: target.gyro_y,
    gyro_z: target.gyro_z,
    online: target.online,
  };
}

/**
 * Fetches the current live sensor reading for a device directly from Firebase Realtime Database (/devices/{deviceId})
 */
export async function fetchLiveSensorData(
  itemId: string
): Promise<(SensorData & { isReal?: boolean; [key: string]: any }) | null> {
  const raw = (itemId || '').trim().toUpperCase().replace(/^#/, '');
  const cleanId =
    raw === '124' || raw === 'MILK' || raw.includes('124') || raw === '61896F06'
      ? 'YGS-FD-124'
      : raw === '001' || raw === 'APPLE' || raw.includes('001') || raw === '6D66F406'
      ? 'YGS-FD-001'
      : raw;

  const db = getDirectDatabase();
  if (db) {
    try {
      const snap = await get(ref(db, `devices/${cleanId}`));
      if (snap.exists()) {
        const val = snap.val();
        return parseFullSensorPayload({ ...val, device_id: cleanId }, false, true);
      }
    } catch {
      // Fallback to REST
    }
  }

  try {
    const cfg = getActiveFirebaseConfig();
    const base = (cfg.databaseURL || REALTIME_DATABASE_URL).replace(/\/$/, '');
    const res = await fetch(`${base}/devices/${cleanId}.json`, {
      signal: AbortSignal.timeout(3000),
    });
    if (res.ok) {
      const val = await res.json();
      if (val && typeof val === 'object') {
        return parseFullSensorPayload({ ...val, device_id: cleanId }, false, true);
      }
    }
  } catch {
    // Ignore
  }

  return null;
}

/**
 * Syncs all 9 sensor telemetry parameters for a device to Firebase Realtime Database and Firestore
 */
export async function syncSensorTelemetryToFirebase(
  deviceId: string,
  data: Partial<SensorData> & { product?: string; online?: boolean }
): Promise<void> {
  const cleanId = deviceId.trim().replace(/^#/, '');

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
    product: data.product || 'Monitored Product',
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

  // Broadcast immediately over WebSocket to backend and all connected clients with zero lag
  socketTelemetryService.emitDeviceUpdate(cleanId, payload);

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
 * Connects to WebSocket + devices/{deviceId} and sensorData/{deviceId} on both Realtime Database and Firestore
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
    const parsed = parseFullSensorPayload(
      val && typeof val === 'object' ? { ...val, device_id: val.device_id || cleanId } : val,
      isMeat,
      isReal
    );
    if (parsed) {
      callback(parsed as any);
    }
  };

  let activeCleanups: (() => void)[] = [];

  const bindListeners = () => {
    activeCleanups.forEach((c) => c());
    activeCleanups = [];

    // 1. Zero-lag WebSocket subscription from backend database bridge
    const unsubWsTelemetry = socketTelemetryService.subscribeTelemetry(cleanId, (wsData) => {
      processSensorPayload(wsData, true);
    });
    activeCleanups.push(unsubWsTelemetry);

    const candidatePaths = [cleanId];
    if (cleanId === 'APPLE' || cleanId === '001' || cleanId.includes('001') || cleanId.includes('APPLE')) {
      if (!candidatePaths.includes('YGS-FD-001')) candidatePaths.push('YGS-FD-001');
      if (!candidatePaths.includes('001')) candidatePaths.push('001');
      if (!candidatePaths.includes('APPLE')) candidatePaths.push('APPLE');
    } else if (cleanId === 'MILK' || cleanId === '124' || cleanId.includes('124') || cleanId.includes('MILK')) {
      if (!candidatePaths.includes('YGS-FD-124')) candidatePaths.push('YGS-FD-124');
      if (!candidatePaths.includes('124')) candidatePaths.push('124');
      if (!candidatePaths.includes('MILK')) candidatePaths.push('MILK');
    }

    const db = getDirectDatabase();
    let gotRealData = false;

    if (db) {
      try {
        candidatePaths.forEach((pathId) => {
          const deviceRef = ref(db, `devices/${pathId}`);

          const handleDevVal = (snapshot: any) => {
            if (snapshot.exists()) {
              gotRealData = true;
              const rawVal = snapshot.val();
              processSensorPayload(rawVal, true);
            }
          };

          const unsubDev = onValue(deviceRef, handleDevVal, (err) => {
            if (!err?.message?.includes('PERMISSION_DENIED')) {
              console.warn(`Realtime device listener warning for ${pathId}:`, err);
            }
          });

          activeCleanups.push(() => {
            unsubDev();
            off(deviceRef, 'value', handleDevVal);
          });
        });

        let unsubscribed = false;

        // Background REST polling fallback using active Firebase credentials
        const restInterval = setInterval(async () => {
          if (unsubscribed || gotRealData) return;
          try {
            const cfg = getActiveFirebaseConfig();
            const targetUrl = cfg.databaseURL || REALTIME_DATABASE_URL;
            const base = targetUrl.replace(/\/$/, '');

            for (const path of candidatePaths) {
              const res = await fetch(`${base}/devices/${path}.json`, {
                signal: AbortSignal.timeout(2500),
              });
              if (res.ok) {
                const data = await res.json();
                if (data) {
                  gotRealData = true;
                  processSensorPayload(data, true);
                  break;
                }
              }
            }
          } catch {
            // Non-blocking fallback
          }
        }, 8000);

        activeCleanups.push(() => {
          unsubscribed = true;
          clearInterval(restInterval);
        });
      } catch (e) {
        console.warn('Realtime subscription initiation error:', e);
      }
    }

    // Also subscribe to Firestore devices if available
    const fs = getDirectFirestore();
    if (fs) {
      try {
        candidatePaths.forEach((pathId) => {
          const fsDocRef = doc(fs, 'devices', pathId);
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
        });
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
  static verifyDeviceLoginInRTDB = verifyDeviceLoginInRTDB;
  static fetchLiveSensorData = fetchLiveSensorData;
  static subscribeToSensorData = subscribeToSensorData;
  static subscribeToDeviceStatus = subscribeToDeviceStatus;
  static syncSensorTelemetryToFirebase = syncSensorTelemetryToFirebase;
  static saveScanHistory = saveScanHistory;
  static getScanHistory = getScanHistory;
  static clearScanHistory = clearScanHistory;
}

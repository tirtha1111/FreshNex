import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Role,
  DeviceData,
  UserRecord,
  UserScanItem,
  SensorHistoryEntry,
  ProductProfile,
  SensorAlert,
  UserSettings,
} from '../types';

export type { DeviceData };
import {
  auth,
  isFirebaseConfigured,
  reinitializeFirebaseWithConfig,
  getActiveLoginUid,
} from '../firebase/firebase';
import { getDirectDatabase, getDirectFirestore } from '../services/firebaseService';
import { extractLatestTimestamp } from '../utils/dateUtils';
import { calculateMoisture } from '../utils/moistureCalculator';
import { calculatePH } from '../utils/phCalculator';
import { saveProductThresholdToFirebase } from '../services/alertThresholdService';
import { socketTelemetryService } from '../services/socketService';

import {
  ref,
  onValue,
  off,
  set as dbSet,
  push as dbPush,
  get as dbGet,
  update as dbUpdate,
} from 'firebase/database';
import { doc, setDoc } from 'firebase/firestore';

import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as fbSignOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
} from 'firebase/auth';

interface AppContextType {
  devicesMap: Record<string, DeviceData>;
  userScans: UserScanItem[];
  userRole: Role;
  currentUser: any;
  userRecord: UserRecord | null;
  sensorHistory: Record<string, SensorHistoryEntry[]>;
  productProfiles: ProductProfile[];
  alertsList: SensorAlert[];
  allUsersList: UserRecord[];

  isLoading: boolean;
  authError: string | null;
  isFirebaseConnected: boolean;
  isDemoMode: boolean;
  setDemoMode: (val: boolean) => void;

  login: (email: string, password: string, intendedRole?: Role) => Promise<UserRecord>;
  signup: (email: string, password: string, name: string) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  logout: () => Promise<void>;

  fetchDeviceById: (deviceId: string) => Promise<DeviceData | null>;
  addScanToHistory: (deviceId: string, productName: string) => Promise<void>;
  updateDeviceData: (deviceId: string, data: Partial<DeviceData>) => Promise<void>;
  updateProductProfile: (profile: ProductProfile) => Promise<void>;

  applyFirebaseConfig: (config: {
    apiKey: string;
    authDomain: string;
    databaseURL: string;
    projectId: string;
    storageBucket?: string;
    messagingSenderId?: string;
    appId?: string;
    firestoreDatabaseId?: string;
  }) => void;

  userSettings: UserSettings;
  updateSettings: (settings: UserSettings) => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// Normalization helper for ESP32 hardware telemetry payloads from Realtime Database (all 9 parameters)
function normalizeDeviceData(rawDevice: any, deviceId: string): DeviceData {
  const isMilk =
    String(deviceId || '').toUpperCase().includes('124') ||
    String(rawDevice?.device_type || rawDevice?.product || '')
      .toLowerCase()
      .includes('milk');

  const defaultFallback: DeviceData = {
    device_id: deviceId,
    product: isMilk ? 'Milk' : 'Apple',
    temperature: isMilk ? 30.6 : 31.6,
    humidity: isMilk ? 72.2 : 71.2,
    mq135_raw: isMilk ? 47 : 79,
    moisture: isMilk ? 22.8 : 23.7,
    dewPoint: isMilk ? 25.0 : 25.7,
    ph: isMilk ? 6.45 : 3.75,
    impact: isMilk ? 0 : 0.147,
    light: isMilk ? 33.3 : 12.5,
    gpsLat: 22.5726,
    gpsLng: 88.3639,
    gpsSats: 0,
    online: true,
    last_update: Date.now(),
  };

  if (!rawDevice || typeof rawDevice !== 'object') {
    return defaultFallback;
  }

  let target = rawDevice;
  if (
    !(
      'temperature_c' in rawDevice ||
      'temperature' in rawDevice ||
      'temp' in rawDevice ||
      't' in rawDevice ||
      'humidity_percent' in rawDevice ||
      'humidity' in rawDevice ||
      'hum' in rawDevice ||
      'gas' in rawDevice ||
      'mq135_raw' in rawDevice
    )
  ) {
    const keys = Object.keys(rawDevice).filter((k) => k !== 'commands' && k !== 'rfid_scans');
    if (keys.length > 0) {
      const lastKey = keys[keys.length - 1];
      if (typeof rawDevice[lastKey] === 'object' && rawDevice[lastKey] !== null) {
        target = rawDevice[lastKey];
      }
    }
  }

  // Prefer hardware-native RTDB fields (temperature_c, humidity_percent) first
  const temperature = Number(
    target.temperature_c ?? target.temperature ?? target.temp ?? target.t ?? (isMilk ? 30.6 : 31.6)
  );
  const humidity = Number(
    target.humidity_percent ?? target.humidity ?? target.hum ?? target.h ?? (isMilk ? 72.2 : 71.2)
  );
  const mq135_raw = Number(
    target.mq135_raw ?? target.gas ?? target.mq135 ?? (isMilk ? 47 : 79)
  );

  // Compute live impact/acceleration from Firebase Realtime Database (acceleration_change, accel_x/y/z, or impact)
  let rawImpactVal =
    target.acceleration_change ??
    target.acceleration ??
    target.impact ??
    target.shock ??
    target.vibration;
  if (
    rawImpactVal === undefined &&
    (target.accel_x !== undefined || target.accel_y !== undefined || target.accel_z !== undefined)
  ) {
    const ax = Number(target.accel_x || 0);
    const ay = Number(target.accel_y || 0);
    const az = Number(target.accel_z || 0);
    const mag = Math.sqrt(ax * ax + ay * ay + az * az);
    rawImpactVal = Math.abs(mag - 9.8) / 9.8;
  }
  const impact = Number(rawImpactVal ?? (isMilk ? 0 : 0.147));

  const light = Number(
    target.light_lux ?? target.light ?? target.lux ?? target.ldr ?? (isMilk ? 33.3 : 12.5)
  );
  const gpsLat = Number(
    target.gpsLat ?? target.lat ?? target.latitude ?? target.gps?.lat ?? target.neo6m?.lat ?? 22.5726
  );
  const gpsLng = Number(
    target.gpsLng ??
      target.lng ??
      target.lon ??
      target.longitude ??
      target.gps?.lng ??
      target.neo6m?.lng ??
      88.3639
  );
  const gpsSats = Number(
    target.gps_satellites ??
      target.gpsSats ??
      target.sats ??
      target.satellites ??
      target.gps?.sats ??
      target.neo6m?.sats ??
      0
  );

  const finalTemp = isNaN(temperature) ? (isMilk ? 30.6 : 31.6) : +temperature.toFixed(1);
  const finalHum = isNaN(humidity) ? (isMilk ? 72.2 : 71.2) : +humidity.toFixed(1);
  const finalGas = isNaN(mq135_raw) ? (isMilk ? 47 : 79) : Math.round(mq135_raw);
  const finalImpact = isNaN(impact) ? 0 : +impact.toFixed(3);
  const finalLight = isNaN(light) ? (isMilk ? 33.3 : 12.5) : +light.toFixed(1);
  const finalLat = isNaN(gpsLat) ? 22.5726 : +gpsLat.toFixed(4);
  const finalLng = isNaN(gpsLng) ? 88.3639 : +gpsLng.toFixed(4);
  const finalSats = isNaN(gpsSats) ? 0 : Math.round(gpsSats);

  const rawId = (deviceId || '').toUpperCase();
  let defaultProduct = 'Apple';
  if (rawId.includes('124') || rawId.includes('MILK') || isMilk) {
    defaultProduct = 'Milk';
  } else if (rawId.includes('001') || rawId.includes('APPLE')) {
    defaultProduct = 'Apple';
  }
  const rawProd = target.product_name || target.product || target.device_type || target.name;
  const formattedProd =
    rawProd && typeof rawProd === 'string'
      ? rawProd.charAt(0).toUpperCase() + rawProd.slice(1).toLowerCase()
      : '';
  const product =
    !formattedProd ||
    formattedProd === 'Cold drinks' ||
    formattedProd === 'Meat' ||
    formattedProd === 'Iot node'
      ? defaultProduct
      : formattedProd;
  const moistureCalc = calculateMoisture(finalTemp, finalHum);
  const phCalc = calculatePH(finalTemp, finalHum, moistureCalc.absoluteMoisture, {
    category: product,
    gas: finalGas,
  });

  const extractedTs = extractLatestTimestamp(target);
  const last_update = Math.max(extractedTs, Date.now());
  const online =
    target.online !== undefined
      ? Boolean(target.online)
      : target.status
      ? target.status.toLowerCase() !== 'offline'
      : true;

  const temperature_min = target.temperature_min ?? rawDevice.temperature_min;
  const temperature_max = target.temperature_max ?? rawDevice.temperature_max;
  const humidity_min = target.humidity_min ?? rawDevice.humidity_min;
  const humidity_max = target.humidity_max ?? rawDevice.humidity_max;
  const mq135_threshold = target.mq135_threshold ?? rawDevice.mq135_threshold;

  return {
    ...rawDevice,
    device_id: rawDevice.device_id || rawDevice.id || deviceId,
    product,
    temperature: finalTemp,
    humidity: finalHum,
    mq135_raw: finalGas,
    moisture: moistureCalc.absoluteMoisture,
    dewPoint: moistureCalc.dewPoint,
    ph: phCalc.ph,
    impact: finalImpact,
    light: finalLight,
    gpsLat: finalLat,
    gpsLng: finalLng,
    gpsSats: finalSats,
    ...(temperature_min !== undefined ? { temperature_min } : {}),
    ...(temperature_max !== undefined ? { temperature_max } : {}),
    ...(humidity_min !== undefined ? { humidity_min } : {}),
    ...(humidity_max !== undefined ? { humidity_max } : {}),
    ...(mq135_threshold !== undefined ? { mq135_threshold } : {}),
    online,
    last_update,
  };
}

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isDemoMode, setDemoMode] = useState<boolean>(!isFirebaseConfigured);
  const [configVersion, setConfigVersion] = useState<number>(0);

  const [devicesMap, setDevicesMap] = useState<Record<string, DeviceData>>(() => {
    const appleMoisture = calculateMoisture(31.6, 71.2);
    const applePh = calculatePH(31.6, 71.2, appleMoisture.absoluteMoisture, {
      category: 'Apple',
      gas: 79,
    });
    const milkMoisture = calculateMoisture(30.6, 72.2);
    const milkPh = calculatePH(30.6, 72.2, milkMoisture.absoluteMoisture, {
      category: 'Milk',
      gas: 47,
    });

    const defaultHardware: Record<string, DeviceData> = {
      'YGS-FD-001': {
        device_id: 'YGS-FD-001',
        product: 'Apple',
        temperature: 31.6,
        humidity: 71.2,
        mq135_raw: 79,
        moisture: appleMoisture.absoluteMoisture,
        dewPoint: appleMoisture.dewPoint,
        ph: applePh.ph,
        impact: 0.147,
        light: 12.5,
        gpsLat: 22.5726,
        gpsLng: 88.3639,
        gpsSats: 0,
        temperature_min: 0.0,
        temperature_max: 4.0,
        humidity_min: 85,
        humidity_max: 95,
        mq135_threshold: 1200,
        online: true,
        last_update: Date.now(),
      },
      'YGS-FD-124': {
        device_id: 'YGS-FD-124',
        product: 'Milk',
        temperature: 30.6,
        humidity: 72.2,
        mq135_raw: 47,
        moisture: milkMoisture.absoluteMoisture,
        dewPoint: milkMoisture.dewPoint,
        ph: milkPh.ph,
        impact: 0,
        light: 33.3,
        gpsLat: 22.5726,
        gpsLng: 88.3639,
        gpsSats: 0,
        temperature_min: 1.0,
        temperature_max: 4.0,
        humidity_min: 65,
        humidity_max: 75,
        mq135_threshold: 900,
        online: true,
        last_update: Date.now(),
      },
    };

    try {
      const stored = localStorage.getItem('freshnex_devices_map');
      if (stored) {
        const parsed = JSON.parse(stored);
        delete parsed['YGS-FD-000124'];
        delete parsed['YGS-FD-112233'];
        const normalizedStored: Record<string, DeviceData> = {};
        Object.keys(parsed).forEach((k) => {
          normalizedStored[k] = normalizeDeviceData(parsed[k], k);
        });
        return { ...defaultHardware, ...normalizedStored };
      }
    } catch {}
    return defaultHardware;
  });

  const [userScans, setUserScans] = useState<UserScanItem[]>([]);
  const [userRole, setUserRole] = useState<Role>('user');
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [userRecord, setUserRecord] = useState<UserRecord | null>(null);
  const [sensorHistory, setSensorHistory] = useState<Record<string, SensorHistoryEntry[]>>({});
  const [productProfiles, setProductProfiles] = useState<ProductProfile[]>(() => {
    const defaultProfiles: ProductProfile[] = [
      {
        id: 'p_apple',
        name: 'Apple',
        temperature_min: 0.0,
        temperature_max: 4.0,
        humidity_min: 85,
        humidity_max: 95,
        mq135_threshold: 1200,
      },
      {
        id: 'p_milk',
        name: 'Milk',
        temperature_min: 1.0,
        temperature_max: 4.0,
        humidity_min: 65,
        humidity_max: 75,
        mq135_threshold: 900,
      },
    ];
    try {
      const stored = localStorage.getItem('freshnex_product_profiles');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const filtered = parsed.filter(p => p.name !== 'Cold Drinks' && p.name !== 'Meat');
          if (filtered.length > 0) return filtered;
        }
      }
    } catch {}
    return defaultProfiles;
  });
  const [alertsList, setAlertsList] = useState<SensorAlert[]>([]);
  const [allUsersList, setAllUsersList] = useState<UserRecord[]>([]);

  const [userSettings, setUserSettings] = useState<UserSettings>({
    notificationsEnabled: true,
    tempUnit: 'C',
    alertSoundEnabled: true,
  });

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [isFirebaseConnected, setIsFirebaseConnected] = useState<boolean>(isFirebaseConfigured);

  // Listen for Firebase credential updates from the Settings panel
  useEffect(() => {
    const handleConfigUpdated = () => {
      setConfigVersion((v) => v + 1);
    };
    if (typeof window !== 'undefined') {
      window.addEventListener('freshnex_firebase_config_updated', handleConfigUpdated);
    }
    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('freshnex_firebase_config_updated', handleConfigUpdated);
      }
    };
  }, []);

  // Synchronize all collections (devices, productProfiles, alerts, history, users) with the active Firebase Realtime Database
  useEffect(() => {
    const rtdb = getDirectDatabase();
    if (!rtdb) {
      setIsFirebaseConnected(false);
      setIsLoading(false);
      return;
    }

    setIsFirebaseConnected(true);
    const cleanups: (() => void)[] = [];

    // 0. Zero-lag WebSocket subscription from Backend Database Bridge
    const unsubWsAll = socketTelemetryService.subscribeAllDevicesTelemetry((wsDevices) => {
      if (!wsDevices || typeof wsDevices !== 'object') return;
      setDevicesMap((prev) => {
        const next = { ...prev };
        Object.keys(wsDevices).forEach((devId) => {
          if (devId !== 'YGS-FD-000124' && devId !== 'YGS-FD-112233') {
            next[devId] = normalizeDeviceData(wsDevices[devId], devId);
          }
        });
        return next;
      });
    });
    cleanups.push(unsubWsAll);

    ['YGS-FD-001', 'YGS-FD-124'].forEach((trackedId) => {
      const unsubDevWs = socketTelemetryService.subscribeTelemetry(trackedId, (wsData) => {
        if (!wsData) return;
        setDevicesMap((prev) => ({
          ...prev,
          [trackedId]: normalizeDeviceData(wsData, trackedId),
        }));
      });
      cleanups.push(unsubDevWs);
    });

    // 1. Listen to Devices in devices/
    try {
      const devicesRef = ref(rtdb, 'devices');
      const handleDevices = (snapshot: any) => {
        if (snapshot.exists()) {
          const rawData = snapshot.val();
          const normalizedMap: Record<string, DeviceData> = {};
          if (rawData && typeof rawData === 'object') {
            Object.keys(rawData).forEach((devId) => {
              if (devId !== 'YGS-FD-000124' && devId !== 'YGS-FD-112233') {
                normalizedMap[devId] = normalizeDeviceData(rawData[devId], devId);
                // Notify backend via WebSocket that data was received at the frontend to start/reset 30s timer
                socketTelemetryService.reportFrontendDataReceived(devId, rawData[devId]);
              }
            });
          }
          setDevicesMap(normalizedMap);
          try {
            localStorage.setItem('freshnex_devices_map', JSON.stringify(normalizedMap));
          } catch {}
        } else {
          setDevicesMap({});
        }
      };
      onValue(devicesRef, handleDevices, (err) => {
        if (!err?.message?.includes('PERMISSION_DENIED')) {
          console.warn('Devices RTDB listener notice:', err?.message || err);
        }
      });
      cleanups.push(() => off(devicesRef, 'value', handleDevices));
    } catch (e) {
      console.warn('Devices RTDB listener warning:', e);
    }

    // 2. Listen to productProfiles/
    try {
      const profilesRef = ref(rtdb, 'productProfiles');
      const handleProfiles = (snapshot: any) => {
        if (snapshot.exists()) {
          const data = snapshot.val();
          if (data && typeof data === 'object') {
            const list: ProductProfile[] = Object.keys(data).map((k) => ({
              id: k,
              ...data[k],
            }));
            if (list.length > 0) {
              setProductProfiles(list);
              try {
                localStorage.setItem('freshnex_product_profiles', JSON.stringify(list));
              } catch {}
            }
          }
        }
      };
      onValue(profilesRef, handleProfiles, (err) => {
        if (!err?.message?.includes('PERMISSION_DENIED')) {
          console.warn('productProfiles RTDB notice:', err?.message || err);
        }
      });
      cleanups.push(() => off(profilesRef, 'value', handleProfiles));
    } catch (e) {
      console.warn('productProfiles RTDB listener warning:', e);
    }

    // 3. Listen to alerts/
    try {
      const alertsRef = ref(rtdb, 'alerts');
      const handleAlerts = (snapshot: any) => {
        if (snapshot.exists()) {
          const data = snapshot.val();
          if (data && typeof data === 'object') {
            const list: SensorAlert[] = Object.keys(data).map((k) => ({
              id: k,
              ...data[k],
            }));
            list.sort((a, b) => b.timestamp - a.timestamp);
            setAlertsList(list);
          }
        } else {
          setAlertsList([]);
        }
      };
      onValue(alertsRef, handleAlerts, (err) => {
        if (!err?.message?.includes('PERMISSION_DENIED')) {
          console.warn('alerts RTDB notice:', err?.message || err);
        }
      });
      cleanups.push(() => off(alertsRef, 'value', handleAlerts));
    } catch (e) {
      console.warn('alerts RTDB listener warning:', e);
    }

    // 4. Listen to sensor history in history/
    try {
      const historyRef = ref(rtdb, 'history');
      const handleHistory = (snapshot: any) => {
        if (snapshot.exists()) {
          const data = snapshot.val();
          if (data && typeof data === 'object') {
            const parsed: Record<string, SensorHistoryEntry[]> = {};
            Object.keys(data).forEach((devId) => {
              const entriesObj = data[devId];
              if (entriesObj && typeof entriesObj === 'object') {
                const list: SensorHistoryEntry[] = Object.keys(entriesObj).map((ek) => ({
                  id: ek,
                  ...entriesObj[ek],
                }));
                list.sort((a, b) => b.timestamp - a.timestamp);
                parsed[devId] = list;
              }
            });
            setSensorHistory(parsed);
          }
        }
      };
      onValue(historyRef, handleHistory, (err) => {
        if (!err?.message?.includes('PERMISSION_DENIED')) {
          console.warn('history RTDB notice:', err?.message || err);
        }
      });
      cleanups.push(() => off(historyRef, 'value', handleHistory));
    } catch (e) {
      console.warn('history RTDB listener warning:', e);
    }

    // 5. Listen to all users list
    try {
      const allUsersRef = ref(rtdb, 'users');
      const handleUsers = (snapshot: any) => {
        if (snapshot.exists()) {
          const data = snapshot.val();
          if (data && typeof data === 'object') {
            const list: UserRecord[] = Object.keys(data).map((uidKey) => ({
              uid: uidKey,
              name: data[uidKey].name || 'User',
              email: data[uidKey].email || '',
              role: data[uidKey].role || 'user',
              createdAt: data[uidKey].createdAt || Date.now(),
            }));
            setAllUsersList(list);
          }
        }
      };
      onValue(allUsersRef, handleUsers, (err) => {
        if (!err?.message?.includes('PERMISSION_DENIED')) {
          console.warn('users RTDB notice:', err?.message || err);
        }
      });
      cleanups.push(() => off(allUsersRef, 'value', handleUsers));
    } catch (e) {
      console.warn('users RTDB listener warning:', e);
    }

    // 6. Auth state observer
    if (auth) {
      const unsubAuth = onAuthStateChanged(
        auth,
        (user) => {
          setCurrentUser(user);
          const targetUid = user?.uid || getActiveLoginUid();
          if (targetUid) {
            const scansRef = ref(rtdb, `userScans/${targetUid}`);
            const handleScans = (snapshot: any) => {
              if (snapshot.exists()) {
                const data = snapshot.val();
                const list: UserScanItem[] = Object.keys(data).map((k) => ({
                  id: k,
                  ...data[k],
                }));
                list.sort((a, b) => b.scanned_at - a.scanned_at);
                setUserScans(list);
              }
            };
            onValue(scansRef, handleScans, (err) => {
              if (!err?.message?.includes('PERMISSION_DENIED')) {
                console.warn('userScans RTDB notice:', err?.message || err);
              }
            });
            cleanups.push(() => off(scansRef, 'value', handleScans));
          }
          setIsLoading(false);
        },
        () => {
          setIsLoading(false);
        }
      );
      cleanups.push(unsubAuth);
    } else {
      setIsLoading(false);
    }

    return () => {
      cleanups.forEach((c) => c());
    };
  }, [configVersion]);

  // Auth Functions
  const login = async (email: string, password: string, intendedRole?: Role): Promise<UserRecord> => {
    setAuthError(null);
    const rtdb = getDirectDatabase();

    try {
      if (!auth) throw new Error('Firebase Auth not initialized');
      const res = await signInWithEmailAndPassword(auth, email, password);
      const user = res.user;

      let record: UserRecord = {
        uid: user.uid,
        name: user.displayName || user.email?.split('@')[0] || 'User',
        email: user.email || '',
        role: 'user',
        createdAt: Date.now(),
      };

      if (rtdb) {
        const userRef = ref(rtdb, `users/${user.uid}`);
        const snapshot = await dbGet(userRef);
        if (snapshot.exists()) {
          const val = snapshot.val();
          record = {
            uid: user.uid,
            name: val.name || user.displayName || 'User',
            email: val.email || user.email || '',
            role: (val.role === 'admin' ? 'admin' : 'user') as Role,
            createdAt: val.createdAt || Date.now(),
          };
        } else {
          await dbSet(userRef, record);
        }
      }

      setUserRecord(record);
      setUserRole(record.role);

      if (intendedRole === 'admin' && record.role !== 'admin') {
        throw new Error('Access Denied: Your account does not have Admin authorization.');
      }

      return record;
    } catch (err: any) {
      setAuthError(err.message || 'Login failed.');
      throw err;
    }
  };

  const signup = async (email: string, password: string, name: string) => {
    setAuthError(null);
    const rtdb = getDirectDatabase();

    try {
      if (!auth) throw new Error('Firebase Auth not initialized');
      const res = await createUserWithEmailAndPassword(auth, email, password);
      const user = res.user;
      const newRecord: UserRecord = {
        uid: user.uid,
        name,
        email,
        role: 'user',
        createdAt: Date.now(),
      };

      if (rtdb) {
        await dbSet(ref(rtdb, `users/${user.uid}`), newRecord);
      }
      setUserRecord(newRecord);
      setUserRole('user');
    } catch (err: any) {
      setAuthError(err.message || 'Registration failed.');
      throw err;
    }
  };

  const resetPassword = async (email: string) => {
    setAuthError(null);
    if (!auth) return;
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (err: any) {
      setAuthError(err.message || 'Failed to send password reset email.');
      throw err;
    }
  };

  const logout = async () => {
    if (auth) {
      try {
        await fbSignOut(auth);
      } catch (err) {
        console.error('Logout error:', err);
      }
    }
    setCurrentUser(null);
    setUserRecord(null);
    setUserRole('user');
  };

  // Device & Scan Operations
  const fetchDeviceById = async (deviceId: string): Promise<DeviceData | null> => {
    if (devicesMap[deviceId]) {
      return devicesMap[deviceId];
    }

    const rtdb = getDirectDatabase();
    if (!rtdb) return null;

    try {
      const snapshot = await dbGet(ref(rtdb, `devices/${deviceId}`));
      if (snapshot.exists()) {
        return normalizeDeviceData(snapshot.val(), deviceId);
      }
      return null;
    } catch (e) {
      console.error('Error querying Firebase device:', e);
      return null;
    }
  };

  const addScanToHistory = async (deviceId: string, productName: string) => {
    const scanItem: Omit<UserScanItem, 'id'> = {
      device_id: deviceId,
      product: productName,
      scanned_at: Date.now(),
    };

    const newScan: UserScanItem = {
      id: `scan_${Date.now()}`,
      ...scanItem,
    };
    setUserScans((prev) => [newScan, ...prev.filter((s) => s.device_id !== deviceId)]);

    const rtdb = getDirectDatabase();
    const targetUid = currentUser?.uid || getActiveLoginUid();
    if (rtdb && targetUid) {
      try {
        const scansRef = ref(rtdb, `userScans/${targetUid}`);
        const newPush = dbPush(scansRef);
        await dbSet(newPush, scanItem);
      } catch (e) {
        console.warn('RTDB addScanToHistory warning:', e);
      }
    }
  };

  const updateDeviceData = async (deviceId: string, data: Partial<DeviceData>) => {
    let mergedDevice: DeviceData | null = null;
    const now = Date.now();

    // 1. Immediately update local state so UI updates without lag
    setDevicesMap((prev) => {
      const existing = prev[deviceId] || {
        device_id: deviceId,
        product: data.product || 'Fresh Produce',
        temperature: 4.0,
        humidity: 65.0,
        mq135_raw: 150,
        impact: 0.05,
        light: 15,
        online: true,
        last_update: now,
      };
      mergedDevice = {
        ...existing,
        ...data,
        last_update: now,
        website_updated_at: now,
      } as DeviceData;
      const updated = {
        ...prev,
        [deviceId]: mergedDevice,
      };
      try {
        localStorage.setItem('freshnex_devices_map', JSON.stringify(updated));
      } catch {}
      return updated;
    });

    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('freshnex_device_updated', {
          detail: { deviceId, timestamp: now, data },
        })
      );
    }

    // 1b. Push over WebSocket to backend (resets 30s online timer and broadcasts to all clients with zero lag)
    socketTelemetryService.emitDeviceUpdate(deviceId, mergedDevice || data);

    // 2. Sync to Firebase Realtime Database
    const rtdb = getDirectDatabase();
    if (rtdb) {
      try {
        const deviceRef = ref(rtdb, `devices/${deviceId}`);
        await dbUpdate(deviceRef, {
          ...data,
          last_update: now,
          website_updated_at: now,
        });
      } catch (err) {
        console.warn('Realtime DB updateDeviceData warning:', err);
      }
    }

    // 3. Sync to Firestore
    const fs = getDirectFirestore();
    if (fs && mergedDevice) {
      try {
        await setDoc(doc(fs, 'devices', deviceId), mergedDevice, { merge: true });
      } catch (err) {
        console.warn('Firestore updateDeviceData warning:', err);
      }
    }
  };

  const updateProductProfile = async (profile: ProductProfile) => {
    const now = Date.now();
    // 1. Immediately update local state
    setProductProfiles((prev) => {
      const idx = prev.findIndex(
        (p) => p.id === profile.id || p.name.toLowerCase() === profile.name.toLowerCase()
      );
      let updated: ProductProfile[];
      if (idx >= 0) {
        updated = [...prev];
        updated[idx] = { ...updated[idx], ...profile };
      } else {
        updated = [...prev, profile];
      }
      try {
        localStorage.setItem('freshnex_product_profiles', JSON.stringify(updated));
      } catch {}
      return updated;
    });

    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('freshnex_device_updated', {
          detail: { product: profile.name, timestamp: now },
        })
      );
    }

    // 2. Push to Firebase RTDB & Firestore
    const rtdb = getDirectDatabase();
    if (rtdb) {
      try {
        await dbSet(ref(rtdb, `productProfiles/${profile.id}`), profile);
      } catch (err) {
        console.warn('Realtime DB updateProductProfile warning:', err);
      }
    }

    const fs = getDirectFirestore();
    if (fs) {
      try {
        await setDoc(doc(fs, 'product_profiles', profile.id), profile, { merge: true });
      } catch (err) {
        console.warn('Firestore updateProductProfile warning:', err);
      }
    }

    // 3. Save to Global Thresholds (RTDB + Firestore)
    try {
      await saveProductThresholdToFirebase(profile.name, {
        productId: profile.id,
        productName: profile.name,
        tempMin: profile.temperature_min ?? 2.0,
        tempMax: profile.temperature_max ?? 6.0,
        humMin: profile.humidity_min ?? 50,
        humMax: profile.humidity_max ?? 70,
        mq135_threshold: profile.mq135_threshold ?? 1500,
        gasWarning:
          profile.mq135_threshold && profile.mq135_threshold < 600
            ? profile.mq135_threshold
            : 250,
      });
    } catch (e) {
      console.warn('saveProductThresholdToFirebase error in updateProductProfile:', e);
    }
  };

  const applyFirebaseConfig = (config: any) => {
    reinitializeFirebaseWithConfig(config);
  };

  const updateSettings = async (settings: UserSettings) => {
    setUserSettings(settings);
    const rtdb = getDirectDatabase();
    const uid = currentUser?.uid || getActiveLoginUid();
    if (rtdb && uid) {
      try {
        await dbUpdate(ref(rtdb, `userSettings/${uid}`), settings);
      } catch {}
    }
  };

  return (
    <AppContext.Provider
      value={{
        devicesMap,
        userScans,
        userRole,
        currentUser,
        userRecord,
        sensorHistory,
        productProfiles,
        alertsList,
        allUsersList,
        isLoading,
        authError,
        isFirebaseConnected,
        isDemoMode,
        setDemoMode,
        login,
        signup,
        resetPassword,
        logout,
        fetchDeviceById,
        addScanToHistory,
        updateDeviceData,
        updateProductProfile,
        applyFirebaseConfig,
        userSettings,
        updateSettings,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

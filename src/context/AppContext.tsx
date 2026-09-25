import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  Role, 
  DeviceData, 
  UserRecord, 
  UserScanItem, 
  SensorHistoryEntry, 
  ProductProfile, 
  SensorAlert,
  UserProfile,
  UserSettings
} from '../types';
import { auth, database, isFirebaseConfigured } from '../firebase/firebase';
import { parseTimestamp } from '../utils/dateUtils';

import { 
  ref, 
  onValue, 
  set as dbSet, 
  push as dbPush, 
  get as dbGet,
  update as dbUpdate 
} from 'firebase/database';

import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut as fbSignOut, 
  onAuthStateChanged,
  sendPasswordResetEmail
} from 'firebase/auth';

interface AppContextType {
  // Firebase Live State
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

  // Actions
  login: (email: string, password: string, intendedRole?: Role) => Promise<UserRecord>;
  signup: (email: string, password: string, name: string) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  logout: () => Promise<void>;

  // Device & Scan Actions
  fetchDeviceById: (deviceId: string) => Promise<DeviceData | null>;
  addScanToHistory: (deviceId: string, productName: string) => Promise<void>;
  updateDeviceData: (deviceId: string, data: Partial<DeviceData>) => Promise<void>;
  updateProductProfile: (profile: ProductProfile) => Promise<void>;
  
  // Custom Firebase Config Updater (In-App Helper)
  applyFirebaseConfig: (config: {
    apiKey: string;
    authDomain: string;
    databaseURL: string;
    projectId: string;
    storageBucket: string;
    messagingSenderId: string;
    appId: string;
  }) => void;

  // Utilities
  userSettings: UserSettings;
  updateSettings: (settings: UserSettings) => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// Initial default prototype devices
const PROTOTYPE_MILK: DeviceData = {
  device_id: 'YGS-FD-000124',
  product: 'Milk',
  temperature: 27.4,
  humidity: 61.2,
  mq135_raw: 1320,
  online: true,
  last_update: Date.now()
};

const PROTOTYPE_MEAT: DeviceData = {
  device_id: 'YGS-FD-112233',
  product: 'Meat',
  temperature: 3.5,
  humidity: 68.0,
  mq135_raw: 980,
  online: true,
  last_update: Date.now()
};

// Normalization helper for ESP32 hardware telemetry payloads from Realtime Database
function normalizeDeviceData(rawDevice: any, deviceId: string): DeviceData {
  if (!rawDevice || typeof rawDevice !== 'object') {
    return {
      device_id: deviceId,
      product: 'Milk',
      temperature: 4.2,
      humidity: 62.0,
      mq135_raw: 120,
      online: true,
      last_update: Date.now()
    };
  }

  let target = rawDevice;
  if (!('temperature' in rawDevice || 'temp' in rawDevice || 't' in rawDevice || 'humidity' in rawDevice || 'hum' in rawDevice || 'gas' in rawDevice || 'mq135_raw' in rawDevice)) {
    const keys = Object.keys(rawDevice);
    if (keys.length > 0) {
      const lastKey = keys[keys.length - 1];
      if (typeof rawDevice[lastKey] === 'object' && rawDevice[lastKey] !== null) {
        target = rawDevice[lastKey];
      }
    }
  }

  const temperature = Number(target.temperature ?? target.temp ?? target.t ?? 4.2);
  const humidity = Number(target.humidity ?? target.hum ?? target.h ?? 62.0);
  const mq135_raw = Number(target.mq135_raw ?? target.gas ?? target.gas_ppm ?? target.mq135 ?? target.mq2 ?? target.voc ?? 120);
  const rawTs = target.last_update ?? target.lastUpdated ?? target.last_updated ?? target.timestamp ?? target.time ?? target.last_seen ?? target.lastSeen ?? target.updated_at ?? target.updatedAt ?? target.date ?? target.dateTime ?? target.datetime;
  const last_update = parseTimestamp(rawTs);
  const online = target.online !== undefined ? Boolean(target.online) : (target.status ? target.status.toLowerCase() === 'online' : true);
  const product = target.product || target.name || 'Milk';

  return {
    ...rawDevice,
    device_id: rawDevice.device_id || rawDevice.id || deviceId,
    product,
    temperature: isNaN(temperature) ? 4.2 : +temperature.toFixed(1),
    humidity: isNaN(humidity) ? 62.0 : +humidity.toFixed(1),
    mq135_raw: isNaN(mq135_raw) ? 120 : Math.round(mq135_raw),
    online,
    last_update
  };
}

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isDemoMode, setDemoMode] = useState<boolean>(!isFirebaseConfigured);
  const [devicesMap, setDevicesMap] = useState<Record<string, DeviceData>>({
    'YGS-FD-000124': PROTOTYPE_MILK,
    'YGS-FD-112233': PROTOTYPE_MEAT,
  });
  const [userScans, setUserScans] = useState<UserScanItem[]>([
    {
      id: 'scan_default_1',
      device_id: 'YGS-FD-000124',
      product: 'Milk',
      scanned_at: Date.now() - 3600000
    }
  ]);
  const [userRole, setUserRole] = useState<Role>('user');
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [userRecord, setUserRecord] = useState<UserRecord | null>(null);
  const [sensorHistory, setSensorHistory] = useState<Record<string, SensorHistoryEntry[]>>({});
  const [productProfiles, setProductProfiles] = useState<ProductProfile[]>([
    { id: 'p_milk', name: 'Milk', temperature_min: 2.0, temperature_max: 6.0, humidity_min: 50, humidity_max: 70, mq135_threshold: 1500 },
    { id: 'p_meat', name: 'Meat', temperature_min: -2.0, temperature_max: 4.0, humidity_min: 60, humidity_max: 80, mq135_threshold: 1200 },
  ]);
  const [alertsList, setAlertsList] = useState<SensorAlert[]>([]);
  const [allUsersList, setAllUsersList] = useState<UserRecord[]>([]);

  const [userSettings, setUserSettings] = useState<UserSettings>({
    notificationsEnabled: true,
    tempUnit: 'C',
    alertSoundEnabled: true,
  });

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const [isFirebaseConnected, setIsFirebaseConnected] = useState<boolean>(false);

  // 1. Initial Prototype Seeding & Local Storage Fallback
  useEffect(() => {
    if (isDemoMode) {
      const storedDevices = localStorage.getItem('freshnex_devices_map');
      const storedScans = localStorage.getItem('freshnex_user_scans');
      const storedUser = localStorage.getItem('freshnex_current_user');
      const storedRole = localStorage.getItem('freshnex_user_role');

      if (storedDevices) {
        try {
          const parsed = JSON.parse(storedDevices);
          setDevicesMap(prev => ({ ...prev, ...parsed }));
        } catch (e) {}
      }
      if (storedScans) {
        try { setUserScans(JSON.parse(storedScans)); } catch (e) {}
      }
      if (storedUser) {
        try {
          const usr = JSON.parse(storedUser);
          setCurrentUser(usr);
          setUserRecord(usr);
        } catch (e) {}
      }
      if (storedRole) {
        setUserRole(storedRole as Role);
      }
      setIsLoading(false);
    }
  }, [isDemoMode]);

  // Sync to local storage in demo mode
  useEffect(() => {
    if (isDemoMode) {
      localStorage.setItem('freshnex_devices_map', JSON.stringify(devicesMap));
      localStorage.setItem('freshnex_user_scans', JSON.stringify(userScans));
      if (userRecord) localStorage.setItem('freshnex_current_user', JSON.stringify(userRecord));
      localStorage.setItem('freshnex_user_role', userRole);
    }
  }, [devicesMap, userScans, userRecord, userRole, isDemoMode]);

  // Telemetry simulation engine in Demo Mode for prototype testing
  useEffect(() => {
    let intervalId: any;
    if (isDemoMode) {
      intervalId = setInterval(() => {
        setDevicesMap(prev => {
          const updated = { ...prev };
          Object.keys(updated).forEach(devId => {
            const dev = updated[devId];
            if (dev.online) {
              const tempDelta = (Math.random() - 0.5) * 0.4;
              const humDelta = (Math.random() - 0.5) * 0.8;
              const gasDelta = Math.floor((Math.random() - 0.5) * 10);

              const newTemp = +(Math.max(0, Math.min(45, dev.temperature + tempDelta))).toFixed(1);
              const newHum = +(Math.max(10, Math.min(100, dev.humidity + humDelta))).toFixed(1);
              const newGas = Math.max(200, Math.min(5000, dev.mq135_raw + gasDelta));

              updated[devId] = {
                ...dev,
                temperature: newTemp,
                humidity: newHum,
                mq135_raw: newGas,
                last_update: Date.now()
              };

              // Push to local history state
              setSensorHistory(hPrev => {
                const devHist = hPrev[devId] || [];
                const newEntry: SensorHistoryEntry = {
                  id: `h_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
                  timestamp: Date.now(),
                  temperature: newTemp,
                  humidity: newHum,
                  mq135_raw: newGas
                };
                return {
                  ...hPrev,
                  [devId]: [newEntry, ...devHist].slice(0, 50)
                };
              });
            }
          });
          return updated;
        });
      }, 5000);
    }
    return () => clearInterval(intervalId);
  }, [isDemoMode]);

  // 2. Real Firebase Realtime Database Synchronization
  useEffect(() => {
    if (!isFirebaseConfigured || isDemoMode || !auth || !database) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    // Timeout safety: if Firebase takes too long to respond, fall back to avoid blocking UI
    const safetyTimeout = setTimeout(() => {
      setIsLoading(false);
    }, 2500);

    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      clearTimeout(safetyTimeout);
      setCurrentUser(user);
      if (user) {
        setIsFirebaseConnected(true);

        // Fetch user record & role from users/{uid}
        const userRef = ref(database, `users/${user.uid}`);
        onValue(userRef, (snapshot) => {
          if (snapshot.exists()) {
            const val = snapshot.val();
            const rec: UserRecord = {
              uid: user.uid,
              name: val.name || user.displayName || 'FreshNex User',
              email: val.email || user.email || '',
              role: (val.role === 'admin' ? 'admin' : 'user') as Role,
              createdAt: val.createdAt || Date.now()
            };
            setUserRecord(rec);
            setUserRole(rec.role);
          } else {
            // First time login - default to 'user' role
            const defaultRec: UserRecord = {
              uid: user.uid,
              name: user.displayName || user.email?.split('@')[0] || 'User',
              email: user.email || '',
              role: 'user',
              createdAt: Date.now()
            };
            dbSet(userRef, defaultRec);
            setUserRecord(defaultRec);
            setUserRole('user');
          }
        });

        // Listen to Devices in devices/
        const devicesRef = ref(database, 'devices');
        onValue(devicesRef, (snapshot) => {
          if (snapshot.exists()) {
            const rawData = snapshot.val();
            const normalizedMap: Record<string, DeviceData> = {};
            if (rawData && typeof rawData === 'object') {
              Object.keys(rawData).forEach(devId => {
                normalizedMap[devId] = normalizeDeviceData(rawData[devId], devId);
              });
            }
            setDevicesMap(normalizedMap);
          } else {
            // Seed prototype device YGS-FD-000124 in Firebase RTDB if missing
            dbSet(ref(database, 'devices/YGS-FD-000124'), PROTOTYPE_MILK);
            setDevicesMap({ 'YGS-FD-000124': PROTOTYPE_MILK, 'YGS-FD-112233': PROTOTYPE_MEAT });
          }
        });

        // Listen to user scans in userScans/{uid}
        const scansRef = ref(database, `userScans/${user.uid}`);
        onValue(scansRef, (snapshot) => {
          if (snapshot.exists()) {
            const data = snapshot.val();
            const list: UserScanItem[] = Object.keys(data).map(k => ({
              id: k,
              ...data[k]
            }));
            list.sort((a, b) => b.scanned_at - a.scanned_at);
            setUserScans(list);
          } else {
            setUserScans([]);
          }
        });

        // Listen to sensor history in history/
        const historyRef = ref(database, 'history');
        onValue(historyRef, (snapshot) => {
          if (snapshot.exists()) {
            const data = snapshot.val();
            const parsed: Record<string, SensorHistoryEntry[]> = {};
            Object.keys(data).forEach(devId => {
              const entriesObj = data[devId];
              const list: SensorHistoryEntry[] = Object.keys(entriesObj).map(ek => ({
                id: ek,
                ...entriesObj[ek]
              }));
              list.sort((a, b) => b.timestamp - a.timestamp);
              parsed[devId] = list;
            });
            setSensorHistory(parsed);
          }
        });

        // Listen to productProfiles/
        const profilesRef = ref(database, 'productProfiles');
        onValue(profilesRef, (snapshot) => {
          if (snapshot.exists()) {
            const data = snapshot.val();
            const list: ProductProfile[] = Object.keys(data).map(k => ({
              id: k,
              ...data[k]
            }));
            setProductProfiles(list);
          }
        });

        // Listen to alerts/
        const alertsRef = ref(database, 'alerts');
        onValue(alertsRef, (snapshot) => {
          if (snapshot.exists()) {
            const data = snapshot.val();
            const list: SensorAlert[] = Object.keys(data).map(k => ({
              id: k,
              ...data[k]
            }));
            list.sort((a, b) => b.timestamp - a.timestamp);
            setAlertsList(list);
          } else {
            setAlertsList([]);
          }
        });

        // Listen to all users list (for Admin)
        const allUsersRef = ref(database, 'users');
        onValue(allUsersRef, (snapshot) => {
          if (snapshot.exists()) {
            const data = snapshot.val();
            const list: UserRecord[] = Object.keys(data).map(uidKey => ({
              uid: uidKey,
              name: data[uidKey].name || 'User',
              email: data[uidKey].email || '',
              role: data[uidKey].role || 'user',
              createdAt: data[uidKey].createdAt || Date.now()
            }));
            setAllUsersList(list);
          }
        });

      } else {
        setIsFirebaseConnected(false);
        setUserRecord(null);
        setUserRole('user');
        setUserScans([]);
      }
      setIsLoading(false);
    }, (err) => {
      console.error("Firebase auth error:", err);
      clearTimeout(safetyTimeout);
      setIsLoading(false);
    });

    return () => {
      clearTimeout(safetyTimeout);
      unsubscribeAuth();
    };
  }, [isDemoMode]);

  // Auth Functions
  const login = async (email: string, password: string, intendedRole?: Role): Promise<UserRecord> => {
    setAuthError(null);

    try {
      const res = await signInWithEmailAndPassword(auth, email, password);
      const user = res.user;

      // Fetch user role from users/{uid}
      const userRef = ref(database, `users/${user.uid}`);
      const snapshot = await dbGet(userRef);
      let record: UserRecord;

      if (snapshot.exists()) {
        const val = snapshot.val();
        record = {
          uid: user.uid,
          name: val.name || user.displayName || 'User',
          email: val.email || user.email || '',
          role: (val.role === 'admin' ? 'admin' : 'user') as Role,
          createdAt: val.createdAt || Date.now()
        };
      } else {
        record = {
          uid: user.uid,
          name: user.displayName || user.email?.split('@')[0] || 'User',
          email: user.email || '',
          role: 'user',
          createdAt: Date.now()
        };
        await dbSet(userRef, record);
      }

      setUserRecord(record);
      setUserRole(record.role);

      // Validate intended admin role login
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

    try {
      const res = await createUserWithEmailAndPassword(auth, email, password);
      const user = res.user;
      const newRecord: UserRecord = {
        uid: user.uid,
        name,
        email,
        role: 'user', // Always register normal users as 'user' role
        createdAt: Date.now()
      };

      await dbSet(ref(database, `users/${user.uid}`), newRecord);
      setUserRecord(newRecord);
      setUserRole('user');
    } catch (err: any) {
      setAuthError(err.message || 'Registration failed.');
      throw err;
    }
  };

  const resetPassword = async (email: string) => {
    setAuthError(null);
    if (isDemoMode) {
      return;
    }
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (err: any) {
      setAuthError(err.message || 'Failed to send password reset email.');
      throw err;
    }
  };

  const logout = async () => {
    if (isDemoMode) {
      setCurrentUser(null);
      setUserRecord(null);
      setUserRole('user');
      localStorage.removeItem('freshnex_current_user');
      localStorage.removeItem('freshnex_user_role');
      return;
    }
    try {
      await fbSignOut(auth);
      setCurrentUser(null);
      setUserRecord(null);
      setUserRole('user');
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  // Device & Scan Operations
  const fetchDeviceById = async (deviceId: string): Promise<DeviceData | null> => {
    // Check current state map first
    if (devicesMap[deviceId]) {
      return devicesMap[deviceId];
    }

    // Prototype Device lookup guarantee
    const cleanUpper = deviceId.toUpperCase();
    if (cleanUpper === 'YGS-FD-000124' || cleanUpper.includes('000124') || cleanUpper.includes('MILK')) {
      return PROTOTYPE_MILK;
    }
    if (cleanUpper === 'YGS-FD-112233' || cleanUpper.includes('112233') || cleanUpper.includes('MEAT')) {
      return PROTOTYPE_MEAT;
    }

    if (!isFirebaseConfigured || isDemoMode) {
      return null;
    }

    try {
      const snapshot = await dbGet(ref(database, `devices/${deviceId}`));
      if (snapshot.exists()) {
        return snapshot.val() as DeviceData;
      }
      return null;
    } catch (e) {
      console.error("Error querying Firebase device:", e);
      return null;
    }
  };

  const addScanToHistory = async (deviceId: string, productName: string) => {
    const scanItem: Omit<UserScanItem, 'id'> = {
      device_id: deviceId,
      product: productName,
      scanned_at: Date.now()
    };

    if (isDemoMode) {
      const newScan: UserScanItem = {
        id: `scan_${Date.now()}`,
        ...scanItem
      };
      setUserScans(prev => [newScan, ...prev.filter(s => s.device_id !== deviceId)]);
      return;
    }

    if (currentUser) {
      const scansRef = ref(database, `userScans/${currentUser.uid}`);
      const newPush = dbPush(scansRef);
      await dbSet(newPush, scanItem);
    }
  };

  const updateDeviceData = async (deviceId: string, data: Partial<DeviceData>) => {
    if (isDemoMode) {
      setDevicesMap(prev => {
        const existing = prev[deviceId] || {
          device_id: deviceId,
          product: 'Unknown Product',
          temperature: 25.0,
          humidity: 60.0,
          mq135_raw: 1200,
          online: true,
          last_update: Date.now()
        };
        return {
          ...prev,
          [deviceId]: { ...existing, ...data, last_update: Date.now() }
        };
      });
      return;
    }

    const deviceRef = ref(database, `devices/${deviceId}`);
    await dbUpdate(deviceRef, { ...data, last_update: Date.now() });
  };

  const updateProductProfile = async (profile: ProductProfile) => {
    if (isDemoMode) {
      setProductProfiles(prev => prev.map(p => p.id === profile.id ? profile : p));
      return;
    }

    await dbSet(ref(database, `productProfiles/${profile.id}`), profile);
  };

  const applyFirebaseConfig = (config: any) => {
    localStorage.setItem('freshnex_custom_firebase', JSON.stringify(config));
    localStorage.setItem('freshnex_firebase_config', JSON.stringify(config));
    window.location.reload();
  };

  const updateSettings = async (settings: UserSettings) => {
    setUserSettings(settings);
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
        updateSettings
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

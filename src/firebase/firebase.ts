import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, setPersistence, browserLocalPersistence, Auth } from 'firebase/auth';
import { getDatabase, Database } from 'firebase/database';
import { getFirestore, Firestore, doc, getDocFromServer } from 'firebase/firestore';
import appletConfig from '../../firebase-applet-config.json';

export const DEFAULT_REALTIME_DATABASE_URL = 'https://freshnex-9bf3f-default-rtdb.firebaseio.com';

const metaEnv = (import.meta as any).env || {};

export interface FreshNexFirebaseCredentials {
  apiKey: string;
  authDomain: string;
  databaseURL: string;
  projectId: string;
  firestoreDatabaseId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
}

export function getActiveLoginUid(): string {
  if (typeof window === 'undefined') return '';
  try {
    const profileStr = localStorage.getItem('freshnex_profile');
    if (profileStr) {
      const parsed = JSON.parse(profileStr);
      if (parsed && parsed.uid) return String(parsed.uid);
    }
  } catch {
    // ignore
  }
  return '';
}

export function getActiveFirebaseConfig(uid?: string): FreshNexFirebaseCredentials {
  const targetUid = uid || getActiveLoginUid();
  let savedConfig: Partial<FreshNexFirebaseCredentials> = {};

  if (typeof window !== 'undefined') {
    const perUserStr = targetUid ? localStorage.getItem(`freshnex_firebase_config_${targetUid}`) : null;
    const globalStr =
      perUserStr ||
      localStorage.getItem('freshnex_custom_firebase') ||
      localStorage.getItem('freshnex_firebase_config');

    if (globalStr) {
      try {
        savedConfig = JSON.parse(globalStr);
      } catch (e) {
        console.warn('Failed to parse saved Firebase config from localStorage:', e);
      }
    }
  }

  const projectId =
    savedConfig.projectId ||
    metaEnv.VITE_FIREBASE_PROJECT_ID ||
    appletConfig?.projectId ||
    'freshnex-9bf3f';

  return {
    apiKey: savedConfig.apiKey || metaEnv.VITE_FIREBASE_API_KEY || appletConfig?.apiKey || '',
    authDomain:
      savedConfig.authDomain ||
      metaEnv.VITE_FIREBASE_AUTH_DOMAIN ||
      appletConfig?.authDomain ||
      `${projectId}.firebaseapp.com`,
    databaseURL:
      savedConfig.databaseURL ||
      metaEnv.VITE_FIREBASE_DATABASE_URL ||
      (appletConfig as any)?.databaseURL ||
      DEFAULT_REALTIME_DATABASE_URL,
    projectId,
    firestoreDatabaseId:
      savedConfig.firestoreDatabaseId ||
      metaEnv.VITE_FIREBASE_FIRESTORE_DATABASE_ID ||
      appletConfig?.firestoreDatabaseId ||
      '',
    storageBucket:
      savedConfig.storageBucket ||
      metaEnv.VITE_FIREBASE_STORAGE_BUCKET ||
      appletConfig?.storageBucket ||
      `${projectId}.firebasestorage.app`,
    messagingSenderId:
      savedConfig.messagingSenderId ||
      metaEnv.VITE_FIREBASE_MESSAGING_SENDER_ID ||
      appletConfig?.messagingSenderId ||
      '',
    appId: savedConfig.appId || metaEnv.VITE_FIREBASE_APP_ID || appletConfig?.appId || '',
  };
}

export const firebaseConfig: FreshNexFirebaseCredentials = getActiveFirebaseConfig();

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let database: Database | null = null;
let db: Firestore | null = null;

function initFirebaseServices(config: FreshNexFirebaseCredentials, appName?: string) {
  if (!config.apiKey) return;
  try {
    if (!config.projectId && config.databaseURL) {
      const match = config.databaseURL.match(/https?:\/\/([^.]+)/);
      if (match && match[1]) {
        config.projectId = match[1].replace('-default-rtdb', '');
      }
    }

    if (appName) {
      const existing = getApps().find((a) => a.name === appName);
      app = existing || initializeApp(config, appName);
    } else {
      app = getApps().length === 0 ? initializeApp(config) : getApp();
    }

    auth = getAuth(app);
    try {
      setPersistence(auth, browserLocalPersistence).catch(() => {});
    } catch {
      // Ignore if unsupported
    }

    const dbUrl = config.databaseURL || DEFAULT_REALTIME_DATABASE_URL;
    if (dbUrl) {
      database = getDatabase(app, dbUrl);
    }

    if (config.firestoreDatabaseId) {
      db = getFirestore(app, config.firestoreDatabaseId);
    } else {
      db = getFirestore(app);
    }
  } catch (error) {
    console.warn('Firebase initialization warning:', error);
  }
}

initFirebaseServices(firebaseConfig);

// Validate connection to Firestore on startup
async function testConnection() {
  if (!db) return;
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error('Please check your Firebase configuration.');
    }
  }
}
testConnection();

export function getActiveDatabase(): Database | null {
  if (database) return database;
  const activeCfg = getActiveFirebaseConfig();
  initFirebaseServices(activeCfg);
  return database;
}

export function getActiveFirestore(): Firestore | null {
  if (db) return db;
  const activeCfg = getActiveFirebaseConfig();
  initFirebaseServices(activeCfg);
  return db;
}

export function reinitializeFirebaseWithConfig(
  newConfig: Partial<FreshNexFirebaseCredentials>,
  uid?: string
): FreshNexFirebaseCredentials {
  const targetUid = uid || getActiveLoginUid();
  const merged: FreshNexFirebaseCredentials = {
    ...getActiveFirebaseConfig(targetUid),
    ...newConfig,
    databaseURL: (newConfig.databaseURL || firebaseConfig.databaseURL || DEFAULT_REALTIME_DATABASE_URL).trim(),
    apiKey: (newConfig.apiKey || firebaseConfig.apiKey).trim(),
    projectId: (newConfig.projectId || firebaseConfig.projectId || 'freshnex-9bf3f').trim(),
  };

  if (typeof window !== 'undefined') {
    if (targetUid) {
      localStorage.setItem(`freshnex_firebase_config_${targetUid}`, JSON.stringify(merged));
    }
    localStorage.setItem('freshnex_custom_firebase', JSON.stringify(merged));
    localStorage.setItem('freshnex_firebase_config', JSON.stringify(merged));
  }

  Object.assign(firebaseConfig, merged);

  const isCustomApp =
    merged.projectId !== appletConfig?.projectId ||
    merged.apiKey !== appletConfig?.apiKey ||
    merged.databaseURL !== DEFAULT_REALTIME_DATABASE_URL;

  initFirebaseServices(merged, isCustomApp ? `freshnex_${merged.projectId}_${Date.now()}` : undefined);

  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent('freshnex_firebase_config_updated', {
        detail: { config: merged, uid: targetUid },
      })
    );
  }

  return merged;
}

export function resetFirebaseConfigToDefault(uid?: string): FreshNexFirebaseCredentials {
  const targetUid = uid || getActiveLoginUid();
  if (typeof window !== 'undefined') {
    if (targetUid) {
      localStorage.removeItem(`freshnex_firebase_config_${targetUid}`);
    }
    localStorage.removeItem('freshnex_custom_firebase');
    localStorage.removeItem('freshnex_firebase_config');
  }
  const defaults = getActiveFirebaseConfig(targetUid);
  Object.assign(firebaseConfig, defaults);
  initFirebaseServices(defaults);

  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent('freshnex_firebase_config_updated', {
        detail: { config: defaults, uid: targetUid },
      })
    );
  }
  return defaults;
}

// Check if credentials are set and services are initialized
export const isFirebaseConfigured = !!(app && (database || db));

export { app, auth, database, db, db as firestore };

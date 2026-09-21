import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, setPersistence, browserLocalPersistence } from 'firebase/auth';
import { getDatabase } from 'firebase/database';
import { getFirestore, Firestore } from 'firebase/firestore';
import appletConfig from '../../firebase-applet-config.json';

// Load config from environment variables or saved localStorage or applet config
const metaEnv = (import.meta as any).env || {};

const savedConfigStr = typeof window !== 'undefined' 
  ? (localStorage.getItem('freshnex_custom_firebase') || localStorage.getItem('freshnex_firebase_config'))
  : null;
let savedConfig: any = {};
if (savedConfigStr) {
  try {
    savedConfig = JSON.parse(savedConfigStr);
  } catch (e) {
    console.warn('Failed to parse saved Firebase config from localStorage:', e);
  }
}

export const firebaseConfig = {
  apiKey: savedConfig.apiKey || metaEnv.VITE_FIREBASE_API_KEY || appletConfig?.apiKey || 'AIzaSyCyM0wApLbwJ-W5uZajMfHqrEK1CgD53Wk',
  authDomain: savedConfig.authDomain || metaEnv.VITE_FIREBASE_AUTH_DOMAIN || appletConfig?.authDomain || 'freshnex-9bf3f.firebaseapp.com',
  databaseURL: savedConfig.databaseURL || metaEnv.VITE_FIREBASE_DATABASE_URL || 'https://freshnex-9bf3f-default-rtdb.firebaseio.com',
  projectId: savedConfig.projectId || metaEnv.VITE_FIREBASE_PROJECT_ID || appletConfig?.projectId || 'freshnex-9bf3f',
  firestoreDatabaseId: savedConfig.firestoreDatabaseId || appletConfig?.firestoreDatabaseId || 'ai-studio-freshnex-49eab42e-b36e-4f53-a64b-4f4bda5f7eec',
  storageBucket: savedConfig.storageBucket || metaEnv.VITE_FIREBASE_STORAGE_BUCKET || appletConfig?.storageBucket || 'freshnex-9bf3f.firebasestorage.app',
  messagingSenderId: savedConfig.messagingSenderId || metaEnv.VITE_FIREBASE_MESSAGING_SENDER_ID || appletConfig?.messagingSenderId || '80795813209',
  appId: savedConfig.appId || metaEnv.VITE_FIREBASE_APP_ID || appletConfig?.appId || '1:80795813209:web:b04802890968f9941db848'
};

let app: any = null;
let auth: ReturnType<typeof getAuth> | null = null;
let database: ReturnType<typeof getDatabase> | null = null;
let db: Firestore | null = null;

if (firebaseConfig.apiKey) {
  try {
    // If projectId is not set, derive from databaseURL if possible
    if (!firebaseConfig.projectId && firebaseConfig.databaseURL) {
      const match = firebaseConfig.databaseURL.match(/https?:\/\/([^.]+)/);
      if (match && match[1]) {
        firebaseConfig.projectId = match[1].replace('-default-rtdb', '');
      }
    }

    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
    auth = getAuth(app);
    try {
      setPersistence(auth, browserLocalPersistence).catch((pErr) => {
        console.warn('Firebase persistence setup warning:', pErr);
      });
    } catch {
      // Ignore if unsupported
    }
    if (firebaseConfig.databaseURL) {
      database = getDatabase(app, firebaseConfig.databaseURL);
    }
    if (firebaseConfig.firestoreDatabaseId) {
      db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
    } else {
      db = getFirestore(app);
    }
  } catch (error) {
    console.warn('Firebase initialization failed:', error);
  }
}

// Check if credentials are set and services are initialized
export const isFirebaseConfigured = !!(app && (database || db));

export { app, auth, database, db, db as firestore };



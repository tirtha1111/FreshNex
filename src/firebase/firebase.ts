import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getDatabase } from 'firebase/database';
import appletConfig from '../../firebase-applet-config.json';

// Load config from environment variables or saved localStorage or applet config
const metaEnv = (import.meta as any).env || {};

const savedConfigStr = typeof window !== 'undefined' ? localStorage.getItem('freshnex_firebase_config') : null;
let savedConfig: any = {};
if (savedConfigStr) {
  try {
    savedConfig = JSON.parse(savedConfigStr);
  } catch (e) {
    console.warn('Failed to parse saved Firebase config from localStorage:', e);
  }
}

export const firebaseConfig = {
  apiKey: metaEnv.VITE_FIREBASE_API_KEY || savedConfig.apiKey || appletConfig?.apiKey || 'AIzaSyCyM0wApLbwJ-W5uZajMfHqrEK1CgD53Wk',
  authDomain: metaEnv.VITE_FIREBASE_AUTH_DOMAIN || savedConfig.authDomain || appletConfig?.authDomain || 'freshnex-9bf3f.firebaseapp.com',
  databaseURL: metaEnv.VITE_FIREBASE_DATABASE_URL || savedConfig.databaseURL || 'https://freshnex-9bf3f-default-rtdb.firebaseio.com',
  projectId: metaEnv.VITE_FIREBASE_PROJECT_ID || savedConfig.projectId || appletConfig?.projectId || 'freshnex-9bf3f',
  storageBucket: metaEnv.VITE_FIREBASE_STORAGE_BUCKET || savedConfig.storageBucket || appletConfig?.storageBucket || 'freshnex-9bf3f.firebasestorage.app',
  messagingSenderId: metaEnv.VITE_FIREBASE_MESSAGING_SENDER_ID || savedConfig.messagingSenderId || appletConfig?.messagingSenderId || '80795813209',
  appId: metaEnv.VITE_FIREBASE_APP_ID || savedConfig.appId || appletConfig?.appId || '1:80795813209:web:b04802890968f9941db848'
};

// Check if credentials are set
export const isFirebaseConfigured = !!(firebaseConfig.apiKey && firebaseConfig.databaseURL && firebaseConfig.projectId);

let app: any = null;
let auth: ReturnType<typeof getAuth> | null = null;
let database: ReturnType<typeof getDatabase> | null = null;

if (isFirebaseConfigured) {
  try {
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
    auth = getAuth(app);
    database = getDatabase(app, firebaseConfig.databaseURL);
  } catch (error) {
    console.error('Firebase initialization failed:', error);
  }
}

export { app, auth, database };


import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  User,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  onAuthStateChanged,
  updateProfile,
} from 'firebase/auth';
import { ref, set as dbSet, update as dbUpdate, onValue, off } from 'firebase/database';
import { doc, setDoc } from 'firebase/firestore';
import {
  auth,
  isFirebaseConfigured,
  getActiveFirebaseConfig,
  reinitializeFirebaseWithConfig,
  ensureFirebaseAuthenticated,
} from '../firebase/firebase';
import { getDirectDatabase, getDirectFirestore } from '../services/firebaseService';
import { UserProfile, UserSettings } from '../types';
import { resolveFactualProduct } from '../data/initialData';

export interface WarehouseSession {
  token: string;
  warehouseId: string;
  warehouseName?: string;
  location?: string;
  scannerDevice?: string;
  permittedDevices?: string[];
  authenticatedAt: number;
  selectedDeviceId?: string;
  selectedTagUid?: string;
}

interface AuthContextType {
  currentUser: User | null;
  userProfile: UserProfile;
  userSettings: UserSettings;
  warehouseSession: WarehouseSession | null;
  isLoading: boolean;
  isDemoMode: boolean;
  authError: string | null;
  login: (email: string, pass: string) => Promise<void>;
  loginWithProductId: (productId: string) => Promise<void>;
  loginWarehouse: (warehouseId: string, pass: string) => Promise<WarehouseSession>;
  setWarehouseSelectedDevice: (deviceId: string, tagUid?: string) => void;
  logoutWarehouse: () => Promise<void>;
  signup: (name: string, email: string, pass: string) => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateUserProfile: (updates: Partial<UserProfile>) => void;
  updateUserSettings: (updates: Partial<UserSettings>) => void;
  setDemoMode: (enabled: boolean) => void;
  clearAuthError: () => void;
}

const DEFAULT_PROFILE: UserProfile = {
  uid: '',
  name: '',
  email: '',
  role: 'user',
  memberSince: '',
  organization: '',
};

const DEFAULT_SETTINGS: UserSettings = {
  emailNotifications: true,
  scanAlerts: true,
  systemUpdates: false,
  theme: 'Dark',
  language: 'English',
  notificationsEnabled: true,
  tempUnit: 'C',
  alertSoundEnabled: true,
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

async function syncProfileToFirebase(profile: UserProfile) {
  if (!profile.uid) return;
  const rtdb = getDirectDatabase();
  if (rtdb) {
    try {
      await dbUpdate(ref(rtdb, `users/${profile.uid}`), {
        ...profile,
        updatedAt: Date.now(),
      });
    } catch (e) {
      console.warn('RTDB profile sync warning:', e);
    }
  }
  const fs = getDirectFirestore();
  if (fs) {
    try {
      await setDoc(
        doc(fs, 'users', profile.uid),
        {
          ...profile,
          updatedAt: Date.now(),
        },
        { merge: true }
      );
    } catch (e) {
      console.warn('Firestore profile sync warning:', e);
    }
  }
}

async function syncSettingsToFirebase(uid: string, settings: UserSettings) {
  if (!uid) return;
  const rtdb = getDirectDatabase();
  if (rtdb) {
    try {
      await dbSet(ref(rtdb, `userSettings/${uid}`), {
        ...settings,
        updatedAt: Date.now(),
      });
    } catch (e) {
      console.warn('RTDB userSettings sync warning:', e);
    }
  }
  const fs = getDirectFirestore();
  if (fs) {
    try {
      await setDoc(
        doc(fs, 'users', uid),
        {
          settings,
          updatedAt: Date.now(),
        },
        { merge: true }
      );
    } catch (e) {
      console.warn('Firestore userSettings sync warning:', e);
    }
  }
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    try {
      const storedProfile = localStorage.getItem('freshnex_profile');
      if (storedProfile) {
        const parsed = JSON.parse(storedProfile);
        // Never restore fake mock admin sessions; admin must be authenticated via Firebase Auth
        if (parsed && parsed.uid && parsed.uid !== 'admin_realtirtharaj_101' && parsed.role !== 'admin') {
          return {
            uid: parsed.uid,
            email: parsed.email || '',
            displayName: parsed.name || '',
          } as any;
        }
      }
    } catch (e) {
      console.warn('Error reading stored user profile', e);
    }
    return null;
  });

  const [isDemoMode, setIsDemoMode] = useState<boolean>(() => {
    try {
      const storedProfile = localStorage.getItem('freshnex_profile');
      if (storedProfile) {
        const parsed = JSON.parse(storedProfile);
        if (parsed?.role === 'admin' || parsed?.uid === 'admin_realtirtharaj_101') {
          localStorage.removeItem('freshnex_demo_user');
          return false;
        }
      }
    } catch {
      // ignore
    }
    return localStorage.getItem('freshnex_demo_user') === 'true';
  });

  const [warehouseSession, setWarehouseSession] = useState<WarehouseSession | null>(() => {
    try {
      const stored =
        sessionStorage.getItem('freshnex_warehouse_session') ||
        localStorage.getItem('freshnex_warehouse_session');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && parsed.warehouseId && parsed.token) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Error reading warehouse session', e);
    }
    return null;
  });

  const [userProfile, setUserProfile] = useState<UserProfile>(() => {
    try {
      const stored = localStorage.getItem('freshnex_profile');
      if (stored) {
        const parsed: UserProfile = JSON.parse(stored);
        if (parsed.uid === 'admin_realtirtharaj_101') {
          localStorage.removeItem('freshnex_profile');
          localStorage.removeItem('freshnex_demo_user');
          return DEFAULT_PROFILE;
        }
        if (parsed.role === 'user' && parsed.assignedProductId) {
          const factual = resolveFactualProduct(parsed.assignedProductId);
          const rawId = parsed.assignedProductId.trim().toUpperCase().replace(/^#/, '');
          const normalizedDeviceId =
            rawId === '124' || rawId === 'MILK' || rawId === 'YGS-FD-124' || rawId.includes('124')
              ? 'YGS-FD-124'
              : rawId === '001' || rawId === 'APPLE' || rawId === 'YGS-FD-001' || rawId.includes('001')
              ? 'YGS-FD-001'
              : rawId;
          parsed.assignedProductId = normalizedDeviceId;
          parsed.assignedProductName = factual.name;
          parsed.name = `${factual.name} Access`;
        }
        return parsed;
      }
    } catch (e) {
      console.warn(e);
    }
    return DEFAULT_PROFILE;
  });

  const [userSettings, setUserSettings] = useState<UserSettings>(() => {
    try {
      const stored = localStorage.getItem('freshnex_settings');
      if (stored) return { ...DEFAULT_SETTINGS, ...JSON.parse(stored) };
    } catch (e) {
      console.warn(e);
    }
    return DEFAULT_SETTINGS;
  });

  const [isLoading, setIsLoading] = useState<boolean>(() => {
    return !!auth;
  });
  const [authError, setAuthError] = useState<string | null>(null);

  // Sync per-login Firebase config and subscribe to live user settings in Firebase
  useEffect(() => {
    const activeUid = userProfile?.uid || currentUser?.uid;
    if (!activeUid) return;

    // Only reinitialize if a custom per-user Firebase config exists and differs from active config
    const customPerUserCfg =
      typeof window !== 'undefined' ? localStorage.getItem(`freshnex_firebase_config_${activeUid}`) : null;
    if (customPerUserCfg) {
      const loginCfg = getActiveFirebaseConfig(activeUid);
      reinitializeFirebaseWithConfig(loginCfg, activeUid);
    }

    // Sync profile to Firebase outside of render phase
    if (userProfile?.uid) {
      syncProfileToFirebase(userProfile);
    }

    const rtdb = getDirectDatabase();
    if (!rtdb) return;

    const settingsRef = ref(rtdb, `userSettings/${activeUid}`);
    const handleSettingsVal = (snapshot: any) => {
      if (snapshot.exists()) {
        const val = snapshot.val();
        if (val && typeof val === 'object') {
          setUserSettings((prev) => {
            const merged = { ...prev, ...val };
            try {
              localStorage.setItem('freshnex_settings', JSON.stringify(merged));
            } catch {}
            return merged;
          });
        }
      } else {
        // Seed initial settings for this login in Firebase
        syncSettingsToFirebase(activeUid, userSettings);
      }
    };

    onValue(settingsRef, handleSettingsVal, (err) => {
      if (!err?.message?.includes('PERMISSION_DENIED')) {
        console.warn('userSettings RTDB notice:', err?.message || err);
      }
    });
    return () => {
      off(settingsRef, 'value', handleSettingsVal);
    };
  }, [userProfile?.uid, currentUser?.uid]);

  // Sync auth state
  useEffect(() => {
    const storedProfileStr = localStorage.getItem('freshnex_profile');
    let parsedStored: any = null;
    if (storedProfileStr) {
      try {
        parsedStored = JSON.parse(storedProfileStr);
      } catch (e) {
        console.warn('Failed to parse profile:', e);
      }
    }

    if (!isFirebaseConfigured || !auth) {
      if (parsedStored && parsedStored.uid && parsedStored.role === 'user') {
        setCurrentUser({
          uid: parsedStored.uid,
          email: parsedStored.email || '',
          displayName: parsedStored.name || '',
        } as any);
        setUserProfile(parsedStored);
      } else {
        setCurrentUser(null);
        setUserProfile(DEFAULT_PROFILE);
      }
      setIsLoading(false);
      return;
    }

    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1200);

    const unsubscribe = onAuthStateChanged(
      auth,
      (user) => {
        clearTimeout(timer);
        if (user && !user.isAnonymous) {
          setCurrentUser(user);
          setIsDemoMode(false);
          localStorage.removeItem('freshnex_demo_user');
          setUserProfile((prev) => {
            const updated: UserProfile = {
              ...prev,
              uid: user.uid,
              email: user.email || prev.email || '',
              name:
                user.displayName ||
                (user.email?.toLowerCase() === 'realtirtharaj@gmail.com'
                  ? 'Tirtharaj (System Admin)'
                  : prev.name || user.email?.split('@')[0] || 'Administrator'),
              role: 'admin',
              memberSince:
                prev.memberSince ||
                new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
              organization: prev.organization || 'FreshNex Operations',
            };
            try {
              localStorage.setItem('freshnex_profile', JSON.stringify(updated));
            } catch {}
            return updated;
          });
        } else {
          const currentStored = localStorage.getItem('freshnex_profile');
          if (currentStored) {
            try {
              const p = JSON.parse(currentStored);
              // Only restore Device ID consumer sessions when Firebase Auth user is null or anonymous.
              // Admin sessions MUST have an active non-anonymous Firebase Auth user.
              if (p && p.uid && p.role === 'user' && p.uid !== 'admin_realtirtharaj_101') {
                setCurrentUser({
                  uid: p.uid,
                  email: p.email || '',
                  displayName: p.name || '',
                } as any);
                setUserProfile(p);
              } else {
                localStorage.removeItem('freshnex_profile');
                localStorage.removeItem('freshnex_demo_user');
                setIsDemoMode(false);
                setCurrentUser(null);
                setUserProfile(DEFAULT_PROFILE);
              }
            } catch {
              setCurrentUser(null);
              setUserProfile(DEFAULT_PROFILE);
            }
          } else {
            setCurrentUser(null);
            setUserProfile(DEFAULT_PROFILE);
          }
        }
        setIsLoading(false);
      },
      (err) => {
        console.warn('Auth observer error:', err);
        clearTimeout(timer);
        setIsLoading(false);
      }
    );

    return () => {
      clearTimeout(timer);
      unsubscribe();
    };
  }, []);

  const login = async (email: string, pass: string) => {
    setAuthError(null);
    setIsLoading(true);

    const cleanEmail = email.trim();

    if (!auth) {
      setIsLoading(false);
      const msg = 'Firebase Authentication is not initialized. Please check your Firebase configuration.';
      setAuthError(msg);
      throw new Error(msg);
    }

    try {
      const userCred = await signInWithEmailAndPassword(auth, cleanEmail, pass);
      setCurrentUser(userCred.user);
      setIsDemoMode(false);
      localStorage.removeItem('freshnex_demo_user');

      const isTirtharaj = cleanEmail.toLowerCase() === 'realtirtharaj@gmail.com';
      const profileData: UserProfile = {
        uid: userCred.user.uid,
        email: userCred.user.email || cleanEmail,
        name: isTirtharaj
          ? 'Tirtharaj (System Admin)'
          : userCred.user.displayName || userCred.user.email?.split('@')[0] || 'Administrator',
        role: 'admin',
        memberSince: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
        organization: 'FreshNex Network',
      };
      setUserProfile(profileData);
      localStorage.setItem('freshnex_profile', JSON.stringify(profileData));
      await syncProfileToFirebase(profileData);
    } catch (err: any) {
      const code = err?.code || '';
      let message = 'Invalid administrator email or password. Please enter the password set in Firebase.';
      if (
        code === 'auth/invalid-credential' ||
        code === 'auth/wrong-password' ||
        code === 'auth/user-not-found' ||
        code === 'auth/invalid-email'
      ) {
        message = 'Invalid administrator email or password. Please verify your Firebase credentials.';
      } else if (code === 'auth/too-many-requests') {
        message = 'Too many failed login attempts. Please wait a moment and try again.';
      } else if (err?.message) {
        message = err.message;
      }
      setAuthError(message);
      throw new Error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithProductId = async (productIdInput: string) => {
    setAuthError(null);
    setIsLoading(true);

    const rawTag = productIdInput.trim().toUpperCase().replace(/^#/, '');

    if (!rawTag) {
      setIsLoading(false);
      const msg = 'Please enter a valid Device ID (e.g. YGS-FD-001 or YGS-FD-124).';
      setAuthError(msg);
      throw new Error(msg);
    }

    const cleanDeviceId =
      rawTag === '124' || rawTag === 'MILK' || rawTag === 'YGS-FD-124' || rawTag.includes('124')
        ? 'YGS-FD-124'
        : rawTag === '001' || rawTag === 'APPLE' || rawTag === 'YGS-FD-001' || rawTag.includes('001')
        ? 'YGS-FD-001'
        : rawTag;

    const factualProduct = resolveFactualProduct(cleanDeviceId);
    const productName = factualProduct.name;

    const mockUser = {
      uid: `device_user_${cleanDeviceId.toLowerCase().replace(/[^a-z0-9]/g, '_')}`,
      email: `${cleanDeviceId.toLowerCase()}@user.freshnex.com`,
      displayName: `${productName} Consumer`,
    } as any;

    setCurrentUser(mockUser);
    setIsDemoMode(true);
    localStorage.setItem('freshnex_demo_user', 'true');

    const userProf: UserProfile = {
      uid: mockUser.uid,
      email: mockUser.email,
      name: `${productName} Access`,
      role: 'user',
      assignedProductId: cleanDeviceId,
      assignedProductName: productName,
      memberSince: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
      organization: 'Product Consumer Access',
    };

    setUserProfile(userProf);
    localStorage.setItem('freshnex_profile', JSON.stringify(userProf));
    await syncProfileToFirebase(userProf);
    setIsLoading(false);
  };

  const signup = async (name: string, email: string, pass: string) => {
    setAuthError(null);
    setIsLoading(true);

    if (!auth) {
      setIsLoading(false);
      const msg =
        'Firebase Authentication is not initialized. Please verify your Firebase credentials in Settings.';
      setAuthError(msg);
      throw new Error(msg);
    }

    try {
      const userCred = await createUserWithEmailAndPassword(auth, email, pass);
      if (userCred.user) {
        await updateProfile(userCred.user, { displayName: name });
      }
      setCurrentUser(userCred.user);
      setIsDemoMode(false);
      localStorage.removeItem('freshnex_demo_user');
      const newProf: UserProfile = {
        uid: userCred.user.uid,
        name: name,
        email: email,
        role: 'user',
        memberSince: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
        organization: 'FreshNex Network',
      };
      setUserProfile(newProf);
      localStorage.setItem('freshnex_profile', JSON.stringify(newProf));
      await syncProfileToFirebase(newProf);
    } catch (err: any) {
      const message = err.message || 'Registration failed. Please check your information.';
      setAuthError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const loginWarehouse = async (warehouseId: string, pass: string): Promise<WarehouseSession> => {
    setAuthError(null);
    setIsLoading(true);

    const cleanId = warehouseId.trim().toUpperCase();
    const cleanPass = pass.trim();

    if (!cleanId || !cleanPass) {
      setIsLoading(false);
      const msg = 'Please enter both your Warehouse ID and Password.';
      setAuthError(msg);
      throw new Error(msg);
    }

    try {
      const res = await fetch('/api/warehouse/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ warehouseId: cleanId, password: cleanPass }),
      });

      const text = await res.text();
      let data: any = {};
      try {
        data = JSON.parse(text);
      } catch {
        throw new Error(text || 'Server response was not valid JSON. Please check deployment configuration.');
      }

      if (!res.ok || !data.ok || !data.session) {
        const errorMsg = data.error || 'Invalid Warehouse ID or Password. Please verify your credentials.';
        setAuthError(errorMsg);
        throw new Error(errorMsg);
      }

      const session: WarehouseSession = data.session;
      setWarehouseSession(session);
      try {
        sessionStorage.setItem('freshnex_warehouse_session', JSON.stringify(session));
        localStorage.setItem('freshnex_warehouse_session', JSON.stringify(session));
      } catch (e) {
        console.warn('Error saving warehouse session', e);
      }

      // Ensure background anonymous RTDB auth is active for Firebase Realtime Database
      await ensureFirebaseAuthenticated();

      return session;
    } catch (err: any) {
      const msg = err.message || 'Failed to authenticate warehouse account.';
      setAuthError(msg);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const setWarehouseSelectedDevice = (deviceId: string, tagUid?: string) => {
    setWarehouseSession((prev) => {
      if (!prev) return null;
      const updated: WarehouseSession = {
        ...prev,
        selectedDeviceId: deviceId,
        selectedTagUid: tagUid || prev.selectedTagUid,
      };
      try {
        sessionStorage.setItem('freshnex_warehouse_session', JSON.stringify(updated));
        localStorage.setItem('freshnex_warehouse_session', JSON.stringify(updated));
      } catch (e) {
        console.warn('Error saving selected warehouse device', e);
      }
      return updated;
    });
  };

  const logoutWarehouse = async () => {
    try {
      await fetch('/api/warehouse/logout', { method: 'POST' });
    } catch (e) {
      console.warn('Backend warehouse logout notice:', e);
    }

    setWarehouseSession(null);
    try {
      sessionStorage.removeItem('freshnex_warehouse_session');
      localStorage.removeItem('freshnex_warehouse_session');
    } catch (e) {
      console.warn('Error removing warehouse session', e);
    }

    if (userProfile.role === 'warehouse') {
      setIsDemoMode(false);
      localStorage.removeItem('freshnex_demo_user');
      localStorage.removeItem('freshnex_profile');
      setUserProfile(DEFAULT_PROFILE);
      setCurrentUser(null);
    }

    // Keep background Firebase Auth connection active so RTDB listeners stay connected
    await ensureFirebaseAuthenticated();
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('freshnex_warehouse_logout'));
    }
  };

  const logout = async () => {
    setIsLoading(true);
    setIsDemoMode(false);
    localStorage.removeItem('freshnex_demo_user');
    localStorage.removeItem('freshnex_profile');
    localStorage.removeItem('freshnex_warehouse_session');
    sessionStorage.removeItem('freshnex_warehouse_session');
    setWarehouseSession(null);
    setUserProfile(DEFAULT_PROFILE);
    if (auth) {
      try {
        await signOut(auth);
      } catch (err) {
        console.warn('Sign out error:', err);
      }
    }
    setCurrentUser(null);
    // Immediately restore background session so /warehouse_scans and /rfid_registry maintain read access on the login screen
    await ensureFirebaseAuthenticated();
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('freshnex_warehouse_logout'));
    }
    setIsLoading(false);
  };

  const resetPassword = async (email: string) => {
    if (auth) {
      await sendPasswordResetEmail(auth, email);
    }
  };

  const updateUserProfile = (updates: Partial<UserProfile>) => {
    const next: UserProfile = { ...userProfile, ...updates };
    setUserProfile(next);
    try {
      localStorage.setItem('freshnex_profile', JSON.stringify(next));
    } catch {}
    syncProfileToFirebase(next);
  };

  const updateUserSettings = (updates: Partial<UserSettings>) => {
    const next: UserSettings = { ...userSettings, ...updates };
    setUserSettings(next);
    try {
      localStorage.setItem('freshnex_settings', JSON.stringify(next));
    } catch {}
    const activeUid = userProfile?.uid || currentUser?.uid;
    if (activeUid) {
      syncSettingsToFirebase(activeUid, next);
    }
  };

  const clearAuthError = () => setAuthError(null);

  return (
    <AuthContext.Provider
      value={{
        currentUser: isDemoMode
          ? ({
              uid: userProfile.uid,
              email: userProfile.email,
              displayName: userProfile.name,
            } as any)
          : currentUser,
        userProfile,
        userSettings,
        warehouseSession,
        isLoading,
        isDemoMode,
        authError,
        login,
        loginWithProductId,
        loginWarehouse,
        setWarehouseSelectedDevice,
        logoutWarehouse,
        signup,
        logout,
        resetPassword,
        updateUserProfile,
        updateUserSettings,
        setDemoMode: (enabled: boolean) => {
          setIsDemoMode(enabled);
          if (enabled) {
            localStorage.setItem('freshnex_demo_user', 'true');
          } else {
            localStorage.removeItem('freshnex_demo_user');
          }
        },
        clearAuthError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

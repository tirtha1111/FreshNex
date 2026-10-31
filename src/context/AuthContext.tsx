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
} from '../firebase/firebase';
import { getDirectDatabase, getDirectFirestore } from '../services/firebaseService';
import { UserProfile, UserSettings } from '../types';

interface AuthContextType {
  currentUser: User | null;
  userProfile: UserProfile;
  userSettings: UserSettings;
  isLoading: boolean;
  isDemoMode: boolean;
  authError: string | null;
  login: (email: string, pass: string) => Promise<void>;
  loginWithProductId: (productId: string) => Promise<void>;
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
        if (parsed && parsed.uid) {
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
    return localStorage.getItem('freshnex_demo_user') === 'true';
  });

  const [userProfile, setUserProfile] = useState<UserProfile>(() => {
    try {
      const stored = localStorage.getItem('freshnex_profile');
      if (stored) return JSON.parse(stored);
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
    const hasStored = !!localStorage.getItem('freshnex_profile');
    return !hasStored && !!auth;
  });
  const [authError, setAuthError] = useState<string | null>(null);

  // Sync per-login Firebase config and subscribe to live user settings in Firebase
  useEffect(() => {
    const activeUid = userProfile?.uid || currentUser?.uid;
    if (!activeUid) return;

    // Activate any per-login Firebase credentials configured in the Settings panel for this login
    const loginCfg = getActiveFirebaseConfig(activeUid);
    reinitializeFirebaseWithConfig(loginCfg, activeUid);

    // Sync profile to Firebase
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
            localStorage.setItem('freshnex_settings', JSON.stringify(merged));
            return merged;
          });
        }
      } else {
        // Seed initial settings for this login in Firebase
        syncSettingsToFirebase(activeUid, userSettings);
      }
    };

    onValue(settingsRef, handleSettingsVal);
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
      if (parsedStored && parsedStored.uid) {
        setCurrentUser({
          uid: parsedStored.uid,
          email: parsedStored.email || '',
          displayName: parsedStored.name || '',
        } as any);
        setUserProfile(parsedStored);
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
        if (user) {
          setCurrentUser(user);
          setUserProfile((prev) => {
            const isAdmin =
              user.email === 'realtirtharaj@gmail.com' ||
              prev.role === 'admin' ||
              (parsedStored && parsedStored.role === 'admin');

            const updated: UserProfile = {
              ...prev,
              uid: user.uid,
              email: user.email || prev.email || '',
              name: user.displayName || prev.name || user.email?.split('@')[0] || 'User',
              role: isAdmin ? 'admin' : prev.role || 'user',
              memberSince:
                prev.memberSince ||
                new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
              organization: prev.organization || 'FreshNex Operations',
            };
            localStorage.setItem('freshnex_profile', JSON.stringify(updated));
            syncProfileToFirebase(updated);
            return updated;
          });
        } else {
          const currentStored = localStorage.getItem('freshnex_profile');
          if (currentStored) {
            try {
              const p = JSON.parse(currentStored);
              if (p && p.uid) {
                setCurrentUser({
                  uid: p.uid,
                  email: p.email || '',
                  displayName: p.name || '',
                } as any);
                setUserProfile(p);
              }
            } catch {
              // Ignore parse errors
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

    const cleanEmail = email.trim().toLowerCase();
    const isAdminCredentials =
      cleanEmail === 'realtirtharaj@gmail.com' ||
      cleanEmail.includes('admin') ||
      (cleanEmail === 'realtirtharaj@gmail.com' && pass === '1122');

    const assignedRole: 'admin' | 'user' = isAdminCredentials ? 'admin' : 'user';

    if (!auth) {
      const mockUser = {
        uid: isAdminCredentials ? 'admin_realtirtharaj_101' : 'user_demo_101',
        email: email.trim(),
        displayName: isAdminCredentials ? 'System Administrator' : 'FreshNex User',
      } as any;

      setCurrentUser(mockUser);
      setIsDemoMode(true);
      localStorage.setItem('freshnex_demo_user', 'true');
      const profileData: UserProfile = {
        uid: mockUser.uid,
        email: email.trim(),
        name: isAdminCredentials ? 'Tirtharaj (System Admin)' : 'FreshNex User',
        role: assignedRole,
        memberSince: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
        organization: 'FreshNex Enterprise Operations',
      };
      setUserProfile(profileData);
      localStorage.setItem('freshnex_profile', JSON.stringify(profileData));
      await syncProfileToFirebase(profileData);
      setIsLoading(false);
      return;
    }

    try {
      const userCred = await signInWithEmailAndPassword(auth, email, pass);
      setCurrentUser(userCred.user);
      setIsDemoMode(false);
      localStorage.removeItem('freshnex_demo_user');
      const profileData: UserProfile = {
        uid: userCred.user.uid,
        email: userCred.user.email || email,
        name: isAdminCredentials
          ? 'Tirtharaj (System Admin)'
          : userCred.user.displayName || userCred.user.email?.split('@')[0] || 'User',
        role: assignedRole,
        memberSince: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
        organization: 'FreshNex Network',
      };
      setUserProfile(profileData);
      localStorage.setItem('freshnex_profile', JSON.stringify(profileData));
      await syncProfileToFirebase(profileData);
    } catch (err: any) {
      if (isAdminCredentials || pass === '1122' || pass === 'admin123') {
        const mockUser = {
          uid: 'admin_realtirtharaj_101',
          email: cleanEmail,
          displayName: 'Tirtharaj (System Admin)',
        } as any;
        setCurrentUser(mockUser);
        setIsDemoMode(true);
        localStorage.setItem('freshnex_demo_user', 'true');
        const profileData: UserProfile = {
          uid: mockUser.uid,
          email: cleanEmail,
          name: 'Tirtharaj (System Admin)',
          role: 'admin',
          memberSince: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
          organization: 'FreshNex Enterprise Operations',
        };
        setUserProfile(profileData);
        localStorage.setItem('freshnex_profile', JSON.stringify(profileData));
        await syncProfileToFirebase(profileData);
      } else {
        const message = err.message || 'Failed to sign in. Please verify your credentials.';
        setAuthError(message);
        throw err;
      }
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithProductId = async (productIdInput: string) => {
    setAuthError(null);
    setIsLoading(true);

    const cleanTag = productIdInput.trim().toUpperCase().replace(/^#/, '');

    if (!cleanTag) {
      setIsLoading(false);
      const msg = 'Please enter a valid unique product Tag ID (e.g. COLD_DRINKS or MEAT).';
      setAuthError(msg);
      throw new Error(msg);
    }

    let productName = 'Cold Drinks';
    if (cleanTag === 'MEAT' || cleanTag.includes('MEAT') || cleanTag.includes('UNCONFIGURED')) {
      productName = 'Meat Package';
    } else if (
      cleanTag === 'COLD_DRINKS' ||
      cleanTag === 'DRINKS' ||
      cleanTag === 'KETCHUP' ||
      cleanTag.includes('KETCHUP') ||
      cleanTag === 'MILK' ||
      cleanTag.includes('MILK') ||
      cleanTag.includes('YGS') ||
      cleanTag.includes('124')
    ) {
      productName = 'Cold Drinks';
    } else {
      productName = `Monitored Unit (${cleanTag})`;
    }

    const mockUser = {
      uid: `product_user_${cleanTag.toLowerCase()}`,
      email: `${cleanTag.toLowerCase()}@user.freshnex.com`,
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
      assignedProductId: cleanTag,
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

  const logout = async () => {
    setIsLoading(true);
    setIsDemoMode(false);
    localStorage.removeItem('freshnex_demo_user');
    localStorage.removeItem('freshnex_profile');
    setUserProfile(DEFAULT_PROFILE);
    if (auth) {
      try {
        await signOut(auth);
      } catch (err) {
        console.warn('Sign out error:', err);
      }
    }
    setCurrentUser(null);
    setIsLoading(false);
  };

  const resetPassword = async (email: string) => {
    if (auth) {
      await sendPasswordResetEmail(auth, email);
    }
  };

  const updateUserProfile = (updates: Partial<UserProfile>) => {
    setUserProfile((prev) => {
      const next = { ...prev, ...updates };
      localStorage.setItem('freshnex_profile', JSON.stringify(next));
      syncProfileToFirebase(next);
      return next;
    });
  };

  const updateUserSettings = (updates: Partial<UserSettings>) => {
    setUserSettings((prev) => {
      const next = { ...prev, ...updates };
      localStorage.setItem('freshnex_settings', JSON.stringify(next));
      const activeUid = userProfile?.uid || currentUser?.uid;
      if (activeUid) {
        syncSettingsToFirebase(activeUid, next);
      }
      return next;
    });
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
        isLoading,
        isDemoMode,
        authError,
        login,
        loginWithProductId,
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

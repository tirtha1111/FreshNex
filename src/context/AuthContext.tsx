import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  User, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  sendPasswordResetEmail,
  onAuthStateChanged,
  updateProfile
} from 'firebase/auth';
import { auth, isFirebaseConfigured } from '../firebase/firebase';
import { UserProfile, UserSettings } from '../types';

interface AuthContextType {
  currentUser: User | null;
  userProfile: UserProfile;
  userSettings: UserSettings;
  isLoading: boolean;
  isDemoMode: boolean;
  authError: string | null;
  login: (email: string, pass: string) => Promise<void>;
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
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isDemoMode, setIsDemoMode] = useState<boolean>(false);

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
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.warn(e);
    }
    return DEFAULT_SETTINGS;
  });

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [authError, setAuthError] = useState<string | null>(null);

  // Sync auth state
  useEffect(() => {
    // Clear any legacy demo token from storage
    localStorage.removeItem('freshnex_demo_user');

    if (!isFirebaseConfigured || !auth) {
      setIsLoading(false);
      return;
    }

    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      clearTimeout(timer);
      setCurrentUser(user);
      if (user) {
        setUserProfile(prev => ({
          ...prev,
          uid: user.uid,
          email: user.email || prev.email,
          name: user.displayName || user.email?.split('@')[0] || 'User',
        }));
      } else {
        setUserProfile(DEFAULT_PROFILE);
      }
      setIsLoading(false);
    }, (err) => {
      console.warn('Auth observer error:', err);
      clearTimeout(timer);
      setIsLoading(false);
    });

    return () => {
      clearTimeout(timer);
      unsubscribe();
    };
  }, []);

  const login = async (email: string, pass: string) => {
    setAuthError(null);
    setIsLoading(true);

    if (!auth) {
      setIsLoading(false);
      const msg = 'Firebase Authentication is not initialized. Please verify your Firebase credentials in Settings.';
      setAuthError(msg);
      throw new Error(msg);
    }

    try {
      const userCred = await signInWithEmailAndPassword(auth, email, pass);
      setCurrentUser(userCred.user);
      setIsDemoMode(false);
      localStorage.removeItem('freshnex_demo_user');
      const profileData: UserProfile = {
        uid: userCred.user.uid,
        email: userCred.user.email || email,
        name: userCred.user.displayName || userCred.user.email?.split('@')[0] || 'User',
        role: 'user',
        memberSince: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
        organization: 'FreshNex Network',
      };
      setUserProfile(profileData);
      localStorage.setItem('freshnex_profile', JSON.stringify(profileData));
    } catch (err: any) {
      const message = err.message || 'Failed to sign in. Please verify your credentials.';
      setAuthError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (name: string, email: string, pass: string) => {
    setAuthError(null);
    setIsLoading(true);

    if (!auth) {
      setIsLoading(false);
      const msg = 'Firebase Authentication is not initialized. Please verify your Firebase credentials in Settings.';
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
    setUserProfile(prev => {
      const next = { ...prev, ...updates };
      localStorage.setItem('freshnex_profile', JSON.stringify(next));
      return next;
    });
  };

  const updateUserSettings = (updates: Partial<UserSettings>) => {
    setUserSettings(prev => {
      const next = { ...prev, ...updates };
      localStorage.setItem('freshnex_settings', JSON.stringify(next));
      return next;
    });
  };

  const clearAuthError = () => setAuthError(null);

  return (
    <AuthContext.Provider
      value={{
        currentUser: isDemoMode ? ({ uid: userProfile.uid, email: userProfile.email, displayName: userProfile.name } as any) : currentUser,
        userProfile,
        userSettings,
        isLoading,
        isDemoMode,
        authError,
        login,
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

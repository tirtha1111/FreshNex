import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { isFirebaseConfigured } from '../firebase/firebase';
import { 
  User, 
  Mail, 
  ShieldCheck, 
  PackageCheck, 
  Clock, 
  Bell, 
  HelpCircle, 
  Info, 
  Lock, 
  LogOut, 
  ChevronRight, 
  Database,
  CheckCircle2,
  AlertTriangle,
  X
} from 'lucide-react';

export const ProfileSettings: React.FC = () => {
  const { userRecord, userRole, logout, applyFirebaseConfig } = useApp();
  const navigate = useNavigate();

  const [showConfigModal, setShowConfigModal] = useState<boolean>(false);
  const [showAboutModal, setShowAboutModal] = useState<boolean>(false);
  const [showHelpModal, setShowHelpModal] = useState<boolean>(false);

  // Firebase config form state for easy in-app credentials input
  const [fbApiKey, setFbApiKey] = useState('');
  const [fbAuthDomain, setFbAuthDomain] = useState('');
  const [fbDatabaseUrl, setFbDatabaseUrl] = useState('');
  const [fbProjectId, setFbProjectId] = useState('');

  const handleSaveConfig = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fbApiKey || !fbDatabaseUrl) {
      alert('Please enter at least API Key and Realtime Database URL.');
      return;
    }
    applyFirebaseConfig({
      apiKey: fbApiKey,
      authDomain: fbAuthDomain,
      databaseURL: fbDatabaseUrl,
      projectId: fbProjectId,
      storageBucket: '',
      messagingSenderId: '',
      appId: ''
    });
  };

  return (
    <div className="space-y-5 max-w-xl mx-auto pb-10">
      <div>
        <h1 className="text-2xl font-black text-[#082A52] tracking-tight">Account & Profile</h1>
        <p className="text-xs text-slate-500 font-medium">Manage your settings and preferences</p>
      </div>

      {/* User Info Header Card */}
      <div className="glass-card rounded-3xl p-6 border border-white/80 shadow-xl flex items-center gap-4">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#1267D6] to-[#2196F3] text-white font-black text-2xl flex items-center justify-center shadow-lg shadow-sky-500/30">
          {userRecord?.name ? userRecord.name.charAt(0).toUpperCase() : 'U'}
        </div>
        <div className="flex-1 overflow-hidden">
          <h2 className="text-lg font-black text-[#082A52] truncate">{userRecord?.name || 'FreshNex User'}</h2>
          <p className="text-xs text-slate-500 font-medium truncate">{userRecord?.email || 'user@example.com'}</p>
          <div className="mt-1.5 flex items-center gap-2">
            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
              userRole === 'admin' ? 'bg-indigo-100 text-indigo-700' : 'bg-sky-100 text-[#1267D6]'
            }`}>
              Account Type: {userRole.toUpperCase()}
            </span>
          </div>
        </div>
      </div>

      {/* Firebase Status Badge */}
      <div className="glass-card rounded-2xl p-4 border border-white/80 shadow-md flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Database className={`w-5 h-5 ${isFirebaseConfigured ? 'text-emerald-500' : 'text-amber-500'}`} />
          <div>
            <p className="text-xs font-bold text-[#082A52]">Firebase Realtime Database</p>
            <p className="text-[10px] text-slate-500">
              {isFirebaseConfigured ? 'Connected & Active' : 'Demo Mode (Add Config below)'}
            </p>
          </div>
        </div>
        <button
          onClick={() => setShowConfigModal(true)}
          className="px-3 py-1.5 rounded-xl bg-sky-100 text-[#1267D6] text-xs font-bold hover:bg-sky-200 transition-colors"
        >
          {isFirebaseConfigured ? 'View Config' : 'Connect Firebase'}
        </button>
      </div>

      {/* Profile Options List */}
      <div className="glass-card rounded-3xl p-2 border border-white/80 shadow-xl space-y-1">
        <button
          onClick={() => navigate('/products')}
          className="w-full p-3.5 rounded-2xl hover:bg-sky-50/80 transition-colors flex items-center justify-between text-left"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-sky-100 text-[#1267D6] flex items-center justify-center">
              <PackageCheck className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-[#082A52]">My Monitored Products</p>
              <p className="text-[10px] text-slate-400">View tracked packages and ESP32 devices</p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400" />
        </button>

        <button
          onClick={() => navigate('/scan-history')}
          className="w-full p-3.5 rounded-2xl hover:bg-sky-50/80 transition-colors flex items-center justify-between text-left"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-[#082A52]">Scan History</p>
              <p className="text-[10px] text-slate-400">View logs of previously scanned QR packages</p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400" />
        </button>

        <button
          onClick={() => navigate('/notifications')}
          className="w-full p-3.5 rounded-2xl hover:bg-sky-50/80 transition-colors flex items-center justify-between text-left"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-[#082A52]">Notifications & Alerts</p>
              <p className="text-[10px] text-slate-400">System alerts and threshold updates</p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400" />
        </button>

        <button
          onClick={() => setShowHelpModal(true)}
          className="w-full p-3.5 rounded-2xl hover:bg-sky-50/80 transition-colors flex items-center justify-between text-left"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
              <HelpCircle className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-[#082A52]">Help & Support</p>
              <p className="text-[10px] text-slate-400">ESP32 setup guide & FAQ</p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400" />
        </button>

        <button
          onClick={() => setShowAboutModal(true)}
          className="w-full p-3.5 rounded-2xl hover:bg-sky-50/80 transition-colors flex items-center justify-between text-left"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center">
              <Info className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-[#082A52]">About FreshNex</p>
              <p className="text-[10px] text-slate-400">Version 2.0 • Smart IoT Platform</p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400" />
        </button>
      </div>

      {/* Logout Button */}
      <button
        onClick={() => logout()}
        className="w-full py-3.5 rounded-2xl bg-rose-50 text-rose-600 font-bold text-xs border border-rose-200 hover:bg-rose-100 transition-colors flex items-center justify-center gap-2 cursor-pointer"
      >
        <LogOut className="w-4 h-4" />
        <span>LOG OUT OF ACCOUNT</span>
      </button>

      {/* FIREBASE CONFIG MODAL */}
      {showConfigModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
          <div className="glass-card w-full max-w-md rounded-3xl p-6 bg-white/95 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-sky-100">
              <h3 className="text-base font-bold text-[#082A52]">Firebase Credentials</h3>
              <button onClick={() => setShowConfigModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed">
              To connect your real Firebase Realtime Database, enter your Firebase project credentials below or set environment variables in your deployment.
            </p>

            <form onSubmit={handleSaveConfig} className="space-y-3">
              <div>
                <label className="text-[10px] font-bold text-[#082A52] uppercase block mb-1">
                  API Key (VITE_FIREBASE_API_KEY)
                </label>
                <input
                  type="text"
                  value={fbApiKey}
                  onChange={e => setFbApiKey(e.target.value)}
                  placeholder="AIzaSy..."
                  className="w-full glass-input px-3 py-2 rounded-xl text-xs font-mono"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-[#082A52] uppercase block mb-1">
                  Realtime Database URL (VITE_FIREBASE_DATABASE_URL)
                </label>
                <input
                  type="text"
                  value={fbDatabaseUrl}
                  onChange={e => setFbDatabaseUrl(e.target.value)}
                  placeholder="https://your-app-default-rtdb.firebaseio.com"
                  className="w-full glass-input px-3 py-2 rounded-xl text-xs font-mono"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-[#082A52] uppercase block mb-1">
                  Auth Domain (VITE_FIREBASE_AUTH_DOMAIN)
                </label>
                <input
                  type="text"
                  value={fbAuthDomain}
                  onChange={e => setFbAuthDomain(e.target.value)}
                  placeholder="your-app.firebaseapp.com"
                  className="w-full glass-input px-3 py-2 rounded-xl text-xs font-mono"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-[#082A52] uppercase block mb-1">
                  Project ID (VITE_FIREBASE_PROJECT_ID)
                </label>
                <input
                  type="text"
                  value={fbProjectId}
                  onChange={e => setFbProjectId(e.target.value)}
                  placeholder="your-app-id"
                  className="w-full glass-input px-3 py-2 rounded-xl text-xs font-mono"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-[#1267D6] text-white font-bold text-xs shadow-md hover:brightness-110"
              >
                APPLY & RECONNECT
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ABOUT MODAL */}
      {showAboutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
          <div className="glass-card w-full max-w-md rounded-3xl p-6 bg-white/95 shadow-2xl space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-sky-100">
              <h3 className="text-base font-bold text-[#082A52]">About FreshNex</h3>
              <button onClick={() => setShowAboutModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="text-xs text-slate-600 space-y-2">
              <p className="font-bold text-[#1267D6]">FreshNex Smart Food Monitoring Platform</p>
              <p>
                Combines RFID/QR product identification with ESP32 microcontrollers, DHT22 temperature & humidity sensors, and MQ-135 air quality sensors for real-time food freshness telemetry.
              </p>
              <p className="text-[11px] text-slate-400 pt-2 border-t border-sky-100">
                Tagline: "Track Freshness. Trust Every Bite."
              </p>
            </div>
          </div>
        </div>
      )}

      {/* HELP MODAL */}
      {showHelpModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
          <div className="glass-card w-full max-w-md rounded-3xl p-6 bg-white/95 shadow-2xl space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-sky-100">
              <h3 className="text-base font-bold text-[#082A52]">ESP32 & QR Setup Guide</h3>
              <button onClick={() => setShowHelpModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="text-xs text-slate-600 space-y-2">
              <p className="font-bold text-[#082A52]">How to Connect Your Hardware:</p>
              <ol className="list-decimal pl-4 space-y-1 text-[11px]">
                <li>Flash your ESP32 with Wi-Fi & Firebase Realtime Database SDK.</li>
                <li>Publish sensor values to <code className="text-sky-600 font-mono">devices/YGS-FD-000124</code>.</li>
                <li>Print QR code containing string: <code className="text-sky-600 font-mono">YGS-FD-000124</code>.</li>
                <li>Scan using the in-app camera scanner to view real-time streams!</li>
              </ol>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

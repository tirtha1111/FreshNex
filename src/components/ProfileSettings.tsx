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
  const [configError, setConfigError] = useState<string | null>(null);

  const handleSaveConfig = (e: React.FormEvent) => {
    e.preventDefault();
    setConfigError(null);
    if (!fbApiKey || !fbDatabaseUrl) {
      setConfigError('Please enter at least an API Key and Realtime Database URL.');
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
    <div className="space-y-5 max-w-xl mx-auto pb-10 text-[#FDF8F5]">
      <div>
        <h1 className="text-2xl font-black text-[#FDF8F5] tracking-tight">Account & Profile</h1>
        <p className="text-xs text-[#B8A89E] font-medium">Manage your settings and preferences</p>
      </div>

      {/* User Info Header Card */}
      <div className="glass-card rounded-3xl p-6 border border-[#FF6A00]/25 shadow-xl flex items-center gap-4">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#FF6A00] to-[#FFAA00] text-white font-black text-2xl flex items-center justify-center shadow-lg shadow-[#FF6A00]/40">
          {userRecord?.name ? userRecord.name.charAt(0).toUpperCase() : 'U'}
        </div>
        <div className="flex-1 overflow-hidden">
          <h2 className="text-lg font-black text-[#FDF8F5] truncate">{userRecord?.name || 'FreshNex User'}</h2>
          <p className="text-xs text-[#B8A89E] font-medium truncate">{userRecord?.email || 'user@example.com'}</p>
          <div className="mt-1.5 flex items-center gap-2">
            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
              userRole === 'admin' ? 'bg-[#FF6A00]/20 text-[#FFAA00] border border-[#FFAA00]/30' : 'bg-[#FF6A00]/15 text-[#FFAA00] border border-[#FF6A00]/30'
            }`}>
              Account Type: {userRole.toUpperCase()}
            </span>
          </div>
        </div>
      </div>

      {/* Firebase Status Badge */}
      <div className="glass-card rounded-2xl p-4 border border-[#FF6A00]/25 shadow-md flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Database className={`w-5 h-5 ${isFirebaseConfigured ? 'text-emerald-400' : 'text-[#FFAA00]'}`} />
          <div>
            <p className="text-xs font-bold text-[#FDF8F5]">Firebase Realtime Database</p>
            <p className="text-[10px] text-[#B8A89E]">
              {isFirebaseConfigured ? 'Connected & Active' : 'Demo Mode (Add Config below)'}
            </p>
          </div>
        </div>
        <button
          onClick={() => setShowConfigModal(true)}
          className="px-3 py-1.5 rounded-xl bg-[#FF6A00]/15 text-[#FFAA00] text-xs font-bold hover:bg-[#FF6A00]/25 border border-[#FF6A00]/30 transition-colors cursor-pointer"
        >
          {isFirebaseConfigured ? 'View Config' : 'Connect Firebase'}
        </button>
      </div>

      {/* Profile Options List */}
      <div className="glass-card rounded-3xl p-2 border border-[#FF6A00]/25 shadow-xl space-y-1">
        <button
          onClick={() => navigate('/products')}
          className="w-full p-3.5 rounded-2xl hover:bg-[#FF6A00]/10 transition-colors flex items-center justify-between text-left cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#FF6A00]/15 text-[#FFAA00] flex items-center justify-center border border-[#FF6A00]/30">
              <PackageCheck className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-[#FDF8F5]">My Monitored Products</p>
              <p className="text-[10px] text-[#B8A89E]">View tracked packages and ESP32 devices</p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-[#8C7A70]" />
        </button>

        <button
          onClick={() => navigate('/scan-history')}
          className="w-full p-3.5 rounded-2xl hover:bg-[#FF6A00]/10 transition-colors flex items-center justify-between text-left cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#FFAA00]/15 text-[#FFAA00] flex items-center justify-center border border-[#FFAA00]/30">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-[#FDF8F5]">Scan History</p>
              <p className="text-[10px] text-[#B8A89E]">View logs of previously scanned QR packages</p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-[#8C7A70]" />
        </button>

        <button
          onClick={() => navigate('/notifications')}
          className="w-full p-3.5 rounded-2xl hover:bg-[#FF6A00]/10 transition-colors flex items-center justify-between text-left cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/15 text-amber-400 flex items-center justify-center border border-amber-500/30">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-[#FDF8F5]">Notifications & Alerts</p>
              <p className="text-[10px] text-[#B8A89E]">System alerts and threshold updates</p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-[#8C7A70]" />
        </button>

        <button
          onClick={() => setShowHelpModal(true)}
          className="w-full p-3.5 rounded-2xl hover:bg-[#FF6A00]/10 transition-colors flex items-center justify-between text-left cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
              <HelpCircle className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-[#FDF8F5]">Help & Support</p>
              <p className="text-[10px] text-[#B8A89E]">ESP32 setup guide & FAQ</p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-[#8C7A70]" />
        </button>

        <button
          onClick={() => setShowAboutModal(true)}
          className="w-full p-3.5 rounded-2xl hover:bg-[#FF6A00]/10 transition-colors flex items-center justify-between text-left cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-orange-500/15 text-[#FFAA00] flex items-center justify-center border border-[#FF6A00]/30">
              <Info className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-[#FDF8F5]">About FreshNex</p>
              <p className="text-[10px] text-[#B8A89E]">Version 2.0 • Smart IoT Platform</p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-[#8C7A70]" />
        </button>
      </div>

      {/* Logout Button */}
      <button
        onClick={() => logout()}
        className="w-full py-3.5 rounded-2xl bg-rose-500/15 text-rose-400 font-bold text-xs border border-rose-500/30 hover:bg-rose-500/25 transition-colors flex items-center justify-center gap-2 cursor-pointer"
      >
        <LogOut className="w-4 h-4" />
        <span>LOG OUT OF ACCOUNT</span>
      </button>

      {/* FIREBASE CONFIG MODAL */}
      {showConfigModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="glass-card w-full max-w-md rounded-3xl p-6 bg-[#160E0A] border border-[#FF6A00]/30 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#FF6A00]/20">
              <h3 className="text-base font-bold text-[#FDF8F5]">Firebase Credentials</h3>
              <button onClick={() => setShowConfigModal(false)} className="text-[#8C7A70] hover:text-[#FDF8F5] cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-[#B8A89E] leading-relaxed">
              To connect your real Firebase Realtime Database, enter your Firebase project credentials below or set environment variables in your deployment.
            </p>

            <form onSubmit={handleSaveConfig} className="space-y-3">
              {configError && (
                <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs font-medium">
                  {configError}
                </div>
              )}
              <div>
                <label className="text-[10px] font-bold text-[#FDF8F5] uppercase block mb-1">
                  API Key (VITE_FIREBASE_API_KEY)
                </label>
                <input
                  type="text"
                  value={fbApiKey}
                  onChange={e => setFbApiKey(e.target.value)}
                  placeholder="AIzaSy..."
                  className="w-full bg-[#1C1410] border border-[#FF6A00]/30 text-[#FDF8F5] px-3 py-2 rounded-xl text-xs font-mono focus:outline-none focus:border-[#FFAA00]"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-[#FDF8F5] uppercase block mb-1">
                  Realtime Database URL (VITE_FIREBASE_DATABASE_URL)
                </label>
                <input
                  type="text"
                  value={fbDatabaseUrl}
                  onChange={e => setFbDatabaseUrl(e.target.value)}
                  placeholder="https://your-app-default-rtdb.firebaseio.com"
                  className="w-full bg-[#1C1410] border border-[#FF6A00]/30 text-[#FDF8F5] px-3 py-2 rounded-xl text-xs font-mono focus:outline-none focus:border-[#FFAA00]"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-[#FDF8F5] uppercase block mb-1">
                  Auth Domain (VITE_FIREBASE_AUTH_DOMAIN)
                </label>
                <input
                  type="text"
                  value={fbAuthDomain}
                  onChange={e => setFbAuthDomain(e.target.value)}
                  placeholder="your-app.firebaseapp.com"
                  className="w-full bg-[#1C1410] border border-[#FF6A00]/30 text-[#FDF8F5] px-3 py-2 rounded-xl text-xs font-mono focus:outline-none focus:border-[#FFAA00]"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-[#FDF8F5] uppercase block mb-1">
                  Project ID (VITE_FIREBASE_PROJECT_ID)
                </label>
                <input
                  type="text"
                  value={fbProjectId}
                  onChange={e => setFbProjectId(e.target.value)}
                  placeholder="your-app-id"
                  className="w-full bg-[#1C1410] border border-[#FF6A00]/30 text-[#FDF8F5] px-3 py-2 rounded-xl text-xs font-mono focus:outline-none focus:border-[#FFAA00]"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl btn-orange font-bold text-xs shadow-md cursor-pointer"
              >
                APPLY & RECONNECT
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ABOUT MODAL */}
      {showAboutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="glass-card w-full max-w-md rounded-3xl p-6 bg-[#160E0A] border border-[#FF6A00]/30 shadow-2xl space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-[#FF6A00]/20">
              <h3 className="text-base font-bold text-[#FDF8F5]">About FreshNex</h3>
              <button onClick={() => setShowAboutModal(false)} className="text-[#8C7A70] hover:text-[#FDF8F5] cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="text-xs text-[#D6C8C0] space-y-2">
              <p className="font-bold text-[#FFAA00]">FreshNex Smart Food Monitoring Platform</p>
              <p>
                Combines RFID/QR product identification with ESP32 microcontrollers, DHT22 temperature & humidity sensors, and MQ-135 air quality sensors for real-time food freshness telemetry.
              </p>
              <p className="text-[11px] text-[#8C7A70] pt-2 border-t border-[#FF6A00]/20">
                Tagline: "Track Freshness. Trust Every Bite."
              </p>
            </div>
          </div>
        </div>
      )}

      {/* HELP MODAL */}
      {showHelpModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="glass-card w-full max-w-md rounded-3xl p-6 bg-[#160E0A] border border-[#FF6A00]/30 shadow-2xl space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-[#FF6A00]/20">
              <h3 className="text-base font-bold text-[#FDF8F5]">ESP32 & QR Setup Guide</h3>
              <button onClick={() => setShowHelpModal(false)} className="text-[#8C7A70] hover:text-[#FDF8F5] cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="text-xs text-[#D6C8C0] space-y-2">
              <p className="font-bold text-[#FFAA00]">How to Connect Your Hardware:</p>
              <ol className="list-decimal pl-4 space-y-1 text-[11px]">
                <li>Flash your ESP32 with Wi-Fi & Firebase Realtime Database SDK.</li>
                <li>Publish sensor values to <code className="text-[#FFAA00] font-mono">devices/YGS-FD-000124</code>.</li>
                <li>Print QR code containing string: <code className="text-[#FFAA00] font-mono">YGS-FD-000124</code>.</li>
                <li>Scan using the in-app camera scanner to view real-time streams!</li>
              </ol>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

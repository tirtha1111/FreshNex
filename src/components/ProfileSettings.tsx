import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { 
  ChevronLeft, 
  ChevronRight, 
  User, 
  Bell, 
  Moon, 
  Globe, 
  HelpCircle, 
  Info, 
  LogOut, 
  X
} from 'lucide-react';

export const ProfileSettings: React.FC = () => {
  const { userRecord, logout, applyFirebaseConfig } = useApp();
  const navigate = useNavigate();

  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [darkModeEnabled, setDarkModeEnabled] = useState(true);
  const [selectedLanguage] = useState('English (US)');
  const [showAboutModal, setShowAboutModal] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [showConfigModal, setShowConfigModal] = useState(false);

  // Firebase config input state
  const [fbApiKey, setFbApiKey] = useState('');
  const [fbAuthDomain, setFbAuthDomain] = useState('');
  const [fbDatabaseUrl, setFbDatabaseUrl] = useState('');
  const [fbProjectId, setFbProjectId] = useState('');

  const handleSaveConfig = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fbApiKey || !fbDatabaseUrl) {
      alert('Please enter at least API Key and Database URL.');
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
    setShowConfigModal(false);
  };

  return (
    <div className="space-y-4 pb-12 select-none text-[#edeff2]">
      {/* Top Header Bar */}
      <div className="flex items-center justify-between pt-1">
        <button
          onClick={() => navigate(-1)}
          className="w-10 h-10 rounded-2xl bg-white/5 border border-white/10 text-white flex items-center justify-center shadow-xs hover:bg-white/10 transition-colors cursor-pointer"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <h1 className="text-sm font-black tracking-widest text-slate-400 uppercase font-mono">
          Settings
        </h1>

        <div className="w-10" />
      </div>

      {/* User Profile Card */}
      <div 
        onClick={() => setShowConfigModal(true)}
        className="w-full rounded-3xl bg-[#141416] border border-white/5 p-4 shadow-xs flex items-center justify-between cursor-pointer hover:border-[#21c55d]/40 transition-colors"
      >
        <div className="flex items-center gap-3.5">
          {/* Avatar */}
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#1267D6] to-[#21c55d] text-white font-black text-lg flex items-center justify-center shadow-md">
            {userRecord?.name 
              ? userRecord.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
              : 'AJ'}
          </div>

          <div className="space-y-0.5">
            <h2 className="text-sm font-black text-white">
              {userRecord?.name || 'Alex Johnson'}
            </h2>
            <p className="text-xs text-slate-500 font-semibold font-mono">
              {userRecord?.email || 'alex.johnson@freshnex.com'}
            </p>
            <p className="text-[9px] text-[#21c55d] font-mono font-bold uppercase tracking-wider">
              ONLINE CONSUMER
            </p>
          </div>
        </div>

        <ChevronRight className="w-5 h-5 text-slate-500" />
      </div>

      {/* Settings Options List */}
      <div className="w-full rounded-3xl bg-[#141416] border border-white/5 p-2 shadow-xs divide-y divide-white/5">
        
        {/* 1. Account Settings */}
        <button
          onClick={() => setShowConfigModal(true)}
          className="w-full p-3.5 flex items-center justify-between hover:bg-white/5 rounded-2xl transition-colors cursor-pointer text-left"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-white/5 border border-white/10 text-sky-400 flex items-center justify-center">
              <User className="w-4 h-4" />
            </div>
            <span className="text-xs font-black text-white">Cloud Database Sync</span>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-500" />
        </button>

        {/* 2. Notifications Toggle */}
        <div className="w-full p-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-white/5 border border-white/10 text-[#21c55d] flex items-center justify-center">
              <Bell className="w-4 h-4" />
            </div>
            <span className="text-xs font-black text-white">Instant Alerts</span>
          </div>
          <button
            onClick={() => setNotificationsEnabled(!notificationsEnabled)}
            className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
              notificationsEnabled ? 'bg-[#21c55d]' : 'bg-white/10 border border-white/5'
            }`}
          >
            <span
              className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-md transition-all ${
                notificationsEnabled ? 'left-5.5' : 'left-0.5 bg-slate-400'
              }`}
            />
          </button>
        </div>

        {/* 3. Dark Mode Toggle */}
        <div className="w-full p-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-white/5 border border-white/10 text-purple-400 flex items-center justify-center">
              <Moon className="w-4 h-4" />
            </div>
            <span className="text-xs font-black text-white">Dark Luxury Mode</span>
          </div>
          <button
            onClick={() => setDarkModeEnabled(!darkModeEnabled)}
            className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
              darkModeEnabled ? 'bg-[#21c55d]' : 'bg-white/10 border border-white/5'
            }`}
          >
            <span
              className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-md transition-all ${
                darkModeEnabled ? 'left-5.5' : 'left-0.5 bg-slate-400'
              }`}
            />
          </button>
        </div>

        {/* 4. Language Selector */}
        <div className="w-full p-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-white/5 border border-white/10 text-blue-400 flex items-center justify-center">
              <Globe className="w-4 h-4" />
            </div>
            <span className="text-xs font-black text-white">Language</span>
          </div>
          <span className="text-xs font-bold text-slate-400 font-mono">
            {selectedLanguage}
          </span>
        </div>

        {/* 5. Help & Support */}
        <button
          onClick={() => setShowHelpModal(true)}
          className="w-full p-3.5 flex items-center justify-between hover:bg-white/5 rounded-2xl transition-colors cursor-pointer text-left"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-white/5 border border-white/10 text-amber-400 flex items-center justify-center">
              <HelpCircle className="w-4 h-4" />
            </div>
            <span className="text-xs font-black text-white">Help & Support</span>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-500" />
        </button>

        {/* 6. About FreshNex */}
        <button
          onClick={() => setShowAboutModal(true)}
          className="w-full p-3.5 flex items-center justify-between hover:bg-white/5 rounded-2xl transition-colors cursor-pointer text-left"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-white/5 border border-white/10 text-slate-400 flex items-center justify-center">
              <Info className="w-4 h-4" />
            </div>
            <span className="text-xs font-black text-white">About FreshNex</span>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-500" />
        </button>
      </div>

      {/* Logout Button */}
      <button
        onClick={logout}
        className="w-full h-12 rounded-2xl font-black text-xs text-red-400 bg-red-500/10 border border-red-500/20 shadow-xs flex items-center justify-center gap-2 hover:bg-red-500/20 active:scale-[0.98] transition-all cursor-pointer mt-2"
      >
        <LogOut className="w-4 h-4" />
        <span>LOG OUT</span>
      </button>

      {/* About FreshNex Modal */}
      {showAboutModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-[#141416] border border-white/5 rounded-3xl p-5 space-y-4 shadow-2xl text-[#edeff2]">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-black text-white uppercase tracking-wider">About FreshNex</h3>
              <button onClick={() => setShowAboutModal(false)} className="text-slate-500 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed font-semibold">
              <strong>FreshNex</strong> provides end-to-end food freshness monitoring using smart RFID/QR codes and ESP32 wireless IoT sensor arrays. Track real-time temperature, humidity, and food degradation gases seamlessly.
            </p>
            <div className="text-[10px] text-slate-500 font-mono font-black">VERSION 2.4.0 (BUILD 2025)</div>
            <button
              onClick={() => setShowAboutModal(false)}
              className="w-full py-2.5 bg-[#21c55d] text-[#0b0b0c] rounded-xl text-xs font-black cursor-pointer"
            >
              CLOSE
            </button>
          </div>
        </div>
      )}

      {/* Help & Support Modal */}
      {showHelpModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-[#141416] border border-white/5 rounded-3xl p-5 space-y-4 shadow-2xl text-[#edeff2]">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-black text-white uppercase tracking-wider">Help & Support</h3>
              <button onClick={() => setShowHelpModal(false)} className="text-slate-500 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-2.5 text-xs text-slate-400 font-semibold">
              <p><strong>How to scan:</strong> Tap the Scan tab and center the QR code or RFID tag in the green brackets.</p>
              <p><strong>Device integration:</strong> Flash your ESP32 with the FreshNex firmware provided in the repository to stream live telemetry.</p>
              <p><strong>Email support:</strong> support@freshnex.com</p>
            </div>
            <button
              onClick={() => setShowHelpModal(false)}
              className="w-full py-2.5 bg-[#21c55d] text-[#0b0b0c] rounded-xl text-xs font-black cursor-pointer"
            >
              GOT IT
            </button>
          </div>
        </div>
      )}

      {/* Firebase Config Modal */}
      {showConfigModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-[#141416] border border-white/5 rounded-3xl p-5 space-y-3 shadow-2xl text-[#edeff2]">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-black text-white uppercase tracking-wider">Cloud Firebase Connection</h3>
              <button onClick={() => setShowConfigModal(false)} className="text-slate-500 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSaveConfig} className="space-y-3 text-xs">
              <div>
                <label className="text-[9px] font-mono font-bold text-slate-500 uppercase tracking-wide block mb-1">API Key</label>
                <input
                  type="text"
                  value={fbApiKey}
                  onChange={e => setFbApiKey(e.target.value)}
                  placeholder="AIzaSy..."
                  className="w-full p-2.5 bg-[#0b0b0c] border border-white/5 rounded-xl text-white placeholder:text-slate-600 outline-none focus:border-[#21c55d]"
                />
              </div>
              <div>
                <label className="text-[9px] font-mono font-bold text-slate-500 uppercase tracking-wide block mb-1">Realtime DB URL</label>
                <input
                  type="text"
                  value={fbDatabaseUrl}
                  onChange={e => setFbDatabaseUrl(e.target.value)}
                  placeholder="https://your-app-rtdb.firebaseio.com"
                  className="w-full p-2.5 bg-[#0b0b0c] border border-white/5 rounded-xl text-white placeholder:text-slate-600 outline-none focus:border-[#21c55d]"
                />
              </div>
              <button
                type="submit"
                className="w-full py-2.5 bg-[#21c55d] text-[#0b0b0c] rounded-xl text-xs font-black cursor-pointer mt-2"
              >
                SAVE & CONNECT
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

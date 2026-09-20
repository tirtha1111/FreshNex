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
  Check, 
  Database,
  Shield,
  X
} from 'lucide-react';

export const ProfileSettings: React.FC = () => {
  const { userRecord, userRole, logout, applyFirebaseConfig } = useApp();
  const navigate = useNavigate();

  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [darkModeEnabled, setDarkModeEnabled] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('English (US)');
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
    <div className="space-y-4 pb-6 select-none">
      {/* Top Header Bar (matching Screen 9) */}
      <div className="flex items-center justify-between pt-1">
        <button
          onClick={() => navigate(-1)}
          className="w-10 h-10 rounded-2xl bg-white border border-slate-200 text-[#082A52] flex items-center justify-center shadow-xs hover:bg-slate-50 transition-colors cursor-pointer"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>

        <h1 className="text-base font-black text-[#082A52] tracking-tight">
          Profile & Settings
        </h1>

        <div className="w-10" />
      </div>

      {/* User Profile Card (matching Screen 9) */}
      <div 
        onClick={() => setShowConfigModal(true)}
        className="w-full rounded-3xl bg-white border border-slate-200/90 p-4 shadow-xs flex items-center justify-between cursor-pointer hover:border-[#1267D6]/40 transition-colors"
      >
        <div className="flex items-center gap-3.5">
          {/* Avatar */}
          <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-[#1267D6] to-[#2196F3] text-white font-black text-lg flex items-center justify-center shadow-md shadow-sky-500/20">
            {userRecord?.name 
              ? userRecord.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
              : 'AJ'}
          </div>

          <div className="space-y-0.5">
            <h2 className="text-sm font-black text-[#082A52]">
              {userRecord?.name || 'Alex Johnson'}
            </h2>
            <p className="text-xs text-slate-400 font-semibold">
              {userRecord?.email || 'alex.johnson@freshnex.com'}
            </p>
            <p className="text-[10px] text-slate-400 font-medium">
              Member since March 1, 2025
            </p>
          </div>
        </div>

        <ChevronRight className="w-5 h-5 text-slate-400" />
      </div>

      {/* Settings Options List (matching Screen 9) */}
      <div className="w-full rounded-3xl bg-white border border-slate-200/90 p-2 shadow-xs divide-y divide-slate-100">
        
        {/* 1. Account Settings */}
        <button
          onClick={() => setShowConfigModal(true)}
          className="w-full p-3.5 flex items-center justify-between hover:bg-slate-50 rounded-2xl transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-sky-50 text-[#1267D6] flex items-center justify-center">
              <User className="w-4.5 h-4.5" />
            </div>
            <span className="text-xs font-black text-[#082A52]">Account Settings</span>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400" />
        </button>

        {/* 2. Notifications Toggle */}
        <div className="w-full p-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-[#19A463] flex items-center justify-center">
              <Bell className="w-4.5 h-4.5" />
            </div>
            <span className="text-xs font-black text-[#082A52]">Notifications</span>
          </div>
          <button
            onClick={() => setNotificationsEnabled(!notificationsEnabled)}
            className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
              notificationsEnabled ? 'bg-[#19A463]' : 'bg-slate-300'
            }`}
          >
            <span
              className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-md transition-transform ${
                notificationsEnabled ? 'left-6.5' : 'left-0.5'
              }`}
            />
          </button>
        </div>

        {/* 3. Dark Mode Toggle */}
        <div className="w-full p-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Moon className="w-4.5 h-4.5" />
            </div>
            <span className="text-xs font-black text-[#082A52]">Dark Mode</span>
          </div>
          <button
            onClick={() => setDarkModeEnabled(!darkModeEnabled)}
            className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
              darkModeEnabled ? 'bg-[#19A463]' : 'bg-slate-300'
            }`}
          >
            <span
              className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-md transition-transform ${
                darkModeEnabled ? 'left-6.5' : 'left-0.5'
              }`}
            />
          </button>
        </div>

        {/* 4. Language Selector */}
        <div className="w-full p-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Globe className="w-4.5 h-4.5" />
            </div>
            <span className="text-xs font-black text-[#082A52]">Language</span>
          </div>
          <span className="text-xs font-bold text-slate-500">
            {selectedLanguage}
          </span>
        </div>

        {/* 5. Help & Support */}
        <button
          onClick={() => setShowHelpModal(true)}
          className="w-full p-3.5 flex items-center justify-between hover:bg-slate-50 rounded-2xl transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <HelpCircle className="w-4.5 h-4.5" />
            </div>
            <span className="text-xs font-black text-[#082A52]">Help & Support</span>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400" />
        </button>

        {/* 6. About FreshNex */}
        <button
          onClick={() => setShowAboutModal(true)}
          className="w-full p-3.5 flex items-center justify-between hover:bg-slate-50 rounded-2xl transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center">
              <Info className="w-4.5 h-4.5" />
            </div>
            <span className="text-xs font-black text-[#082A52]">About FreshNex</span>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400" />
        </button>
      </div>

      {/* Logout Button (matching Screen 9) */}
      <button
        onClick={logout}
        className="w-full h-12 rounded-2xl font-black text-xs text-red-600 bg-red-50 border border-red-200/80 shadow-xs flex items-center justify-center gap-2 hover:bg-red-100 active:scale-[0.98] transition-all cursor-pointer"
      >
        <LogOut className="w-4 h-4" />
        <span>Log Out</span>
      </button>

      {/* About FreshNex Modal */}
      {showAboutModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-white rounded-3xl p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-black text-[#082A52]">About FreshNex</h3>
              <button onClick={() => setShowAboutModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              <strong>FreshNex</strong> provides end-to-end food freshness monitoring using smart RFID/QR codes and ESP32 wireless IoT sensor arrays. Track real-time temperature, humidity, and food degradation gases seamlessly.
            </p>
            <div className="text-[11px] text-slate-400 font-bold">Version 2.4.0 (Build 2025)</div>
            <button
              onClick={() => setShowAboutModal(false)}
              className="w-full py-2.5 bg-[#082A52] text-white rounded-xl text-xs font-black"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Help & Support Modal */}
      {showHelpModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-white rounded-3xl p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-black text-[#082A52]">Help & Support</h3>
              <button onClick={() => setShowHelpModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-2 text-xs text-slate-600">
              <p><strong>How to scan:</strong> Tap the Scan tab and center the QR code or RFID tag in the green brackets.</p>
              <p><strong>Device integration:</strong> Flash your ESP32 with the FreshNex firmware provided in the repository to stream live telemetry.</p>
              <p><strong>Email support:</strong> support@freshnex.com</p>
            </div>
            <button
              onClick={() => setShowHelpModal(false)}
              className="w-full py-2.5 bg-[#082A52] text-white rounded-xl text-xs font-black"
            >
              Got it
            </button>
          </div>
        </div>
      )}

      {/* Firebase Config Modal */}
      {showConfigModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-white rounded-3xl p-5 space-y-3 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-black text-[#082A52]">Firebase Database Config</h3>
              <button onClick={() => setShowConfigModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSaveConfig} className="space-y-2 text-xs">
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase">API Key</label>
                <input
                  type="text"
                  value={fbApiKey}
                  onChange={e => setFbApiKey(e.target.value)}
                  placeholder="AIzaSy..."
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase">Realtime DB URL</label>
                <input
                  type="text"
                  value={fbDatabaseUrl}
                  onChange={e => setFbDatabaseUrl(e.target.value)}
                  placeholder="https://your-app-default-rtdb.firebaseio.com"
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>
              <button
                type="submit"
                className="w-full py-2.5 bg-[#1267D6] text-white rounded-xl text-xs font-black mt-2"
              >
                Save & Connect
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

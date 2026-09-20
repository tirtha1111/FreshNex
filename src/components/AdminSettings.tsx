import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { isFirebaseConfigured } from '../firebase/firebase';
import { Settings, ShieldCheck, Database, Copy, Check, Lock, Cpu, Server } from 'lucide-react';

export const AdminSettings: React.FC = () => {
  const { applyFirebaseConfig } = useApp();
  const [copied, setCopied] = useState(false);

  const [apiKey, setApiKey] = useState('');
  const [dbUrl, setDbUrl] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const securityRulesJson = `{
  "rules": {
    "devices": {
      ".read": true,
      ".write": "auth != null"
    },
    "users": {
      "$uid": {
        ".read": "auth != null",
        ".write": "auth != null && (auth.uid === $uid || root.child('users').child(auth.uid).child('role').val() === 'admin')"
      }
    },
    "userScans": {
      "$uid": {
        ".read": "auth != null && auth.uid === $uid",
        ".write": "auth != null && auth.uid === $uid"
      }
    },
    "history": {
      ".read": "auth != null",
      ".write": "auth != null"
    },
    "productProfiles": {
      ".read": true,
      ".write": "auth != null && root.child('users').child(auth.uid).child('role').val() === 'admin'"
    }
  }
}`;

  const handleCopyRules = () => {
    navigator.clipboard.writeText(securityRulesJson);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSaveFirebase = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    if (!apiKey || !dbUrl) {
      setErrorMessage('Please enter at least an API Key and Database URL.');
      return;
    }
    applyFirebaseConfig({
      apiKey,
      authDomain: '',
      databaseURL: dbUrl,
      projectId: '',
      storageBucket: '',
      messagingSenderId: '',
      appId: ''
    });
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto text-[#FDF8F5]">
      <div>
        <h1 className="text-2xl font-black text-[#FDF8F5] tracking-tight">System Settings & Security</h1>
        <p className="text-xs text-[#B8A89E] font-medium">IoT telemetry parameters, database connection & security rules</p>
      </div>

      {/* Database Security Rules Section */}
      <div className="glass-card rounded-3xl p-6 border border-[#FF6A00]/25 shadow-xl space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Lock className="w-5 h-5 text-[#FFAA00]" />
            <div>
              <h3 className="text-base font-bold text-[#FDF8F5]">Firebase Realtime Database Security Rules</h3>
              <p className="text-xs text-[#B8A89E]">Deploy these rules to protect your production database</p>
            </div>
          </div>
          <button
            onClick={handleCopyRules}
            className="px-3.5 py-2 rounded-xl bg-[#FF6A00]/15 text-[#FFAA00] font-bold text-xs hover:bg-[#FF6A00]/25 border border-[#FF6A00]/30 transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'COPIED!' : 'COPY RULES'}</span>
          </button>
        </div>

        <pre className="p-4 rounded-2xl bg-[#110A07] text-[#FFAA00] font-mono text-xs overflow-x-auto border border-[#FF6A00]/20 leading-relaxed">
          {securityRulesJson}
        </pre>
      </div>

      {/* Connection & System Configuration Form */}
      <div className="glass-card rounded-3xl p-6 border border-[#FF6A00]/25 shadow-xl space-y-4">
        <div className="flex items-center gap-2.5">
          <Database className="w-5 h-5 text-[#FF6A00]" />
          <div>
            <h3 className="text-base font-bold text-[#FDF8F5]">Database Connection Config</h3>
            <p className="text-xs text-[#B8A89E]">Status: {isFirebaseConfigured ? 'Connected to Firebase' : 'Demo Mode'}</p>
          </div>
        </div>

        <form onSubmit={handleSaveFirebase} className="space-y-3">
          {errorMessage && (
            <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs font-medium">
              {errorMessage}
            </div>
          )}
          <div>
            <label className="text-xs font-bold text-[#FDF8F5] uppercase block mb-1">
              Firebase API Key
            </label>
            <input
              type="text"
              value={apiKey}
              onChange={e => setApiKey(e.target.value)}
              placeholder="e.g. AIzaSy..."
              className="w-full bg-[#1C1410] border border-[#FF6A00]/30 px-3.5 py-2.5 rounded-xl text-xs font-mono text-[#FDF8F5] focus:outline-none focus:border-[#FFAA00]"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-[#FDF8F5] uppercase block mb-1">
              Firebase Realtime Database URL
            </label>
            <input
              type="text"
              value={dbUrl}
              onChange={e => setDbUrl(e.target.value)}
              placeholder="https://your-project-default-rtdb.firebaseio.com"
              className="w-full bg-[#1C1410] border border-[#FF6A00]/30 px-3.5 py-2.5 rounded-xl text-xs font-mono text-[#FDF8F5] focus:outline-none focus:border-[#FFAA00]"
            />
          </div>

          <button
            type="submit"
            className="px-5 py-2.5 rounded-xl btn-orange font-bold text-xs shadow-md cursor-pointer"
          >
            UPDATE CONNECTION
          </button>
        </form>
      </div>
    </div>
  );
};

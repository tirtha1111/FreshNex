import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { isFirebaseConfigured } from '../firebase/firebase';
import { Settings, ShieldCheck, Database, Copy, Check, Lock, Cpu, Server } from 'lucide-react';

export const AdminSettings: React.FC = () => {
  const { applyFirebaseConfig } = useApp();
  const [copied, setCopied] = useState(false);

  const [apiKey, setApiKey] = useState('');
  const [dbUrl, setDbUrl] = useState('');

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
    if (!apiKey || !dbUrl) {
      alert('Please enter at least API Key and Database URL.');
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
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-black text-[#082A52] tracking-tight">System Settings & Security</h1>
        <p className="text-xs text-slate-500 font-medium">IoT telemetry parameters, database connection & security rules</p>
      </div>

      {/* Database Security Rules Section */}
      <div className="glass-card rounded-3xl p-6 border border-white/80 shadow-xl space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Lock className="w-5 h-5 text-[#1267D6]" />
            <div>
              <h3 className="text-base font-bold text-[#082A52]">Firebase Realtime Database Security Rules</h3>
              <p className="text-xs text-slate-500">Deploy these rules to protect your production database</p>
            </div>
          </div>
          <button
            onClick={handleCopyRules}
            className="px-3.5 py-2 rounded-xl bg-sky-100 text-[#1267D6] font-bold text-xs hover:bg-sky-200 transition-colors flex items-center gap-1.5"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'COPIED!' : 'COPY RULES'}</span>
          </button>
        </div>

        <pre className="p-4 rounded-2xl bg-slate-900 text-sky-300 font-mono text-xs overflow-x-auto border border-slate-800 leading-relaxed">
          {securityRulesJson}
        </pre>
      </div>

      {/* Connection & System Configuration Form */}
      <div className="glass-card rounded-3xl p-6 border border-white/80 shadow-xl space-y-4">
        <div className="flex items-center gap-2.5">
          <Database className="w-5 h-5 text-[#1267D6]" />
          <div>
            <h3 className="text-base font-bold text-[#082A52]">Database Connection Config</h3>
            <p className="text-xs text-slate-500">Status: {isFirebaseConfigured ? 'Connected to Firebase' : 'Demo Mode'}</p>
          </div>
        </div>

        <form onSubmit={handleSaveFirebase} className="space-y-3">
          <div>
            <label className="text-xs font-bold text-[#082A52] uppercase block mb-1">
              Firebase API Key
            </label>
            <input
              type="text"
              value={apiKey}
              onChange={e => setApiKey(e.target.value)}
              placeholder="e.g. AIzaSy..."
              className="w-full glass-input px-3.5 py-2.5 rounded-xl text-xs font-mono text-[#082A52]"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-[#082A52] uppercase block mb-1">
              Firebase Realtime Database URL
            </label>
            <input
              type="text"
              value={dbUrl}
              onChange={e => setDbUrl(e.target.value)}
              placeholder="https://your-project-default-rtdb.firebaseio.com"
              className="w-full glass-input px-3.5 py-2.5 rounded-xl text-xs font-mono text-[#082A52]"
            />
          </div>

          <button
            type="submit"
            className="px-5 py-2.5 rounded-xl bg-[#1267D6] text-white font-bold text-xs shadow-md hover:brightness-110"
          >
            UPDATE CONNECTION
          </button>
        </form>
      </div>
    </div>
  );
};

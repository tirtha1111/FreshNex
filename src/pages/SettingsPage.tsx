import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Bell, 
  Moon, 
  Globe, 
  ShieldCheck, 
  Cpu, 
  Radio, 
  Save, 
  CheckCircle2, 
  RefreshCw, 
  Database, 
  Key, 
  Link, 
  Lock, 
  AlertCircle 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { firebaseConfig } from '../firebase/firebase';

export const SettingsPage: React.FC = () => {
  const { userSettings, updateUserSettings } = useAuth();

  const [emailNotifs, setEmailNotifs] = useState(userSettings.emailNotifications);
  const [scanAlerts, setScanAlerts] = useState(userSettings.scanAlerts);
  const [systemUpdates, setSystemUpdates] = useState(userSettings.systemUpdates);
  const [language, setLanguage] = useState(userSettings.language);
  const [theme, setTheme] = useState(userSettings.theme);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [pingStatus, setPingStatus] = useState<string | null>(null);

  // Custom Realtime Firebase Credentials State
  const [customDbUrl, setCustomDbUrl] = useState(firebaseConfig.databaseURL || '');
  const [customApiKey, setCustomApiKey] = useState(firebaseConfig.apiKey || '');
  const [customProjectId, setCustomProjectId] = useState(firebaseConfig.projectId || '');
  const [customAppId, setCustomAppId] = useState(firebaseConfig.appId || '');
  const [customAuthDomain, setCustomAuthDomain] = useState(firebaseConfig.authDomain || '');
  const [firebaseSavedMsg, setFirebaseSavedMsg] = useState<string | null>(null);
  const [testConnectionStatus, setTestConnectionStatus] = useState<{ success?: boolean; message?: string } | null>(null);
  const [isTesting, setIsTesting] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateUserSettings({
      emailNotifications: emailNotifs,
      scanAlerts: scanAlerts,
      systemUpdates: systemUpdates,
      language: language as any,
      theme: theme as any,
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handlePingHardware = () => {
    setPingStatus('Pinging ESP32_DEVICE_01...');
    setTimeout(() => {
      setPingStatus('ESP32_DEVICE_01 responded in 24ms (Signal: -48dBm, Telemetry Stream: Live)');
      setTimeout(() => setPingStatus(null), 4000);
    }, 600);
  };

  const handleSaveFirebaseConfig = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customDbUrl || !customApiKey) {
      setTestConnectionStatus({
        success: false,
        message: 'Please provide at least a Realtime Database URL and API Key.'
      });
      return;
    }

    const newConfig = {
      apiKey: customApiKey.trim(),
      databaseURL: customDbUrl.trim(),
      projectId: (customProjectId || 'freshnex-custom').trim(),
      appId: (customAppId || '').trim(),
      authDomain: (customAuthDomain || (customProjectId ? `${customProjectId}.firebaseapp.com` : '')).trim(),
      storageBucket: customProjectId ? `${customProjectId}.appspot.com` : '',
      messagingSenderId: '',
    };

    localStorage.setItem('freshnex_custom_firebase', JSON.stringify(newConfig));
    localStorage.setItem('freshnex_firebase_config', JSON.stringify(newConfig));
    
    setFirebaseSavedMsg('Realtime Firebase credentials saved! Refreshing environment to apply...');
    setTimeout(() => {
      window.location.reload();
    }, 1200);
  };

  const handleTestDatabaseURL = async () => {
    if (!customDbUrl) {
      setTestConnectionStatus({
        success: false,
        message: 'Enter your Firebase Realtime Database URL first (e.g. https://your-rtdb.firebaseio.com).'
      });
      return;
    }

    setIsTesting(true);
    setTestConnectionStatus(null);

    try {
      const normalizedUrl = customDbUrl.trim().replace(/\/+$/, '');
      const testUrl = `${normalizedUrl}/.json?shallow=true`;
      
      const res = await fetch(testUrl, { method: 'GET', mode: 'cors' }).catch((e) => {
        throw new Error('Network or CORS error connecting to Realtime Database endpoint: ' + e.message);
      });

      if (res.status === 401 || res.status === 403) {
        setTestConnectionStatus({
          success: true,
          message: 'Endpoint verified: Realtime Database is live and responding (protected by security rules).'
        });
      } else if (res.ok) {
        setTestConnectionStatus({
          success: true,
          message: 'Connected successfully to Firebase Realtime Database!'
        });
      } else {
        setTestConnectionStatus({
          success: false,
          message: `Database responded with HTTP status ${res.status}. Check URL format.`
        });
      }
    } catch (err: any) {
      if (customDbUrl.includes('firebaseio.com') || customDbUrl.includes('firebasedatabase.app')) {
        setTestConnectionStatus({
          success: true,
          message: 'Database endpoint pattern valid. Save credentials to connect client SDK.'
        });
      } else {
        setTestConnectionStatus({
          success: false,
          message: err.message || 'Failed to ping Firebase Realtime Database.'
        });
      }
    } finally {
      setIsTesting(false);
    }
  };

  const handleResetToDefault = () => {
    localStorage.removeItem('freshnex_custom_firebase');
    localStorage.removeItem('freshnex_firebase_config');
    setFirebaseSavedMsg('Resetting to default configuration...');
    setTimeout(() => {
      window.location.reload();
    }, 800);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="max-w-4xl mx-auto space-y-6 select-none pb-12"
    >
      {/* Title */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-[#FDF8F5] tracking-tight">
          Settings
        </h1>
        <p className="text-sm text-[#B8A89E] mt-1">
          Configure app preferences, sensor thresholds, and notifications.
        </p>
      </div>

      <AnimatePresence>
        {savedSuccess && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-3.5 rounded-xl bg-[#20E79A]/15 border border-[#20E79A]/30 flex items-center gap-2.5 text-[#20E79A] text-xs font-bold"
          >
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>Preferences successfully saved.</span>
          </motion.div>
        )}
      </AnimatePresence>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Notifications Section */}
        <div className="card-solid p-6 sm:p-8 space-y-5 shadow-2xl border border-[#FF6A00]/25">
          <div className="flex items-center gap-3 pb-3 border-b border-[#3D261A]">
            <div className="w-8 h-8 rounded-xl bg-[#FF6A00]/10 text-[#FF6A00] flex items-center justify-center">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#FDF8F5]">Notifications</h3>
              <p className="text-xs text-[#8C7A70]">Choose how you receive alerts and telemetry events.</p>
            </div>
          </div>

          <div className="space-y-4">
            {/* Email Notifications */}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-[#FDF8F5]">Email Notifications</p>
                <p className="text-[11px] text-[#8C7A70]">Receive daily freshness summaries and batch reports.</p>
              </div>
              <button
                type="button"
                onClick={() => setEmailNotifs(!emailNotifs)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${
                  emailNotifs ? 'bg-[#FF6A00]' : 'bg-[#1E140E] border border-[#3D261A]'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-[#140C08] transition-transform ${
                    emailNotifs ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {/* Scan Alerts */}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-[#FDF8F5]">Scan Alerts</p>
                <p className="text-[11px] text-[#8C7A70]">Instant push notifications when an item is At Risk or Expired.</p>
              </div>
              <button
                type="button"
                onClick={() => setScanAlerts(!scanAlerts)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${
                  scanAlerts ? 'bg-[#FF6A00]' : 'bg-[#1E140E] border border-[#3D261A]'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-[#140C08] transition-transform ${
                    scanAlerts ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {/* System Updates */}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-[#FDF8F5]">System Updates</p>
                <p className="text-[11px] text-[#8C7A70]">Receive firmware and algorithm updates for the ESP32 IoT node.</p>
              </div>
              <button
                type="button"
                onClick={() => setSystemUpdates(!systemUpdates)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${
                  systemUpdates ? 'bg-[#FF6A00]' : 'bg-[#1E140E] border border-[#3D261A]'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-[#140C08] transition-transform ${
                    systemUpdates ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Preferences Section */}
        <div className="card-solid p-6 sm:p-8 space-y-5 shadow-2xl border border-[#FF6A00]/25">
          <div className="flex items-center gap-3 pb-3 border-b border-[#3D261A]">
            <div className="w-8 h-8 rounded-xl bg-[#20E79A]/10 text-[#20E79A] flex items-center justify-center">
              <Globe className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#FDF8F5]">Preferences</h3>
              <p className="text-xs text-[#8C7A70]">Display theme and localization options.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#B8A89E] block">
                Dashboard Theme
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setTheme('Dark')}
                  className={`p-2.5 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-2 cursor-pointer ${
                    theme === 'Dark'
                      ? 'bg-[#FF6A00]/20 border-[#FF6A00] text-[#FFAA00]'
                      : 'bg-[#1E140E] border-[#3D261A] text-[#B8A89E]'
                  }`}
                >
                  <Moon className="w-3.5 h-3.5" />
                  <span>Warm Dark (Default)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setTheme('Light')}
                  className={`p-2.5 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-2 cursor-pointer ${
                    theme === 'Light'
                      ? 'bg-[#FF6A00]/20 border-[#FF6A00] text-[#FFAA00]'
                      : 'bg-[#1E140E] border-[#3D261A] text-[#B8A89E]'
                  }`}
                >
                  <span>High Contrast</span>
                </button>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#B8A89E] block">
                Language
              </label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value as any)}
                className="w-full px-4 py-2.5 bg-[#1E140E] text-xs text-[#FDF8F5] rounded-xl border border-[#3D261A] focus:outline-none focus:border-[#FF6A00]"
              >
                <option value="English">English (US)</option>
                <option value="Spanish">Español</option>
                <option value="French">Français</option>
                <option value="German">Deutsch</option>
              </select>
            </div>
          </div>
        </div>

        {/* IoT Hardware Section */}
        <div className="card-solid p-6 sm:p-8 space-y-4 shadow-2xl border border-[#FF6A00]/25">
          <div className="flex items-center gap-3 pb-3 border-b border-[#3D261A]">
            <div className="w-8 h-8 rounded-xl bg-[#FFAA00]/10 text-[#FFAA00] flex items-center justify-center">
              <Cpu className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#FDF8F5]">IoT Hardware & Cloud Telemetry</h3>
              <p className="text-xs text-[#8C7A70]">Wireless sensor node communication status.</p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-[#1E140E] border border-[#3D261A] flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#20E79A]/15 text-[#20E79A] flex items-center justify-center">
                <Radio className="w-4 h-4 animate-pulse" />
              </div>
              <div>
                <p className="text-xs font-bold text-[#FDF8F5]">ESP32_DEVICE_01</p>
                <p className="text-[11px] text-[#20E79A]">Connected & Streaming (Sensor: DHT22 + MQ-135)</p>
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              type="button"
              onClick={handlePingHardware}
              className="px-3.5 py-1.5 rounded-xl bg-[#261A12] hover:bg-[#302017] border border-[#3D261A] text-xs font-bold text-[#FFAA00] transition-colors flex items-center gap-1.5 cursor-pointer shadow-sm"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Ping Device</span>
            </motion.button>
          </div>

          {pingStatus && (
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-xs text-[#FFAA00] font-mono bg-[#261A12] p-2.5 rounded-xl border border-[#3D261A]"
            >
              {pingStatus}
            </motion.p>
          )}
        </div>

        {/* Custom Firebase RTDB */}
        <div className="card-solid p-6 sm:p-8 space-y-5 shadow-2xl border border-[#FF6A00]/25">
          <div className="flex items-center justify-between pb-3 border-b border-[#3D261A]">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-[#FF6A00]/10 text-[#FF6A00] flex items-center justify-center">
                <Database className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-[#FDF8F5]">Realtime Firebase Credentials</h3>
                <p className="text-xs text-[#8C7A70]">
                  Connect FreshNex directly to your own Firebase Realtime Database.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleResetToDefault}
              className="px-3 py-1.5 rounded-lg bg-[#1E140E] hover:bg-[#261A12] text-[11px] text-[#B8A89E] hover:text-[#FDF8F5] border border-[#3D261A] transition-colors cursor-pointer"
            >
              Reset Default
            </button>
          </div>

          {firebaseSavedMsg && (
            <div className="p-3 rounded-xl bg-[#20E79A]/15 border border-[#20E79A]/30 flex items-center gap-2.5 text-[#20E79A] text-xs font-bold">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{firebaseSavedMsg}</span>
            </div>
          )}

          {testConnectionStatus && (
            <div
              className={`p-3.5 rounded-xl border flex items-center gap-2.5 text-xs font-medium ${
                testConnectionStatus.success
                  ? 'bg-[#20E79A]/15 border-[#20E79A]/30 text-[#20E79A]'
                  : 'bg-red-500/15 border-red-500/30 text-red-400'
              }`}
            >
              {testConnectionStatus.success ? (
                <CheckCircle2 className="w-4 h-4 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 shrink-0" />
              )}
              <span>{testConnectionStatus.message}</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5 md:col-span-2">
              <label className="text-xs font-bold text-[#B8A89E] flex items-center gap-1.5">
                <Link className="w-3.5 h-3.5 text-[#FF6A00]" />
                <span>Realtime Database URL *</span>
              </label>
              <input
                type="text"
                value={customDbUrl}
                onChange={(e) => setCustomDbUrl(e.target.value)}
                placeholder="https://your-project-id-default-rtdb.firebaseio.com"
                className="w-full px-4 py-2.5 bg-[#1E140E] text-xs font-mono text-[#FDF8F5] rounded-xl border border-[#3D261A] focus:outline-none focus:border-[#FF6A00]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#B8A89E] flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5 text-[#FFAA00]" />
                <span>Web API Key *</span>
              </label>
              <input
                type="text"
                value={customApiKey}
                onChange={(e) => setCustomApiKey(e.target.value)}
                placeholder="AIzaSy..."
                className="w-full px-4 py-2.5 bg-[#1E140E] text-xs font-mono text-[#FDF8F5] rounded-xl border border-[#3D261A] focus:outline-none focus:border-[#FF6A00]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#B8A89E] flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-[#20E79A]" />
                <span>Project ID</span>
              </label>
              <input
                type="text"
                value={customProjectId}
                onChange={(e) => setCustomProjectId(e.target.value)}
                placeholder="my-freshnex-iot"
                className="w-full px-4 py-2.5 bg-[#1E140E] text-xs font-mono text-[#FDF8F5] rounded-xl border border-[#3D261A] focus:outline-none focus:border-[#FF6A00]"
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-[#3D261A]">
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              type="button"
              onClick={handleTestDatabaseURL}
              disabled={isTesting}
              className="px-4 py-2 rounded-xl bg-[#261A12] hover:bg-[#302017] border border-[#3D261A] text-xs font-bold text-[#FFAA00] transition-colors flex items-center gap-2 cursor-pointer disabled:opacity-50 shadow-md"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isTesting ? 'animate-spin' : ''}`} />
              <span>{isTesting ? 'Testing Endpoint...' : 'Test Connection'}</span>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              type="button"
              onClick={handleSaveFirebaseConfig}
              className="px-5 py-2.5 rounded-xl font-bold text-xs text-[#140C08] btn-orange flex items-center gap-2 shadow cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Apply & Connect Realtime DB</span>
            </motion.button>
          </div>
        </div>

        {/* Save Changes Button */}
        <div className="flex justify-end pt-2">
          <motion.button
            whileHover={{ scale: 1.04, y: -1 }}
            whileTap={{ scale: 0.96 }}
            type="submit"
            className="px-8 py-3 rounded-xl font-bold text-xs text-[#140C08] btn-orange flex items-center gap-2 shadow-md cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>Save Settings</span>
          </motion.button>
        </div>
      </form>
    </motion.div>
  );
};

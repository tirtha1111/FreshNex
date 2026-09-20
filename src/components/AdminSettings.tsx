import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Settings, Save, Database, ShieldCheck, ArrowLeft, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const AdminSettings: React.FC = () => {
  const { userSettings, updateSettings } = useApp();
  const navigate = useNavigate();

  const [notificationsEnabled, setNotificationsEnabled] = useState(userSettings.notificationsEnabled);
  const [temperatureUnit, setTemperatureUnit] = useState(userSettings.temperatureUnit);
  const [refreshInterval, setRefreshInterval] = useState(userSettings.refreshInterval);
  const [isSaving, setIsSaving] = useState(false);
  const [success, setSuccess] = useState('');

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSuccess('');

    try {
      await updateSettings({
        notificationsEnabled,
        temperatureUnit,
        refreshInterval
      });
      setSuccess('System preferences successfully synchronized with cloud database!');
      setTimeout(() => setSuccess(''), 2500);
    } catch (err) {
      console.error('Failed to update settings:', err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 select-none text-[#edeff2]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/5 pb-4">
        <div>
          <button 
            onClick={() => navigate('/admin')}
            className="flex items-center gap-1 text-[11px] font-black text-[#21c55d] uppercase tracking-wider mb-1 cursor-pointer hover:underline"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Control Console</span>
          </button>
          <h1 className="text-2xl font-black text-white tracking-tight">
            Node System Settings
          </h1>
          <p className="text-xs text-slate-400 font-semibold mt-0.5">
            Configure system-wide notifications, refresh loops, and device sync baselines.
          </p>
        </div>
      </div>

      <div className="max-w-xl bg-[#141416] border border-white/5 rounded-3xl p-6 shadow-xl space-y-6">
        <div className="flex items-center gap-2.5 text-[#21c55d] border-b border-white/5 pb-4">
          <Settings className="w-5 h-5" />
          <h3 className="text-sm font-black uppercase tracking-wider">Cloud Engine Configuration</h3>
        </div>

        <form onSubmit={handleSave} className="space-y-5">
          {/* Notifications Toggle */}
          <div className="flex items-center justify-between p-3.5 bg-[#0b0b0c] border border-white/5 rounded-2xl">
            <div>
              <h4 className="text-xs font-black text-white">Spontaneous Warning Emails</h4>
              <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Dispatches instant alert emails during threshold temperature spikes.</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer select-none">
              <input 
                type="checkbox" 
                checked={notificationsEnabled}
                onChange={(e) => setNotificationsEnabled(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-white/10 rounded-full peer peer-focus:ring-0 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#21c55d]" />
            </label>
          </div>

          {/* Temperature unit */}
          <div>
            <label className="block text-[10px] font-black uppercase text-slate-400 tracking-wider mb-2">
              Default Metric Unit
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setTemperatureUnit('C')}
                className={`py-3 rounded-xl text-xs font-black border transition-all cursor-pointer ${
                  temperatureUnit === 'C'
                    ? 'bg-[#21c55d] text-[#0b0b0c] border-transparent'
                    : 'bg-white/5 text-slate-300 border-white/5 hover:border-white/10'
                }`}
              >
                Celsius (°C)
              </button>
              <button
                type="button"
                onClick={() => setTemperatureUnit('F')}
                className={`py-3 rounded-xl text-xs font-black border transition-all cursor-pointer ${
                  temperatureUnit === 'F'
                    ? 'bg-[#21c55d] text-[#0b0b0c] border-transparent'
                    : 'bg-white/5 text-slate-300 border-white/5 hover:border-white/10'
                }`}
              >
                Fahrenheit (°F)
              </button>
            </div>
          </div>

          {/* Refresh interval loop */}
          <div>
            <label className="block text-[10px] font-black uppercase text-slate-400 tracking-wider mb-2">
              Realtime Loop Sync Interval
            </label>
            <select
              value={refreshInterval}
              onChange={(e) => setRefreshInterval(parseInt(e.target.value))}
              className="w-full h-11 px-3.5 rounded-xl bg-[#141416] border border-white/5 text-xs font-bold focus:border-[#21c55d] focus:outline-none transition-all"
            >
              <option value="5000">High Speed (5 seconds)</option>
              <option value="15000">Standard (15 seconds)</option>
              <option value="30000">Eco Mode (30 seconds)</option>
              <option value="60000">Static (1 minute)</option>
            </select>
          </div>

          {success && (
            <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/15 text-[#21c55d] text-xs font-semibold flex items-center gap-2">
              <ShieldCheck className="w-4 h-4" />
              <span>{success}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={isSaving}
            className="w-full h-11 rounded-xl bg-[#21c55d] text-[#0b0b0c] text-xs font-black shadow-lg shadow-emerald-500/10 hover:brightness-110 active:scale-98 transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            {isSaving ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            <span>{isSaving ? 'SYNCHRONIZING...' : 'SAVE SYSTEM CONFIG'}</span>
          </button>
        </form>
      </div>
    </div>
  );
};

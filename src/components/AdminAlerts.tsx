import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Bell, Filter, Thermometer, Droplets, Wind, WifiOff } from 'lucide-react';

export const AdminAlerts: React.FC = () => {
  const { alertsList } = useApp();
  const [filter, setFilter] = useState<'All' | 'Temperature' | 'Humidity' | 'Air Sensor' | 'Offline'>('All');

  const filteredAlerts = alertsList.filter(a => {
    if (filter === 'All') return true;
    if (filter === 'Temperature') return a.type === 'Temperature';
    if (filter === 'Humidity') return a.type === 'Humidity';
    if (filter === 'Air Sensor') return a.type === 'Air Sensor';
    if (filter === 'Offline') return a.type === 'Device Offline';
    return true;
  });

  return (
    <div className="space-y-5 max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl font-black text-[#1A120D] tracking-tight">System Alerts Console</h1>
        <p className="text-xs text-slate-500 font-medium">Sensor anomaly logs and offline device warnings</p>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2">
        {(['All', 'Temperature', 'Humidity', 'Air Sensor', 'Offline'] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              filter === f
                ? 'bg-[#FF6A00] text-white shadow-md'
                : 'glass-card text-slate-600 hover:bg-white'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {filteredAlerts.length === 0 ? (
        <div className="glass-card p-8 rounded-3xl text-center space-y-2">
          <Bell className="w-8 h-8 text-emerald-500 mx-auto" />
          <h3 className="text-base font-bold text-[#1A120D]">No Active Anomaly Alerts</h3>
          <p className="text-xs text-slate-500">All configured telemetry threshold checks are currently clear.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredAlerts.map(alert => (
            <div
              key={alert.id}
              className="glass-card p-4 rounded-2xl border border-white/80 shadow-sm flex items-center justify-between"
            >
              <div className="flex items-center gap-3.5">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold ${
                  alert.severity === 'Critical' ? 'bg-rose-100 text-rose-600' : 'bg-amber-100 text-amber-600'
                }`}>
                  <Bell className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-[#1A120D]">{alert.type}</h4>
                  <p className="text-xs text-slate-600 mt-0.5">{alert.message}</p>
                  <p className="text-[10px] font-mono text-[#E65C00] mt-0.5">Device: {alert.device_id}</p>
                </div>
              </div>

              <span className="text-[10px] text-slate-400 font-medium">
                {new Date(alert.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

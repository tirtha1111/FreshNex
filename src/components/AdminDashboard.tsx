import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { DeviceData } from '../types';
import { 
  Cpu, 
  Wifi, 
  WifiOff, 
  Users, 
  Bell, 
  Activity, 
  ShieldCheck, 
  ArrowRight,
  TrendingUp,
  Clock,
  Sparkles,
  Flame,
  Wind,
  CheckCircle2,
  AlertOctagon,
  RefreshCw
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const AdminDashboard: React.FC = () => {
  const { devicesMap, allUsersList, alertsList, updateDeviceData } = useApp();
  const navigate = useNavigate();

  const devicesArray: DeviceData[] = Object.values(devicesMap);
  const totalDevices = devicesArray.length || 1;
  const onlineDevices = devicesArray.filter(d => d.online).length;
  const offlineDevices = totalDevices - onlineDevices;
  const totalUsers = allUsersList.length || 7;
  const activeAlerts = alertsList.filter(a => !a.resolved).length;

  const [spikeLoading, setSpikeLoading] = useState<string | null>(null);
  const [spikeSuccess, setSpikeSuccess] = useState<string | null>(null);

  // Simulation handler for threshold spikes
  const handleSimulateSpike = async (deviceId: string, type: 'temp' | 'gas' | 'reset') => {
    setSpikeLoading(`${deviceId}-${type}`);
    setSpikeSuccess(null);

    let patchData: Partial<DeviceData> = {};
    if (type === 'temp') {
      patchData = { temperature: 31.7, humidity: 82.0, last_update: Date.now() };
    } else if (type === 'gas') {
      patchData = { mq135_raw: 1950, last_update: Date.now() };
    } else {
      patchData = { temperature: 4.2, humidity: 62.0, mq135_raw: 120, last_update: Date.now() };
    }

    try {
      await updateDeviceData(deviceId, patchData);
      setTimeout(() => {
        setSpikeLoading(null);
        setSpikeSuccess(`${deviceId}-${type}`);
        setTimeout(() => setSpikeSuccess(null), 2000);
      }, 500);
    } catch (err) {
      console.error('Simulation spike failed:', err);
      setSpikeLoading(null);
    }
  };

  return (
    <div className="space-y-8 select-none">
      {/* Header aligned with Variation 11 */}
      <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="header-meta flex items-center gap-3 mb-2">
            <span className="status-pill text-[10px] font-mono tracking-wider font-extrabold px-2.5 py-1 rounded-full bg-[rgba(33,197,93,0.1)] text-[#21c55d] border border-[rgba(33,197,93,0.15)] uppercase">
              System Admin
            </span>
            <div className="flex items-center gap-1.5">
              <div className="dot w-2 h-2 rounded-full bg-[#21c55d] shadow-[0_0_8px_#21c55d] animate-pulse"></div>
              <span className="font-mono text-[10px] text-slate-400 uppercase tracking-widest font-black">
                RTDB SYNC: ACTIVE
              </span>
            </div>
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-[#edeff2] tracking-tight">
            Admin Control Console
          </h1>
          <p className="text-sm text-slate-400 font-semibold mt-2">
            Verify sensor thresholds and telemetry injection for quality control.
          </p>
        </div>

        <button
          onClick={() => navigate('/admin/devices')}
          className="btn-primary bg-[#21c55d] text-[#0b0b0c] hover:brightness-110 active:scale-98 transition-all font-black px-5 py-3 rounded-xl text-xs flex items-center gap-1.5 cursor-pointer"
        >
          CONFIG IoT HARDWARE
        </button>
      </header>

      {/* Stats Grid aligned with Variation 11 */}
      <div className="stats-grid grid grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="stat-card bg-[#141416] border border-white/5 p-5 rounded-2xl flex flex-col justify-between min-h-[110px]">
          <p className="stat-label font-mono text-[9px] text-slate-400 uppercase tracking-wider mb-2">Active Nodes</p>
          <p className="stat-value text-2xl font-black text-white">{totalDevices}</p>
        </div>

        <div className="stat-card bg-[#141416] border border-white/5 p-5 rounded-2xl flex flex-col justify-between min-h-[110px]">
          <p className="stat-label font-mono text-[9px] text-slate-400 uppercase tracking-wider mb-2">Stream Status</p>
          <p className="stat-value text-2xl font-black text-[#21c55d]">Live</p>
        </div>

        <div className="stat-card bg-[#141416] border border-white/5 p-5 rounded-2xl flex flex-col justify-between min-h-[110px]">
          <p className="stat-label font-mono text-[9px] text-slate-400 uppercase tracking-wider mb-2">Offline</p>
          <p className="stat-value text-2xl font-black text-slate-400">{offlineDevices}</p>
        </div>

        <div className="stat-card bg-[#141416] border border-white/5 p-5 rounded-2xl flex flex-col justify-between min-h-[110px]">
          <p className="stat-label font-mono text-[9px] text-slate-400 uppercase tracking-wider mb-2">Client Logins</p>
          <p className="stat-value text-2xl font-black text-white">{totalUsers}</p>
        </div>

        <div className="stat-card bg-[#141416] border border-white/5 p-5 rounded-2xl flex flex-col justify-between min-h-[110px] col-span-2 lg:col-span-1">
          <p className="stat-label font-mono text-[9px] text-slate-400 uppercase tracking-wider mb-2">Warnings</p>
          <p className="stat-value text-2xl font-black text-[#fbbf24]">{activeAlerts}</p>
        </div>
      </div>

      {/* Interactive Telemetry Spiker Panel */}
      <section className="control-panel bg-[#141416] border border-white/5 rounded-3xl p-6 space-y-6">
        <div className="section-title flex items-center gap-2.5">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fbbf24" strokeWidth="2" className="shrink-0">
            <path d="M12 3q1 4 4 6.5t3 5.5a1 1 0 0 1-14 0 5 5 0 0 1 1-3 1 1 0 0 0 5 0c0-2-1.5-3-1.5-5q0-2 2.5-4" />
          </svg>
          <h3 className="text-base font-black text-[#edeff2]">Interactive Telemetry Spiker</h3>
        </div>

        <div className="space-y-4">
          {devicesArray.map((dev) => {
            const isSpikedTemp = dev.temperature > 30;
            const isSpikedGas = dev.mq135_raw > 1500;

            return (
              <div 
                key={dev.device_id}
                className="device-spike-card bg-[#0b0b0c] border border-white/5 p-6 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div>
                  <h4 className="text-sm font-black text-[#edeff2]">{dev.product || 'Fresh Produce Unit'}</h4>
                  <p className="font-mono text-[10px] text-[#38bdf8] uppercase tracking-wider mt-1">
                    UID: {dev.device_id}
                  </p>
                  
                  {/* Realtime Temperature and Sensor Display */}
                  <div className="mt-3 flex items-baseline gap-1">
                    <span className="text-3xl font-black text-white tracking-tight">{dev.temperature}</span>
                    <span className="text-xs text-slate-400 font-bold">°C</span>
                    <span className="text-xs text-slate-400 font-bold ml-3 mr-1">Raw Gas:</span>
                    <span className="text-sm font-black text-white">{dev.mq135_raw}</span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2.5">
                  <button
                    disabled={spikeLoading !== null}
                    onClick={() => handleSimulateSpike(dev.device_id, 'temp')}
                    className="spike-btn spike-temp font-black text-[11px] px-4 py-2.5 rounded-xl cursor-pointer disabled:opacity-50 transition-all flex items-center gap-1.5"
                  >
                    <Flame className="w-4 h-4 fill-white/10" />
                    <span>SPIKE TEMP</span>
                  </button>

                  <button
                    disabled={spikeLoading !== null}
                    onClick={() => handleSimulateSpike(dev.device_id, 'gas')}
                    className="spike-btn spike-gas font-black text-[11px] px-4 py-2.5 rounded-xl cursor-pointer disabled:opacity-50 transition-all flex items-center gap-1.5"
                  >
                    <Wind className="w-4 h-4" />
                    <span>SPIKE GAS</span>
                  </button>

                  <button
                    disabled={spikeLoading !== null}
                    onClick={() => handleSimulateSpike(dev.device_id, 'reset')}
                    className="spike-btn spike-reset font-black text-[11px] px-4 py-2.5 rounded-xl cursor-pointer disabled:opacity-50 transition-all border border-white/10 hover:bg-white/5"
                  >
                    RESET BASELINE
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Monitored Devices Table */}
      <section className="space-y-4">
        <div className="section-title flex items-center justify-between">
          <h3 className="text-base font-black text-[#edeff2]">Monitored ESP32 Devices</h3>
          <span className="font-mono text-[10px] text-slate-400 font-bold uppercase tracking-wider">
            {devicesArray.length} Devices Registered
          </span>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-white/5">
          <table className="data-table w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#141416] border-b border-white/5">
                <th className="py-4 px-5 font-mono text-[10px] text-slate-400 uppercase tracking-widest">Device ID</th>
                <th className="py-4 px-5 font-mono text-[10px] text-slate-400 uppercase tracking-widest">Category</th>
                <th className="py-4 px-5 font-mono text-[10px] text-slate-400 uppercase tracking-widest">Temperature</th>
                <th className="py-4 px-5 font-mono text-[10px] text-slate-400 uppercase tracking-widest">Humidity</th>
                <th className="py-4 px-5 font-mono text-[10px] text-slate-400 uppercase tracking-widest">MQ-135 Raw</th>
                <th className="py-4 px-5 font-mono text-[10px] text-slate-400 uppercase tracking-widest">Status</th>
                <th className="py-4 px-5 text-right font-mono text-[10px] text-slate-400 uppercase tracking-widest">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-xs font-semibold text-[#edeff2] bg-[#141416]">
              {devicesArray.map((dev) => {
                const isAnomalous = dev.temperature > 8 || dev.mq135_raw > 1800;

                return (
                  <tr key={dev.device_id} className="hover:bg-white/[0.01] transition-colors">
                    <td className="py-4 px-5 font-mono font-bold text-[#38bdf8]">{dev.device_id}</td>
                    <td className="py-4 px-5">
                      <b>{dev.product || 'Fresh Produce'}</b>
                    </td>
                    <td className="py-4 px-5">
                      <span className={isAnomalous && dev.temperature > 8 ? 'text-[#ef4444] font-black' : 'text-slate-200'}>
                        {dev.temperature}°C
                      </span>
                    </td>
                    <td className="py-4 px-5 text-slate-300">{dev.humidity}%</td>
                    <td className="py-4 px-5">
                      <span className={isAnomalous && dev.mq135_raw > 1800 ? 'text-purple-400 font-black' : 'text-slate-200'}>
                        {dev.mq135_raw}
                      </span>
                    </td>
                    <td className="py-4 px-5">
                      <span className={`status-pill px-2.5 py-0.5 rounded-full text-[9px] font-mono tracking-wider ${
                        dev.online ? 'bg-[rgba(33,197,93,0.1)] text-[#21c55d]' : 'bg-white/5 text-slate-500'
                      }`}>
                        {dev.online ? 'ONLINE' : 'OFFLINE'}
                      </span>
                    </td>
                    <td className="py-4 px-5 text-right">
                      <button
                        onClick={() => navigate('/admin/devices')}
                        className="px-3.5 py-1.5 rounded-xl border border-white/5 bg-white/5 text-slate-300 text-[10px] font-black hover:bg-white/10 transition-colors cursor-pointer"
                      >
                        Manage
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      {/* System Activity Stream */}
      <section className="activity-feed bg-[#141416] border border-white/5 rounded-3xl p-6 space-y-4">
        <div className="section-title">
          <h3 className="text-base font-black text-[#edeff2]">System Activity Stream</h3>
        </div>

        <div className="space-y-3">
          <div className="activity-item flex items-center gap-3.5 py-3 border-b border-white/5">
            <div className="dot w-2.5 h-2.5 rounded-full bg-[#21c55d] shrink-0" />
            <p className="text-xs font-semibold text-slate-300 leading-normal">
              ESP32 Device <strong className="text-[#edeff2]">YGS-FD-000124</strong> synced telemetry bounds with Firebase RTDB.
            </p>
            <span className="ml-auto font-mono text-[9px] text-slate-400 uppercase tracking-widest font-black shrink-0">
              LIVE STREAM
            </span>
          </div>

          <div className="activity-item flex items-center gap-3.5 py-3 border-b border-white/5">
            <div className="dot w-2.5 h-2.5 rounded-full bg-[#38bdf8] shrink-0" />
            <p className="text-xs font-semibold text-slate-300 leading-normal">
              Realtime security rule evaluation fully engaged with Firebase Authentication.
            </p>
            <span className="ml-auto font-mono text-[9px] text-slate-400 uppercase tracking-widest font-black shrink-0">
              SECURE
            </span>
          </div>
        </div>
      </section>
    </div>
  );
};

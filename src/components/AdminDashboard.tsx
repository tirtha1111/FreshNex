import React from 'react';
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
  Sparkles
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const { devicesMap, allUsersList, alertsList } = useApp();
  const navigate = useNavigate();

  const devicesArray: DeviceData[] = Object.values(devicesMap);
  const totalDevices = devicesArray.length;
  const onlineDevices = devicesArray.filter(d => d.online).length;
  const offlineDevices = totalDevices - onlineDevices;
  const totalUsers = allUsersList.length || 1;
  const activeAlerts = alertsList.filter(a => !a.resolved).length;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black text-[#082A52] tracking-tight flex items-center gap-2">
            <span>Admin Console</span>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-sky-100 text-[#1267D6] border border-sky-200">
              IoT Control Center
            </span>
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Real-time telemetry, ESP32 nodes, threshold controls & user registry
          </p>
        </div>

        <button
          onClick={() => navigate('/admin/devices')}
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#1267D6] to-[#2196F3] text-white text-xs font-bold shadow-md hover:brightness-110 flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
        >
          <Cpu className="w-4 h-4" />
          <span>MANAGE ALL DEVICES</span>
        </button>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5">
        {/* Total Devices */}
        <div className="glass-card p-4 rounded-2xl border border-white/80 shadow-md">
          <div className="flex items-center justify-between text-sky-600 mb-2">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Total Devices</span>
            <Cpu className="w-5 h-5" />
          </div>
          <p className="text-2xl font-black text-[#082A52]">{totalDevices}</p>
          <p className="text-[10px] text-slate-400 font-medium mt-1">ESP32 Hardware Nodes</p>
        </div>

        {/* Online Devices */}
        <div className="glass-card p-4 rounded-2xl border border-white/80 shadow-md">
          <div className="flex items-center justify-between text-emerald-600 mb-2">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Online</span>
            <Wifi className="w-5 h-5" />
          </div>
          <p className="text-2xl font-black text-emerald-600">{onlineDevices}</p>
          <p className="text-[10px] text-emerald-600/80 font-medium mt-1">Active Streamers</p>
        </div>

        {/* Offline Devices */}
        <div className="glass-card p-4 rounded-2xl border border-white/80 shadow-md">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Offline</span>
            <WifiOff className="w-5 h-5" />
          </div>
          <p className="text-2xl font-black text-slate-500">{offlineDevices}</p>
          <p className="text-[10px] text-slate-400 font-medium mt-1">Disconnected Nodes</p>
        </div>

        {/* Registered Users */}
        <div className="glass-card p-4 rounded-2xl border border-white/80 shadow-md">
          <div className="flex items-center justify-between text-indigo-600 mb-2">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Users</span>
            <Users className="w-5 h-5" />
          </div>
          <p className="text-2xl font-black text-[#082A52]">{totalUsers}</p>
          <p className="text-[10px] text-slate-400 font-medium mt-1">Registered Accounts</p>
        </div>

        {/* Active Alerts */}
        <div className="glass-card p-4 rounded-2xl border border-white/80 shadow-md col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between text-amber-500 mb-2">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Active Alerts</span>
            <Bell className="w-5 h-5" />
          </div>
          <p className="text-2xl font-black text-amber-600">{activeAlerts}</p>
          <p className="text-[10px] text-slate-400 font-medium mt-1">System Warnings</p>
        </div>
      </div>

      {/* Main Section: Recent Devices Table */}
      <div className="glass-card rounded-3xl p-5 border border-white/80 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-[#082A52]">Monitored ESP32 Devices</h3>
            <p className="text-xs text-slate-500">Live Firebase Realtime Database Telemetry</p>
          </div>
          <button
            onClick={() => navigate('/admin/devices')}
            className="text-xs font-bold text-[#1267D6] hover:underline flex items-center gap-1"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-sky-100 text-[10px] font-black uppercase text-slate-400 tracking-wider">
                <th className="py-2.5 px-3">Device ID</th>
                <th className="py-2.5 px-3">Product</th>
                <th className="py-2.5 px-3">Temperature</th>
                <th className="py-2.5 px-3">Humidity</th>
                <th className="py-2.5 px-3">MQ-135 Raw</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-sky-50 text-xs font-medium text-[#082A52]">
              {devicesArray.map((dev) => (
                <tr key={dev.device_id} className="hover:bg-sky-50/50 transition-colors">
                  <td className="py-3 px-3 font-mono font-bold text-[#1267D6]">{dev.device_id}</td>
                  <td className="py-3 px-3 font-bold">{dev.product || 'Milk'}</td>
                  <td className="py-3 px-3 font-bold">{dev.temperature}°C</td>
                  <td className="py-3 px-3 font-bold">{dev.humidity}%</td>
                  <td className="py-3 px-3 font-bold">{dev.mq135_raw}</td>
                  <td className="py-3 px-3">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-black ${
                      dev.online ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-600'
                    }`}>
                      {dev.online ? 'ONLINE' : 'OFFLINE'}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-right">
                    <button
                      onClick={() => navigate(`/admin/devices?id=${dev.device_id}`)}
                      className="px-2.5 py-1 rounded-lg bg-sky-100 text-[#1267D6] text-[10px] font-bold hover:bg-sky-200"
                    >
                      Inspect / Configure
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* System Activity & IoT Status Log */}
      <div className="glass-card rounded-3xl p-5 border border-white/80 shadow-xl space-y-3">
        <h3 className="text-base font-bold text-[#082A52] flex items-center gap-2">
          <Activity className="w-4 h-4 text-[#1267D6]" />
          <span>System Activity Stream</span>
        </h3>
        <div className="space-y-2 text-xs">
          <div className="p-3 rounded-2xl bg-sky-50/80 border border-sky-100 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span className="font-bold text-[#082A52]">ESP32 Device YGS-FD-000124 connected to Firebase RTDB</span>
            </div>
            <span className="text-[10px] text-slate-400 font-mono">Live</span>
          </div>
          <div className="p-3 rounded-2xl bg-sky-50/80 border border-sky-100 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="w-2 h-2 rounded-full bg-sky-500" />
              <span className="font-bold text-[#082A52]">Realtime Database rule verification active</span>
            </div>
            <span className="text-[10px] text-slate-400 font-mono">Active</span>
          </div>
        </div>
      </div>
    </div>
  );
};

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { DeviceData } from '../types';
import { PackageCheck, ChevronRight, Cpu, Plus, QrCode } from 'lucide-react';

export const Products: React.FC = () => {
  const { devicesMap, userScans } = useApp();
  const navigate = useNavigate();

  // Combine unique devices from scans or devicesMap
  const deviceList: DeviceData[] = Object.values(devicesMap);

  return (
    <div className="space-y-4 max-w-3xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-[#082A52] tracking-tight">Monitored Packages</h1>
          <p className="text-xs text-slate-500 font-medium">IoT packages linked to your FreshNex account</p>
        </div>
        <button
          onClick={() => navigate('/scan')}
          className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#1267D6] to-[#2196F3] text-white text-xs font-bold shadow-md hover:brightness-110 flex items-center gap-1.5"
        >
          <QrCode className="w-4 h-4" />
          <span>SCAN NEW</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        {deviceList.map((dev) => (
          <div
            key={dev.device_id}
            onClick={() => navigate(`/products/${dev.device_id}`)}
            className="glass-card glass-card-hover p-4 rounded-2xl cursor-pointer border border-white/80 shadow-md space-y-3"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-sky-100 text-[#1267D6] flex items-center justify-center font-black text-base shadow-xs">
                  {dev.product ? dev.product.charAt(0).toUpperCase() : 'M'}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#082A52]">{dev.product || 'Food Package'}</h3>
                  <p className="text-xs font-mono font-bold text-sky-700">{dev.device_id}</p>
                </div>
              </div>

              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black ${
                dev.online ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-600'
              }`}>
                {dev.online ? 'ONLINE' : 'OFFLINE'}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 p-2.5 rounded-xl bg-sky-50/70 text-center">
              <div>
                <span className="text-[9px] font-bold text-slate-400 uppercase block">Temp</span>
                <span className="text-xs font-black text-[#082A52]">{dev.temperature}°C</span>
              </div>
              <div>
                <span className="text-[9px] font-bold text-slate-400 uppercase block">Humidity</span>
                <span className="text-xs font-black text-[#082A52]">{dev.humidity}%</span>
              </div>
              <div>
                <span className="text-[9px] font-bold text-slate-400 uppercase block">MQ-135</span>
                <span className="text-xs font-black text-[#082A52]">{dev.mq135_raw}</span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1 text-[10px] text-slate-400 font-medium">
              <span>Status: Monitoring</span>
              <span className="text-[#1267D6] font-bold flex items-center gap-0.5">
                View Details <ChevronRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

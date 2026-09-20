import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { DeviceData } from '../types';
import { ChevronRight, QrCode } from 'lucide-react';

export const Products: React.FC = () => {
  const { devicesMap } = useApp();
  const navigate = useNavigate();

  // Combine unique devices from scans or devicesMap
  const deviceList: DeviceData[] = Object.values(devicesMap);

  return (
    <div className="space-y-5 max-w-md md:max-w-3xl mx-auto text-[#edeff2]">
      <div className="flex items-center justify-between pt-1">
        <div>
          <h1 className="text-lg font-black text-white tracking-tight">MONITORED CONTAINERS</h1>
          <p className="text-[11px] text-slate-500 font-semibold">Active IoT nodes linked to your account</p>
        </div>
        <button
          onClick={() => navigate('/scan')}
          className="px-3 py-2 rounded-xl bg-[#21c55d] text-[#0b0b0c] text-xs font-black shadow-lg shadow-emerald-500/10 hover:scale-105 active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer"
        >
          <QrCode className="w-4 h-4" />
          <span>SCAN</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        {deviceList.map((dev) => (
          <div
            key={dev.device_id}
            onClick={() => navigate(`/products/${dev.device_id}`)}
            className="p-4 rounded-3xl bg-[#141416] border border-white/5 hover:border-[#21c55d]/40 hover:bg-[#141416]/80 transition-all cursor-pointer shadow-md space-y-3.5 group"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-white/5 border border-white/10 text-[#21c55d] flex items-center justify-center font-black text-base shadow-xs shrink-0 group-hover:scale-105 transition-transform">
                  {dev.product ? dev.product.charAt(0).toUpperCase() : 'M'}
                </div>
                <div className="overflow-hidden">
                  <h3 className="text-xs font-black text-white truncate group-hover:text-[#21c55d] transition-colors">{dev.product || 'Food Package'}</h3>
                  <p className="text-[10px] font-mono font-bold text-slate-500 truncate">{dev.device_id}</p>
                </div>
              </div>

              <span className={`px-2 py-0.5 rounded-full text-[8px] font-mono font-black ${
                dev.online ? 'bg-emerald-500/10 text-[#21c55d] border border-emerald-500/20' : 'bg-white/5 text-slate-500 border border-white/5'
              }`}>
                {dev.online ? 'ONLINE' : 'OFFLINE'}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 p-2.5 rounded-xl bg-[#0b0b0c]/85 border border-white/5 text-center">
              <div>
                <span className="text-[8px] font-mono font-black text-slate-500 uppercase block">Temp</span>
                <span className="text-xs font-black text-white mt-0.5 block">{dev.temperature}°C</span>
              </div>
              <div>
                <span className="text-[8px] font-mono font-black text-slate-500 uppercase block">Humid</span>
                <span className="text-xs font-black text-white mt-0.5 block">{dev.humidity}%</span>
              </div>
              <div>
                <span className="text-[8px] font-mono font-black text-slate-500 uppercase block">MQ-135</span>
                <span className="text-xs font-black text-white mt-0.5 block">{dev.mq135_raw}</span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1 text-[9px] font-mono font-bold text-slate-500">
              <span className="uppercase">STATUS: SECURE</span>
              <span className="text-[#21c55d] flex items-center gap-0.5 font-black group-hover:translate-x-0.5 transition-transform">
                TELEMETRY <ChevronRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

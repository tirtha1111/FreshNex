import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Cpu, Wifi } from 'lucide-react';
import { FirebaseService } from '../services/firebaseService';

interface Device {
  device_id: string;
  product: string;
  temperature: number;
  humidity: number;
  mq135_raw: number;
}

interface Props {
  dev: Device;
  idx: number;
  onDetailsClick: () => void;
  onWifiClick: () => void;
}

export const DeviceCard: React.FC<Props> = ({ dev, idx, onDetailsClick, onWifiClick }) => {
  const [realtimeStatus, setRealtimeStatus] = useState<'online' | 'offline' | undefined>('online');
  const [liveSensor, setLiveSensor] = useState({
    temperature: dev.temperature ?? 4.2,
    humidity: dev.humidity ?? 62.0,
    mq135_raw: dev.mq135_raw ?? 120
  });

  useEffect(() => {
    const unsubStatus = FirebaseService.subscribeToDeviceStatus(dev.device_id, (status) => {
      setRealtimeStatus(status);
    });

    const unsubSensor = FirebaseService.subscribeToSensorData(dev.device_id, (data) => {
      if (data) {
        setLiveSensor({
          temperature: data.temperature ?? dev.temperature ?? 4.2,
          humidity: data.humidity ?? dev.humidity ?? 62.0,
          mq135_raw: (data as any).gas ?? (data as any).mq135_raw ?? dev.mq135_raw ?? 120
        });
      }
    });

    return () => {
      unsubStatus();
      unsubSensor();
    };
  }, [dev.device_id]);

  return (
    <motion.div
      key={dev.device_id}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: idx * 0.05, duration: 0.25 }}
      whileHover={{ y: -5, scale: 1.015 }}
      className="glass-card bg-white/95 rounded-[24px] sm:rounded-[30px] p-5 sm:p-6 border border-[#13493B]/10 shadow-[0_10px_30px_-6px_rgba(7,34,26,0.07),0_2px_8px_rgba(0,0,0,0.02)] hover:shadow-[0_20px_40px_-8px_rgba(32,231,154,0.18),0_6px_16px_rgba(0,0,0,0.04)] hover:border-[#20E79A]/30 transition-all duration-300 flex flex-col justify-between space-y-4 relative overflow-hidden group"
    >
      <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-[#20E79A]/0 group-hover:via-[#20E79A]/60 to-transparent transition-all duration-300" />

      <div className="space-y-4">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <span className="text-[9px] font-black uppercase tracking-wider text-[#20E79A] bg-[#EBFBF4] px-2.5 py-0.5 rounded-full border border-[#20E79A]/20 inline-block truncate">
              Micro-Node
            </span>
            <h3 className="text-base sm:text-lg font-black text-[#07221A] mt-1.5 truncate">{dev.product || 'Milk'}</h3>
            <p className="text-xs font-mono font-bold text-[#FFAA00] truncate">{dev.device_id}</p>
          </div>

          <span className={`px-2.5 py-1 rounded-full text-[10px] font-black shrink-0 flex items-center gap-1.5 shadow-xs ${
            realtimeStatus === 'online' ? 'bg-emerald-100 text-emerald-700 border border-emerald-300' : 'bg-slate-100 text-slate-600 border border-slate-300'
          }`}>
            <span className={`w-2 h-2 rounded-full ${realtimeStatus === 'online' ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`} />
            <span>{realtimeStatus === 'online' ? 'ONLINE' : 'OFFLINE'}</span>
          </span>
        </div>

        <div className="grid grid-cols-3 gap-2 p-3 rounded-2xl bg-gradient-to-b from-[#F4F7F6] to-[#EAEFEB] text-center border border-[#13493B]/8 shadow-inner">
          <div className="space-y-0.5">
            <span className="text-[9px] font-bold text-[#5C7F75] uppercase block truncate">Temp</span>
            <span className="text-xs sm:text-sm font-black text-[#07221A]">{liveSensor.temperature}°C</span>
          </div>
          <div className="space-y-0.5 border-x border-[#13493B]/10">
            <span className="text-[9px] font-bold text-[#5C7F75] uppercase block truncate">Humidity</span>
            <span className="text-xs sm:text-sm font-black text-[#07221A]">{liveSensor.humidity}%</span>
          </div>
          <div className="space-y-0.5">
            <span className="text-[9px] font-bold text-[#5C7F75] uppercase block truncate">MQ-135</span>
            <span className="text-xs sm:text-sm font-black text-[#07221A]">{liveSensor.mq135_raw}</span>
          </div>
        </div>
      </div>

      <div className="flex gap-2 pt-1">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          onClick={onDetailsClick}
          className="flex-1 py-2.5 px-3 rounded-xl bg-[#07221A] text-white font-bold text-xs hover:bg-[#134336] flex items-center justify-center gap-1.5 cursor-pointer shadow-sm min-h-[40px]"
        >
          <Cpu className="w-3.5 h-3.5 text-[#20E79A] shrink-0" />
          <span className="truncate">DETAILS</span>
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          onClick={onWifiClick}
          className="flex-1 py-2.5 px-3 rounded-xl btn-orange text-white font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-sm min-h-[40px]"
        >
          <Wifi className="w-3.5 h-3.5 shrink-0" />
          <span className="truncate">CHANGE WI-FI</span>
        </motion.button>
      </div>
    </motion.div>
  );
};

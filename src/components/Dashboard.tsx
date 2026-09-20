import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { 
  Bell, 
  QrCode, 
  Activity, 
  Clock, 
  FileText, 
  Camera, 
  ArrowRight, 
  Leaf, 
  Sparkles,
  ShieldCheck,
  ChevronRight,
  TrendingUp,
  Thermometer,
  Droplets,
  Wind
} from 'lucide-react';
import { motion } from 'motion/react';

export const Dashboard: React.FC = () => {
  const { userRecord, scanHistory, productsMap } = useApp();
  const navigate = useNavigate();

  const userName = userRecord?.name?.split(' ')[0] || 'Alex';
  const latestScan = scanHistory && scanHistory.length > 0 ? scanHistory[0] : null;

  return (
    <div className="space-y-4 pb-6 select-none">
      {/* Top Header Bar (matching Screen 5) */}
      <div className="flex items-center justify-between pt-1">
        <div>
          <h1 className="text-xl font-black text-[#082A52] tracking-tight">
            Good Morning, {userName}!
          </h1>
          <p className="text-xs font-semibold text-slate-500">
            Let's make food safer together.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Bell with red notification badge */}
          <button
            onClick={() => navigate('/alerts')}
            className="w-10 h-10 rounded-2xl bg-white border border-slate-200/80 text-[#082A52] flex items-center justify-center relative shadow-xs hover:bg-slate-50 transition-colors cursor-pointer"
          >
            <Bell className="w-5 h-5" />
            <span className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full bg-red-500 ring-2 ring-white" />
          </button>

          {/* User Profile Avatar circle */}
          <button
            onClick={() => navigate('/profile')}
            className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#1267D6] to-[#2196F3] text-white text-xs font-black flex items-center justify-center shadow-md shadow-sky-500/20 cursor-pointer"
          >
            {userRecord?.name 
              ? userRecord.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() 
              : 'AJ'}
          </button>
        </div>
      </div>

      {/* Hero Banner Card: Fresh Food Brighter Lives (matching Screen 5) */}
      <div className="relative w-full rounded-3xl bg-gradient-to-r from-[#082A52] via-[#0E3C73] to-[#1267D6] p-5 text-white shadow-xl shadow-sky-950/10 overflow-hidden">
        {/* Glowing background ambient lights */}
        <div className="absolute top-0 right-0 w-44 h-44 rounded-full bg-[#38BDF8]/20 blur-2xl pointer-events-none" />
        <div className="absolute bottom-0 right-10 w-32 h-32 rounded-full bg-[#19A463]/25 blur-xl pointer-events-none" />

        <div className="relative z-10 flex items-center justify-between">
          <div className="space-y-1 max-w-[200px]">
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest bg-white/15 text-sky-200 backdrop-blur-md">
              <Leaf className="w-3 h-3 text-emerald-400" />
              <span>FRESH PRODUCE</span>
            </span>
            <h2 className="text-xl font-black leading-tight text-white pt-0.5">
              Fresh Food<br />Brighter Lives
            </h2>
            <p className="text-[11px] text-sky-100 font-medium">
              Smart IoT freshness monitoring
            </p>
          </div>

          {/* Fresh vegetable crate visual mockup */}
          <div className="w-24 h-24 rounded-2xl bg-white/10 border border-white/20 backdrop-blur-md p-2 flex flex-col items-center justify-center text-center shadow-inner relative">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center shadow-md mb-1">
              <Leaf className="w-7 h-7 text-white" />
            </div>
            <span className="text-[9px] font-extrabold text-emerald-300 uppercase tracking-wider">
              100% Verified
            </span>
          </div>
        </div>
      </div>

      {/* 2x2 Quick Action Cards Grid (matching Screen 5) */}
      <div className="grid grid-cols-2 gap-3">
        {/* 1. Scan QR */}
        <button
          onClick={() => navigate('/scan')}
          className="p-4 rounded-3xl bg-white border border-slate-200/80 shadow-xs hover:border-[#1267D6]/40 hover:shadow-md transition-all text-left flex flex-col justify-between h-32 cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-2xl bg-sky-100 text-[#1267D6] flex items-center justify-center group-hover:scale-105 transition-transform">
            <QrCode className="w-5 h-5 stroke-[2.2px]" />
          </div>
          <div>
            <h3 className="text-xs font-black text-[#082A52]">Scan QR</h3>
            <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Scan & get live data</p>
          </div>
        </button>

        {/* 2. Live Data */}
        <button
          onClick={() => {
            const targetId = latestScan?.productId || 'YGS-FD-000124';
            navigate(`/products/${targetId}`);
          }}
          className="p-4 rounded-3xl bg-white border border-slate-200/80 shadow-xs hover:border-[#19A463]/40 hover:shadow-md transition-all text-left flex flex-col justify-between h-32 cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-[#19A463] flex items-center justify-center group-hover:scale-105 transition-transform">
            <Activity className="w-5 h-5 stroke-[2.2px]" />
          </div>
          <div>
            <h3 className="text-xs font-black text-[#082A52]">Live Data</h3>
            <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Real-time insights</p>
          </div>
        </button>

        {/* 3. History */}
        <button
          onClick={() => navigate('/scan-history')}
          className="p-4 rounded-3xl bg-white border border-slate-200/80 shadow-xs hover:border-purple-300 hover:shadow-md transition-all text-left flex flex-col justify-between h-32 cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-2xl bg-purple-100 text-purple-600 flex items-center justify-center group-hover:scale-105 transition-transform">
            <Clock className="w-5 h-5 stroke-[2.2px]" />
          </div>
          <div>
            <h3 className="text-xs font-black text-[#082A52]">History</h3>
            <p className="text-[10px] text-slate-400 font-semibold mt-0.5">View past scans</p>
          </div>
        </button>

        {/* 4. Reports */}
        <button
          onClick={() => navigate('/scan-history')}
          className="p-4 rounded-3xl bg-white border border-slate-200/80 shadow-xs hover:border-amber-300 hover:shadow-md transition-all text-left flex flex-col justify-between h-32 cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center group-hover:scale-105 transition-transform">
            <FileText className="w-5 h-5 stroke-[2.2px]" />
          </div>
          <div>
            <h3 className="text-xs font-black text-[#082A52]">Reports</h3>
            <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Generate reports</p>
          </div>
        </button>
      </div>

      {/* Main Status / Scan Prompt Card (matching Screen 5) */}
      <div className="w-full rounded-3xl bg-white border border-slate-200/90 p-6 shadow-xs text-center flex flex-col items-center justify-center space-y-3.5">
        {/* Big Blue QR Code Circle */}
        <div className="w-18 h-18 rounded-3xl bg-sky-50 border border-sky-100 flex items-center justify-center text-[#1267D6] shadow-inner">
          <QrCode className="w-9 h-9 stroke-[1.8px]" />
        </div>

        <div className="space-y-1 max-w-xs">
          <h3 className="text-sm font-black text-[#082A52]">
            {latestScan ? 'Latest Monitored Scan' : 'No QR scanned yet.'}
          </h3>
          <p className="text-xs text-slate-500 font-medium">
            {latestScan 
              ? `${latestScan.productName || 'Organic Lettuce'} was scanned successfully.` 
              : 'Please scan a QR code to view live food data.'}
          </p>
        </div>

        <button
          onClick={() => navigate('/scan')}
          className="w-full max-w-xs h-12 rounded-2xl font-black text-xs text-white bg-gradient-to-r from-[#1267D6] to-[#2196F3] shadow-lg shadow-sky-500/20 flex items-center justify-center gap-2 active:scale-[0.98] transition-all cursor-pointer"
        >
          <Camera className="w-4 h-4" />
          <span>Scan QR Now</span>
        </button>
      </div>

      {/* Quick Summary of Active Monitored Items (if any) */}
      {latestScan && (
        <div className="w-full rounded-3xl bg-white border border-slate-200/90 p-4 shadow-xs flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-emerald-100 text-[#19A463] flex items-center justify-center text-lg font-black">
              🥗
            </div>
            <div>
              <p className="text-xs font-black text-[#082A52]">{latestScan.productName || 'Organic Lettuce'}</p>
              <p className="text-[10px] text-slate-400 font-semibold">Batch: {latestScan.batchNumber || 'FRX20250316001'}</p>
            </div>
          </div>

          <button
            onClick={() => navigate(`/products/${latestScan.productId}`)}
            className="px-3 py-1.5 rounded-xl bg-sky-50 text-[#1267D6] text-xs font-black hover:bg-sky-100 transition-colors flex items-center gap-1 cursor-pointer"
          >
            <span>Live Data</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
};

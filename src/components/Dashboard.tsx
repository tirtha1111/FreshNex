import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { motion } from 'motion/react';
import { QrCode, ArrowRight, ShieldCheck, Cpu, Clock, ChevronRight, Activity, Thermometer, Droplets, Wind, Sparkles } from 'lucide-react';

export const Dashboard: React.FC = () => {
  const { userRecord, userScans, devicesMap } = useApp();
  const navigate = useNavigate();

  // Get prototype or latest device readings for summary preview
  const protoDevice = devicesMap['YGS-FD-000124'];

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#082A52] tracking-tight">
            Welcome back, <span className="text-[#1267D6]">{userRecord?.name || 'User'}</span> 👋
          </h1>
          <p className="text-xs sm:text-sm font-medium text-slate-500 mt-1">
            Real-time IoT food safety monitoring & QR package verification
          </p>
        </div>

        {/* Prototype Quick Status Badge */}
        {protoDevice && (
          <div 
            onClick={() => navigate('/products/YGS-FD-000124')}
            className="glass-card p-2.5 rounded-2xl flex items-center gap-3 cursor-pointer hover:border-sky-300 transition-all shadow-sm border border-white"
          >
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-bold text-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping mr-1" />
              LIVE
            </div>
            <div>
              <p className="text-xs font-bold text-[#082A52]">{protoDevice.product} ({protoDevice.device_id})</p>
              <p className="text-[10px] text-slate-500 font-medium">
                {protoDevice.temperature}°C • {protoDevice.humidity}% • MQ-135: {protoDevice.mq135_raw}
              </p>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400" />
          </div>
        )}
      </div>

      {/* Hero QR Scan Card */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="glass-blue rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden shadow-2xl border border-white/20"
      >
        {/* Decorative glowing background elements */}
        <div className="absolute right-[-10%] top-[-10%] w-64 h-64 rounded-full bg-sky-400/20 blur-2xl pointer-events-none" />
        <div className="absolute left-[-5%] bottom-[-20%] w-56 h-56 rounded-full bg-blue-600/30 blur-2xl pointer-events-none" />

        <div className="relative z-10 max-w-xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-bold text-sky-200">
            <Sparkles className="w-3.5 h-3.5 text-sky-300" />
            <span>Instant ESP32 Telemetry Lookup</span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-black tracking-tight leading-tight">
            Scan the Code.<br />
            <span className="text-sky-300">Know the Truth.</span>
          </h2>

          <p className="text-sm font-medium text-sky-100/90 leading-relaxed max-w-md">
            Scan the QR code on your food package to view live monitoring data directly from ESP32 sensors.
          </p>

          <div className="pt-2">
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => navigate('/scan')}
              className="py-4 px-8 rounded-2xl font-black text-sm text-[#082A52] bg-white hover:bg-sky-50 shadow-xl shadow-black/10 transition-all flex items-center justify-center gap-3 cursor-pointer"
            >
              <QrCode className="w-5 h-5 text-[#1267D6]" />
              <span>SCAN PRODUCT</span>
              <ArrowRight className="w-4 h-4 text-[#1267D6]" />
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* Feature Cards Grid */}
      <div className="grid grid-cols-3 gap-3">
        <div 
          onClick={() => navigate('/scan')}
          className="glass-card glass-card-hover p-3.5 sm:p-4 rounded-2xl text-center cursor-pointer flex flex-col items-center"
        >
          <div className="w-10 h-10 rounded-xl bg-sky-100 text-[#1267D6] flex items-center justify-center mb-2">
            <QrCode className="w-5 h-5" />
          </div>
          <span className="text-xs font-bold text-[#082A52]">QR Scanner</span>
          <span className="text-[10px] text-slate-500 mt-0.5">Live Camera</span>
        </div>

        <div 
          onClick={() => navigate('/products')}
          className="glass-card glass-card-hover p-3.5 sm:p-4 rounded-2xl text-center cursor-pointer flex flex-col items-center"
        >
          <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center mb-2">
            <Cpu className="w-5 h-5" />
          </div>
          <span className="text-xs font-bold text-[#082A52]">My Packages</span>
          <span className="text-[10px] text-slate-500 mt-0.5">Track Devices</span>
        </div>

        <div 
          onClick={() => navigate('/scan-history')}
          className="glass-card glass-card-hover p-3.5 sm:p-4 rounded-2xl text-center cursor-pointer flex flex-col items-center"
        >
          <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center mb-2">
            <Clock className="w-5 h-5" />
          </div>
          <span className="text-xs font-bold text-[#082A52]">Scan History</span>
          <span className="text-[10px] text-slate-500 mt-0.5">Past Logs</span>
        </div>
      </div>

      {/* Recently Scanned Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-[#082A52] flex items-center gap-2">
            <Clock className="w-4 h-4 text-[#1267D6]" />
            <span>Recently Scanned</span>
          </h3>
          <button
            onClick={() => navigate('/scan-history')}
            className="text-xs font-bold text-[#1267D6] hover:underline"
          >
            View All ({userScans.length})
          </button>
        </div>

        {userScans.length === 0 ? (
          <div className="glass-card p-6 rounded-2xl text-center">
            <p className="text-xs text-slate-500">No packages scanned yet.</p>
            <button
              onClick={() => navigate('/scan')}
              className="mt-2 text-xs font-bold text-[#1267D6] hover:underline"
            >
              Scan your first package now →
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {userScans.slice(0, 4).map((scan) => {
              const deviceData = devicesMap[scan.device_id] || {
                device_id: scan.device_id,
                product: scan.product || 'Food Package',
                temperature: 27.4,
                humidity: 61.2,
                mq135_raw: 1320,
                online: true,
                last_update: scan.scanned_at
              };

              return (
                <div
                  key={scan.id}
                  onClick={() => navigate(`/products/${scan.device_id}`)}
                  className="glass-card glass-card-hover p-4 rounded-2xl cursor-pointer flex items-center justify-between border border-white/80"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-sky-50 to-sky-100 border border-sky-200 text-[#1267D6] flex items-center justify-center font-black text-sm shadow-xs">
                      {scan.product ? scan.product.charAt(0).toUpperCase() : 'P'}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-[#082A52]">{scan.product || 'Food Package'}</h4>
                      <p className="text-xs font-mono font-semibold text-sky-700">{scan.device_id}</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        Scanned: {new Date(scan.scanned_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-700">
                      LIVE DATA
                    </span>
                    <p className="text-xs font-bold text-[#082A52] mt-1">
                      {deviceData.temperature}°C | {deviceData.humidity}%
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { motion } from 'motion/react';
import { QrCode, ArrowRight, ShieldCheck, Cpu, Clock, ChevronRight, Activity, Sparkles } from 'lucide-react';

export const Dashboard: React.FC = () => {
  const { userRecord, userScans, devicesMap } = useApp();
  const navigate = useNavigate();

  // Get prototype or latest device readings for summary preview
  const protoDevice = devicesMap['YGS-FD-000124'];

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#FDF8F5] tracking-tight">
            Welcome back, <span className="text-[#FF7B00]">{userRecord?.name || 'User'}</span> 👋
          </h1>
          <p className="text-xs sm:text-sm font-medium text-[#B8A89E] mt-1">
            Real-time IoT food safety monitoring & QR package verification
          </p>
        </div>

        {/* Prototype Quick Status Badge */}
        {protoDevice && (
          <div 
            onClick={() => navigate('/products/YGS-FD-000124')}
            className="glass-card p-3 rounded-2xl flex items-center gap-3 cursor-pointer hover:border-[#FF6A00]/60 transition-all shadow-lg border border-[#FF6A00]/25"
          >
            <div className="w-8 h-8 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center font-bold text-xs relative border border-emerald-500/30">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping mr-1" />
              LIVE
            </div>
            <div>
              <p className="text-xs font-bold text-[#FDF8F5]">{protoDevice.product} ({protoDevice.device_id})</p>
              <p className="text-[10px] text-[#FFAA00] font-mono font-semibold">
                {protoDevice.temperature}°C • {protoDevice.humidity}% • MQ135: {protoDevice.mq135_raw}
              </p>
            </div>
            <ChevronRight className="w-4 h-4 text-[#B8A89E]" />
          </div>
        )}
      </div>

      {/* Hero QR Scan Card */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="glass-panel p-6 sm:p-8 text-[#FDF8F5] relative overflow-hidden shadow-2xl border border-[#FF6A00]/30 bg-gradient-to-br from-[#26160E]/90 via-[#1C120C]/85 to-[#0F0A07]/95"
      >
        {/* Decorative glowing background elements */}
        <div className="absolute right-[-10%] top-[-10%] w-64 h-64 rounded-full bg-[#FF6A00]/15 blur-3xl pointer-events-none" />
        <div className="absolute left-[-5%] bottom-[-20%] w-56 h-56 rounded-full bg-[#FFAA00]/15 blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FF6A00]/15 backdrop-blur-md border border-[#FF6A00]/35 text-xs font-bold text-[#FFAA00]">
            <Sparkles className="w-3.5 h-3.5 text-[#FFAA00]" />
            <span>Instant ESP32 Telemetry Lookup</span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-black tracking-tight leading-tight text-[#FDF8F5]">
            Scan the Code.<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF6A00] via-[#FF9020] to-[#FFAA00] drop-shadow-[0_0_20px_rgba(255,106,0,0.4)]">
              Know the Truth.
            </span>
          </h2>

          <p className="text-sm font-medium text-[#D6C8C0] leading-relaxed max-w-md">
            Scan the QR code on your food package to view live monitoring data directly from ESP32 sensors.
          </p>

          <div className="pt-2">
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => navigate('/scan')}
              className="py-4 px-8 rounded-2xl font-black text-sm text-[#FFFFFF] btn-orange transition-all flex items-center justify-center gap-3 cursor-pointer shadow-xl shadow-[#FF6A00]/40"
            >
              <QrCode className="w-5 h-5 text-white" />
              <span>SCAN PRODUCT</span>
              <ArrowRight className="w-4 h-4 text-white" />
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* Feature Cards Grid */}
      <div className="grid grid-cols-3 gap-3">
        <div 
          onClick={() => navigate('/scan')}
          className="glass-card card-hover p-3.5 sm:p-4 rounded-2xl text-center cursor-pointer flex flex-col items-center border border-[#FF6A00]/25"
        >
          <div className="w-10 h-10 rounded-xl bg-[#FF6A00]/15 text-[#FFAA00] flex items-center justify-center mb-2 shadow-sm border border-[#FF6A00]/30">
            <QrCode className="w-5 h-5" />
          </div>
          <span className="text-xs font-bold text-[#FDF8F5]">QR Scanner</span>
          <span className="text-[10px] text-[#B8A89E] mt-0.5">Live Camera</span>
        </div>

        <div 
          onClick={() => navigate('/products')}
          className="glass-card card-hover p-3.5 sm:p-4 rounded-2xl text-center cursor-pointer flex flex-col items-center border border-[#FF6A00]/25"
        >
          <div className="w-10 h-10 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center mb-2 shadow-sm border border-emerald-500/30">
            <Cpu className="w-5 h-5" />
          </div>
          <span className="text-xs font-bold text-[#FDF8F5]">My Packages</span>
          <span className="text-[10px] text-[#B8A89E] mt-0.5">Track Devices</span>
        </div>

        <div 
          onClick={() => navigate('/scan-history')}
          className="glass-card card-hover p-3.5 sm:p-4 rounded-2xl text-center cursor-pointer flex flex-col items-center border border-[#FF6A00]/25"
        >
          <div className="w-10 h-10 rounded-xl bg-[#FFAA00]/15 text-[#FFAA00] flex items-center justify-center mb-2 shadow-sm border border-[#FFAA00]/30">
            <Clock className="w-5 h-5" />
          </div>
          <span className="text-xs font-bold text-[#FDF8F5]">Scan History</span>
          <span className="text-[10px] text-[#B8A89E] mt-0.5">Past Logs</span>
        </div>
      </div>

      {/* Recently Scanned Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-[#FDF8F5] flex items-center gap-2">
            <Clock className="w-4 h-4 text-[#FFAA00]" />
            <span>Recently Scanned</span>
          </h3>
          <button
            onClick={() => navigate('/scan-history')}
            className="text-xs font-bold text-[#FFAA00] hover:underline"
          >
            View All ({userScans.length})
          </button>
        </div>

        {userScans.length === 0 ? (
          <div className="glass-card p-6 rounded-2xl text-center border border-[#FF6A00]/20">
            <p className="text-xs text-[#B8A89E]">No packages scanned yet.</p>
            <button
              onClick={() => navigate('/scan')}
              className="mt-2 text-xs font-bold text-[#FFAA00] hover:underline"
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
                  className="glass-card card-hover p-4 rounded-2xl cursor-pointer flex items-center justify-between border border-[#FF6A00]/20"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#FF6A00]/20 to-[#FFAA00]/10 border border-[#FF6A00]/30 text-[#FFAA00] flex items-center justify-center font-black text-sm shadow-sm">
                      {scan.product ? scan.product.charAt(0).toUpperCase() : 'P'}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-[#FDF8F5]">{scan.product || 'Food Package'}</h4>
                      <p className="text-xs font-mono font-semibold text-[#FFAA00]">{scan.device_id}</p>
                      <p className="text-[10px] text-[#B8A89E] mt-0.5">
                        Scanned: {new Date(scan.scanned_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                      LIVE
                    </span>
                    <p className="text-xs font-bold text-[#FDF8F5] mt-1 font-mono">
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

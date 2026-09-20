import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { 
  QrCode, 
  Thermometer, 
  Droplets, 
  Wind, 
  ShieldCheck, 
  ArrowRight, 
  Scan,
  Sparkles,
  RefreshCw,
  ExternalLink,
  Activity,
  Zap,
  Radio
} from 'lucide-react';
import { useFreshness } from '../context/FreshnessContext';
import { SensorCard } from '../components/common/SensorCard';
import { StatusBadge } from '../components/common/StatusBadge';
import { FreshnessGauge } from '../components/common/FreshnessGauge';

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { 
    activeItem, 
    sensorData, 
    freshnessReport, 
    simulateScan, 
    isScanning 
  } = useFreshness();

  const handleSimulateScan = async () => {
    try {
      const item = await simulateScan('FRX1004');
      navigate(`/live-data/${item.id}`);
    } catch (e) {
      console.warn(e);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.45, ease: [0.16, 1, 0.3, 1] },
    },
  };

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-8 select-none"
    >
      {/* Top Banner with Orange Accent Glow */}
      <motion.div 
        variants={itemVariants}
        className="card-solid p-6 sm:p-8 relative overflow-hidden shadow-2xl border border-[#FF6A00]/25"
      >
        {/* Ambient Top Glow Line */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#FF6A00]/60 to-transparent" />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          {/* Left Text */}
          <div className="lg:col-span-8 space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FF6A00]/10 border border-[#FF6A00]/30 text-[11px] font-extrabold text-[#FFAA00] uppercase tracking-wider">
              <span className="w-2 h-2 rounded-full bg-[#20E79A] animate-ping" />
              <span>Real-Time Sensor Telemetry Online</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-[#FDF8F5] tracking-tight">
              Monitor Food Freshness in Real-Time
            </h1>
            <p className="text-sm text-[#B8A89E] max-w-xl leading-relaxed">
              Scan a QR code or RFID tag to check food quality and freshness instantly. View temperature, humidity, and VOC gas telemetry directly from your connected IoT sensors.
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-3">
              <motion.button
                whileHover={{ scale: 1.04, y: -2 }}
                whileTap={{ scale: 0.96 }}
                onClick={() => navigate('/scan')}
                className="px-5 py-2.5 rounded-xl font-bold text-[#140C08] btn-orange flex items-center gap-2 cursor-pointer shadow-[0_4px_20px_rgba(255,106,0,0.35)]"
              >
                <Scan className="w-4 h-4" />
                <span>Scan Product Now</span>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.04, y: -2 }}
                whileTap={{ scale: 0.96 }}
                onClick={handleSimulateScan}
                disabled={isScanning}
                className="px-4 py-2.5 rounded-xl text-xs font-bold text-[#FFAA00] bg-[#1E140E] hover:bg-[#302017] border border-[#FF6A00]/40 flex items-center gap-2 cursor-pointer transition-colors shadow-md disabled:opacity-50"
              >
                {isScanning ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#FFAA00]" />
                ) : (
                  <Sparkles className="w-3.5 h-3.5 text-[#FFAA00]" />
                )}
                <span>Simulate Scan (#FRX1004)</span>
              </motion.button>
            </div>
          </div>

          {/* Right Preview Box */}
          <div className="lg:col-span-4 flex justify-center lg:justify-end">
            {activeItem ? (
              <motion.div 
                whileHover={{ scale: 1.03, y: -2 }}
                onClick={() => navigate(`/live-data/${activeItem.id}`)}
                className="w-full max-w-xs p-4 rounded-2xl bg-[#1E140E] border border-[#FF6A00]/40 hover:border-[#FF6A00] transition-all cursor-pointer flex items-center gap-3.5 group shadow-xl"
              >
                <img
                  src={activeItem.image}
                  alt={activeItem.name}
                  className="w-16 h-16 rounded-xl object-cover border border-[#3D261A]"
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-[#FDF8F5] truncate">{activeItem.name}</span>
                    <StatusBadge status={freshnessReport?.status || 'Fresh'} size="sm" />
                  </div>
                  <p className="text-xs text-[#FFAA00] font-mono mt-0.5">{activeItem.tagId}</p>
                  <span className="text-[11px] text-[#FF6A00] flex items-center gap-1 mt-1 font-bold group-hover:underline">
                    View telemetry <ArrowRight className="w-3 h-3 transition-transform group-hover:translate-x-1" />
                  </span>
                </div>
              </motion.div>
            ) : (
              <div className="w-full max-w-xs p-6 rounded-2xl bg-[#1E140E]/60 border border-dashed border-[#3D261A] flex flex-col items-center justify-center text-center space-y-2">
                <div className="w-12 h-12 rounded-xl bg-[#261A12] border border-[#3D261A] flex items-center justify-center text-[#8C7A70]">
                  <QrCode className="w-6 h-6" />
                </div>
                <p className="text-xs font-bold text-[#FDF8F5]">No Product Scanned Yet</p>
                <p className="text-[11px] text-[#8C7A70]">Tap "Scan Product Now" to start</p>
              </div>
            )}
          </div>
        </div>
      </motion.div>

      {/* Middle Section: Active Sensor Telemetry */}
      <motion.div variants={itemVariants} className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h2 className="text-lg font-black text-[#FDF8F5] flex items-center gap-2">
              <span>{activeItem ? 'Current Active Sensor Telemetry' : 'Ready to Scan'}</span>
              {activeItem && (
                <span className="w-2 h-2 rounded-full bg-[#20E79A] animate-ping" />
              )}
            </h2>
            <p className="text-xs text-[#B8A89E]">
              {activeItem 
                ? `Live telemetry feeds updating continuously for ${activeItem.name} (${activeItem.tagId})`
                : 'Waiting for QR or RFID input...'}
            </p>
          </div>

          {activeItem && (
            <motion.button
              whileHover={{ x: 3 }}
              onClick={() => navigate(`/live-data/${activeItem.id}`)}
              className="text-xs font-bold text-[#FFAA00] hover:text-[#FF6A00] flex items-center gap-1.5 cursor-pointer"
            >
              <span>View Full Analytics</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </motion.button>
          )}
        </div>

        {/* 4 Sensor Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <SensorCard
            title="Temperature"
            value={activeItem && sensorData ? `${sensorData.temperature}` : '--'}
            unit="°C"
            status={activeItem ? (freshnessReport?.tempStatus || 'Normal') : undefined}
            icon={<Thermometer className="w-4 h-4" />}
            iconBgColor="bg-[#FF5A67]/15"
            iconColor="text-[#FF5A67]"
            isEmpty={!activeItem}
          />

          <SensorCard
            title="Humidity"
            value={activeItem && sensorData ? `${sensorData.humidity}` : '--'}
            unit="%"
            status={activeItem ? (freshnessReport?.humidityStatus || 'Normal') : undefined}
            icon={<Droplets className="w-4 h-4" />}
            iconBgColor="bg-[#FFAA00]/15"
            iconColor="text-[#FFAA00]"
            isEmpty={!activeItem}
          />

          <SensorCard
            title="Gas (VOC)"
            value={activeItem && sensorData ? `${sensorData.gas}` : '--'}
            unit="ppm"
            status={activeItem ? (freshnessReport?.gasStatus || 'Normal') : undefined}
            icon={<Wind className="w-4 h-4" />}
            iconBgColor="bg-[#FF6A00]/15"
            iconColor="text-[#FF6A00]"
            isEmpty={!activeItem}
          />

          <SensorCard
            title="Status"
            value={activeItem && freshnessReport ? freshnessReport.status : '---'}
            status={activeItem && freshnessReport ? freshnessReport.status : undefined}
            icon={<ShieldCheck className="w-4 h-4" />}
            iconBgColor="bg-[#20E79A]/15"
            iconColor="text-[#20E79A]"
            isEmpty={!activeItem}
          />
        </div>
      </motion.div>

      {/* Quick Action Guides with Hover Physics */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-2">
        <motion.div
          whileHover={{ y: -5, scale: 1.02 }}
          transition={{ type: 'spring', stiffness: 350, damping: 25 }}
          onClick={() => navigate('/scan')}
          className="card-solid p-5 flex items-start gap-4 hover:border-[#FF6A00]/40 cursor-pointer group shadow-xl"
        >
          <div className="w-10 h-10 rounded-xl bg-[#FF6A00]/15 text-[#FF6A00] border border-[#FF6A00]/30 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
            <QrCode className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[#FDF8F5]">Camera & RFID Reader</h3>
            <p className="text-xs text-[#8C7A70] mt-1 leading-relaxed">
              Open scanner viewport to detect barcode or manual Tag ID.
            </p>
          </div>
        </motion.div>

        <motion.div
          whileHover={{ y: -5, scale: 1.02 }}
          transition={{ type: 'spring', stiffness: 350, damping: 25 }}
          onClick={() => navigate('/history')}
          className="card-solid p-5 flex items-start gap-4 hover:border-[#FF6A00]/40 cursor-pointer group shadow-xl"
        >
          <div className="w-10 h-10 rounded-xl bg-[#20E79A]/15 text-[#20E79A] border border-[#20E79A]/30 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[#FDF8F5]">Audit History</h3>
            <p className="text-xs text-[#8C7A70] mt-1 leading-relaxed">
              Browse previously logged batch scans and temperature logs.
            </p>
          </div>
        </motion.div>

        <motion.div
          whileHover={{ y: -5, scale: 1.02 }}
          transition={{ type: 'spring', stiffness: 350, damping: 25 }}
          onClick={() => navigate('/analytics')}
          className="card-solid p-5 flex items-start gap-4 hover:border-[#FF6A00]/40 cursor-pointer group shadow-xl"
        >
          <div className="w-10 h-10 rounded-xl bg-[#FFAA00]/15 text-[#FFAA00] border border-[#FFAA00]/30 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[#FDF8F5]">Quality Analytics</h3>
            <p className="text-xs text-[#8C7A70] mt-1 leading-relaxed">
              View fresh item ratios, spoilage trends, and shelf-life metrics.
            </p>
          </div>
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

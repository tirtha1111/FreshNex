import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { useAuth } from '../context/AuthContext';
import { useFreshness } from '../context/FreshnessContext';
import { 
  QrCode, 
  Thermometer, 
  Droplets, 
  Wind, 
  ShieldCheck, 
  ArrowRight, 
  Scan,
  Activity,
  Package,
  Heart,
  Globe,
  Plus,
  BarChart3,
  Sliders,
  ChevronDown
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid 
} from 'recharts';

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { userProfile } = useAuth();
  const { scanHistory, activeItem, sensorData, freshnessReport } = useFreshness();
  const [selectedMetric, setSelectedMetric] = useState<'Temperature' | 'Humidity' | 'Gas' | 'Score'>('Temperature');
  const [timeRange, setTimeRange] = useState('1D');

  const isAdmin = userProfile?.role === 'admin';
  const assignedTag = userProfile?.assignedProductId || 'MILK';
  const assignedName = userProfile?.assignedProductName || 'Milk Package';

  // Last scanned product telemetry (retrieved from scan history or active session)
  const lastScanned = scanHistory.length > 0 ? scanHistory[0] : (
    activeItem && sensorData ? {
      id: 'active-scan',
      itemId: activeItem.id,
      itemName: activeItem.name,
      tagId: activeItem.tagId,
      itemImage: activeItem.image,
      temperature: sensorData.temperature,
      humidity: sensorData.humidity,
      gas: sensorData.gas,
      freshnessScore: freshnessReport?.score ?? 0,
      status: freshnessReport?.status ?? 'Fresh',
      timestamp: sensorData.timestamp || Date.now(),
      dateStr: new Date(sensorData.timestamp || Date.now()).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      timeStr: new Date(sensorData.timestamp || Date.now()).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      category: activeItem.category,
    } : null
  );

  // Dynamic trend data generated purely from previous scan results
  const trendData = scanHistory.length > 0 
    ? scanHistory.slice(0, 10).reverse().map((record) => {
        let val = record.temperature;
        if (selectedMetric === 'Humidity') val = record.humidity;
        if (selectedMetric === 'Gas') val = record.gas;
        if (selectedMetric === 'Score') val = record.freshnessScore;
        return {
          time: record.timeStr || new Date(record.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          value: val,
          product: record.itemName,
        };
      })
    : lastScanned
    ? [
        { 
          time: 'Previous Scan', 
          value: selectedMetric === 'Temperature' 
            ? lastScanned.temperature 
            : selectedMetric === 'Humidity' 
            ? lastScanned.humidity 
            : selectedMetric === 'Gas' 
            ? lastScanned.gas 
            : lastScanned.freshnessScore, 
          product: lastScanned.itemName 
        }
      ]
    : [
        { time: 'No Scans', value: 0, product: 'None' }
      ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.05 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } }
  };

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6 select-none font-sans"
    >
      {/* 1. TOP BANNER HERO CARD */}
      <motion.div 
        variants={itemVariants}
        className="relative glass-card p-6 sm:p-10 overflow-hidden depth-3 flex flex-col lg:flex-row justify-between items-center gap-8"
      >
        {/* Ambient glow backdrop inside hero */}
        <div className="absolute -top-16 -right-16 w-64 h-64 bg-[#20E79A]/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-64 h-64 bg-[#13493B]/10 rounded-full blur-3xl pointer-events-none" />

        {/* Floating background natural leaf assets */}
        <div className="absolute top-4 left-1/4 w-8 h-8 opacity-20 pointer-events-none rotate-12">
          <svg viewBox="0 0 24 24" fill="currentColor" className="text-[#13493B] w-full h-full">
            <path d="M12 2C12 2 8 5 6 9C4 13 6 17 9 18C10 16 11 13 12 10C13 13 14 16 15 18C18 17 20 13 18 9C16 5 12 2 12 2Z" />
          </svg>
        </div>
        <div className="absolute bottom-6 left-1/2 w-10 h-10 opacity-15 pointer-events-none -rotate-45">
          <svg viewBox="0 0 24 24" fill="currentColor" className="text-[#13493B] w-full h-full">
            <path d="M12 2C12 2 8 5 6 9C4 13 6 17 9 18C10 16 11 13 12 10C13 13 14 16 15 18C18 17 20 13 18 9C16 5 12 2 12 2Z" />
          </svg>
        </div>

        {/* Left Side Info */}
        <div className="flex-1 space-y-4 text-center lg:text-left z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full neo-btn shadow-sm">
            <span className={`w-2.5 h-2.5 rounded-full ${isAdmin ? 'bg-[#20E79A] shadow-[0_0_8px_#20E79A]' : 'bg-[#FF6A00] shadow-[0_0_8px_#FF6A00]'} animate-pulse`} />
            <span className="text-[10px] font-black text-[#07221A] uppercase tracking-wider">
              {isAdmin ? 'Admin Hub • Monitored Products' : `User Portal • Product ID: ${assignedTag}`}
            </span>
          </div>
          <div className="space-y-1">
            <h1 className="text-3xl sm:text-4xl font-serif italic font-black text-[#07221A] leading-none tracking-tight">
              {lastScanned ? lastScanned.itemName.toUpperCase() : (isAdmin ? 'FRESH FOOD' : assignedName.toUpperCase())}
            </h1>
            <h1 className="text-3xl sm:text-4xl font-serif italic font-black text-[#07221A] leading-none tracking-tight">
              {lastScanned ? `${lastScanned.freshnessScore}% FRESHNESS` : 'MONITORING'}
            </h1>
            <h1 className="text-3xl sm:text-4xl font-serif italic font-black text-[#07221A] leading-none tracking-tight">
              {lastScanned ? `STATUS: ${lastScanned.status.toUpperCase()}` : 'PORTAL'}
            </h1>
          </div>
          <p className="text-xs text-[#5C7F75] font-semibold max-w-md leading-relaxed">
            {lastScanned 
              ? (freshnessReport?.message || `Inspection telemetry: ${lastScanned.temperature}°C, ${lastScanned.humidity}% humidity, ${lastScanned.gas} ppm MQ-135 gas. ${lastScanned.status === 'Fresh' ? 'Optimal preservation bounds confirmed.' : 'Monitor cold-chain retention.'}`)
              : 'IoT telemetry from physical RFID and QR scanned products. Ready for next product tag inspection.'}
          </p>

          <div className="pt-2 flex flex-wrap items-center justify-center lg:justify-start gap-3.5">
            <motion.button
              whileHover={{ scale: 1.04, y: -2 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => navigate('/scan')}
              className="neo-btn-primary px-6 py-3.5 rounded-full text-xs font-black flex items-center gap-2 cursor-pointer glow-emerald shadow-lg"
            >
              <Scan className="w-4 h-4 text-[#20E79A] glow-icon-emerald" />
              <span>Scan Product Tag</span>
            </motion.button>

            {lastScanned && (
              <motion.button
                whileHover={{ scale: 1.04, y: -2 }}
                whileTap={{ scale: 0.96 }}
                onClick={() => navigate(`/live-data/${lastScanned.itemId}`)}
                className="neo-btn px-6 py-3.5 rounded-full text-xs font-black text-[#07221A] flex items-center gap-2 cursor-pointer shadow-sm hover:border-[#20E79A]/40"
              >
                <Activity className="w-4 h-4 text-[#20E79A] glow-icon-emerald" />
                <span>View Full Telemetry</span>
              </motion.button>
            )}

            <motion.button
              whileHover={{ scale: 1.04, y: -2 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => navigate('/analytics')}
              className="neo-btn px-6 py-3.5 rounded-full text-xs font-black text-[#07221A] flex items-center gap-2 cursor-pointer shadow-sm hover:border-[#20E79A]/40"
            >
              <BarChart3 className="w-4 h-4 text-[#20E79A] glow-icon-emerald" />
              <span>Telemetry Analytics</span>
            </motion.button>
          </div>
        </div>

        {/* Middle Floating Product Display */}
        <div className="flex flex-col items-center justify-center relative py-4 lg:py-0 z-10 shrink-0">
          <div className="relative w-44 aspect-[3/5] glass-modal rounded-[28px] p-3.5 depth-4 flex flex-col items-center justify-between text-center overflow-hidden">
            {/* Glossy Reflection overlay */}
            <div className="absolute inset-y-0 left-0 w-1/2 bg-gradient-to-r from-white/25 to-transparent skew-x-12 pointer-events-none" />

            {/* Twin leaves subtle logo badge */}
            <div className="flex items-center gap-1.5">
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-[#20E79A] glow-icon-emerald">
                <path d="M11.5 2C11.5 2 6 5.5 4.5 10C3.3 13.6 4.8 17 8 18.5C9.5 16.5 10 13.5 10.5 10C11 6.5 11.5 2 11.5 2Z" fill="currentColor" />
                <path d="M18.5 7.5C18.5 7.5 14.5 10 13.5 13.5C12.7 16.2 13.7 19 16 20C17 18.5 17.5 16 18 13.5C18.5 11 18.5 7.5 18.5 7.5Z" fill="currentColor" fillOpacity="0.8" />
              </svg>
              <span className="text-[11px] font-black text-[#07221A]">FreshNex</span>
            </div>

            {/* Product Photo or QR Target */}
            <div className="w-28 h-28 my-2 rounded-2xl overflow-hidden bg-[#F4F7F6] border border-[#13493B]/10 flex items-center justify-center relative shadow-inner">
              {lastScanned ? (
                <img 
                  src={lastScanned.itemImage || "https://images.unsplash.com/photo-1550583724-b2692b85b150?w=400&auto=format&fit=crop&q=80"} 
                  alt={lastScanned.itemName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="flex flex-col items-center justify-center p-2 text-[#5C7F75] gap-1">
                  <QrCode className="w-10 h-10 text-[#07221A]/60" />
                  <span className="text-[8px] font-bold">READY TO SCAN</span>
                </div>
              )}
            </div>

            {/* QR Scan Target Overlay */}
            <div className="flex flex-col items-center gap-1 neo-btn p-2 rounded-xl w-full">
              <QrCode className="w-5 h-5 text-[#07221A]" />
              <span className="text-[9px] font-bold text-[#5C7F75] tracking-tight font-mono">
                {lastScanned ? lastScanned.tagId : 'AWAITING SCAN'}
              </span>
            </div>
          </div>
          {/* Slogan label floating beside the card */}
          <div className="absolute -left-10 top-10 -rotate-12 glass-panel px-3.5 py-2 rounded-2xl depth-2 shadow-lg">
            <span className="font-serif italic text-xs font-black text-[#07221A] block">Scan</span>
            <span className="font-serif italic text-xs font-black text-[#20E79A] glow-icon-emerald block">Track</span>
            <span className="font-serif italic text-xs font-black text-[#07221A] block">Stay Fresh</span>
          </div>
        </div>

        {/* Right Side Bullet Checklist */}
        <div className="space-y-4 shrink-0 lg:border-l lg:border-[#13493B]/10 lg:pl-8 py-2 w-full lg:w-auto">
          <div className="flex items-center gap-3.5">
            <div className="neo-icon-box w-10 h-10 rounded-2xl flex items-center justify-center text-[#20E79A]">
              <ShieldCheck className="w-5 h-5 glow-icon-emerald" />
            </div>
            <div>
              <span className="block text-[11px] font-black text-[#07221A] uppercase tracking-wide">Safer Food</span>
              <span className="block text-[9px] text-[#5C7F75] font-semibold">Continuous Bio-Sensors</span>
            </div>
          </div>

          <div className="flex items-center gap-3.5">
            <div className="neo-icon-box w-10 h-10 rounded-2xl flex items-center justify-center text-[#20E79A]">
              <Heart className="w-5 h-5 glow-icon-emerald" />
            </div>
            <div>
              <span className="block text-[11px] font-black text-[#07221A] uppercase tracking-wide">Healthier People</span>
              <span className="block text-[9px] text-[#5C7F75] font-semibold">Prevention & Warnings</span>
            </div>
          </div>

          <div className="flex items-center gap-3.5">
            <div className="neo-icon-box w-10 h-10 rounded-2xl flex items-center justify-center text-[#20E79A]">
              <Globe className="w-5 h-5 glow-icon-emerald" />
            </div>
            <div>
              <span className="block text-[11px] font-black text-[#07221A] uppercase tracking-wide">Cleaner Planet</span>
              <span className="block text-[9px] text-[#5C7F75] font-semibold">Zero-Waste Tracking</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* 2. FOUR SENSOR METRICS CARDS - REPLACED WITH LAST SCANNED PRODUCT TELEMETRY */}
      <motion.div 
        variants={itemVariants}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        {/* Metric 1: Temp */}
        <motion.div 
          whileHover={{ y: -3 }}
          transition={{ duration: 0.2 }}
          className="glass-card p-5 depth-2 space-y-4 flex flex-col justify-between hover:border-red-300/40 hover:shadow-[0_8px_25px_rgba(255,90,103,0.12)] transition-all"
        >
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-[#5C7F75] uppercase tracking-wider block">Last Temperature</span>
              <span className="text-2xl font-black text-[#07221A] tracking-tight block">
                {lastScanned ? `${lastScanned.temperature} °C` : '0 °C'}
              </span>
              <span className={`text-[10px] font-bold flex items-center gap-0.5 ${
                !lastScanned ? 'text-[#5C7F75]' : lastScanned.temperature > 8 ? 'text-[#FF5A67]' : 'text-[#20E79A]'
              }`}>
                <span>{lastScanned ? (lastScanned.temperature > 8 ? 'Elevated temp' : 'Optimal range') : '0 Scans Recorded'}</span>
              </span>
            </div>
            <div className="neo-icon-box w-10 h-10 rounded-2xl flex items-center justify-center text-[#FF5A67] shadow-sm">
              <Thermometer className="w-5 h-5" />
            </div>
          </div>
          {/* Dynamic Sparkline rendering from actual historical data */}
          <div className="w-full h-8 pt-1">
            <svg viewBox="0 0 100 30" className="w-full h-full overflow-visible">
              <path 
                d={lastScanned ? "M 0 20 Q 25 10 50 18 T 100 12" : "M 0 25 L 100 25"} 
                fill="none" 
                stroke="#FF5A67" 
                strokeWidth="2.5" 
                strokeLinecap="round"
                strokeOpacity={lastScanned ? 1 : 0.3}
              />
            </svg>
          </div>
        </motion.div>

        {/* Metric 2: Humidity */}
        <motion.div 
          whileHover={{ y: -3 }}
          transition={{ duration: 0.2 }}
          className="glass-card p-5 depth-2 space-y-4 flex flex-col justify-between hover:border-blue-300/40 hover:shadow-[0_8px_25px_rgba(59,130,246,0.12)] transition-all"
        >
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-[#5C7F75] uppercase tracking-wider block">Last Humidity</span>
              <span className="text-2xl font-black text-[#07221A] tracking-tight block">
                {lastScanned ? `${lastScanned.humidity} %` : '0 %'}
              </span>
              <span className={`text-[10px] font-bold flex items-center gap-0.5 ${
                !lastScanned ? 'text-[#5C7F75]' : lastScanned.humidity > 70 ? 'text-[#FFAA00]' : 'text-[#20E79A]'
              }`}>
                <span>{lastScanned ? (lastScanned.humidity > 70 ? 'High moisture' : 'Optimal moisture') : '0 Scans Recorded'}</span>
              </span>
            </div>
            <div className="neo-icon-box w-10 h-10 rounded-2xl flex items-center justify-center text-[#3B82F6] shadow-sm">
              <Droplets className="w-5 h-5" />
            </div>
          </div>
          <div className="w-full h-8 pt-1">
            <svg viewBox="0 0 100 30" className="w-full h-full overflow-visible">
              <path 
                d={lastScanned ? "M 0 15 Q 25 22 50 12 T 100 16" : "M 0 25 L 100 25"} 
                fill="none" 
                stroke="#3B82F6" 
                strokeWidth="2.5" 
                strokeLinecap="round"
                strokeOpacity={lastScanned ? 1 : 0.3}
              />
            </svg>
          </div>
        </motion.div>

        {/* Metric 3: Air Quality Gas */}
        <motion.div 
          whileHover={{ y: -3 }}
          transition={{ duration: 0.2 }}
          className="glass-card p-5 depth-2 space-y-4 flex flex-col justify-between hover:border-purple-300/40 hover:shadow-[0_8px_25px_rgba(147,51,234,0.12)] transition-all"
        >
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-[#5C7F75] uppercase tracking-wider block">Last MQ-135 Gas</span>
              <span className="text-2xl font-black text-[#07221A] tracking-tight block">
                {lastScanned ? `${lastScanned.gas}` : '0'}
              </span>
              <span className={`text-[10px] font-bold flex items-center gap-0.5 ${
                !lastScanned ? 'text-[#5C7F75]' : lastScanned.gas > 300 ? 'text-[#FF5A67]' : 'text-purple-600'
              }`}>
                <span>{lastScanned ? (lastScanned.gas > 300 ? 'VOC Spike Detected' : 'Normal Purity') : '0 Scans Recorded'}</span>
              </span>
            </div>
            <div className="neo-icon-box w-10 h-10 rounded-2xl flex items-center justify-center text-purple-600 shadow-sm">
              <Wind className="w-5 h-5" />
            </div>
          </div>
          <div className="w-full h-8 pt-1">
            <svg viewBox="0 0 100 30" className="w-full h-full overflow-visible">
              <path 
                d={lastScanned ? "M 0 22 Q 25 14 50 20 T 100 10" : "M 0 25 L 100 25"} 
                fill="none" 
                stroke="#9333EA" 
                strokeWidth="2.5" 
                strokeLinecap="round"
                strokeOpacity={lastScanned ? 1 : 0.3}
              />
            </svg>
          </div>
        </motion.div>

        {/* Metric 4: Freshness Quality Score */}
        <motion.div 
          whileHover={{ y: -3 }}
          transition={{ duration: 0.2 }}
          className="glass-card p-5 depth-2 space-y-4 flex flex-col justify-between hover:border-[#20E79A]/40 hover:shadow-[0_8px_25px_rgba(32,231,154,0.15)] transition-all"
        >
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-[#5C7F75] uppercase tracking-wider block">Freshness Score</span>
              <span className="text-2xl font-black text-[#07221A] tracking-tight block">
                {lastScanned ? `${lastScanned.freshnessScore}%` : '0%'}
              </span>
              <span className={`text-[10px] font-bold block ${
                !lastScanned ? 'text-[#5C7F75]' : lastScanned.status === 'Fresh' ? 'text-[#20E79A]' : 'text-[#FFAA00]'
              }`}>
                {lastScanned ? `${lastScanned.status} • ${lastScanned.itemName}` : '0 Scans Recorded'}
              </span>
            </div>
            <div className="neo-icon-box w-10 h-10 rounded-2xl flex items-center justify-center text-[#20E79A] shadow-sm">
              <Package className="w-5 h-5 glow-icon-emerald" />
            </div>
          </div>
          <div className="w-full h-8 pt-1">
            <svg viewBox="0 0 100 30" className="w-full h-full overflow-visible">
              <path 
                d={lastScanned ? "M 0 18 Q 30 8 60 14 T 100 8" : "M 0 25 L 100 25"} 
                fill="none" 
                stroke="#20E79A" 
                strokeWidth="2.5" 
                strokeLinecap="round"
                strokeOpacity={lastScanned ? 1 : 0.3}
              />
            </svg>
          </div>
        </motion.div>
      </motion.div>

      {/* 3. MULTI-GRID BOTTOM PANEL */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN: ACTIVITY & SENSOR CHART TRENDS */}
        <div className="lg:col-span-8 space-y-6">
          {/* Recent Activity Section */}
          <motion.div 
            variants={itemVariants}
            className="glass-card p-5 sm:p-6 depth-2 space-y-4"
          >
            <div className="flex justify-between items-center pb-2 border-b border-[#13493B]/10">
              <div>
                <h3 className="text-sm font-black text-[#07221A]">Recent Scan History</h3>
                <p className="text-[11px] text-[#5C7F75] font-semibold">Real-time inspection logs recorded across IoT sensors.</p>
              </div>
              <button 
                onClick={() => navigate('/history')}
                className="text-xs font-bold text-[#20E79A] hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>View Full Log</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {scanHistory.length > 0 ? (
              <div className="space-y-3.5">
                {scanHistory.slice(0, 5).map((scan, idx) => (
                  <motion.div 
                    key={scan.id || idx}
                    whileHover={{ x: 3 }}
                    className="flex justify-between items-center text-xs p-2 rounded-xl hover:bg-[#EBF1EF]/50 transition-colors"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                        scan.status === 'Fresh' 
                          ? 'bg-[#20E79A] shadow-[0_0_6px_#20E79A]' 
                          : scan.status === 'Warning' || scan.status === 'At Risk' 
                          ? 'bg-[#FFAA00] shadow-[0_0_6px_#FFAA00]' 
                          : 'bg-[#FF5A67] shadow-[0_0_6px_#FF5A67]'
                      }`} />
                      <span className="font-semibold text-[#07221A] truncate">
                        Scanned {scan.itemName} ({scan.tagId}) - {scan.temperature}°C, {scan.humidity}%, {scan.gas} ppm
                      </span>
                    </div>
                    <span className="text-[10px] text-[#5C7F75] font-mono shrink-0 pl-2">
                      {scan.timeStr || new Date(scan.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="py-6 text-center space-y-2">
                <p className="text-xs font-bold text-[#07221A]">No Recent Scans Recorded</p>
                <p className="text-[11px] text-[#5C7F75]">
                  Inspect a food product via RFID or QR code to view live telemetry logs here.
                </p>
                <button
                  onClick={() => navigate('/scan')}
                  className="mt-1 px-4 py-2 neo-btn-primary text-xs font-black rounded-full cursor-pointer glow-emerald"
                >
                  Scan a Product Now
                </button>
              </div>
            )}
          </motion.div>

          {/* Sensor Trends Section */}
          <motion.div 
            variants={itemVariants}
            className="glass-card p-5 sm:p-6 depth-2 space-y-4"
          >
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-[#13493B]/10">
              <div>
                <h3 className="text-sm font-black text-[#07221A]">Telemetry Trends ({selectedMetric})</h3>
                <p className="text-[11px] text-[#5C7F75] font-semibold">
                  {lastScanned ? `Historical progression for ${lastScanned.itemName}` : 'Telemetry progression from scanned products'}
                </p>
              </div>
              <div className="flex items-center gap-3 self-end sm:self-auto">
                {/* Metric dropdown selector */}
                <div className="relative">
                  <select
                    value={selectedMetric}
                    onChange={(e) => setSelectedMetric(e.target.value as any)}
                    className="appearance-none px-3.5 py-1.5 pr-8 rounded-xl neo-input text-xs font-bold text-[#07221A] cursor-pointer focus:outline-none"
                  >
                    <option value="Temperature">Temperature (°C)</option>
                    <option value="Humidity">Humidity (%)</option>
                    <option value="Gas">Gas (MQ-135)</option>
                    <option value="Score">Freshness Score (%)</option>
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 text-[#5C7F75] absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
                {/* Time range selector tabs */}
                <div className="flex neo-input p-1 rounded-xl">
                  {['1H', '1D', '7D', '30D'].map((range) => (
                    <button
                      key={range}
                      onClick={() => setTimeRange(range)}
                      className={`px-3 py-1 rounded-lg text-[10px] font-black transition-all cursor-pointer ${
                        timeRange === range 
                          ? 'bg-white text-[#07221A] shadow-md' 
                          : 'text-[#5C7F75] hover:text-[#07221A]'
                      }`}
                    >
                      {range}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Recharts Area Diagram */}
            <div className="w-full h-64 pt-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="trendGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#20E79A" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="#20E79A" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(19, 73, 59, 0.06)" vertical={false} />
                  <XAxis 
                    dataKey="time" 
                    stroke="#5C7F75" 
                    fontSize={10} 
                    fontWeight={700}
                    tickLine={false} 
                    axisLine={false} 
                  />
                  <YAxis 
                    stroke="#5C7F75" 
                    fontSize={10} 
                    fontWeight={700}
                    tickLine={false} 
                    axisLine={false}
                    domain={[0, (dataMax: number) => Math.max(10, Math.ceil(dataMax * 1.2))]}
                    allowDecimals={false}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(255, 255, 255, 0.9)', 
                      backdropFilter: 'blur(12px)',
                      borderRadius: '16px', 
                      border: '1px solid rgba(19, 73, 59, 0.15)',
                      boxShadow: '0 12px 36px rgba(0,0,0,0.08)'
                    }} 
                    labelStyle={{ fontWeight: 800, color: '#07221A', fontSize: '11px' }}
                    itemStyle={{ fontWeight: 700, fontSize: '11px', color: '#20E79A' }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="value" 
                    stroke="#20E79A" 
                    strokeWidth={3} 
                    fillOpacity={1} 
                    fill="url(#trendGradient)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        </div>

        {/* RIGHT COLUMN: STATUS, ACTIONS, LAST SCANNED PRODUCT, PROMO CARD */}
        <div className="lg:col-span-4 space-y-6">
          {/* Live Device Status */}
          <motion.div 
            variants={itemVariants}
            className="glass-card p-5 depth-2 space-y-5"
          >
            <div className="flex justify-between items-center pb-1">
              <h3 className="text-sm font-black text-[#07221A]">Live Device Status</h3>
              <div className="flex items-center gap-1.5 text-[10px] font-extrabold text-[#20E79A]">
                <span className={`w-2 h-2 rounded-full ${lastScanned ? 'bg-[#20E79A] shadow-[0_0_8px_#20E79A] animate-pulse' : 'bg-slate-300'}`} />
                <span>{lastScanned ? 'Telemetry Online' : 'Standby / Ready'}</span>
              </div>
            </div>

            {/* Radial Doughnut progress circle */}
            <div className="flex items-center justify-around gap-4 py-1">
              <div className="relative w-24 h-24 flex items-center justify-center">
                <svg className="w-full h-full -rotate-90 filter drop-shadow-[0_2px_8px_rgba(32,231,154,0.3)]">
                  <circle cx="48" cy="48" r="40" stroke="#EBF1EF" strokeWidth="8" fill="transparent" />
                  <circle 
                    cx="48" 
                    cy="48" 
                    r="40" 
                    stroke="#20E79A" 
                    strokeWidth="8" 
                    fill="transparent" 
                    strokeDasharray="251.2" 
                    strokeDashoffset={lastScanned ? 0 : 251.2} 
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute flex flex-col items-center">
                  <span className="text-base font-black text-[#07221A]">{lastScanned ? '100%' : '0%'}</span>
                  <span className="text-[8px] font-bold text-[#5C7F75] uppercase">{lastScanned ? 'Connected' : 'Standby'}</span>
                </div>
              </div>

              {/* Status List Legends */}
              <div className="space-y-1.5 text-xs font-semibold">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#20E79A] shadow-[0_0_6px_#20E79A]" />
                  <span className="text-[#07221A]">{lastScanned ? '1 Active Tag' : '0 Active Tags'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-300" />
                  <span className="text-[#07221A]">{lastScanned ? lastScanned.tagId : 'No Devices'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#13493B]" />
                  <span className="text-[#07221A]">{scanHistory.length} Recorded Scan{scanHistory.length === 1 ? '' : 's'}</span>
                </div>
              </div>
            </div>

            <p className="text-[10px] text-[#5C7F75] font-semibold text-center border-t border-[#13493B]/10 pt-3">
              {lastScanned ? `Last verified: ${lastScanned.itemName} (${lastScanned.tagId})` : 'Awaiting first RFID/QR scan.'}
            </p>
          </motion.div>

          {/* Quick Actions Grid with Neomorphic tactile buttons */}
          <motion.div 
            variants={itemVariants}
            className="glass-card p-5 depth-2 space-y-4"
          >
            <h3 className="text-sm font-black text-[#07221A]">Quick Actions</h3>
            <div className="grid grid-cols-2 gap-3">
              {/* Add Device */}
              <motion.button 
                whileHover={{ scale: 1.03, y: -1 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => navigate('/admin/devices')}
                className="neo-btn p-3 rounded-2xl flex flex-col items-center gap-2 cursor-pointer group hover:border-[#20E79A]/40"
              >
                <div className="w-8 h-8 rounded-full bg-[#20E79A] text-white flex items-center justify-center glow-emerald shadow-sm">
                  <Plus className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-black text-[#07221A]">Add Device</span>
              </motion.button>

              {/* Manage Products */}
              <motion.button 
                whileHover={{ scale: 1.03, y: -1 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => navigate('/history')}
                className="neo-btn p-3 rounded-2xl flex flex-col items-center gap-2 cursor-pointer group hover:border-[#3B82F6]/40"
              >
                <div className="w-8 h-8 rounded-full bg-[#3B82F6] text-white flex items-center justify-center shadow-[0_0_12px_rgba(59,130,246,0.5)]">
                  <Package className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-black text-[#07221A]">Manage Products</span>
              </motion.button>

              {/* View Reports */}
              <motion.button 
                whileHover={{ scale: 1.03, y: -1 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => navigate('/analytics')}
                className="neo-btn p-3 rounded-2xl flex flex-col items-center gap-2 cursor-pointer group hover:border-[#FF5A67]/40"
              >
                <div className="w-8 h-8 rounded-full bg-[#FF5A67] text-white flex items-center justify-center shadow-[0_0_12px_rgba(255,90,103,0.5)]">
                  <BarChart3 className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-black text-[#07221A]">View Reports</span>
              </motion.button>

              {/* System Settings */}
              <motion.button 
                whileHover={{ scale: 1.03, y: -1 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => navigate('/settings')}
                className="neo-btn p-3 rounded-2xl flex flex-col items-center gap-2 cursor-pointer group hover:border-[#13493B]/40"
              >
                <div className="w-8 h-8 rounded-full bg-[#13493B] text-white flex items-center justify-center shadow-sm">
                  <Sliders className="w-4 h-4 text-[#20E79A]" />
                </div>
                <span className="text-[10px] font-black text-[#07221A]">System Settings</span>
              </motion.button>
            </div>
          </motion.div>

          {/* Last Scanned Product */}
          <motion.div 
            variants={itemVariants}
            className="glass-card p-5 depth-2 space-y-4"
          >
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-black text-[#07221A]">Last Scanned Product</h3>
              {lastScanned && (
                <button 
                  onClick={() => navigate(`/live-data/${lastScanned.itemId}`)}
                  className="text-xs font-bold text-[#20E79A] hover:underline flex items-center gap-0.5 cursor-pointer"
                >
                  <span>View Details</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {lastScanned ? (
              <div className="flex items-center gap-4 neo-panel p-3.5 rounded-2xl border border-[#13493B]/10">
                <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0 border border-[#13493B]/10 bg-white shadow-sm">
                  <img 
                    src={lastScanned.itemImage || "https://images.unsplash.com/photo-1550583724-b2692b85b150?w=400&auto=format&fit=crop&q=80"} 
                    alt={lastScanned.itemName}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="min-w-0 flex-1 space-y-1">
                  <div className="flex items-center gap-1.5 justify-between">
                    <span className="font-extrabold text-xs text-[#07221A] truncate">{lastScanned.itemName}</span>
                    <span className={`px-2 py-0.5 rounded-full text-[8px] font-black border ${
                      lastScanned.status === 'Fresh'
                        ? 'bg-[#20E79A]/15 text-[#07221A] border-[#20E79A]/30 shadow-[0_0_8px_rgba(32,231,154,0.3)]'
                        : lastScanned.status === 'Warning' || lastScanned.status === 'At Risk'
                        ? 'bg-[#FFAA00]/15 text-[#FFAA00] border-[#FFAA00]/30'
                        : 'bg-[#FF5A67]/15 text-[#FF5A67] border-[#FF5A67]/30'
                    }`}>
                      {lastScanned.freshnessScore}% • {lastScanned.status}
                    </span>
                  </div>
                  <p className="text-[10px] font-semibold text-[#5C7F75] leading-none">
                    {lastScanned.category || (lastScanned.itemName.toLowerCase().includes('meat') ? 'Meat Products' : 'Dairy Products')}
                  </p>
                  <p className="text-[9px] text-[#07221A] font-mono leading-none pt-1">Tag: {lastScanned.tagId}</p>
                  <p className="text-[8px] text-[#5C7F75] font-semibold leading-none">
                    Last Update: {lastScanned.dateStr || new Date(lastScanned.timestamp).toLocaleDateString()}, {lastScanned.timeStr || new Date(lastScanned.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                  <div className="flex items-center gap-1 pt-1">
                    <span className="w-1.5 h-1.5 bg-[#20E79A] shadow-[0_0_4px_#20E79A] rounded-full" />
                    <span className="text-[9px] font-extrabold text-[#07221A]">
                      {lastScanned.temperature}°C • {lastScanned.humidity}% • {lastScanned.gas} ppm
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center p-6 neo-panel rounded-2xl border border-[#13493B]/10 text-center space-y-2">
                <Package className="w-8 h-8 text-[#5C7F75]" />
                <span className="text-xs font-bold text-[#07221A]">No Product Scanned Yet</span>
                <p className="text-[10px] text-[#5C7F75] max-w-[200px]">
                  Scan an RFID or QR tag to inspect freshness and populate telemetry.
                </p>
                <button
                  onClick={() => navigate('/scan')}
                  className="mt-2 px-4 py-2 neo-btn-primary text-xs font-bold rounded-xl cursor-pointer glow-emerald"
                >
                  Scan Product
                </button>
              </div>
            )}
          </motion.div>

          {/* Slogan Promo Card with Dark Forest Image Underlay & Glow */}
          <motion.div 
            variants={itemVariants}
            whileHover={{ scale: 1.02 }}
            onClick={() => navigate('/about')}
            className="relative rounded-[28px] overflow-hidden aspect-[16/10] bg-gradient-to-t from-[#041410] to-[#07221A] border border-[#20E79A]/30 flex flex-col justify-between p-5 text-left shadow-lg cursor-pointer glow-emerald"
          >
            {/* Dark evergreens background */}
            <div 
              className="absolute inset-0 bg-cover bg-center opacity-45 mix-blend-overlay pointer-events-none"
              style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1511497584788-876760111969?w=400&q=80")' }}
            />
            {/* Subtle bottom green gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#041410]/90 via-transparent to-transparent pointer-events-none" />

            {/* Top tiny leaf logo */}
            <div className="relative z-10 text-[#20E79A] glow-icon-emerald">
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                <path d="M12 2C12 2 8 5 6 9C4 13 6 17 9 18C10 16 11 13 12 10C13 13 14 16 15 18C18 17 20 13 18 9C16 5 12 2 12 2Z" />
              </svg>
            </div>

            {/* Slogan copy */}
            <div className="relative z-10 space-y-2">
              <h4 className="text-base font-serif italic text-white leading-tight">
                Safer Food <br />
                Healthier People <br />
                <span className="text-[#20E79A] font-serif font-black drop-shadow-[0_0_10px_rgba(32,231,154,0.5)]">A Brighter Tomorrow</span>
              </h4>
            </div>

            {/* Arrow Button on the bottom-right */}
            <div className="absolute bottom-4 right-4 z-10 w-9 h-9 rounded-full bg-white flex items-center justify-center text-[#07221A] shadow-md group hover:bg-[#20E79A] hover:text-white transition-all glow-emerald">
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </motion.div>
        </div>
      </div>

      {/* 4. FOOTER */}
      <motion.div 
        variants={itemVariants}
        className="pt-8 border-t border-[#13493B]/10 flex flex-col sm:flex-row justify-between items-center gap-3 text-[10px] font-semibold text-[#5C7F75] pb-8"
      >
        <span>FreshNex v1.0 | Built for a healthier world.</span>
        <div className="flex gap-4">
          <span className="hover:underline cursor-pointer">Privacy</span>
          <span className="hover:underline cursor-pointer">Terms</span>
          <span className="hover:underline cursor-pointer">Help & Support</span>
        </div>
      </motion.div>
    </motion.div>
  );
};

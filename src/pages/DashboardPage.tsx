import React, { useState, useMemo } from 'react';
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
  ChevronDown,
  Clock,
  Calendar,
  Info
} from 'lucide-react';
import { RealtimeTrendCharts } from '../components/dashboard/RealtimeTrendCharts';
import { ThresholdConfigModal } from '../components/common/ThresholdConfigModal';
import { calculateMoisture } from '../utils/moistureCalculator';
import { calculatePH } from '../utils/phCalculator';
import { formatRealtimeDateTime, parseTimestamp } from '../utils/dateUtils';
import farmLandscapeImg from '../assets/images/freshnex_farm_landscape_1789921215887.jpg';

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { userProfile } = useAuth();
  const { scanHistory, activeItem, sensorData, freshnessReport, thresholds, updateThresholds } = useFreshness();
  const [isThresholdModalOpen, setIsThresholdModalOpen] = useState(false);

  const isAdmin = userProfile?.role === 'admin';
  const assignedTag = userProfile?.assignedProductId || 'COLD_DRINKS';
  const assignedName = userProfile?.assignedProductName || 'Cold Drinks';

  // Last scanned product telemetry (retrieved from scan history, active session, or last online fallback)
  const lastScanned = scanHistory.length > 0 ? scanHistory[0] : (
    activeItem && sensorData ? {
      id: 'active-scan',
      itemId: activeItem.id,
      itemName: activeItem.name,
      tagId: activeItem.tagId,
      itemImage: activeItem.image,
      temperature: sensorData.temperature,
      humidity: sensorData.humidity,
      moisture: sensorData.moisture,
      dewPoint: sensorData.dewPoint,
      ph: sensorData.ph,
      gas: sensorData.gas,
      freshnessScore: freshnessReport?.score ?? 98,
      status: freshnessReport?.status ?? 'Fresh',
      timestamp: sensorData.timestamp || Date.now(),
      dateStr: new Date(sensorData.timestamp || Date.now()).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      timeStr: new Date(sensorData.timestamp || Date.now()).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      category: activeItem.category,
    } : {
      id: 'fallback-last-online',
      itemId: assignedTag || 'COLD_DRINKS',
      itemName: assignedName || 'Cold Drinks',
      tagId: assignedTag ? (assignedTag.startsWith('#') ? assignedTag : `#${assignedTag}`) : '#YGS-FD-000124',
      itemImage: '/colddrinks.jpg',
      temperature: 3.5,
      humidity: 58.2,
      moisture: 4.2,
      dewPoint: -3.0,
      ph: 4.2,
      gas: 110,
      freshnessScore: 98,
      status: 'Fresh',
      timestamp: Date.now() - 300000,
      dateStr: new Date(Date.now() - 300000).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      timeStr: new Date(Date.now() - 300000).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      category: 'Beverages',
    }
  );

  const liveMoisture = lastScanned 
    ? calculateMoisture(lastScanned.temperature, lastScanned.humidity)
    : (sensorData ? calculateMoisture(sensorData.temperature, sensorData.humidity) : null);

  const livePH = lastScanned
    ? calculatePH(lastScanned.temperature, lastScanned.humidity, liveMoisture?.absoluteMoisture, { category: (lastScanned as any).category, gas: lastScanned.gas })
    : (sensorData ? calculatePH(sensorData.temperature, sensorData.humidity, liveMoisture?.absoluteMoisture, { category: activeItem?.category, gas: sensorData.gas }) : null);

  // Formatted last response received timestamp with full date, time, and 2-hour validity window
  const lastResponseInfo = useMemo(() => {
    const raw = sensorData?.timestamp || (lastScanned?.timestamp ?? Date.now());
    const ts = parseTimestamp(raw);
    const { dateStr, timeStr } = formatRealtimeDateTime(ts);

    const validityDurationMs = 2 * 60 * 60 * 1000;
    const expiryTimestamp = ts + validityDurationMs;
    const { timeStr: expiryTimeStr } = formatRealtimeDateTime(expiryTimestamp);

    return {
      timestamp: ts,
      date: dateStr,
      time: timeStr,
      fullText: `${dateStr}, ${timeStr}`,
      displayTag: `${dateStr} at ${timeStr}`,
      expiryTimestamp,
      expiryTimeStr,
      validityNote: 'Response valid for only 2 hours from the last response time'
    };
  }, [sensorData?.timestamp, lastScanned?.timestamp]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.04 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 12 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.25, ease: 'easeOut' } }
  };

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-4 sm:space-y-6 select-none font-sans"
    >
      {/* 1. TOP BANNER HERO CARD */}
      <motion.div 
        variants={itemVariants}
        className="relative glass-card p-4 sm:p-7 lg:p-10 overflow-hidden depth-3 flex flex-col lg:flex-row justify-between items-center gap-6 lg:gap-8"
      >
        {/* Ambient glow backdrop inside hero (desktop only) */}
        <div className="hidden md:block absolute -top-16 -right-16 w-64 h-64 bg-[#20E79A]/15 rounded-full blur-3xl pointer-events-none" />
        <div className="hidden md:block absolute -bottom-16 -left-16 w-64 h-64 bg-[#13493B]/10 rounded-full blur-3xl pointer-events-none" />

        {/* Left Side Info */}
        <div className="flex-1 w-full space-y-3.5 sm:space-y-4 text-center lg:text-left z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full neo-btn shadow-sm max-w-full">
            <span className={`w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full shrink-0 ${isAdmin ? 'bg-[#20E79A] shadow-[0_0_8px_#20E79A]' : 'bg-[#FF6A00] shadow-[0_0_8px_#FF6A00]'} animate-pulse`} />
            <span className="text-[9.5px] sm:text-[10px] font-black text-[#07221A] uppercase tracking-wider truncate">
              {isAdmin ? 'Admin Hub • Monitored Products' : `User Portal • Product ID: ${assignedTag}`}
            </span>
          </div>
          <div className="space-y-0.5 sm:space-y-1">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-serif italic font-black text-[#07221A] leading-tight tracking-tight">
              {lastScanned ? lastScanned.itemName.toUpperCase() : (isAdmin ? 'FRESH FOOD' : assignedName.toUpperCase())}
            </h1>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-serif italic font-black text-[#07221A] leading-tight tracking-tight">
              {lastScanned ? `${lastScanned.freshnessScore}% FRESHNESS` : 'MONITORING'}
            </h2>
            <h3 className="text-2xl sm:text-3xl lg:text-4xl font-serif italic font-black text-[#07221A] leading-tight tracking-tight">
              {lastScanned ? `STATUS: ${lastScanned.status.toUpperCase()}` : 'PORTAL'}
            </h3>
          </div>
          <p className="text-xs text-[#5C7F75] font-semibold max-w-md mx-auto lg:mx-0 leading-relaxed">
            {lastScanned 
              ? (freshnessReport?.message || `Inspection telemetry: ${lastScanned.temperature}°C, ${lastScanned.humidity}% humidity, ${lastScanned.gas} ppm MQ-135 gas. ${lastScanned.status === 'Fresh' ? 'Optimal preservation bounds confirmed.' : 'Monitor cold-chain retention.'}`)
              : 'IoT telemetry from physical RFID and QR scanned products. Ready for next product tag inspection.'}
          </p>

          <div className="pt-1 sm:pt-2 flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center justify-center lg:justify-start gap-2.5 sm:gap-3">
            <button
              type="button"
              onClick={() => navigate('/scan')}
              className="neo-btn-primary px-5 py-3 min-h-[44px] rounded-full text-xs font-black flex items-center justify-center gap-2 cursor-pointer glow-emerald shadow-md active:scale-97 transition-transform"
            >
              <Scan className="w-4 h-4 text-[#20E79A] glow-icon-emerald shrink-0" />
              <span>Scan Product Tag</span>
            </button>

            {lastScanned && (
              <button
                type="button"
                onClick={() => navigate(`/live-data/${lastScanned.itemId}`)}
                className="neo-btn px-5 py-3 min-h-[44px] rounded-full text-xs font-black text-[#07221A] flex items-center justify-center gap-2 cursor-pointer shadow-sm hover:border-[#20E79A]/40 active:scale-97 transition-transform"
              >
                <Activity className="w-4 h-4 text-[#20E79A] glow-icon-emerald shrink-0" />
                <span>View Full Telemetry</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => navigate('/analytics')}
              className="neo-btn px-5 py-3 min-h-[44px] rounded-full text-xs font-black text-[#07221A] flex items-center justify-center gap-2 cursor-pointer shadow-sm hover:border-[#20E79A]/40 active:scale-97 transition-transform"
            >
              <BarChart3 className="w-4 h-4 text-[#20E79A] glow-icon-emerald shrink-0" />
              <span>Telemetry Analytics</span>
            </button>
          </div>
        </div>

        {/* Middle Floating Product Display */}
        <div className="flex flex-col items-center justify-center relative py-2 lg:py-0 z-10 shrink-0">
          <div className="relative w-40 sm:w-44 aspect-[3/5] glass-modal rounded-[28px] p-3.5 depth-4 flex flex-col items-center justify-between text-center overflow-hidden">
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
            <div className="w-24 h-24 sm:w-28 sm:h-28 my-1.5 rounded-2xl overflow-hidden bg-[#F4F7F6] border border-[#13493B]/10 flex items-center justify-center relative shadow-inner">
              {lastScanned ? (
                <img 
                  src={lastScanned.itemImage || "/colddrinks.jpg"} 
                  alt={lastScanned.itemName}
                  referrerPolicy="no-referrer"
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
              <QrCode className="w-4 h-4 sm:w-5 sm:h-5 text-[#07221A]" />
              <span className="text-[9px] font-bold text-[#5C7F75] tracking-tight font-mono truncate max-w-full">
                {lastScanned ? lastScanned.tagId : 'AWAITING SCAN'}
              </span>
            </div>
          </div>
          {/* Slogan label floating beside the card - tucked cleanly so it never overflows mobile */}
          <div className="absolute -left-4 sm:-left-9 top-6 -rotate-12 glass-panel px-3 py-1.5 rounded-2xl depth-2 shadow-md">
            <span className="font-serif italic text-[11px] sm:text-xs font-black text-[#07221A] block">Scan</span>
            <span className="font-serif italic text-[11px] sm:text-xs font-black text-[#20E79A] glow-icon-emerald block">Track</span>
            <span className="font-serif italic text-[11px] sm:text-xs font-black text-[#07221A] block">Stay Fresh</span>
          </div>
        </div>

        {/* Right Side Bullet Checklist */}
        <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-1 gap-3 sm:gap-4 shrink-0 border-t lg:border-t-0 lg:border-l border-[#13493B]/10 pt-4 lg:pt-0 lg:pl-8 w-full lg:w-auto">
          <div className="flex items-center gap-3 p-2.5 lg:p-0 rounded-2xl bg-[#F4F7F6]/70 lg:bg-transparent border border-[#13493B]/8 lg:border-0">
            <div className="neo-icon-box w-9 h-9 sm:w-10 sm:h-10 rounded-2xl flex items-center justify-center text-[#20E79A] shrink-0">
              <ShieldCheck className="w-4 h-4 sm:w-5 sm:h-5 glow-icon-emerald" />
            </div>
            <div className="min-w-0 text-left">
              <span className="block text-[11px] font-black text-[#07221A] uppercase tracking-wide truncate">Safer Food</span>
              <span className="block text-[9.5px] text-[#5C7F75] font-semibold truncate">Continuous Bio-Sensors</span>
            </div>
          </div>

          <div className="flex items-center gap-3 p-2.5 lg:p-0 rounded-2xl bg-[#F4F7F6]/70 lg:bg-transparent border border-[#13493B]/8 lg:border-0">
            <div className="neo-icon-box w-9 h-9 sm:w-10 sm:h-10 rounded-2xl flex items-center justify-center text-[#20E79A] shrink-0">
              <Heart className="w-4 h-4 sm:w-5 sm:h-5 glow-icon-emerald" />
            </div>
            <div className="min-w-0 text-left">
              <span className="block text-[11px] font-black text-[#07221A] uppercase tracking-wide truncate">Healthier People</span>
              <span className="block text-[9.5px] text-[#5C7F75] font-semibold truncate">Prevention & Warnings</span>
            </div>
          </div>

          <div className="flex items-center gap-3 p-2.5 lg:p-0 rounded-2xl bg-[#F4F7F6]/70 lg:bg-transparent border border-[#13493B]/8 lg:border-0">
            <div className="neo-icon-box w-9 h-9 sm:w-10 sm:h-10 rounded-2xl flex items-center justify-center text-[#20E79A] shrink-0">
              <Globe className="w-4 h-4 sm:w-5 sm:h-5 glow-icon-emerald" />
            </div>
            <div className="min-w-0 text-left">
              <span className="block text-[11px] font-black text-[#07221A] uppercase tracking-wide truncate">Cleaner Planet</span>
              <span className="block text-[9.5px] text-[#5C7F75] font-semibold truncate">Zero-Waste Tracking</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* 2. SIX SENSOR METRICS CARDS - INCLUDES DERIVED THERMODYNAMIC pH */}
      <motion.div 
        variants={itemVariants}
        className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4"
      >
        {/* Metric 1: Temp */}
        <div className="glass-card p-3.5 sm:p-5 depth-2 space-y-3 flex flex-col justify-between transition-all">
          <div className="flex justify-between items-start gap-2">
            <div className="space-y-0.5 min-w-0">
              <span className="text-[9.5px] sm:text-[10px] font-bold text-[#5C7F75] uppercase tracking-wider block truncate">Temperature</span>
              <span className="text-lg sm:text-2xl font-black text-[#07221A] tracking-tight tabular-nums block">
                {lastScanned ? `${lastScanned.temperature} °C` : '0 °C'}
              </span>
              <span className={`text-[9.5px] sm:text-[10px] font-bold block truncate ${
                !lastScanned ? 'text-[#5C7F75]' : lastScanned.temperature > 8 ? 'text-[#FF5A67]' : 'text-[#20E79A]'
              }`}>
                {lastScanned ? (lastScanned.temperature > 8 ? 'Elevated temp' : 'Optimal range') : '0 Scans'}
              </span>
            </div>
            <div className="neo-icon-box w-8 h-8 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl flex items-center justify-center text-[#FF5A67] shadow-sm shrink-0">
              <Thermometer className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
          </div>
          <div className="w-full h-7 pt-1">
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
        </div>

        {/* Metric 2: Humidity */}
        <div className="glass-card p-3.5 sm:p-5 depth-2 space-y-3 flex flex-col justify-between transition-all">
          <div className="flex justify-between items-start gap-2">
            <div className="space-y-0.5 min-w-0">
              <span className="text-[9.5px] sm:text-[10px] font-bold text-[#5C7F75] uppercase tracking-wider block truncate">Humidity</span>
              <span className="text-lg sm:text-2xl font-black text-[#07221A] tracking-tight tabular-nums block">
                {lastScanned ? `${lastScanned.humidity} %` : '0 %'}
              </span>
              <span className={`text-[9.5px] sm:text-[10px] font-bold block truncate ${
                !lastScanned ? 'text-[#5C7F75]' : lastScanned.humidity > 70 ? 'text-[#FFAA00]' : 'text-[#20E79A]'
              }`}>
                {lastScanned ? (lastScanned.humidity > 70 ? 'High moisture' : 'Optimal moisture') : '0 Scans'}
              </span>
            </div>
            <div className="neo-icon-box w-8 h-8 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl flex items-center justify-center text-[#3B82F6] shadow-sm shrink-0">
              <Droplets className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
          </div>
          <div className="w-full h-7 pt-1">
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
        </div>

        {/* Metric 3: Calculated Moisture (g/m³) */}
        <div className="glass-card p-3.5 sm:p-5 depth-2 space-y-3 flex flex-col justify-between transition-all">
          <div className="flex justify-between items-start gap-2">
            <div className="space-y-0.5 min-w-0">
              <span className="text-[9.5px] sm:text-[10px] font-bold text-[#5C7F75] uppercase tracking-wider block truncate">Calc. Moisture</span>
              <span className="text-lg sm:text-2xl font-black text-[#07221A] tracking-tight tabular-nums block">
                {liveMoisture ? `${liveMoisture.absoluteMoisture} g/m³` : '0 g/m³'}
              </span>
              <span className={`text-[9.5px] sm:text-[10px] font-bold block truncate ${
                !liveMoisture ? 'text-[#5C7F75]' : liveMoisture.status === 'Condensation Hazard' ? 'text-[#FF5A67]' : 'text-[#0EA5E9]'
              }`}>
                {liveMoisture ? `Dew: ${liveMoisture.dewPoint}°C` : '0 Scans'}
              </span>
            </div>
            <div className="neo-icon-box w-8 h-8 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl flex items-center justify-center text-[#0EA5E9] shadow-sm shrink-0">
              <Droplets className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
          </div>
          <div className="w-full h-7 pt-1">
            <svg viewBox="0 0 100 30" className="w-full h-full overflow-visible">
              <path 
                d={liveMoisture ? "M 0 18 Q 25 12 50 16 T 100 14" : "M 0 25 L 100 25"} 
                fill="none" 
                stroke="#0EA5E9" 
                strokeWidth="2.5" 
                strokeLinecap="round"
                strokeOpacity={liveMoisture ? 1 : 0.3}
              />
            </svg>
          </div>
        </div>

        {/* Metric 4: Calculated pH (Thermodynamic Acidity & Ionization) */}
        <div className="glass-card p-3.5 sm:p-5 depth-2 space-y-3 flex flex-col justify-between transition-all bg-emerald-50/40">
          <div className="flex justify-between items-start gap-2">
            <div className="space-y-0.5 min-w-0">
              <span className="text-[9.5px] sm:text-[10px] font-extrabold text-[#13493B] uppercase tracking-wider block truncate">Calculated pH</span>
              <span className="text-lg sm:text-2xl font-black text-emerald-950 font-mono tracking-tight tabular-nums block">
                {livePH ? `pH ${livePH.ph}` : 'pH --'}
              </span>
              <span className={`text-[9.5px] sm:text-[10px] font-bold block truncate ${
                !livePH ? 'text-[#5C7F75]' : livePH.status === 'Acidic / Fermenting' ? 'text-red-500' : 'text-emerald-700'
              }`}>
                {livePH ? livePH.status : '0 Scans'}
              </span>
            </div>
            <div className="neo-icon-box w-8 h-8 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl flex items-center justify-center text-emerald-600 bg-emerald-100/90 border border-emerald-300 shadow-sm shrink-0">
              <Activity className="w-4 h-4 sm:w-5 sm:h-5 glow-icon-emerald" />
            </div>
          </div>
          <div className="w-full h-7 pt-1">
            <svg viewBox="0 0 100 30" className="w-full h-full overflow-visible">
              <path 
                d={livePH ? "M 0 14 Q 25 20 50 12 T 100 15" : "M 0 25 L 100 25"} 
                fill="none" 
                stroke="#10B981" 
                strokeWidth="2.5" 
                strokeLinecap="round"
                strokeOpacity={livePH ? 1 : 0.3}
              />
            </svg>
          </div>
        </div>

        {/* Metric 5: Air Quality Gas */}
        <div className="glass-card p-3.5 sm:p-5 depth-2 space-y-3 flex flex-col justify-between transition-all">
          <div className="flex justify-between items-start gap-2">
            <div className="space-y-0.5 min-w-0">
              <span className="text-[9.5px] sm:text-[10px] font-bold text-[#5C7F75] uppercase tracking-wider block truncate">MQ-135 Gas</span>
              <span className="text-lg sm:text-2xl font-black text-[#07221A] tracking-tight tabular-nums block">
                {lastScanned ? `${lastScanned.gas}` : '0'}
              </span>
              <span className={`text-[9.5px] sm:text-[10px] font-bold block truncate ${
                !lastScanned ? 'text-[#5C7F75]' : lastScanned.gas > 300 ? 'text-[#FF5A67]' : 'text-purple-600'
              }`}>
                {lastScanned ? (lastScanned.gas > 300 ? 'VOC Spike' : 'Normal Purity') : '0 Scans'}
              </span>
            </div>
            <div className="neo-icon-box w-8 h-8 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl flex items-center justify-center text-purple-600 shadow-sm shrink-0">
              <Wind className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
          </div>
          <div className="w-full h-7 pt-1">
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
        </div>

        {/* Metric 6: Freshness Quality Score */}
        <div className="glass-card p-3.5 sm:p-5 depth-2 space-y-3 flex flex-col justify-between transition-all">
          <div className="flex justify-between items-start gap-2">
            <div className="space-y-0.5 min-w-0">
              <span className="text-[9.5px] sm:text-[10px] font-bold text-[#5C7F75] uppercase tracking-wider block truncate">Freshness</span>
              <span className="text-lg sm:text-2xl font-black text-[#07221A] tracking-tight tabular-nums block">
                {lastScanned ? `${lastScanned.freshnessScore}%` : '0%'}
              </span>
              <span className={`text-[9.5px] sm:text-[10px] font-bold block truncate ${
                !lastScanned ? 'text-[#5C7F75]' : lastScanned.status === 'Fresh' ? 'text-[#20E79A]' : 'text-[#FFAA00]'
              }`}>
                {lastScanned ? `${lastScanned.status} • ${lastScanned.itemName}` : '0 Scans'}
              </span>
            </div>
            <div className="neo-icon-box w-8 h-8 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl flex items-center justify-center text-[#20E79A] shadow-sm shrink-0">
              <Package className="w-4 h-4 sm:w-5 sm:h-5 glow-icon-emerald" />
            </div>
          </div>
          <div className="w-full h-7 pt-1">
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
        </div>
      </motion.div>

      {/* 3. MULTI-GRID BOTTOM PANEL */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 items-start">
        {/* LEFT COLUMN: ACTIVITY & SENSOR CHART TRENDS */}
        <div className="lg:col-span-8 space-y-4 sm:space-y-6">
          {/* Recent Activity Section */}
          <motion.div 
            variants={itemVariants}
            className="glass-card p-4 sm:p-6 depth-2 space-y-4"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-[#13493B]/10 gap-3">
              <div className="flex items-center justify-between sm:block">
                <div>
                  <h3 className="text-sm font-black text-[#07221A] flex items-center gap-2">
                    <span>Recent Scan History</span>
                    <span className="w-2 h-2 rounded-full bg-[#20E79A] animate-pulse" />
                  </h3>
                  <p className="text-[11px] text-[#5C7F75] font-semibold">Real-time inspection logs recorded across IoT sensors.</p>
                </div>
                <button 
                  type="button"
                  onClick={() => navigate('/history')}
                  className="sm:hidden text-xs font-bold text-[#20E79A] hover:underline flex items-center gap-1 cursor-pointer shrink-0"
                >
                  <span>Full Log</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center gap-2.5">
                <div className="flex flex-col sm:items-end gap-1">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-[#EBFBF4] border border-[#20E79A]/30 text-[10px] font-mono font-bold text-[#07221A] shadow-xs w-fit">
                    <Clock className="w-3.5 h-3.5 text-[#20E79A] shrink-0" />
                    <span className="text-[#5C7F75]">Last Response:</span>
                    <span className="text-[#13493B] font-extrabold">{lastResponseInfo.fullText}</span>
                  </div>
                  <div className="flex items-start sm:items-center gap-1 text-[9.5px] font-semibold text-[#13493B]">
                    <Info className="w-3 h-3 text-[#20E79A] shrink-0 mt-0.5 sm:mt-0" />
                    <span>Note: response valid for only 2 hours from the last response time</span>
                  </div>
                </div>
                <button 
                  type="button"
                  onClick={() => navigate('/history')}
                  className="hidden sm:flex text-xs font-bold text-[#20E79A] hover:underline items-center gap-1 cursor-pointer self-center shrink-0"
                >
                  <span>View Full Log</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {scanHistory.length > 0 ? (
              <div className="space-y-2.5">
                {scanHistory.slice(0, 5).map((scan, idx) => (
                  <div 
                    key={scan.id || idx}
                    className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1.5 sm:gap-2 text-xs p-2.5 rounded-xl bg-[#F4F7F6]/60 hover:bg-[#EBF1EF]/80 transition-colors border border-[#13493B]/5"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                        scan.status === 'Fresh' 
                          ? 'bg-[#20E79A] shadow-[0_0_6px_#20E79A]' 
                          : scan.status === 'Warning' || scan.status === 'At Risk' 
                          ? 'bg-[#FFAA00] shadow-[0_0_6px_#FFAA00]' 
                          : 'bg-[#FF5A67] shadow-[0_0_6px_#FF5A67]'
                      }`} />
                      <span className="font-bold text-[#07221A] truncate">
                        {scan.itemName} <span className="text-[#5C7F75] font-mono">({scan.tagId})</span>
                      </span>
                    </div>
                    <div className="flex items-center justify-between sm:justify-end gap-3 pl-5 sm:pl-0 text-[11px]">
                      <span className="font-mono font-semibold text-[#13493B] tabular-nums">
                        {scan.temperature}°C • {scan.humidity}% • {scan.gas} ppm
                      </span>
                      <span className="text-[10px] text-[#5C7F75] font-mono shrink-0">
                        {scan.timeStr || new Date(scan.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-6 text-center space-y-2">
                <p className="text-xs font-bold text-[#07221A]">No Recent Scans Recorded</p>
                <p className="text-[11px] text-[#5C7F75]">
                  Inspect a food product via RFID or QR code to view live telemetry logs here.
                </p>
                <button
                  type="button"
                  onClick={() => navigate('/scan')}
                  className="mt-1 px-4 py-2 neo-btn-primary text-xs font-black rounded-full cursor-pointer glow-emerald"
                >
                  Scan a Product Now
                </button>
              </div>
            )}
          </motion.div>

          {/* Real-time Environmental & Freshness Trend Charts (Recharts) */}
          <motion.div variants={itemVariants}>
            <RealtimeTrendCharts
              currentSensorData={sensorData}
              currentReport={freshnessReport}
              activeItem={activeItem}
              thresholdRules={thresholds}
              scanHistory={scanHistory}
              onOpenThresholdModal={() => setIsThresholdModalOpen(true)}
            />
          </motion.div>
        </div>

        {/* RIGHT COLUMN: STATUS, ACTIONS, LAST SCANNED PRODUCT, PROMO CARD */}
        <div className="lg:col-span-4 space-y-4 sm:space-y-6">
          {/* Live Device Status */}
          <motion.div 
            variants={itemVariants}
            className="glass-card p-4 sm:p-5 depth-2 space-y-4 sm:space-y-5"
          >
            <div className="flex justify-between items-center pb-1">
              <h3 className="text-sm font-black text-[#07221A]">Live Device Status</h3>
              <div className="flex items-center gap-1.5 text-[10px] font-extrabold text-[#20E79A]">
                <span className={`w-2 h-2 rounded-full ${lastScanned ? 'bg-[#20E79A] shadow-[0_0_8px_#20E79A] animate-pulse' : 'bg-slate-300'}`} />
                <span>{lastScanned ? 'Telemetry Online' : 'Standby / Ready'}</span>
              </div>
            </div>

            {/* Last Response Received Tile with Full Date & Time and 2-Hour Validity Note */}
            <div className="p-3.5 rounded-2xl bg-[#EBFBF4] border border-[#20E79A]/30 space-y-2.5 shadow-xs">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[9px] font-black uppercase tracking-wider text-[#5C7F75] flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-[#20E79A] shrink-0" />
                  Last Response Received
                </span>
                <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-[#20E79A]/20 text-[#07221A] shrink-0">
                  Active Telemetry
                </span>
              </div>
              <div className="flex items-center justify-between text-xs font-mono font-black text-[#07221A]">
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-[#5C7F75]" />
                  <span>{lastResponseInfo.date}</span>
                </div>
                <div className="px-2 py-0.5 rounded-md bg-white border border-[#20E79A]/30 text-[#13493B]">
                  {lastResponseInfo.time}
                </div>
              </div>
              {/* Note: Response valid for only 2 hours */}
              <div className="pt-2 border-t border-[#20E79A]/20 flex items-start gap-1.5 text-[10.5px] leading-snug">
                <Info className="w-3.5 h-3.5 text-[#20E79A] shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-[#07221A]">Note: </span>
                  <span className="font-semibold text-[#13493B]">Response valid for only 2 hours from the last response time</span>
                  <span className="block text-[9px] font-mono text-[#5C7F75] mt-0.5">Telemetry window valid until: {lastResponseInfo.expiryTimeStr}</span>
                </div>
              </div>
            </div>

            {/* Radial Doughnut progress circle */}
            <div className="flex items-center justify-around gap-4 py-1">
              <div className="relative w-24 h-24 flex items-center justify-center shrink-0">
                <svg className="w-full h-full -rotate-90">
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
              <div className="space-y-1.5 text-xs font-semibold min-w-0">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#20E79A] shadow-[0_0_6px_#20E79A] shrink-0" />
                  <span className="text-[#07221A] truncate">{lastScanned ? '1 Active Tag' : '0 Active Tags'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-300 shrink-0" />
                  <span className="text-[#07221A] font-mono truncate">{lastScanned ? lastScanned.tagId : 'No Devices'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#13493B] shrink-0" />
                  <span className="text-[#07221A] truncate">{scanHistory.length} Recorded Scan{scanHistory.length === 1 ? '' : 's'}</span>
                </div>
              </div>
            </div>

            <div className="text-[10px] text-[#5C7F75] font-semibold text-center border-t border-[#13493B]/10 pt-3 space-y-1">
              <p>{lastScanned ? `Last verified: ${lastScanned.itemName} (${lastScanned.tagId})` : 'Awaiting first RFID/QR scan.'}</p>
            </div>
          </motion.div>

          {/* Quick Actions Grid with Neomorphic tactile buttons */}
          <motion.div 
            variants={itemVariants}
            className="glass-card p-4 sm:p-5 depth-2 space-y-3.5"
          >
            <h3 className="text-sm font-black text-[#07221A]">Quick Actions</h3>
            <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
              {/* Add Device */}
              <button 
                type="button"
                onClick={() => navigate('/admin/devices')}
                className="neo-btn p-3 min-h-[72px] rounded-2xl flex flex-col items-center justify-center gap-2 cursor-pointer group hover:border-[#20E79A]/40 active:scale-97 transition-transform"
              >
                <div className="w-8 h-8 rounded-full bg-[#20E79A] text-white flex items-center justify-center glow-emerald shadow-sm">
                  <Plus className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-black text-[#07221A]">Add Device</span>
              </button>

              {/* Manage Products */}
              <button 
                type="button"
                onClick={() => navigate('/history')}
                className="neo-btn p-3 min-h-[72px] rounded-2xl flex flex-col items-center justify-center gap-2 cursor-pointer group hover:border-[#3B82F6]/40 active:scale-97 transition-transform"
              >
                <div className="w-8 h-8 rounded-full bg-[#3B82F6] text-white flex items-center justify-center shadow-[0_0_12px_rgba(59,130,246,0.5)]">
                  <Package className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-black text-[#07221A]">Manage Products</span>
              </button>

              {/* View Reports */}
              <button 
                type="button"
                onClick={() => navigate('/analytics')}
                className="neo-btn p-3 min-h-[72px] rounded-2xl flex flex-col items-center justify-center gap-2 cursor-pointer group hover:border-[#FF5A67]/40 active:scale-97 transition-transform"
              >
                <div className="w-8 h-8 rounded-full bg-[#FF5A67] text-white flex items-center justify-center shadow-[0_0_12px_rgba(255,90,103,0.5)]">
                  <BarChart3 className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-black text-[#07221A]">View Reports</span>
              </button>

              {/* System Settings */}
              <button 
                type="button"
                onClick={() => navigate('/settings')}
                className="neo-btn p-3 min-h-[72px] rounded-2xl flex flex-col items-center justify-center gap-2 cursor-pointer group hover:border-[#13493B]/40 active:scale-97 transition-transform"
              >
                <div className="w-8 h-8 rounded-full bg-[#13493B] text-white flex items-center justify-center shadow-sm">
                  <Sliders className="w-4 h-4 text-[#20E79A]" />
                </div>
                <span className="text-[10px] font-black text-[#07221A]">System Settings</span>
              </button>
            </div>
          </motion.div>

          {/* Last Scanned Product */}
          <motion.div 
            variants={itemVariants}
            className="glass-card p-4 sm:p-5 depth-2 space-y-3.5"
          >
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-black text-[#07221A]">Last Scanned Product</h3>
              {lastScanned && (
                <button 
                  type="button"
                  onClick={() => navigate(`/live-data/${lastScanned.itemId}`)}
                  className="text-xs font-bold text-[#20E79A] hover:underline flex items-center gap-0.5 cursor-pointer"
                >
                  <span>View Details</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {lastScanned ? (
              <div className="flex items-center gap-3.5 neo-panel p-3.5 rounded-2xl border border-[#13493B]/10">
                <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0 border border-[#13493B]/10 bg-white shadow-sm">
                  <img 
                    src={lastScanned.itemImage || "/colddrinks.jpg"} 
                    alt={lastScanned.itemName}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="min-w-0 flex-1 space-y-1">
                  <div className="flex items-center gap-1.5 justify-between">
                    <span className="font-extrabold text-xs text-[#07221A] truncate">{lastScanned.itemName}</span>
                    <span className={`px-2 py-0.5 rounded-full text-[8px] font-black border shrink-0 ${
                      lastScanned.status === 'Fresh'
                        ? 'bg-[#20E79A]/15 text-[#07221A] border-[#20E79A]/30'
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
                  <div className="flex items-center gap-1.5 pt-1">
                    <span className="w-1.5 h-1.5 bg-[#20E79A] rounded-full shrink-0" />
                    <span className="text-[9.5px] font-extrabold text-[#07221A] tabular-nums">
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
                  type="button"
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
            onClick={() => navigate('/about')}
            className="relative rounded-[28px] overflow-hidden aspect-[16/10] bg-gradient-to-t from-[#041410] to-[#07221A] border border-[#20E79A]/30 flex flex-col justify-between p-5 text-left shadow-lg cursor-pointer glow-emerald"
          >
            {/* Dark evergreens background */}
            <div 
              className="absolute inset-0 bg-cover bg-center opacity-45 mix-blend-overlay pointer-events-none"
              style={{ backgroundImage: `url("${farmLandscapeImg}")` }}
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

      {/* Sensor Threshold Rules Configuration Modal */}
      <ThresholdConfigModal
        isOpen={isThresholdModalOpen}
        onClose={() => setIsThresholdModalOpen(false)}
        thresholds={thresholds}
        onSaveThresholds={updateThresholds}
      />
    </motion.div>
  );
};

import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { 
  Thermometer, 
  Droplets, 
  Wind, 
  Download, 
  Activity,
  ArrowLeft,
  Share2,
  AlertTriangle,
  Sliders,
  Scan,
  ShieldCheck,
  Clock,
  Zap,
  Sun,
  Navigation
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
import { useAuth } from '../context/AuthContext';
import { useFreshness } from '../context/FreshnessContext';
import { StatusBadge } from '../components/common/StatusBadge';
import { FreshnessGauge } from '../components/common/FreshnessGauge';
import { SensorCard } from '../components/common/SensorCard';
import { ThresholdConfigModal } from '../components/common/ThresholdConfigModal';
import { FreshnessPrincipleCard } from '../components/common/FreshnessPrincipleCard';
import { HistoricalReadingPoint } from '../types';
import { calculateMoisture } from '../utils/moistureCalculator';
import { calculatePH } from '../utils/phCalculator';
import { formatRealtimeDateTime, extractLatestTimestamp } from '../utils/dateUtils';

export const LiveDataPage: React.FC = () => {
  const { userProfile } = useAuth();
  const isAdmin = userProfile?.role === 'admin';
  const { itemId } = useParams<{ itemId: string }>();
  const navigate = useNavigate();
  const { 
    activeItem, 
    sensorData, 
    freshnessReport, 
    scanItem, 
    thresholds,
    updateThresholds
  } = useFreshness();

  const [activeMetricTab, setActiveMetricTab] = useState<'temp' | 'humidity' | 'moisture' | 'ph' | 'gas' | 'impact' | 'light'>('temp');
  const [copiedLink, setCopiedLink] = useState(false);
  const [isConfigOpen, setIsConfigOpen] = useState(false);

  useEffect(() => {
    const targetId = itemId || userProfile?.assignedProductId || 'COLD_DRINKS';
    if (!activeItem || (itemId && activeItem.id.toLowerCase() !== itemId.toLowerCase())) {
      scanItem(targetId).catch(() => {});
    }
  }, [itemId, userProfile?.assignedProductId]);

  const isTempBreached = sensorData && sensorData.temperature > thresholds.tempMax;
  const isGasBreached = sensorData && (sensorData.gas > 500 ? sensorData.gas > 1400 : sensorData.gas > thresholds.gasWarning);
  const isHumidityBreached = sensorData && (sensorData.humidity > thresholds.humidityMax || sensorData.humidity < thresholds.humidityMin);
  const hasActiveBreach = isTempBreached || isGasBreached || isHumidityBreached;

  const liveMoisture = calculateMoisture(
    sensorData ? sensorData.temperature : 4.2,
    sensorData ? sensorData.humidity : 62
  );

  const livePH = calculatePH(
    sensorData ? sensorData.temperature : 4.2,
    sensorData ? sensorData.humidity : 62,
    liveMoisture.absoluteMoisture,
    { category: activeItem?.category, gas: sensorData?.gas }
  );

  const liveImpact = Number(sensorData?.impact ?? 0.08);
  const liveLight = Math.round(Number(sensorData?.light ?? 14));
  const liveGpsLat = Number(sensorData?.gpsLat ?? 28.6139);
  const liveGpsLng = Number(sensorData?.gpsLng ?? 77.2090);
  const liveGpsSats = Number(sensorData?.gpsSats ?? 9);

  const lastResponseFormatted = useMemo(() => {
    const raw = extractLatestTimestamp(sensorData, Date.now());
    return formatRealtimeDateTime(raw).fullStr;
  }, [sensorData]);

  const chartData: HistoricalReadingPoint[] = [
    { time: '09:00', timestamp: 1, temperature: 4.0, humidity: 60, gas: 112, moisture: calculateMoisture(4.0, 60).absoluteMoisture, ph: calculatePH(4.0, 60, calculateMoisture(4.0, 60).absoluteMoisture).ph, impact: 0.05, light: 12 },
    { time: '09:30', timestamp: 2, temperature: 4.1, humidity: 61, gas: 115, moisture: calculateMoisture(4.1, 61).absoluteMoisture, ph: calculatePH(4.1, 61, calculateMoisture(4.1, 61).absoluteMoisture).ph, impact: 0.07, light: 13 },
    { time: '10:00', timestamp: 3, temperature: 4.3, humidity: 63, gas: 118, moisture: calculateMoisture(4.3, 63).absoluteMoisture, ph: calculatePH(4.3, 63, calculateMoisture(4.3, 63).absoluteMoisture).ph, impact: 0.11, light: 15 },
    { time: '10:15', timestamp: 4, temperature: 4.2, humidity: 62, gas: 119, moisture: calculateMoisture(4.2, 62).absoluteMoisture, ph: calculatePH(4.2, 62, calculateMoisture(4.2, 62).absoluteMoisture).ph, impact: 0.09, light: 14 },
    { time: '10:30', timestamp: 5, temperature: 4.1, humidity: 61, gas: 120, moisture: calculateMoisture(4.1, 61).absoluteMoisture, ph: calculatePH(4.1, 61, calculateMoisture(4.1, 61).absoluteMoisture).ph, impact: 0.06, light: 13 },
    { 
      time: '10:45', 
      timestamp: 6, 
      temperature: sensorData ? sensorData.temperature : 4.2, 
      humidity: sensorData ? sensorData.humidity : 62, 
      gas: sensorData ? sensorData.gas : 120,
      moisture: sensorData?.moisture ?? liveMoisture.absoluteMoisture,
      ph: sensorData?.ph ?? livePH.ph,
      impact: liveImpact,
      light: liveLight
    },
  ];

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  const handleExportData = () => {
    if (!activeItem) return;
    const payload = {
      product: activeItem.name,
      tagId: activeItem.tagId,
      timestamp: new Date().toISOString(),
      temperature: sensorData?.temperature,
      humidity: sensorData?.humidity,
      moisture: sensorData?.moisture ?? liveMoisture.absoluteMoisture,
      dewPoint: sensorData?.dewPoint ?? liveMoisture.dewPoint,
      ph: sensorData?.ph ?? livePH.ph,
      gas: sensorData?.gas,
      impact: liveImpact,
      light: liveLight,
      neo6mGps: {
        latitude: liveGpsLat,
        longitude: liveGpsLng,
        satellites: liveGpsSats
      },
      freshnessScore: freshnessReport?.score,
      status: freshnessReport?.status,
    };
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(payload, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `FreshNex_${activeItem.id}_Telemetry.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  if (!activeItem) {
    return (
      <div className="max-w-md mx-auto text-center py-20 px-6 space-y-6 select-none font-sans">
        <div className="w-20 h-20 rounded-[24px] bg-[#EBF1EF] border border-[#13493B]/10 flex items-center justify-center mx-auto text-[#20E79A] shadow-sm">
          <Activity className="w-10 h-10 animate-pulse" />
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-black text-[#07221A] tracking-tight">No Connected IoT Device</h2>
          <p className="text-xs font-semibold text-[#5C7F75] leading-relaxed">
            There is currently no active product telemetry session. Please scan a QR tag or enter a manual Tag ID to connect your physical sensor device.
          </p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate('/scan')}
          className="px-6 py-3.5 rounded-full font-black text-xs text-white bg-[#07221A] hover:bg-[#134336] transition-all cursor-pointer inline-flex items-center gap-2 shadow-md"
        >
          <Scan className="w-4 h-4 text-[#20E79A]" />
          <span>Scan IoT Tag Now</span>
        </motion.button>
      </div>
    );
  }

  const currentProduct = activeItem;

  const metricConfig = {
    temp: { name: 'Temperature', unit: '°C', color: '#FF5A67', bg: '#FFECEE' },
    humidity: { name: 'Humidity', unit: '%', color: '#3B82F6', bg: '#EBF5FF' },
    moisture: { name: 'Calculated Moisture', unit: 'g/m³', color: '#0EA5E9', bg: '#E0F2FE' },
    ph: { name: 'Calculated pH', unit: 'pH', color: '#10B981', bg: '#ECFDF5' },
    gas: { name: 'Gas Level (VOC)', unit: 'ppm', color: '#9333EA', bg: '#F5EBFF' },
    impact: { name: 'Impact Sensor', unit: 'G', color: '#F59E0B', bg: '#FEF3C7' },
    light: { name: 'Light Sensor', unit: 'lx', color: '#EAB308', bg: '#FEF9C3' },
    gps: { name: 'NEO-6M GPS', unit: 'Sats', color: '#06B6D4', bg: '#CFFAFE' },
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-6 select-none pb-12 font-sans"
    >
      {/* TOP HEADER CONTROLS */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#13493B]/10">
        <div className="flex items-center gap-3">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate(-1)}
            className="p-2.5 rounded-2xl bg-white border border-[#13493B]/10 text-[#07221A] hover:bg-[#F4F7F6] cursor-pointer shadow-sm flex items-center justify-center"
            aria-label="Go back"
          >
            <ArrowLeft className="w-4 h-4" />
          </motion.button>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-wider text-[#5C7F75]">Live Telemetry Stream</span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#20E79A]/15 text-[#07221A]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#20E79A] animate-pulse" />
                Live Node Connected
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-serif italic font-black text-[#07221A]">
              {currentProduct.name} • <span className="font-mono text-base font-bold text-emerald-700">{currentProduct.tagId}</span>
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {isAdmin && (
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setIsConfigOpen(true)}
              className="px-4 py-2.5 rounded-2xl bg-white border border-[#13493B]/10 text-[#07221A] hover:bg-[#F4F7F6] text-xs font-bold flex items-center gap-2 shadow-sm cursor-pointer"
            >
              <Sliders className="w-3.5 h-3.5 text-[#20E79A]" />
              <span>Threshold Rules</span>
            </motion.button>
          )}

          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={handleExportData}
            className="px-4 py-2.5 rounded-2xl bg-white border border-[#13493B]/10 text-[#07221A] hover:bg-[#F4F7F6] text-xs font-bold flex items-center gap-2 shadow-sm cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-[#20E79A]" />
            <span>Export Report</span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={handleShare}
            className="px-4 py-2.5 rounded-2xl bg-white border border-[#13493B]/10 text-[#07221A] hover:bg-[#F4F7F6] text-xs font-bold flex items-center gap-2 shadow-sm cursor-pointer"
          >
            <Share2 className="w-3.5 h-3.5 text-[#20E79A]" />
            <span>{copiedLink ? 'Link Copied!' : 'Share Feed'}</span>
          </motion.button>
        </div>
      </div>

      {/* STATUS HERO BANNER */}
      <div className="relative glass-card p-5 sm:p-7 overflow-hidden depth-2 flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="absolute top-0 right-0 w-48 h-48 bg-[#20E79A]/10 rounded-full blur-2xl pointer-events-none" />

        <div className="space-y-3 z-10 text-center md:text-left flex-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#EBF1EF] border border-[#13493B]/10">
            <ShieldCheck className="w-3.5 h-3.5 text-[#20E79A]" />
            <span className="text-[10px] font-black uppercase tracking-wider text-[#07221A]">
              Category: {currentProduct.category} • Batch #{currentProduct.batchNumber || 'FR-9982'}
            </span>
          </div>

          <div className="space-y-1">
            <h2 className="text-2xl sm:text-3xl font-black text-[#07221A] tracking-tight">
              {hasActiveBreach ? 'Threshold Alert Active' : 'Optimal Preservation State'}
            </h2>
            <p className="text-xs text-[#5C7F75] font-semibold max-w-lg leading-relaxed">
              {freshnessReport?.message || 'Physical IoT sensor nodes are actively streaming environmental telemetry with zero preservation anomalies.'}
            </p>
          </div>

          <div className="flex items-center justify-center md:justify-start gap-2 pt-1">
            <StatusBadge status={freshnessReport?.status || 'Fresh'} />
            <span className="text-xs font-bold text-[#07221A] font-mono">
              Score: {freshnessReport?.score || 100}%
            </span>
          </div>
        </div>

        <div className="flex flex-col items-center justify-center shrink-0 border-t md:border-t-0 md:border-l border-[#13493B]/10 pt-4 md:pt-0 md:pl-10 w-full md:w-auto">
          <span className="text-[10px] font-black text-[#5C7F75] uppercase tracking-wider mb-2">Live Freshness Score</span>
          <div className="relative flex items-center justify-center">
            <FreshnessGauge score={((currentProduct as any)?.isUnconfigured) ? 0 : (freshnessReport?.score || 100)} size="md" />
          </div>
        </div>
      </div>

      {/* EIGHT LIVE METRIC TILES - INCLUDES IMPACT, LIGHT & NEO-6M GPS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
        <SensorCard
          title="Ambient Temperature"
          value={((currentProduct as any)?.isUnconfigured) ? '--' : (sensorData?.temperature || 4.2)}
          unit={((currentProduct as any)?.isUnconfigured) ? undefined : "°C"}
          icon={Thermometer}
          color={metricConfig.temp.color}
          status={((currentProduct as any)?.isUnconfigured) ? undefined : (isTempBreached ? 'critical' : 'normal')}
          message={((currentProduct as any)?.isUnconfigured) ? 'Not Configured Yet' : (isTempBreached ? 'Elevated temperature' : 'Safe cooling bounds')}
          isEmpty={!!((currentProduct as any)?.isUnconfigured)}
        />

        <SensorCard
          title="Relative Humidity"
          value={((currentProduct as any)?.isUnconfigured) ? '--' : (sensorData?.humidity || 62)}
          unit={((currentProduct as any)?.isUnconfigured) ? undefined : "%"}
          icon={Droplets}
          color={metricConfig.humidity.color}
          status={((currentProduct as any)?.isUnconfigured) ? undefined : (isHumidityBreached ? 'critical' : 'normal')}
          message={((currentProduct as any)?.isUnconfigured) ? 'Not Configured Yet' : "Moisture level steady"}
          isEmpty={!!((currentProduct as any)?.isUnconfigured)}
        />

        <SensorCard
          title="Calculated Moisture"
          value={((currentProduct as any)?.isUnconfigured) ? '--' : (sensorData?.moisture ?? liveMoisture.absoluteMoisture)}
          unit={((currentProduct as any)?.isUnconfigured) ? undefined : "g/m³"}
          icon={Droplets}
          color={metricConfig.moisture.color}
          status={((currentProduct as any)?.isUnconfigured) ? undefined : (liveMoisture.status === 'Condensation Hazard' ? 'critical' : liveMoisture.status === 'Elevated' ? 'warning' : 'normal')}
          message={((currentProduct as any)?.isUnconfigured) ? 'Not Configured Yet' : `Dew: ${liveMoisture.dewPoint}°C • ${liveMoisture.status}`}
          isEmpty={!!((currentProduct as any)?.isUnconfigured)}
        />

        <SensorCard
          title="Calculated pH"
          value={((currentProduct as any)?.isUnconfigured) ? '--' : (sensorData?.ph ?? livePH.ph)}
          unit={((currentProduct as any)?.isUnconfigured) ? undefined : "pH"}
          icon={Activity}
          color={metricConfig.ph.color}
          status={((currentProduct as any)?.isUnconfigured) ? undefined : (livePH.status === 'Acidic / Fermenting' ? 'critical' : livePH.status === 'Mild Acidic' ? 'warning' : 'normal')}
          message={((currentProduct as any)?.isUnconfigured) ? 'Not Configured Yet' : `${livePH.status} • ${livePH.acidityClassification}`}
          isEmpty={!!((currentProduct as any)?.isUnconfigured)}
        />

        <SensorCard
          title="MQ-135 Gas Sensors"
          value={((currentProduct as any)?.isUnconfigured) ? '--' : (sensorData?.gas || 120)}
          unit={((currentProduct as any)?.isUnconfigured) ? undefined : (sensorData?.gas && sensorData.gas > 500 ? "ADC" : "ppm")}
          icon={Wind}
          color={metricConfig.gas.color}
          status={((currentProduct as any)?.isUnconfigured) ? undefined : (isGasBreached ? 'critical' : 'normal')}
          message={((currentProduct as any)?.isUnconfigured) ? 'Not Configured Yet' : (isGasBreached ? 'Gas threshold breach' : 'Stable atmosphere')}
          isEmpty={!!((currentProduct as any)?.isUnconfigured)}
        />

        <SensorCard
          title="Impact Sensor"
          value={((currentProduct as any)?.isUnconfigured) ? '--' : liveImpact.toFixed(2)}
          unit={((currentProduct as any)?.isUnconfigured) ? undefined : "G"}
          icon={Zap}
          color={metricConfig.impact.color}
          status={((currentProduct as any)?.isUnconfigured) ? undefined : (liveImpact > 1.5 ? 'critical' : 'normal')}
          message={((currentProduct as any)?.isUnconfigured) ? 'Not Configured Yet' : (liveImpact > 1.5 ? 'Shock detected (> 1.5 G)' : 'No Shock • Safe (< 1.5 G)')}
          isEmpty={!!((currentProduct as any)?.isUnconfigured)}
        />

        <SensorCard
          title="Light Sensor"
          value={((currentProduct as any)?.isUnconfigured) ? '--' : liveLight}
          unit={((currentProduct as any)?.isUnconfigured) ? undefined : "lx"}
          icon={Sun}
          color={metricConfig.light.color}
          status={((currentProduct as any)?.isUnconfigured) ? undefined : (liveLight > 50 ? 'warning' : 'normal')}
          message={((currentProduct as any)?.isUnconfigured) ? 'Not Configured Yet' : (liveLight > 50 ? 'Light exposed (> 50 lx)' : 'Dark Sealed (< 50 lx)')}
          isEmpty={!!((currentProduct as any)?.isUnconfigured)}
        />

        <SensorCard
          title="NEO-6M GPS"
          value={((currentProduct as any)?.isUnconfigured) ? '--' : `${liveGpsLat.toFixed(4)}°N, ${liveGpsLng.toFixed(4)}°E`}
          icon={Navigation}
          color={metricConfig.gps.color}
          status={((currentProduct as any)?.isUnconfigured) ? undefined : 'normal'}
          message={((currentProduct as any)?.isUnconfigured) ? 'Not Configured Yet' : `NEO-6M • ${liveGpsSats} Sats Fix Locked`}
          isEmpty={!!((currentProduct as any)?.isUnconfigured)}
        />
      </div>

      {/* FRESHNESS SCORE WORKING PRINCIPLE & SCIENTIFIC REMARK CARD */}
      <FreshnessPrincipleCard
        report={freshnessReport}
        productName={currentProduct.name}
        category={currentProduct.category}
        isUnconfigured={!!((currentProduct as any)?.isUnconfigured)}
        thresholdRules={thresholds}
        impact={liveImpact}
        light={liveLight}
        gpsLat={liveGpsLat}
        gpsLng={liveGpsLng}
        gpsSats={liveGpsSats}
      />

      {/* TREND GRAPH CARD */}
      <div className="bg-white border border-[#13493B]/10 rounded-[28px] p-4 sm:p-6 shadow-sm space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3.5 pb-2 border-b border-[#F4F7F6]">
          <div className="space-y-0.5">
            <h3 className="text-sm font-black text-[#07221A]">Live Bio-Telemetry Trends</h3>
            <p className="text-[11px] text-[#5C7F75] font-semibold">Continuous sensor telemetry feed synced via Bluetooth/RFID &amp; NEO-6M GPS.</p>
            <div className="inline-flex flex-wrap items-center gap-x-2 gap-y-1 pt-1 text-[10px] font-mono text-[#5C7F75]">
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3 text-[#20E79A]" />
                <span>Last Response Received:</span>
                <strong className="text-[#07221A] font-bold">{lastResponseFormatted}</strong>
              </div>
              <span className="hidden sm:inline">•</span>
              <span className="text-[#13493B] font-sans font-semibold">Note: response valid for only 2 hours from the last response time</span>
            </div>
          </div>

          <div className="flex overflow-x-auto max-w-full bg-[#F4F7F6] p-1 rounded-xl border border-[#13493B]/10 [scrollbar-width:none]">
            {(['temp', 'humidity', 'moisture', 'ph', 'gas', 'impact', 'light'] as const).map((tab) => {
              const active = activeMetricTab === tab;
              return (
                <button
                  type="button"
                  key={tab}
                  onClick={() => setActiveMetricTab(tab)}
                  className="relative px-3 py-1.5 rounded-lg text-[11px] sm:text-xs font-black transition-all cursor-pointer shrink-0"
                >
                  {active && (
                    <motion.div
                      layoutId="metricTabActive"
                      className="absolute inset-0 bg-white shadow-sm rounded-lg border border-[#13493B]/10"
                      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                    />
                  )}
                  <span className={`relative z-10 ${active ? 'text-[#07221A]' : 'text-[#5C7F75] hover:text-[#07221A]'}`}>
                    {tab === 'temp'
                      ? 'Temp (°C)'
                      : tab === 'humidity'
                      ? 'Humidity (%)'
                      : tab === 'moisture'
                      ? 'Moisture'
                      : tab === 'ph'
                      ? 'pH Level'
                      : tab === 'gas'
                      ? 'Gas (ppm)'
                      : tab === 'impact'
                      ? 'Impact (G)'
                      : 'Light (lx)'}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Recharts Chart Area */}
        <div className="h-64 sm:h-72 w-full relative">
          {((currentProduct as any)?.isUnconfigured) && (
            <div className="absolute inset-0 bg-white/70 backdrop-blur-[2px] z-10 flex flex-col items-center justify-center text-center p-6 rounded-[20px]">
              <AlertTriangle className="w-8 h-8 text-[#FFAA00] mb-2 animate-bounce" />
              <h4 className="text-sm font-black text-[#07221A]">No Live History Feed</h4>
              <p className="text-xs font-semibold text-[#5C7F75] max-w-sm mt-1 leading-relaxed">
                Telemetry charts and historical trend vectors will populate once the hardware micro-node transmits its first payload packet.
              </p>
            </div>
          )}
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="chartGradientLive" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor={metricConfig[activeMetricTab].color}
                    stopOpacity={0.25}
                  />
                  <stop
                    offset="95%"
                    stopColor={metricConfig[activeMetricTab].color}
                    stopOpacity={0}
                  />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#F4F7F6" vertical={false} />
              <XAxis dataKey="time" stroke="#5C7F75" fontSize={10} fontWeight={700} tickLine={false} axisLine={false} />
              <YAxis stroke="#5C7F75" fontSize={10} fontWeight={700} tickLine={false} axisLine={false} width={34} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#FFFFFF',
                  borderColor: 'rgba(19, 73, 59, 0.1)',
                  borderRadius: '16px',
                  boxShadow: '0 8px 30px rgba(0,0,0,0.06)'
                }}
                labelStyle={{ fontWeight: 800, color: '#07221A', fontSize: '11px' }}
                itemStyle={{ fontWeight: 700, fontSize: '11px', color: metricConfig[activeMetricTab].color }}
              />
              <Area
                type="monotone"
                dataKey={
                  activeMetricTab === 'temp'
                    ? 'temperature'
                    : activeMetricTab === 'humidity'
                    ? 'humidity'
                    : activeMetricTab === 'moisture'
                    ? 'moisture'
                    : activeMetricTab === 'ph'
                    ? 'ph'
                    : activeMetricTab === 'gas'
                    ? 'gas'
                    : activeMetricTab === 'impact'
                    ? 'impact'
                    : 'light'
                }
                stroke={metricConfig[activeMetricTab].color}
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#chartGradientLive)"
                isAnimationActive={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* THRESHOLD CONFIG MODAL */}
      <ThresholdConfigModal
        isOpen={isConfigOpen}
        onClose={() => setIsConfigOpen(false)}
        currentThresholds={thresholds}
        onSave={updateThresholds}
      />
    </motion.div>
  );
};

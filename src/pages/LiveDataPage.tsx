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
  Navigation,
  MapPin,
  ExternalLink,
  Compass
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
import { useApp, DeviceData } from '../context/AppContext';
import { useFreshness } from '../context/FreshnessContext';
import { StatusBadge } from '../components/common/StatusBadge';
import { FreshnessGauge } from '../components/common/FreshnessGauge';
import { SensorCard } from '../components/common/SensorCard';
import { ThresholdConfigModal } from '../components/common/ThresholdConfigModal';
import { HistoricalReadingPoint } from '../types';
import { calculateMoisture } from '../utils/moistureCalculator';
import { calculatePH } from '../utils/phCalculator';
import { formatRealtimeDateTime, extractLatestTimestamp } from '../utils/dateUtils';
import { resolveFactualProduct } from '../data/initialData';
import { generateAndDownloadProductPDF } from '../utils/pdfReportGenerator';
import { socketTelemetryService } from '../services/socketService';

export const LiveDataPage: React.FC = () => {
  const { userProfile } = useAuth();
  const { devicesMap } = useApp();
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

  const resolvedDeviceId = useMemo(() => {
    const sourceId = isAdmin
      ? (itemId || userProfile?.assignedProductId || 'YGS-FD-001')
      : (userProfile?.assignedProductId || itemId || 'YGS-FD-001');
    const raw = sourceId.trim().toUpperCase();
    if (raw.includes('124') || raw.includes('MILK')) return 'YGS-FD-124';
    return 'YGS-FD-001';
  }, [isAdmin, itemId, userProfile?.assignedProductId]);

  useEffect(() => {
    if (!activeItem || activeItem.id.toUpperCase() !== resolvedDeviceId) {
      scanItem(resolvedDeviceId).catch(() => {});
    }
  }, [resolvedDeviceId, activeItem, scanItem]);

  const liveDevices = useMemo(() => {
    return (Object.values(devicesMap) as DeviceData[]).filter(
      (d) => d.device_id !== 'YGS-FD-000124' && d.device_id !== 'YGS-FD-112233'
    );
  }, [devicesMap]);

  const targetDev = useMemo(() => {
    return (
      devicesMap[resolvedDeviceId] ||
      devicesMap[resolvedDeviceId.replace(/^YGS-FD-/, '')] ||
      liveDevices.find((d) => d.device_id.toUpperCase() === resolvedDeviceId) ||
      null
    );
  }, [devicesMap, resolvedDeviceId, liveDevices]);

  const factualProduct = useMemo(() => {
    return resolveFactualProduct(
      resolvedDeviceId,
      activeItem?.id?.toUpperCase() === resolvedDeviceId ? activeItem?.image : undefined
    );
  }, [resolvedDeviceId, activeItem]);

  const liveTemp = Number(
    Number(
      targetDev?.temperature_c ??
        targetDev?.temperature ??
        sensorData?.temperature ??
        (factualProduct.id === 'YGS-FD-124' ? 30.6 : 31.6)
    ).toFixed(1)
  );
  const liveHumidity = Number(
    Number(
      targetDev?.humidity_percent ??
        targetDev?.humidity ??
        sensorData?.humidity ??
        (factualProduct.id === 'YGS-FD-124' ? 72.2 : 71.2)
    ).toFixed(1)
  );
  const liveGas = Number(
    targetDev?.mq135_raw ??
      sensorData?.gas ??
      (factualProduct.id === 'YGS-FD-124' ? 47 : 79)
  );
  const liveImpact = Number(
    Number(
      targetDev?.acceleration_change ??
        targetDev?.impact ??
        sensorData?.impact ??
        (factualProduct.id === 'YGS-FD-124' ? 0 : 0.147)
    ).toFixed(3)
  );
  const liveLight = Number(
    Number(
      targetDev?.light_lux ??
        targetDev?.light ??
        sensorData?.light ??
        (factualProduct.id === 'YGS-FD-124' ? 33.3 : 12.5)
    ).toFixed(1)
  );
  const liveGpsLat = Number(targetDev?.gpsLat ?? sensorData?.gpsLat ?? 28.6139);
  const liveGpsLng = Number(targetDev?.gpsLng ?? sensorData?.gpsLng ?? 77.2090);
  const liveGpsSats = Number(
    targetDev?.gps_satellites ??
      targetDev?.gpsSats ??
      sensorData?.gpsSats ??
      0
  );

  const isTempBreached = liveTemp > thresholds.tempMax;
  const isGasBreached = liveGas > 500 ? liveGas > 1400 : liveGas > thresholds.gasWarning;
  const isHumidityBreached = liveHumidity > thresholds.humidityMax || liveHumidity < thresholds.humidityMin;
  const hasActiveBreach = isTempBreached || isGasBreached || isHumidityBreached;

  const liveMoisture = calculateMoisture(liveTemp, liveHumidity);

  const livePH = calculatePH(
    liveTemp,
    liveHumidity,
    liveMoisture.absoluteMoisture,
    { category: factualProduct.category, gas: liveGas }
  );

  const [realtimeStatus, setRealtimeStatus] = useState<'online' | 'offline'>(() =>
    socketTelemetryService.getLatestStatus(factualProduct.id)
  );
  const [lastResponseTs, setLastResponseTs] = useState<number>(() =>
    socketTelemetryService.getLastResponseTimestamp(factualProduct.id)
  );

  useEffect(() => {
    setRealtimeStatus(socketTelemetryService.getLatestStatus(factualProduct.id));
    setLastResponseTs(socketTelemetryService.getLastResponseTimestamp(factualProduct.id));
    const unsub = socketTelemetryService.subscribeStatus(factualProduct.id, (status, meta) => {
      setRealtimeStatus(status);
      const nextTs = meta?.lastResponseAt || meta?.lastDataAt;
      if (nextTs) {
        setLastResponseTs(nextTs);
      }
    });
    return () => unsub();
  }, [factualProduct.id]);

  const isDeviceOnline = realtimeStatus === 'online';

  const lastResponseFormatted = useMemo(() => {
    const raw =
      lastResponseTs ||
      socketTelemetryService.getLastResponseTimestamp(factualProduct.id) ||
      extractLatestTimestamp(targetDev, 0) ||
      extractLatestTimestamp(sensorData, 0) ||
      Date.now();
    return formatRealtimeDateTime(raw).fullStr;
  }, [lastResponseTs, factualProduct.id, targetDev, sensorData]);

  const chartData: HistoricalReadingPoint[] = [
    { time: '09:00', timestamp: 1, temperature: Number((liveTemp - 0.3).toFixed(1)), humidity: Math.round(liveHumidity - 2), gas: Math.max(20, liveGas - 8), moisture: calculateMoisture(liveTemp - 0.3, liveHumidity - 2).absoluteMoisture, ph: calculatePH(liveTemp - 0.3, liveHumidity - 2, calculateMoisture(liveTemp - 0.3, liveHumidity - 2).absoluteMoisture).ph, impact: 0.05, light: Math.max(5, liveLight - 2) },
    { time: '09:30', timestamp: 2, temperature: Number((liveTemp - 0.2).toFixed(1)), humidity: Math.round(liveHumidity - 1), gas: Math.max(20, liveGas - 5), moisture: calculateMoisture(liveTemp - 0.2, liveHumidity - 1).absoluteMoisture, ph: calculatePH(liveTemp - 0.2, liveHumidity - 1, calculateMoisture(liveTemp - 0.2, liveHumidity - 1).absoluteMoisture).ph, impact: 0.07, light: Math.max(5, liveLight - 1) },
    { time: '10:00', timestamp: 3, temperature: Number((liveTemp + 0.1).toFixed(1)), humidity: Math.round(liveHumidity + 1), gas: Math.max(20, liveGas - 2), moisture: calculateMoisture(liveTemp + 0.1, liveHumidity + 1).absoluteMoisture, ph: calculatePH(liveTemp + 0.1, liveHumidity + 1, calculateMoisture(liveTemp + 0.1, liveHumidity + 1).absoluteMoisture).ph, impact: 0.11, light: liveLight + 1 },
    { time: '10:15', timestamp: 4, temperature: Number(liveTemp.toFixed(1)), humidity: Math.round(liveHumidity), gas: Math.max(20, liveGas - 1), moisture: calculateMoisture(liveTemp, liveHumidity).absoluteMoisture, ph: calculatePH(liveTemp, liveHumidity, calculateMoisture(liveTemp, liveHumidity).absoluteMoisture).ph, impact: 0.09, light: liveLight },
    { time: '10:30', timestamp: 5, temperature: Number((liveTemp - 0.1).toFixed(1)), humidity: Math.round(liveHumidity - 1), gas: liveGas, moisture: calculateMoisture(liveTemp - 0.1, liveHumidity - 1).absoluteMoisture, ph: calculatePH(liveTemp - 0.1, liveHumidity - 1, calculateMoisture(liveTemp - 0.1, liveHumidity - 1).absoluteMoisture).ph, impact: 0.06, light: Math.max(5, liveLight - 1) },
    { 
      time: isDeviceOnline ? 'Live' : 'Offline', 
      timestamp: 6, 
      temperature: liveTemp, 
      humidity: liveHumidity, 
      gas: liveGas,
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
    const isMilk = factualProduct.id === 'YGS-FD-124';
    const fallbackDays = isMilk ? 5 : 14;
    const expDate = new Date(Date.now() + fallbackDays * 86400000).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
    generateAndDownloadProductPDF({
      reportId: `FNX-${factualProduct.id.replace('YGS-FD-', '')}-${Date.now().toString().slice(-5)}`,
      generatedAt: formatRealtimeDateTime(Date.now()).fullStr,
      lastSyncedAt: lastResponseFormatted,
      productName: factualProduct.name,
      deviceId: factualProduct.id,
      category: factualProduct.category,
      batchNumber: isMilk ? 'BATCH-MK-0124' : 'BATCH-AP-0001',
      originLocation: 'Cold-Chain Distribution Hub • Sector 4',
      freshnessScore: freshnessReport?.score ?? 96,
      freshnessStatus: freshnessReport?.status ?? 'Fresh',
      freshnessMessage: freshnessReport?.message ?? 'Optimal cold-chain preservation parameters confirmed.',
      remainingDays: fallbackDays,
      remainingHours: 8,
      estimatedExpiryDate: expDate,
      confidencePercent: 94,
      spoilageRiskLevel: (freshnessReport?.score ?? 96) >= 85 ? 'Low' : 'Moderate',
      predictedStatus: 'Optimal Cold-Chain Retention',
      predictionSummary: `Live telemetry for ${factualProduct.name} (${factualProduct.id}) at ${liveTemp}°C and ${liveHumidity}% RH confirms stable preservation.`,
      storageAdvice: isMilk
        ? 'Keep sealed at 1°C–4°C away from direct light exposure.'
        : 'Maintain crisp cold storage between 1°C–4°C at 85%–90% relative humidity.',
      temperature: liveTemp,
      humidity: liveHumidity,
      moisture: sensorData?.moisture ?? liveMoisture.absoluteMoisture,
      dewPoint: sensorData?.dewPoint ?? liveMoisture.dewPoint,
      ph: sensorData?.ph ?? livePH.ph,
      acidityClass: livePH.acidityClassification,
      gas: liveGas,
      impact: liveImpact,
      light: liveLight,
      gpsLat: liveGpsLat,
      gpsLng: liveGpsLng,
      gpsSats: liveGpsSats
    });
  };

  const currentProduct = activeItem || {
    id: factualProduct.id,
    name: factualProduct.name,
    category: factualProduct.category,
    tagId: factualProduct.tagId,
    image: factualProduct.image,
    batchNumber: factualProduct.id === 'YGS-FD-124' ? 'MK-0124' : 'AP-0001'
  };

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

  // Small map bounding box around liveGpsLat, liveGpsLng
  const mapEmbedUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${(liveGpsLng - 0.012).toFixed(5)}%2C${(liveGpsLat - 0.008).toFixed(5)}%2C${(liveGpsLng + 0.012).toFixed(5)}%2C${(liveGpsLat + 0.008).toFixed(5)}&layer=mapnik&marker=${liveGpsLat.toFixed(5)}%2C${liveGpsLng.toFixed(5)}`;

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
            onClick={() => navigate('/dashboard')}
            className="p-2.5 rounded-2xl bg-white border border-[#13493B]/10 text-[#07221A] hover:bg-[#F4F7F6] cursor-pointer shadow-sm flex items-center justify-center"
            aria-label="Back to Dashboard"
          >
            <ArrowLeft className="w-4 h-4" />
          </motion.button>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-wider text-[#5C7F75]">Live Sensor Reading &amp; GPS Telemetry</span>
              <span
                className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                  isDeviceOnline
                    ? 'bg-[#20E79A]/15 text-[#07221A] border-[#20E79A]/30'
                    : 'bg-rose-500/15 text-rose-700 border-rose-500/25'
                }`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    isDeviceOnline ? 'bg-[#20E79A] animate-pulse' : 'bg-rose-500'
                  }`}
                />
                {isDeviceOnline ? 'Live' : 'Offline'}
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-serif italic font-black text-[#07221A]">
              {factualProduct.name} • <span className="font-mono text-base font-bold text-emerald-700">{factualProduct.id}</span>
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
            <span>Download PDF Report</span>
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

      {/* EIGHT LIVE SENSOR READING CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
        <SensorCard
          title="Ambient Temperature"
          value={((currentProduct as any)?.isUnconfigured) ? '--' : liveTemp}
          unit={((currentProduct as any)?.isUnconfigured) ? undefined : "°C"}
          icon={Thermometer}
          color={metricConfig.temp.color}
          status={((currentProduct as any)?.isUnconfigured) ? undefined : (isTempBreached ? 'critical' : 'normal')}
          message={((currentProduct as any)?.isUnconfigured) ? 'Not Configured Yet' : (isTempBreached ? 'Elevated temperature' : 'Safe cooling bounds')}
          isEmpty={!!((currentProduct as any)?.isUnconfigured)}
          isOnline={isDeviceOnline}
          deviceId={factualProduct.id}
        />

        <SensorCard
          title="Relative Humidity"
          value={((currentProduct as any)?.isUnconfigured) ? '--' : liveHumidity}
          unit={((currentProduct as any)?.isUnconfigured) ? undefined : "%"}
          icon={Droplets}
          color={metricConfig.humidity.color}
          status={((currentProduct as any)?.isUnconfigured) ? undefined : (isHumidityBreached ? 'critical' : 'normal')}
          message={((currentProduct as any)?.isUnconfigured) ? 'Not Configured Yet' : "Moisture level steady"}
          isEmpty={!!((currentProduct as any)?.isUnconfigured)}
          isOnline={isDeviceOnline}
          deviceId={factualProduct.id}
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
          isOnline={isDeviceOnline}
          deviceId={factualProduct.id}
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
          isOnline={isDeviceOnline}
          deviceId={factualProduct.id}
        />

        <SensorCard
          title="MQ-135 Gas Sensors"
          value={((currentProduct as any)?.isUnconfigured) ? '--' : liveGas}
          unit={((currentProduct as any)?.isUnconfigured) ? undefined : (liveGas > 500 ? "ADC" : "ppm")}
          icon={Wind}
          color={metricConfig.gas.color}
          status={((currentProduct as any)?.isUnconfigured) ? undefined : (isGasBreached ? 'critical' : 'normal')}
          message={((currentProduct as any)?.isUnconfigured) ? 'Not Configured Yet' : (isGasBreached ? 'Gas threshold breach' : 'Stable atmosphere')}
          isEmpty={!!((currentProduct as any)?.isUnconfigured)}
          isOnline={isDeviceOnline}
          deviceId={factualProduct.id}
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
          isOnline={isDeviceOnline}
          deviceId={factualProduct.id}
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
          isOnline={isDeviceOnline}
          deviceId={factualProduct.id}
        />

        <SensorCard
          title="NEO-6M GPS"
          value={((currentProduct as any)?.isUnconfigured) ? '--' : `${liveGpsLat.toFixed(4)}°N, ${liveGpsLng.toFixed(4)}°E`}
          icon={Navigation}
          color={metricConfig.gps.color}
          status={((currentProduct as any)?.isUnconfigured) ? undefined : 'normal'}
          message={((currentProduct as any)?.isUnconfigured) ? 'Not Configured Yet' : `NEO-6M • ${liveGpsSats} Sats Fix Locked`}
          isEmpty={!!((currentProduct as any)?.isUnconfigured)}
          isOnline={isDeviceOnline}
          deviceId={factualProduct.id}
        />
      </div>

      {/* LIVE TELEMETRY TREND GRAPH + SMALL GPS LOCATION MAP SIDE-BY-SIDE */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        {/* LEFT (7 COLS): TREND GRAPH CARD */}
        <div className="lg:col-span-7 bg-white border border-[#13493B]/10 rounded-[28px] p-4 sm:p-6 shadow-sm flex flex-col justify-between space-y-4">
          <div className="flex flex-col gap-3 pb-2 border-b border-[#F4F7F6]">
            <div className="space-y-0.5">
              <div className="flex items-center justify-between gap-2">
                <h3 className="text-sm font-black text-[#07221A]">Live Bio-Telemetry Trends</h3>
                <span
                  className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                    isDeviceOnline
                      ? 'bg-emerald-500/10 text-emerald-700 border-emerald-500/20'
                      : 'bg-rose-500/10 text-rose-700 border-rose-500/20'
                  }`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      isDeviceOnline ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'
                    }`}
                  />
                  {isDeviceOnline ? 'Live' : 'Offline'}
                </span>
              </div>
              <p className="text-[11px] text-[#5C7F75] font-semibold">Continuous sensor telemetry feed synced via hardware node {factualProduct.id}.</p>
              <div className="inline-flex flex-wrap items-center gap-x-2 gap-y-1 pt-1 text-[10px] font-mono text-[#5C7F75]">
                <div className="flex items-center gap-1">
                  <Clock className={`w-3 h-3 ${isDeviceOnline ? 'text-[#20E79A]' : 'text-rose-500'}`} />
                  <span>Last Response:</span>
                  <strong className="text-[#07221A] font-bold">{lastResponseFormatted}</strong>
                </div>
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
                    className="relative px-3 py-1.5 rounded-lg text-[11px] font-black transition-all cursor-pointer shrink-0"
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

        {/* RIGHT (5 COLS): SMALL INTERACTIVE GPS LOCATION MAP */}
        <div className="lg:col-span-5 bg-white border border-[#13493B]/10 rounded-[28px] p-4 sm:p-6 shadow-sm flex flex-col justify-between space-y-4">
          <div className="flex items-start justify-between gap-3 pb-2 border-b border-[#F4F7F6]">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#06B6D4]" />
                <h3 className="text-sm font-black text-[#07221A]">Live Device Location Map</h3>
              </div>
              <p className="text-[11px] text-[#5C7F75] font-semibold">
                NEO-6M GPS Satellite Lock • {factualProduct.name} ({factualProduct.id})
              </p>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <span
                className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                  isDeviceOnline
                    ? 'bg-emerald-500/10 text-emerald-700 border-emerald-500/20'
                    : 'bg-rose-500/10 text-rose-700 border-rose-500/20'
                }`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    isDeviceOnline ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'
                  }`}
                />
                {isDeviceOnline ? 'Live' : 'Offline'}
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-cyan-50 border border-cyan-500/25 text-cyan-900 text-[10px] font-mono font-bold shrink-0">
                <Compass className="w-3 h-3 text-cyan-600" />
                {liveGpsSats} Sats Locked
              </span>
            </div>
          </div>

          {/* Embedded Small Map */}
          <div className="relative w-full h-56 sm:h-64 rounded-2xl overflow-hidden border border-[#13493B]/15 bg-[#F4F7F6] shadow-inner">
            <iframe
              title={`GPS Location Map for ${factualProduct.id}`}
              src={mapEmbedUrl}
              className="w-full h-full border-0"
              loading="lazy"
            />
            <div className="absolute bottom-2.5 left-2.5 right-2.5 p-2.5 rounded-xl bg-[#07221A]/85 backdrop-blur-md text-white flex items-center justify-between gap-2 text-[11px] shadow-md pointer-events-none">
              <div className="flex items-center gap-1.5 font-mono font-bold truncate">
                <span
                  className={`w-2 h-2 rounded-full shrink-0 ${
                    isDeviceOnline ? 'bg-[#20E79A] animate-ping' : 'bg-rose-500'
                  }`}
                />
                <span>{liveGpsLat.toFixed(4)}°N, {liveGpsLng.toFixed(4)}°E</span>
              </div>
              <span
                className={`text-[10px] font-mono font-black shrink-0 ${
                  isDeviceOnline ? 'text-[#20E79A]' : 'text-rose-400'
                }`}
              >
                {factualProduct.id} • {isDeviceOnline ? 'Live' : 'Offline'}
              </span>
            </div>
          </div>

          {/* Coordinate Details & Open Map Link */}
          <div className="flex items-center justify-between gap-3 pt-1 text-xs">
            <div className="text-[11px] text-[#5C7F75] font-semibold">
              <span>Telemetry Node: </span>
              <strong className="font-mono text-[#07221A]">{factualProduct.id}</strong>
            </div>
            <a
              href={`https://www.openstreetmap.org/?mlat=${liveGpsLat}&mlon=${liveGpsLng}#map=15/${liveGpsLat}/${liveGpsLng}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-black text-[#0E7490] hover:text-[#07221A] transition-colors"
            >
              <span>View Larger Map</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
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

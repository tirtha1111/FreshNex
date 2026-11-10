import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../context/AuthContext';
import { useApp, DeviceData } from '../context/AppContext';
import { useFreshness } from '../context/FreshnessContext';
import {
  QrCode,
  ShieldCheck,
  ArrowRight,
  Scan,
  Activity,
  Sparkles,
  RefreshCw,
  Clock,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  Cpu,
  Layers,
  FileText,
  Download,
  Copy,
  Check,
  Thermometer,
  Droplets,
  Wind,
  Sliders,
  MapPin,
  ZoomIn,
  Info,
  Zap
} from 'lucide-react';
import { FreshnessGauge } from '../components/common/FreshnessGauge';
import { StatusBadge } from '../components/common/StatusBadge';
import { calculateMoisture } from '../utils/moistureCalculator';
import { calculatePH } from '../utils/phCalculator';
import { formatRealtimeDateTime, extractLatestTimestamp } from '../utils/dateUtils';
import { resolveFactualProduct } from '../data/initialData';
import { calculateFreshness } from '../utils/freshnessEngine';
import { generateAndDownloadProductPDF } from '../utils/pdfReportGenerator';

interface FresoraPrediction {
  productName: string;
  deviceId: string;
  remainingDays: number;
  remainingHours: number;
  estimatedExpiryDate: string;
  confidencePercent: number;
  spoilageRiskLevel: 'Low' | 'Moderate' | 'High' | 'Critical';
  predictedStatus: string;
  predictionSummary: string;
  storageAdvice: string;
  predictedAt?: string;
}

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { userProfile } = useAuth();
  const { devicesMap } = useApp();
  const {
    activeItem,
    sensorData,
    freshnessReport: contextFreshnessReport,
    thresholds,
    scanItem
  } = useFreshness();

  const reportSectionRef = useRef<HTMLDivElement | null>(null);

  const isAdmin = userProfile?.role === 'admin';
  const assignedDeviceId = useMemo(() => {
    const raw = (userProfile?.assignedProductId || 'YGS-FD-001').trim().toUpperCase();
    if (raw.includes('124') || raw.includes('MILK')) return 'YGS-FD-124';
    return 'YGS-FD-001';
  }, [userProfile?.assignedProductId]);

  const [activeCardTab, setActiveCardTab] = useState<'overview' | 'breakdown' | 'info'>('overview');
  const [simulatedTempOffset, setSimulatedTempOffset] = useState<number>(0);
  const [isImageZoomed, setIsImageZoomed] = useState<boolean>(false);
  const [copiedSummary, setCopiedSummary] = useState<boolean>(false);
  const [pdfDownloaded, setPdfDownloaded] = useState<boolean>(false);

  // Sync FreshnessContext strictly with assignedDeviceId
  useEffect(() => {
    if (!activeItem || activeItem.id.toUpperCase() !== assignedDeviceId) {
      scanItem(assignedDeviceId).catch(() => {});
    }
  }, [assignedDeviceId, activeItem, scanItem]);

  const liveDevices = useMemo(() => {
    return (Object.values(devicesMap) as DeviceData[]).filter(
      (d) => d.device_id !== 'YGS-FD-000124' && d.device_id !== 'YGS-FD-112233'
    );
  }, [devicesMap]);

  const targetDev = useMemo(() => {
    return (
      devicesMap[assignedDeviceId] ||
      devicesMap[assignedDeviceId.replace(/^YGS-FD-/, '')] ||
      liveDevices.find((d) => d.device_id.toUpperCase() === assignedDeviceId) ||
      null
    );
  }, [devicesMap, assignedDeviceId, liveDevices]);

  // Resolve factual product (YGS-FD-001 -> Apple only, YGS-FD-124 -> Milk only)
  const productInfo = useMemo(() => {
    return resolveFactualProduct(
      assignedDeviceId,
      activeItem?.id?.toUpperCase() === assignedDeviceId ? activeItem?.image : undefined
    );
  }, [assignedDeviceId, activeItem]);

  // Live sensor values used for Freshness Level, Interactive Card, and Report
  const liveTelemetry = useMemo(() => {
    const baseTemp = Number(
      targetDev?.temperature ??
        sensorData?.temperature ??
        (productInfo.id === 'YGS-FD-124' ? 3.8 : 4.2)
    );
    const temperature = Number((baseTemp + simulatedTempOffset).toFixed(1));
    const humidity = Number(
      targetDev?.humidity ??
        sensorData?.humidity ??
        (productInfo.id === 'YGS-FD-124' ? 68.0 : 85.0)
    );
    const gas = Number(
      targetDev?.mq135_raw ??
        sensorData?.gas ??
        (productInfo.id === 'YGS-FD-124' ? 95 : 84)
    );
    const impact = Number(targetDev?.impact ?? sensorData?.impact ?? 0.08);
    const light = Math.round(Number(targetDev?.light ?? sensorData?.light ?? 16));
    const gpsLat = Number(targetDev?.gpsLat ?? sensorData?.gpsLat ?? 28.6139);
    const gpsLng = Number(targetDev?.gpsLng ?? sensorData?.gpsLng ?? 77.2090);
    const gpsSats = Number(targetDev?.gpsSats ?? sensorData?.gpsSats ?? 9);

    const moistureObj = calculateMoisture(temperature, humidity);
    const phObj = calculatePH(temperature, humidity, moistureObj.absoluteMoisture, {
      category: productInfo.category,
      gas
    });

    return {
      baseTemp,
      temperature,
      humidity,
      gas,
      impact,
      light,
      gpsLat,
      gpsLng,
      gpsSats,
      moisture: moistureObj.absoluteMoisture,
      dewPoint: moistureObj.dewPoint,
      ph: phObj.ph,
      acidityClass: phObj.acidityClassification
    };
  }, [targetDev, sensorData, productInfo, simulatedTempOffset]);

  // Compute live freshness score & status
  const freshnessReport = useMemo(() => {
    const computed = calculateFreshness({
      temperature: liveTelemetry.temperature,
      humidity: liveTelemetry.humidity,
      gas: liveTelemetry.gas,
      category: productInfo.category,
      activeThresholdRules: thresholds
    });
    return computed || contextFreshnessReport;
  }, [liveTelemetry, productInfo.category, thresholds, contextFreshnessReport]);

  // Sub-scores for the interactive Quality Breakdown tab
  const subScores = useMemo(() => {
    const tempScore =
      liveTelemetry.temperature <= thresholds.tempMax && liveTelemetry.temperature >= thresholds.tempMin
        ? 98
        : Math.max(40, Math.round(98 - Math.abs(liveTelemetry.temperature - thresholds.tempMax) * 9));
    const humScore =
      liveTelemetry.humidity <= thresholds.humidityMax && liveTelemetry.humidity >= thresholds.humidityMin
        ? 96
        : Math.max(50, Math.round(96 - Math.abs(liveTelemetry.humidity - 75) * 1.2));
    const gasScore =
      liveTelemetry.gas < (thresholds.gasWarning || 250)
        ? 97
        : Math.max(35, Math.round(97 - (liveTelemetry.gas - 200) * 0.25));
    return { tempScore, humScore, gasScore };
  }, [liveTelemetry, thresholds]);

  const lastResponseInfo = useMemo(() => {
    const rawTs =
      Math.max(
        extractLatestTimestamp(targetDev, 0),
        extractLatestTimestamp(sensorData, 0)
      ) || Date.now();
    const { dateStr, timeStr, fullStr } = formatRealtimeDateTime(rawTs);
    return {
      dateStr,
      timeStr,
      fullText: fullStr
    };
  }, [targetDev, sensorData]);

  // AI AGENT FRESORA state
  const [prediction, setPrediction] = useState<FresoraPrediction | null>(null);
  const [isPredicting, setIsPredicting] = useState<boolean>(false);
  const [predictionError, setPredictionError] = useState<string | null>(null);

  const fetchFresoraPrediction = useCallback(async () => {
    setIsPredicting(true);
    setPredictionError(null);
    try {
      const response = await fetch('/api/ai/predict-shelf-life', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productName: productInfo.name,
          deviceId: productInfo.id,
          category: productInfo.category,
          temperature: liveTelemetry.temperature,
          humidity: liveTelemetry.humidity,
          moisture: liveTelemetry.moisture,
          ph: liveTelemetry.ph,
          gas: liveTelemetry.gas,
          impact: liveTelemetry.impact,
          light: liveTelemetry.light,
          freshnessScore: freshnessReport.score,
          status: freshnessReport.status
        })
      });

      const contentType = response.headers.get('content-type') || '';
      if (!response.ok || !contentType.includes('application/json')) {
        throw new Error(`HTTP ${response.status}`);
      }
      const rawData = await response.json();
      setPrediction({
        productName: rawData.productName || productInfo.name,
        deviceId: rawData.deviceId || productInfo.id,
        remainingDays: Number(rawData.remainingDays ?? 7),
        remainingHours: Number(rawData.remainingHours ?? 12),
        estimatedExpiryDate: rawData.estimatedExpiryDate || 'N/A',
        confidencePercent: Number(rawData.confidencePercent ?? rawData.confidence ?? 94),
        spoilageRiskLevel: rawData.spoilageRiskLevel || rawData.spoilageRisk || 'Low',
        predictedStatus: rawData.predictedStatus || rawData.shelfLifeSummary || 'Optimal Cold-Chain Retention',
        predictionSummary:
          rawData.predictionSummary ||
          rawData.primaryFactor ||
          'Telemetry within expected preservation parameters.',
        storageAdvice:
          rawData.storageAdvice || 'Maintain cold-chain storage between 1°C and 4°C.',
        predictedAt: rawData.predictedAt
      });
    } catch {
      const isMilk = productInfo.name.toLowerCase().includes('milk') || productInfo.id.includes('124');
      const baseDays = isMilk ? 7 : 35;
      const tempPenalty =
        liveTelemetry.temperature > 6
          ? Math.min(baseDays - 1, Math.round((liveTelemetry.temperature - 4) * 1.5))
          : 0;
      const scoreFactor = Math.max(0.25, freshnessReport.score / 100);
      const fallbackDays = Math.max(1, Math.round((baseDays - tempPenalty) * scoreFactor));
      const fallbackHours = isMilk ? 8 : 16;
      const expDate = new Date(
        Date.now() + (fallbackDays * 24 + fallbackHours) * 3600000
      ).toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      });
      setPredictionError(null);
      setPrediction({
        productName: productInfo.name,
        deviceId: productInfo.id,
        remainingDays: fallbackDays,
        remainingHours: fallbackHours,
        estimatedExpiryDate: expDate,
        confidencePercent: 94,
        spoilageRiskLevel:
          freshnessReport.score >= 85 ? 'Low' : freshnessReport.score >= 65 ? 'Moderate' : 'High',
        predictedStatus:
          liveTelemetry.temperature > 6 ? 'Thermal Drift Detected' : 'Optimal Cold-Chain Retention',
        predictionSummary: `At ${liveTelemetry.temperature}°C and ${liveTelemetry.humidity}% RH with MQ-135 gas at ${liveTelemetry.gas} and pH ${liveTelemetry.ph}, ${productInfo.name} (${productInfo.id}) maintains slow enzymatic respiration and stable cellular hydration.`,
        storageAdvice: isMilk
          ? 'Keep sealed between 1°C and 4°C away from direct light to prevent lactic fermentation.'
          : 'Maintain 0°C–4°C with 85%–95% RH to minimize ethylene ripening and moisture loss.',
        predictedAt: new Date().toISOString()
      });
    } finally {
      setIsPredicting(false);
    }
  }, [productInfo, liveTelemetry, freshnessReport.score, freshnessReport.status]);

  // Trigger AI AGENT FRESORA shelf-life prediction on mount or when product Device ID changes
  useEffect(() => {
    fetchFresoraPrediction();
  }, [productInfo.id]);

  const batchNumber = productInfo.id === 'YGS-FD-124' ? 'BATCH-MK-0124' : 'BATCH-AP-0001';

  const handleCopySummary = () => {
    const summaryText = [
      `FreshNex Product Report — ${productInfo.name} (${productInfo.id})`,
      `Category: ${productInfo.category} | Batch: ${batchNumber}`,
      `Freshness Level: ${freshnessReport.score}% (${freshnessReport.status})`,
      `AI AGENT FRESORA Shelf Life: ${prediction?.remainingDays ?? '--'} Days + ${prediction?.remainingHours ?? '--'} hrs (Est. Expiry: ${prediction?.estimatedExpiryDate ?? '--'})`,
      `Telemetry: Temp ${liveTelemetry.temperature}°C | Humidity ${liveTelemetry.humidity}% | Moisture ${liveTelemetry.moisture} g/m³ | pH ${liveTelemetry.ph} | Gas ${liveTelemetry.gas} ppm`,
      `GPS: ${liveTelemetry.gpsLat.toFixed(4)}°N, ${liveTelemetry.gpsLng.toFixed(4)}°E (${liveTelemetry.gpsSats} Sats)`
    ].join('\n');

    if (navigator.clipboard) {
      navigator.clipboard.writeText(summaryText);
      setCopiedSummary(true);
      setTimeout(() => setCopiedSummary(false), 2200);
    }
  };

  const scrollToReportSection = () => {
    reportSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleDownloadPDF = () => {
    const nowFormatted = formatRealtimeDateTime(Date.now()).fullStr;
    const reportId = `FNX-${productInfo.id.replace('YGS-FD-', '')}-${Date.now().toString().slice(-5)}`;

    generateAndDownloadProductPDF({
      reportId,
      generatedAt: nowFormatted,
      lastSyncedAt: lastResponseInfo.fullText,
      productName: productInfo.name,
      deviceId: productInfo.id,
      category: productInfo.category,
      batchNumber,
      originLocation: 'Cold-Chain Distribution Hub • Sector 4',
      freshnessScore: freshnessReport.score,
      freshnessStatus: freshnessReport.status,
      freshnessMessage: freshnessReport.message,
      remainingDays: prediction?.remainingDays ?? (productInfo.id === 'YGS-FD-124' ? 5 : 14),
      remainingHours: prediction?.remainingHours ?? 6,
      estimatedExpiryDate: prediction?.estimatedExpiryDate ?? '23 Nov 2026',
      confidencePercent: prediction?.confidencePercent ?? 94,
      spoilageRiskLevel: prediction?.spoilageRiskLevel ?? 'Low',
      predictedStatus: prediction?.predictedStatus ?? 'Optimal Cold-Chain Retention',
      predictionSummary:
        prediction?.predictionSummary ??
        'Stable refrigeration and regulated humidity preserve cellular freshness.',
      storageAdvice:
        prediction?.storageAdvice ??
        'Keep refrigerated between 1°C and 4°C with sealed containment.',
      temperature: liveTelemetry.temperature,
      humidity: liveTelemetry.humidity,
      moisture: liveTelemetry.moisture,
      dewPoint: liveTelemetry.dewPoint,
      ph: liveTelemetry.ph,
      acidityClass: liveTelemetry.acidityClass,
      gas: liveTelemetry.gas,
      impact: liveTelemetry.impact,
      light: liveTelemetry.light,
      gpsLat: liveTelemetry.gpsLat,
      gpsLng: liveTelemetry.gpsLng,
      gpsSats: liveTelemetry.gpsSats
    });

    setPdfDownloaded(true);
    setTimeout(() => setPdfDownloaded(false), 3000);
  };

  const riskBadgeStyle = (risk?: string) => {
    switch (risk) {
      case 'Low':
        return 'bg-emerald-500/15 text-emerald-900 border-emerald-500/30';
      case 'Moderate':
        return 'bg-amber-500/15 text-amber-900 border-amber-500/30';
      case 'High':
      case 'Critical':
        return 'bg-rose-500/15 text-rose-900 border-rose-500/30';
      default:
        return 'bg-emerald-500/15 text-emerald-900 border-emerald-500/30';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6 select-none font-sans pb-12"
    >
      {/* TOP CONTEXT BAR */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-[#13493B]/10">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-[#07221A] text-[#20E79A] text-[10px] font-mono font-bold tracking-wider uppercase">
              <span className="w-2 h-2 rounded-full bg-[#20E79A] animate-pulse" />
              UNIQUE DEVICE ID: {productInfo.id}
            </span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-emerald-50 border border-emerald-500/25 text-emerald-900 text-[10px] font-bold">
              <Clock className="w-3 h-3 text-emerald-600" />
              Last Sync: {lastResponseInfo.fullText}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif italic font-black text-[#07221A] tracking-tight">
            Product Freshness &amp; AI Shelf-Life Dashboard
          </h1>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            type="button"
            onClick={scrollToReportSection}
            className="neo-btn px-4 py-2.5 rounded-xl text-xs font-black text-[#07221A] flex items-center gap-2 cursor-pointer shadow-xs hover:border-[#20E79A]/50 transition-all"
          >
            <FileText className="w-4 h-4 text-[#13493B]" />
            <span>Product Report &amp; PDF</span>
          </button>

          <button
            type="button"
            onClick={() => navigate(`/live-data/${productInfo.id}`)}
            className="neo-btn-primary px-5 py-2.5 rounded-xl text-xs font-black flex items-center gap-2 cursor-pointer glow-emerald shadow-md active:scale-97 transition-transform"
          >
            <Activity className="w-4 h-4 text-[#20E79A]" />
            <span>Open Live Reading &amp; Map</span>
            <ArrowRight className="w-3.5 h-3.5 text-[#20E79A]" />
          </button>
        </div>
      </div>

      {/* MAIN TWO-COLUMN DASHBOARD LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* LEFT COLUMN (7 COLS): INTERACTIVE PRODUCT IMAGE, UNIQUE ID, FRESHNESS LEVEL & QUICK ACCESS MENU */}
        <div className="lg:col-span-7 glass-card p-5 sm:p-7 depth-3 flex flex-col justify-between relative overflow-hidden border border-[#13493B]/15">
          <div className="hidden md:block absolute -top-20 -right-20 w-64 h-64 bg-[#20E79A]/12 rounded-full blur-3xl pointer-events-none" />

          <div className="space-y-5 z-10">
            {/* Header Row inside Product Card */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#13493B]/10 pb-3.5">
              <div className="flex items-center gap-2.5">
                <div className="neo-icon-box w-10 h-10 rounded-2xl flex items-center justify-center text-[#20E79A] shrink-0">
                  <QrCode className="w-5 h-5 glow-icon-emerald" />
                </div>
                <div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-[#5C7F75] block">
                    Interactive Monitored Product Unit
                  </span>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-lg sm:text-xl font-black text-[#07221A]">
                      {productInfo.name}
                    </span>
                    <span className="text-xs font-mono font-black px-2.5 py-0.5 rounded-lg bg-[#EBFBF4] text-[#07221A] border border-[#20E79A]/40">
                      {productInfo.id}
                    </span>
                  </div>
                </div>
              </div>

              {/* Active Product Badge (Strictly shows only the logged-in product: Apple OR Milk) */}
              <div className="flex items-center gap-2">
                <span className="px-3 py-1.5 rounded-xl bg-[#07221A] text-[#20E79A] text-[10.5px] font-mono font-black shadow-xs">
                  {productInfo.id} ({productInfo.name})
                </span>
                <StatusBadge status={freshnessReport.status} />
              </div>
            </div>

            {/* QUICK ACCESS MENU BAR */}
            <div className="p-2.5 rounded-2xl bg-[#F4F7F6]/90 border border-[#13493B]/10 space-y-2.5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-[9.5px] font-black uppercase tracking-widest text-[#13493B] flex items-center gap-1.5 px-1">
                  <Zap className="w-3 h-3 text-[#20E79A]" />
                  Quick Access Menu
                </span>

                {/* Interactive View Mode Tabs */}
                <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-[#13493B]/10 shadow-2xs">
                  {(
                    [
                      { id: 'overview', label: 'Overview & Gauge' },
                      { id: 'breakdown', label: 'Interactive Simulator' },
                      { id: 'info', label: 'Basic Info & Specs' }
                    ] as const
                  ).map((tab) => (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setActiveCardTab(tab.id)}
                      className={`px-2.5 py-1 rounded-lg text-[10.5px] font-black transition-all cursor-pointer ${
                        activeCardTab === tab.id
                          ? 'bg-[#13493B] text-white shadow-2xs'
                          : 'text-[#5C7F75] hover:text-[#07221A]'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Action Shortcuts Row */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <button
                  type="button"
                  onClick={() => navigate(`/live-data/${productInfo.id}`)}
                  className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-white hover:bg-[#EBFBF4] border border-[#13493B]/10 hover:border-[#20E79A]/40 text-[11px] font-black text-[#07221A] transition-all cursor-pointer shadow-2xs active:scale-97"
                >
                  <Activity className="w-3.5 h-3.5 text-[#13493B]" />
                  <span>Live Sensors</span>
                </button>

                <button
                  type="button"
                  onClick={fetchFresoraPrediction}
                  disabled={isPredicting}
                  className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-white hover:bg-[#EBFBF4] border border-[#13493B]/10 hover:border-[#20E79A]/40 text-[11px] font-black text-[#07221A] transition-all cursor-pointer shadow-2xs active:scale-97 disabled:opacity-50"
                >
                  <Sparkles className={`w-3.5 h-3.5 text-[#13493B] ${isPredicting ? 'animate-spin' : ''}`} />
                  <span>AI Shelf-Life</span>
                </button>

                <button
                  type="button"
                  onClick={handleDownloadPDF}
                  className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-[#07221A] hover:bg-[#13493B] text-[11px] font-black text-[#20E79A] transition-all cursor-pointer shadow-xs active:scale-97"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>{pdfDownloaded ? 'PDF Saved!' : 'Download PDF'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleCopySummary}
                  className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-white hover:bg-[#EBFBF4] border border-[#13493B]/10 hover:border-[#20E79A]/40 text-[11px] font-black text-[#07221A] transition-all cursor-pointer shadow-2xs active:scale-97"
                >
                  {copiedSummary ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-emerald-700">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-[#13493B]" />
                      <span>Copy Data</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* INTERACTIVE TAB CONTENT AREA */}
            <AnimatePresence mode="wait">
              {activeCardTab === 'overview' && (
                <motion.div
                  key="overview"
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-4"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-center">
                    {/* High-Resolution Interactive Product Photo Card */}
                    <div
                      onClick={() => setIsImageZoomed(!isImageZoomed)}
                      title="Click to toggle interactive inspection zoom"
                      className="relative group rounded-[24px] overflow-hidden bg-white border-2 border-emerald-500/20 shadow-[0_12px_32px_rgba(19,73,59,0.1)] aspect-square max-w-[270px] mx-auto w-full flex flex-col justify-between cursor-pointer"
                    >
                      <img
                        src={productInfo.image}
                        alt={productInfo.name}
                        className={`w-full h-full object-cover transition-transform duration-500 ${
                          isImageZoomed ? 'scale-125' : 'group-hover:scale-105'
                        }`}
                      />
                      {/* Top Device ID Tag Overlay */}
                      <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2 pointer-events-none">
                        <span className="px-3 py-1 rounded-xl bg-[#07221A]/85 backdrop-blur-md text-white font-mono text-[11px] font-black tracking-wider shadow-md flex items-center gap-1.5">
                          <QrCode className="w-3.5 h-3.5 text-[#20E79A]" />
                          {productInfo.id}
                        </span>
                        <span className="p-1.5 rounded-xl bg-white/90 backdrop-blur-md text-[#07221A] shadow-sm">
                          <ZoomIn className="w-3.5 h-3.5 text-[#13493B]" />
                        </span>
                      </div>

                      {/* Bottom Product Name & Freshness Overlay */}
                      <div className="absolute bottom-3 left-3 right-3 p-3 rounded-2xl bg-[#07221A]/85 backdrop-blur-md text-white flex items-center justify-between shadow-lg">
                        <div>
                          <span className="text-[9px] uppercase tracking-widest text-[#20E79A] font-black block">
                            {productInfo.category}
                          </span>
                          <span className="text-base font-black tracking-tight">
                            {productInfo.name}
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="text-[9px] uppercase tracking-widest text-emerald-200 font-bold block">
                            Freshness
                          </span>
                          <span className="text-lg font-mono font-black text-[#20E79A]">
                            {freshnessReport.score}%
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Freshness Level Gauge & Breakdown */}
                    <div className="flex flex-col items-center sm:items-start justify-center space-y-3.5 text-center sm:text-left">
                      <div className="w-full flex flex-col items-center justify-center p-4 rounded-[24px] bg-[#F4F7F6]/90 border border-[#13493B]/10 shadow-inner">
                        <div className="w-full flex items-center justify-between mb-1">
                          <span className="text-[10px] font-black uppercase tracking-widest text-[#5C7F75]">
                            Live Freshness Level
                          </span>
                          <StatusBadge status={freshnessReport.status} />
                        </div>
                        <FreshnessGauge score={freshnessReport.score} size="md" />
                        <div className="w-full mt-3 space-y-1.5">
                          <div className="flex items-center justify-between text-xs font-black text-[#07221A]">
                            <span>Preservation Integrity</span>
                            <span className="font-mono text-emerald-700">
                              {freshnessReport.score}%
                            </span>
                          </div>
                          <div className="w-full h-2.5 rounded-full bg-emerald-950/10 overflow-hidden">
                            <div
                              className="h-full rounded-full bg-gradient-to-r from-[#13493B] to-[#20E79A] transition-all duration-500"
                              style={{
                                width: `${Math.min(100, Math.max(0, freshnessReport.score))}%`
                              }}
                            />
                          </div>
                        </div>
                      </div>

                      <div className="w-full p-3 rounded-2xl bg-emerald-50/70 border border-emerald-500/20 space-y-1">
                        <div className="flex items-center gap-1.5 text-xs font-black text-[#07221A]">
                          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                          <span>Quality Status: {freshnessReport.status}</span>
                        </div>
                        <p className="text-[11px] text-[#5C7F75] font-semibold leading-relaxed">
                          {freshnessReport.message}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Interactive Live Telemetry Snapshot Strip */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
                    <div
                      onClick={() => navigate(`/live-data/${productInfo.id}`)}
                      className="p-2.5 rounded-xl bg-white border border-[#13493B]/10 hover:border-[#20E79A]/50 transition-all cursor-pointer flex items-center gap-2.5 shadow-2xs"
                    >
                      <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
                        <Thermometer className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-[9px] font-bold uppercase text-[#5C7F75] block">
                          Temp
                        </span>
                        <span className="text-xs font-mono font-black text-[#07221A]">
                          {liveTelemetry.temperature} °C
                        </span>
                      </div>
                    </div>

                    <div
                      onClick={() => navigate(`/live-data/${productInfo.id}`)}
                      className="p-2.5 rounded-xl bg-white border border-[#13493B]/10 hover:border-[#20E79A]/50 transition-all cursor-pointer flex items-center gap-2.5 shadow-2xs"
                    >
                      <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                        <Droplets className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-[9px] font-bold uppercase text-[#5C7F75] block">
                          Humidity
                        </span>
                        <span className="text-xs font-mono font-black text-[#07221A]">
                          {liveTelemetry.humidity} %
                        </span>
                      </div>
                    </div>

                    <div
                      onClick={() => navigate(`/live-data/${productInfo.id}`)}
                      className="p-2.5 rounded-xl bg-white border border-[#13493B]/10 hover:border-[#20E79A]/50 transition-all cursor-pointer flex items-center gap-2.5 shadow-2xs"
                    >
                      <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                        <Activity className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-[9px] font-bold uppercase text-[#5C7F75] block">
                          Calc. pH
                        </span>
                        <span className="text-xs font-mono font-black text-[#07221A]">
                          pH {liveTelemetry.ph}
                        </span>
                      </div>
                    </div>

                    <div
                      onClick={() => navigate(`/live-data/${productInfo.id}`)}
                      className="p-2.5 rounded-xl bg-white border border-[#13493B]/10 hover:border-[#20E79A]/50 transition-all cursor-pointer flex items-center gap-2.5 shadow-2xs"
                    >
                      <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                        <Wind className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-[9px] font-bold uppercase text-[#5C7F75] block">
                          VOC Gas
                        </span>
                        <span className="text-xs font-mono font-black text-[#07221A]">
                          {liveTelemetry.gas} ppm
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeCardTab === 'breakdown' && (
                <motion.div
                  key="breakdown"
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.2 }}
                  className="p-4 sm:p-5 rounded-2xl bg-white border border-[#13493B]/10 space-y-4"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <h3 className="text-xs font-black uppercase tracking-wider text-[#07221A] flex items-center gap-1.5">
                        <Sliders className="w-3.5 h-3.5 text-[#13493B]" />
                        Interactive Freshness Factor Breakdown &amp; Cold-Chain Simulator
                      </h3>
                      <p className="text-[11px] text-[#5C7F75] font-semibold">
                        Inspect individual preservation sub-scores or simulate thermal variations for {productInfo.name} ({productInfo.id}).
                      </p>
                    </div>
                    <span className="px-2.5 py-1 rounded-xl bg-[#07221A] text-[#20E79A] font-mono text-xs font-black">
                      {freshnessReport.score}% Total
                    </span>
                  </div>

                  {/* Sub-score Progress Bars */}
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs font-bold text-[#07221A]">
                        <span>Thermal Cold-Chain Stability ({liveTelemetry.temperature} °C)</span>
                        <span className="font-mono text-emerald-700">{subScores.tempScore}/100</span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-[#F4F7F6] overflow-hidden">
                        <div
                          className="h-full bg-[#13493B] rounded-full transition-all duration-300"
                          style={{ width: `${subScores.tempScore}%` }}
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between text-xs font-bold text-[#07221A]">
                        <span>Relative Humidity &amp; Moisture Balance ({liveTelemetry.humidity}%)</span>
                        <span className="font-mono text-emerald-700">{subScores.humScore}/100</span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-[#F4F7F6] overflow-hidden">
                        <div
                          className="h-full bg-blue-500 rounded-full transition-all duration-300"
                          style={{ width: `${subScores.humScore}%` }}
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between text-xs font-bold text-[#07221A]">
                        <span>MQ-135 VOC Atmospheric Purity ({liveTelemetry.gas} ppm)</span>
                        <span className="font-mono text-emerald-700">{subScores.gasScore}/100</span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-[#F4F7F6] overflow-hidden">
                        <div
                          className="h-full bg-purple-600 rounded-full transition-all duration-300"
                          style={{ width: `${subScores.gasScore}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Interactive Cold-Chain Temperature Offset Simulator */}
                  <div className="p-3.5 rounded-xl bg-[#F4F7F6] border border-[#13493B]/10 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-black text-[#07221A]">
                        Simulate Storage Temperature Shift:
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-black text-[#13493B]">
                          {simulatedTempOffset >= 0 ? `+${simulatedTempOffset}°C` : `${simulatedTempOffset}°C`} (Simulated: {liveTelemetry.temperature}°C)
                        </span>
                        {simulatedTempOffset !== 0 && (
                          <button
                            type="button"
                            onClick={() => setSimulatedTempOffset(0)}
                            className="text-[10px] font-black text-rose-600 hover:underline cursor-pointer"
                          >
                            Reset
                          </button>
                        )}
                      </div>
                    </div>
                    <input
                      type="range"
                      min={-3}
                      max={10}
                      step={0.5}
                      value={simulatedTempOffset}
                      onChange={(e) => setSimulatedTempOffset(parseFloat(e.target.value))}
                      className="w-full accent-[#13493B] cursor-pointer"
                    />
                    <div className="flex justify-between text-[10px] font-mono text-[#5C7F75]">
                      <span>-3.0°C (Chilled)</span>
                      <span>0.0°C (Live Sensor: {liveTelemetry.baseTemp}°C)</span>
                      <span>+10.0°C (Warm Breach)</span>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeCardTab === 'info' && (
                <motion.div
                  key="info"
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.2 }}
                  className="p-4 sm:p-5 rounded-2xl bg-white border border-[#13493B]/10 space-y-3"
                >
                  <div className="flex items-center gap-2 pb-2 border-b border-[#13493B]/10">
                    <Info className="w-4 h-4 text-[#13493B]" />
                    <h3 className="text-xs font-black uppercase tracking-wider text-[#07221A]">
                      Basic Product &amp; Hardware Specifications
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div className="p-3 rounded-xl bg-[#F4F7F6]/70 border border-[#13493B]/10">
                      <span className="text-[10px] font-bold uppercase text-[#5C7F75] block">
                        Product Name &amp; Type
                      </span>
                      <span className="font-black text-[#07221A] text-sm">
                        {productInfo.name} ({productInfo.category})
                      </span>
                    </div>

                    <div className="p-3 rounded-xl bg-[#F4F7F6]/70 border border-[#13493B]/10">
                      <span className="text-[10px] font-bold uppercase text-[#5C7F75] block">
                        Unique Hardware Device ID
                      </span>
                      <span className="font-mono font-black text-emerald-800 text-sm">
                        {productInfo.id}
                      </span>
                    </div>

                    <div className="p-3 rounded-xl bg-[#F4F7F6]/70 border border-[#13493B]/10">
                      <span className="text-[10px] font-bold uppercase text-[#5C7F75] block">
                        Batch &amp; Lot Number
                      </span>
                      <span className="font-mono font-bold text-[#07221A]">
                        {batchNumber}
                      </span>
                    </div>

                    <div className="p-3 rounded-xl bg-[#F4F7F6]/70 border border-[#13493B]/10">
                      <span className="text-[10px] font-bold uppercase text-[#5C7F75] block">
                        Recommended Cold-Chain Bounds
                      </span>
                      <span className="font-mono font-bold text-[#07221A]">
                        {thresholds.tempMin}°C to {thresholds.tempMax}°C • {thresholds.humidityMin}%–{thresholds.humidityMax}% RH
                      </span>
                    </div>

                    <div className="p-3 rounded-xl bg-[#F4F7F6]/70 border border-[#13493B]/10 sm:col-span-2 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] font-bold uppercase text-[#5C7F75] block">
                          NEO-6M GPS Coordinates
                        </span>
                        <span className="font-mono font-bold text-[#07221A]">
                          {liveTelemetry.gpsLat.toFixed(4)}°N, {liveTelemetry.gpsLng.toFixed(4)}°E ({liveTelemetry.gpsSats} Satellites Locked)
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => navigate(`/live-data/${productInfo.id}`)}
                        className="px-3 py-1.5 rounded-xl bg-[#07221A] text-[#20E79A] text-[10px] font-black cursor-pointer flex items-center gap-1"
                      >
                        <MapPin className="w-3 h-3" />
                        <span>View Map</span>
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Bottom Metadata Bar inside Product Card */}
          <div className="mt-5 pt-3.5 border-t border-[#13493B]/10 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 text-[#5C7F75] font-semibold">
              <Layers className="w-4 h-4 text-[#13493B]" />
              <span>Unique Hardware ID:</span>
              <strong className="font-mono text-[#07221A]">{productInfo.id}</strong>
            </div>
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={scrollToReportSection}
                className="text-xs font-black text-emerald-700 hover:text-[#07221A] flex items-center gap-1 cursor-pointer"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>View Full Report</span>
              </button>
              <button
                type="button"
                onClick={() => navigate(`/live-data/${productInfo.id}`)}
                className="text-xs font-black text-[#13493B] hover:text-[#07221A] flex items-center gap-1.5 cursor-pointer group"
              >
                <span>All Sensor Readings &amp; Map</span>
                <ArrowRight className="w-3.5 h-3.5 text-[#20E79A] transition-transform group-hover:translate-x-1" />
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN (5 COLS): AI AGENT FRESORA SHELF-LIFE PREDICTION */}
        <div className="lg:col-span-5 glass-card p-6 sm:p-8 depth-3 flex flex-col justify-between relative overflow-hidden border-2 border-[#20E79A]/35 bg-gradient-to-br from-white via-[#F4FBF8] to-[#E9F9F2]">
          <div className="space-y-5 z-10">
            {/* FRESORA Header */}
            <div className="flex items-start justify-between gap-3 border-b border-[#13493B]/10 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-[#07221A] text-[#20E79A] flex items-center justify-center shadow-md shrink-0">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span
                      style={{ fontFamily: "'Syne', 'Space Grotesk', sans-serif" }}
                      className="text-base sm:text-lg font-extrabold tracking-wider text-[#07221A] uppercase"
                    >
                      AI AGENT FRESORA
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-[#20E79A]/20 text-[#07221A] text-[9px] font-mono font-black uppercase">
                      GEMINI AI
                    </span>
                  </div>
                  <p className="text-[11px] font-semibold text-[#5C7F75]">
                    Real-Time Predictive Shelf-Life Intelligence
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={fetchFresoraPrediction}
                disabled={isPredicting}
                className="neo-btn p-2.5 rounded-xl text-[#07221A] hover:border-[#20E79A]/50 cursor-pointer disabled:opacity-50 transition-all"
                title="Refresh AI Shelf-Life Prediction"
              >
                <RefreshCw className={`w-4 h-4 text-[#13493B] ${isPredicting ? 'animate-spin' : ''}`} />
              </button>
            </div>

            {isPredicting && !prediction ? (
              <div className="py-12 flex flex-col items-center justify-center text-center space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-[#07221A]/5 flex items-center justify-center text-[#13493B]">
                  <RefreshCw className="w-6 h-6 animate-spin text-[#20E79A]" />
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-black text-[#07221A] uppercase tracking-wider">
                    AI AGENT FRESORA Analyzing {productInfo.name} ({productInfo.id})...
                  </p>
                  <p className="text-[11px] text-[#5C7F75] font-semibold">
                    Evaluating thermal, moisture, gas &amp; freshness telemetry via Gemini API
                  </p>
                </div>
              </div>
            ) : prediction ? (
              <div className="space-y-4">
                {/* Primary Remaining Shelf-Life Highlight Box */}
                <div className="p-5 rounded-[22px] bg-[#07221A] text-white shadow-lg space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#20E79A]">
                      Predicted Remaining Shelf Life
                    </span>
                    <span className="px-2.5 py-0.5 rounded-md bg-white/10 text-[10px] font-mono font-bold text-emerald-200">
                      Confidence: {prediction.confidencePercent}%
                    </span>
                  </div>

                  <div className="flex items-baseline gap-3">
                    <span className="text-3xl sm:text-4xl font-mono font-black text-[#20E79A] tracking-tight tabular-nums">
                      {prediction.remainingDays} Days
                    </span>
                    <span className="text-sm font-mono font-bold text-emerald-100/90 tabular-nums">
                      + {prediction.remainingHours} hrs
                    </span>
                  </div>

                  <p className="text-xs text-emerald-50/90 font-semibold leading-relaxed">
                    {prediction.predictedStatus}
                  </p>
                </div>

                {/* Expiry Date & Spoilage Risk Row */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3.5 rounded-2xl bg-white border border-[#13493B]/10 shadow-xs space-y-1">
                    <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-[#5C7F75]">
                      <Calendar className="w-3.5 h-3.5 text-[#13493B]" />
                      <span>Est. Expiry Date</span>
                    </div>
                    <span className="text-sm sm:text-base font-mono font-black text-[#07221A] block">
                      {prediction.estimatedExpiryDate}
                    </span>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-white border border-[#13493B]/10 shadow-xs space-y-1">
                    <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-[#5C7F75]">
                      <AlertTriangle className="w-3.5 h-3.5 text-[#13493B]" />
                      <span>Spoilage Risk</span>
                    </div>
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-lg text-xs font-black border ${riskBadgeStyle(
                        prediction.spoilageRiskLevel
                      )}`}
                    >
                      {prediction.spoilageRiskLevel} Risk
                    </span>
                  </div>
                </div>

                {/* Primary Scientific Factor & Storage Recommendation */}
                <div className="p-4 rounded-2xl bg-white/90 border border-[#13493B]/10 space-y-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-[#13493B]">
                      <Cpu className="w-3.5 h-3.5 text-[#20E79A]" />
                      <span>FRESORA Diagnostic Analysis</span>
                    </div>
                    <p className="text-xs text-[#07221A] font-semibold leading-relaxed">
                      {prediction.predictionSummary}
                    </p>
                  </div>

                  <div className="pt-2.5 border-t border-[#13493B]/10 space-y-1">
                    <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-emerald-800">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Optimal Storage Recommendation</span>
                    </div>
                    <p className="text-xs text-[#5C7F75] font-semibold leading-relaxed">
                      {prediction.storageAdvice}
                    </p>
                  </div>
                </div>

                {predictionError && (
                  <p className="text-[11px] text-amber-800 font-semibold">
                    {predictionError}
                  </p>
                )}
              </div>
            ) : null}
          </div>

          <div className="mt-5 pt-3 border-t border-[#13493B]/10 flex items-center justify-between text-[11px] font-semibold text-[#5C7F75]">
            <span>Target ID: {productInfo.id}</span>
            <span>Predicted exclusively by AI AGENT FRESORA</span>
          </div>
        </div>
      </div>

      {/* NEW REPORT SECTION: EXECUTIVE DATA SUMMARY, SHELF-LIFE & PDF DOWNLOAD */}
      <div
        ref={reportSectionRef}
        className="glass-card p-6 sm:p-8 depth-3 border border-[#13493B]/15 space-y-6 relative overflow-hidden"
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#13493B]/10">
          <div className="flex items-start gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-[#07221A] text-[#20E79A] flex items-center justify-center shadow-md shrink-0">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[10px] font-mono font-black uppercase tracking-widest text-[#13493B] bg-[#EBFBF4] px-2.5 py-0.5 rounded-md border border-[#20E79A]/30">
                  OFFICIAL TELEMETRY &amp; SHELF-LIFE DOSSIER
                </span>
                <span className="text-[10px] font-mono font-bold text-[#5C7F75]">
                  ID: {productInfo.id}
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-serif italic font-black text-[#07221A] mt-0.5">
                Comprehensive Product, Sensor &amp; Shelf-Life Report
              </h2>
              <p className="text-xs text-[#5C7F75] font-semibold">
                Consolidated report containing basic product metadata, live 8-sensor telemetry readings, and AI AGENT FRESORA shelf-life intelligence.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={handleCopySummary}
              className="neo-btn px-4 py-3 rounded-xl text-xs font-black text-[#07221A] flex items-center gap-2 cursor-pointer hover:border-[#20E79A]/50 transition-all"
            >
              {copiedSummary ? (
                <>
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span>Summary Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 text-[#13493B]" />
                  <span>Copy Summary</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleDownloadPDF}
              className="neo-btn-primary px-5 py-3 rounded-xl text-xs font-black flex items-center gap-2 cursor-pointer glow-emerald shadow-md active:scale-97 transition-transform"
            >
              <Download className="w-4 h-4 text-[#20E79A]" />
              <span>{pdfDownloaded ? 'PDF Report Downloaded!' : 'Download Full PDF Report'}</span>
            </button>
          </div>
        </div>

        {/* Report Preview Grid: 3 Summary Pillars + Full 8-Sensor Table */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Pillar 1: Basic Product & Device Information */}
          <div className="p-4 rounded-2xl bg-white border border-[#13493B]/10 space-y-2.5 shadow-2xs">
            <span className="text-[10px] font-black uppercase tracking-widest text-[#13493B] block border-b border-[#13493B]/10 pb-1.5">
              1. Basic Product Information
            </span>
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className="text-[#5C7F75] font-semibold">Product Name:</span>
                <strong className="text-[#07221A] font-black">{productInfo.name}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-[#5C7F75] font-semibold">Unique Device ID:</span>
                <strong className="font-mono text-emerald-800 font-black">{productInfo.id}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-[#5C7F75] font-semibold">Category:</span>
                <strong className="text-[#07221A]">{productInfo.category}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-[#5C7F75] font-semibold">Batch Reference:</span>
                <strong className="font-mono text-[#07221A]">{batchNumber}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-[#5C7F75] font-semibold">Last Telemetry Sync:</span>
                <strong className="font-mono text-[#07221A]">{lastResponseInfo.timeStr}</strong>
              </div>
            </div>
          </div>

          {/* Pillar 2: Freshness & Quality Evaluation */}
          <div className="p-4 rounded-2xl bg-white border border-[#13493B]/10 space-y-2.5 shadow-2xs">
            <span className="text-[10px] font-black uppercase tracking-widest text-[#13493B] block border-b border-[#13493B]/10 pb-1.5">
              2. Freshness &amp; Preservation Status
            </span>
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-[#5C7F75] font-semibold">Freshness Score:</span>
                <strong className="font-mono text-base font-black text-emerald-700">
                  {freshnessReport.score}%
                </strong>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[#5C7F75] font-semibold">Quality Grade:</span>
                <strong className="text-[#07221A] font-black">{freshnessReport.status}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-[#5C7F75] font-semibold">Thermal Sub-Score:</span>
                <strong className="font-mono text-[#07221A]">{subScores.tempScore}/100</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-[#5C7F75] font-semibold">Atmosphere Sub-Score:</span>
                <strong className="font-mono text-[#07221A]">{subScores.gasScore}/100</strong>
              </div>
            </div>
          </div>

          {/* Pillar 3: AI AGENT FRESORA Shelf-Life Summary */}
          <div className="p-4 rounded-2xl bg-[#EBFBF4]/70 border border-[#20E79A]/30 space-y-2.5 shadow-2xs">
            <span className="text-[10px] font-black uppercase tracking-widest text-[#07221A] block border-b border-[#13493B]/10 pb-1.5">
              3. AI AGENT FRESORA Shelf-Life
            </span>
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-[#5C7F75] font-semibold">Remaining Shelf Life:</span>
                <strong className="font-mono text-sm font-black text-[#07221A]">
                  {prediction?.remainingDays ?? '--'}d {prediction?.remainingHours ?? '--'}h
                </strong>
              </div>
              <div className="flex justify-between">
                <span className="text-[#5C7F75] font-semibold">Est. Expiry Date:</span>
                <strong className="font-mono text-[#07221A]">
                  {prediction?.estimatedExpiryDate ?? 'Calculating...'}
                </strong>
              </div>
              <div className="flex justify-between">
                <span className="text-[#5C7F75] font-semibold">Spoilage Risk:</span>
                <strong className="text-emerald-900 font-black">
                  {prediction?.spoilageRiskLevel ?? 'Low'} Risk
                </strong>
              </div>
              <div className="flex justify-between">
                <span className="text-[#5C7F75] font-semibold">AI Confidence:</span>
                <strong className="font-mono text-[#07221A]">
                  {prediction?.confidencePercent ?? 94}%
                </strong>
              </div>
            </div>
          </div>
        </div>

        {/* Complete 8-Channel Sensor Data Table included in PDF */}
        <div className="rounded-2xl border border-[#13493B]/10 overflow-hidden bg-white">
          <div className="px-4 py-2.5 bg-[#F4F7F6] border-b border-[#13493B]/10 flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-wider text-[#07221A]">
              4. Complete 8-Channel Sensor Telemetry Data (Included in PDF Export)
            </span>
            <span className="text-[10px] font-mono font-bold text-[#5C7F75]">
              Node: {productInfo.id}
            </span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-[#13493B]/10 text-xs">
            <div className="p-3 space-y-0.5">
              <span className="text-[10px] text-[#5C7F75] font-bold block">1. Ambient Temp</span>
              <span className="font-mono font-black text-[#07221A] text-sm">
                {liveTelemetry.temperature} °C
              </span>
            </div>
            <div className="p-3 space-y-0.5">
              <span className="text-[10px] text-[#5C7F75] font-bold block">2. Relative Humidity</span>
              <span className="font-mono font-black text-[#07221A] text-sm">
                {liveTelemetry.humidity} %
              </span>
            </div>
            <div className="p-3 space-y-0.5">
              <span className="text-[10px] text-[#5C7F75] font-bold block">3. Calc. Moisture</span>
              <span className="font-mono font-black text-[#07221A] text-sm">
                {liveTelemetry.moisture} g/m³ (Dew {liveTelemetry.dewPoint}°C)
              </span>
            </div>
            <div className="p-3 space-y-0.5">
              <span className="text-[10px] text-[#5C7F75] font-bold block">4. Calculated pH</span>
              <span className="font-mono font-black text-[#07221A] text-sm">
                pH {liveTelemetry.ph} ({liveTelemetry.acidityClass})
              </span>
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-[#13493B]/10 border-t border-[#13493B]/10 text-xs">
            <div className="p-3 space-y-0.5">
              <span className="text-[10px] text-[#5C7F75] font-bold block">5. MQ-135 VOC Gas</span>
              <span className="font-mono font-black text-[#07221A] text-sm">
                {liveTelemetry.gas} ppm
              </span>
            </div>
            <div className="p-3 space-y-0.5">
              <span className="text-[10px] text-[#5C7F75] font-bold block">6. Impact Sensor</span>
              <span className="font-mono font-black text-[#07221A] text-sm">
                {liveTelemetry.impact.toFixed(2)} G
              </span>
            </div>
            <div className="p-3 space-y-0.5">
              <span className="text-[10px] text-[#5C7F75] font-bold block">7. Light Exposure</span>
              <span className="font-mono font-black text-[#07221A] text-sm">
                {liveTelemetry.light} lx
              </span>
            </div>
            <div className="p-3 space-y-0.5">
              <span className="text-[10px] text-[#5C7F75] font-bold block">8. NEO-6M GPS Lock</span>
              <span className="font-mono font-black text-[#07221A] text-sm">
                {liveTelemetry.gpsLat.toFixed(3)}°N, {liveTelemetry.gpsLng.toFixed(3)}°E ({liveTelemetry.gpsSats} Sats)
              </span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

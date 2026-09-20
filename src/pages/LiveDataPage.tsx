import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Thermometer, 
  Droplets, 
  Wind, 
  Calendar, 
  RotateCcw, 
  Download, 
  Activity,
  ArrowLeft,
  Share2,
  CheckCircle2,
  Sparkles,
  AlertTriangle,
  Sliders,
  Bell
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
import { useFreshness } from '../context/FreshnessContext';
import { StatusBadge } from '../components/common/StatusBadge';
import { FreshnessGauge } from '../components/common/FreshnessGauge';
import { SensorCard } from '../components/common/SensorCard';
import { ThresholdConfigModal } from '../components/common/ThresholdConfigModal';
import { HistoricalReadingPoint } from '../types';

export const LiveDataPage: React.FC = () => {
  const { itemId } = useParams<{ itemId: string }>();
  const navigate = useNavigate();
  const { 
    activeItem, 
    sensorData, 
    freshnessReport, 
    scanItem, 
    isScanning,
    thresholds,
    updateThresholds,
    alerts
  } = useFreshness();

  const [activeMetricTab, setActiveMetricTab] = useState<'temp' | 'humidity' | 'gas'>('temp');
  const [copiedLink, setCopiedLink] = useState(false);
  const [isConfigOpen, setIsConfigOpen] = useState(false);

  // If page is loaded directly by URL e.g. /live-data/FRX1004, ensure item is scanned/loaded
  useEffect(() => {
    const targetId = itemId || 'FRX1004';
    if (!activeItem || activeItem.id.toLowerCase() !== targetId.toLowerCase()) {
      scanItem(targetId).catch(() => {});
    }
  }, [itemId]);

  // Check if current sensor readings exceed thresholds
  const isTempBreached = sensorData && sensorData.temperature > thresholds.tempMax;
  const isGasBreached = sensorData && sensorData.gas > thresholds.gasWarning;
  const isHumidityBreached = sensorData && (sensorData.humidity > thresholds.humidityMax || sensorData.humidity < thresholds.humidityMin);
  const hasActiveBreach = isTempBreached || isGasBreached || isHumidityBreached;

  // Generate smooth historical curve for the selected metric
  const chartData: HistoricalReadingPoint[] = [
    { time: '09:00', timestamp: 1, temperature: 4.0, humidity: 60, gas: 112 },
    { time: '09:30', timestamp: 2, temperature: 4.1, humidity: 61, gas: 115 },
    { time: '10:00', timestamp: 3, temperature: 4.3, humidity: 63, gas: 118 },
    { time: '10:15', timestamp: 4, temperature: 4.2, humidity: 62, gas: 119 },
    { time: '10:30', timestamp: 5, temperature: 4.1, humidity: 61, gas: 120 },
    { time: '10:45', timestamp: 6, temperature: sensorData ? sensorData.temperature : 4.2, humidity: sensorData ? sensorData.humidity : 62, gas: sensorData ? sensorData.gas : 120 },
  ];

  const handleExportData = () => {
    if (!activeItem) return;
    const payload = {
      product: activeItem.name,
      tagId: activeItem.tagId,
      timestamp: new Date().toISOString(),
      temperature: sensorData?.temperature,
      humidity: sensorData?.humidity,
      gas: sensorData?.gas,
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

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  const currentProduct = activeItem || {
    id: 'FRX1004',
    name: 'Tomato',
    tagId: '#FRX1004',
    image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&auto=format&fit=crop&q=80',
    category: 'Vegetable',
    batchId: 'BATCH-001',
  };

  const metricConfig = {
    temp: { name: 'Temperature', unit: '°C', color: '#FF5A67' },
    humidity: { name: 'Humidity', unit: '%', color: '#FFAA00' },
    gas: { name: 'Gas Level (VOC)', unit: 'ppm', color: '#FF6A00' },
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-6 select-none pb-12"
    >
      {/* Top back navigation & quick actions */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <motion.button
          whileHover={{ x: -4 }}
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-2 text-xs font-bold text-[#B8A89E] hover:text-[#FFAA00] transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Dashboard</span>
        </motion.button>

        <div className="flex items-center gap-2">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsConfigOpen(true)}
            className="px-3.5 py-1.5 rounded-xl bg-[#1E140E] hover:bg-[#261A12] border border-[#FF6A00]/40 text-xs font-bold text-[#FFAA00] hover:text-[#FDF8F5] transition-all flex items-center gap-1.5 cursor-pointer shadow-md"
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Threshold Rules</span>
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleShare}
            className="px-3.5 py-1.5 rounded-xl bg-[#1E140E] hover:bg-[#261A12] border border-[#3D261A] hover:border-[#FFAA00]/40 text-xs font-bold text-[#B8A89E] hover:text-[#FDF8F5] transition-all flex items-center gap-1.5 cursor-pointer shadow-md"
          >
            {copiedLink ? <CheckCircle2 className="w-3.5 h-3.5 text-[#20E79A]" /> : <Share2 className="w-3.5 h-3.5" />}
            <span>{copiedLink ? 'Link Copied!' : 'Share'}</span>
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleExportData}
            className="px-3.5 py-1.5 rounded-xl bg-[#1E140E] hover:bg-[#261A12] border border-[#3D261A] hover:border-[#FFAA00]/40 text-xs font-bold text-[#B8A89E] hover:text-[#FDF8F5] transition-all flex items-center gap-1.5 cursor-pointer shadow-md"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export JSON</span>
          </motion.button>
        </div>
      </div>

      {/* Threshold Active Breach Banner */}
      <AnimatePresence>
        {hasActiveBreach && (
          <motion.div
            initial={{ opacity: 0, height: 0, y: -10 }}
            animate={{ opacity: 1, height: 'auto', y: 0 }}
            exit={{ opacity: 0, height: 0, y: -10 }}
            className="p-4 rounded-2xl bg-gradient-to-r from-[#2B0E0A] to-[#1F0C06] border border-[#FF3D00]/50 text-[#FDF8F5] shadow-xl flex items-center justify-between gap-4"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#FF3D00]/25 text-[#FF3D00] flex items-center justify-center shrink-0 border border-[#FF3D00]/40 animate-pulse">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-black uppercase tracking-wider text-[#FF5A67]">
                  Sensor Threshold Exceeded
                </h4>
                <p className="text-xs text-[#E0D0C8] mt-0.5">
                  {isTempBreached && `Temperature is elevated at ${sensorData?.temperature}°C (Limit: ${thresholds.tempMax}°C). `}
                  {isGasBreached && `Gas levels spiking at ${sensorData?.gas} ppm (Limit: ${thresholds.gasWarning} ppm). `}
                  {isHumidityBreached && `Humidity out of safe bounds (${sensorData?.humidity}%). `}
                  Real-time alert synced to Firebase.
                </p>
              </div>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/alerts')}
              className="px-3.5 py-1.5 rounded-xl bg-[#FF6A00] hover:bg-[#FFAA00] text-xs font-bold text-[#140C08] cursor-pointer shrink-0 transition-colors shadow-sm flex items-center gap-1.5"
            >
              <Bell className="w-3.5 h-3.5" />
              <span>View Alerts</span>
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* PRODUCT INFORMATION CARD */}
      <div className="card-solid p-6 sm:p-8 relative overflow-hidden shadow-2xl border border-[#FF6A00]/30">
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#FFAA00]/60 to-transparent" />

        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Left: Product Media & Meta */}
          <div className="flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left">
            <motion.div 
              whileHover={{ scale: 1.05, rotate: 1 }}
              className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-2xl overflow-hidden border-2 border-[#FF6A00]/30 bg-[#0D0A08] shrink-0 shadow-2xl"
            >
              <img
                src={currentProduct.image}
                alt={currentProduct.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-2 left-2">
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-[#140C08]/90 text-[#FFAA00] border border-[#FF6A00]/40">
                  {currentProduct.tagId}
                </span>
              </div>
            </motion.div>

            <div className="space-y-2">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5">
                <h1 className="text-2xl sm:text-3xl font-black text-[#FDF8F5] tracking-tight">
                  {currentProduct.name}
                </h1>
                <StatusBadge status={freshnessReport?.status || 'Fresh'} size="md" />
              </div>

              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 text-xs text-[#B8A89E]">
                <div className="flex items-center gap-1.5">
                  <span className="text-[#8C7A70]">Tag ID:</span>
                  <span className="font-mono font-bold text-[#FFAA00]">{currentProduct.tagId}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-[#8C7A70]" />
                  <span>20 Sep 2026, 10:45 AM</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#20E79A] animate-ping" />
                  <span className="text-[#20E79A] font-bold">Node Streaming</span>
                </div>
              </div>

              <p className="text-xs text-[#8C7A70] max-w-md pt-1 leading-relaxed">
                {freshnessReport?.message || 'Storage environment within optimal quality boundaries. Low deterioration risk.'}
              </p>
            </div>
          </div>

          {/* Right: Freshness Score Circular Gauge */}
          <div className="shrink-0 p-4 rounded-2xl bg-[#1E140E] border border-[#FF6A00]/25 flex items-center justify-center shadow-xl">
            <FreshnessGauge
              score={freshnessReport?.score ?? 92}
              qualityLabel={freshnessReport?.qualityLabel ?? 'Excellent'}
              size={140}
            />
          </div>
        </div>
      </div>

      {/* 3 SENSOR METRIC CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <SensorCard
          title="Temperature"
          value={sensorData ? `${sensorData.temperature}` : '4.2'}
          unit="°C"
          status={freshnessReport?.tempStatus || 'Normal'}
          icon={<Thermometer className="w-5 h-5" />}
          iconBgColor="bg-[#FF5A67]/15"
          iconColor="text-[#FF5A67]"
        />

        <SensorCard
          title="Humidity"
          value={sensorData ? `${sensorData.humidity}` : '62'}
          unit="%"
          status={freshnessReport?.humidityStatus || 'Normal'}
          icon={<Droplets className="w-5 h-5" />}
          iconBgColor="bg-[#FFAA00]/15"
          iconColor="text-[#FFAA00]"
        />

        <SensorCard
          title="Gas Level (VOC)"
          value={sensorData ? `${sensorData.gas}` : '120'}
          unit="ppm"
          status={freshnessReport?.gasStatus || 'Normal'}
          icon={<Wind className="w-5 h-5" />}
          iconBgColor="bg-[#FF6A00]/15"
          iconColor="text-[#FF6A00]"
        />
      </div>

      {/* SENSOR READINGS OVER TIME */}
      <div className="card-solid p-6 space-y-6 shadow-2xl border border-[#FF6A00]/25">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-bold text-[#FDF8F5] flex items-center gap-2">
              <Activity className="w-4 h-4 text-[#FFAA00]" />
              <span>Sensor Readings Over Time</span>
            </h3>
            <p className="text-xs text-[#8C7A70]">
              Continuous telemetric records sampled at 15-minute intervals.
            </p>
          </div>

          {/* Metric Selector Tabs with Motion layoutId */}
          <div className="inline-flex p-1 rounded-xl bg-[#1E140E] border border-[#3D261A]">
            {(['temp', 'humidity', 'gas'] as const).map((tab) => {
              const active = activeMetricTab === tab;
              return (
                <button
                  key={tab}
                  onClick={() => setActiveMetricTab(tab)}
                  className="relative px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer"
                >
                  {active && (
                    <motion.div
                      layoutId="metricTabActive"
                      className="absolute inset-0 bg-[#FF6A00]/20 rounded-lg border border-[#FF6A00]/40 shadow-sm"
                      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                    />
                  )}
                  <span className={`relative z-10 ${active ? 'text-[#FFAA00]' : 'text-[#B8A89E] hover:text-[#FDF8F5]'}`}>
                    {tab === 'temp' ? 'Temperature (°C)' : tab === 'humidity' ? 'Humidity (%)' : 'Gas Level (ppm)'}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Recharts Chart Area */}
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="chartGradientLive" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor={metricConfig[activeMetricTab].color}
                    stopOpacity={0.4}
                  />
                  <stop
                    offset="95%"
                    stopColor={metricConfig[activeMetricTab].color}
                    stopOpacity={0}
                  />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#3D261A" opacity={0.5} />
              <XAxis dataKey="time" stroke="#8C7A70" fontSize={11} tickLine={false} />
              <YAxis stroke="#8C7A70" fontSize={11} tickLine={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#221610',
                  borderColor: '#FF6A00',
                  borderRadius: '14px',
                  color: '#FDF8F5',
                  fontSize: '12px',
                  boxShadow: '0 10px 30px rgba(0,0,0,0.8)',
                }}
              />
              <Area
                type="monotone"
                dataKey={
                  activeMetricTab === 'temp'
                    ? 'temperature'
                    : activeMetricTab === 'humidity'
                    ? 'humidity'
                    : 'gas'
                }
                stroke={metricConfig[activeMetricTab].color}
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#chartGradientLive)"
                animationDuration={800}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Action Footer */}
      <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
        <motion.button
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.96 }}
          onClick={() => navigate('/scan')}
          className="px-5 py-2.5 rounded-xl text-xs font-bold text-[#FDF8F5] bg-[#1E140E] hover:bg-[#261A12] border border-[#3D261A] hover:border-[#FF6A00]/40 flex items-center gap-2 transition-colors cursor-pointer shadow-md"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Rescan or Switch Item</span>
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.96 }}
          onClick={() => navigate('/history')}
          className="px-5 py-2.5 rounded-xl text-xs font-bold text-[#140C08] btn-orange flex items-center gap-2 cursor-pointer shadow-md"
        >
          <span>View in Audit History →</span>
        </motion.button>
      </div>

      {/* Threshold Rules Configuration Modal */}
      <ThresholdConfigModal
        isOpen={isConfigOpen}
        onClose={() => setIsConfigOpen(false)}
        thresholds={thresholds}
        onSaveThresholds={updateThresholds}
      />
    </motion.div>
  );
};

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Thermometer, 
  Droplets, 
  Wind, 
  RotateCcw, 
  Download, 
  Activity,
  ArrowLeft,
  Share2,
  CheckCircle2,
  AlertTriangle,
  Sliders,
  Bell,
  Scan,
  ShieldCheck
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
    thresholds,
    updateThresholds
  } = useFreshness();

  const [activeMetricTab, setActiveMetricTab] = useState<'temp' | 'humidity' | 'gas'>('temp');
  const [copiedLink, setCopiedLink] = useState(false);
  const [isConfigOpen, setIsConfigOpen] = useState(false);

  useEffect(() => {
    if (itemId) {
      if (!activeItem || activeItem.id.toLowerCase() !== itemId.toLowerCase()) {
        scanItem(itemId).catch(() => {});
      }
    }
  }, [itemId]);

  const isTempBreached = sensorData && sensorData.temperature > thresholds.tempMax;
  const isGasBreached = sensorData && sensorData.gas > thresholds.gasWarning;
  const isHumidityBreached = sensorData && (sensorData.humidity > thresholds.humidityMax || sensorData.humidity < thresholds.humidityMin);
  const hasActiveBreach = isTempBreached || isGasBreached || isHumidityBreached;

  const chartData: HistoricalReadingPoint[] = [
    { time: '09:00', timestamp: 1, temperature: 4.0, humidity: 60, gas: 112 },
    { time: '09:30', timestamp: 2, temperature: 4.1, humidity: 61, gas: 115 },
    { time: '10:00', timestamp: 3, temperature: 4.3, humidity: 63, gas: 118 },
    { time: '10:15', timestamp: 4, temperature: 4.2, humidity: 62, gas: 119 },
    { time: '10:30', timestamp: 5, temperature: 4.1, humidity: 61, gas: 120 },
    { time: '10:45', timestamp: 6, temperature: sensorData ? sensorData.temperature : 4.2, humidity: sensorData ? sensorData.humidity : 62, gas: sensorData ? sensorData.gas : 120 },
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
    gas: { name: 'Gas Level (VOC)', unit: 'ppm', color: '#9333EA', bg: '#F5EBFF' },
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-6 select-none pb-12 font-sans"
    >
      {/* Top Back navigation & quick actions */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <motion.button
          whileHover={{ x: -4 }}
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-2 text-xs font-black text-[#5C7F75] hover:text-[#07221A] transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 text-[#20E79A]" />
          <span>Back to Dashboard</span>
        </motion.button>

        <div className="flex items-center gap-2">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsConfigOpen(true)}
            className="px-4 py-2 rounded-xl bg-white border border-[#13493B]/10 text-xs font-bold text-[#07221A] hover:bg-[#F4F7F6] transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
          >
            <Sliders className="w-4 h-4 text-[#20E79A]" />
            <span>Threshold Rules</span>
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleShare}
            className="px-4 py-2 rounded-xl bg-white border border-[#13493B]/10 text-xs font-bold text-[#07221A] hover:bg-[#F4F7F6] transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
          >
            {copiedLink ? <CheckCircle2 className="w-4 h-4 text-[#20E79A]" /> : <Share2 className="w-4 h-4 text-[#5C7F75]" />}
            <span>{copiedLink ? 'Link Copied!' : 'Share'}</span>
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleExportData}
            className="px-4 py-2 rounded-xl bg-white border border-[#13493B]/10 text-xs font-bold text-[#07221A] hover:bg-[#F4F7F6] transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
          >
            <Download className="w-4 h-4 text-[#5C7F75]" />
            <span>Export JSON</span>
          </motion.button>
        </div>
      </div>

      {/* Threshold Active Breach Banner */}
      <AnimatePresence>
        {!((currentProduct as any)?.isUnconfigured) && hasActiveBreach && (
          <motion.div
            initial={{ opacity: 0, height: 0, y: -10 }}
            animate={{ opacity: 1, height: 'auto', y: 0 }}
            exit={{ opacity: 0, height: 0, y: -10 }}
            className="p-4 rounded-2xl bg-red-50 border border-red-200 text-[#07221A] shadow-sm flex items-center justify-between gap-4"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-100 text-red-600 flex items-center justify-center shrink-0 border border-red-200">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-black uppercase tracking-wider text-red-700">
                  Sensor Threshold Exceeded
                </h4>
                <p className="text-xs text-red-900 mt-0.5 font-semibold">
                  {isTempBreached && `Temperature is elevated at ${sensorData?.temperature}°C (Limit: ${thresholds.tempMax}°C). `}
                  {isGasBreached && `Gas levels spiking at ${sensorData?.gas} ppm (Limit: ${thresholds.gasWarning} ppm). `}
                  {isHumidityBreached && `Humidity out of safe bounds (${sensorData?.humidity}%). `}
                </p>
              </div>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/alerts')}
              className="px-3.5 py-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold cursor-pointer shrink-0 transition-colors shadow-sm flex items-center gap-1.5"
            >
              <Bell className="w-3.5 h-3.5" />
              <span>View Alerts</span>
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Unconfigured IoT Warning Banner */}
      <AnimatePresence>
        {((currentProduct as any)?.isUnconfigured) && (
          <motion.div
            initial={{ opacity: 0, height: 0, y: -10 }}
            animate={{ opacity: 1, height: 'auto', y: 0 }}
            exit={{ opacity: 0, height: 0, y: -10 }}
            className="p-4 rounded-2xl bg-[#FFF9E6] border border-[#FFAA00]/20 text-[#07221A] shadow-sm flex items-center justify-between gap-4"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#FFAA00]/10 text-[#FFAA00] flex items-center justify-center shrink-0 border border-[#FFAA00]/20 animate-pulse">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-black uppercase tracking-wider text-[#996600]">
                  Micro-node Not Configured Yet
                </h4>
                <p className="text-xs text-[#664C00] mt-0.5 font-semibold">
                  This meat package has been registered, but its corresponding hardware micro-node sensor is not configured or bound yet in Settings.
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* PRODUCT INFORMATION CARD */}
      <div className="bg-white border border-[#13493B]/10 rounded-[32px] p-6 sm:p-8 relative overflow-hidden shadow-sm">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Left: Product Media & Meta */}
          <div className="flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left">
            <motion.div 
              whileHover={{ scale: 1.05 }}
              className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-[24px] overflow-hidden border border-[#13493B]/10 bg-[#F4F7F6] shrink-0 shadow-sm"
            >
              <img
                src={currentProduct.image}
                alt={currentProduct.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-2 left-2">
                <span className="text-[9px] font-mono font-black px-2 py-0.5 rounded-md bg-white border border-[#13493B]/10 text-[#07221A]">
                  {currentProduct.tagId}
                </span>
              </div>
            </motion.div>
 
            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <h2 className="text-xl font-black text-[#07221A] tracking-tight">{currentProduct.name}</h2>
                <StatusBadge status={((currentProduct as any)?.isUnconfigured) ? 'Warning' : (freshnessReport?.status || 'Fresh')} size="md" />
              </div>
              <p className="text-xs font-semibold text-[#5C7F75]">{currentProduct.category} • FreshNex IoT Node</p>
              
              <div className="pt-1 flex flex-wrap items-center justify-center sm:justify-start gap-x-4 gap-y-1 text-[11px] font-bold text-[#5C7F75]">
                <div className="flex items-center gap-1">
                  <span className={`w-2 h-2 rounded-full ${((currentProduct as any)?.isUnconfigured) ? 'bg-[#FFAA00]' : 'bg-[#20E79A]'}`} />
                  <span>{((currentProduct as any)?.isUnconfigured) ? 'Awaiting Device Sync' : 'Bio-Sensor Linked'}</span>
                </div>
                <span>•</span>
                <span>ID: {currentProduct.id}</span>
              </div>
            </div>
          </div>
 
          {/* Right: Freshness Index Gauge */}
          <div className="flex flex-col items-center justify-center shrink-0 border-t md:border-t-0 md:border-l border-[#13493B]/10 pt-4 md:pt-0 md:pl-10">
            <span className="text-[10px] font-black text-[#5C7F75] uppercase tracking-wider mb-2">Live Freshness Score</span>
            <div className="relative flex items-center justify-center">
              <FreshnessGauge score={((currentProduct as any)?.isUnconfigured) ? 0 : (freshnessReport?.score || 100)} size="md" />
            </div>
          </div>
        </div>
      </div>
 
      {/* THREE LIVE METRIC TILES */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
          title="MQ-135 Gas Sensors"
          value={((currentProduct as any)?.isUnconfigured) ? '--' : (sensorData?.gas || 120)}
          unit={((currentProduct as any)?.isUnconfigured) ? undefined : "ppm"}
          icon={Wind}
          color={metricConfig.gas.color}
          status={((currentProduct as any)?.isUnconfigured) ? undefined : (isGasBreached ? 'critical' : 'normal')}
          message={((currentProduct as any)?.isUnconfigured) ? 'Not Configured Yet' : (isGasBreached ? 'Gas threshold breach' : 'Stable atmosphere')}
          isEmpty={!!((currentProduct as any)?.isUnconfigured)}
        />
      </div>

      {/* TREND GRAPH CARD */}
      <div className="bg-white border border-[#13493B]/10 rounded-[28px] p-5 sm:p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-[#F4F7F6]">
          <div className="space-y-0.5">
            <h3 className="text-sm font-black text-[#07221A]">Live Bio-Telemetry Trends</h3>
            <p className="text-[11px] text-[#5C7F75] font-semibold">Continuous sensor telemetry feed synced via Bluetooth/RFID.</p>
          </div>

          <div className="flex bg-[#F4F7F6] p-1 rounded-xl border border-[#13493B]/10 self-start sm:self-auto">
            {(['temp', 'humidity', 'gas'] as const).map((tab) => {
              const active = activeMetricTab === tab;
              return (
                <button
                  key={tab}
                  onClick={() => setActiveMetricTab(tab)}
                  className="relative px-3.5 py-1.5 rounded-lg text-xs font-black transition-all cursor-pointer"
                >
                  {active && (
                    <motion.div
                      layoutId="metricTabActive"
                      className="absolute inset-0 bg-white shadow-sm rounded-lg border border-[#13493B]/10"
                      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                    />
                  )}
                  <span className={`relative z-10 ${active ? 'text-[#07221A]' : 'text-[#5C7F75] hover:text-[#07221A]'}`}>
                    {tab === 'temp' ? 'Temperature (°C)' : tab === 'humidity' ? 'Humidity (%)' : 'Gas Level (ppm)'}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Recharts Chart Area */}
        <div className="h-72 w-full relative">
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
              <YAxis stroke="#5C7F75" fontSize={10} fontWeight={700} tickLine={false} axisLine={false} />
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
          className="px-5 py-3 rounded-full text-xs font-black text-[#07221A] bg-white hover:bg-[#F4F7F6] border border-[#13493B]/10 flex items-center gap-2 transition-colors cursor-pointer shadow-sm"
        >
          <RotateCcw className="w-4 h-4 text-[#20E79A]" />
          <span>Rescan or Switch Item</span>
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.96 }}
          onClick={() => navigate('/history')}
          className="px-6 py-3 rounded-full text-xs font-black text-white bg-[#07221A] hover:bg-[#134336] flex items-center gap-2 cursor-pointer shadow-md"
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

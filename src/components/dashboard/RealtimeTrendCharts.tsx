import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  ReferenceLine, 
  ReferenceArea,
  Legend
} from 'recharts';
import { 
  Thermometer, 
  Droplets, 
  Wind, 
  Activity, 
  Layers, 
  Sliders, 
  ChevronDown, 
  Play, 
  Pause, 
  RotateCcw, 
  Zap, 
  AlertTriangle, 
  CheckCircle2, 
  Sparkles,
  TrendingUp,
  TrendingDown,
  Info,
  Clock,
  Calendar
} from 'lucide-react';
import { SensorData, FoodItem, ScanHistoryRecord } from '../../types';
import { FreshnessReport, calculateFreshness } from '../../utils/freshnessEngine';
import { calculateMoisture } from '../../utils/moistureCalculator';
import { SensorThresholdConfig, DEFAULT_THRESHOLDS } from '../../services/alertThresholdService';

export interface TelemetryPoint {
  id: string;
  time: string;
  timestamp: number;
  temperature: number;
  humidity: number;
  gas: number;
  moisture: number; // Repeatedly calculated psychrometric moisture (g/m³)
  dewPoint: number; // Condensation temperature (°C)
  freshnessScore: number;
  status: string;
  eventNote?: string;
}

interface RealtimeTrendChartsProps {
  currentSensorData: SensorData | null;
  currentReport: FreshnessReport | null;
  activeItem: FoodItem | null;
  thresholdRules?: SensorThresholdConfig;
  scanHistory?: ScanHistoryRecord[];
  onOpenThresholdModal?: () => void;
}

export const RealtimeTrendCharts: React.FC<RealtimeTrendChartsProps> = ({
  currentSensorData,
  currentReport,
  activeItem,
  thresholdRules = DEFAULT_THRESHOLDS,
  scanHistory = [],
  onOpenThresholdModal,
}) => {
  const [viewMode, setViewMode] = useState<'correlated' | 'grid' | 'temperature' | 'humidity' | 'gas' | 'freshness'>('correlated');
  const [isLiveStreaming, setIsLiveStreaming] = useState(true);
  const [activeSimulation, setActiveSimulation] = useState<'none' | 'tempSpike' | 'gasSpike' | 'chillingRecovery'>('none');
  const [showThresholdRefLines, setShowThresholdRefLines] = useState(true);

  // Generate initial historical seed points
  const initialPoints = useMemo(() => {
    const points: TelemetryPoint[] = [];
    const now = Date.now();
    const count = 16;
    const intervalSec = 30; // 30s intervals

    const baseTemp = currentSensorData?.temperature ?? 4.2;
    const baseHum = currentSensorData?.humidity ?? 62.0;
    const baseGas = currentSensorData?.gas ?? 120.0;
    const category = activeItem?.category || 'Dairy';

    for (let i = count - 1; i >= 0; i--) {
      const pointTime = now - (i * intervalSec * 1000);
      const timeStr = new Date(pointTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

      // Realistic minor natural sensor noise (±0.15°C, ±0.4%, ±1.5 ppm)
      const noiseT = Math.sin(i * 0.8) * 0.15;
      const noiseH = Math.cos(i * 0.6) * 0.4;
      const noiseG = Math.sin(i * 0.9) * 1.5;

      const t = +(baseTemp + noiseT).toFixed(1);
      const h = Math.round(baseHum + noiseH);
      const g = Math.round(baseGas + noiseG);
      const m = calculateMoisture(t, h);

      const report = calculateFreshness({
        temperature: t,
        humidity: h,
        gas: g,
        category,
        activeThresholdRules: thresholdRules,
      });

      points.push({
        id: `seed-${i}`,
        time: timeStr,
        timestamp: pointTime,
        temperature: t,
        humidity: h,
        gas: g,
        moisture: m.absoluteMoisture,
        dewPoint: m.dewPoint,
        freshnessScore: report.score,
        status: report.status,
      });
    }
    return points;
  }, [activeItem?.category, thresholdRules]);

  const [telemetryHistory, setTelemetryHistory] = useState<TelemetryPoint[]>(initialPoints);
  const simOffsetRef = useRef({ temp: 0, gas: 0, hum: 0 });

  // Handle active simulation offsets
  useEffect(() => {
    if (activeSimulation === 'tempSpike') {
      simOffsetRef.current = { temp: 6.8, gas: 45, hum: -5 };
    } else if (activeSimulation === 'gasSpike') {
      simOffsetRef.current = { temp: 2.2, gas: 220, hum: 8 };
    } else if (activeSimulation === 'chillingRecovery') {
      simOffsetRef.current = { temp: -0.5, gas: -15, hum: 0 };
    } else {
      simOffsetRef.current = { temp: 0, gas: 0, hum: 0 };
    }
  }, [activeSimulation]);

  // Live real-time tick interval (updates every 3 seconds to reflect live IoT streaming)
  useEffect(() => {
    if (!isLiveStreaming) return;

    const interval = setInterval(() => {
      const now = Date.now();
      const timeStr = new Date(now).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

      // Base sensor values
      const baseTemp = currentSensorData?.temperature ?? 4.2;
      const baseHum = currentSensorData?.humidity ?? 62.0;
      const baseGas = currentSensorData?.gas ?? 120.0;
      const category = activeItem?.category || 'Dairy';

      // Jitter + simulation perturbation
      const jitterT = (Math.random() - 0.48) * 0.2;
      const jitterH = (Math.random() - 0.5) * 0.6;
      const jitterG = (Math.random() - 0.45) * 2.2;

      const sim = simOffsetRef.current;
      const t = +(baseTemp + sim.temp + jitterT).toFixed(1);
      const h = Math.round(Math.min(100, Math.max(10, baseHum + sim.hum + jitterH)));
      const g = Math.round(Math.max(15, baseGas + sim.gas + jitterG));
      const m = calculateMoisture(t, h);

      const report = calculateFreshness({
        temperature: t,
        humidity: h,
        gas: g,
        category,
        activeThresholdRules: thresholdRules,
      });

      let eventNote: string | undefined = undefined;
      if (sim.temp > 3) eventNote = 'Thermal Spike Event';
      else if (sim.gas > 100) eventNote = 'Gas Outgassing Surge';

      const newPoint: TelemetryPoint = {
        id: `tick-${now}`,
        time: timeStr,
        timestamp: now,
        temperature: t,
        humidity: h,
        gas: g,
        moisture: m.absoluteMoisture,
        dewPoint: m.dewPoint,
        freshnessScore: report.score,
        status: report.status,
        eventNote,
      };

      setTelemetryHistory((prev) => {
        const next = [...prev.slice(1), newPoint];
        return next;
      });
    }, 3000);

    return () => clearInterval(interval);
  }, [isLiveStreaming, currentSensorData, activeItem?.category, thresholdRules]);

  // Current latest telemetry point
  const latestPoint = telemetryHistory[telemetryHistory.length - 1] || {
    temperature: 4.2,
    humidity: 62,
    gas: 120,
    moisture: 4.0,
    dewPoint: -2.3,
    freshnessScore: 100,
    status: 'Fresh',
  };

  // Min / Max telemetry calculation for badges
  const stats = useMemo(() => {
    if (telemetryHistory.length === 0) return { tempMin: 4.2, tempMax: 4.2, gasMax: 120, gasMin: 120, moistureMin: 4.0, moistureMax: 4.0, avgScore: 100 };
    const temps = telemetryHistory.map(p => p.temperature);
    const gases = telemetryHistory.map(p => p.gas);
    const moistures = telemetryHistory.map(p => p.moisture);
    const scores = telemetryHistory.map(p => p.freshnessScore);

    return {
      tempMin: Math.min(...temps),
      tempMax: Math.max(...temps),
      gasMin: Math.min(...gases),
      gasMax: Math.max(...gases),
      moistureMin: Math.min(...moistures),
      moistureMax: Math.max(...moistures),
      avgScore: Math.round(scores.reduce((a, b) => a + b, 0) / scores.length),
    };
  }, [telemetryHistory]);

  // Custom high-fidelity tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload as TelemetryPoint;
      const isFresh = data.freshnessScore >= 80;
      const isWarning = data.freshnessScore < 80 && data.freshnessScore >= 50;

      return (
        <div className="bg-white/95 backdrop-blur-md p-3.5 rounded-2xl border border-[#13493B]/15 shadow-[0_12px_36px_rgba(7,34,26,0.12)] space-y-2 text-xs min-w-[210px] select-none">
          <div className="flex items-center justify-between pb-1.5 border-b border-[#13493B]/10">
            <span className="text-[10px] font-mono font-bold text-[#5C7F75]">{data.time}</span>
            <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
              isFresh ? 'bg-[#20E79A]/20 text-[#07221A]' : isWarning ? 'bg-amber-100 text-amber-800' : 'bg-red-100 text-red-700'
            }`}>
              {data.freshnessScore}% • {data.status}
            </span>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-[#FF5A67]">
              <span className="flex items-center gap-1.5 font-bold">
                <Thermometer className="w-3.5 h-3.5" /> Temperature
              </span>
              <span className="font-mono font-black">{data.temperature}°C</span>
            </div>

            <div className="flex items-center justify-between text-[#3B82F6]">
              <span className="flex items-center gap-1.5 font-bold">
                <Droplets className="w-3.5 h-3.5" /> Relative Humidity
              </span>
              <span className="font-mono font-black">{data.humidity}%</span>
            </div>

            <div className="flex items-center justify-between text-[#0EA5E9]">
              <span className="flex items-center gap-1.5 font-bold">
                <Droplets className="w-3.5 h-3.5" /> Calculated Moisture
              </span>
              <span className="font-mono font-black">{data.moisture} g/m³ <span className="text-[9px] font-normal text-[#5C7F75]">(Dew: {data.dewPoint}°C)</span></span>
            </div>

            <div className="flex items-center justify-between text-[#9333EA]">
              <span className="flex items-center gap-1.5 font-bold">
                <Wind className="w-3.5 h-3.5" /> MQ-135 Gas
              </span>
              <span className="font-mono font-black">{data.gas} ppm</span>
            </div>

            <div className="flex items-center justify-between text-[#20E79A] pt-1 border-t border-[#13493B]/10">
              <span className="flex items-center gap-1.5 font-black text-[#07221A]">
                <Activity className="w-3.5 h-3.5 text-[#20E79A]" /> Freshness Score
              </span>
              <span className="font-black text-sm text-[#07221A]">{data.freshnessScore}%</span>
            </div>
          </div>

          {data.eventNote && (
            <div className="mt-1 pt-1 border-t border-red-100 text-[10px] font-bold text-red-600 flex items-center gap-1">
              <AlertTriangle className="w-3 h-3 shrink-0" />
              <span>{data.eventNote}</span>
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  // Formatted last response timestamp with full date and time
  const lastResponseFormatted = useMemo(() => {
    const ts = latestPoint.timestamp || currentSensorData?.timestamp || Date.now();
    const d = new Date(ts);
    const dateStr = d.toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' });
    const timeStr = d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true });
    return {
      date: dateStr,
      time: timeStr,
      fullText: `${dateStr}, ${timeStr}`
    };
  }, [latestPoint.timestamp, currentSensorData?.timestamp]);

  return (
    <div className="glass-card p-5 sm:p-7 depth-2 space-y-6 text-[#07221A] relative overflow-hidden">
      {/* Background ambient decorative glow */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-bl from-[#20E79A]/10 via-transparent to-transparent pointer-events-none rounded-full blur-2xl" />

      {/* 1. Header & Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-3 border-b border-[#13493B]/10 relative z-10">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#20E79A]/15 border border-[#20E79A]/30 flex items-center justify-center text-[#20E79A]">
              <Activity className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-black text-[#07221A] tracking-tight">
                  Real-Time Environmental & Freshness Trends
                </h3>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#EBFBF4] border border-[#20E79A]/30 text-[9px] font-bold text-[#07221A]">
                  <span className={`w-1.5 h-1.5 rounded-full ${isLiveStreaming ? 'bg-[#20E79A] animate-ping' : 'bg-slate-400'}`} />
                  {isLiveStreaming ? 'LIVE IOT FEED' : 'STREAM PAUSED'}
                </span>
              </div>
              <p className="text-xs text-[#5C7F75] font-semibold mt-0.5">
                Dynamic Recharts telemetry illustrating how Temperature, Humidity & Gas fluctuations directly govern Freshness Score.
              </p>
              {/* Last Response Received with Date & 2-Hour Validity Note */}
              <div className="flex flex-wrap items-center gap-2.5 mt-2">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-[#F4F7F6] border border-[#13493B]/10 text-[10px] font-mono font-bold text-[#07221A] shadow-2xs">
                  <Clock className="w-3.5 h-3.5 text-[#20E79A]" />
                  <span className="text-[#5C7F75]">Last Response Received:</span>
                  <span className="text-[#13493B] font-extrabold">{lastResponseFormatted.fullText}</span>
                </div>
                <div className="inline-flex items-center gap-1 text-[10px] font-semibold text-[#13493B]">
                  <Info className="w-3.5 h-3.5 text-[#20E79A] shrink-0" />
                  <span>Note: response valid for only 2 hours from the last response time</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action buttons & mode switchers */}
        <div className="flex flex-wrap items-center gap-2 self-start lg:self-auto">
          {/* View mode toggle */}
          <div className="flex bg-[#F4F7F6] p-1 rounded-xl border border-[#13493B]/10">
            <button
              onClick={() => setViewMode('correlated')}
              className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all cursor-pointer ${
                viewMode === 'correlated' ? 'bg-white text-[#07221A] shadow-sm' : 'text-[#5C7F75] hover:text-[#07221A]'
              }`}
            >
              Correlated Multi-Metric
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all cursor-pointer ${
                viewMode === 'grid' ? 'bg-white text-[#07221A] shadow-sm' : 'text-[#5C7F75] hover:text-[#07221A]'
              }`}
            >
              Sensor Breakdown (4-Way)
            </button>
          </div>

          {/* Pause / Resume live feed */}
          <button
            onClick={() => setIsLiveStreaming(!isLiveStreaming)}
            className={`p-2 rounded-xl border cursor-pointer transition-all flex items-center gap-1 text-xs font-bold ${
              isLiveStreaming 
                ? 'bg-white border-[#13493B]/10 text-[#07221A] hover:bg-[#F4F7F6]' 
                : 'bg-[#20E79A] text-white border-[#20E79A]'
            }`}
            title={isLiveStreaming ? 'Pause Real-Time Telemetry Stream' : 'Resume Real-Time Telemetry Stream'}
          >
            {isLiveStreaming ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
          </button>

          {/* Toggle threshold lines */}
          <button
            onClick={() => setShowThresholdRefLines(!showThresholdRefLines)}
            className={`px-2.5 py-1.5 rounded-xl border text-xs font-bold cursor-pointer transition-all flex items-center gap-1.5 ${
              showThresholdRefLines 
                ? 'bg-[#EBFBF4] border-[#20E79A]/40 text-[#07221A]' 
                : 'bg-white border-[#13493B]/10 text-[#5C7F75]'
            }`}
            title="Toggle Safety Threshold Reference Lines"
          >
            <Sliders className="w-3.5 h-3.5 text-[#20E79A]" />
            <span className="hidden sm:inline">Threshold Rules</span>
          </button>
        </div>
      </div>

      {/* 2. Interactive Environmental Fluctuation Simulator & Diagnostics Strip */}
      <div className="p-3.5 rounded-2xl bg-[#FAFCFB] border border-[#13493B]/10 flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[11px] font-bold text-[#5C7F75] flex items-center gap-1">
            <Zap className="w-3.5 h-3.5 text-amber-500" />
            Simulate Fluctuation:
          </span>

          <button
            onClick={() => setActiveSimulation(activeSimulation === 'tempSpike' ? 'none' : 'tempSpike')}
            className={`px-2.5 py-1 rounded-lg font-bold text-[10px] cursor-pointer transition-all border ${
              activeSimulation === 'tempSpike'
                ? 'bg-[#FF5A67] text-white border-[#FF5A67] shadow-sm'
                : 'bg-white border-[#13493B]/10 text-[#FF5A67] hover:bg-red-50'
            }`}
          >
            🔥 Thermal Spike (+6.8°C)
          </button>

          <button
            onClick={() => setActiveSimulation(activeSimulation === 'gasSpike' ? 'none' : 'gasSpike')}
            className={`px-2.5 py-1 rounded-lg font-bold text-[10px] cursor-pointer transition-all border ${
              activeSimulation === 'gasSpike'
                ? 'bg-[#9333EA] text-white border-[#9333EA] shadow-sm'
                : 'bg-white border-[#13493B]/10 text-[#9333EA] hover:bg-purple-50'
            }`}
          >
            💨 Gas Outgassing (+220 ppm)
          </button>

          <button
            onClick={() => setActiveSimulation('none')}
            className={`px-2.5 py-1 rounded-lg font-bold text-[10px] cursor-pointer transition-all border ${
              activeSimulation === 'none'
                ? 'bg-[#20E79A] text-white border-[#20E79A]'
                : 'bg-white border-[#13493B]/10 text-[#5C7F75] hover:text-[#07221A]'
            }`}
          >
            <RotateCcw className="w-3 h-3 inline mr-1" />
            Normal Baseline
          </button>
        </div>

        {/* Live Status callout */}
        <div className="flex flex-wrap items-center gap-3 text-[11px]">
          <div className="flex items-center gap-1 text-[#FF5A67] font-mono font-bold" title="Ambient Temperature">
            <Thermometer className="w-3.5 h-3.5" />
            <span>{latestPoint.temperature}°C</span>
          </div>
          <div className="flex items-center gap-1 text-[#3B82F6] font-mono font-bold" title="Relative Humidity">
            <Droplets className="w-3.5 h-3.5" />
            <span>{latestPoint.humidity}%</span>
          </div>
          <div className="flex items-center gap-1 text-[#0EA5E9] font-mono font-bold" title={`Calculated Absolute Moisture (Dew Point: ${latestPoint.dewPoint}°C)`}>
            <Droplets className="w-3.5 h-3.5" />
            <span>{latestPoint.moisture} g/m³</span>
          </div>
          <div className="flex items-center gap-1 text-[#9333EA] font-mono font-bold" title="MQ-135 Gas">
            <Wind className="w-3.5 h-3.5" />
            <span>{latestPoint.gas} ppm</span>
          </div>
          <div className="flex items-center gap-1 text-[#07221A] font-black pl-2 border-l border-[#13493B]/15">
            <span className="text-[10px] text-[#5C7F75] uppercase">Score:</span>
            <span className="text-xs px-2 py-0.5 rounded-md bg-[#20E79A]/20 text-[#07221A] font-mono">
              {latestPoint.freshnessScore}%
            </span>
          </div>
        </div>
      </div>

      {/* 3. CHART VISUALIZATION BODY */}
      {viewMode === 'correlated' ? (
        /* CORRELATED MULTI-METRIC AREA & LINE CHART */
        <div className="space-y-3">
          <div className="w-full h-80 pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={telemetryHistory} margin={{ top: 15, right: 35, left: -15, bottom: 0 }}>
                <defs>
                  {/* Freshness Gradient */}
                  <linearGradient id="freshnessGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#20E79A" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#20E79A" stopOpacity={0.0} />
                  </linearGradient>
                  {/* Temp Gradient */}
                  <linearGradient id="tempGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#FF5A67" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#FF5A67" stopOpacity={0.0} />
                  </linearGradient>
                </defs>

                <CartesianGrid strokeDasharray="3 3" stroke="rgba(19, 73, 59, 0.07)" vertical={false} />
                
                <XAxis 
                  dataKey="time" 
                  stroke="#5C7F75" 
                  fontSize={10} 
                  fontWeight={700}
                  tickLine={false} 
                  axisLine={false} 
                />

                {/* Left Y-Axis: Temperature (°C), Humidity (%), and Freshness (0 - 100) */}
                <YAxis 
                  yAxisId="left"
                  stroke="#5C7F75" 
                  fontSize={10} 
                  fontWeight={700}
                  tickLine={false} 
                  axisLine={false}
                  domain={[0, 100]}
                  unit="%"
                />

                {/* Right Y-Axis: Gas Level (MQ-135 in PPM / ADC) */}
                <YAxis 
                  yAxisId="right"
                  orientation="right"
                  stroke="#9333EA" 
                  fontSize={10} 
                  fontWeight={700}
                  tickLine={false} 
                  axisLine={false}
                  domain={[0, 500]}
                  unit=" ppm"
                />

                <Tooltip content={<CustomTooltip />} />

                {/* Threshold Rules Reference Lines */}
                {showThresholdRefLines && (
                  <>
                    <ReferenceLine 
                      yAxisId="left" 
                      y={thresholdRules.tempMax} 
                      stroke="#FF5A67" 
                      strokeDasharray="4 4" 
                      strokeWidth={1.5}
                      label={{ 
                        value: `Max Safe Temp (${thresholdRules.tempMax}°C)`, 
                        fill: '#FF5A67', 
                        fontSize: 9, 
                        fontWeight: 800,
                        position: 'insideTopLeft' 
                      }} 
                    />
                    <ReferenceLine 
                      yAxisId="right" 
                      y={thresholdRules.gasWarning} 
                      stroke="#9333EA" 
                      strokeDasharray="4 4" 
                      strokeWidth={1.5}
                      label={{ 
                        value: `Gas Warning (${thresholdRules.gasWarning} ppm)`, 
                        fill: '#9333EA', 
                        fontSize: 9, 
                        fontWeight: 800,
                        position: 'insideTopRight' 
                      }} 
                    />
                    <ReferenceLine 
                      yAxisId="left" 
                      y={80} 
                      stroke="#20E79A" 
                      strokeDasharray="2 2" 
                      strokeWidth={1}
                      strokeOpacity={0.6}
                      label={{ 
                        value: 'Peak Freshness Tier (80%)', 
                        fill: '#20E79A', 
                        fontSize: 9, 
                        fontWeight: 800,
                        position: 'insideBottomLeft' 
                      }} 
                    />
                  </>
                )}

                {/* 1. Freshness Score Area (Prominent Green) */}
                <Area 
                  yAxisId="left"
                  type="monotone" 
                  dataKey="freshnessScore" 
                  stroke="#20E79A" 
                  strokeWidth={3.5} 
                  fillOpacity={1} 
                  fill="url(#freshnessGrad)" 
                  name="Freshness Score (%)"
                />

                {/* 2. Temperature Line (°C) */}
                <Line 
                  yAxisId="left"
                  type="monotone" 
                  dataKey="temperature" 
                  stroke="#FF5A67" 
                  strokeWidth={2.5} 
                  dot={false}
                  activeDot={{ r: 5, fill: '#FF5A67' }}
                  name="Temperature (°C)"
                />

                {/* 3. Relative Humidity Line (%) */}
                <Line 
                  yAxisId="left"
                  type="monotone" 
                  dataKey="humidity" 
                  stroke="#3B82F6" 
                  strokeWidth={2} 
                  strokeDasharray="3 3"
                  dot={false}
                  activeDot={{ r: 4, fill: '#3B82F6' }}
                  name="Relative Humidity (%)"
                />

                {/* 4. Calculated Moisture Line (g/m³) */}
                <Line 
                  yAxisId="left"
                  type="monotone" 
                  dataKey="moisture" 
                  stroke="#0EA5E9" 
                  strokeWidth={2} 
                  strokeDasharray="4 2"
                  dot={false}
                  activeDot={{ r: 4, fill: '#0EA5E9' }}
                  name="Calculated Moisture (g/m³)"
                />

                {/* 5. Gas Levels on Right Axis (ppm) */}
                <Line 
                  yAxisId="right"
                  type="monotone" 
                  dataKey="gas" 
                  stroke="#9333EA" 
                  strokeWidth={2.5} 
                  dot={false}
                  activeDot={{ r: 5, fill: '#9333EA' }}
                  name="MQ-135 Gas (ppm)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Interactive Legend with live correlation notes */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 pt-2 border-t border-[#13493B]/10">
            <div className="p-2.5 rounded-xl bg-white border border-[#13493B]/10 flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-[#20E79A] shadow-[0_0_8px_#20E79A]" />
              <div>
                <span className="block text-[11px] font-black text-[#07221A]">Freshness Score</span>
                <span className="block text-[9px] text-[#5C7F75] font-semibold">MCQI Index</span>
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-white border border-[#13493B]/10 flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-[#FF5A67]" />
              <div>
                <span className="block text-[11px] font-black text-[#07221A]">Temperature</span>
                <span className="block text-[9px] text-[#5C7F75] font-semibold">≤ {thresholdRules.tempMax}°C</span>
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-white border border-[#13493B]/10 flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-[#3B82F6]" />
              <div>
                <span className="block text-[11px] font-black text-[#07221A]">Humidity (% RH)</span>
                <span className="block text-[9px] text-[#5C7F75] font-semibold">{thresholdRules.humidityMin} - {thresholdRules.humidityMax}%</span>
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-white border border-[#13493B]/10 flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-[#0EA5E9]" />
              <div>
                <span className="block text-[11px] font-black text-[#07221A]">Moisture (g/m³)</span>
                <span className="block text-[9px] text-[#5C7F75] font-semibold">Dew: {latestPoint.dewPoint}°C</span>
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-white border border-[#13493B]/10 flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-[#9333EA]" />
              <div>
                <span className="block text-[11px] font-black text-[#07221A]">MQ-135 Gas</span>
                <span className="block text-[9px] text-[#5C7F75] font-semibold">&gt; {thresholdRules.gasWarning} ppm</span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* QUAD SYNCHRONIZED SENSOR BREAKDOWN GRID */
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Chart 1: Temperature */}
            <div className="p-4 rounded-2xl bg-white border border-[#13493B]/10 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-black text-[#FF5A67]">
                  <Thermometer className="w-4 h-4" />
                  <span>Temperature</span>
                </div>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-red-50 text-[#FF5A67]">
                  {latestPoint.temperature}°C
                </span>
              </div>

              <div className="w-full h-36">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={telemetryHistory} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                    <defs>
                      <linearGradient id="miniTempGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#FF5A67" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#FF5A67" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="2 2" stroke="rgba(0,0,0,0.04)" vertical={false} />
                    <XAxis dataKey="time" hide />
                    <YAxis domain={['auto', 'auto']} stroke="#5C7F75" fontSize={9} />
                    <Tooltip content={<CustomTooltip />} />
                    {showThresholdRefLines && (
                      <ReferenceLine y={thresholdRules.tempMax} stroke="#FF5A67" strokeDasharray="2 2" />
                    )}
                    <Area type="monotone" dataKey="temperature" stroke="#FF5A67" strokeWidth={2} fill="url(#miniTempGrad)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              <div className="flex items-center justify-between text-[10px] text-[#5C7F75] pt-1 border-t border-[#F4F7F6]">
                <span>Limit: ≤ {thresholdRules.tempMax}°C</span>
                <span className="font-mono">Min: {stats.tempMin}°C</span>
              </div>
            </div>

            {/* Chart 2: Relative Humidity */}
            <div className="p-4 rounded-2xl bg-white border border-[#13493B]/10 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-black text-[#3B82F6]">
                  <Droplets className="w-4 h-4" />
                  <span>Humidity</span>
                </div>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-blue-50 text-[#3B82F6]">
                  {latestPoint.humidity}%
                </span>
              </div>

              <div className="w-full h-36">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={telemetryHistory} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                    <defs>
                      <linearGradient id="miniHumGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="2 2" stroke="rgba(0,0,0,0.04)" vertical={false} />
                    <XAxis dataKey="time" hide />
                    <YAxis domain={[30, 95]} stroke="#5C7F75" fontSize={9} />
                    <Tooltip content={<CustomTooltip />} />
                    <Area type="monotone" dataKey="humidity" stroke="#3B82F6" strokeWidth={2} fill="url(#miniHumGrad)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              <div className="flex items-center justify-between text-[10px] text-[#5C7F75] pt-1 border-t border-[#F4F7F6]">
                <span>Safe: {thresholdRules.humidityMin}-{thresholdRules.humidityMax}%</span>
                <span className="font-mono">Active: {latestPoint.humidity}%</span>
              </div>
            </div>

            {/* Chart 3: Calculated Moisture (g/m³) */}
            <div className="p-4 rounded-2xl bg-white border border-[#13493B]/10 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-black text-[#0EA5E9]">
                  <Droplets className="w-4 h-4" />
                  <span>Moisture (Calc.)</span>
                </div>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-sky-50 text-[#0EA5E9]">
                  {latestPoint.moisture} g/m³
                </span>
              </div>

              <div className="w-full h-36">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={telemetryHistory} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                    <defs>
                      <linearGradient id="miniMoistureGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#0EA5E9" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#0EA5E9" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="2 2" stroke="rgba(0,0,0,0.04)" vertical={false} />
                    <XAxis dataKey="time" hide />
                    <YAxis domain={['auto', 'auto']} stroke="#5C7F75" fontSize={9} />
                    <Tooltip content={<CustomTooltip />} />
                    <Area type="monotone" dataKey="moisture" stroke="#0EA5E9" strokeWidth={2} fill="url(#miniMoistureGrad)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              <div className="flex items-center justify-between text-[10px] text-[#5C7F75] pt-1 border-t border-[#F4F7F6]">
                <span>Dew: {latestPoint.dewPoint}°C</span>
                <span className="font-mono">Range: {stats.moistureMin}-{stats.moistureMax}</span>
              </div>
            </div>

            {/* Chart 4: MQ-135 Gas */}
            <div className="p-4 rounded-2xl bg-white border border-[#13493B]/10 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-black text-[#9333EA]">
                  <Wind className="w-4 h-4" />
                  <span>MQ-135 Gas</span>
                </div>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-purple-50 text-[#9333EA]">
                  {latestPoint.gas} ppm
                </span>
              </div>

              <div className="w-full h-36">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={telemetryHistory} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="miniGasGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#9333EA" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#9333EA" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="2 2" stroke="rgba(0,0,0,0.04)" vertical={false} />
                    <XAxis dataKey="time" hide />
                    <YAxis domain={['auto', 'auto']} stroke="#5C7F75" fontSize={9} />
                    <Tooltip content={<CustomTooltip />} />
                    {showThresholdRefLines && (
                      <ReferenceLine y={thresholdRules.gasWarning} stroke="#9333EA" strokeDasharray="2 2" />
                    )}
                    <Area type="monotone" dataKey="gas" stroke="#9333EA" strokeWidth={2} fill="url(#miniGasGrad)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              <div className="flex items-center justify-between text-[10px] text-[#5C7F75] pt-1 border-t border-[#F4F7F6]">
                <span>Warning: &gt; {thresholdRules.gasWarning} ppm</span>
                <span className="font-mono">Peak: {stats.gasMax} ppm</span>
              </div>
            </div>
          </div>

          {/* Synchronized Freshness Impact Strip */}
          <div className="p-4 rounded-2xl bg-white border border-[#13493B]/10 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#20E79A]/20 flex items-center justify-center text-[#20E79A]">
                <Activity className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs font-black text-[#07221A] block">
                  Resulting Freshness Score: {latestPoint.freshnessScore}% ({latestPoint.status})
                </span>
                <span className="text-[11px] text-[#5C7F75] font-semibold block">
                  {latestPoint.freshnessScore >= 80 
                    ? 'All environmental vectors within optimal boundaries. Spoilage risk negligible.'
                    : 'Environmental deviation detected. Kinetic multi-component decay rate accelerated.'}
                </span>
              </div>
            </div>

            <div className="w-full sm:w-60 h-2 bg-[#EBF1EF] rounded-full overflow-hidden">
              <div 
                className={`h-full rounded-full transition-all duration-500 ${
                  latestPoint.freshnessScore >= 80 
                    ? 'bg-[#20E79A]' 
                    : latestPoint.freshnessScore >= 50 
                    ? 'bg-amber-400' 
                    : 'bg-[#FF5A67]'
                }`}
                style={{ width: `${latestPoint.freshnessScore}%` }}
              />
            </div>
          </div>
        </div>
      )}

      {/* 4. Educational Working Principle Callout */}
      <div className="p-3.5 rounded-2xl bg-[#EBFBF4] border border-[#20E79A]/30 flex items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 text-[#07221A]">
          <Info className="w-4 h-4 text-[#20E79A] shrink-0" />
          <span className="text-[11px] font-semibold">
            <strong className="font-black text-[#07221A]">How Environmental Fluctuations Impact Freshness:</strong> The FreshNex Multi-Component Quality Index (MCQI) evaluates deviations in Temperature ($W_T$), Humidity ($W_H$), and Gas ($W_G$). When thermal abuse and VOC spikes co-occur, the Arrhenius synergy multiplier compounds the quality loss.
          </span>
        </div>

        {onOpenThresholdModal && (
          <button
            onClick={onOpenThresholdModal}
            className="px-3 py-1.5 rounded-xl neo-btn text-[10px] font-black text-[#07221A] shrink-0 cursor-pointer hover:bg-white"
          >
            Adjust Rules
          </button>
        )}
      </div>
    </div>
  );
};

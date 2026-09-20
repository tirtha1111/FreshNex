import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { 
  ChevronLeft, 
  Leaf, 
  MapPin, 
  Clock, 
  Thermometer, 
  Droplets, 
  Wind, 
  CheckCircle2, 
  Sparkles
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';

export const ProductDetails: React.FC = () => {
  const productId = useParams<{ productId: string }>().productId;
  const navigate = useNavigate();
  const { getProductTelemetry } = useApp();

  const [selectedRange, setSelectedRange] = useState<'1H' | '6H' | '1D' | '1W' | '1M'>('1D');

  const data = getProductTelemetry(productId || 'YGS-FD-000124');
  const { product, device, history } = data;

  // Chart dataset tailored for the selected range
  const chartData = history && history.length > 0 ? history : [
    { time: '12 AM', temp: 3.8, humidity: 64, gas: 110 },
    { time: '6 AM', temp: 4.0, humidity: 63, gas: 115 },
    { time: '12 PM', temp: 4.5, humidity: 60, gas: 125 },
    { time: '6 PM', temp: 4.2, humidity: 62, gas: 120 },
    { time: '12 AM', temp: 4.1, humidity: 62, gas: 118 },
  ];

  const currentTemp = device?.temperature ?? 4.2;
  const currentHumidity = device?.humidity ?? 62;
  const currentGas = device?.mq135_raw ?? 120;

  return (
    <div className="space-y-4 pb-8 select-none text-[#edeff2]">
      {/* Top Bar */}
      <div className="flex items-center justify-between pt-1">
        <button
          onClick={() => navigate(-1)}
          className="w-10 h-10 rounded-2xl bg-white/5 border border-white/10 text-white flex items-center justify-center shadow-xs hover:bg-white/10 transition-colors cursor-pointer"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <h1 className="text-sm font-black tracking-widest text-slate-400 uppercase font-mono">
          Live Data
        </h1>

        {/* Live status badge */}
        <div className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[#21c55d] text-xs font-black flex items-center gap-1.5 shadow-xs">
          <span className="w-1.5 h-1.5 rounded-full bg-[#21c55d] animate-pulse" />
          <span>LIVE</span>
        </div>
      </div>

      {/* Product Overview Card */}
      <div className="w-full rounded-3xl bg-[#141416] border border-white/5 p-4 shadow-xs flex items-center gap-4">
        <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-2xl shadow-inner shrink-0">
          🥗
        </div>

        <div className="flex-1 overflow-hidden space-y-1">
          <h2 className="text-sm font-black text-white truncate">
            {product?.name || 'Organic Lettuce'}
          </h2>
          <p className="text-[10px] text-slate-500 font-mono font-bold truncate">
            TAG ID: {product?.batchNumber || 'FRX20250316001'}
          </p>
          
          {/* Status Badges */}
          <div className="flex items-center gap-1.5 pt-0.5 flex-wrap">
            <span className="px-2 py-0.5 rounded-full text-[9px] font-black bg-emerald-500/15 text-[#21c55d] border border-emerald-500/25">
              FRESH
            </span>
            <span className="px-2 py-0.5 rounded-full text-[9px] font-black bg-emerald-500/15 text-[#21c55d] border border-emerald-500/25">
              SAFE
            </span>
          </div>
        </div>
      </div>

      {/* 3 Stat Boxes in a row */}
      <div className="grid grid-cols-3 gap-2.5">
        {/* 1. Temperature */}
        <div className="p-3.5 rounded-2xl bg-[#141416] border border-white/5 shadow-xs flex flex-col justify-between h-28">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[9px] font-mono font-extrabold uppercase text-slate-500">Temp</span>
            <Thermometer className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-base font-black text-white leading-none mt-1">{currentTemp}°C</p>
          <div className="mt-1">
            <span className="px-2 py-0.5 rounded-lg text-[8px] font-black bg-emerald-500/10 text-[#21c55d] border border-emerald-500/15 block text-center uppercase tracking-wider">
              Optimal
            </span>
          </div>
        </div>

        {/* 2. Humidity */}
        <div className="p-3.5 rounded-2xl bg-[#141416] border border-white/5 shadow-xs flex flex-col justify-between h-28">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[9px] font-mono font-extrabold uppercase text-slate-500">Humid</span>
            <Droplets className="w-4 h-4 text-sky-400" />
          </div>
          <p className="text-base font-black text-white leading-none mt-1">{currentHumidity}%</p>
          <div className="mt-1">
            <span className="px-2 py-0.5 rounded-lg text-[8px] font-black bg-emerald-500/10 text-[#21c55d] border border-emerald-500/15 block text-center uppercase tracking-wider">
              Normal
            </span>
          </div>
        </div>

        {/* 3. Gas Level */}
        <div className="p-3.5 rounded-2xl bg-[#141416] border border-white/5 shadow-xs flex flex-col justify-between h-28">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[9px] font-mono font-extrabold uppercase text-slate-500">Gas</span>
            <Wind className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-base font-black text-white leading-none mt-1">{currentGas} <span className="text-[9px] font-normal text-slate-500">ppm</span></p>
          <div className="mt-1">
            <span className="px-2 py-0.5 rounded-lg text-[8px] font-black bg-emerald-500/10 text-[#21c55d] border border-emerald-500/15 block text-center uppercase tracking-wider">
              Safe
            </span>
          </div>
        </div>
      </div>

      {/* Info Row: Last Updated & Location */}
      <div className="w-full rounded-2xl bg-[#141416] border border-white/5 p-3.5 shadow-xs flex items-center justify-between text-[11px] font-bold text-slate-400">
        <div className="flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5 text-slate-500" />
          <span>Last Check: <strong className="text-white font-black">10:24 AM</strong></span>
        </div>
        <div className="flex items-center gap-1 text-[#21c55d] font-black">
          <MapPin className="w-3.5 h-3.5" />
          <span className="uppercase font-mono">Cold Storage A</span>
        </div>
      </div>

      {/* Chart Section: Sensor Data (Last 24 Hours) */}
      <div className="w-full rounded-3xl bg-[#141416] border border-white/5 p-4 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-black text-white uppercase tracking-wider">
            SENSOR CURVES
          </h3>
          
          {/* Timeframe pill tabs */}
          <div className="flex items-center gap-1 bg-[#0b0b0c] p-1 rounded-xl border border-white/5">
            {(['1H', '6H', '1D', '1W', '1M'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setSelectedRange(tab)}
                className={`px-2 py-0.5 rounded-lg text-[9px] font-mono font-extrabold tracking-wide transition-all cursor-pointer ${
                  selectedRange === tab 
                    ? 'bg-[#21c55d] text-[#0b0b0c] font-black shadow-xs' 
                    : 'text-slate-500 hover:text-white'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center justify-center gap-4 text-[9px] font-bold text-slate-500 pt-1 uppercase tracking-wide">
          <div className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            <span>Temp</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-sky-400" />
            <span>Humidity</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[#21c55d]" />
            <span>Gas</span>
          </div>
        </div>

        {/* Recharts multi-line chart */}
        <div className="w-full h-44 pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.03)" vertical={false} />
              <XAxis 
                dataKey="time" 
                tick={{ fontSize: 9, fill: '#64748b', fontFamily: 'monospace' }} 
                axisLine={false} 
                tickLine={false} 
              />
              <YAxis 
                domain={[0, 200]} 
                ticks={[0, 50, 100, 150, 200]} 
                tick={{ fontSize: 9, fill: '#64748b', fontFamily: 'monospace' }} 
                axisLine={false} 
                tickLine={false} 
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#141416', 
                  borderRadius: '16px', 
                  color: '#fff', 
                  fontSize: '10px',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  boxShadow: '0 10px 25px rgba(0,0,0,0.5)'
                }} 
              />
              <Line 
                type="monotone" 
                dataKey="temp" 
                stroke="#f59e0b" 
                strokeWidth={2.5} 
                dot={{ r: 2, fill: '#f59e0b' }} 
              />
              <Line 
                type="monotone" 
                dataKey="humidity" 
                stroke="#38bdf8" 
                strokeWidth={2.5} 
                dot={{ r: 2, fill: '#38bdf8' }} 
              />
              <Line 
                type="monotone" 
                dataKey="gas" 
                stroke="#21c55d" 
                strokeWidth={2.5} 
                dot={{ r: 2, fill: '#21c55d' }} 
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recommendation Card */}
      <div className="w-full rounded-3xl bg-[#21c55d]/10 border border-[#21c55d]/20 p-4 shadow-xs flex items-center gap-3.5">
        <div className="w-11 h-11 rounded-2xl bg-[#21c55d] text-[#0b0b0c] flex items-center justify-center shrink-0 shadow-md">
          <CheckCircle2 className="w-5 h-5 stroke-[2.5px]" />
        </div>
        <div>
          <h4 className="text-xs font-black text-white uppercase tracking-wider">
            Telemetry Optimal
          </h4>
          <p className="text-[11px] text-slate-400 font-semibold">
            This food package is fully fresh and ready for consumption.
          </p>
        </div>
      </div>
    </div>
  );
};

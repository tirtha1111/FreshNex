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
  AlertTriangle,
  Radio,
  Sparkles,
  Share2
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
  const { productId } = useParams<{ productId: string }>();
  const navigate = useNavigate();
  const { getProductTelemetry } = useApp();

  const [selectedRange, setSelectedRange] = useState<'1H' | '6H' | '1D' | '1W' | '1M'>('1D');

  const data = getProductTelemetry(productId || 'YGS-FD-000124');
  const { product, device, history } = data;

  // Chart dataset tailored for the selected range matching Screen 7
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
    <div className="space-y-4 pb-6 select-none">
      {/* Top Bar (matching Screen 7) */}
      <div className="flex items-center justify-between pt-1">
        <button
          onClick={() => navigate(-1)}
          className="w-10 h-10 rounded-2xl bg-white border border-slate-200 text-[#082A52] flex items-center justify-center shadow-xs hover:bg-slate-50 transition-colors cursor-pointer"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>

        <h1 className="text-base font-black text-[#082A52] tracking-tight">
          Live Data
        </h1>

        {/* Live status badge (Screen 7 green pill with pulsing dot) */}
        <div className="px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-[#19A463] text-xs font-black flex items-center gap-1.5 shadow-xs">
          <span className="w-2 h-2 rounded-full bg-[#19A463] animate-pulse" />
          <span>Live</span>
        </div>
      </div>

      {/* Product Overview Card (matching Screen 7) */}
      <div className="w-full rounded-3xl bg-white border border-slate-200/90 p-4 shadow-xs flex items-center gap-4">
        {/* Organic Lettuce thumbnail */}
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-100 to-teal-100 border border-emerald-200 flex items-center justify-center text-3xl shadow-inner shrink-0">
          🥗
        </div>

        <div className="flex-1 overflow-hidden space-y-1">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-black text-[#082A52] truncate">
              {product?.name || 'Organic Lettuce'}
            </h2>
          </div>
          <p className="text-xs text-slate-400 font-semibold truncate">
            Batch: {product?.batchNumber || 'FRX20250316001'}
          </p>
          
          {/* Status Badges */}
          <div className="flex items-center gap-1.5 pt-0.5 flex-wrap">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-50 text-[#19A463] border border-emerald-200">
              Fresh
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-50 text-[#19A463] border border-emerald-200">
              Good for consumption
            </span>
          </div>
        </div>
      </div>

      {/* 3 Stat Boxes in a row (matching Screen 7) */}
      <div className="grid grid-cols-3 gap-2.5">
        {/* 1. Temperature */}
        <div className="p-3 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-extrabold uppercase text-slate-400">Temp</span>
            <Thermometer className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-lg font-black text-[#082A52]">{currentTemp}°C</p>
          <div className="mt-1">
            <span className="px-2 py-0.5 rounded-full text-[9px] font-black bg-emerald-50 text-[#19A463] border border-emerald-100 block text-center">
              Optimal
            </span>
          </div>
        </div>

        {/* 2. Humidity */}
        <div className="p-3 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-extrabold uppercase text-slate-400">Humidity</span>
            <Droplets className="w-4 h-4 text-[#1267D6]" />
          </div>
          <p className="text-lg font-black text-[#082A52]">{currentHumidity}%</p>
          <div className="mt-1">
            <span className="px-2 py-0.5 rounded-full text-[9px] font-black bg-emerald-50 text-[#19A463] border border-emerald-100 block text-center">
              Normal
            </span>
          </div>
        </div>

        {/* 3. Gas Level */}
        <div className="p-3 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-extrabold uppercase text-slate-400">Gas Level</span>
            <Wind className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-lg font-black text-[#082A52]">{currentGas} <span className="text-[10px] font-normal text-slate-400">ppm</span></p>
          <div className="mt-1">
            <span className="px-2 py-0.5 rounded-full text-[9px] font-black bg-emerald-50 text-[#19A463] border border-emerald-100 block text-center">
              Normal
            </span>
          </div>
        </div>
      </div>

      {/* Info Row: Last Updated & Location (matching Screen 7) */}
      <div className="w-full rounded-2xl bg-white border border-slate-200/80 p-3 shadow-xs flex items-center justify-between text-xs font-semibold text-slate-600">
        <div className="flex items-center gap-1.5">
          <Clock className="w-4 h-4 text-slate-400" />
          <span>Last Updated: <strong className="text-[#082A52]">Mar 16, 2025 10:24 AM</strong></span>
        </div>
        <div className="flex items-center gap-1 text-[#1267D6] font-bold">
          <MapPin className="w-4 h-4 text-[#1267D6]" />
          <span>Cold Storage A</span>
        </div>
      </div>

      {/* Chart Section: Sensor Data (Last 24 Hours) (matching Screen 7) */}
      <div className="w-full rounded-3xl bg-white border border-slate-200/90 p-4 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-black text-[#082A52]">
            Sensor Data (Last 24 Hours)
          </h3>
          
          {/* Timeframe pill tabs */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
            {(['1H', '6H', '1D', '1W', '1M'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setSelectedRange(tab)}
                className={`px-2 py-0.5 rounded-lg text-[10px] font-black transition-all cursor-pointer ${
                  selectedRange === tab 
                    ? 'bg-[#1267D6] text-white shadow-xs' 
                    : 'text-slate-500 hover:text-[#082A52]'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center justify-center gap-4 text-[10px] font-bold text-slate-500 pt-1">
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            <span>Temperature (°C)</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-[#1267D6]" />
            <span>Humidity (%)</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-[#19A463]" />
            <span>Gas Level (ppm)</span>
          </div>
        </div>

        {/* Recharts multi-line chart */}
        <div className="w-full h-44 pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis 
                dataKey="time" 
                tick={{ fontSize: 10, fill: '#94a3b8' }} 
                axisLine={false} 
                tickLine={false} 
              />
              <YAxis 
                domain={[0, 200]} 
                ticks={[0, 50, 100, 150, 200]} 
                tick={{ fontSize: 10, fill: '#94a3b8' }} 
                axisLine={false} 
                tickLine={false} 
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#082A52', 
                  borderRadius: '12px', 
                  color: '#fff', 
                  fontSize: '11px',
                  border: 'none',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                }} 
              />
              <Line 
                type="monotone" 
                dataKey="temp" 
                stroke="#f59e0b" 
                strokeWidth={2.5} 
                dot={{ r: 3, fill: '#f59e0b' }} 
              />
              <Line 
                type="monotone" 
                dataKey="humidity" 
                stroke="#1267D6" 
                strokeWidth={2.5} 
                dot={{ r: 3, fill: '#1267D6' }} 
              />
              <Line 
                type="monotone" 
                dataKey="gas" 
                stroke="#10b981" 
                strokeWidth={2.5} 
                dot={{ r: 3, fill: '#10b981' }} 
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recommendation Card at Bottom (matching Screen 7) */}
      <div className="w-full rounded-3xl bg-emerald-50 border border-emerald-200 p-4 shadow-xs flex items-center gap-3.5">
        <div className="w-12 h-12 rounded-2xl bg-[#19A463] text-white flex items-center justify-center shrink-0 shadow-md shadow-emerald-500/20">
          <Leaf className="w-6 h-6" />
        </div>
        <div>
          <h4 className="text-sm font-black text-[#082A52]">
            Everything looks good!
          </h4>
          <p className="text-xs text-slate-600 font-semibold">
            This food item is fresh and safe.
          </p>
        </div>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  PieChart, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { 
  BarChart3, 
  Calendar, 
  Clock, 
  Sparkles, 
  TrendingUp, 
  Cpu, 
  AlertTriangle 
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { calculateFreshness } from '../utils/freshnessEngine';
import { EmptyState } from './UIComponents';

export const Analytics: React.FC = () => {
  const { products, history, alerts, isDemoMode, loadDemoDataset } = useApp();
  const [timeFilter, setTimeFilter] = useState<'1h' | '24h' | '7d' | '30d'>('7d');

  // Aggregate all history data into a timeline
  const allHistoryReadings: any[] = [];
  Object.keys(history).forEach(productId => {
    const readings = history[productId] || [];
    readings.forEach(r => {
      allHistoryReadings.push({
        ...r,
        productName: products.find(p => p.id === productId)?.name || 'Unknown Product'
      });
    });
  });

  // Sort history ascending for time charts
  allHistoryReadings.sort((a, b) => a.timestamp - b.timestamp);

  // Compute Freshness Distribution
  let freshCount = 0;
  let warningCount = 0;
  let unsafeCount = 0;

  products.forEach(p => {
    // Take the latest history reading or simulate
    const productReadings = history[p.id] || [];
    const latestReading = productReadings[0] || null;
    const evaluation = calculateFreshness(p, latestReading);
    if (evaluation.status === 'Fresh') freshCount++;
    else if (evaluation.status === 'Warning') warningCount++;
    else unsafeCount++;
  });

  const freshnessData = [
    { name: 'Fresh (Optimal)', value: freshCount, color: '#10b981' },
    { name: 'Warning (Caution)', value: warningCount, color: '#f59e0b' },
    { name: 'Unsafe (Critical)', value: unsafeCount, color: '#f43f5e' }
  ].filter(d => d.value > 0);

  // Fallback if empty to draw a complete circle
  if (freshnessData.length === 0) {
    freshnessData.push({ name: 'No Registered Data', value: 1, color: '#cbd5e1' });
  }

  // Generate Temperature & Humidity chart data over the last N records
  const timelineData = allHistoryReadings.slice(-15).map(r => ({
    time: new Date(r.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    temperature: r.temperature,
    humidity: r.humidity,
    gasLevel: r.gasLevel,
    product: r.productName
  }));

  // Generate Alert frequency chart data over last 5 days
  const alertsByDate: Record<string, number> = {};
  alerts.forEach(a => {
    const dateStr = new Date(a.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric' });
    alertsByDate[dateStr] = (alertsByDate[dateStr] || 0) + 1;
  });

  const alertChartData = Object.keys(alertsByDate).map(key => ({
    date: key,
    count: alertsByDate[key]
  })).slice(-5);

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-3">
        <div>
          <h2 className="text-xl font-black text-slate-950 tracking-tight flex items-center gap-2">
            <BarChart3 className="w-5.5 h-5.5 text-[#FF6A00]" />
            Food-Tech Analytics Center
          </h2>
          <p className="text-xs text-slate-500">Aggregate micro-climate profiles and batch degradation analysis logs.</p>
        </div>

        {/* Time filters */}
        <div className="flex items-center gap-1.5 bg-white border border-slate-100 p-1 rounded-xl">
          {(['1h', '24h', '7d', '30d'] as const).map(f => (
            <button
              key={f}
              onClick={() => setTimeFilter(f)}
              className={`px-3 py-1 rounded-lg text-[11px] font-bold uppercase transition-all cursor-pointer ${
                timeFilter === f 
                  ? 'bg-slate-900 text-white shadow-sm' 
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              {f === '1h' ? '1 Hour' : f === '24h' ? '24 Hours' : f === '7d' ? '7 Days' : '30 Days'}
            </button>
          ))}
        </div>
      </div>

      {allHistoryReadings.length === 0 ? (
        <EmptyState
          title="Analytical Metrics Empty"
          description="A minimum of 1 telemetry reading must be recorded by the ESP32 node network to construct quality graphs."
          icon={BarChart3}
          actionLabel="Load Simulated Datasets"
          onAction={loadDemoDataset}
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* TEMPERATURE AND HUMIDITY OVER TIME */}
          <div className="bg-white border border-slate-100 p-5 rounded-2xl shadow-sm lg:col-span-2 space-y-4">
            <div>
              <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">Temperature & Humidity Timeline</h3>
              <p className="text-[10px] text-slate-400">Fluctuations across active tracking sensors.</p>
            </div>
            
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={timelineData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="time" stroke="#94a3b8" fontSize={9} />
                  <YAxis stroke="#94a3b8" fontSize={9} />
                  <Tooltip contentStyle={{ fontSize: '12px', borderRadius: '12px' }} />
                  <Legend wrapperStyle={{ fontSize: '11px' }} />
                  <Line type="monotone" dataKey="temperature" name="Temp (°C)" stroke="#0ea5e9" strokeWidth={2.5} activeDot={{ r: 6 }} />
                  <Line type="monotone" dataKey="humidity" name="Humidity (%)" stroke="#10b981" strokeWidth={2.5} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* FRESHNESS RATIO (PIE) */}
          <div className="bg-white border border-slate-100 p-5 rounded-2xl shadow-sm flex flex-col justify-between">
            <div>
              <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">Freshness Distribution</h3>
              <p className="text-[10px] text-slate-400">Ratio of stored foods currently in warning/unsafe zones.</p>
            </div>

            <div className="h-44 flex items-center justify-center relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={freshnessData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={70}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {freshnessData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ fontSize: '11px' }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute flex flex-col items-center">
                <span className="text-2xl font-black text-slate-800 leading-none">{products.length}</span>
                <span className="text-[9px] font-bold text-slate-400 uppercase mt-0.5">Total items</span>
              </div>
            </div>

            {/* Legend info */}
            <div className="space-y-1 pt-2 border-t border-slate-50">
              {freshnessData.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between text-xs text-slate-600 font-semibold">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                    <span>{item.name}</span>
                  </div>
                  <span>{item.value} items</span>
                </div>
              ))}
            </div>
          </div>

          {/* GAS DECOMPOSITION LEVEL LOGS (AREA) */}
          <div className="bg-white border border-slate-100 p-5 rounded-2xl shadow-sm lg:col-span-2 space-y-4">
            <div>
              <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">MQ Volatile Organic Gases</h3>
              <p className="text-[10px] text-slate-400">PPM indexes indicative of organic composition outgassing.</p>
            </div>

            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={timelineData}>
                  <defs>
                    <linearGradient id="colorGasGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.25}/>
                      <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="time" stroke="#94a3b8" fontSize={9} />
                  <YAxis stroke="#94a3b8" fontSize={9} />
                  <Tooltip contentStyle={{ fontSize: '11px', borderRadius: '12px' }} />
                  <Area type="monotone" dataKey="gasLevel" name="MQ Organic Gas (ppm)" stroke="#f43f5e" fillOpacity={1} fill="url(#colorGasGrad)" strokeWidth={2.5} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* ALERTS FREQUENCY (BAR) */}
          <div className="bg-white border border-slate-100 p-5 rounded-2xl shadow-sm space-y-4">
            <div>
              <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">Alert Frequency</h3>
              <p className="text-[10px] text-slate-400">Total environmental spikes logged per calendar day.</p>
            </div>

            <div className="h-44">
              {alertChartData.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center text-slate-300 space-y-1">
                  <AlertTriangle className="w-5 h-5 text-slate-300" />
                  <span className="text-[10px] font-bold uppercase text-slate-400">No Alerts Recorded</span>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={alertChartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="date" stroke="#94a3b8" fontSize={9} />
                    <YAxis stroke="#94a3b8" fontSize={9} allowDecimals={false} />
                    <Tooltip contentStyle={{ fontSize: '11px' }} />
                    <Bar dataKey="count" name="Alert Count" fill="#e11d48" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>

            <div className="pt-2 border-t border-slate-50 text-[10px] text-slate-400 font-semibold flex items-center justify-between">
              <span>Sync Mode: Real-time RTDB</span>
              <span>Total alerts logged: {alerts.length}</span>
            </div>
          </div>

        </div>
      )}

    </div>
  );
};

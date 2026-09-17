import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Activity, 
  Search, 
  Filter, 
  Thermometer, 
  Droplets, 
  Gauge, 
  ArrowRight,
  ShieldCheck,
  AlertTriangle,
  Skull,
  HelpCircle,
  Eye
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { calculateFreshness } from '../utils/freshnessEngine';
import { FreshnessBadge, EmptyState } from './UIComponents';

export const LiveMonitoring: React.FC = () => {
  const navigate = useNavigate();
  const { products, liveReadings, isDemoMode } = useApp();

  const [statusFilter, setStatusFilter] = useState<'All' | 'Fresh' | 'Warning' | 'Unsafe'>('All');
  const [searchTerm, setSearchTerm] = useState('');

  // Process data list
  const activeMonitorData = products.map(p => {
    const reading = liveReadings[p.id] || null;
    const freshness = calculateFreshness(p, reading);
    return {
      product: p,
      reading,
      freshness
    };
  });

  // Filter list
  const filteredData = activeMonitorData.filter(item => {
    const matchesSearch = item.product.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          item.product.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          item.product.batchId.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'All' || item.freshness.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-3">
        <div>
          <h2 className="text-xl font-black text-slate-950 tracking-tight flex items-center gap-2">
            <Activity className="w-5.5 h-5.5 text-sky-500 animate-pulse" />
            Live Monitoring Console
          </h2>
          <p className="text-xs text-slate-500">Real-time telemetry stream synchronized with physical ESP32 wireless sensor boards.</p>
        </div>

        {isDemoMode && (
          <span className="text-[10px] font-extrabold bg-sky-50 border border-sky-100 text-sky-700 px-3 py-1.5 rounded-xl uppercase tracking-wider">
            ESP32 Telemetry Simulation Active (4s)
          </span>
        )}
      </div>

      {/* -----------------------------------------------------------------
          FILTERS ROW
         ----------------------------------------------------------------- */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-white border border-slate-100 p-4 rounded-2xl shadow-sm">
        
        {/* Freshness Status Filter Pills */}
        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto py-1">
          <button
            onClick={() => setStatusFilter('All')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              statusFilter === 'All' 
                ? 'bg-slate-900 text-white' 
                : 'bg-slate-50 border border-slate-100 text-slate-500 hover:text-slate-800'
            }`}
          >
            All Nodes ({activeMonitorData.length})
          </button>

          <button
            onClick={() => setStatusFilter('Fresh')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              statusFilter === 'Fresh' 
                ? 'bg-emerald-500 text-white' 
                : 'bg-slate-50 border border-slate-100 text-slate-500 hover:text-emerald-600'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            Fresh ({activeMonitorData.filter(i => i.freshness.status === 'Fresh').length})
          </button>

          <button
            onClick={() => setStatusFilter('Warning')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              statusFilter === 'Warning' 
                ? 'bg-amber-500 text-white shadow-sm shadow-amber-200' 
                : 'bg-slate-50 border border-slate-100 text-slate-500 hover:text-amber-600'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            Warnings ({activeMonitorData.filter(i => i.freshness.status === 'Warning').length})
          </button>

          <button
            onClick={() => setStatusFilter('Unsafe')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              statusFilter === 'Unsafe' 
                ? 'bg-rose-500 text-white shadow-sm shadow-rose-200' 
                : 'bg-slate-50 border border-slate-100 text-slate-500 hover:text-rose-600'
            }`}
          >
            <Skull className="w-3.5 h-3.5" />
            At Risk ({activeMonitorData.filter(i => i.freshness.status === 'Unsafe').length})
          </button>
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search active sensor code..."
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-100 rounded-xl focus:outline-none focus:border-sky-500 font-semibold"
          />
        </div>

      </div>

      {/* -----------------------------------------------------------------
          DATA LISTING WORKSPACE (Responsive Table/List)
         ----------------------------------------------------------------- */}
      {filteredData.length === 0 ? (
        <EmptyState
          title="No Matching Sensors"
          description="Try clearing your search filter or adding new food batches to populate active database nodes."
          icon={Activity}
        />
      ) : (
        <div className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm">
          
          {/* Desktop Table View */}
          <div className="hidden lg:block overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-slate-400">
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-wider">Product Node</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-wider">Product ID</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-wider">IoT Device</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-wider text-center">Temp (°C)</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-wider text-center">Hum (%)</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-wider text-center">MQ Gas (ppm)</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-wider">Last Sync</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-wider text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredData.map(({ product, reading, freshness }) => (
                  <tr key={product.id} className="hover:bg-slate-50/50 transition-all">
                    
                    {/* Product cell */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {product.imageUrl ? (
                          <img 
                            src={product.imageUrl} 
                            alt={product.name} 
                            className="w-10 h-10 rounded-xl object-cover"
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-700 font-extrabold text-sm flex items-center justify-center border border-sky-100">
                            {product.name.charAt(0)}
                          </div>
                        )}
                        <div>
                          <p className="text-sm font-black text-slate-900">{product.name}</p>
                          <p className="text-[10px] text-slate-400 font-bold uppercase mt-0.5">{product.category}</p>
                        </div>
                      </div>
                    </td>

                    {/* ID & Batch */}
                    <td className="px-6 py-4 text-xs">
                      <p className="font-semibold text-slate-800">{product.id}</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">Batch: {product.batchId}</p>
                    </td>

                    {/* Device */}
                    <td className="px-6 py-4 text-xs font-bold text-slate-500">
                      {product.deviceId}
                    </td>

                    {/* Temp */}
                    <td className="px-6 py-4 text-center">
                      {reading ? (
                        <div className="inline-flex items-center gap-1 font-extrabold text-sm text-slate-800 bg-slate-50 px-2 py-1 rounded-lg">
                          <Thermometer className="w-3.5 h-3.5 text-sky-500" />
                          <span>{reading.temperature}°C</span>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-300 italic">Offline</span>
                      )}
                    </td>

                    {/* Humidity */}
                    <td className="px-6 py-4 text-center">
                      {reading ? (
                        <div className="inline-flex items-center gap-1 font-extrabold text-sm text-slate-800 bg-slate-50 px-2 py-1 rounded-lg">
                          <Droplets className="w-3.5 h-3.5 text-sky-500" />
                          <span>{reading.humidity}%</span>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-300 italic">Offline</span>
                      )}
                    </td>

                    {/* Gas/Air Quality */}
                    <td className="px-6 py-4 text-center">
                      {reading ? (
                        <div className="inline-flex items-center gap-1 font-extrabold text-sm text-slate-800 bg-slate-50 px-2 py-1 rounded-lg">
                          <Gauge className="w-3.5 h-3.5 text-sky-500" />
                          <span>{reading.gasLevel} <span className="text-[10px] font-normal text-slate-400">ppm</span></span>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-300 italic">Offline</span>
                      )}
                    </td>

                    {/* Status Badge */}
                    <td className="px-6 py-4">
                      <FreshnessBadge status={freshness.status} />
                    </td>

                    {/* Last Sync */}
                    <td className="px-6 py-4 text-xs text-slate-400 font-semibold">
                      {reading ? new Date(reading.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : 'Never'}
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => navigate(`/products/${product.id}`)}
                        className="px-3 py-1.5 bg-slate-100 hover:bg-sky-50 text-slate-600 hover:text-sky-600 font-bold text-xs rounded-xl transition-all flex items-center gap-1.5 ml-auto cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Inspect</span>
                      </button>
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Grid View (Fitted for small screens) */}
          <div className="lg:hidden divide-y divide-slate-100">
            {filteredData.map(({ product, reading, freshness }) => (
              <div key={product.id} className="p-4 space-y-3 hover:bg-slate-50/50 transition-all">
                
                {/* Header metadata */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-sky-50 text-sky-700 font-extrabold text-xs flex items-center justify-center">
                      {product.name.charAt(0)}
                    </div>
                    <div>
                      <h4 className="text-sm font-black text-slate-900">{product.name}</h4>
                      <p className="text-[10px] text-slate-400 font-bold">ID: {product.id} • Batch: {product.batchId}</p>
                    </div>
                  </div>
                  <FreshnessBadge status={freshness.status} />
                </div>

                {/* Live telemetry row */}
                {reading ? (
                  <div className="grid grid-cols-3 gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-50 text-center">
                    <div className="space-y-0.5">
                      <span className="text-[9px] text-slate-400 font-bold block uppercase">Temp</span>
                      <span className="text-xs font-black text-slate-800">{reading.temperature}°C</span>
                    </div>
                    <div className="space-y-0.5">
                      <span className="text-[9px] text-slate-400 font-bold block uppercase">Humidity</span>
                      <span className="text-xs font-black text-slate-800">{reading.humidity}%</span>
                    </div>
                    <div className="space-y-0.5">
                      <span className="text-[9px] text-slate-400 font-bold block uppercase">Gas MQ</span>
                      <span className="text-xs font-black text-slate-800">{reading.gasLevel} ppm</span>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-2 bg-slate-50 rounded-xl">
                    <span className="text-xs text-slate-300 italic">Edge node offline</span>
                  </div>
                )}

                {/* Footer buttons */}
                <div className="flex items-center justify-between pt-1 text-slate-400 text-[10px] font-bold">
                  <span>Synced {reading ? new Date(reading.timestamp).toLocaleTimeString() : 'Never'}</span>
                  <button
                    onClick={() => navigate(`/products/${product.id}`)}
                    className="flex items-center gap-1 text-sky-600 font-bold"
                  >
                    <span>Inspect</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

              </div>
            ))}
          </div>

        </div>
      )}

    </div>
  );
};

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Activity, 
  Search, 
  Thermometer, 
  Droplets, 
  Gauge, 
  ArrowRight,
  ShieldCheck, 
  AlertTriangle, 
  Skull, 
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
    <div className="space-y-6 animate-fade-in text-[#FDF8F5]">
      
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#FF6A00]/20 pb-4">
        <div>
          <h2 className="text-xl font-black text-[#FDF8F5] tracking-tight flex items-center gap-2">
            <Activity className="w-5.5 h-5.5 text-[#FFAA00] animate-pulse" />
            Live Monitoring Console
          </h2>
          <p className="text-xs text-[#B8A89E]">Real-time telemetry stream synchronized with physical ESP32 wireless sensor boards.</p>
        </div>

        {isDemoMode && (
          <span className="text-[10px] font-extrabold bg-[#FF6A00]/15 border border-[#FF6A00]/30 text-[#FFAA00] px-3 py-1.5 rounded-xl uppercase tracking-wider shadow-sm">
            ESP32 Telemetry Simulation Active (4s)
          </span>
        )}
      </div>

      {/* -----------------------------------------------------------------
          FILTERS ROW
         ----------------------------------------------------------------- */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between glass-card p-4 rounded-2xl border border-[#FF6A00]/25">
        
        {/* Freshness Status Filter Pills */}
        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto py-1">
          <button
            onClick={() => setStatusFilter('All')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              statusFilter === 'All' 
                ? 'bg-gradient-to-r from-[#FF6A00] to-[#FFAA00] text-[#120A05] font-extrabold shadow-lg shadow-[#FF6A00]/35' 
                : 'glass-card border border-[#FF6A00]/20 text-[#B8A89E] hover:text-white'
            }`}
          >
            All Nodes ({activeMonitorData.length})
          </button>

          <button
            onClick={() => setStatusFilter('Fresh')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              statusFilter === 'Fresh' 
                ? 'bg-emerald-500 text-[#120A05] font-extrabold shadow-lg shadow-emerald-500/35' 
                : 'glass-card border border-emerald-500/20 text-[#B8A89E] hover:text-emerald-400'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            Fresh ({activeMonitorData.filter(i => i.freshness.status === 'Fresh').length})
          </button>

          <button
            onClick={() => setStatusFilter('Warning')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              statusFilter === 'Warning' 
                ? 'bg-amber-400 text-[#120A05] font-extrabold shadow-lg shadow-amber-400/35' 
                : 'glass-card border border-amber-400/20 text-[#B8A89E] hover:text-amber-400'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            Warnings ({activeMonitorData.filter(i => i.freshness.status === 'Warning').length})
          </button>

          <button
            onClick={() => setStatusFilter('Unsafe')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              statusFilter === 'Unsafe' 
                ? 'bg-rose-500 text-white font-extrabold shadow-lg shadow-rose-500/35' 
                : 'glass-card border border-rose-500/20 text-[#B8A89E] hover:text-rose-400'
            }`}
          >
            <Skull className="w-3.5 h-3.5" />
            At Risk ({activeMonitorData.filter(i => i.freshness.status === 'Unsafe').length})
          </button>
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-[#FFAA00] absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search active sensor code..."
            className="w-full pl-9 pr-4 py-2 text-xs bg-[#1C1410] border border-[#FF6A00]/30 text-[#FDF8F5] placeholder-[#8C7A70] focus:outline-none focus:border-[#FFAA00] font-semibold rounded-xl"
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
        <div className="glass-card rounded-2xl overflow-hidden border border-[#FF6A00]/25 shadow-xl">
          
          {/* Desktop Table View */}
          <div className="hidden lg:block overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#1C120D] border-b border-[#FF6A00]/20 text-[#FFAA00]">
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
              <tbody className="divide-y divide-[#FF6A00]/10 text-[#D6C8C0]">
                {filteredData.map(({ product, reading, freshness }) => (
                  <tr key={product.id} className="hover:bg-[#FF6A00]/5 transition-all">
                    
                    {/* Product cell */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {product.image ? (
                          <img 
                            src={product.image} 
                            alt={product.name} 
                            className="w-10 h-10 rounded-xl object-cover border border-[#FF6A00]/30"
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-xl bg-[#FF6A00]/15 text-[#FFAA00] font-extrabold text-sm flex items-center justify-center border border-[#FF6A00]/30">
                            {product.name.charAt(0)}
                          </div>
                        )}
                        <div>
                          <p className="text-sm font-black text-[#FDF8F5]">{product.name}</p>
                          <p className="text-[10px] text-[#FFAA00] font-bold uppercase mt-0.5">{product.category}</p>
                        </div>
                      </div>
                    </td>

                    {/* ID & Batch */}
                    <td className="px-6 py-4 text-xs">
                      <p className="font-semibold text-[#FDF8F5]">{product.id}</p>
                      <p className="text-[10px] text-[#B8A89E] mt-0.5">Batch: {product.batchId}</p>
                    </td>

                    {/* Device */}
                    <td className="px-6 py-4 text-xs font-mono font-bold text-[#FFAA00]">
                      {product.deviceId}
                    </td>

                    {/* Temp */}
                    <td className="px-6 py-4 text-center">
                      {reading ? (
                        <div className="inline-flex items-center gap-1 font-extrabold text-sm text-[#FDF8F5] glass-card px-2.5 py-1 rounded-lg border border-[#FF6A00]/30">
                          <Thermometer className="w-3.5 h-3.5 text-[#FFAA00]" />
                          <span>{reading.temperature}°C</span>
                        </div>
                      ) : (
                        <span className="text-xs text-[#7E6A5E] italic">Offline</span>
                      )}
                    </td>

                    {/* Humidity */}
                    <td className="px-6 py-4 text-center">
                      {reading ? (
                        <div className="inline-flex items-center gap-1 font-extrabold text-sm text-[#FDF8F5] glass-card px-2.5 py-1 rounded-lg border border-[#FF6A00]/30">
                          <Droplets className="w-3.5 h-3.5 text-[#FFAA00]" />
                          <span>{reading.humidity}%</span>
                        </div>
                      ) : (
                        <span className="text-xs text-[#7E6A5E] italic">Offline</span>
                      )}
                    </td>

                    {/* Gas/Air Quality */}
                    <td className="px-6 py-4 text-center">
                      {reading ? (
                        <div className="inline-flex items-center gap-1 font-extrabold text-sm text-[#FDF8F5] glass-card px-2.5 py-1 rounded-lg border border-[#FF6A00]/30">
                          <Gauge className="w-3.5 h-3.5 text-[#FFAA00]" />
                          <span>{reading.gas} <span className="text-[10px] font-normal text-[#B8A89E]">ppm</span></span>
                        </div>
                      ) : (
                        <span className="text-xs text-[#7E6A5E] italic">Offline</span>
                      )}
                    </td>

                    {/* Status Badge */}
                    <td className="px-6 py-4">
                      <FreshnessBadge status={freshness.status} />
                    </td>

                    {/* Last Sync */}
                    <td className="px-6 py-4 text-xs text-[#B8A89E] font-mono font-semibold">
                      {reading ? new Date(reading.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : 'Never'}
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => navigate(`/products/${product.id}`)}
                        className="px-3 py-1.5 glass-card hover:bg-[#FF6A00]/20 text-[#FFAA00] font-bold text-xs rounded-xl transition-all flex items-center gap-1.5 ml-auto cursor-pointer border border-[#FF6A00]/30"
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
          <div className="lg:hidden divide-y divide-[#FF6A00]/10">
            {filteredData.map(({ product, reading, freshness }) => (
              <div key={product.id} className="p-4 space-y-3 hover:bg-[#FF6A00]/5 transition-all">
                
                {/* Header metadata */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-[#FF6A00]/15 text-[#FFAA00] font-extrabold text-xs flex items-center justify-center border border-[#FF6A00]/30">
                      {product.name.charAt(0)}
                    </div>
                    <div>
                      <h4 className="text-sm font-black text-[#FDF8F5]">{product.name}</h4>
                      <p className="text-[10px] text-[#B8A89E] font-bold">ID: {product.id} • Batch: {product.batchId}</p>
                    </div>
                  </div>
                  <FreshnessBadge status={freshness.status} />
                </div>

                {/* Live telemetry row */}
                {reading ? (
                  <div className="grid grid-cols-3 gap-2 bg-[#1A110B] p-2.5 rounded-xl border border-[#FF6A00]/20 text-center">
                    <div className="space-y-0.5">
                      <span className="text-[9px] text-[#B8A89E] font-bold block uppercase">Temp</span>
                      <span className="text-xs font-black text-[#FDF8F5]">{reading.temperature}°C</span>
                    </div>
                    <div className="space-y-0.5">
                      <span className="text-[9px] text-[#B8A89E] font-bold block uppercase">Humidity</span>
                      <span className="text-xs font-black text-[#FDF8F5]">{reading.humidity}%</span>
                    </div>
                    <div className="space-y-0.5">
                      <span className="text-[9px] text-[#B8A89E] font-bold block uppercase">Gas MQ</span>
                      <span className="text-xs font-black text-[#FDF8F5]">{reading.gas} ppm</span>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-2 bg-[#1A110B] rounded-xl border border-[#FF6A00]/20">
                    <span className="text-xs text-[#7E6A5E] italic">Edge node offline</span>
                  </div>
                )}

                {/* Footer buttons */}
                <div className="flex items-center justify-between pt-1 text-[#B8A89E] text-[10px] font-bold">
                  <span>Synced {reading ? new Date(reading.timestamp).toLocaleTimeString() : 'Never'}</span>
                  <button
                    onClick={() => navigate(`/products/${product.id}`)}
                    className="flex items-center gap-1 text-[#FFAA00] font-bold hover:underline"
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

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { 
  ChevronLeft, 
  Search, 
  Filter, 
  ChevronRight, 
  Trash2 
} from 'lucide-react';

export const HistoryPage: React.FC = () => {
  const navigate = useNavigate();
  const { scanHistory, clearScanHistory } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterTab, setFilterTab] = useState<'all' | 'fresh' | 'warning'>('all');

  // Exact dataset matching Screen 8
  const defaultItems = [
    {
      id: 'YGS-FD-000124',
      name: 'Organic Lettuce',
      date: 'Mar 16, 2025 10:24 AM',
      status: 'fresh',
      icon: '🥗',
      location: 'Cold Storage A'
    },
    {
      id: 'item-2',
      name: 'Strawberries',
      date: 'Mar 15, 2025 02:12 PM',
      status: 'fresh',
      icon: '🍓',
      location: 'Cold Storage B'
    },
    {
      id: 'item-3',
      name: 'Chicken Breast',
      date: 'Mar 14, 2025 11:05 AM',
      status: 'warning',
      icon: '🍗',
      location: 'Meat Facility 1'
    },
    {
      id: 'item-4',
      name: 'Milk',
      date: 'Mar 13, 2025 09:04 AM',
      status: 'fresh',
      icon: '🥛',
      location: 'Dairy Chiller'
    },
    {
      id: 'item-5',
      name: 'Tomatoes',
      date: 'Mar 12, 2025 01:18 PM',
      status: 'fresh',
      icon: '🍅',
      location: 'Ambient Bay 3'
    },
    {
      id: 'item-6',
      name: 'Apples',
      date: 'Mar 11, 2025 01:29 PM',
      status: 'fresh',
      icon: '🍏',
      location: 'Fruit Section C'
    },
    {
      id: 'item-7',
      name: 'Fish Fillet',
      date: 'Mar 10, 2025 10:15 AM',
      status: 'warning',
      icon: '🐟',
      location: 'Seafood Deep Freeze'
    },
  ];

  // Merge with real user scan history if present
  const allList = scanHistory.length > 0
    ? [
        ...scanHistory.map((s) => ({
          id: s.productId,
          name: s.productName,
          date: new Date(s.scannedAt).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          }),
          status: s.freshnessStatus,
          icon: s.productName.toLowerCase().includes('milk') ? '🥛' : '🥗',
          location: s.location || 'Cold Storage A'
        })),
        ...defaultItems
      ]
    : defaultItems;

  // Filter based on search and selected tab
  const filteredList = allList.filter(item => {
    const matchesSearch = 
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.date.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (!matchesSearch) return false;
    if (filterTab === 'fresh') return item.status === 'fresh';
    if (filterTab === 'warning') return item.status === 'warning' || item.status === 'spoiled';
    return true;
  });

  const freshCount = allList.filter(i => i.status === 'fresh').length;
  const warningCount = allList.filter(i => i.status === 'warning' || i.status === 'spoiled').length;

  return (
    <div className="space-y-4 pb-8 select-none text-[#edeff2]">
      {/* Top Header Bar */}
      <div className="flex items-center justify-between pt-1">
        <button
          onClick={() => navigate(-1)}
          className="w-10 h-10 rounded-2xl bg-white/5 border border-white/10 text-white flex items-center justify-center shadow-xs hover:bg-white/10 transition-colors cursor-pointer"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <h1 className="text-sm font-black tracking-widest text-slate-400 uppercase font-mono">
          Scan History
        </h1>

        <button
          onClick={clearScanHistory}
          title="Clear scan history"
          className="w-10 h-10 rounded-2xl bg-white/5 border border-white/10 text-slate-400 hover:text-red-400 flex items-center justify-center shadow-xs transition-colors cursor-pointer"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* Subtitle */}
      <p className="text-xs text-slate-500 font-semibold text-center -mt-2">
        Your past scans and IoT telemetry entries.
      </p>

      {/* Search Bar & Filter Button */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search containers or batches..."
            className="w-full h-11 bg-white/5 pl-10 pr-4 rounded-2xl text-xs font-semibold text-white border border-white/5 outline-none focus:border-[#21c55d] shadow-xs placeholder:text-slate-600"
          />
        </div>

        <button
          onClick={() => {
            const nextTab = filterTab === 'all' ? 'fresh' : filterTab === 'fresh' ? 'warning' : 'all';
            setFilterTab(nextTab);
          }}
          className="w-11 h-11 rounded-2xl bg-white/5 border border-white/10 text-white flex items-center justify-center shadow-xs hover:bg-white/10 transition-colors cursor-pointer shrink-0"
        >
          <Filter className="w-4 h-4" />
        </button>
      </div>

      {/* Category Filter Tabs */}
      <div className="flex items-center gap-1.5 p-1 bg-[#141416] rounded-2xl border border-white/5">
        <button
          onClick={() => setFilterTab('all')}
          className={`flex-1 py-2 rounded-xl text-[10px] font-mono font-black uppercase tracking-widest transition-all cursor-pointer ${
            filterTab === 'all'
              ? 'bg-[#21c55d] text-[#0b0b0c] font-black shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          ALL ({allList.length})
        </button>

        <button
          onClick={() => setFilterTab('fresh')}
          className={`flex-1 py-2 rounded-xl text-[10px] font-mono font-black uppercase tracking-widest transition-all cursor-pointer ${
            filterTab === 'fresh'
              ? 'bg-[#21c55d] text-[#0b0b0c] font-black shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          FRESH ({freshCount})
        </button>

        <button
          onClick={() => setFilterTab('warning')}
          className={`flex-1 py-2 rounded-xl text-[10px] font-mono font-black uppercase tracking-widest transition-all cursor-pointer ${
            filterTab === 'warning'
              ? 'bg-[#21c55d] text-[#0b0b0c] font-black shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          WARNING ({warningCount})
        </button>
      </div>

      {/* List Items */}
      <div className="space-y-2.5">
        {filteredList.map((item, idx) => (
          <div
            key={`${item.id}-${idx}`}
            onClick={() => navigate(`/products/${item.id}`)}
            className="w-full rounded-2xl bg-[#141416] border border-white/5 p-3.5 shadow-xs hover:border-[#21c55d]/40 hover:bg-[#141416]/80 transition-all flex items-center justify-between cursor-pointer group"
          >
            <div className="flex items-center gap-3">
              {/* Thumbnail icon */}
              <div className="w-11 h-11 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-xl shrink-0 group-hover:scale-105 transition-transform">
                {item.icon}
              </div>

              <div>
                <h3 className="text-xs font-black text-white group-hover:text-[#21c55d] transition-colors">
                  {item.name}
                </h3>
                <p className="text-[10px] text-slate-500 font-mono font-bold mt-0.5">
                  {item.date}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {item.status === 'fresh' ? (
                <span className="px-2.5 py-0.5 rounded-full text-[9px] font-mono font-black bg-emerald-500/15 text-[#21c55d] border border-emerald-500/25">
                  FRESH
                </span>
              ) : (
                <span className="px-2.5 py-0.5 rounded-full text-[9px] font-mono font-black bg-amber-500/15 text-amber-500 border border-amber-500/25">
                  WARN
                </span>
              )}
              <ChevronRight className="w-4 h-4 text-slate-500 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

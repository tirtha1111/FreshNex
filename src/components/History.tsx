import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { 
  ChevronLeft, 
  Search, 
  Filter, 
  ChevronRight, 
  Leaf, 
  AlertTriangle, 
  Clock, 
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
        ...scanHistory.map((s, idx) => ({
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
    <div className="space-y-4 pb-6 select-none">
      {/* Top Header Bar (matching Screen 8) */}
      <div className="flex items-center justify-between pt-1">
        <button
          onClick={() => navigate(-1)}
          className="w-10 h-10 rounded-2xl bg-white border border-slate-200 text-[#082A52] flex items-center justify-center shadow-xs hover:bg-slate-50 transition-colors cursor-pointer"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>

        <h1 className="text-base font-black text-[#082A52] tracking-tight">
          Scan History
        </h1>

        <button
          onClick={clearScanHistory}
          title="Clear scan history"
          className="w-10 h-10 rounded-2xl bg-white border border-slate-200 text-slate-400 hover:text-red-500 flex items-center justify-center shadow-xs transition-colors cursor-pointer"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* Subtitle */}
      <p className="text-xs text-slate-500 font-semibold text-center -mt-2">
        Your past scans and food data.
      </p>

      {/* Search Bar & Filter Button (matching Screen 8) */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search items, locations, or dates..."
            className="w-full h-11 bg-white pl-10 pr-4 rounded-2xl text-xs font-semibold text-[#082A52] border border-slate-200/90 outline-none focus:border-[#1267D6] shadow-xs placeholder:text-slate-400"
          />
        </div>

        <button
          onClick={() => {
            const nextTab = filterTab === 'all' ? 'fresh' : filterTab === 'fresh' ? 'warning' : 'all';
            setFilterTab(nextTab);
          }}
          className="w-11 h-11 rounded-2xl bg-white border border-slate-200/90 text-[#082A52] flex items-center justify-center shadow-xs hover:bg-slate-50 transition-colors cursor-pointer shrink-0"
        >
          <Filter className="w-4 h-4" />
        </button>
      </div>

      {/* Category Filter Tabs: All (24), Fresh (18), Warning (4) (matching Screen 8) */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setFilterTab('all')}
          className={`px-4 py-2 rounded-2xl text-xs font-black transition-all cursor-pointer ${
            filterTab === 'all'
              ? 'bg-[#1267D6] text-white shadow-md shadow-sky-500/20'
              : 'bg-white text-slate-500 border border-slate-200/80 hover:bg-slate-50'
          }`}
        >
          All ({allList.length})
        </button>

        <button
          onClick={() => setFilterTab('fresh')}
          className={`px-4 py-2 rounded-2xl text-xs font-black transition-all cursor-pointer ${
            filterTab === 'fresh'
              ? 'bg-[#1267D6] text-white shadow-md shadow-sky-500/20'
              : 'bg-white text-slate-500 border border-slate-200/80 hover:bg-slate-50'
          }`}
        >
          Fresh ({freshCount})
        </button>

        <button
          onClick={() => setFilterTab('warning')}
          className={`px-4 py-2 rounded-2xl text-xs font-black transition-all cursor-pointer ${
            filterTab === 'warning'
              ? 'bg-[#1267D6] text-white shadow-md shadow-sky-500/20'
              : 'bg-white text-slate-500 border border-slate-200/80 hover:bg-slate-50'
          }`}
        >
          Warning ({warningCount})
        </button>
      </div>

      {/* List Items (matching Screen 8) */}
      <div className="space-y-2.5">
        {filteredList.map((item, idx) => (
          <div
            key={`${item.id}-${idx}`}
            onClick={() => navigate(`/products/${item.id}`)}
            className="w-full rounded-2xl bg-white border border-slate-200/80 p-3.5 shadow-xs hover:border-[#1267D6]/40 hover:shadow-md transition-all flex items-center justify-between cursor-pointer group"
          >
            <div className="flex items-center gap-3">
              {/* Thumbnail icon */}
              <div className="w-11 h-11 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-xl shrink-0">
                {item.icon}
              </div>

              <div>
                <h3 className="text-xs font-black text-[#082A52] group-hover:text-[#1267D6] transition-colors">
                  {item.name}
                </h3>
                <p className="text-[10px] text-slate-400 font-semibold mt-0.5">
                  {item.date}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {item.status === 'fresh' ? (
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-50 text-[#19A463] border border-emerald-200">
                  Fresh
                </span>
              ) : (
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-amber-50 text-amber-600 border border-amber-200">
                  Warning
                </span>
              )}
              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

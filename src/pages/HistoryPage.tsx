import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, 
  Calendar, 
  Trash2, 
  ExternalLink, 
  Filter, 
  QrCode, 
  Sparkles,
  Download,
  ShieldCheck
} from 'lucide-react';
import { useFreshness } from '../context/FreshnessContext';
import { StatusBadge } from '../components/common/StatusBadge';

export const HistoryPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialQuery = searchParams.get('q') || '';

  const { scanHistory, deleteHistoryRecord, clearHistory, scanItem } = useFreshness();
  const [searchFilter, setSearchFilter] = useState(initialQuery);
  const [statusFilter, setStatusFilter] = useState<'all' | 'fresh' | 'at risk' | 'expired'>('all');

  const filteredHistory = scanHistory.filter((item) => {
    const matchesSearch = 
      item.itemName.toLowerCase().includes(searchFilter.toLowerCase()) ||
      item.tagId.toLowerCase().includes(searchFilter.toLowerCase());
    
    const matchesStatus = 
      statusFilter === 'all' || 
      item.status.toLowerCase() === statusFilter.toLowerCase();

    return matchesSearch && matchesStatus;
  });

  const handleInspect = async (tagId: string, itemId: string) => {
    await scanItem(tagId);
    navigate(`/live-data/${itemId}`);
  };

  const handleExportCSV = () => {
    const headers = 'Product,Tag ID,Timestamp,Score,Status,Temp,Humidity,Gas\n';
    const rows = filteredHistory.map(h => 
      `"${h.itemName}","${h.tagId}","${h.timestamp}",${h.freshnessScore},"${h.status}",${h.temperature},${h.humidity},${h.gas}`
    ).join('\n');

    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `FreshNex_Audit_Logs_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-6 select-none pb-12"
    >
      {/* Title & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#FDF8F5] tracking-tight">
            Audit History & Scanned Logs
          </h1>
          <p className="text-sm text-[#B8A89E] mt-1">
            Complete telemetric log records stored in Firebase Firestore.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            onClick={handleExportCSV}
            className="px-4 py-2 rounded-xl bg-[#261A12] hover:bg-[#302017] border border-[#3D261A] text-xs font-bold text-[#FDF8F5] flex items-center gap-1.5 transition-colors cursor-pointer shadow-md"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </motion.button>

          {scanHistory.length > 0 && (
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              onClick={clearHistory}
              className="px-4 py-2 rounded-xl bg-[#FF5A67]/10 hover:bg-[#FF5A67]/20 border border-[#FF5A67]/30 text-xs font-bold text-[#FF5A67] flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear History</span>
            </motion.button>
          )}
        </div>
      </div>

      {/* Filter and Search Controls */}
      <div className="card-solid p-4 sm:p-5 shadow-xl border border-[#FF6A00]/25 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-[#8C7A70] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            placeholder="Filter by product name, barcode or tag ID..."
            className="w-full pl-10 pr-4 py-2 bg-[#1E140E] text-xs text-[#FDF8F5] placeholder-[#8C7A70] rounded-xl border border-[#3D261A] focus:outline-none focus:border-[#FF6A00]"
          />
        </div>

        {/* Status Filter Tabs with animated pill */}
        <div className="inline-flex p-1 rounded-xl bg-[#1E140E] border border-[#3D261A] self-start md:self-auto">
          {(['all', 'fresh', 'at risk', 'expired'] as const).map((st) => {
            const active = statusFilter === st;
            const labels = { all: 'All', fresh: 'Fresh', 'at risk': 'At Risk', expired: 'Expired' };
            return (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className="relative px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer"
              >
                {active && (
                  <motion.div
                    layoutId="historyFilterPill"
                    className="absolute inset-0 bg-[#FF6A00]/20 rounded-lg border border-[#FF6A00]/40 shadow-sm"
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}
                <span className={`relative z-10 ${active ? 'text-[#FFAA00]' : 'text-[#B8A89E] hover:text-[#FDF8F5]'}`}>
                  {labels[st]}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Logs Table / Card List */}
      <div className="card-solid overflow-hidden shadow-2xl border border-[#FF6A00]/25">
        {filteredHistory.length === 0 ? (
          <div className="py-16 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-[#261A12] border border-[#3D261A] flex items-center justify-center text-[#8C7A70] mx-auto">
              <QrCode className="w-6 h-6" />
            </div>
            <p className="text-sm font-bold text-[#FDF8F5]">No matching scan records</p>
            <p className="text-xs text-[#8C7A70]">Try changing your search keywords or perform a new scan.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-[#3D261A] bg-[#1A110B] text-[#8C7A70] uppercase font-mono text-[10px] tracking-wider">
                  <th className="p-4">Product</th>
                  <th className="p-4">Tag ID</th>
                  <th className="p-4">Timestamp</th>
                  <th className="p-4">Score</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Readings</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#3D261A]">
                <AnimatePresence>
                  {filteredHistory.map((item, index) => (
                    <motion.tr
                      key={item.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      transition={{ delay: index * 0.04 }}
                      className="hover:bg-[#261A12]/40 transition-colors group"
                    >
                      <td className="p-4 font-bold text-[#FDF8F5]">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-lg bg-[#261A12] border border-[#3D261A] flex items-center justify-center text-[#FF6A00] font-bold">
                            {item.itemName.charAt(0)}
                          </div>
                          <span>{item.itemName}</span>
                        </div>
                      </td>

                      <td className="p-4 font-mono text-[#FFAA00] font-bold">
                        {item.tagId}
                      </td>

                      <td className="p-4 text-[#8C7A70]">
                        {new Date(item.timestamp).toLocaleString([], {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>

                      <td className="p-4">
                        <span className="font-black text-[#FDF8F5] text-sm">
                          {item.freshnessScore}
                        </span>
                        <span className="text-[#8C7A70] text-[10px]">/100</span>
                      </td>

                      <td className="p-4">
                        <StatusBadge status={item.status} size="sm" />
                      </td>

                      <td className="p-4 text-[#B8A89E] font-mono text-[11px]">
                        <span>{item.temperature}°C</span> •{' '}
                        <span>{item.humidity}%</span> •{' '}
                        <span>{item.gas}ppm</span>
                      </td>

                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => handleInspect(item.tagId, item.itemId)}
                            title="Inspect live telemetry"
                            className="p-1.5 rounded-lg bg-[#1E140E] hover:bg-[#302017] border border-[#3D261A] text-[#FFAA00] hover:text-[#FF6A00] transition-colors cursor-pointer"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => deleteHistoryRecord(item.id)}
                            title="Delete log entry"
                            className="p-1.5 rounded-lg bg-[#1E140E] hover:bg-[#FF5A67]/20 border border-[#3D261A] text-[#8C7A70] hover:text-[#FF5A67] transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </motion.button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        )}
      </div>
    </motion.div>
  );
};

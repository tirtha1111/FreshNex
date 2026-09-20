import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, 
  Trash2, 
  ExternalLink, 
  QrCode, 
  Download
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
      className="space-y-6 select-none pb-12 font-sans"
    >
      {/* Title & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-serif italic font-black text-[#07221A] tracking-tight">
            Audit History & Scanned Logs
          </h1>
          <p className="text-xs font-bold text-[#5C7F75] mt-1">
            Complete telemetric log records stored and audited in real-time.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            onClick={handleExportCSV}
            className="px-4 py-2.5 rounded-full bg-white hover:bg-[#F4F7F6] border border-[#13493B]/10 text-xs font-black text-[#07221A] flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm"
          >
            <Download className="w-4 h-4 text-[#20E79A]" />
            <span>Export CSV</span>
          </motion.button>

          {scanHistory.length > 0 && (
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              onClick={clearHistory}
              className="px-4 py-2.5 rounded-full bg-red-50 hover:bg-red-100 border border-red-200 text-xs font-black text-red-600 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
              <span>Clear History</span>
            </motion.button>
          )}
        </div>
      </div>

      {/* Filter and Search Controls */}
      <div className="bg-white border border-[#13493B]/10 rounded-[28px] p-4 sm:p-5 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-[#5C7F75] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            placeholder="Filter by product name, barcode or tag ID..."
            className="w-full pl-10 pr-4 py-2.5 bg-[#EBF1EF] text-xs font-semibold text-[#07221A] placeholder-[#5C7F75] rounded-xl border border-transparent focus:outline-none focus:bg-white focus:border-[#20E79A]/50 focus:ring-4 focus:ring-[#20E79A]/10 transition-all duration-200"
          />
        </div>

        {/* Status Filter Tabs with animated pill */}
        <div className="inline-flex p-1 rounded-xl bg-[#F4F7F6] border border-[#13493B]/10 self-start md:self-auto">
          {(['all', 'fresh', 'at risk', 'expired'] as const).map((st) => {
            const active = statusFilter === st;
            const labels = { all: 'All', fresh: 'Fresh', 'at risk': 'At Risk', expired: 'Expired' };
            return (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className="relative px-3.5 py-1.5 rounded-lg text-xs font-black transition-all cursor-pointer"
              >
                {active && (
                  <motion.div
                    layoutId="historyFilterPill"
                    className="absolute inset-0 bg-white shadow-sm rounded-lg border border-[#13493B]/10"
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}
                <span className={`relative z-10 ${active ? 'text-[#07221A]' : 'text-[#5C7F75] hover:text-[#07221A]'}`}>
                  {labels[st]}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Logs Table / Card List */}
      <div className="bg-white border border-[#13493B]/10 rounded-[28px] overflow-hidden shadow-sm">
        {filteredHistory.length === 0 ? (
          <div className="py-20 text-center space-y-3">
            <div className="w-12 h-12 rounded-[16px] bg-[#EBF1EF] border border-[#13493B]/10 flex items-center justify-center text-[#5C7F75] mx-auto">
              <QrCode className="w-6 h-6" />
            </div>
            <p className="text-sm font-black text-[#07221A]">No matching scan records</p>
            <p className="text-xs font-semibold text-[#5C7F75]">Try changing your search keywords or perform a new scan.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-[#13493B]/10 bg-[#F4F7F6] text-[#5C7F75] uppercase font-mono text-[9px] font-black tracking-widest">
                  <th className="p-4">Product</th>
                  <th className="p-4">Tag ID</th>
                  <th className="p-4">Timestamp</th>
                  <th className="p-4">Score</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Readings</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#13493B]/10">
                <AnimatePresence>
                  {filteredHistory.map((item, index) => (
                    <motion.tr
                      key={item.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      transition={{ delay: index * 0.04 }}
                      className="hover:bg-[#F4F7F6]/50 transition-colors group"
                    >
                      <td className="p-4 font-black text-[#07221A]">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-lg bg-[#EBF1EF] border border-[#13493B]/10 flex items-center justify-center text-[#20E79A] font-bold">
                            {item.itemName.charAt(0)}
                          </div>
                          <span>{item.itemName}</span>
                        </div>
                      </td>

                      <td className="p-4 font-mono text-[#07221A] font-bold">
                        {item.tagId}
                      </td>

                      <td className="p-4 text-[#5C7F75] font-semibold">
                        {new Date(item.timestamp).toLocaleString([], {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>

                      <td className="p-4">
                        <span className="font-black text-[#07221A] text-sm">
                          {item.freshnessScore}
                        </span>
                        <span className="text-[#5C7F75] text-[10px] font-bold">/100</span>
                      </td>

                      <td className="p-4">
                        <StatusBadge status={item.status} size="sm" />
                      </td>

                      <td className="p-4 text-[#5C7F75] font-mono font-bold text-[11px]">
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
                            className="p-1.5 rounded-lg bg-[#EBF1EF] hover:bg-[#20E79A]/10 border border-[#13493B]/10 text-[#07221A] transition-colors cursor-pointer"
                          >
                            <ExternalLink className="w-4 h-4 text-[#20E79A]" />
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => deleteHistoryRecord(item.id)}
                            title="Delete log entry"
                            className="p-1.5 rounded-lg bg-[#EBF1EF] hover:bg-red-50 border border-[#13493B]/10 text-slate-400 hover:text-red-500 transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
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

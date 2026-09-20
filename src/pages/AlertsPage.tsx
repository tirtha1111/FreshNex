import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Bell, 
  AlertTriangle, 
  ShieldCheck, 
  Thermometer, 
  Wind, 
  Droplets, 
  CheckCheck, 
  Trash2, 
  ExternalLink, 
  Sliders, 
  Volume2, 
  VolumeX, 
  Search
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useFreshness } from '../context/FreshnessContext';
import { ThresholdConfigModal } from '../components/common/ThresholdConfigModal';

export const AlertsPage: React.FC = () => {
  const navigate = useNavigate();
  const { 
    alerts, 
    unreadCount, 
    markNotificationsAsRead, 
    markAlertAsRead, 
    resolveAlert, 
    deleteAlert,
    thresholds,
    updateThresholds,
    isAudioMuted,
    toggleAudioMute,
  } = useFreshness();

  const [searchFilter, setSearchFilter] = useState('');
  const [severityFilter, setSeverityFilter] = useState<'all' | 'critical' | 'warning' | 'unread' | 'resolved'>('all');
  const [metricFilter, setMetricFilter] = useState<'all' | 'temperature' | 'gas' | 'humidity'>('all');
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);

  const filteredAlerts = alerts.filter(alert => {
    if (searchFilter.trim()) {
      const q = searchFilter.toLowerCase();
      const matchText = (alert.title + ' ' + alert.message + ' ' + (alert.itemName || '') + ' ' + (alert.deviceId || '')).toLowerCase();
      if (!matchText.includes(q)) return false;
    }

    if (severityFilter === 'unread' && alert.read) return false;
    if (severityFilter === 'critical' && alert.severity !== 'critical') return false;
    if (severityFilter === 'warning' && alert.severity !== 'warning') return false;
    if (severityFilter === 'resolved' && !alert.resolved) return false;

    if (metricFilter !== 'all' && alert.metric !== metricFilter) return false;

    return true;
  });

  const criticalCount = alerts.filter(a => a.severity === 'critical' && !a.resolved).length;
  const warningCount = alerts.filter(a => a.severity === 'warning' && !a.resolved).length;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.05 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' } }
  };

  return (
    <div className="space-y-6 select-none max-w-6xl mx-auto pb-12 font-sans">
      {/* Top Banner & Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#13493B]/10">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EBFBF4] border border-[#20E79A]/20 text-[10px] font-black text-[#20E79A] uppercase tracking-wider mb-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#20E79A] animate-pulse" />
            <span>Real-Time Stream Online</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif italic font-black text-[#07221A] tracking-tight">
            Real-Time Alerts & Thresholds
          </h1>
          <p className="text-xs font-bold text-[#5C7F75] mt-1">
            Automated sensor threshold monitoring and anomaly detection logs.
          </p>
        </div>

        {/* Quick Top Actions */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            onClick={() => setIsConfigModalOpen(true)}
            className="px-4 py-2 rounded-xl text-xs font-bold text-[#07221A] bg-white hover:bg-[#F4F7F6] border border-[#13493B]/10 flex items-center gap-1.5 cursor-pointer shadow-sm"
          >
            <Sliders className="w-4 h-4 text-[#20E79A]" />
            <span>Threshold Rules</span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            onClick={toggleAudioMute}
            className="p-2 rounded-xl bg-white hover:bg-[#F4F7F6] border border-[#13493B]/10 cursor-pointer transition-colors"
            title={isAudioMuted ? 'Unmute alert chimes' : 'Mute alert chimes'}
          >
            {isAudioMuted ? <VolumeX className="w-4 h-4 text-slate-400" /> : <Volume2 className="w-4 h-4 text-[#20E79A]" />}
          </motion.button>

          {unreadCount > 0 && (
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              onClick={markNotificationsAsRead}
              className="px-4 py-2 rounded-xl text-xs font-black text-white bg-[#07221A] hover:bg-[#134336] flex items-center gap-1.5 cursor-pointer shadow-md"
            >
              <CheckCheck className="w-4 h-4 text-[#20E79A]" />
              <span>Mark All Read</span>
            </motion.button>
          )}
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Alerts */}
        <div className="bg-white p-5 rounded-3xl border border-[#13493B]/10 flex items-center justify-between shadow-sm">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-[#5C7F75] uppercase tracking-wider block">Total Alerts</span>
            <p className="text-2xl font-black text-[#07221A]">{alerts.length}</p>
          </div>
          <div className="w-11 h-11 rounded-full bg-[#EBF5FF] text-[#3B82F6] flex items-center justify-center">
            <Bell className="w-5 h-5" />
          </div>
        </div>

        {/* Critical Spikes */}
        <div className="bg-white p-5 rounded-3xl border border-[#13493B]/10 flex items-center justify-between shadow-sm">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-red-600 uppercase tracking-wider block">Critical Spikes</span>
            <p className="text-2xl font-black text-red-600">{criticalCount}</p>
          </div>
          <div className="w-11 h-11 rounded-full bg-[#FFECEE] text-red-600 flex items-center justify-center">
            <AlertTriangle className="w-5 h-5" />
          </div>
        </div>

        {/* Warning Thresholds */}
        <div className="bg-white p-5 rounded-3xl border border-[#13493B]/10 flex items-center justify-between shadow-sm">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-orange-600 uppercase tracking-wider block">Warnings</span>
            <p className="text-2xl font-black text-orange-600">{warningCount}</p>
          </div>
          <div className="w-11 h-11 rounded-full bg-orange-50 text-orange-500 flex items-center justify-center">
            <Wind className="w-5 h-5" />
          </div>
        </div>

        {/* Active Threshold Config Summary */}
        <div className="bg-white p-5 rounded-3xl border border-[#13493B]/10 flex items-center justify-between shadow-sm">
          <div className="space-y-1 min-w-0">
            <span className="text-[10px] font-bold text-[#5C7F75] uppercase tracking-wider block">Trigger Rules</span>
            <p className="text-xs font-black text-[#20E79A] truncate font-mono">
              T &gt; {thresholds.tempMax}°C | G &gt; {thresholds.gasWarning}ppm
            </p>
          </div>
          <div className="w-11 h-11 rounded-full bg-[#EBFBF4] text-[#20E79A] flex items-center justify-center">
            <ShieldCheck className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Interactive Controls & Filters */}
      <div className="p-4 rounded-2xl bg-white border border-[#13493B]/10 flex flex-col md:flex-row items-center justify-between gap-3 shadow-sm">
        {/* Search */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-[#5C7F75] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            placeholder="Search alerts (e.g. Temperature)..."
            className="w-full pl-10 pr-3 py-2 bg-[#EBF1EF] text-xs font-semibold text-[#07221A] placeholder-[#5C7F75] rounded-xl border border-transparent focus:outline-none focus:bg-white focus:border-[#20E79A]/50 focus:ring-4 focus:ring-[#20E79A]/10 transition-all duration-200"
          />
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 flex-wrap w-full md:w-auto text-xs">
          {/* Severity filter pills */}
          <div className="flex items-center gap-1 bg-[#F4F7F6] p-1 rounded-xl border border-[#13493B]/10">
            {[
              { id: 'all', label: 'All' },
              { id: 'unread', label: `Unread (${unreadCount})` },
              { id: 'critical', label: 'Critical' },
              { id: 'warning', label: 'Warning' },
              { id: 'resolved', label: 'Resolved' },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setSeverityFilter(f.id as any)}
                className={`px-3 py-1.5 rounded-lg font-black transition-all cursor-pointer ${
                  severityFilter === f.id
                    ? 'bg-white text-[#07221A] shadow-sm'
                    : 'text-[#5C7F75] hover:text-[#07221A]'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Metric filter pills */}
          <div className="flex items-center gap-1 bg-[#F4F7F6] p-1 rounded-xl border border-[#13493B]/10">
            {[
              { id: 'all', label: 'All Metrics' },
              { id: 'temperature', label: 'Temp' },
              { id: 'gas', label: 'Gas' },
              { id: 'humidity', label: 'Humidity' },
            ].map((m) => (
              <button
                key={m.id}
                onClick={() => setMetricFilter(m.id as any)}
                className={`px-3 py-1.5 rounded-lg font-black transition-all cursor-pointer ${
                  metricFilter === m.id
                    ? 'bg-white text-[#07221A] shadow-sm'
                    : 'text-[#5C7F75] hover:text-[#07221A]'
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Alerts Stream List */}
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-3.5"
      >
         {filteredAlerts.length === 0 ? (
          <div className="bg-white p-12 text-center space-y-4 rounded-[28px] border border-[#13493B]/10 shadow-sm">
            <div className="w-16 h-16 rounded-[20px] bg-[#EBFBF4] text-[#20E79A] flex items-center justify-center mx-auto shadow-sm">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-black text-[#07221A] tracking-tight">No Alerts Matching Criteria</h3>
            <p className="text-xs font-semibold text-[#5C7F75] max-w-sm mx-auto leading-relaxed">
              All connected IoT telemetry sensors are currently operating within safe baseline threshold limits.
            </p>
          </div>
        ) : (
          filteredAlerts.map((alert) => {
            const isCrit = alert.severity === 'critical';
            const isWarn = alert.severity === 'warning';
            const isResolved = alert.resolved;

            return (
              <motion.div
                key={alert.id}
                variants={itemVariants}
                className="bg-white p-5 rounded-3xl border border-[#13493B]/10 shadow-sm relative overflow-hidden flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                {/* Left accent color indicator bar */}
                <div 
                  className={`absolute left-0 top-0 bottom-0 w-1.5 ${
                    isResolved ? 'bg-[#20E79A]' : isCrit ? 'bg-red-500' : isWarn ? 'bg-orange-400' : 'bg-[#20E79A]'
                  }`}
                />

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pl-2 w-full">
                  {/* Left info */}
                  <div className="flex items-start gap-4 min-w-0">
                    <div 
                      className={`w-11 h-11 rounded-full flex items-center justify-center shrink-0 ${
                        isCrit
                          ? 'bg-[#FFECEE] text-red-600'
                          : isWarn
                          ? 'bg-orange-50 text-orange-500'
                          : 'bg-[#EBFBF4] text-[#20E79A]'
                      }`}
                    >
                      {alert.metric === 'temperature' ? (
                        <Thermometer className="w-5 h-5" />
                      ) : alert.metric === 'gas' ? (
                        <Wind className="w-5 h-5" />
                      ) : alert.metric === 'humidity' ? (
                        <Droplets className="w-5 h-5" />
                      ) : (
                        <AlertTriangle className="w-5 h-5" />
                      )}
                    </div>

                    <div className="min-w-0 flex-1 space-y-1 text-left">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${
                          isCrit
                            ? 'bg-red-100 text-red-700 animate-pulse'
                            : isWarn
                            ? 'bg-orange-100 text-orange-700'
                            : 'bg-green-100 text-green-700'
                        }`}>
                          {isCrit ? 'Critical Spike' : isWarn ? 'Threshold Warning' : 'Resolved'}
                        </span>

                        {alert.deviceId && (
                          <span className="text-[10px] font-mono font-bold text-[#07221A] px-2 py-0.5 rounded-md bg-[#F4F7F6] border border-[#13493B]/10">
                            Tag: {alert.deviceId}
                          </span>
                        )}

                        <span className="text-[10px] text-[#5C7F75] font-semibold font-mono">
                          {new Date(alert.timestamp).toLocaleString()}
                        </span>
                      </div>

                      <h4 className="text-sm font-black text-[#07221A]">{alert.title}</h4>
                      <p className="text-xs font-semibold text-[#5C7F75] leading-relaxed">{alert.message}</p>

                      {alert.currentValue !== undefined && (
                        <div className="flex items-center gap-3 pt-1 text-xs font-mono font-bold">
                          <span className="text-red-500">
                            Current: {alert.currentValue} {alert.unit}
                          </span>
                          <span className="text-[#5C7F75]">
                            Safe Threshold: {alert.thresholdValue} {alert.unit}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right actions */}
                  <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => {
                        if (alert.itemId) {
                          navigate(`/live-data/${alert.itemId}`);
                        } else {
                          navigate('/live-data');
                        }
                      }}
                      className="px-4 py-2 rounded-full text-xs font-black text-[#07221A] bg-[#F4F7F6] hover:bg-[#EBF1EF] flex items-center gap-1.5 cursor-pointer shadow-sm"
                    >
                      <ExternalLink className="w-3.5 h-3.5 text-[#20E79A]" />
                      <span>Telemetry</span>
                    </motion.button>

                    {!alert.resolved && (
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => resolveAlert(alert.id)}
                        className="px-4 py-2 rounded-full text-xs font-black text-white bg-[#07221A] hover:bg-[#134336] flex items-center gap-1 cursor-pointer transition-colors"
                      >
                        <CheckCheck className="w-3.5 h-3.5" />
                        <span>Acknowledge</span>
                      </motion.button>
                    )}

                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => deleteAlert(alert.id)}
                      className="p-2 rounded-full hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors cursor-pointer"
                      title="Delete alert"
                    >
                      <Trash2 className="w-4 h-4" />
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            );
          })
        )}
      </motion.div>

      {/* Threshold Config Modal */}
      <ThresholdConfigModal
        isOpen={isConfigModalOpen}
        onClose={() => setIsConfigModalOpen(false)}
        thresholds={thresholds}
        onSaveThresholds={updateThresholds}
      />
    </div>
  );
};

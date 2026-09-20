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
  Sparkles, 
  Volume2, 
  VolumeX, 
  Search, 
  Filter, 
  Radio
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
    triggerSimulatedBreach
  } = useFreshness();

  const [searchFilter, setSearchFilter] = useState('');
  const [severityFilter, setSeverityFilter] = useState<'all' | 'critical' | 'warning' | 'unread' | 'resolved'>('all');
  const [metricFilter, setMetricFilter] = useState<'all' | 'temperature' | 'gas' | 'humidity'>('all');
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);

  const filteredAlerts = alerts.filter(alert => {
    // Search match
    if (searchFilter.trim()) {
      const q = searchFilter.toLowerCase();
      const matchText = (alert.title + ' ' + alert.message + ' ' + (alert.itemName || '') + ' ' + (alert.deviceId || '')).toLowerCase();
      if (!matchText.includes(q)) return false;
    }

    // Severity match
    if (severityFilter === 'unread' && alert.read) return false;
    if (severityFilter === 'critical' && alert.severity !== 'critical') return false;
    if (severityFilter === 'warning' && alert.severity !== 'warning') return false;
    if (severityFilter === 'resolved' && !alert.resolved) return false;

    // Metric match
    if (metricFilter !== 'all' && alert.metric !== metricFilter) return false;

    return true;
  });

  const criticalCount = alerts.filter(a => a.severity === 'critical' && !a.resolved).length;
  const warningCount = alerts.filter(a => a.severity === 'warning' && !a.resolved).length;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] },
    },
  };

  return (
    <div className="space-y-6 select-none max-w-6xl mx-auto pb-12">
      {/* Top Banner & Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#3D261A]">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FF6A00]/10 border border-[#FF6A00]/30 text-[11px] font-extrabold text-[#FFAA00] uppercase tracking-wider mb-2">
            <span className="w-2 h-2 rounded-full bg-[#20E79A] animate-ping" />
            <span>Firebase Real-Time Notification Stream</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#FDF8F5] tracking-tight">
            Real-Time Alerts & Thresholds
          </h1>
          <p className="text-xs sm:text-sm text-[#B8A89E] mt-1">
            Automated sensor threshold monitoring and anomaly detection synchronized with Firebase.
          </p>
        </div>

        {/* Quick Top Actions */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            onClick={() => setIsConfigModalOpen(true)}
            className="px-4 py-2 rounded-xl text-xs font-bold text-[#FFAA00] bg-[#1E140E] hover:bg-[#261A12] border border-[#FF6A00]/40 flex items-center gap-1.5 cursor-pointer transition-colors shadow-sm"
          >
            <Sliders className="w-4 h-4 text-[#FFAA00]" />
            <span>Threshold Rules</span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            onClick={toggleAudioMute}
            className="p-2 rounded-xl text-xs font-bold text-[#B8A89E] bg-[#1E140E] hover:bg-[#261A12] border border-[#3D261A] cursor-pointer transition-colors"
            title={isAudioMuted ? 'Unmute alert chimes' : 'Mute alert chimes'}
          >
            {isAudioMuted ? <VolumeX className="w-4 h-4 text-[#8C7A70]" /> : <Volume2 className="w-4 h-4 text-[#FFAA00]" />}
          </motion.button>

          {unreadCount > 0 && (
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              onClick={markNotificationsAsRead}
              className="px-3.5 py-2 rounded-xl text-xs font-bold text-[#140C08] btn-orange flex items-center gap-1.5 cursor-pointer shadow-md"
            >
              <CheckCheck className="w-4 h-4 text-[#140C08]" />
              <span>Mark All Read</span>
            </motion.button>
          )}
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Alerts */}
        <div className="card-solid p-4.5 rounded-2xl border border-[#3D261A] flex items-center justify-between shadow-md">
          <div className="space-y-1">
            <span className="text-[11px] font-bold text-[#8C7A70] uppercase tracking-wider">Total Alerts</span>
            <p className="text-2xl font-black text-[#FDF8F5]">{alerts.length}</p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-[#FF6A00]/15 text-[#FF6A00] flex items-center justify-center border border-[#FF6A00]/30">
            <Bell className="w-5 h-5" />
          </div>
        </div>

        {/* Critical Spikes */}
        <div className="card-solid p-4.5 rounded-2xl border border-[#FF3D00]/30 flex items-center justify-between shadow-md bg-gradient-to-br from-[#220B0B]/80 to-[#140C08]">
          <div className="space-y-1">
            <span className="text-[11px] font-bold text-[#FF5A67] uppercase tracking-wider">Critical Spikes</span>
            <p className="text-2xl font-black text-[#FF3D00]">{criticalCount}</p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-[#FF3D00]/20 text-[#FF3D00] flex items-center justify-center border border-[#FF3D00]/40">
            <AlertTriangle className="w-5 h-5" />
          </div>
        </div>

        {/* Warning Thresholds */}
        <div className="card-solid p-4.5 rounded-2xl border border-[#FFAA00]/30 flex items-center justify-between shadow-md bg-gradient-to-br from-[#20150B]/80 to-[#140C08]">
          <div className="space-y-1">
            <span className="text-[11px] font-bold text-[#FFAA00] uppercase tracking-wider">Threshold Warnings</span>
            <p className="text-2xl font-black text-[#FFAA00]">{warningCount}</p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-[#FFAA00]/20 text-[#FFAA00] flex items-center justify-center border border-[#FFAA00]/40">
            <Wind className="w-5 h-5" />
          </div>
        </div>

        {/* Active Threshold Config Summary */}
        <div className="card-solid p-4.5 rounded-2xl border border-[#3D261A] flex items-center justify-between shadow-md">
          <div className="space-y-1 min-w-0">
            <span className="text-[11px] font-bold text-[#8C7A70] uppercase tracking-wider">Trigger Rules</span>
            <p className="text-xs font-bold text-[#20E79A] truncate font-mono">
              T &gt; {thresholds.tempMax}°C | Gas &gt; {thresholds.gasWarning}ppm
            </p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-[#20E79A]/15 text-[#20E79A] flex items-center justify-center border border-[#20E79A]/30">
            <ShieldCheck className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Interactive Controls & Filters */}
      <div className="p-4 rounded-2xl bg-[#1A110B] border border-[#3D261A] flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Search */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-[#8C7A70] absolute left-3 top-2.5 pointer-events-none" />
          <input
            type="text"
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            placeholder="Search alerts (e.g. Chicken, 480ppm)..."
            className="w-full pl-9 pr-3 py-1.5 bg-[#140C08] border border-[#3D261A] rounded-xl text-xs text-[#FDF8F5] placeholder-[#8C7A70] focus:outline-none focus:border-[#FF6A00]"
          />
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 flex-wrap w-full md:w-auto text-xs">
          {/* Severity filter pills */}
          <div className="flex items-center gap-1 bg-[#140C08] p-1 rounded-xl border border-[#3D261A]">
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
                className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                  severityFilter === f.id
                    ? 'bg-[#FF6A00] text-[#140C08]'
                    : 'text-[#8C7A70] hover:text-[#FDF8F5]'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Metric filter pills */}
          <div className="flex items-center gap-1 bg-[#140C08] p-1 rounded-xl border border-[#3D261A]">
            {[
              { id: 'all', label: 'All Metrics' },
              { id: 'temperature', label: 'Temp' },
              { id: 'gas', label: 'Gas' },
              { id: 'humidity', label: 'Humidity' },
            ].map((m) => (
              <button
                key={m.id}
                onClick={() => setMetricFilter(m.id as any)}
                className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                  metricFilter === m.id
                    ? 'bg-[#FFAA00] text-[#140C08]'
                    : 'text-[#8C7A70] hover:text-[#FDF8F5]'
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
        className="space-y-3"
      >
        {filteredAlerts.length === 0 ? (
          <div className="card-solid p-12 text-center space-y-4 rounded-3xl border border-[#3D261A]">
            <div className="w-16 h-16 rounded-2xl bg-[#20E79A]/15 text-[#20E79A] border border-[#20E79A]/30 flex items-center justify-center mx-auto shadow-lg">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-[#FDF8F5]">No Alerts Matching Criteria</h3>
            <p className="text-xs text-[#8C7A70] max-w-sm mx-auto">
              All connected IoT telemetry sensors are currently operating within safe baseline threshold limits.
            </p>
            <div className="pt-2">
              <button
                onClick={() => triggerSimulatedBreach('gas')}
                className="px-4 py-2 rounded-xl text-xs font-bold text-[#FFAA00] bg-[#1E140E] border border-[#FF6A00]/40 hover:bg-[#261A12] transition-colors cursor-pointer inline-flex items-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Simulate Test Gas Alert (480 ppm)</span>
              </button>
            </div>
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
                className={`p-4 sm:p-5 rounded-2xl border transition-all duration-200 relative overflow-hidden shadow-md ${
                  !alert.read ? 'ring-1 ring-[#FF6A00]/50' : ''
                } ${
                  isCrit
                    ? 'bg-[#200B0B]/90 border-[#FF3D00]/40 text-[#FDF8F5]'
                    : isWarn
                    ? 'bg-[#1E1208]/90 border-[#FFAA00]/40 text-[#FDF8F5]'
                    : 'bg-[#180F0A]/90 border-[#3D261A] text-[#FDF8F5]'
                }`}
              >
                {/* Ambient side indicator */}
                <div 
                  className={`absolute left-0 top-0 bottom-0 w-1.5 ${
                    isResolved ? 'bg-[#20E79A]' : isCrit ? 'bg-[#FF3D00]' : isWarn ? 'bg-[#FFAA00]' : 'bg-[#FF6A00]'
                  }`}
                />

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pl-2">
                  {/* Left info */}
                  <div className="flex items-start gap-3.5 min-w-0">
                    <div 
                      className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 border ${
                        isCrit
                          ? 'bg-[#FF3D00]/20 text-[#FF3D00] border-[#FF3D00]/40'
                          : isWarn
                          ? 'bg-[#FFAA00]/20 text-[#FFAA00] border-[#FFAA00]/40'
                          : 'bg-[#20E79A]/20 text-[#20E79A] border-[#20E79A]/40'
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

                    <div className="min-w-0 flex-1 space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                          isCrit
                            ? 'bg-[#FF3D00]/25 text-[#FF3D00] border-[#FF3D00]/40 animate-pulse'
                            : isWarn
                            ? 'bg-[#FFAA00]/25 text-[#FFAA00] border-[#FFAA00]/40'
                            : 'bg-[#20E79A]/25 text-[#20E79A] border-[#20E79A]/40'
                        }`}>
                          {isCrit ? 'Critical Spike' : isWarn ? 'Threshold Warning' : 'Resolved'}
                        </span>

                        {alert.deviceId && (
                          <span className="text-[11px] font-mono font-bold text-[#FFAA00] px-2 py-0.5 rounded-md bg-[#140C08] border border-[#3D261A]">
                            Tag: {alert.deviceId}
                          </span>
                        )}

                        <span className="text-[11px] text-[#8C7A70] font-mono">
                          {new Date(alert.timestamp).toLocaleString()}
                        </span>
                      </div>

                      <h4 className="text-sm font-bold text-[#FDF8F5]">{alert.title}</h4>
                      <p className="text-xs text-[#B8A89E] leading-relaxed">{alert.message}</p>

                      {alert.currentValue !== undefined && (
                        <div className="flex items-center gap-3 pt-1 text-xs font-mono">
                          <span className="text-[#FFAA00] font-bold">
                            Current: {alert.currentValue} {alert.unit}
                          </span>
                          <span className="text-[#8C7A70]">
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
                          navigate('/live-data/FRX1004');
                        }
                      }}
                      className="px-3 py-1.5 rounded-xl text-xs font-bold text-[#140C08] bg-[#FF6A00] hover:bg-[#FFAA00] flex items-center gap-1.5 cursor-pointer transition-colors shadow-sm"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Telemetry</span>
                    </motion.button>

                    {!alert.resolved && (
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => resolveAlert(alert.id)}
                        className="px-3 py-1.5 rounded-xl text-xs font-bold text-[#20E79A] bg-[#20E79A]/15 hover:bg-[#20E79A]/25 border border-[#20E79A]/30 flex items-center gap-1 cursor-pointer transition-colors"
                      >
                        <CheckCheck className="w-3.5 h-3.5" />
                        <span>Acknowledge</span>
                      </motion.button>
                    )}

                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => deleteAlert(alert.id)}
                      className="p-2 rounded-xl text-[#8C7A70] hover:text-[#FF5A67] hover:bg-[#FF5A67]/15 transition-colors cursor-pointer"
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
        onTriggerTestBreach={triggerSimulatedBreach}
      />
    </div>
  );
};

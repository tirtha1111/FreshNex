import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  AlertTriangle, 
  Flame, 
  Thermometer, 
  Wind, 
  Droplets, 
  X, 
  ExternalLink, 
  CheckCheck,
  Volume2,
  VolumeX,
  Radio
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { SensorAlertEvent } from '../../services/alertThresholdService';

interface RealtimeAlertToastProps {
  alerts: SensorAlertEvent[];
  onDismiss: (id: string) => void;
  onResolve: (id: string) => void;
  isMuted: boolean;
  onToggleMute: () => void;
}

export const RealtimeAlertToast: React.FC<RealtimeAlertToastProps> = ({
  alerts,
  onDismiss,
  onResolve,
  isMuted,
  onToggleMute,
}) => {
  const navigate = useNavigate();

  // Show only unread, non-resolved alerts (up to 3 stacked)
  const activeAlerts = alerts.filter(a => !a.read && !a.resolved).slice(0, 3);

  if (activeAlerts.length === 0) return null;

  return (
    <div className="fixed top-20 right-4 sm:right-6 z-50 flex flex-col gap-3 max-w-sm sm:max-w-md w-full pointer-events-none select-none">
      <AnimatePresence>
        {activeAlerts.map((alert) => {
          const isCritical = alert.severity === 'critical';
          const isWarning = alert.severity === 'warning';

          return (
            <motion.div
              key={alert.id}
              layout
              initial={{ opacity: 0, x: 50, scale: 0.92 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 50, scale: 0.95 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              className={`pointer-events-auto rounded-2xl p-4 backdrop-blur-xl shadow-[0_20px_50px_rgba(0,0,0,0.8)] border relative overflow-hidden transition-all ${
                isCritical
                  ? 'bg-[#220B0B]/95 border-[#FF3D00]/50 shadow-[0_0_30px_rgba(255,61,0,0.25)] text-[#FDF8F5]'
                  : isWarning
                  ? 'bg-[#20150B]/95 border-[#FFAA00]/50 shadow-[0_0_30px_rgba(255,170,0,0.2)] text-[#FDF8F5]'
                  : 'bg-[#1E140E]/95 border-[#FF6A00]/30 text-[#FDF8F5]'
              }`}
            >
              {/* Top ambient color edge */}
              <div 
                className={`absolute top-0 left-0 right-0 h-1 ${
                  isCritical ? 'bg-gradient-to-r from-[#FF3D00] via-[#FF6A00] to-[#FF3D00]' : 'bg-gradient-to-r from-[#FFAA00] via-[#FF6A00] to-[#FFAA00]'
                }`}
              />

              <div className="flex items-start gap-3.5">
                {/* Severity Icon */}
                <div 
                  className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-md ${
                    isCritical
                      ? 'bg-[#FF3D00]/20 text-[#FF3D00] border border-[#FF3D00]/40 animate-pulse'
                      : 'bg-[#FFAA00]/20 text-[#FFAA00] border border-[#FFAA00]/40'
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

                {/* Content */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                        isCritical
                          ? 'bg-[#FF3D00]/25 text-[#FF3D00] border-[#FF3D00]/40 animate-pulse'
                          : 'bg-[#FFAA00]/25 text-[#FFAA00] border-[#FFAA00]/40'
                      }`}>
                        {isCritical ? 'Critical Alert' : 'Sensor Warning'}
                      </span>
                      <span className="text-[10px] text-[#8C7A70] font-mono">
                        {new Date(alert.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                      </span>
                    </div>

                    <button
                      onClick={() => onDismiss(alert.id)}
                      className="p-1 text-[#8C7A70] hover:text-[#FDF8F5] rounded-lg transition-colors cursor-pointer"
                      aria-label="Dismiss alert"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <h4 className="text-xs font-bold text-[#FDF8F5] mt-1 line-clamp-1">
                    {alert.title}
                  </h4>

                  <p className="text-[11px] text-[#B8A89E] mt-0.5 leading-snug">
                    {alert.message}
                  </p>

                  {/* Telemetry Badge */}
                  <div className="mt-2 flex items-center gap-2 text-[11px] font-mono">
                    <span className="px-2 py-0.5 rounded-md bg-[#140C08] border border-[#3D261A] text-[#FFAA00] font-bold">
                      Reading: {alert.currentValue} {alert.unit}
                    </span>
                    <span className="text-[10px] text-[#8C7A70]">
                      Limit: {alert.thresholdValue} {alert.unit}
                    </span>
                  </div>

                  {/* Action Buttons */}
                  <div className="mt-3 flex items-center justify-between gap-2 pt-2 border-t border-[#3D261A]/50">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          onDismiss(alert.id);
                          if (alert.itemId) {
                            navigate(`/live-data/${alert.itemId}`);
                          } else {
                            navigate('/live-data');
                          }
                        }}
                        className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-[#FF6A00] hover:bg-[#FFAA00] text-[#140C08] flex items-center gap-1 cursor-pointer transition-colors shadow-sm"
                      >
                        <ExternalLink className="w-3 h-3" />
                        <span>View Telemetry</span>
                      </button>

                      <button
                        onClick={() => onResolve(alert.id)}
                        className="px-2 py-1 text-[11px] font-medium rounded-lg text-[#B8A89E] hover:text-[#20E79A] hover:bg-[#20E79A]/10 transition-colors flex items-center gap-1 cursor-pointer"
                      >
                        <CheckCheck className="w-3 h-3" />
                        <span>Acknowledge</span>
                      </button>
                    </div>

                    <button
                      onClick={onToggleMute}
                      className="p-1 text-[#8C7A70] hover:text-[#FDF8F5] rounded-lg transition-colors cursor-pointer"
                      title={isMuted ? 'Unmute alert chimes' : 'Mute alert chimes'}
                    >
                      {isMuted ? <VolumeX className="w-3.5 h-3.5 text-[#8C7A70]" /> : <Volume2 className="w-3.5 h-3.5 text-[#FFAA00]" />}
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};

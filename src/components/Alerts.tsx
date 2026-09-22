import React from 'react';
import { motion } from 'motion/react';
import { Bell, AlertTriangle, ShieldCheck, Thermometer, Wind, Droplets, CheckCheck, Trash2, ExternalLink } from 'lucide-react';
import { useFreshness } from '../context/FreshnessContext';
import { useNavigate } from 'react-router-dom';

export const Alerts: React.FC = () => {
  const { alerts, markAlertAsRead, resolveAlert, deleteAlert, clearAllAlerts } = useFreshness();
  const navigate = useNavigate();

  return (
    <div className="space-y-4 max-w-3xl mx-auto select-none">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-[#FDF8F5] tracking-tight">Sensor Notifications & Alerts</h1>
          <p className="text-xs text-[#8C7A70] font-medium">Real-time telemetry threshold warnings & Firebase events</p>
        </div>
        {alerts.length > 0 && (
          <button
            onClick={clearAllAlerts}
            className="px-3 py-1.5 rounded-xl text-xs font-bold text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 flex items-center gap-1.5 cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear All</span>
          </button>
        )}
      </div>

      {alerts.length === 0 ? (
        <div className="card-solid p-8 rounded-3xl text-center space-y-3 border border-[#3D261A]">
          <div className="w-12 h-12 rounded-2xl bg-[#20E79A]/15 text-[#20E79A] border border-[#20E79A]/30 flex items-center justify-center mx-auto shadow-md">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-[#FDF8F5]">0 Active Notifications</h3>
          <p className="text-xs text-[#8C7A70] max-w-xs mx-auto">
            All systems normal. Zero alerts recorded across all sensors and devices.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {alerts.map((alert) => {
            const isCrit = alert.severity === 'critical';
            const isWarn = alert.severity === 'warning';

            return (
              <motion.div
                key={alert.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`p-4 rounded-2xl border flex items-start gap-3.5 shadow-md relative overflow-hidden transition-all ${
                  isCrit
                    ? 'bg-[#200B0B] border-[#FF3D00]/40 text-[#FDF8F5]'
                    : isWarn
                    ? 'bg-[#1E1208] border-[#FFAA00]/40 text-[#FDF8F5]'
                    : 'bg-[#180F0A] border-[#3D261A] text-[#FDF8F5]'
                }`}
              >
                <div 
                  className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${
                    isCrit ? 'bg-[#FF3D00]/20 text-[#FF3D00] border-[#FF3D00]/40' : isWarn ? 'bg-[#FFAA00]/20 text-[#FFAA00] border-[#FFAA00]/40' : 'bg-[#20E79A]/20 text-[#20E79A] border-[#20E79A]/40'
                  }`}
                >
                  {alert.metric === 'temperature' ? (
                    <Thermometer className="w-5 h-5" />
                  ) : alert.metric === 'gas' ? (
                    <Wind className="w-5 h-5" />
                  ) : alert.metric === 'humidity' ? (
                    <Droplets className="w-5 h-5" />
                  ) : (
                    <Bell className="w-5 h-5" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-[#FDF8F5]">{alert.title}</h4>
                    <span className="text-[10px] text-[#8C7A70] font-mono">
                      {new Date(alert.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-xs text-[#B8A89E] mt-0.5 leading-snug">{alert.message}</p>
                  
                  <div className="mt-2 flex items-center justify-between">
                    {alert.deviceId && (
                      <span className="text-[10px] font-mono font-bold text-[#FFAA00]">
                        Tag: {alert.deviceId}
                      </span>
                    )}
                    <div className="flex items-center gap-2">
                      {alert.itemId && (
                        <button
                          onClick={() => navigate(`/live-data/${alert.itemId}`)}
                          className="text-[11px] text-[#FF6A00] hover:underline flex items-center gap-0.5 cursor-pointer font-bold"
                        >
                          <ExternalLink className="w-3 h-3" />
                          <span>Telemetry</span>
                        </button>
                      )}
                      {!alert.resolved && (
                        <button
                          onClick={() => resolveAlert(alert.id)}
                          className="text-[11px] text-[#20E79A] hover:underline flex items-center gap-0.5 cursor-pointer font-bold"
                        >
                          <CheckCheck className="w-3 h-3" />
                          <span>Acknowledge</span>
                        </button>
                      )}
                      <button
                        onClick={() => deleteAlert(alert.id)}
                        className="text-[#8C7A70] hover:text-[#FF5A67] p-1 cursor-pointer transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
};


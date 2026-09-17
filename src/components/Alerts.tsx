import React from 'react';
import { useApp } from '../context/AppContext';
import { Bell, AlertCircle, CheckCircle2, Info, WifiOff, Thermometer, Droplets, Wind } from 'lucide-react';

export const Alerts: React.FC = () => {
  const { alertsList } = useApp();

  return (
    <div className="space-y-4 max-w-2xl mx-auto">
      <div>
        <h1 className="text-2xl font-black text-[#082A52] tracking-tight">Notifications & Alerts</h1>
        <p className="text-xs text-slate-500 font-medium">Real-time telemetry threshold warnings & status updates</p>
      </div>

      {alertsList.length === 0 ? (
        <div className="glass-card p-8 rounded-3xl text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-[#082A52]">All Systems Nominal</h3>
          <p className="text-xs text-slate-500 max-w-xs mx-auto">
            No active sensor threshold warnings. ESP32 devices are operating within normal telemetry ranges.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {alertsList.map((alert) => (
            <div
              key={alert.id}
              className="glass-card p-4 rounded-2xl border border-white/80 flex items-start gap-3.5 shadow-sm"
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                alert.severity === 'Critical' ? 'bg-rose-100 text-rose-600' :
                alert.severity === 'High' ? 'bg-amber-100 text-amber-600' :
                'bg-sky-100 text-[#1267D6]'
              }`}>
                <Bell className="w-5 h-5" />
              </div>

              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-[#082A52]">{alert.type}</h4>
                  <span className="text-[10px] text-slate-400 font-medium">
                    {new Date(alert.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <p className="text-xs text-slate-600 mt-0.5">{alert.message}</p>
                <span className="text-[10px] font-mono font-bold text-sky-700 mt-1 block">
                  Device: {alert.device_id}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

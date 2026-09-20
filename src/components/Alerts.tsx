import React from 'react';
import { useApp } from '../context/AppContext';
import { Bell, CheckCircle2 } from 'lucide-react';

export const Alerts: React.FC = () => {
  const { alertsList } = useApp();

  return (
    <div className="space-y-5 max-w-md md:max-w-2xl mx-auto text-[#edeff2]">
      <div className="pt-1">
        <h1 className="text-lg font-black text-white tracking-tight">ALERTS & ALARMS</h1>
        <p className="text-[11px] text-slate-500 font-semibold">Real-time telemetry warnings & status updates</p>
      </div>

      {alertsList.length === 0 ? (
        <div className="p-8 rounded-3xl bg-[#141416] border border-white/5 text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-[#21c55d] border border-emerald-500/20 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-black text-white">All Systems Nominal</h3>
            <p className="text-xs text-slate-500 max-w-xs mx-auto">
              No active threshold warnings. ESP32 devices are operating within safe ranges.
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {alertsList.map((alert) => (
            <div
              key={alert.id}
              className="p-4 rounded-3xl bg-[#141416] border border-white/5 flex items-start gap-3.5 shadow-sm"
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                alert.severity === 'Critical' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' :
                alert.severity === 'High' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                'bg-[#21c55d]/10 text-[#21c55d] border border-[#21c55d]/20'
              }`}>
                <Bell className="w-4.5 h-4.5" />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-black text-white truncate">{alert.type}</h4>
                  <span className="text-[9px] text-slate-500 font-mono">
                    {new Date(alert.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5 font-semibold">{alert.message}</p>
                <span className="text-[9px] font-mono font-black text-slate-500 mt-1.5 block uppercase">
                  NODE: {alert.device_id}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

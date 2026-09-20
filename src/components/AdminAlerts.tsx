import React from 'react';
import { useApp } from '../context/AppContext';
import { Bell, ShieldCheck, AlertOctagon, CheckCircle2, Clock, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const AdminAlerts: React.FC = () => {
  const { alertsList, resolveAlert, clearAllAlerts } = useApp();
  const navigate = useNavigate();

  const unresolvedAlerts = alertsList.filter(a => !a.resolved);
  const resolvedAlerts = alertsList.filter(a => a.resolved);

  return (
    <div className="space-y-6 select-none text-[#edeff2]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/5 pb-4">
        <div>
          <button 
            onClick={() => navigate('/admin')}
            className="flex items-center gap-1 text-[11px] font-black text-[#21c55d] uppercase tracking-wider mb-1 cursor-pointer hover:underline"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Control Console</span>
          </button>
          <h1 className="text-2xl font-black text-white tracking-tight">
            System Alarm log
          </h1>
          <p className="text-xs text-slate-400 font-semibold mt-0.5">
            Audit automatic environmental boundary warnings and IoT container anomaly alerts.
          </p>
        </div>

        {alertsList.length > 0 && (
          <button
            onClick={clearAllAlerts}
            className="px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-xs font-black transition-all cursor-pointer text-slate-300"
          >
            CLEAR HISTORICAL ALARMS
          </button>
        )}
      </div>

      {alertsList.length === 0 ? (
        <div className="bg-[#141416] border border-white/5 rounded-3xl p-8 text-center max-w-md mx-auto space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-[#21c55d] flex items-center justify-center mx-auto">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-black text-white">Atmosphere Completely Secure</h3>
          <p className="text-xs text-slate-400 font-semibold leading-relaxed">
            No temperature surges or gas anomalies detected. All ESP32 node feeds are currently reporting safe values.
          </p>
        </div>
      ) : (
        <div className="space-y-5">
          {/* Unresolved / Active alarms */}
          {unresolvedAlerts.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-xs font-black text-red-400 uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                <span>Active Environmental Anomalies ({unresolvedAlerts.length})</span>
              </h3>

              <div className="space-y-2.5">
                {unresolvedAlerts.map((alert) => (
                  <div 
                    key={alert.id}
                    className="bg-[#141416] border border-red-500/20 rounded-2xl p-4.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 flex items-center justify-center shrink-0">
                        <AlertOctagon className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-xs font-black text-white">{alert.title}</h4>
                        <p className="text-xs text-slate-400 font-semibold mt-0.5">{alert.message}</p>
                        <span className="font-mono text-[9px] text-[#38bdf8] uppercase tracking-wider block mt-1.5">
                          Node: {alert.device_id}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => resolveAlert(alert.id)}
                      className="px-3.5 py-2 rounded-xl bg-[#21c55d] text-[#0b0b0c] text-[10px] font-black hover:brightness-110 transition-all self-start sm:self-auto cursor-pointer"
                    >
                      Acknowledge & Resolve
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Historical resolved alarms */}
          {resolvedAlerts.length > 0 && (
            <div className="space-y-3 pt-2">
              <h3 className="text-xs font-black text-[#21c55d] uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#21c55d]" />
                <span>Resolved Warnings ({resolvedAlerts.length})</span>
              </h3>

              <div className="space-y-2.5">
                {resolvedAlerts.map((alert) => (
                  <div 
                    key={alert.id}
                    className="bg-[#141416]/50 border border-white/5 rounded-2xl p-4.5 flex items-center justify-between gap-3 opacity-60"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 rounded-xl bg-emerald-500/5 border border-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0">
                        <CheckCircle2 className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-xs font-black text-white">{alert.title}</h4>
                        <p className="text-xs text-slate-400 font-semibold mt-0.5">{alert.message}</p>
                        <span className="font-mono text-[9px] text-slate-400 tracking-wider block mt-1.5">
                          Node: {alert.device_id}
                        </span>
                      </div>
                    </div>

                    <span className="px-2.5 py-1 rounded-lg text-[9px] font-mono tracking-wider font-extrabold bg-emerald-500/10 text-[#21c55d]">
                      RESOLVED
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

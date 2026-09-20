import React from 'react';
import { useApp } from '../context/AppContext';
import { Users, Mail, Shield, ShieldAlert, ArrowLeft, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const AdminUsers: React.FC = () => {
  const { allUsersList } = useApp();
  const navigate = useNavigate();

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
            Client Login Registry
          </h1>
          <p className="text-xs text-slate-400 font-semibold mt-0.5">
            Monitor and manage verified user access and authentication states on this node array.
          </p>
        </div>

        <div className="px-3.5 py-1.5 rounded-xl bg-white/5 border border-white/10 text-xs font-bold text-slate-300">
          Total Users: <strong className="text-[#21c55d]">{allUsersList.length || 7}</strong>
        </div>
      </div>

      {/* Users grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {allUsersList.map((usr, idx) => {
          const isUserAdmin = usr.role === 'admin';

          return (
            <div 
              key={usr.uid || idx}
              className="bg-[#141416] border border-white/5 rounded-2xl p-5 shadow-lg flex flex-col justify-between space-y-4"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center font-extrabold text-[#38bdf8]">
                    {usr.name ? usr.name.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <div>
                    <h3 className="text-xs font-black text-white">{usr.name || 'Alex Johnson'}</h3>
                    <p className="text-[10px] text-slate-400 font-semibold mt-0.5 max-w-[140px] truncate">
                      {usr.email || 'alex@freshnex.com'}
                    </p>
                  </div>
                </div>

                <span className={`status-pill px-2.5 py-1 rounded-lg text-[9px] font-mono tracking-wider font-extrabold ${
                  isUserAdmin 
                    ? 'bg-red-500/10 text-red-400 border border-red-500/15' 
                    : 'bg-emerald-500/10 text-[#21c55d] border border-emerald-500/15'
                }`}>
                  {isUserAdmin ? 'ADMIN' : 'CLIENT'}
                </span>
              </div>

              {/* Status and telemetry */}
              <div className="space-y-2 text-[10px] text-slate-400 font-bold bg-[#0b0b0c] p-3.5 rounded-xl border border-white/5">
                <div className="flex items-center justify-between">
                  <span>Role Permissions:</span>
                  <span className="text-white font-extrabold uppercase">
                    {isUserAdmin ? 'Super Administrator' : 'Standard Read / Scan'}
                  </span>
                </div>
                <div className="flex items-center justify-between border-t border-white/5 pt-2">
                  <span>Authorized Auth Provider:</span>
                  <span className="text-[#38bdf8] font-extrabold">Firebase JWT</span>
                </div>
              </div>

              {/* Created timestamp */}
              <div className="flex items-center justify-between text-[10px] text-slate-400 font-bold border-t border-white/5 pt-3">
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-slate-500" />
                  <span>Last Active Frame</span>
                </span>
                <span>Active Now</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

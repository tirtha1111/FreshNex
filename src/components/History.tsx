import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Clock, ChevronRight, QrCode, Trash2, Cpu } from 'lucide-react';

export const HistoryPage: React.FC = () => {
  const { userScans, devicesMap } = useApp();
  const navigate = useNavigate();

  return (
    <div className="space-y-4 max-w-2xl mx-auto">
      <div>
        <h1 className="text-2xl font-black text-[#082A52] tracking-tight">Scan History</h1>
        <p className="text-xs text-slate-500 font-medium">Packages and devices you scanned previously</p>
      </div>

      {userScans.length === 0 ? (
        <div className="glass-card p-8 rounded-3xl text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-sky-100 text-[#1267D6] flex items-center justify-center mx-auto">
            <Clock className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-[#082A52]">No Scans Recorded</h3>
          <p className="text-xs text-slate-500 max-w-xs mx-auto">
            Scan a QR code on any food package to view live ESP32 telemetry data and log it to your history.
          </p>
          <button
            onClick={() => navigate('/scan')}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#1267D6] to-[#2196F3] text-white text-xs font-bold shadow-md hover:brightness-110"
          >
            SCAN NOW
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {userScans.map((scan) => {
            const dev = devicesMap[scan.device_id] || {
              device_id: scan.device_id,
              product: scan.product || 'Food Package',
              temperature: 27.4,
              humidity: 61.2,
              mq135_raw: 1320,
              online: true,
              last_update: scan.scanned_at
            };

            return (
              <div
                key={scan.id}
                onClick={() => navigate(`/products/${scan.device_id}`)}
                className="glass-card glass-card-hover p-4 rounded-2xl cursor-pointer flex items-center justify-between border border-white/80"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-sky-50 to-sky-100 border border-sky-200 text-[#1267D6] flex items-center justify-center font-black text-base shadow-xs">
                    {scan.product ? scan.product.charAt(0).toUpperCase() : 'P'}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-[#082A52]">{scan.product || 'Food Package'}</h4>
                    <p className="text-xs font-mono font-bold text-sky-700">{scan.device_id}</p>
                    <p className="text-[10px] text-slate-400 font-medium mt-0.5">
                      Scanned: {new Date(scan.scanned_at).toLocaleString()}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right hidden sm:block">
                    <span className="text-xs font-bold text-[#082A52]">
                      {dev.temperature}°C • {dev.humidity}%
                    </span>
                    <p className="text-[10px] text-slate-400">MQ-135: {dev.mq135_raw}</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-slate-400" />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

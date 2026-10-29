import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, Check, CheckCheck, Search, Sun, Thermometer, Move, FlaskConical } from 'lucide-react';
import { useFreshNex } from '../../context/FreshNexContext';
import { AlertItem } from '../../types/freshnex';

export const AlertsView: React.FC = () => {
  const {
    alerts,
    acknowledgeAlert,
    acknowledgeAllAlerts,
    unreadAlertsCount,
    setSelectedParcelId,
  } = useFreshNex();
  const navigate = useNavigate();

  const [severityFilter, setSeverityFilter] = useState<'ALL' | 'RED' | 'YELLOW' | 'GREEN'>('ALL');
  const [localSearch, setLocalSearch] = useState('');

  const filtered = alerts.filter((a) => {
    const matchesSev = severityFilter === 'ALL' || a.severity === severityFilter;
    const q = localSearch.trim().toLowerCase();
    const matchesSearch =
      !q ||
      a.title.toLowerCase().includes(q) ||
      a.description.toLowerCase().includes(q) ||
      a.parcelId.toLowerCase().includes(q) ||
      a.deviceId.toLowerCase().includes(q);
    return matchesSev && matchesSearch;
  });

  const getIcon = (item: AlertItem) => {
    switch (item.sensorType) {
      case 'light':
        return <Sun className="w-4 h-4" />;
      case 'temperature':
        return <Thermometer className="w-4 h-4" />;
      case 'movement':
        return <Move className="w-4 h-4" />;
      default:
        return <FlaskConical className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-5">
      <div className="fnx-card p-5 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-[#102F46]">
            Condition Alerts & Threshold Log
          </h1>
          <p className="text-xs text-[#71869A] mt-0.5">
            Search, filter, and acknowledge threshold excursions. Note: Sensor alerts indicate environmental threshold events and do not independently prove food spoilage.
          </p>
        </div>

        {unreadAlertsCount > 0 && (
          <button
            onClick={acknowledgeAllAlerts}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#079B68] hover:bg-[#068559] text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
          >
            <CheckCheck className="w-4 h-4" />
            <span>Acknowledge All ({unreadAlertsCount})</span>
          </button>
        )}
      </div>

      {/* Filters & Search Bar */}
      <div className="fnx-card p-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          {(['ALL', 'RED', 'YELLOW', 'GREEN'] as const).map((sev) => (
            <button
              key={sev}
              onClick={() => setSeverityFilter(sev)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                severityFilter === sev
                  ? 'bg-[#079B68] text-white'
                  : 'bg-[#F7FAFC] border border-[#DFEAF0] text-[#71869A] hover:text-[#102F46]'
              }`}
            >
              {sev === 'ALL'
                ? 'All Severities'
                : sev === 'RED'
                ? 'RED — Critical'
                : sev === 'YELLOW'
                ? 'YELLOW — Warning'
                : 'GREEN — Normal'}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-[#71869A] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            placeholder="Filter by parcel, device, or alert..."
            className="w-full h-9 pl-9 pr-3 rounded-xl bg-[#F7FAFC] border border-[#DFEAF0] text-xs text-[#102F46] focus:outline-none focus:border-[#079B68]"
          />
        </div>
      </div>

      {/* Alert List */}
      <div className="space-y-3">
        {filtered.map((item) => (
          <div
            key={item.id}
            className="fnx-card p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
          >
            <div className="flex items-start gap-3.5">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                  item.severity === 'RED'
                    ? 'bg-[#FEECEC] text-[#EF5350]'
                    : item.severity === 'YELLOW'
                    ? 'bg-[#FFF8E6] text-[#F5B82E]'
                    : 'bg-[#E5F8F0] text-[#079B68]'
                }`}
              >
                {getIcon(item)}
              </div>

              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm font-extrabold text-[#102F46]">
                    {item.title}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10.5px] font-extrabold ${
                      item.severity === 'RED'
                        ? 'bg-[#FEECEC] text-[#EF5350]'
                        : item.severity === 'YELLOW'
                        ? 'bg-[#FFF8E6] text-[#B7791F]'
                        : 'bg-[#E5F8F0] text-[#079B68]'
                    }`}
                  >
                    {item.severity === 'RED'
                      ? 'Critical'
                      : item.severity === 'YELLOW'
                      ? 'Warning'
                      : 'Normal'}
                  </span>
                  {item.isDemonstration && (
                    <span className="px-2 py-0.5 rounded bg-[#F7FAFC] border border-[#DFEAF0] text-[10px] font-bold text-[#71869A]">
                      Demonstration Record
                    </span>
                  )}
                </div>

                <p className="text-xs text-[#71869A] mt-1">{item.description}</p>

                <div className="flex flex-wrap items-center gap-3 mt-2 text-[11px] text-[#71869A] font-mono-tabular">
                  <button
                    onClick={() => {
                      setSelectedParcelId(item.parcelId);
                      navigate('/parcels');
                    }}
                    className="font-bold text-[#079B68] hover:underline cursor-pointer"
                  >
                    Parcel: {item.parcelId}
                  </button>
                  <span>•</span>
                  <button
                    onClick={() => navigate('/devices')}
                    className="font-bold text-[#339AF0] hover:underline cursor-pointer"
                  >
                    Device: {item.deviceId}
                  </button>
                  {item.measuredValue && (
                    <>
                      <span>•</span>
                      <span>Reading: {item.measuredValue}</span>
                    </>
                  )}
                  {item.thresholdInfo && (
                    <>
                      <span>•</span>
                      <span>{item.thresholdInfo}</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0">
              <span className="text-xs font-semibold text-[#71869A] font-mono-tabular">
                {item.relativeTime}
              </span>
              {!item.acknowledged ? (
                <button
                  onClick={() => acknowledgeAlert(item.id)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#079B68] hover:bg-[#068559] text-white text-xs font-bold transition-colors cursor-pointer"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Acknowledge</span>
                </button>
              ) : (
                <span className="px-3 py-1.5 rounded-xl bg-[#E5F8F0] text-[#079B68] text-xs font-bold">
                  Acknowledged
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

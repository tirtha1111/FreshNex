import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sun, Thermometer, Move, FlaskConical, Check } from 'lucide-react';
import { useFreshNex } from '../../context/FreshNexContext';
import { AlertItem } from '../../types/freshnex';

export const RecentAlerts: React.FC = () => {
  const { alerts, acknowledgeAlert, setSelectedParcelId } = useFreshNex();
  const navigate = useNavigate();
  const [severityFilter, setSeverityFilter] = useState<'ALL' | 'RED' | 'YELLOW' | 'GREEN'>('ALL');

  const filtered = alerts
    .filter((a) => (severityFilter === 'ALL' ? true : a.severity === severityFilter))
    .slice(0, 4);

  const getSensorIcon = (item: AlertItem) => {
    const iconProps = 'w-4 h-4';
    switch (item.sensorType) {
      case 'light':
        return <Sun className={iconProps} />;
      case 'temperature':
        return <Thermometer className={iconProps} />;
      case 'movement':
        return <Move className={iconProps} />;
      default:
        return <FlaskConical className={iconProps} />;
    }
  };

  const getSeverityStyles = (item: AlertItem) => {
    if (item.sensorType === 'movement') {
      return {
        circleBg: 'bg-[#EBF5FF]',
        iconText: 'text-[#339AF0]',
      };
    }
    switch (item.severity) {
      case 'RED':
        return {
          circleBg: 'bg-[#FEECEC]',
          iconText: 'text-[#EF5350]',
        };
      case 'YELLOW':
        return {
          circleBg: 'bg-[#FFF8E6]',
          iconText: 'text-[#F5B82E]',
        };
      case 'GREEN':
      default:
        return {
          circleBg: 'bg-[#E5F8F0]',
          iconText: 'text-[#079B68]',
        };
    }
  };

  return (
    <div className="fnx-card p-5 flex flex-col justify-between">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <h2 className="text-[16px] font-extrabold text-[#102F46]">Recent Alerts</h2>
          </div>
          <button
            onClick={() => navigate('/alerts')}
            className="text-xs font-bold text-[#339AF0] hover:text-[#079B68] transition-colors cursor-pointer"
          >
            View All
          </button>
        </div>

        {/* Compact Severity Filter Pills */}
        <div className="flex items-center gap-1.5 mb-3">
          {(['ALL', 'RED', 'YELLOW', 'GREEN'] as const).map((sev) => (
            <button
              key={sev}
              onClick={() => setSeverityFilter(sev)}
              className={`px-2 py-0.5 rounded-md text-[10px] font-bold transition-colors cursor-pointer ${
                severityFilter === sev
                  ? 'bg-[#102F46] text-white'
                  : 'bg-[#F7FAFC] text-[#71869A] hover:text-[#102F46] border border-[#DFEAF0]'
              }`}
            >
              {sev === 'ALL'
                ? 'All'
                : sev === 'RED'
                ? 'Critical'
                : sev === 'YELLOW'
                ? 'Warning'
                : 'Normal'}
            </button>
          ))}
        </div>

        {/* Alert Items List */}
        <div className="divide-y divide-[#DFEAF0]">
          {filtered.map((item) => {
            const st = getSeverityStyles(item);
            return (
              <div
                key={item.id}
                className="py-3 first:pt-1 last:pb-1 flex items-start justify-between gap-3 group"
              >
                <div
                  onClick={() => {
                    setSelectedParcelId(item.parcelId);
                    navigate('/alerts');
                  }}
                  className="flex items-start gap-3 min-w-0 cursor-pointer flex-1"
                >
                  <div
                    className={`w-9 h-9 rounded-full ${st.circleBg} ${st.iconText} flex items-center justify-center shrink-0 mt-0.5`}
                  >
                    {getSensorIcon(item)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-[13px] font-bold text-[#102F46] group-hover:text-[#079B68] transition-colors truncate">
                      {item.title}
                    </div>
                    <p className="text-[11.5px] text-[#71869A] leading-snug mt-0.5">
                      {item.description}
                    </p>
                    <div className="flex items-center gap-2 mt-1 text-[10px] font-semibold text-[#71869A]">
                      <span className="font-mono-tabular">{item.parcelId}</span>
                      {item.isDemonstration && (
                        <span className="px-1.5 py-0.2 rounded bg-[#F7FAFC] border border-[#DFEAF0] text-[#71869A]">
                          Demo
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-1.5 shrink-0">
                  <span className="text-[11px] font-medium text-[#71869A] font-mono-tabular">
                    {item.relativeTime}
                  </span>
                  {!item.acknowledged ? (
                    <button
                      onClick={() => acknowledgeAlert(item.id)}
                      title="Acknowledge alert"
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#E5F8F0] hover:bg-[#079B68] text-[#079B68] hover:text-white text-[10px] font-bold transition-colors cursor-pointer"
                    >
                      <Check className="w-3 h-3" />
                      <span>Ack</span>
                    </button>
                  ) : (
                    <span className="text-[10px] font-semibold text-[#079B68]">
                      Acknowledged
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useFreshNex } from '../../context/FreshNexContext';

export const RecentActivity: React.FC = () => {
  const { activities, dataMode } = useFreshNex();
  const navigate = useNavigate();

  const dotColor = {
    green: 'bg-[#079B68]',
    blue: 'bg-[#339AF0]',
    amber: 'bg-[#F5B82E]',
    red: 'bg-[#EF5350]',
  };

  return (
    <div className="fnx-card p-5 flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <h2 className="text-[16px] font-extrabold text-[#102F46]">Recent Activity</h2>
            {dataMode === 'demo' && (
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#F7FAFC] border border-[#DFEAF0] text-[#71869A]">
                Demo
              </span>
            )}
          </div>
          <button
            onClick={() => navigate('/reports')}
            className="text-xs font-bold text-[#339AF0] hover:text-[#079B68] transition-colors cursor-pointer"
          >
            View All
          </button>
        </div>

        <div className="space-y-3 pt-1">
          {activities.slice(0, 5).map((act) => (
            <div
              key={act.id}
              className="flex items-center justify-between gap-3 text-[12.5px]"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <span
                  className={`w-2.5 h-2.5 rounded-full shrink-0 ${dotColor[act.statusColor]}`}
                />
                <span className="font-semibold text-[#102F46] truncate">{act.title}</span>
              </div>
              <span className="text-[11px] font-medium text-[#71869A] font-mono-tabular shrink-0">
                {act.relativeTime}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

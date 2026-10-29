import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';
import { SensorTrendChart } from '../../components/freshnex/SensorTrendChart';
import { useFreshNex } from '../../context/FreshNexContext';

export const AnalyticsView: React.FC = () => {
  const { alerts, parcels, dataMode } = useFreshNex();

  const alertFrequencyData = [
    { category: 'Temperature', warning: 2, critical: 1 },
    { category: 'Light Exposure', warning: 3, critical: 0 },
    { category: 'Motion / Tilt', warning: 2, critical: 0 },
    { category: 'MQ135 Elevated', warning: 1, critical: 0 },
    { category: 'Humidity', warning: 1, critical: 0 },
  ];

  const safeCount = parcels.filter((p) => p.status === 'SAFE').length;
  const warningCount = parcels.filter((p) => p.status === 'WARNING').length;
  const unknownCount = parcels.filter((p) => p.status === 'UNKNOWN').length;

  return (
    <div className="space-y-5">
      <div className="fnx-card p-5 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-[#102F46]">
            Sensor & Cold-Chain Analytics
          </h1>
          <p className="text-xs text-[#71869A] mt-0.5">
            Historical sensor trends, threshold compliance breakdown, and alert frequency across monitored parcels.
          </p>
        </div>
        <span className="px-3 py-1 rounded-full bg-[#E5F8F0] text-[#079B68] text-xs font-bold">
          {dataMode === 'demo' ? 'Demonstration Dataset' : 'Live RTDB Dataset'}
        </span>
      </div>

      {/* Summary KPI Row */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="fnx-card p-4">
          <div className="text-xs font-medium text-[#71869A]">Monitored Parcels</div>
          <div className="text-2xl font-extrabold text-[#102F46] font-mono-tabular mt-1">
            {parcels.length}
          </div>
          <div className="text-[11px] text-[#079B68] font-semibold mt-0.5">
            {safeCount} Within Thresholds
          </div>
        </div>
        <div className="fnx-card p-4">
          <div className="text-xs font-medium text-[#71869A]">Warning Excursions</div>
          <div className="text-2xl font-extrabold text-[#F5B82E] font-mono-tabular mt-1">
            {warningCount}
          </div>
          <div className="text-[11px] text-[#71869A] mt-0.5">
            Near configured upper bound
          </div>
        </div>
        <div className="fnx-card p-4">
          <div className="text-xs font-medium text-[#71869A]">Recorded Alert Events</div>
          <div className="text-2xl font-extrabold text-[#102F46] font-mono-tabular mt-1">
            {alerts.length}
          </div>
          <div className="text-[11px] text-[#71869A] mt-0.5">
            Threshold-based notifications
          </div>
        </div>
        <div className="fnx-card p-4">
          <div className="text-xs font-medium text-[#71869A]">Awaiting GPS / Offline</div>
          <div className="text-2xl font-extrabold text-[#71869A] font-mono-tabular mt-1">
            {unknownCount}
          </div>
          <div className="text-[11px] text-[#71869A] mt-0.5">
            Unfabricated stale state
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <div className="lg:col-span-7">
          <SensorTrendChart />
        </div>

        <div className="lg:col-span-5 fnx-card p-5 flex flex-col justify-between">
          <div>
            <h2 className="text-base font-extrabold text-[#102F46]">
              Alert Frequency by Sensor Type
            </h2>
            <p className="text-xs text-[#71869A] mt-0.5">
              Distribution of threshold warnings and critical excursions (7-day window).
            </p>
          </div>

          <div className="h-[220px] w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={alertFrequencyData}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#EDF2F7" />
                <XAxis
                  dataKey="category"
                  tick={{ fontSize: 10.5, fill: '#71869A', fontWeight: 600 }}
                />
                <YAxis tick={{ fontSize: 11, fill: '#71869A' }} />
                <Tooltip />
                <Bar dataKey="warning" name="Warning" fill="#F5B82E" radius={[6, 6, 0, 0]} />
                <Bar dataKey="critical" name="Critical" fill="#EF5350" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="text-[11px] text-[#71869A] pt-3 border-t border-[#DFEAF0]">
            Note: Elevated MQ135 readings indicate broad-response gas changes and require physical inspection rather than standalone spoilage conclusions.
          </div>
        </div>
      </div>
    </div>
  );
};

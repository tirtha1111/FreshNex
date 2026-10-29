import React, { useState } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';
import { useFreshNex } from '../../context/FreshNexContext';

const CustomTrendTooltip: React.FC<any> = ({ active, payload, label }) => {
  if (!active || !payload || !payload.length) return null;
  const pt = payload[0]?.payload;
  if (!pt) return null;

  return (
    <div className="bg-white border border-[#DFEAF0] rounded-xl p-3 shadow-lg text-xs space-y-1.5 min-w-[205px]">
      <div className="font-bold text-[#102F46] border-b border-[#DFEAF0] pb-1 flex items-center justify-between">
        <span>Timestamp: {label}</span>
        <span className="text-[10px] font-semibold text-[#079B68]">Recorded</span>
      </div>
      <div className="flex items-center justify-between gap-3">
        <span className="flex items-center gap-1.5 text-[#71869A]">
          <span className="w-2 h-2 rounded-full bg-[#EF5350]" />
          Temperature:
        </span>
        <span className="font-bold text-[#102F46] font-mono-tabular">
          {pt.temperature.toFixed(1)} °C
        </span>
      </div>
      <div className="flex items-center justify-between gap-3">
        <span className="flex items-center gap-1.5 text-[#71869A]">
          <span className="w-2 h-2 rounded-full bg-[#339AF0]" />
          Humidity:
        </span>
        <span className="font-bold text-[#102F46] font-mono-tabular">{pt.humidity}% RH</span>
      </div>
      <div className="flex items-center justify-between gap-3">
        <span className="flex items-center gap-1.5 text-[#71869A]">
          <span className="w-2 h-2 rounded-full bg-[#F5B82E]" />
          MQ135 Raw Signal:
        </span>
        <span className="font-bold text-[#102F46] font-mono-tabular">
          {pt.mq135Raw} raw ADC
        </span>
      </div>
      <div className="flex items-center justify-between gap-3">
        <span className="flex items-center gap-1.5 text-[#71869A]">
          <span className="w-2 h-2 rounded-full bg-[#845EF7]" />
          Light Intensity:
        </span>
        <span className="font-bold text-[#102F46] font-mono-tabular">{pt.lightLux} lux</span>
      </div>
      {pt.phValue !== null && (
        <div className="flex items-center justify-between gap-3">
          <span className="flex items-center gap-1.5 text-[#71869A]">
            <span className="w-2 h-2 rounded-full bg-[#079B68]" />
            Connected pH:
          </span>
          <span className="font-bold text-[#102F46] font-mono-tabular">
            {pt.phValue.toFixed(1)} pH
          </span>
        </div>
      )}
    </div>
  );
};

export const SensorTrendChart: React.FC = () => {
  const {
    trendTimeRange,
    setTrendTimeRange,
    trendData,
    currentTelemetry,
    dataMode,
  } = useFreshNex();

  const [viewMode, setViewMode] = useState<'normalized' | 'thermal'>('normalized');

  const ranges: ('1H' | '6H' | '12H' | '24H')[] = ['1H', '6H', '12H', '24H'];
  const hasPh = currentTelemetry.phConnected && currentTelemetry.phValue !== null;

  // Map data for visual multi-series display so all series remain legible on 0-100 scale
  const chartData = trendData.map((d) => ({
    ...d,
    tempPlotted: viewMode === 'normalized' ? Math.round(d.temperature * 10) : d.temperature,
    phPlotted: d.phValue !== null ? Math.round(d.phValue * 8) : null,
  }));

  return (
    <div className="fnx-card p-5 flex flex-col justify-between h-full">
      {/* Top Header: Title + Live Badge + Time Range Buttons */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2.5">
          <h2 className="text-[16px] font-extrabold text-[#102F46]">Live Sensor Trends</h2>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#E5F8F0] text-[#079B68] text-[11px] font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-[#079B68] animate-pulse" />
            {dataMode === 'live' ? 'Live' : 'Live (Demo)'}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() =>
              setViewMode((v) => (v === 'normalized' ? 'thermal' : 'normalized'))
            }
            className="hidden sm:inline-block px-2.5 py-1 rounded-lg border border-[#DFEAF0] bg-[#F7FAFC] text-[11px] font-semibold text-[#71869A] hover:text-[#102F46] transition-colors"
            title="Switch between multi-sensor normalized index and Temp/Humidity view"
          >
            {viewMode === 'normalized' ? 'Multi-Unit Scaled' : 'Temp & %RH Only'}
          </button>

          <div className="flex items-center bg-[#F7FAFC] border border-[#DFEAF0] rounded-full p-0.5">
            {ranges.map((r) => (
              <button
                key={r}
                onClick={() => setTrendTimeRange(r)}
                className={`px-2.5 py-1 rounded-full text-[11.5px] font-bold transition-all cursor-pointer ${
                  trendTimeRange === r
                    ? 'bg-[#079B68] text-white shadow-2xs'
                    : 'text-[#71869A] hover:text-[#102F46]'
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Recharts Line Chart */}
      <div className="h-[210px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 8, right: 12, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#EDF2F7" vertical={true} />
            <XAxis
              dataKey="time"
              tick={{ fontSize: 11, fill: '#71869A', fontWeight: 500 }}
              axisLine={{ stroke: '#DFEAF0' }}
              tickLine={false}
            />
            <YAxis
              domain={[20, 100]}
              tick={{ fontSize: 11, fill: '#71869A', fontWeight: 500 }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip content={<CustomTrendTooltip />} />

            {/* Humidity (%) - Blue */}
            <Line
              type="monotone"
              dataKey="humidity"
              name="Humidity (%)"
              stroke="#339AF0"
              strokeWidth={2.2}
              dot={false}
              activeDot={{ r: 4 }}
            />

            {/* Temperature (°C scaled for multi-series visibility) - Red/Coral */}
            <Line
              type="monotone"
              dataKey="tempPlotted"
              name="Temperature (°C)"
              stroke="#EF5350"
              strokeWidth={2.2}
              dot={false}
              activeDot={{ r: 4 }}
            />

            {viewMode === 'normalized' && (
              <>
                {/* Gas MQ135 Raw Response (Scaled) - Amber */}
                <Line
                  type="monotone"
                  dataKey="mq135Scaled"
                  name="Gas (MQ135 Raw)"
                  stroke="#F5B82E"
                  strokeWidth={2.2}
                  dot={false}
                  activeDot={{ r: 4 }}
                />

                {/* Light Intensity (lux scaled) - Purple */}
                <Line
                  type="monotone"
                  dataKey="lightScaled"
                  name="Light (lux)"
                  stroke="#845EF7"
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4 }}
                />

                {/* pH - Green (Only when actual pH data exists) */}
                {hasPh && (
                  <Line
                    type="monotone"
                    dataKey="phPlotted"
                    name="pH"
                    stroke="#079B68"
                    strokeWidth={2.2}
                    dot={false}
                    activeDot={{ r: 4 }}
                  />
                )}
              </>
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Bottom Custom Legend matching reference image */}
      <div className="pt-3 mt-2 border-t border-[#DFEAF0] flex flex-wrap items-center justify-between gap-2 text-[11px] font-semibold text-[#71869A]">
        <div className="flex flex-wrap items-center gap-4">
          <span className="inline-flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#EF5350]" />
            <span>Temperature (°C)</span>
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#339AF0]" />
            <span>Humidity (%)</span>
          </span>
          {viewMode === 'normalized' && (
            <>
              <span className="inline-flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#F5B82E]" />
                <span>Gas (MQ135 raw)</span>
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#845EF7]" />
                <span>Light (lux)</span>
              </span>
              {hasPh && (
                <span className="inline-flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#079B68]" />
                  <span>pH</span>
                </span>
              )}
            </>
          )}
        </div>
        <span className="text-[10px] text-[#71869A]">
          Hover points for exact unscaled sensor units
        </span>
      </div>
    </div>
  );
};

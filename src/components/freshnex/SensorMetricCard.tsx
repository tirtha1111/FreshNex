import React from 'react';
import { ResponsiveContainer, AreaChart, Area } from 'recharts';
import { Thermometer, Droplets, Wind, FlaskConical, Sun } from 'lucide-react';
import { useFreshNex } from '../../context/FreshNexContext';
import { SensorStatusLabel } from '../../types/freshnex';

interface SingleSensorCardProps {
  title: string;
  valueDisplay: string;
  subUnitLabel?: string;
  status: SensorStatusLabel;
  rangeText: string;
  helperNote?: string;
  sparklineColor: string;
  sparklineFillId: string;
  iconBgClass: string;
  iconColorClass: string;
  Icon: React.FC<{ className?: string }>;
  data: { v: number }[];
  actionControl?: React.ReactNode;
}

const SingleSensorCard: React.FC<SingleSensorCardProps> = ({
  title,
  valueDisplay,
  subUnitLabel,
  status,
  rangeText,
  helperNote,
  sparklineColor,
  sparklineFillId,
  iconBgClass,
  iconColorClass,
  Icon,
  data,
  actionControl,
}) => {
  const badgeClasses = {
    Normal: 'bg-[#E5F8F0] text-[#079B68] border-[#079B68]/20',
    Warning: 'bg-[#FFF8E6] text-[#B7791F] border-[#F5B82E]/35',
    Critical: 'bg-[#FEECEC] text-[#EF5350] border-[#EF5350]/35',
    'Not Connected': 'bg-[#F0F4F8] text-[#71869A] border-[#DFEAF0]',
    'No Data': 'bg-[#F0F4F8] text-[#71869A] border-[#DFEAF0]',
    Stale: 'bg-[#F0F4F8] text-[#71869A] border-[#DFEAF0]',
  }[status];

  return (
    <div className="fnx-card fnx-card-hover p-4 flex flex-col justify-between min-h-[188px]">
      <div>
        {/* Card Header: Tinted Icon Box + Title */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div
              className={`w-8 h-8 rounded-full ${iconBgClass} ${iconColorClass} flex items-center justify-center shrink-0`}
            >
              <Icon className="w-4 h-4" />
            </div>
            <h3 className="text-[13px] font-bold text-[#102F46] truncate">{title}</h3>
          </div>
          {actionControl}
        </div>

        {/* Main Metric Value + Status Badge */}
        <div className="flex items-baseline justify-between gap-2 my-1">
          <div className="flex items-baseline gap-1 min-w-0">
            <span
              className={`font-extrabold tracking-tight text-[#102F46] font-mono-tabular ${
                valueDisplay.length > 9 ? 'text-[17px]' : 'text-[25px]'
              }`}
            >
              {valueDisplay}
            </span>
            {subUnitLabel && (
              <span className="text-[11px] font-bold text-[#71869A]">{subUnitLabel}</span>
            )}
          </div>

          <span
            className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border shrink-0 ${badgeClasses}`}
          >
            {status}
          </span>
        </div>

        {/* Configured Acceptable Range */}
        <div className="text-[11.5px] font-medium text-[#71869A] font-mono-tabular mt-0.5">
          {rangeText}
        </div>
        {helperNote && (
          <div className="text-[10px] text-[#71869A]/90 mt-0.5 leading-tight">
            {helperNote}
          </div>
        )}
      </div>

      {/* Compact Sparkline Chart */}
      <div className="h-12 w-full mt-2 -mx-1">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 4, right: 2, left: 2, bottom: 0 }}>
            <defs>
              <linearGradient id={sparklineFillId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={sparklineColor} stopOpacity={0.25} />
                <stop offset="95%" stopColor={sparklineColor} stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <Area
              type="monotone"
              dataKey="v"
              stroke={sparklineColor}
              strokeWidth={2}
              fillOpacity={1}
              fill={`url(#${sparklineFillId})`}
              isAnimationActive={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export const SensorMetricsGrid: React.FC = () => {
  const {
    currentTelemetry,
    selectedThreshold,
    formatTemperature,
    demoPhProbeConnected,
    setDemoPhProbeConnected,
    dataMode,
  } = useFreshNex();

  // 1. Temperature evaluation
  const tempVal = currentTelemetry.temperatureC;
  const tempStatus: SensorStatusLabel =
    currentTelemetry.isStale
      ? 'Stale'
      : tempVal === null
      ? 'No Data'
      : tempVal > selectedThreshold.temperature.max ||
        tempVal < selectedThreshold.temperature.min
      ? 'Critical'
      : tempVal >
          selectedThreshold.temperature.max - selectedThreshold.temperature.warningMargin ||
        tempVal <
          selectedThreshold.temperature.min + selectedThreshold.temperature.warningMargin
      ? 'Warning'
      : 'Normal';

  // 2. Humidity evaluation
  const humVal = currentTelemetry.humidityRH;
  const humStatus: SensorStatusLabel =
    currentTelemetry.isStale
      ? 'Stale'
      : humVal === null
      ? 'No Data'
      : humVal > selectedThreshold.humidity.max + selectedThreshold.humidity.warningMargin ||
        humVal < selectedThreshold.humidity.min - selectedThreshold.humidity.warningMargin
      ? 'Critical'
      : humVal > selectedThreshold.humidity.max || humVal < selectedThreshold.humidity.min
      ? 'Warning'
      : 'Normal';

  // 3. Gas Level (MQ135) evaluation (Strict honesty: raw sensor reading, not fabricated ppm spoilage proof)
  const gasVal = currentTelemetry.mq135Raw;
  const gasStatus: SensorStatusLabel =
    currentTelemetry.isStale
      ? 'Stale'
      : gasVal === null
      ? 'No Data'
      : gasVal > selectedThreshold.mq135Raw.warningMax
      ? 'Critical'
      : gasVal > selectedThreshold.mq135Raw.normalMax
      ? 'Warning'
      : 'Normal';

  // 4. Calculated pH evaluation (Strict rule: Only show if actual pH sensor connected; never fabricate from MQ135/temp/humidity)
  const phConnected = currentTelemetry.phConnected && currentTelemetry.phValue !== null;
  const phStatus: SensorStatusLabel = !phConnected
    ? 'Not Connected'
    : currentTelemetry.phValue! < selectedThreshold.phRange.min ||
      currentTelemetry.phValue! > selectedThreshold.phRange.max
    ? 'Warning'
    : 'Normal';

  // 5. Light Intensity evaluation
  const luxVal = currentTelemetry.lightLux;
  const luxStatus: SensorStatusLabel =
    currentTelemetry.isStale
      ? 'Stale'
      : luxVal === null
      ? 'No Data'
      : luxVal > selectedThreshold.lightLux.warningMax
      ? 'Critical'
      : luxVal > selectedThreshold.lightLux.max
      ? 'Warning'
      : 'Normal';

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
      {/* CARD 1 — TEMPERATURE */}
      <SingleSensorCard
        title="Temperature"
        valueDisplay={formatTemperature(tempVal)}
        status={tempStatus}
        rangeText={`(${selectedThreshold.temperature.min}°C – ${selectedThreshold.temperature.max}°C)`}
        helperNote="SHT31 Digital Probe"
        sparklineColor="#079B68"
        sparklineFillId="spark-temp"
        iconBgClass="bg-[#E5F8F0]"
        iconColorClass="text-[#079B68]"
        Icon={Thermometer}
        data={[
          { v: 3.9 },
          { v: 4.1 },
          { v: 4.0 },
          { v: 4.4 },
          { v: 4.2 },
          { v: 4.5 },
          { v: tempVal ?? 4.2 },
        ]}
      />

      {/* CARD 2 — HUMIDITY */}
      <SingleSensorCard
        title="Humidity"
        valueDisplay={humVal !== null ? `${humVal}%` : 'No Data'}
        subUnitLabel={humVal !== null ? 'RH' : undefined}
        status={humStatus}
        rangeText={`(${selectedThreshold.humidity.min}% – ${selectedThreshold.humidity.max}%)`}
        helperNote="Relative Humidity"
        sparklineColor="#339AF0"
        sparklineFillId="spark-hum"
        iconBgClass="bg-[#EBF5FF]"
        iconColorClass="text-[#339AF0]"
        Icon={Droplets}
        data={[
          { v: 65 },
          { v: 67 },
          { v: 66 },
          { v: 70 },
          { v: 68 },
          { v: 69 },
          { v: humVal ?? 68 },
        ]}
      />

      {/* CARD 3 — GAS LEVEL (MQ135) */}
      <SingleSensorCard
        title="Gas Level (MQ135)"
        valueDisplay={gasVal !== null ? `${gasVal}` : 'No Data'}
        subUnitLabel={gasVal !== null ? 'raw ADC' : undefined}
        status={gasStatus}
        rangeText={`(0 – ${selectedThreshold.mq135Raw.normalMax} raw baseline)`}
        helperNote="Broad-response signal (uncalibrated)"
        sparklineColor="#F5B82E"
        sparklineFillId="spark-gas"
        iconBgClass="bg-[#FFF8E6]"
        iconColorClass="text-[#F5B82E]"
        Icon={Wind}
        data={[
          { v: 112 },
          { v: 118 },
          { v: 115 },
          { v: 126 },
          { v: 119 },
          { v: 124 },
          { v: gasVal ?? 120 },
        ]}
      />

      {/* CARD 4 — CALCULATED pH */}
      <SingleSensorCard
        title="Calculated pH"
        valueDisplay={phConnected ? `${currentTelemetry.phValue!.toFixed(1)}` : 'Not Connected'}
        status={phStatus}
        rangeText={
          phConnected
            ? `(${selectedThreshold.phRange.min.toFixed(1)} – ${selectedThreshold.phRange.max.toFixed(1)} pH)`
            : 'Requires dedicated pH electrode'
        }
        helperNote={
          phConnected
            ? 'Dedicated BNC pH Probe (Demo)'
            : 'Never fabricated from gas/temp'
        }
        sparklineColor="#9775FA"
        sparklineFillId="spark-ph"
        iconBgClass="bg-[#F3EEFF]"
        iconColorClass="text-[#845EF7]"
        Icon={FlaskConical}
        data={
          phConnected
            ? [{ v: 6.7 }, { v: 6.8 }, { v: 6.7 }, { v: 6.9 }, { v: 6.8 }, { v: 6.8 }]
            : [{ v: 0 }, { v: 0 }, { v: 0 }, { v: 0 }, { v: 0 }, { v: 0 }]
        }
        actionControl={
          dataMode === 'demo' ? (
            <button
              onClick={() => setDemoPhProbeConnected(!demoPhProbeConnected)}
              className="text-[10px] font-bold px-2 py-0.5 rounded-md border border-[#DFEAF0] bg-[#F7FAFC] hover:border-[#845EF7] text-[#71869A] hover:text-[#102F46] transition-colors"
              title="Toggle simulated hardware pH sensor connection in Demonstration Mode"
            >
              {demoPhProbeConnected ? 'Disconnect' : 'Test Probe'}
            </button>
          ) : undefined
        }
      />

      {/* CARD 5 — LIGHT INTENSITY */}
      <SingleSensorCard
        title="Light Intensity"
        valueDisplay={luxVal !== null ? `${luxVal} lux` : 'No Data'}
        status={luxStatus}
        rangeText={`(${selectedThreshold.lightLux.min} – ${selectedThreshold.lightLux.max} lux)`}
        helperNote="BH1750 Optical Sensor"
        sparklineColor="#F5B82E"
        sparklineFillId="spark-light"
        iconBgClass="bg-[#FFF8E6]"
        iconColorClass="text-[#F5B82E]"
        Icon={Sun}
        data={[
          { v: 290 },
          { v: 315 },
          { v: 300 },
          { v: 340 },
          { v: 310 },
          { v: 330 },
          { v: luxVal ?? 320 },
        ]}
      />
    </div>
  );
};

import React from 'react';
import {
  Radio,
  Cpu,
  Activity,
  Compass,
  Satellite,
  RefreshCw,
  AlertTriangle,
  ShieldCheck,
  Terminal,
} from 'lucide-react';
import { useFreshNex } from '../../context/FreshNexContext';
import { SensorMetricsGrid } from '../../components/freshnex/SensorMetricCard';
import { SensorTrendChart } from '../../components/freshnex/SensorTrendChart';
import { LocationMap } from '../../components/freshnex/LocationMap';

export const LiveMonitoringView: React.FC = () => {
  const {
    selectedParcel,
    selectedDevice,
    currentTelemetry,
    overallParcelStatus,
    dataMode,
    setDataMode,
    parcels,
    setSelectedParcelId,
    simulateThresholdExcursion,
    demoPhProbeConnected,
    setDemoPhProbeConnected,
  } = useFreshNex();

  const rawPayloadPreview = {
    device_id: selectedDevice.id,
    parcel_id: selectedParcel.id,
    mode: dataMode,
    timestamp_ms: currentTelemetry.timestamp,
    sensors: {
      sht31: {
        temperature_c: currentTelemetry.temperatureC,
        humidity_rh: currentTelemetry.humidityRH,
      },
      mq135: {
        raw_adc: currentTelemetry.mq135Raw,
        calibrated_ppm: null,
        note: 'Uncalibrated broad-response sensor signal',
      },
      bh1750: {
        light_lux: currentTelemetry.lightLux,
      },
      mpu6050: {
        impact_g: currentTelemetry.impactG,
        tilt_deg: currentTelemetry.tiltDegrees,
        motion_state: currentTelemetry.movementState,
      },
      neo6m_gps: {
        fix_valid: currentTelemetry.gpsFixAvailable,
        lat: currentTelemetry.latitude,
        lng: currentTelemetry.longitude,
        speed_kmh: currentTelemetry.speedKmh,
      },
      ph_electrode: {
        connected: currentTelemetry.phConnected,
        ph_value: currentTelemetry.phValue,
      },
    },
    diagnostics: {
      enclosure_temp_c: currentTelemetry.deviceEnclosureTempC,
      battery_pct: currentTelemetry.batteryPercent,
      rssi_dbm: currentTelemetry.rssiDbm,
    },
  };

  return (
    <div className="space-y-5">
      {/* Page Header */}
      <div className="fnx-card p-5 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#079B68] animate-ping" />
            <span className="text-xs font-extrabold uppercase tracking-wider text-[#079B68]">
              Real-Time IoT Stream
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-[#102F46] mt-0.5">
            Live Sensor & Hardware Monitoring
          </h1>
          <p className="text-xs text-[#71869A] mt-0.5">
            Inspect live telemetry from ESP32 smart container nodes, motion/impact status, and sensor diagnostics.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <select
            value={selectedParcel.id}
            onChange={(e) => setSelectedParcelId(e.target.value)}
            className="h-10 px-3 rounded-xl bg-[#F7FAFC] border border-[#DFEAF0] text-xs font-bold text-[#102F46] focus:outline-none focus:border-[#079B68]"
          >
            {parcels.map((p) => (
              <option key={p.id} value={p.id}>
                {p.id} — {p.productName} ({p.deviceId})
              </option>
            ))}
          </select>

          <div className="flex items-center bg-[#F7FAFC] border border-[#DFEAF0] rounded-xl p-1 text-xs font-bold">
            <button
              onClick={() => setDataMode('demo')}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                dataMode === 'demo'
                  ? 'bg-[#079B68] text-white'
                  : 'text-[#71869A] hover:text-[#102F46]'
              }`}
            >
              Demo Stream
            </button>
            <button
              onClick={() => setDataMode('live')}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                dataMode === 'live'
                  ? 'bg-[#079B68] text-white'
                  : 'text-[#71869A] hover:text-[#102F46]'
              }`}
            >
              Live ESP32
            </button>
            <button
              onClick={() => setDataMode('stale')}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                dataMode === 'stale'
                  ? 'bg-[#102F46] text-white'
                  : 'text-[#71869A] hover:text-[#102F46]'
              }`}
            >
              Stale State
            </button>
          </div>
        </div>
      </div>

      {/* Interactive Threshold & Sensor Simulation Bar (Available in Demo Mode) */}
      {dataMode === 'demo' && (
        <div className="fnx-card p-4 bg-[#E5F8F0]/50 border-[#079B68]/25 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <AlertTriangle className="w-4 h-4 text-[#079B68]" />
            <span className="text-xs font-bold text-[#102F46]">
              Interactive Condition Simulator (Demonstration Mode):
            </span>
            <span className="text-xs text-[#71869A]">
              Test how threshold excursions update parcel status and trigger alerts.
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => simulateThresholdExcursion('temp')}
              className="px-3 py-1.5 rounded-lg bg-white border border-[#EF5350]/40 text-[#EF5350] text-xs font-bold hover:bg-[#FEECEC] transition-colors cursor-pointer"
            >
              Simulate High Temp (8.9°C)
            </button>
            <button
              onClick={() => simulateThresholdExcursion('light')}
              className="px-3 py-1.5 rounded-lg bg-white border border-[#F5B82E]/50 text-[#B7791F] text-xs font-bold hover:bg-[#FFF8E6] transition-colors cursor-pointer"
            >
              Simulate Lid Opened (1,180 lux)
            </button>
            <button
              onClick={() => simulateThresholdExcursion('gas')}
              className="px-3 py-1.5 rounded-lg bg-white border border-[#F5B82E]/50 text-[#B7791F] text-xs font-bold hover:bg-[#FFF8E6] transition-colors cursor-pointer"
            >
              Simulate Elevated MQ135 (365 raw)
            </button>
            <button
              onClick={() => setDemoPhProbeConnected(!demoPhProbeConnected)}
              className="px-3 py-1.5 rounded-lg bg-white border border-[#DFEAF0] text-[#102F46] text-xs font-bold hover:border-[#079B68] transition-colors cursor-pointer"
            >
              {demoPhProbeConnected ? 'Disconnect Demo pH Probe' : 'Connect Demo pH Probe'}
            </button>
            <button
              onClick={() => simulateThresholdExcursion('reset')}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#079B68] text-white text-xs font-bold hover:bg-[#068559] transition-colors cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Reset to Normal
            </button>
          </div>
        </div>
      )}

      {/* 5 Sensor Metric Cards */}
      <SensorMetricsGrid />

      {/* Hardware Peripherals: MPU6050 Motion/Impact + NEO-6M GPS + Node Diagnostics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* MPU6050 Accelerometer / Gyroscope Card */}
        <div className="fnx-card p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-full bg-[#EBF5FF] text-[#339AF0] flex items-center justify-center">
                <Compass className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-[#102F46]">
                  Impact & Orientation (MPU6050)
                </h3>
                <p className="text-[11px] text-[#71869A]">3-Axis Accelerometer & Gyroscope</p>
              </div>
            </div>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#E5F8F0] text-[#079B68]">
              {currentTelemetry.movementState}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 mt-4">
            <div className="p-3 rounded-xl bg-[#F7FAFC] border border-[#DFEAF0]">
              <div className="text-[11px] text-[#71869A]">Peak G-Force</div>
              <div className="text-lg font-extrabold text-[#102F46] font-mono-tabular mt-0.5">
                {currentTelemetry.impactG !== null ? `${currentTelemetry.impactG} g` : 'No Data'}
              </div>
              <div className="text-[10px] text-[#71869A]">Threshold: &lt; 1.8 g</div>
            </div>
            <div className="p-3 rounded-xl bg-[#F7FAFC] border border-[#DFEAF0]">
              <div className="text-[11px] text-[#71869A]">Container Tilt Angle</div>
              <div className="text-lg font-extrabold text-[#102F46] font-mono-tabular mt-0.5">
                {currentTelemetry.tiltDegrees !== null
                  ? `${currentTelemetry.tiltDegrees}°`
                  : 'No Data'}
              </div>
              <div className="text-[10px] text-[#71869A]">Max limit: 25°</div>
            </div>
          </div>
        </div>

        {/* NEO-6M GPS Module Status */}
        <div className="fnx-card p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-full bg-[#E5F8F0] text-[#079B68] flex items-center justify-center">
                <Satellite className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-[#102F46]">
                  NEO-6M Satellite Receiver
                </h3>
                <p className="text-[11px] text-[#71869A]">
                  Positioning Only (ESP32 Wi-Fi Uplink)
                </p>
              </div>
            </div>
            <span
              className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                currentTelemetry.gpsFixAvailable
                  ? 'bg-[#E5F8F0] text-[#079B68]'
                  : 'bg-[#F0F4F8] text-[#71869A]'
              }`}
            >
              {currentTelemetry.gpsFixAvailable ? '3D Fix Locked' : 'Searching'}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 mt-4">
            <div className="p-3 rounded-xl bg-[#F7FAFC] border border-[#DFEAF0]">
              <div className="text-[11px] text-[#71869A]">Coordinates</div>
              <div className="text-xs font-extrabold text-[#102F46] font-mono-tabular mt-1">
                {currentTelemetry.gpsFixAvailable && currentTelemetry.locationLabel
                  ? currentTelemetry.locationLabel
                  : 'Waiting for GPS signal'}
              </div>
            </div>
            <div className="p-3 rounded-xl bg-[#F7FAFC] border border-[#DFEAF0]">
              <div className="text-[11px] text-[#71869A]">Ground Speed</div>
              <div className="text-lg font-extrabold text-[#102F46] font-mono-tabular mt-0.5">
                {currentTelemetry.gpsFixAvailable && currentTelemetry.speedKmh !== null
                  ? `${currentTelemetry.speedKmh} km/h`
                  : 'N/A'}
              </div>
            </div>
          </div>
        </div>

        {/* ESP32 Controller Health */}
        <div className="fnx-card p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-full bg-[#E5F8F0] text-[#079B68] flex items-center justify-center">
                <Cpu className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-[#102F46]">
                  {selectedDevice.id} Diagnostics
                </h3>
                <p className="text-[11px] text-[#71869A]">{selectedDevice.mcuModel}</p>
              </div>
            </div>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#E5F8F0] text-[#079B68]">
              {overallParcelStatus}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 mt-4">
            <div className="p-3 rounded-xl bg-[#F7FAFC] border border-[#DFEAF0]">
              <div className="text-[11px] text-[#71869A]">Enclosure Temp</div>
              <div className="text-lg font-extrabold text-[#102F46] font-mono-tabular mt-0.5">
                {currentTelemetry.deviceEnclosureTempC !== null
                  ? `${currentTelemetry.deviceEnclosureTempC}°C`
                  : 'No Data'}
              </div>
              <div className="text-[10px] text-[#71869A]">Separate from food probe</div>
            </div>
            <div className="p-3 rounded-xl bg-[#F7FAFC] border border-[#DFEAF0]">
              <div className="text-[11px] text-[#71869A]">Battery & RSSI</div>
              <div className="text-lg font-extrabold text-[#102F46] font-mono-tabular mt-0.5">
                {currentTelemetry.batteryPercent !== null
                  ? `${currentTelemetry.batteryPercent}%`
                  : 'N/A'}
              </div>
              <div className="text-[10px] text-[#71869A] font-mono-tabular">
                Signal: {currentTelemetry.rssiDbm ?? '--'} dBm
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Live Trend Chart + Map + Raw Telemetry JSON Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <div className="lg:col-span-7">
          <SensorTrendChart />
        </div>
        <div className="lg:col-span-5">
          <LocationMap />
        </div>
      </div>

      {/* Raw JSON Telemetry Packet Inspector */}
      <div className="fnx-card p-5">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-[#079B68]" />
            <h3 className="text-sm font-extrabold text-[#102F46]">
              ESP32 Telemetry Payload Inspector
            </h3>
          </div>
          <span className="text-[11px] font-mono-tabular text-[#71869A]">
            Endpoint: POST /api/telemetry • Firebase RTDB
          </span>
        </div>
        <pre className="p-4 rounded-xl bg-[#102F46] text-[#E5F8F0] text-xs font-mono-tabular overflow-x-auto leading-relaxed">
          {JSON.stringify(rawPayloadPreview, null, 2)}
        </pre>
      </div>
    </div>
  );
};

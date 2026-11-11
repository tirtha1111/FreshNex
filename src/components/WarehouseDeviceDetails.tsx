import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { getDirectDatabase } from '../services/firebaseService';
import { ensureFirebaseAuthenticated } from '../firebase/firebase';
import { ref, onValue, off } from 'firebase/database';
import {
  ArrowLeft,
  ShieldCheck,
  Radio,
  Thermometer,
  Droplets,
  Wind,
  Sun,
  Activity,
  Warehouse,
  Clock,
  Cpu,
  RefreshCw,
  ExternalLink,
  Waves,
  Sparkles,
  Navigation,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { calculateMoisture } from '../utils/moistureCalculator';
import { calculatePH } from '../utils/phCalculator';
import { formatRealtimeDateTime } from '../utils/dateUtils';
import { Link } from 'react-router-dom';

interface WarehouseDeviceDetailsProps {
  deviceId: string;
  rfidUid?: string;
  warehouseId?: string;
  warehouseDevice?: string;
  lastScanTimestamp?: number;
  onBack: () => void;
}

export const WarehouseDeviceDetails: React.FC<WarehouseDeviceDetailsProps> = ({
  deviceId,
  rfidUid,
  warehouseId = 'WH-001',
  warehouseDevice = 'FRESHNEX-WH-001',
  lastScanTimestamp,
  onBack,
}) => {
  const [deviceData, setDeviceData] = useState<any | null>(null);
  const [registryEntry, setRegistryEntry] = useState<{
    product?: string;
    active?: boolean;
    device_id?: string;
  } | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [telemetryHistory, setTelemetryHistory] = useState<
    Array<{
      time: string;
      temp: number | null;
      hum: number | null;
      gas: number | null;
      light: number | null;
    }>
  >([]);
  const [activeTab, setActiveTab] = useState<'temp' | 'hum' | 'gas' | 'light'>('temp');

  useEffect(() => {
    let isCancelled = false;
    let cleanupDevice: (() => void) | null = null;
    let cleanupRegistry: (() => void) | null = null;

    const initSubscriptions = async () => {
      setLoading(true);
      await ensureFirebaseAuthenticated();
      if (isCancelled) return;

      const db = getDirectDatabase();
      if (!db) {
        setLoading(false);
        return;
      }

      // 1. Listen to device node: /devices/{deviceId}
      const devRef = ref(db, `devices/${deviceId}`);
      const handleDeviceSnap = (snap: any) => {
        if (isCancelled) return;
        setLoading(false);
        if (snap.exists()) {
          const val = snap.val();
          setDeviceData(val);

          // Extract temperature, humidity, gas, light
          const tVal =
            val.temperature_c !== undefined
              ? Number(val.temperature_c)
              : val.temperature !== undefined
              ? Number(val.temperature)
              : val.temp !== undefined
              ? Number(val.temp)
              : null;
          const hVal =
            val.humidity_percent !== undefined
              ? Number(val.humidity_percent)
              : val.humidity !== undefined
              ? Number(val.humidity)
              : val.hum !== undefined
              ? Number(val.hum)
              : null;
          const gVal =
            val.mq135_raw !== undefined
              ? Number(val.mq135_raw)
              : val.gas !== undefined
              ? Number(val.gas)
              : null;
          const lVal =
            val.light_lux !== undefined
              ? Number(val.light_lux)
              : val.light !== undefined
              ? Number(val.light)
              : null;

          const timeStr = new Date().toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
          });

          setTelemetryHistory((prev) => {
            const nextPoint = {
              time: timeStr,
              temp: tVal !== null && !isNaN(tVal) ? +tVal.toFixed(1) : null,
              hum: hVal !== null && !isNaN(hVal) ? +hVal.toFixed(1) : null,
              gas: gVal !== null && !isNaN(gVal) ? Math.round(gVal) : null,
              light: lVal !== null && !isNaN(lVal) ? +lVal.toFixed(1) : null,
            };
            if (prev.length === 0) {
              return [
                { ...nextPoint, time: 'T-20s' },
                { ...nextPoint, time: 'T-10s' },
                nextPoint,
              ];
            }
            return [...prev.slice(-14), nextPoint];
          });
        } else {
          setDeviceData(null);
        }
      };

      onValue(devRef, handleDeviceSnap, (err) => {
        console.warn(`[Warehouse] Device listener notice (${deviceId}):`, err?.message || err);
        setLoading(false);
      });
      cleanupDevice = () => off(devRef, 'value', handleDeviceSnap);

      // 2. Lookup in /rfid_registry if rfidUid is available or by querying registry
      if (rfidUid) {
        const cleanUid = rfidUid.trim().toUpperCase();
        const regRef = ref(db, `rfid_registry/${cleanUid}`);
        const handleRegSnap = (snap: any) => {
          if (isCancelled) return;
          if (snap.exists()) {
            setRegistryEntry(snap.val());
          }
        };
        onValue(regRef, handleRegSnap, () => {});
        cleanupRegistry = () => off(regRef, 'value', handleRegSnap);
      } else {
        const fullRegRef = ref(db, 'rfid_registry');
        const handleAllReg = (snap: any) => {
          if (isCancelled) return;
          if (snap.exists()) {
            const all = snap.val();
            if (all && typeof all === 'object') {
              for (const [uid, entry] of Object.entries(all) as [string, any][]) {
                if (entry && entry.device_id === deviceId) {
                  setRegistryEntry({ ...entry, rfidUid: uid });
                  break;
                }
              }
            }
          }
        };
        onValue(fullRegRef, handleAllReg, () => {});
        cleanupRegistry = () => off(fullRegRef, 'value', handleAllReg);
      }
    };

    initSubscriptions();

    return () => {
      isCancelled = true;
      if (cleanupDevice) cleanupDevice();
      if (cleanupRegistry) cleanupRegistry();
    };
  }, [deviceId, rfidUid]);

  // Resolve Product Name dynamically from Firebase (/rfid_registry or /devices/{deviceId})
  const resolvedProductName = (() => {
    if (registryEntry?.product) {
      const p = registryEntry.product.trim();
      return p.charAt(0).toUpperCase() + p.slice(1).toLowerCase();
    }
    if (deviceData?.product_name || deviceData?.product) {
      const p = String(deviceData.product_name || deviceData.product).trim();
      return p.charAt(0).toUpperCase() + p.slice(1).toLowerCase();
    }
    return 'Monitored Product';
  })();

  // Resolve Tag UID dynamically from props or Firebase
  const resolvedTagUid =
    rfidUid ||
    (registryEntry as any)?.rfidUid ||
    deviceData?.last_tag_uid ||
    deviceData?.rfid_uid ||
    'N/A';

  // Resolve Online/Offline status
  const isOnline =
    deviceData?.online !== undefined
      ? Boolean(deviceData.online)
      : deviceData?.status
      ? deviceData.status.toLowerCase() !== 'offline'
      : false;

  // Resolve Sensor Values (Strictly N/A if missing, no fabrication)
  const rawTemp =
    deviceData?.temperature_c !== undefined
      ? deviceData.temperature_c
      : deviceData?.temperature !== undefined
      ? deviceData.temperature
      : deviceData?.temp !== undefined
      ? deviceData.temp
      : null;
  const tempDisplay =
    rawTemp !== null && rawTemp !== undefined && !isNaN(Number(rawTemp))
      ? `${Number(rawTemp).toFixed(1)} °C`
      : 'N/A';

  const rawHum =
    deviceData?.humidity_percent !== undefined
      ? deviceData.humidity_percent
      : deviceData?.humidity !== undefined
      ? deviceData.humidity
      : deviceData?.hum !== undefined
      ? deviceData.hum
      : null;
  const humDisplay =
    rawHum !== null && rawHum !== undefined && !isNaN(Number(rawHum))
      ? `${Number(rawHum).toFixed(1)} %`
      : 'N/A';

  const rawGas =
    deviceData?.mq135_raw !== undefined
      ? deviceData.mq135_raw
      : deviceData?.gas !== undefined
      ? deviceData.gas
      : null;
  const gasDisplay =
    rawGas !== null && rawGas !== undefined && !isNaN(Number(rawGas))
      ? `${Math.round(Number(rawGas))} raw`
      : 'N/A';

  const rawLight =
    deviceData?.light_lux !== undefined
      ? deviceData.light_lux
      : deviceData?.light !== undefined
      ? deviceData.light
      : null;
  const lightDisplay =
    rawLight !== null && rawLight !== undefined && !isNaN(Number(rawLight))
      ? `${Number(rawLight).toFixed(1)} lx`
      : 'N/A';

  // Derived bio-indicators (only computed if real temp and hum exist)
  const moistureCalc =
    rawTemp !== null && rawHum !== null && !isNaN(Number(rawTemp)) && !isNaN(Number(rawHum))
      ? calculateMoisture(Number(rawTemp), Number(rawHum))
      : null;

  const phCalc =
    moistureCalc && rawTemp !== null && rawHum !== null
      ? calculatePH(
          Number(rawTemp),
          Number(rawHum),
          moistureCalc.absoluteMoisture,
          {
            category: resolvedProductName,
            gas: rawGas !== null ? Number(rawGas) : 120,
          }
        )
      : null;

  // Formatted scan timestamp
  const scanTs =
    lastScanTimestamp ||
    deviceData?.timestamp_ms ||
    deviceData?.last_update ||
    Date.now();
  const { dateStr: formattedScanDate, timeStr: formattedScanTime } = formatRealtimeDateTime(scanTs);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      transition={{ duration: 0.24 }}
      className="space-y-6"
    >
      {/* Return to Warehouse Overview Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-[#13493B]/10 shadow-xs">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#07221A] text-white hover:bg-[#134336] transition-all text-xs font-black cursor-pointer shadow-sm self-start sm:self-auto"
        >
          <ArrowLeft className="w-4 h-4 text-[#20E79A]" />
          <span>Return to Warehouse Overview</span>
        </button>

        <div className="flex items-center gap-2 text-xs font-bold text-[#5C7F75]">
          <span className="flex items-center gap-1.5 bg-[#EBFBF4] text-[#07221A] px-3 py-1 rounded-full border border-[#20E79A]/30">
            <Radio className="w-3.5 h-3.5 text-[#20E79A] animate-pulse" />
            Live Warehouse Feed Active
          </span>
          <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-mono text-[#5C7F75] bg-[#F4F7F6] px-2.5 py-1 rounded-lg border border-[#13493B]/10">
            Node: {deviceId}
          </span>
        </div>
      </div>

      {/* Main Device Hero Banner with RFID Highlight */}
      <div className="relative rounded-3xl bg-gradient-to-br from-[#07221A] via-[#0A2E23] to-[#041410] text-white p-6 sm:p-8 border border-[#20E79A]/35 shadow-[0_20px_50px_rgba(7,34,26,0.35)] overflow-hidden">
        {/* Glow orb */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-bl from-[#20E79A]/20 to-transparent rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-[#20E79A]/15 text-[#20E79A] border border-[#20E79A]/40 inline-flex items-center gap-1.5 shadow-xs">
                <ShieldCheck className="w-3.5 h-3.5" />
                RFID Registered Node
              </span>
              <span
                className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider inline-flex items-center gap-1.5 border ${
                  isOnline
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/40'
                    : 'bg-rose-500/20 text-rose-300 border-rose-400/40'
                }`}
              >
                <span
                  className={`w-2 h-2 rounded-full ${
                    isOnline ? 'bg-emerald-400 animate-pulse' : 'bg-rose-400'
                  }`}
                />
                {isOnline ? 'DEVICE ONLINE' : 'DEVICE OFFLINE'}
              </span>
            </div>

            <div className="text-right">
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#8AB5A8] block">
                Last Scan Timestamp
              </span>
              <span className="text-xs font-mono font-bold text-white">
                {formattedScanDate} • {formattedScanTime}
              </span>
            </div>
          </div>

          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 pt-2">
            <div>
              <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                {resolvedProductName}
              </h1>
              <div className="flex flex-wrap items-center gap-2 mt-2">
                <span className="text-xs font-mono font-bold bg-white/10 text-emerald-300 px-3 py-1 rounded-xl border border-white/10">
                  Device ID: <span className="text-white">{deviceId}</span>
                </span>
                <span className="text-xs font-mono font-bold bg-amber-400/15 text-amber-300 px-3 py-1 rounded-xl border border-amber-400/30">
                  RFID UID: <span className="text-white">{resolvedTagUid}</span>
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-2 gap-3 bg-white/5 p-3 rounded-2xl border border-white/10 text-xs">
              <div>
                <span className="text-[9px] font-bold uppercase tracking-wider text-[#8AB5A8] block">
                  Warehouse ID
                </span>
                <span className="font-bold text-white flex items-center gap-1 mt-0.5">
                  <Warehouse className="w-3.5 h-3.5 text-[#20E79A]" />
                  {warehouseId}
                </span>
              </div>
              <div>
                <span className="text-[9px] font-bold uppercase tracking-wider text-[#8AB5A8] block">
                  Warehouse Scanner
                </span>
                <span className="font-mono font-bold text-white flex items-center gap-1 mt-0.5">
                  <Cpu className="w-3.5 h-3.5 text-[#20E79A]" />
                  {warehouseDevice}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sensor Readings Grid: Temperature, Humidity, Gas, Light */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-black uppercase tracking-wider text-[#07221A] flex items-center gap-1.5">
            <Activity className="w-4 h-4 text-[#20E79A]" />
            Live Hardware Sensor Telemetry
          </h3>
          <span className="text-[11px] font-mono text-[#5C7F75]">
            Source: <code className="font-bold text-[#13493B]">/devices/{deviceId}</code>
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Temperature Card */}
          <motion.div
            whileHover={{ y: -3 }}
            className="p-5 rounded-2xl bg-white border border-[#13493B]/10 shadow-xs flex items-center justify-between relative overflow-hidden"
          >
            <div className="space-y-1">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#5C7F75] block">
                Temperature Reading
              </span>
              <span className="text-2xl sm:text-3xl font-black text-[#07221A] block">
                {tempDisplay}
              </span>
              <span className="text-[10px] font-mono text-[#5C7F75] block">
                {deviceData?.dht22_ok !== undefined
                  ? `DHT22: ${deviceData.dht22_ok ? 'Operational' : 'Check Sensor'}`
                  : 'Hardware Ambient'}
              </span>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-500 border border-red-100 flex items-center justify-center shrink-0">
              <Thermometer className="w-6 h-6" />
            </div>
          </motion.div>

          {/* Humidity Card */}
          <motion.div
            whileHover={{ y: -3 }}
            className="p-5 rounded-2xl bg-white border border-[#13493B]/10 shadow-xs flex items-center justify-between relative overflow-hidden"
          >
            <div className="space-y-1">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#5C7F75] block">
                Relative Humidity
              </span>
              <span className="text-2xl sm:text-3xl font-black text-[#07221A] block">
                {humDisplay}
              </span>
              <span className="text-[10px] font-mono text-[#5C7F75] block">
                Chamber Atmosphere
              </span>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-500 border border-blue-100 flex items-center justify-center shrink-0">
              <Droplets className="w-6 h-6" />
            </div>
          </motion.div>

          {/* MQ-135 Gas Card */}
          <motion.div
            whileHover={{ y: -3 }}
            className="p-5 rounded-2xl bg-white border border-[#13493B]/10 shadow-xs flex items-center justify-between relative overflow-hidden"
          >
            <div className="space-y-1">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#5C7F75] block">
                MQ-135 Gas Sensor
              </span>
              <span className="text-2xl sm:text-3xl font-black text-[#07221A] block">
                {gasDisplay}
              </span>
              <span className="text-[10px] font-mono text-[#5C7F75] block">
                {deviceData?.mq135_adc_voltage !== undefined
                  ? `ADC: ${Number(deviceData.mq135_adc_voltage).toFixed(3)}V`
                  : 'Air Quality Index'}
              </span>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 border border-purple-100 flex items-center justify-center shrink-0">
              <Wind className="w-6 h-6" />
            </div>
          </motion.div>

          {/* Light Sensor Card */}
          <motion.div
            whileHover={{ y: -3 }}
            className="p-5 rounded-2xl bg-white border border-[#13493B]/10 shadow-xs flex items-center justify-between relative overflow-hidden"
          >
            <div className="space-y-1">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#5C7F75] block">
                Light Intensity
              </span>
              <span className="text-2xl sm:text-3xl font-black text-[#07221A] block">
                {lightDisplay}
              </span>
              <span className="text-[10px] font-mono text-[#5C7F75] block">
                {deviceData?.light_sensor_ok !== undefined
                  ? `Sensor: ${deviceData.light_sensor_ok ? 'OK' : 'Check'}`
                  : 'Container Seal'}
              </span>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-yellow-50 text-yellow-600 border border-yellow-200 flex items-center justify-center shrink-0">
              <Sun className="w-6 h-6" />
            </div>
          </motion.div>
        </div>
      </div>

      {/* Bio-Chemical Health Indicators (Moisture, Dew Point, pH, GPS) */}
      {(moistureCalc || deviceData?.gps_valid !== undefined || deviceData?.acceleration_change !== undefined) && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-2xl bg-white border border-[#13493B]/10 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-extrabold uppercase text-[#5C7F75] block">
                Absolute Moisture
              </span>
              <span className="text-xl font-black text-[#07221A] block mt-0.5">
                {moistureCalc ? `${moistureCalc.absoluteMoisture} g/m³` : 'N/A'}
              </span>
              {moistureCalc && (
                <span className="text-[10px] font-mono text-[#5C7F75] block">
                  Dew Point: {moistureCalc.dewPoint}°C
                </span>
              )}
            </div>
            <div className="w-10 h-10 rounded-xl bg-[#EBFBF4] text-[#20E79A] border border-[#20E79A]/30 flex items-center justify-center">
              <Waves className="w-5 h-5 text-[#13493B]" />
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-[#13493B]/10 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-extrabold uppercase text-[#5C7F75] block">
                Thermodynamic pH
              </span>
              <span className="text-xl font-black text-[#07221A] block mt-0.5">
                {phCalc ? phCalc.ph : 'N/A'}
              </span>
              {phCalc && (
                <span className="text-[10px] font-mono text-emerald-700 font-bold block">
                  Status: {phCalc.status}
                </span>
              )}
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-[#13493B]/10 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-extrabold uppercase text-[#5C7F75] block">
                GPS Geolocation Fix
              </span>
              <span className="text-sm font-mono font-black text-[#07221A] block mt-0.5 truncate max-w-[200px]">
                {deviceData?.gps_valid === false
                  ? 'Warehouse Indoor Lock'
                  : deviceData?.gpsLat && deviceData?.gpsLng
                  ? `${Number(deviceData.gpsLat).toFixed(4)}°N, ${Number(deviceData.gpsLng).toFixed(4)}°E`
                  : 'N/A'}
              </span>
              <span className="text-[10px] font-mono text-[#5C7F75] block">
                Satellites: {deviceData?.gps_satellites ?? deviceData?.gpsSats ?? 'N/A'}
              </span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-200 flex items-center justify-center">
              <Navigation className="w-5 h-5" />
            </div>
          </div>
        </div>
      )}

      {/* Real-time Telemetry Trend Chart */}
      <div className="p-5 sm:p-6 rounded-3xl bg-white border border-[#13493B]/10 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h4 className="text-xs font-black uppercase tracking-wider text-[#07221A] flex items-center gap-1.5">
              <Activity className="w-4 h-4 text-[#20E79A]" />
              Real-Time Stream Telemetry ({resolvedProductName})
            </h4>
            <p className="text-[11px] text-[#5C7F75]">
              Real-time hardware readings streamed directly from Firebase Realtime Database
            </p>
          </div>

          <div className="flex flex-wrap gap-1 bg-[#F4F7F6] p-1 rounded-xl border border-[#13493B]/10">
            {(
              [
                { id: 'temp', label: 'Temp (°C)', color: '#FF5A67' },
                { id: 'hum', label: 'Humidity (%)', color: '#3B82F6' },
                { id: 'gas', label: 'Gas (MQ135)', color: '#9333EA' },
                { id: 'light', label: 'Light (lx)', color: '#CA8A04' },
              ] as const
            ).map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`px-3 py-1 rounded-lg text-xs font-black transition-all cursor-pointer ${
                  activeTab === tab.id
                    ? 'bg-[#07221A] text-[#20E79A] shadow-xs'
                    : 'text-[#5C7F75] hover:text-[#07221A]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="h-56 w-full bg-[#FAFCFB] rounded-2xl p-3 border border-[#13493B]/8">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={telemetryHistory}
              margin={{ top: 8, right: 12, left: -20, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#EEF3F1" vertical={false} />
              <XAxis
                dataKey="time"
                stroke="#5C7F75"
                fontSize={10}
                fontWeight={700}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="#5C7F75"
                fontSize={10}
                fontWeight={700}
                tickLine={false}
                axisLine={false}
                width={36}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#FFFFFF',
                  borderColor: 'rgba(19, 73, 59, 0.12)',
                  borderRadius: '12px',
                  fontSize: '11px',
                  fontWeight: 700,
                }}
              />
              <Area
                type="monotone"
                dataKey={activeTab}
                stroke={
                  activeTab === 'temp'
                    ? '#FF5A67'
                    : activeTab === 'hum'
                    ? '#3B82F6'
                    : activeTab === 'gas'
                    ? '#9333EA'
                    : '#CA8A04'
                }
                strokeWidth={2.5}
                fillOpacity={0.18}
                fill={
                  activeTab === 'temp'
                    ? '#FF5A67'
                    : activeTab === 'hum'
                    ? '#3B82F6'
                    : activeTab === 'gas'
                    ? '#9333EA'
                    : '#CA8A04'
                }
                isAnimationActive={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Hardware RFID Scan Log on the device itself (e.g. /devices/{id}/rfid_scans) */}
      {deviceData?.rfid_scans && typeof deviceData.rfid_scans === 'object' && (
        <div className="p-5 rounded-3xl bg-white border border-[#13493B]/10 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-black uppercase tracking-wider text-[#07221A] flex items-center gap-1.5">
              <Radio className="w-3.5 h-3.5 text-[#20E79A]" />
              On-Device Hardware Scans Log (/devices/{deviceId}/rfid_scans)
            </h4>
            <span className="text-[10px] font-mono font-bold bg-[#EBFBF4] text-[#07221A] px-2.5 py-0.5 rounded-full border border-[#20E79A]/30">
              {Object.keys(deviceData.rfid_scans).length} Logged Scans
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
            {Object.entries(deviceData.rfid_scans)
              .slice(-4)
              .reverse()
              .map(([scanKey, item]: [string, any]) => (
                <div
                  key={scanKey}
                  className="p-3 rounded-xl bg-[#F4F7F6] border border-[#13493B]/10 flex flex-col justify-between gap-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-black text-[#07221A]">
                      UID: {item?.tag_uid || 'N/A'}
                    </span>
                    <span className="text-[9px] font-mono text-[#5C7F75]">
                      {item?.detected_at_ms ? `${Math.round(item.detected_at_ms / 1000)}s` : ''}
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-[#5C7F75] truncate">
                    Key: {scanKey}
                  </span>
                </div>
              ))}
          </div>
        </div>
      )}
    </motion.div>
  );
};

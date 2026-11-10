import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Cpu, Wifi, Clock, Navigation } from 'lucide-react';
import { FirebaseService } from '../services/firebaseService';
import { socketTelemetryService } from '../services/socketService';
import { calculateMoisture } from '../utils/moistureCalculator';
import { calculatePH } from '../utils/phCalculator';
import { formatRealtimeDateTime, extractLatestTimestamp } from '../utils/dateUtils';

interface Device {
  device_id: string;
  product: string;
  temperature: number;
  humidity: number;
  mq135_raw: number;
  impact?: number;
  light?: number;
  gpsLat?: number;
  gpsLng?: number;
  gpsSats?: number;
  last_update?: number;
  lastUpdated?: number;
}

interface Props {
  dev: Device;
  idx: number;
  onDetailsClick: () => void;
  onWifiClick: () => void;
}

export const DeviceCard: React.FC<Props> = ({ dev, idx, onDetailsClick, onWifiClick }) => {
  const [realtimeStatus, setRealtimeStatus] = useState<'online' | 'offline'>(
    socketTelemetryService.getLatestStatus(dev.device_id)
  );
  const [remainingSec, setRemainingSec] = useState<number>(30);
  const [, setTick] = useState(0);
  const [liveSensor, setLiveSensor] = useState({
    temperature: dev.temperature ?? 4.2,
    humidity: dev.humidity ?? 62.0,
    mq135_raw: dev.mq135_raw ?? 120,
    impact: dev.impact ?? 0.12,
    light: dev.light ?? 18,
    gpsLat: dev.gpsLat ?? 22.5726,
    gpsLng: dev.gpsLng ?? 88.3639,
    gpsSats: dev.gpsSats ?? 8,
    timestamp: socketTelemetryService.getLastResponseTimestamp(dev.device_id),
  });

  // Sync immediately when parent dev prop changes (from WebSocket / Firebase AppContext listener)
  useEffect(() => {
    setLiveSensor((prev) => {
      const hasValueChanged =
        (dev.temperature !== undefined && dev.temperature !== prev.temperature) ||
        (dev.humidity !== undefined && dev.humidity !== prev.humidity) ||
        (dev.mq135_raw !== undefined && dev.mq135_raw !== prev.mq135_raw) ||
        (dev.impact !== undefined && dev.impact !== prev.impact) ||
        (dev.light !== undefined && dev.light !== prev.light) ||
        (dev.gpsLat !== undefined && dev.gpsLat !== prev.gpsLat) ||
        (dev.gpsLng !== undefined && dev.gpsLng !== prev.gpsLng);

      if (hasValueChanged) {
        socketTelemetryService.reportFrontendDataReceived(dev.device_id, dev);
      }

      return {
        temperature: dev.temperature ?? prev.temperature ?? 4.2,
        humidity: dev.humidity ?? prev.humidity ?? 62.0,
        mq135_raw: dev.mq135_raw ?? prev.mq135_raw ?? 120,
        impact: dev.impact ?? prev.impact ?? 0.12,
        light: dev.light ?? prev.light ?? 18,
        gpsLat: dev.gpsLat ?? prev.gpsLat ?? 22.5726,
        gpsLng: dev.gpsLng ?? prev.gpsLng ?? 88.3639,
        gpsSats: dev.gpsSats ?? prev.gpsSats ?? 8,
        timestamp: socketTelemetryService.getLastResponseTimestamp(dev.device_id),
      };
    });
  }, [
    dev.device_id,
    dev.temperature,
    dev.humidity,
    dev.mq135_raw,
    dev.impact,
    dev.light,
    dev.gpsLat,
    dev.gpsLng,
    dev.gpsSats,
    dev.product,
  ]);

  // Subscribe to backend WebSocket 30-second timer status & zero-lag telemetry stream
  useEffect(() => {
    const unsubWsStatus = socketTelemetryService.subscribeStatus(dev.device_id, (status, meta) => {
      setRealtimeStatus(status);
      if (meta?.remainingMs !== undefined) {
        setRemainingSec(Math.max(0, Math.ceil(meta.remainingMs / 1000)));
      } else {
        setRemainingSec(status === 'online' ? 30 : 0);
      }
      const nextTs = meta?.lastResponseAt || meta?.lastDataAt;
      if (nextTs) {
        setLiveSensor((prev) => ({
          ...prev,
          timestamp: nextTs,
        }));
      }
    });

    const unsubStatus = FirebaseService.subscribeToDeviceStatus(dev.device_id, (status) => {
      if (status) setRealtimeStatus(status);
    });

    const unsubSensor = FirebaseService.subscribeToSensorData(dev.device_id, (data) => {
      if (data) {
        setLiveSensor((prev) => {
          const nextTemp = data.temperature ?? dev.temperature ?? prev.temperature ?? 4.2;
          const nextHum = data.humidity ?? dev.humidity ?? prev.humidity ?? 62.0;
          const nextGas =
            (data as any).gas ??
            (data as any).mq135_raw ??
            dev.mq135_raw ??
            prev.mq135_raw ??
            120;
          const nextImpact = data.impact ?? dev.impact ?? prev.impact ?? 0.12;
          const nextLight = data.light ?? dev.light ?? prev.light ?? 18;
          const nextLat = data.gpsLat ?? dev.gpsLat ?? prev.gpsLat ?? 22.5726;
          const nextLng = data.gpsLng ?? dev.gpsLng ?? prev.gpsLng ?? 88.3639;
          const nextSats = data.gpsSats ?? dev.gpsSats ?? prev.gpsSats ?? 8;

          const changed =
            nextTemp !== prev.temperature ||
            nextHum !== prev.humidity ||
            nextGas !== prev.mq135_raw ||
            nextImpact !== prev.impact ||
            nextLight !== prev.light ||
            nextLat !== prev.gpsLat ||
            nextLng !== prev.gpsLng;

          if (changed) {
            socketTelemetryService.reportFrontendDataReceived(dev.device_id, data);
          }

          return {
            temperature: nextTemp,
            humidity: nextHum,
            mq135_raw: nextGas,
            impact: nextImpact,
            light: nextLight,
            gpsLat: nextLat,
            gpsLng: nextLng,
            gpsSats: nextSats,
            timestamp: socketTelemetryService.getLastResponseTimestamp(dev.device_id),
          };
        });
      }
    });

    const handleWebsiteUpdate = (e: Event) => {
      const detail = (e as CustomEvent)?.detail;
      if (
        !detail ||
        !detail.deviceId ||
        detail.deviceId === dev.device_id ||
        detail.product === dev.product
      ) {
        const now = detail?.timestamp || Date.now();
        socketTelemetryService.reportFrontendDataReceived(
          dev.device_id,
          { ...dev, timestamp: now },
          true
        );
        setLiveSensor((prev) => ({
          ...prev,
          timestamp: socketTelemetryService.getLastResponseTimestamp(dev.device_id),
        }));
      }
    };

    window.addEventListener('freshnex_device_updated', handleWebsiteUpdate);
    window.addEventListener('freshnex_thresholds_updated', handleWebsiteUpdate);

    // 1-second live clock ticker so relative time & Last Response stay accurate in real time
    const ticker = setInterval(() => {
      setTick((t) => t + 1);
    }, 1000);

    return () => {
      unsubWsStatus();
      unsubStatus();
      unsubSensor();
      window.removeEventListener('freshnex_device_updated', handleWebsiteUpdate);
      window.removeEventListener('freshnex_thresholds_updated', handleWebsiteUpdate);
      clearInterval(ticker);
    };
  }, [dev.device_id, dev.product]);

  const liveMoisture = calculateMoisture(liveSensor.temperature, liveSensor.humidity);
  const livePH = calculatePH(
    liveSensor.temperature,
    liveSensor.humidity,
    liveMoisture.absoluteMoisture,
    {
      category: dev.product,
      gas: liveSensor.mq135_raw,
    }
  );

  const latestTs =
    socketTelemetryService.getLastResponseTimestamp(dev.device_id) ||
    liveSensor.timestamp ||
    Date.now();
  const {
    dateStr: formattedDate,
    timeStr: formattedTime,
    relativeStr,
  } = formatRealtimeDateTime(latestTs);

  return (
    <motion.div
      key={dev.device_id}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: idx * 0.05, duration: 0.25 }}
      whileHover={{ y: -5, scale: 1.015 }}
      className="glass-card bg-white/95 rounded-[24px] sm:rounded-[30px] p-5 sm:p-6 border border-[#13493B]/10 shadow-[0_10px_30px_-6px_rgba(7,34,26,0.07),0_2px_8px_rgba(0,0,0,0.02)] hover:shadow-[0_20px_40px_-8px_rgba(32,231,154,0.18),0_6px_16px_rgba(0,0,0,0.04)] hover:border-[#20E79A]/30 transition-all duration-300 flex flex-col justify-between space-y-4 relative overflow-hidden group"
    >
      <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-[#20E79A]/0 group-hover:via-[#20E79A]/60 to-transparent transition-all duration-300" />

      <div className="space-y-3.5">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <span className="text-[9px] font-black uppercase tracking-wider text-emerald-800 bg-emerald-100/90 px-2.5 py-0.5 rounded-full border border-emerald-300 inline-block truncate">
              Micro-Node
            </span>
            <h3 className="text-base sm:text-lg font-black text-[#07221A] mt-1.5 truncate">
              {dev.product && dev.product !== 'Cold Drinks' && dev.product !== 'Meat' && dev.product !== 'IoT Node'
                ? dev.product
                : (dev.device_id.includes('124') || dev.device_id.includes('MILK') ? 'Milk' : 'Apple')}
            </h3>
            <p className="text-xs font-mono font-bold text-amber-900 bg-amber-100/80 px-2 py-0.5 rounded-md border border-amber-300/80 inline-block mt-0.5 truncate">
              {dev.device_id}
            </p>
          </div>

          <div className="flex flex-col items-end gap-1 shrink-0">
            <span
              className={`px-2.5 py-1 rounded-full text-[10px] font-black flex items-center gap-1.5 shadow-xs ${
                realtimeStatus === 'online'
                  ? 'bg-emerald-100 text-emerald-700 border border-emerald-300'
                  : 'bg-rose-50 text-rose-700 border border-rose-200'
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  realtimeStatus === 'online' ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'
                }`}
              />
              <span>{realtimeStatus === 'online' ? 'ONLINE' : 'OFFLINE'}</span>
            </span>
            <span className="text-[8.5px] font-mono font-bold text-[#5C7F75] tabular-nums">
              {realtimeStatus === 'online'
                ? `30s timer: ${remainingSec}s`
                : 'No data > 30s'}
            </span>
          </div>
        </div>

        {/* Responsive Sensor Readout (All Parameters) */}
        <div className="grid grid-cols-4 gap-1.5 p-2.5 sm:p-3 rounded-2xl bg-gradient-to-b from-[#F4F7F6] to-[#EAEFEB] text-center border border-[#13493B]/8 shadow-inner">
          <div className="space-y-0.5 p-1 rounded-lg bg-white/70">
            <span className="text-[8px] font-bold text-[#5C7F75] uppercase block truncate">Temp</span>
            <span className="text-[10.5px] sm:text-xs font-black text-[#07221A] tabular-nums">
              {liveSensor.temperature}°C
            </span>
          </div>
          <div className="space-y-0.5 p-1 rounded-lg bg-white/70">
            <span className="text-[8px] font-bold text-[#5C7F75] uppercase block truncate">RH%</span>
            <span className="text-[10.5px] sm:text-xs font-black text-[#07221A] tabular-nums">
              {liveSensor.humidity}%
            </span>
          </div>
          <div className="space-y-0.5 p-1 rounded-lg bg-white/70">
            <span className="text-[8px] font-bold text-[#5C7F75] uppercase block truncate">
              Moisture
            </span>
            <span className="text-[10.5px] sm:text-xs font-black text-[#07221A] tabular-nums">
              {liveMoisture.absoluteMoisture}
            </span>
          </div>
          <div className="space-y-0.5 p-1 bg-emerald-50/90 rounded-lg">
            <span className="text-[8px] font-extrabold text-[#13493B] uppercase block truncate">
              pH
            </span>
            <span className="text-[10.5px] sm:text-xs font-black text-emerald-800 font-mono tabular-nums">
              {livePH.ph}
            </span>
          </div>
          <div className="space-y-0.5 p-1 rounded-lg bg-white/70">
            <span className="text-[8px] font-bold text-[#5C7F75] uppercase block truncate">
              MQ-135
            </span>
            <span className="text-[10.5px] sm:text-xs font-black text-[#07221A] tabular-nums">
              {liveSensor.mq135_raw}
            </span>
          </div>
          <div className="space-y-0.5 p-1 rounded-lg bg-white/70">
            <span className="text-[8px] font-bold text-[#5C7F75] uppercase block truncate">
              Impact
            </span>
            <span className="text-[10.5px] sm:text-xs font-black text-[#07221A] tabular-nums">
              {Number(liveSensor.impact).toFixed(2)}G
            </span>
          </div>
          <div className="space-y-0.5 p-1 rounded-lg bg-white/70">
            <span className="text-[8px] font-bold text-[#5C7F75] uppercase block truncate">
              Light
            </span>
            <span className="text-[10.5px] sm:text-xs font-black text-[#07221A] tabular-nums">
              {Math.round(liveSensor.light)}lx
            </span>
          </div>
          <div className="space-y-0.5 p-1 rounded-lg bg-indigo-50/80">
            <span className="text-[8px] font-bold text-indigo-800 uppercase block truncate">
              NEO-6M
            </span>
            <span className="text-[10px] font-black text-indigo-900 font-mono tabular-nums block truncate">
              {liveSensor.gpsSats} Sat
            </span>
          </div>
        </div>

        {/* NEO-6M GPS Coordinates & Last Response */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-[10px] bg-indigo-50/60 px-2.5 py-1 rounded-xl border border-indigo-200/60">
            <div className="flex items-center gap-1.5 truncate">
              <Navigation className="w-3 h-3 text-indigo-600 shrink-0" />
              <span className="font-bold text-indigo-900">NEO-6M GPS:</span>
            </div>
            <span className="font-mono font-bold text-indigo-950 truncate">
              {Number(liveSensor.gpsLat).toFixed(4)}°N, {Number(liveSensor.gpsLng).toFixed(4)}°E
            </span>
          </div>

          <div
            className={`flex items-center justify-between text-[10px] px-2.5 py-1.5 rounded-xl border shadow-xs transition-colors ${
              realtimeStatus === 'online'
                ? 'bg-[#EBFBF4]/80 border-[#20E79A]/30'
                : 'bg-rose-50/80 border-rose-200/80'
            }`}
          >
            <div className="flex items-center gap-1.5 truncate min-w-0">
              <Clock
                className={`w-3.5 h-3.5 shrink-0 ${
                  realtimeStatus === 'online' ? 'text-[#13493B]' : 'text-rose-700'
                }`}
              />
              <span
                className={`font-bold shrink-0 ${
                  realtimeStatus === 'online' ? 'text-[#13493B]' : 'text-rose-800'
                }`}
              >
                Last Response:
              </span>
              <span className="font-mono font-black text-[#07221A] truncate">
                {formattedDate}, {formattedTime}
              </span>
            </div>
            <div className="flex items-center gap-1 shrink-0 ml-1.5">
              <span
                className={`text-[9px] font-extrabold bg-white/90 px-1.5 py-0.5 rounded-md border tabular-nums ${
                  realtimeStatus === 'online'
                    ? 'text-emerald-800 border-emerald-200'
                    : 'text-rose-700 border-rose-200'
                }`}
              >
                {relativeStr}
              </span>
              <span
                className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                  realtimeStatus === 'online' ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'
                }`}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-2 pt-1">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          onClick={onDetailsClick}
          className="flex-1 py-2.5 px-3 rounded-xl bg-[#07221A] text-white font-bold text-xs hover:bg-[#134336] flex items-center justify-center gap-1.5 cursor-pointer shadow-sm min-h-[40px]"
        >
          <Cpu className="w-3.5 h-3.5 text-[#20E79A] shrink-0" />
          <span className="truncate">DETAILS</span>
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          onClick={onWifiClick}
          className="flex-1 py-2.5 px-3 rounded-xl btn-orange text-white font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-sm min-h-[40px]"
        >
          <Wifi className="w-3.5 h-3.5 shrink-0" />
          <span className="truncate">CHANGE WI-FI</span>
        </motion.button>
      </div>
    </motion.div>
  );
};

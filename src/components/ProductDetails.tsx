import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { FirebaseService } from '../services/firebaseService';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowLeft, 
  Thermometer, 
  Droplets, 
  Wind, 
  Activity, 
  ChevronRight, 
  History, 
  Info,
  Wifi,
  X
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { WifiSettings } from './WifiSettings';

export const ProductDetails: React.FC = () => {
  const { productId } = useParams<{ productId: string }>();
  const navigate = useNavigate();
  const { devicesMap, sensorHistory } = useApp();

  const deviceId = productId ? productId.toUpperCase() : 'YGS-FD-000124';
  const baseDevice = devicesMap[deviceId] || {
    device_id: deviceId,
    product: 'Milk',
    temperature: 27.4,
    humidity: 61.2,
    mq135_raw: 1320,
    online: true,
    last_update: Date.now()
  };

  const [realtimeStatus, setRealtimeStatus] = useState<'online' | 'offline'>('online');
  const [liveSensor, setLiveSensor] = useState({
    temperature: baseDevice.temperature ?? 4.2,
    humidity: baseDevice.humidity ?? 62.0,
    mq135_raw: baseDevice.mq135_raw ?? 120,
    last_update: baseDevice.last_update ?? Date.now()
  });

  useEffect(() => {
    const unsubStatus = FirebaseService.subscribeToDeviceStatus(deviceId, (status) => {
      if (status) setRealtimeStatus(status);
    });

    const unsubSensor = FirebaseService.subscribeToSensorData(deviceId, (data) => {
      if (data) {
        setLiveSensor({
          temperature: data.temperature ?? baseDevice.temperature ?? 4.2,
          humidity: data.humidity ?? baseDevice.humidity ?? 62.0,
          mq135_raw: (data as any).gas ?? (data as any).mq135_raw ?? baseDevice.mq135_raw ?? 120,
          last_update: data.timestamp ?? Date.now()
        });
      }
    });

    return () => {
      unsubStatus();
      unsubSensor();
    };
  }, [deviceId]);

  const device = {
    ...baseDevice,
    temperature: liveSensor.temperature,
    humidity: liveSensor.humidity,
    mq135_raw: liveSensor.mq135_raw,
    online: realtimeStatus === 'online',
    last_update: liveSensor.last_update
  };

  const [showHistoryModal, setShowHistoryModal] = useState<boolean>(false);
  const [historyFilter, setHistoryFilter] = useState<'1H' | '24H' | '7D' | '30D'>('24H');
  const [showWifiSettings, setShowWifiSettings] = useState<boolean>(false);

  // Format last update time
  const lastUpdateTime = device.last_update 
    ? new Date(device.last_update).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    : 'Just now';

  // Sensor History for this device
  const rawHistoryList = sensorHistory[deviceId] || [];

  const chartData = rawHistoryList.slice(0, 15).reverse().map((h) => ({
    time: new Date(h.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    temp: h.temperature,
    humidity: h.humidity,
    mq135: h.mq135_raw
  }));

  return (
    <div className="space-y-5 max-w-2xl mx-auto pb-10 text-[#FDF8F5]">
      {/* Header Bar */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="w-10 h-10 rounded-2xl glass-card flex items-center justify-center text-[#FFAA00] hover:bg-[#FF6A00]/20 border border-[#FF6A00]/25 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="text-center">
          <h2 className="text-base font-black text-[#FDF8F5]">Product Details</h2>
          <p className="text-[10px] font-mono font-bold text-[#FFAA00]">{device.device_id}</p>
        </div>
        <button
          onClick={() => setShowHistoryModal(true)}
          className="w-10 h-10 rounded-2xl glass-card flex items-center justify-center text-[#FFAA00] hover:bg-[#FF6A00]/20 border border-[#FF6A00]/25 transition-colors cursor-pointer"
          title="View Sensor History"
        >
          <History className="w-5 h-5" />
        </button>
      </div>

      {/* Main Product Status Banner */}
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass-card rounded-3xl p-5 sm:p-6 border border-[#FF6A00]/25 shadow-xl space-y-4"
      >
        <div className="flex items-start justify-between">
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#FFAA00] bg-[#FF6A00]/15 border border-[#FF6A00]/30 px-2.5 py-1 rounded-full">
              Package Telemetry
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-[#FDF8F5] mt-1">
              {device.product || 'Milk'}
            </h1>
            <p className="text-xs font-mono font-bold text-[#B8A89E] mt-0.5">
              ID: {device.device_id}
            </p>
          </div>

          <div className="text-right">
            <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold ${
              device.online 
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                : 'bg-[#1C1410] text-[#8C7A70] border border-[#FF6A00]/20'
            }`}>
              <span className={`w-2 h-2 rounded-full ${device.online ? 'bg-emerald-400 animate-ping' : 'bg-[#8C7A70]'}`} />
              <span>{device.online ? 'LIVE DATA' : 'OFFLINE'}</span>
            </div>
            <p className="text-[10px] text-[#8C7A70] font-medium mt-1">
              Updated: {lastUpdateTime}
            </p>
          </div>
        </div>

        {/* Status Indicator */}
        <div className="p-3.5 rounded-2xl bg-gradient-to-r from-[#FF6A00]/15 to-[#FFAA00]/10 border border-[#FF6A00]/25 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Activity className="w-5 h-5 text-[#FFAA00] animate-pulse" />
            <div>
              <p className="text-xs font-bold text-[#FDF8F5]">Monitoring Status</p>
              <p className="text-[10px] text-[#B8A89E]">Subscribed to ESP32 sensor stream</p>
            </div>
          </div>
          <span className="px-3 py-1 rounded-xl btn-orange font-extrabold text-xs shadow-xs">
            Monitoring
          </span>
        </div>

        <button
          onClick={() => setShowWifiSettings(true)}
          className="w-full py-3 px-4 rounded-2xl border border-[#FF6A00]/35 bg-[#FF6A00]/10 hover:bg-[#FF6A00]/20 text-[#FFAA00] font-extrabold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs"
        >
          <Wifi className="w-4 h-4" />
          <span>CONFIGURE DEPLOYED WI-FI (BLE)</span>
        </button>
      </motion.div>

      {/* 3 Large Telemetry Sensor Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* 1. TEMPERATURE CARD */}
        <motion.div
          whileHover={{ y: -2 }}
          className="glass-card p-5 rounded-3xl border border-[#FF6A00]/25 shadow-lg relative overflow-hidden"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-[#FDF8F5] uppercase tracking-wider">Temperature</span>
            <div className="w-10 h-10 rounded-2xl bg-orange-500/15 text-[#FFAA00] flex items-center justify-center border border-orange-500/30">
              <Thermometer className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-black text-[#FDF8F5]">{device.temperature}</span>
            <span className="text-base font-bold text-[#FFAA00]">°C</span>
          </div>
          <p className="text-[10px] font-semibold text-[#8C7A70] mt-1">DHT22 Thermal Sensor</p>
        </motion.div>

        {/* 2. HUMIDITY CARD */}
        <motion.div
          whileHover={{ y: -2 }}
          className="glass-card p-5 rounded-3xl border border-[#FF6A00]/25 shadow-lg relative overflow-hidden"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-[#FDF8F5] uppercase tracking-wider">Humidity</span>
            <div className="w-10 h-10 rounded-2xl bg-[#FF6A00]/15 text-[#FF6A00] flex items-center justify-center border border-[#FF6A00]/30">
              <Droplets className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-black text-[#FDF8F5]">{device.humidity}</span>
            <span className="text-base font-bold text-[#FFAA00]">%</span>
          </div>
          <p className="text-[10px] font-semibold text-[#8C7A70] mt-1">Relative Air Moisture</p>
        </motion.div>

        {/* 3. MQ-135 GAS / AIR CARD */}
        <motion.div
          whileHover={{ y: -2 }}
          className="glass-card p-5 rounded-3xl border border-[#FF6A00]/25 shadow-lg relative overflow-hidden"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-[#FDF8F5] uppercase tracking-wider">Air Sensor</span>
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
              <Wind className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-black text-[#FDF8F5]">{device.mq135_raw}</span>
            <span className="text-xs font-bold text-[#8C7A70]">RAW</span>
          </div>
          <p className="text-[10px] font-semibold text-[#8C7A70] mt-1">MQ-135 Gas Sensor</p>
        </motion.div>
      </div>

      {/* Sensor Calibration Note */}
      <div className="p-4 rounded-2xl glass-card border border-[#FF6A00]/20 text-xs text-[#D6C8C0] flex items-start gap-3">
        <Info className="w-5 h-5 text-[#FFAA00] shrink-0 mt-0.5" />
        <div>
          <p className="font-bold text-[#FDF8F5]">Sensor Guidance</p>
          <p className="text-[11px] text-[#B8A89E] mt-0.5 leading-relaxed">
            MQ-135 reports raw gas sensor readings. Freshness evaluation uses configured baseline thresholds per food product.
          </p>
        </div>
      </div>

      {/* Action Button: VIEW SENSOR HISTORY */}
      <button
        onClick={() => setShowHistoryModal(true)}
        className="w-full py-4 px-6 rounded-2xl btn-orange font-bold text-sm shadow-xl hover:brightness-110 active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer"
      >
        <History className="w-5 h-5" />
        <span>VIEW SENSOR HISTORY</span>
        <ChevronRight className="w-4 h-4 ml-auto" />
      </button>

      {/* SENSOR HISTORY MODAL */}
      <AnimatePresence>
        {showHistoryModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="glass-card w-full max-w-2xl rounded-3xl p-6 bg-[#160E0A] shadow-2xl border border-[#FF6A00]/30 max-h-[90vh] overflow-y-auto space-y-4"
            >
              <div className="flex items-center justify-between pb-3 border-b border-[#FF6A00]/20">
                <div>
                  <h3 className="text-lg font-black text-[#FDF8F5]">Sensor Telemetry History</h3>
                  <p className="text-xs text-[#B8A89E]">Device: {device.device_id} ({device.product})</p>
                </div>
                <button
                  onClick={() => setShowHistoryModal(false)}
                  className="w-8 h-8 rounded-full bg-[#1C1410] border border-[#FF6A00]/25 text-[#B8A89E] flex items-center justify-center hover:text-white cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Filter Tabs */}
              <div className="flex gap-2">
                {(['1H', '24H', '7D', '30D'] as const).map(f => (
                  <button
                    key={f}
                    onClick={() => setHistoryFilter(f)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      historyFilter === f
                        ? 'btn-orange shadow-xs'
                        : 'bg-[#FF6A00]/10 border border-[#FF6A00]/20 text-[#B8A89E] hover:text-white'
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>

              {chartData.length === 0 ? (
                <div className="p-8 text-center text-[#B8A89E] text-xs font-bold bg-[#FF6A00]/5 border border-[#FF6A00]/15 rounded-2xl">
                  No historical readings available yet for this device.
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Temperature Chart */}
                  <div>
                    <h4 className="text-xs font-bold text-[#FDF8F5] uppercase mb-2 flex items-center gap-1.5">
                      <Thermometer className="w-4 h-4 text-[#FF6A00]" /> Temperature (°C)
                    </h4>
                    <div className="h-44 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={chartData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#3D261A" />
                          <XAxis dataKey="time" stroke="#8C7A70" fontSize={10} />
                          <YAxis stroke="#8C7A70" fontSize={10} domain={['auto', 'auto']} />
                          <Tooltip contentStyle={{ backgroundColor: '#1C1410', borderColor: '#FF6A00', color: '#FDF8F5' }} />
                          <Line type="monotone" dataKey="temp" stroke="#FF6A00" strokeWidth={2.5} dot={{ r: 3 }} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Humidity Chart */}
                  <div>
                    <h4 className="text-xs font-bold text-[#FDF8F5] uppercase mb-2 flex items-center gap-1.5">
                      <Droplets className="w-4 h-4 text-[#FFAA00]" /> Humidity (%)
                    </h4>
                    <div className="h-44 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={chartData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#3D261A" />
                          <XAxis dataKey="time" stroke="#8C7A70" fontSize={10} />
                          <YAxis stroke="#8C7A70" fontSize={10} domain={['auto', 'auto']} />
                          <Tooltip contentStyle={{ backgroundColor: '#1C1410', borderColor: '#FFAA00', color: '#FDF8F5' }} />
                          <Line type="monotone" dataKey="humidity" stroke="#FFAA00" strokeWidth={2.5} dot={{ r: 3 }} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* MQ-135 Chart */}
                  <div>
                    <h4 className="text-xs font-bold text-[#FDF8F5] uppercase mb-2 flex items-center gap-1.5">
                      <Wind className="w-4 h-4 text-emerald-400" /> MQ-135 Gas Raw
                    </h4>
                    <div className="h-44 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={chartData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#3D261A" />
                          <XAxis dataKey="time" stroke="#8C7A70" fontSize={10} />
                          <YAxis stroke="#8C7A70" fontSize={10} domain={['auto', 'auto']} />
                          <Tooltip contentStyle={{ backgroundColor: '#1C1410', borderColor: '#10B981', color: '#FDF8F5' }} />
                          <Line type="monotone" dataKey="mq135" stroke="#10B981" strokeWidth={2.5} dot={{ r: 3 }} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showWifiSettings && (
          <WifiSettings
            deviceId={device.device_id}
            onClose={() => setShowWifiSettings(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

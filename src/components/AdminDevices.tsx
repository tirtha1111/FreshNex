import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { 
  Cpu, 
  Wifi, 
  WifiOff, 
  Edit3, 
  Save, 
  X, 
  Activity, 
  Thermometer, 
  Droplets, 
  Wind, 
  CheckCircle2, 
  Bluetooth, 
  Radio, 
  Database,
  ArrowLeft,
  ShieldAlert,
  Sliders,
  RefreshCw
} from 'lucide-react';
import { DeviceData } from '../types';
import { ChangeWifiModal } from './ChangeWifiModal';

export const AdminDevices: React.FC = () => {
  const { userProfile } = useAuth();
  const { devicesMap, updateDeviceData, updateProductProfile, productProfiles } = useApp();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const isAdmin = userProfile?.role === 'admin';

  // Selected device for Device Details view
  const [activeDeviceId, setActiveDeviceId] = useState<string | null>(null);
  
  // Modals state
  const [wifiModalDeviceId, setWifiModalDeviceId] = useState<string | null>(null);
  const [configModalDevice, setConfigModalDevice] = useState<DeviceData | null>(null);

  // Form state for configuration
  const [productName, setProductName] = useState('');
  const [tempMin, setTempMin] = useState<number | ''>(2.0);
  const [tempMax, setTempMax] = useState<number | ''>(6.0);
  const [humMin, setHumMin] = useState<number | ''>(50);
  const [humMax, setHumMax] = useState<number | ''>(70);
  const [mqThreshold, setMqThreshold] = useState<number | ''>(1500);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const devicesList: DeviceData[] = Object.values(devicesMap);

  // Sync URL search params ?id=YGS-FD-000124
  useEffect(() => {
    const devId = searchParams.get('id');
    if (devId && devicesMap[devId]) {
      setActiveDeviceId(devId);
    }
  }, [searchParams, devicesMap]);

  if (!isAdmin) {
    return (
      <div className="max-w-md mx-auto text-center py-20 px-6 space-y-4">
        <ShieldAlert className="w-16 h-16 text-red-500 mx-auto" />
        <h2 className="text-xl font-black text-[#1A120D]">Admin Access Required</h2>
        <p className="text-xs text-slate-500 font-semibold">
          This device management console is restricted to authenticated FreshNex administrators.
        </p>
        <button
          onClick={() => navigate('/dashboard')}
          className="px-6 py-2.5 rounded-xl bg-[#07221A] text-white font-bold text-xs"
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  const activeDevice = activeDeviceId ? devicesMap[activeDeviceId] : null;

  const handleOpenConfigModal = (dev: DeviceData) => {
    setConfigModalDevice(dev);
    setProductName(dev.product || 'Milk');
    
    const profile = productProfiles.find(p => p.name.toLowerCase() === (dev.product || '').toLowerCase());
    if (profile) {
      setTempMin(profile.temperature_min ?? 2.0);
      setTempMax(profile.temperature_max ?? 6.0);
      setHumMin(profile.humidity_min ?? 50);
      setHumMax(profile.humidity_max ?? 70);
      setMqThreshold(profile.mq135_threshold ?? 1500);
    } else {
      setTempMin(2.0);
      setTempMax(6.0);
      setHumMin(50);
      setHumMax(70);
      setMqThreshold(1500);
    }
  };

  const handleSaveConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!configModalDevice) return;

    await updateDeviceData(configModalDevice.device_id, {
      product: productName
    });

    await updateProductProfile({
      id: `p_${productName.toLowerCase().replace(/\s+/g, '_')}`,
      name: productName,
      temperature_min: tempMin === '' ? null : Number(tempMin),
      temperature_max: tempMax === '' ? null : Number(tempMax),
      humidity_min: humMin === '' ? null : Number(humMin),
      humidity_max: humMax === '' ? null : Number(humMax),
      mq135_threshold: mqThreshold === '' ? null : Number(mqThreshold)
    });

    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
      setConfigModalDevice(null);
    }, 1200);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto select-none font-sans pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#13493B]/10 pb-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FF6A00]/15 text-[#FFAA00] border border-[#FF6A00]/30 text-[10px] font-black uppercase tracking-wider mb-1">
            <Radio className="w-3 h-3" /> Admin Device Management
          </div>
          <h1 className="text-2xl font-black text-[#07221A] tracking-tight">IoT Hardware Nodes</h1>
          <p className="text-xs text-[#5C7F75] font-semibold">
            Manage ESP32 micro-nodes, Wi-Fi reprovisioning, and safety thresholds
          </p>
        </div>

        {activeDevice && (
          <button
            onClick={() => { setActiveDeviceId(null); setSearchParams({}); }}
            className="px-4 py-2 rounded-xl bg-white border border-[#13493B]/15 text-xs font-bold text-[#07221A] hover:bg-[#F4F7F6] flex items-center gap-1.5 cursor-pointer shadow-sm self-start sm:self-auto"
          >
            <ArrowLeft className="w-4 h-4 text-[#20E79A]" />
            <span>View All Devices</span>
          </button>
        )}
      </div>

      {/* VIEW MODE A: SINGLE DEVICE DETAILS VIEW */}
      {activeDevice ? (
        <div className="space-y-6">
          {/* Main Device Details Card */}
          <div className="bg-white border border-[#13493B]/10 rounded-[32px] p-6 sm:p-8 shadow-md space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#F4F7F6] pb-5">
              <div className="space-y-1">
                <span className="text-[10px] font-black uppercase tracking-wider text-[#20E79A] bg-[#EBFBF4] px-2.5 py-1 rounded-full border border-[#20E79A]/20">
                  ESP32 Monitored Node
                </span>
                <h2 className="text-2xl font-black text-[#07221A] tracking-tight">{activeDevice.product || 'Milk'}</h2>
                <p className="text-xs font-mono font-bold text-[#FFAA00]">Device ID: {activeDevice.device_id}</p>
              </div>

              <div className="flex items-center gap-2">
                <span className={`px-3 py-1.5 rounded-full text-xs font-black flex items-center gap-1.5 ${
                  activeDevice.online ? 'bg-emerald-100 text-emerald-700 border border-emerald-300' : 'bg-slate-100 text-slate-600 border border-slate-300'
                }`}>
                  <span className={`w-2 h-2 rounded-full ${activeDevice.online ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`} />
                  <span>{activeDevice.online ? 'Online' : 'Offline'}</span>
                </span>
              </div>
            </div>

            {/* Status Grid: ESP32, Wi-Fi, Firebase */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* ESP32 Status */}
              <div className="p-4 rounded-2xl bg-[#F4F7F6] border border-[#13493B]/10 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white text-[#20E79A] border border-[#13493B]/10 flex items-center justify-center shrink-0 shadow-sm">
                  <Cpu className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] font-extrabold uppercase text-[#5C7F75] block">ESP32 Hardware</span>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span className="text-xs font-black text-[#07221A]">{activeDevice.online ? 'Online' : 'Offline'}</span>
                  </div>
                </div>
              </div>

              {/* Wi-Fi Status */}
              <div className="p-4 rounded-2xl bg-[#F4F7F6] border border-[#13493B]/10 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white text-blue-500 border border-[#13493B]/10 flex items-center justify-center shrink-0 shadow-sm">
                  <Wifi className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] font-extrabold uppercase text-[#5C7F75] block">Wi-Fi Connection</span>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span className="text-xs font-black text-[#07221A]">Connected</span>
                  </div>
                </div>
              </div>

              {/* Firebase Status */}
              <div className="p-4 rounded-2xl bg-[#F4F7F6] border border-[#13493B]/10 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white text-[#FFAA00] border border-[#13493B]/10 flex items-center justify-center shrink-0 shadow-sm">
                  <Database className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] font-extrabold uppercase text-[#5C7F75] block">Firebase Cloud</span>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span className="text-xs font-black text-[#07221A]">Connected</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Live Sensor Telemetry */}
            <div className="space-y-2 pt-2">
              <h3 className="text-xs font-black uppercase tracking-wider text-[#5C7F75]">Live Telemetry Readings</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-2xl bg-white border border-[#13493B]/10 shadow-sm flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-extrabold text-[#5C7F75] uppercase block">Temperature</span>
                    <span className="text-2xl font-black text-[#07221A]">{activeDevice.temperature} °C</span>
                  </div>
                  <Thermometer className="w-6 h-6 text-[#FF5A67]" />
                </div>

                <div className="p-4 rounded-2xl bg-white border border-[#13493B]/10 shadow-sm flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-extrabold text-[#5C7F75] uppercase block">Humidity</span>
                    <span className="text-2xl font-black text-[#07221A]">{activeDevice.humidity} %</span>
                  </div>
                  <Droplets className="w-6 h-6 text-blue-500" />
                </div>

                <div className="p-4 rounded-2xl bg-white border border-[#13493B]/10 shadow-sm flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-extrabold text-[#5C7F75] uppercase block">MQ-135 Raw</span>
                    <span className="text-2xl font-black text-[#07221A]">{activeDevice.mq135_raw}</span>
                  </div>
                  <Wind className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </div>

            {/* Device Management Section */}
            <div className="border-t border-[#13493B]/10 pt-6 space-y-4">
              <h3 className="text-sm font-black text-[#07221A] uppercase tracking-wider">Device Management</h3>

              <div className="flex flex-col sm:flex-row gap-3">
                {/* Admin Only Change Wi-Fi Button */}
                <button
                  onClick={() => setWifiModalDeviceId(activeDevice.device_id)}
                  className="px-6 py-3.5 rounded-2xl btn-orange text-white font-black text-xs shadow-lg hover:brightness-110 flex items-center justify-center gap-2 cursor-pointer flex-1"
                >
                  <Wifi className="w-4 h-4" />
                  <span>CHANGE WI-FI</span>
                </button>

                {/* Configure Thresholds Button */}
                <button
                  onClick={() => handleOpenConfigModal(activeDevice)}
                  className="px-6 py-3.5 rounded-2xl bg-white border border-[#13493B]/20 text-[#07221A] font-black text-xs hover:bg-[#F4F7F6] flex items-center justify-center gap-2 cursor-pointer flex-1 shadow-sm"
                >
                  <Sliders className="w-4 h-4 text-[#20E79A]" />
                  <span>CONFIGURE THRESHOLDS</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* VIEW MODE B: ALL DEVICES GRID */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {devicesList.map((dev) => (
            <div
              key={dev.device_id}
              className="bg-white rounded-[28px] p-5 border border-[#13493B]/10 shadow-sm space-y-4 relative hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[9px] font-black uppercase tracking-wider text-[#20E79A] bg-[#EBFBF4] px-2 py-0.5 rounded-full border border-[#20E79A]/20">
                    Micro-Node
                  </span>
                  <h3 className="text-base font-black text-[#07221A] mt-1">{dev.product || 'Milk'}</h3>
                  <p className="text-xs font-mono font-bold text-[#FFAA00]">{dev.device_id}</p>
                </div>

                <span className={`px-2.5 py-1 rounded-full text-[10px] font-black ${
                  dev.online ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'
                }`}>
                  {dev.online ? 'ONLINE' : 'OFFLINE'}
                </span>
              </div>

              {/* Sensor Summary */}
              <div className="grid grid-cols-3 gap-2 p-3 rounded-2xl bg-[#F4F7F6] text-center border border-[#13493B]/5">
                <div>
                  <span className="text-[9px] font-bold text-[#5C7F75] uppercase block">Temp</span>
                  <span className="text-xs font-black text-[#07221A]">{dev.temperature}°C</span>
                </div>
                <div>
                  <span className="text-[9px] font-bold text-[#5C7F75] uppercase block">Humidity</span>
                  <span className="text-xs font-black text-[#07221A]">{dev.humidity}%</span>
                </div>
                <div>
                  <span className="text-[9px] font-bold text-[#5C7F75] uppercase block">MQ-135</span>
                  <span className="text-xs font-black text-[#07221A]">{dev.mq135_raw}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-1">
                <button
                  onClick={() => { setActiveDeviceId(dev.device_id); setSearchParams({ id: dev.device_id }); }}
                  className="flex-1 py-2.5 rounded-xl bg-[#07221A] text-white font-bold text-xs hover:bg-[#134336] flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
                >
                  <Cpu className="w-3.5 h-3.5 text-[#20E79A]" />
                  <span>VIEW DETAILS</span>
                </button>
                <button
                  onClick={() => setWifiModalDeviceId(dev.device_id)}
                  className="flex-1 py-2.5 rounded-xl btn-orange text-white font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
                >
                  <Wifi className="w-3.5 h-3.5" />
                  <span>CHANGE WI-FI</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ADMIN CHANGE WI-FI REPROVISIONING MODAL */}
      {wifiModalDeviceId && (
        <ChangeWifiModal
          deviceId={wifiModalDeviceId}
          currentWifiSsid="Home Wi-Fi"
          onClose={() => setWifiModalDeviceId(null)}
          onSuccess={() => {
            // Refresh device view if active
          }}
        />
      )}

      {/* DEVICE CONFIGURATION THRESHOLDS MODAL */}
      {configModalDevice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
          <div className="bg-white w-full max-w-lg rounded-3xl p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-lg font-black text-[#07221A]">Device Threshold Configuration</h3>
                <p className="text-xs text-[#5C7F75] font-mono">ID: {configModalDevice.device_id}</p>
              </div>
              <button
                onClick={() => setConfigModalDevice(null)}
                className="w-8 h-8 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center hover:bg-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {saveSuccess && (
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                <span>Configuration saved to Firebase!</span>
              </div>
            )}

            <form onSubmit={handleSaveConfig} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-[#07221A] uppercase block mb-1">
                  Assigned Product Name
                </label>
                <input
                  type="text"
                  required
                  value={productName}
                  onChange={e => setProductName(e.target.value)}
                  className="w-full border border-slate-200 px-3.5 py-2.5 rounded-xl text-sm font-bold text-[#07221A] focus:outline-none focus:border-[#20E79A]"
                />
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 space-y-3">
                <h4 className="text-xs font-bold text-[#07221A] uppercase tracking-wider flex items-center gap-1.5">
                  <Thermometer className="w-4 h-4 text-[#FF5A67]" /> Temperature Thresholds (°C)
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-bold text-[#5C7F75] uppercase block mb-1">Min (°C)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={tempMin}
                      onChange={e => setTempMin(e.target.value === '' ? '' : Number(e.target.value))}
                      className="w-full bg-white border border-slate-200 px-3 py-2 rounded-xl text-xs font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-[#5C7F75] uppercase block mb-1">Max (°C)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={tempMax}
                      onChange={e => setTempMax(e.target.value === '' ? '' : Number(e.target.value))}
                      className="w-full bg-white border border-slate-200 px-3 py-2 rounded-xl text-xs font-bold"
                    />
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 space-y-3">
                <h4 className="text-xs font-bold text-[#07221A] uppercase tracking-wider flex items-center gap-1.5">
                  <Droplets className="w-4 h-4 text-blue-500" /> Humidity Thresholds (%)
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-bold text-[#5C7F75] uppercase block mb-1">Min (%)</label>
                    <input
                      type="number"
                      value={humMin}
                      onChange={e => setHumMin(e.target.value === '' ? '' : Number(e.target.value))}
                      className="w-full bg-white border border-slate-200 px-3 py-2 rounded-xl text-xs font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-[#5C7F75] uppercase block mb-1">Max (%)</label>
                    <input
                      type="number"
                      value={humMax}
                      onChange={e => setHumMax(e.target.value === '' ? '' : Number(e.target.value))}
                      className="w-full bg-white border border-slate-200 px-3 py-2 rounded-xl text-xs font-bold"
                    />
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 space-y-2">
                <h4 className="text-xs font-bold text-[#07221A] uppercase tracking-wider flex items-center gap-1.5">
                  <Wind className="w-4 h-4 text-purple-600" /> MQ-135 Gas Reference Threshold
                </h4>
                <div>
                  <label className="text-[10px] font-bold text-[#5C7F75] uppercase block mb-1">Threshold Raw Value</label>
                  <input
                    type="number"
                    value={mqThreshold}
                    onChange={e => setMqThreshold(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full bg-white border border-slate-200 px-3 py-2 rounded-xl text-xs font-bold"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 rounded-xl bg-[#07221A] text-white font-bold text-xs shadow-md hover:bg-[#134336] flex items-center justify-center gap-2 cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>SAVE CONFIGURATION TO FIREBASE</span>
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Cpu, Wifi, WifiOff, Edit3, Save, X, Activity, Thermometer, Droplets, Wind, Plus, CheckCircle2 } from 'lucide-react';
import { DeviceData } from '../types';

export const AdminDevices: React.FC = () => {
  const { devicesMap, updateDeviceData, updateProductProfile, productProfiles } = useApp();

  const [selectedDevice, setSelectedDevice] = useState<DeviceData | null>(null);

  // Configuration edit form states
  const [productName, setProductName] = useState('');
  const [tempMin, setTempMin] = useState<number | ''>(2.0);
  const [tempMax, setTempMax] = useState<number | ''>(6.0);
  const [humMin, setHumMin] = useState<number | ''>(50);
  const [humMax, setHumMax] = useState<number | ''>(70);
  const [mqThreshold, setMqThreshold] = useState<number | ''>(1500);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const devicesList: DeviceData[] = Object.values(devicesMap);

  const handleOpenConfigure = (dev: DeviceData) => {
    setSelectedDevice(dev);
    setProductName(dev.product || 'Milk');
    
    // Find matching product profile if available
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
    if (!selectedDevice) return;

    // Update Device Name / Product
    await updateDeviceData(selectedDevice.device_id, {
      product: productName
    });

    // Update Product Profile Thresholds
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
      setSelectedDevice(null);
    }, 1200);
  };

  return (
    <div className="space-y-5 max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl font-black text-[#082A52] tracking-tight">Device Management</h1>
        <p className="text-xs text-slate-500 font-medium">Configure ESP32 hardware units and safety monitoring rules</p>
      </div>

      {/* Devices Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {devicesList.map((dev) => (
          <div
            key={dev.device_id}
            className="glass-card p-5 rounded-3xl border border-white/80 shadow-lg space-y-3 relative"
          >
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-sky-600 bg-sky-100 px-2 py-0.5 rounded-full">
                  Device Unit
                </span>
                <h3 className="text-base font-black text-[#082A52] mt-1">{dev.product || 'Milk'}</h3>
                <p className="text-xs font-mono font-bold text-sky-700">{dev.device_id}</p>
              </div>

              <span className={`px-2.5 py-1 rounded-full text-[10px] font-black ${
                dev.online ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-600'
              }`}>
                {dev.online ? 'ONLINE' : 'OFFLINE'}
              </span>
            </div>

            {/* Sensor Telemetry Readings */}
            <div className="grid grid-cols-3 gap-2 p-3 rounded-2xl bg-sky-50/80 text-center">
              <div>
                <span className="text-[9px] font-bold text-slate-400 uppercase block">Temp</span>
                <span className="text-sm font-black text-[#082A52]">{dev.temperature}°C</span>
              </div>
              <div>
                <span className="text-[9px] font-bold text-slate-400 uppercase block">Humidity</span>
                <span className="text-sm font-black text-[#082A52]">{dev.humidity}%</span>
              </div>
              <div>
                <span className="text-[9px] font-bold text-slate-400 uppercase block">MQ-135</span>
                <span className="text-sm font-black text-[#082A52]">{dev.mq135_raw}</span>
              </div>
            </div>

            <button
              onClick={() => handleOpenConfigure(dev)}
              className="w-full py-2.5 rounded-xl bg-[#1267D6] text-white font-bold text-xs shadow-md hover:brightness-110 flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Edit3 className="w-4 h-4" />
              <span>CONFIGURE DEVICE</span>
            </button>
          </div>
        ))}
      </div>

      {/* DEVICE CONFIGURATION MODAL */}
      {selectedDevice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
          <div className="glass-card w-full max-w-lg rounded-3xl p-6 bg-white/95 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-sky-100">
              <div>
                <h3 className="text-lg font-black text-[#082A52]">Device Configuration</h3>
                <p className="text-xs text-slate-500 font-mono">ID: {selectedDevice.device_id}</p>
              </div>
              <button
                onClick={() => setSelectedDevice(null)}
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
                <label className="text-xs font-bold text-[#082A52] uppercase block mb-1">
                  Assigned Product Name
                </label>
                <input
                  type="text"
                  required
                  value={productName}
                  onChange={e => setProductName(e.target.value)}
                  className="w-full glass-input px-3.5 py-2.5 rounded-xl text-sm font-bold text-[#082A52]"
                />
              </div>

              <div className="p-4 rounded-2xl bg-sky-50/80 space-y-3">
                <h4 className="text-xs font-bold text-[#082A52] uppercase tracking-wider flex items-center gap-1.5">
                  <Thermometer className="w-4 h-4 text-[#1267D6]" /> Temperature Thresholds (°C)
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Min (°C)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={tempMin}
                      onChange={e => setTempMin(e.target.value === '' ? '' : Number(e.target.value))}
                      className="w-full glass-input px-3 py-2 rounded-xl text-xs font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Max (°C)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={tempMax}
                      onChange={e => setTempMax(e.target.value === '' ? '' : Number(e.target.value))}
                      className="w-full glass-input px-3 py-2 rounded-xl text-xs font-bold"
                    />
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-sky-50/80 space-y-3">
                <h4 className="text-xs font-bold text-[#082A52] uppercase tracking-wider flex items-center gap-1.5">
                  <Droplets className="w-4 h-4 text-[#1267D6]" /> Humidity Thresholds (%)
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Min (%)</label>
                    <input
                      type="number"
                      value={humMin}
                      onChange={e => setHumMin(e.target.value === '' ? '' : Number(e.target.value))}
                      className="w-full glass-input px-3 py-2 rounded-xl text-xs font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Max (%)</label>
                    <input
                      type="number"
                      value={humMax}
                      onChange={e => setHumMax(e.target.value === '' ? '' : Number(e.target.value))}
                      className="w-full glass-input px-3 py-2 rounded-xl text-xs font-bold"
                    />
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-sky-50/80 space-y-2">
                <h4 className="text-xs font-bold text-[#082A52] uppercase tracking-wider flex items-center gap-1.5">
                  <Wind className="w-4 h-4 text-[#1267D6]" /> MQ-135 Gas Reference Threshold
                </h4>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Threshold Raw Value</label>
                  <input
                    type="number"
                    value={mqThreshold}
                    onChange={e => setMqThreshold(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full glass-input px-3 py-2 rounded-xl text-xs font-bold"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 rounded-xl bg-[#1267D6] text-white font-bold text-xs shadow-lg shadow-sky-500/20 hover:brightness-110 flex items-center justify-center gap-2 cursor-pointer"
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

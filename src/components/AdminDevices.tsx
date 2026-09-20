import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { DeviceData, ProductProfile } from '../types';
import { 
  Plus, 
  Trash2, 
  Cpu, 
  Wifi, 
  WifiOff, 
  Check, 
  X, 
  Info,
  Activity,
  ChevronRight,
  Database,
  ArrowLeft
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const AdminDevices: React.FC = () => {
  const { devicesMap, productProfiles, registerDevice, deleteDevice, updateDeviceData } = useApp();
  const navigate = useNavigate();

  const [isRegistering, setIsRegistering] = useState(false);
  const [newId, setNewId] = useState('');
  const [newProduct, setNewProduct] = useState('');
  const [selectedProfileId, setSelectedProfileId] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const devicesArray: DeviceData[] = Object.values(devicesMap);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!newId.trim() || !newProduct.trim()) {
      setError('Device ID and Product Category are required.');
      return;
    }

    try {
      const selectedProfile = productProfiles.find(p => p.id === selectedProfileId);
      
      await registerDevice(newId.trim(), {
        product: newProduct.trim(),
        profile_id: selectedProfileId || undefined,
        temperature: selectedProfile ? selectedProfile.tempMin : 4.2,
        humidity: selectedProfile ? selectedProfile.humidityMin : 62.0,
        mq135_raw: 120,
        online: true,
        last_update: Date.now()
      });

      setSuccess('IoT Node successfully registered and synchronized!');
      setNewId('');
      setNewProduct('');
      setSelectedProfileId('');
      setIsRegistering(false);
    } catch (err: any) {
      setError(err.message || 'Failed to register IoT node.');
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm(`Are you sure you want to delete IoT node ${id}?`)) {
      try {
        await deleteDevice(id);
      } catch (err) {
        console.error('Delete failed:', err);
      }
    }
  };

  const handleToggleOnline = async (id: string, currentOnline: boolean) => {
    try {
      await updateDeviceData(id, { online: !currentOnline });
    } catch (err) {
      console.error('Failed to toggle node online status:', err);
    }
  };

  return (
    <div className="space-y-6 select-none text-[#edeff2]">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 border-b border-white/5 pb-4">
        <div>
          <button 
            onClick={() => navigate('/admin')}
            className="flex items-center gap-1 text-[11px] font-black text-[#21c55d] uppercase tracking-wider mb-1 cursor-pointer hover:underline"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Control Console</span>
          </button>
          <h1 className="text-2xl font-black text-white tracking-tight">
            IoT Sensor Node Registry
          </h1>
          <p className="text-xs text-slate-400 font-semibold mt-0.5">
            Register and manage active physical ESP32 freshness probes connected to FreshNex.
          </p>
        </div>

        <button
          onClick={() => setIsRegistering(!isRegistering)}
          className="px-4 py-2.5 rounded-xl bg-[#21c55d] text-[#0b0b0c] text-xs font-black shadow-md hover:brightness-110 active:scale-98 transition-all flex items-center gap-1.5 cursor-pointer"
        >
          <Plus className="w-4 h-4 stroke-[3px]" />
          <span>{isRegistering ? 'CLOSE FORM' : 'ADD NEW NODE'}</span>
        </button>
      </div>

      {/* Registration Form (Slide out layout) */}
      {isRegistering && (
        <div className="bg-[#141416] border border-white/5 rounded-2xl p-5 shadow-xl max-w-lg space-y-4">
          <h3 className="text-sm font-black uppercase text-[#21c55d] tracking-wider">Register ESP32 Hardware Probe</h3>
          
          <form onSubmit={handleRegister} className="space-y-3.5">
            <div>
              <label className="block text-[10px] font-black uppercase text-slate-400 tracking-wider mb-1.5">
                Physical Device MAC/UID ID
              </label>
              <input
                type="text"
                value={newId}
                onChange={(e) => setNewId(e.target.value)}
                placeholder="e.g. YGS-FD-000125"
                className="w-full h-11 px-3.5 rounded-xl bg-white/5 border border-white/5 text-xs font-bold focus:border-[#21c55d] focus:outline-none transition-all placeholder:text-slate-600"
                required
              />
            </div>

            <div>
              <label className="block text-[10px] font-black uppercase text-slate-400 tracking-wider mb-1.5">
                Food Product Name / Category
              </label>
              <input
                type="text"
                value={newProduct}
                onChange={(e) => setNewProduct(e.target.value)}
                placeholder="e.g. Fresh Milk Carton"
                className="w-full h-11 px-3.5 rounded-xl bg-white/5 border border-white/5 text-xs font-bold focus:border-[#21c55d] focus:outline-none transition-all placeholder:text-slate-600"
                required
              />
            </div>

            <div>
              <label className="block text-[10px] font-black uppercase text-slate-400 tracking-wider mb-1.5">
                Associate Threshold Rule Profile (Optional)
              </label>
              <select
                value={selectedProfileId}
                onChange={(e) => setSelectedProfileId(e.target.value)}
                className="w-full h-11 px-3.5 rounded-xl bg-[#141416] border border-white/5 text-xs font-bold focus:border-[#21c55d] focus:outline-none transition-all"
              >
                <option value="">-- No Rule Profile (Default Lettuce Bounds) --</option>
                {productProfiles.map(p => (
                  <option key={p.id} value={p.id}>{p.name} ({p.tempMin}°C - {p.tempMax}°C)</option>
                ))}
              </select>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-xs font-semibold">
                {error}
              </div>
            )}

            {success && (
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs font-semibold">
                {success}
              </div>
            )}

            <button
              type="submit"
              className="w-full h-11 rounded-xl bg-[#21c55d] text-[#0b0b0c] text-xs font-black shadow-lg shadow-emerald-500/10 hover:brightness-110 active:scale-98 transition-all cursor-pointer"
            >
              PROVISION NODE
            </button>
          </form>
        </div>
      )}

      {/* Grid of registered nodes */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {devicesArray.map((dev) => {
          const profile = productProfiles.find(p => p.id === dev.profile_id);

          return (
            <div 
              key={dev.device_id}
              className="bg-[#141416] border border-white/5 rounded-2xl p-5 shadow-lg flex flex-col justify-between space-y-4"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#38bdf8] shadow-[0_0_8px_#38bdf8]" />
                    <span className="font-mono text-[9px] text-[#38bdf8] uppercase tracking-widest font-black">
                      UID: {dev.device_id}
                    </span>
                  </div>
                  <h3 className="text-sm font-black text-white mt-1.5">{dev.product || 'Organic Veggies'}</h3>
                  <p className="text-[10px] text-slate-400 font-semibold mt-0.5">
                    Rule Profile: <strong className="text-slate-300">{profile ? profile.name : 'Veggies Standard'}</strong>
                  </p>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleToggleOnline(dev.device_id, !!dev.online)}
                    className={`px-2.5 py-1 rounded-lg text-[9px] font-black tracking-wider transition-all border cursor-pointer ${
                      dev.online 
                        ? 'bg-[rgba(33,197,93,0.1)] text-[#21c55d] border-[rgba(33,197,93,0.15)]' 
                        : 'bg-white/5 text-slate-400 border-white/5'
                    }`}
                  >
                    {dev.online ? 'ONLINE' : 'OFFLINE'}
                  </button>

                  <button
                    onClick={() => handleDelete(dev.device_id)}
                    className="w-8 h-8 rounded-lg bg-white/5 hover:bg-red-500/10 hover:text-red-400 text-slate-400 flex items-center justify-center transition-all cursor-pointer border border-white/5"
                    title="Remove device registration"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Status and telemetry grid */}
              <div className="grid grid-cols-3 gap-2 bg-[#0b0b0c] p-3.5 rounded-xl border border-white/5">
                <div className="text-center">
                  <span className="text-[9px] font-bold text-slate-500 block uppercase">Temperature</span>
                  <span className="text-xs font-black text-white block mt-0.5">{dev.temperature}°C</span>
                </div>
                <div className="text-center border-x border-white/5">
                  <span className="text-[9px] font-bold text-slate-500 block uppercase">Humidity</span>
                  <span className="text-xs font-black text-white block mt-0.5">{dev.humidity}%</span>
                </div>
                <div className="text-center">
                  <span className="text-[9px] font-bold text-slate-500 block uppercase">MQ-135 Gas</span>
                  <span className="text-xs font-black text-white block mt-0.5">{dev.mq135_raw}</span>
                </div>
              </div>

              {/* Last update indicator */}
              <div className="flex items-center justify-between text-[10px] text-slate-400 font-bold border-t border-white/5 pt-3">
                <span className="flex items-center gap-1">
                  <Activity className="w-3.5 h-3.5 text-slate-500 animate-pulse" />
                  <span>Data Frame Sync</span>
                </span>
                <span>{new Date(dev.last_update || Date.now()).toLocaleTimeString()}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

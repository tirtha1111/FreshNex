import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ProductProfile } from '../types';
import { 
  Plus, 
  Trash2, 
  Save, 
  Leaf, 
  Info, 
  Edit,
  ArrowLeft,
  Settings,
  ChevronRight
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const AdminProducts: React.FC = () => {
  const { productProfiles, updateProductProfile, addProductProfile, deleteProductProfile } = useApp();
  const navigate = useNavigate();

  const [isAdding, setIsAdding] = useState(false);
  const [name, setName] = useState('');
  const [tempMin, setTempMin] = useState(2.0);
  const [tempMax, setTempMax] = useState(6.0);
  const [humidityMin, setHumidityMin] = useState(60);
  const [humidityMax, setHumidityMax] = useState(70);
  const [mq135Max, setMq135Max] = useState(1500);

  const [editingProfile, setEditingProfile] = useState<ProductProfile | null>(null);

  const handleAddProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      const newProfile: Omit<ProductProfile, 'id'> = {
        name: name.trim(),
        temperature_min: tempMin,
        temperature_max: tempMax,
        humidity_min: humidityMin,
        humidity_max: humidityMax,
        mq135_threshold: mq135Max
      };

      await addProductProfile(newProfile);
      setIsAdding(false);
      setName('');
      setTempMin(2.0);
      setTempMax(6.0);
      setHumidityMin(60);
      setHumidityMax(70);
      setMq135Max(1500);
    } catch (err) {
      console.error('Failed to save profile thresholds:', err);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this threshold rule profile?')) {
      await deleteProductProfile(id);
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
            Freshness Threshold Rules
          </h1>
          <p className="text-xs text-slate-400 font-semibold mt-0.5">
            Configure optimal temperature, moisture levels, and organic gas rules for predictive spoilage detection.
          </p>
        </div>

        <button
          onClick={() => setIsAdding(!isAdding)}
          className="px-4 py-2.5 rounded-xl bg-[#21c55d] text-[#0b0b0c] text-xs font-black shadow-md hover:brightness-110 active:scale-98 transition-all flex items-center gap-1.5 cursor-pointer"
        >
          <Plus className="w-4 h-4 stroke-[3px]" />
          <span>{isAdding ? 'CLOSE FORM' : 'ADD NEW PROFILE'}</span>
        </button>
      </div>

      {/* Creation form */}
      {isAdding && (
        <div className="bg-[#141416] border border-white/5 rounded-2xl p-5 shadow-xl max-w-xl space-y-4">
          <h3 className="text-sm font-black uppercase text-[#21c55d] tracking-wider flex items-center gap-2">
            <Settings className="w-4 h-4" />
            <span>Define Optimal Preservation Rules</span>
          </h3>

          <form onSubmit={handleAddProfile} className="space-y-4">
            <div>
              <label className="block text-[10px] font-black uppercase text-slate-400 tracking-wider mb-1.5">
                Product Category Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Cold Water Seafood"
                className="w-full h-11 px-3.5 rounded-xl bg-white/5 border border-white/5 text-xs font-bold focus:border-[#21c55d] focus:outline-none transition-all placeholder:text-slate-600"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-black uppercase text-slate-400 tracking-wider mb-1.5">
                  Min Temperature (°C)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={tempMin}
                  onChange={(e) => setTempMin(parseFloat(e.target.value))}
                  className="w-full h-11 px-3.5 rounded-xl bg-white/5 border border-white/5 text-xs font-bold focus:border-[#21c55d] focus:outline-none transition-all"
                  required
                />
              </div>
              <div>
                <label className="block text-[10px] font-black uppercase text-slate-400 tracking-wider mb-1.5">
                  Max Temperature (°C)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={tempMax}
                  onChange={(e) => setTempMax(parseFloat(e.target.value))}
                  className="w-full h-11 px-3.5 rounded-xl bg-white/5 border border-white/5 text-xs font-bold focus:border-[#21c55d] focus:outline-none transition-all"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-black uppercase text-slate-400 tracking-wider mb-1.5">
                  Min Humidity (%)
                </label>
                <input
                  type="number"
                  value={humidityMin}
                  onChange={(e) => setHumidityMin(parseInt(e.target.value))}
                  className="w-full h-11 px-3.5 rounded-xl bg-white/5 border border-white/5 text-xs font-bold focus:border-[#21c55d] focus:outline-none transition-all"
                  required
                />
              </div>
              <div>
                <label className="block text-[10px] font-black uppercase text-slate-400 tracking-wider mb-1.5">
                  Max Humidity (%)
                </label>
                <input
                  type="number"
                  value={humidityMax}
                  onChange={(e) => setHumidityMax(parseInt(e.target.value))}
                  className="w-full h-11 px-3.5 rounded-xl bg-white/5 border border-white/5 text-xs font-bold focus:border-[#21c55d] focus:outline-none transition-all"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-black uppercase text-slate-400 tracking-wider mb-1.5">
                Maximum MQ-135 Organic Gas Threshold (Raw PPM)
              </label>
              <input
                type="number"
                value={mq135Max}
                onChange={(e) => setMq135Max(parseInt(e.target.value))}
                className="w-full h-11 px-3.5 rounded-xl bg-white/5 border border-white/5 text-xs font-bold focus:border-[#21c55d] focus:outline-none transition-all"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full h-11 rounded-xl bg-[#21c55d] text-[#0b0b0c] text-xs font-black shadow-lg shadow-emerald-500/10 hover:brightness-110 active:scale-98 transition-all cursor-pointer"
            >
              SAVE THRESHOLD RULE PROFILE
            </button>
          </form>
        </div>
      )}

      {/* Grid of existing threshold rules */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {productProfiles.map((p) => (
          <div 
            key={p.id}
            className="bg-[#141416] border border-white/5 rounded-2xl p-5 shadow-lg flex flex-col justify-between space-y-4"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-[#21c55d]">
                  <Leaf className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-white">{p.name}</h3>
                  <span className="text-[9px] font-mono font-bold text-slate-500 uppercase tracking-widest block mt-0.5">
                    ID: {p.id.substring(0, 8)}
                  </span>
                </div>
              </div>

              <button
                onClick={() => handleDelete(p.id)}
                className="w-8 h-8 rounded-lg bg-white/5 hover:bg-red-500/10 hover:text-red-400 text-slate-400 flex items-center justify-center transition-all cursor-pointer border border-white/5"
                title="Delete threshold rule"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            {/* Threshold specifications display */}
            <div className="space-y-2 text-xs font-semibold bg-[#0b0b0c] p-4 rounded-xl border border-white/5">
              <div className="flex justify-between items-center text-slate-400">
                <span>Temperature Range:</span>
                <span className="text-white font-black">{p.temperature_min}°C to {p.temperature_max}°C</span>
              </div>
              <div className="flex justify-between items-center text-slate-400 border-t border-white/5 pt-2">
                <span>Humidity Range:</span>
                <span className="text-white font-black">{p.humidity_min}% to {p.humidity_max}%</span>
              </div>
              <div className="flex justify-between items-center text-slate-400 border-t border-white/5 pt-2">
                <span>Organic Gas Ceiling:</span>
                <span className="text-[#fbbf24] font-black">{p.mq135_threshold} PPM</span>
              </div>
            </div>

            <div className="flex items-center justify-between text-[10px] text-slate-400 font-bold border-t border-white/5 pt-3">
              <span className="flex items-center gap-1">
                <Info className="w-3.5 h-3.5 text-slate-500" />
                <span>Predictive Spoilage Active</span>
              </span>
              <span className="text-[#21c55d] uppercase tracking-wider font-extrabold flex items-center gap-0.5">
                <span>Engaged</span>
                <ChevronRight className="w-3 h-3" />
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

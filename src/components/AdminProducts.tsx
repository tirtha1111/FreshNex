import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { PackageCheck, Plus, Trash2, Edit3, Save, X } from 'lucide-react';
import { ProductProfile } from '../types';

export const AdminProducts: React.FC = () => {
  const { productProfiles, updateProductProfile } = useApp();
  const [selectedProfile, setSelectedProfile] = useState<ProductProfile | null>(null);

  const [name, setName] = useState('');
  const [tempMin, setTempMin] = useState<number | ''>(2.0);
  const [tempMax, setTempMax] = useState<number | ''>(6.0);
  const [humMin, setHumMin] = useState<number | ''>(50);
  const [humMax, setHumMax] = useState<number | ''>(70);
  const [mqThreshold, setMqThreshold] = useState<number | ''>(1500);

  const handleOpenAdd = () => {
    setSelectedProfile({
      id: `p_${Date.now()}`,
      name: '',
      temperature_min: 2.0,
      temperature_max: 6.0,
      humidity_min: 50,
      humidity_max: 70,
      mq135_threshold: 1500
    });
    setName('');
    setTempMin(2.0);
    setTempMax(6.0);
    setHumMin(50);
    setHumMax(70);
    setMqThreshold(1500);
  };

  const handleOpenEdit = (prof: ProductProfile) => {
    setSelectedProfile(prof);
    setName(prof.name);
    setTempMin(prof.temperature_min ?? 2.0);
    setTempMax(prof.temperature_max ?? 6.0);
    setHumMin(prof.humidity_min ?? 50);
    setHumMax(prof.humidity_max ?? 70);
    setMqThreshold(prof.mq135_threshold ?? 1500);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProfile || !name.trim()) return;

    await updateProductProfile({
      id: selectedProfile.id,
      name: name.trim(),
      temperature_min: tempMin === '' ? null : Number(tempMin),
      temperature_max: tempMax === '' ? null : Number(tempMax),
      humidity_min: humMin === '' ? null : Number(humMin),
      humidity_max: humMax === '' ? null : Number(humMax),
      mq135_threshold: mqThreshold === '' ? null : Number(mqThreshold)
    });

    setSelectedProfile(null);
  };

  return (
    <div className="space-y-5 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-[#082A52] tracking-tight">Product Profiles</h1>
          <p className="text-xs text-slate-500 font-medium">Define safety thresholds for food categories</p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="px-4 py-2.5 rounded-xl bg-[#1267D6] text-white font-bold text-xs shadow-md hover:brightness-110 flex items-center gap-1.5 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>ADD PRODUCT PROFILE</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {productProfiles.map((prof) => (
          <div
            key={prof.id}
            className="glass-card p-5 rounded-3xl border border-white/80 shadow-lg space-y-3"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-sky-100 text-[#1267D6] font-black text-sm flex items-center justify-center">
                  {prof.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#082A52]">{prof.name}</h3>
                  <span className="text-[10px] font-mono text-slate-400">Profile ID: {prof.id}</span>
                </div>
              </div>
              <button
                onClick={() => handleOpenEdit(prof)}
                className="w-8 h-8 rounded-xl bg-sky-50 text-[#1267D6] flex items-center justify-center hover:bg-sky-100"
              >
                <Edit3 className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-1.5 text-xs text-slate-600 bg-sky-50/70 p-3 rounded-2xl">
              <div className="flex justify-between">
                <span>Temp Range:</span>
                <span className="font-bold text-[#082A52]">{prof.temperature_min}°C to {prof.temperature_max}°C</span>
              </div>
              <div className="flex justify-between">
                <span>Humidity Range:</span>
                <span className="font-bold text-[#082A52]">{prof.humidity_min}% to {prof.humidity_max}%</span>
              </div>
              <div className="flex justify-between">
                <span>MQ-135 Threshold:</span>
                <span className="font-bold text-[#082A52]">{prof.mq135_threshold} RAW</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* EDIT / ADD MODAL */}
      {selectedProfile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
          <div className="glass-card w-full max-w-md rounded-3xl p-6 bg-white/95 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-sky-100">
              <h3 className="text-base font-bold text-[#082A52]">Product Profile Configuration</h3>
              <button onClick={() => setSelectedProfile(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-[#082A52] uppercase block mb-1">Category / Product Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="e.g. Milk, Meat, Fish..."
                  className="w-full glass-input px-3.5 py-2.5 rounded-xl text-sm font-bold text-[#082A52]"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Temp Min (°C)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={tempMin}
                    onChange={e => setTempMin(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full glass-input px-3 py-2 rounded-xl text-xs font-bold"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Temp Max (°C)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={tempMax}
                    onChange={e => setTempMax(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full glass-input px-3 py-2 rounded-xl text-xs font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Hum Min (%)</label>
                  <input
                    type="number"
                    value={humMin}
                    onChange={e => setHumMin(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full glass-input px-3 py-2 rounded-xl text-xs font-bold"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Hum Max (%)</label>
                  <input
                    type="number"
                    value={humMax}
                    onChange={e => setHumMax(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full glass-input px-3 py-2 rounded-xl text-xs font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">MQ-135 Reference Threshold</label>
                <input
                  type="number"
                  value={mqThreshold}
                  onChange={e => setMqThreshold(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full glass-input px-3 py-2 rounded-xl text-xs font-bold"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3.5 rounded-xl bg-[#1267D6] text-white font-bold text-xs shadow-md hover:brightness-110 flex items-center justify-center gap-1.5 cursor-pointer mt-2"
              >
                <Save className="w-4 h-4" />
                <span>SAVE PROFILE</span>
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

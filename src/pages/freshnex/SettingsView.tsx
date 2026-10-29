import React, { useState } from 'react';
import { Save, Sliders, Thermometer, Database, UserCheck } from 'lucide-react';
import { useFreshNex } from '../../context/FreshNexContext';
import { ProductCategoryThreshold } from '../../types/freshnex';

export const SettingsView: React.FC = () => {
  const {
    thresholds,
    updateCategoryThreshold,
    temperatureUnit,
    setTemperatureUnit,
    dataMode,
    setDataMode,
    demoPhProbeConnected,
    setDemoPhProbeConnected,
  } = useFreshNex();

  const [selectedCatId, setSelectedCatId] = useState(thresholds[0].id);
  const activeCat =
    thresholds.find((t) => t.id === selectedCatId) || thresholds[0];

  const [tempMin, setTempMin] = useState(activeCat.temperature.min);
  const [tempMax, setTempMax] = useState(activeCat.temperature.max);
  const [humMin, setHumMin] = useState(activeCat.humidity.min);
  const [humMax, setHumMax] = useState(activeCat.humidity.max);
  const [gasMax, setGasMax] = useState(activeCat.mq135Raw.normalMax);
  const [luxMax, setLuxMax] = useState(activeCat.lightLux.max);
  const [savedNotice, setSavedNotice] = useState(false);

  const handleSelectCat = (id: string) => {
    setSelectedCatId(id);
    const found = thresholds.find((t) => t.id === id);
    if (found) {
      setTempMin(found.temperature.min);
      setTempMax(found.temperature.max);
      setHumMin(found.humidity.min);
      setHumMax(found.humidity.max);
      setGasMax(found.mq135Raw.normalMax);
      setLuxMax(found.lightLux.max);
    }
  };

  const handleSaveThresholds = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: ProductCategoryThreshold = {
      ...activeCat,
      temperature: { ...activeCat.temperature, min: Number(tempMin), max: Number(tempMax) },
      humidity: { ...activeCat.humidity, min: Number(humMin), max: Number(humMax) },
      mq135Raw: {
        ...activeCat.mq135Raw,
        normalMax: Number(gasMax),
        warningMax: Number(gasMax) + 100,
      },
      lightLux: {
        ...activeCat.lightLux,
        max: Number(luxMax),
        warningMax: Number(luxMax) + 200,
      },
    };
    updateCategoryThreshold(updated);
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 3000);
  };

  return (
    <div className="space-y-5">
      <div className="fnx-card p-5">
        <h1 className="text-xl sm:text-2xl font-extrabold text-[#102F46]">
          Platform & Threshold Settings
        </h1>
        <p className="text-xs text-[#71869A] mt-0.5">
          Configure product category environmental thresholds, measurement units, data source modes, and administrator preferences.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left: Threshold Configuration Form */}
        <div className="lg:col-span-7 fnx-card p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Sliders className="w-4 h-4 text-[#079B68]" />
              <h2 className="text-base font-extrabold text-[#102F46]">
                Configurable Thresholds by Product Category
              </h2>
            </div>
            {savedNotice && (
              <span className="px-2.5 py-1 rounded-lg bg-[#E5F8F0] text-[#079B68] text-xs font-bold">
                Thresholds Updated!
              </span>
            )}
          </div>

          <div className="flex flex-wrap gap-2 mb-4">
            {thresholds.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => handleSelectCat(t.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                  selectedCatId === t.id
                    ? 'bg-[#079B68] text-white'
                    : 'bg-[#F7FAFC] border border-[#DFEAF0] text-[#102F46]'
                }`}
              >
                {t.categoryName}
              </button>
            ))}
          </div>

          <form onSubmit={handleSaveThresholds} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#102F46] mb-1">
                  Min Acceptable Temperature (°C)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={tempMin}
                  onChange={(e) => setTempMin(Number(e.target.value))}
                  className="w-full h-10 px-3 rounded-xl border border-[#DFEAF0] text-xs font-mono-tabular"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#102F46] mb-1">
                  Max Acceptable Temperature (°C)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={tempMax}
                  onChange={(e) => setTempMax(Number(e.target.value))}
                  className="w-full h-10 px-3 rounded-xl border border-[#DFEAF0] text-xs font-mono-tabular"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#102F46] mb-1">
                  Min Relative Humidity (%RH)
                </label>
                <input
                  type="number"
                  value={humMin}
                  onChange={(e) => setHumMin(Number(e.target.value))}
                  className="w-full h-10 px-3 rounded-xl border border-[#DFEAF0] text-xs font-mono-tabular"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#102F46] mb-1">
                  Max Relative Humidity (%RH)
                </label>
                <input
                  type="number"
                  value={humMax}
                  onChange={(e) => setHumMax(Number(e.target.value))}
                  className="w-full h-10 px-3 rounded-xl border border-[#DFEAF0] text-xs font-mono-tabular"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#102F46] mb-1">
                  MQ135 Raw Baseline Ceiling (raw ADC)
                </label>
                <input
                  type="number"
                  value={gasMax}
                  onChange={(e) => setGasMax(Number(e.target.value))}
                  className="w-full h-10 px-3 rounded-xl border border-[#DFEAF0] text-xs font-mono-tabular"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#102F46] mb-1">
                  Max Light Exposure Ceiling (lux)
                </label>
                <input
                  type="number"
                  value={luxMax}
                  onChange={(e) => setLuxMax(Number(e.target.value))}
                  className="w-full h-10 px-3 rounded-xl border border-[#DFEAF0] text-xs font-mono-tabular"
                />
              </div>
            </div>

            <button
              type="submit"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#079B68] hover:bg-[#068559] text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Save Category Thresholds</span>
            </button>
          </form>
        </div>

        {/* Right: Units, Hardware Mode & Administrator Profile */}
        <div className="lg:col-span-5 space-y-5">
          <div className="fnx-card p-5 space-y-4">
            <div className="flex items-center gap-2">
              <Database className="w-4 h-4 text-[#079B68]" />
              <h2 className="text-base font-extrabold text-[#102F46]">
                Data Mode & Unit Preferences
              </h2>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#102F46] mb-1.5">
                Telemetry Operating Mode
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['demo', 'live', 'stale'] as const).map((m) => (
                  <button
                    key={m}
                    onClick={() => setDataMode(m)}
                    className={`py-2 px-3 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                      dataMode === m
                        ? 'bg-[#079B68] text-white border-[#079B68]'
                        : 'bg-[#F7FAFC] text-[#102F46] border-[#DFEAF0]'
                    }`}
                  >
                    {m === 'demo' ? 'Demo Mode' : m === 'live' ? 'Live ESP32' : 'Stale State'}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-[#DFEAF0]">
              <div>
                <div className="text-xs font-bold text-[#102F46]">Temperature Unit</div>
                <div className="text-[11px] text-[#71869A]">
                  Choose Celsius (°C) or Fahrenheit (°F)
                </div>
              </div>
              <div className="flex items-center bg-[#F7FAFC] border border-[#DFEAF0] rounded-xl p-1">
                <button
                  onClick={() => setTemperatureUnit('C')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold cursor-pointer ${
                    temperatureUnit === 'C'
                      ? 'bg-[#079B68] text-white'
                      : 'text-[#71869A]'
                  }`}
                >
                  °C
                </button>
                <button
                  onClick={() => setTemperatureUnit('F')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold cursor-pointer ${
                    temperatureUnit === 'F'
                      ? 'bg-[#079B68] text-white'
                      : 'text-[#71869A]'
                  }`}
                >
                  °F
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-[#DFEAF0]">
              <div>
                <div className="text-xs font-bold text-[#102F46]">
                  Simulated BNC pH Electrode (Demo Mode)
                </div>
                <div className="text-[11px] text-[#71869A]">
                  When off, pH card honestly displays "Not Connected"
                </div>
              </div>
              <button
                onClick={() => setDemoPhProbeConnected(!demoPhProbeConnected)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer ${
                  demoPhProbeConnected
                    ? 'bg-[#079B68] text-white'
                    : 'bg-[#F7FAFC] border border-[#DFEAF0] text-[#71869A]'
                }`}
              >
                {demoPhProbeConnected ? 'Connected (6.8 pH)' : 'Not Connected'}
              </button>
            </div>
          </div>

          <div className="fnx-card p-5">
            <div className="flex items-center gap-2 mb-3">
              <UserCheck className="w-4 h-4 text-[#079B68]" />
              <h2 className="text-base font-extrabold text-[#102F46]">
                Administrator Profile
              </h2>
            </div>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1.5 border-b border-[#DFEAF0]">
                <span className="text-[#71869A]">Display Name</span>
                <span className="font-bold text-[#102F46]">Tirtharaj Biswas</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-[#DFEAF0]">
                <span className="text-[#71869A]">Role</span>
                <span className="font-bold text-[#079B68]">Administrator</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-[#71869A]">Email</span>
                <span className="font-mono-tabular text-[#102F46]">
                  tirtharaj.biswas@freshnex.io
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

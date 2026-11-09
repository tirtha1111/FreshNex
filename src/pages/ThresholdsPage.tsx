import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sliders, 
  Thermometer, 
  Droplets, 
  Wind, 
  Activity, 
  Sun, 
  Sparkles, 
  Save, 
  RotateCcw, 
  CheckCircle2, 
  AlertTriangle, 
  Volume2, 
  VolumeX, 
  Cpu, 
  Package, 
  Search, 
  Loader2, 
  ShieldCheck,
  Radio,
  ArrowRight,
  Info
} from 'lucide-react';
import { DeviceData } from '../types';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { useFreshness } from '../context/FreshnessContext';
import { useSearchParams } from 'react-router-dom';
import { 
  saveProductThresholdToFirebase, 
  normalizeProductKey,
  DEFAULT_THRESHOLDS 
} from '../services/alertThresholdService';
import { researchProductThresholds, AIThresholdResearchResult } from '../services/aiThresholdService';

export const ThresholdsPage: React.FC = () => {
  const { devicesMap, updateDeviceData, productProfiles, updateProductProfile } = useApp();
  const { userProfile } = useAuth();
  const { thresholds: globalThresholds, updateThresholds, isAudioMuted, toggleAudioMute } = useFreshness();
  const [searchParams] = useSearchParams();

  const devicesList: DeviceData[] = (Object.values(devicesMap) as DeviceData[]).filter(
    (dev) => dev.device_id !== 'YGS-FD-000124' && dev.device_id !== 'YGS-FD-112233'
  );
  const paramId = searchParams.get('id');
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>(
    paramId && devicesMap[paramId] && paramId !== 'YGS-FD-000124' && paramId !== 'YGS-FD-112233'
      ? paramId
      : (devicesList[0]?.device_id || '')
  );

  const activeDevice: DeviceData | undefined = devicesMap[selectedDeviceId] || devicesList[0];

  // Selected device's threshold form state
  const activeProduct = activeDevice?.product || 'Monitored Produce';
  const canonical = normalizeProductKey(activeProduct);

  const initialThresholds = useMemo(() => {
    try {
      const stored = 
        localStorage.getItem(`freshnex_product_thresholds_${canonical}`) ||
        localStorage.getItem(`freshnex_product_thresholds_${selectedDeviceId}`);
      if (stored) {
        const p = JSON.parse(stored);
        return {
          tempMin: p.tempMin ?? 2.0,
          tempMax: p.tempMax ?? 6.0,
          humMin: p.humMin ?? 50,
          humMax: p.humMax ?? 70,
          mq135_threshold: p.mq135_threshold ?? 1500,
          gasWarning: p.gasWarning ?? 250,
          impactThreshold: 1.2,
          lightThreshold: 50,
        };
      }
    } catch {}

    return {
      tempMin: (activeDevice as any)?.temperature_min ?? 2.0,
      tempMax: (activeDevice as any)?.temperature_max ?? 6.0,
      humMin: (activeDevice as any)?.humidity_min ?? 50,
      humMax: (activeDevice as any)?.humidity_max ?? 70,
      mq135_threshold: (activeDevice as any)?.mq135_threshold ?? 1500,
      gasWarning: 250,
      impactThreshold: 1.2,
      lightThreshold: 50,
    };
  }, [selectedDeviceId, canonical, activeDevice]);

  const [tempMin, setTempMin] = useState<number>(initialThresholds.tempMin);
  const [tempMax, setTempMax] = useState<number>(initialThresholds.tempMax);
  const [humMin, setHumMin] = useState<number>(initialThresholds.humMin);
  const [humMax, setHumMax] = useState<number>(initialThresholds.humMax);
  const [gasThreshold, setGasThreshold] = useState<number>(initialThresholds.mq135_threshold);
  const [gasWarning, setGasWarning] = useState<number>(initialThresholds.gasWarning);
  const [impactThreshold, setImpactThreshold] = useState<number>(initialThresholds.impactThreshold);
  const [lightThreshold, setLightThreshold] = useState<number>(initialThresholds.lightThreshold);

  // Sync state whenever selected device changes
  React.useEffect(() => {
    setTempMin(initialThresholds.tempMin);
    setTempMax(initialThresholds.tempMax);
    setHumMin(initialThresholds.humMin);
    setHumMax(initialThresholds.humMax);
    setGasThreshold(initialThresholds.mq135_threshold);
    setGasWarning(initialThresholds.gasWarning);
    setImpactThreshold(initialThresholds.impactThreshold);
    setLightThreshold(initialThresholds.lightThreshold);
  }, [selectedDeviceId, initialThresholds]);

  // AI Research State
  const [searchProduct, setSearchProduct] = useState(activeProduct);
  const [isResearching, setIsResearching] = useState(false);
  const [aiResult, setAiResult] = useState<AIThresholdResearchResult | null>(null);
  const [researchError, setResearchError] = useState<string | null>(null);

  // Save feedback state
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleRunAIResearch = async (productToQuery?: string) => {
    const query = (productToQuery || searchProduct).trim();
    if (!query) return;

    setIsResearching(true);
    setResearchError(null);

    try {
      const result = await researchProductThresholds(query);
      setAiResult(result);
      setTempMin(result.tempMin);
      setTempMax(result.tempMax);
      setHumMin(result.humMin);
      setHumMax(result.humMax);
      setGasThreshold(result.mq135Threshold);
      setGasWarning(Math.round(result.mq135Threshold * 0.6));
    } catch (err: any) {
      console.error('AI Research Error:', err);
      setResearchError(err.message || 'Unable to lookup thresholds for this product.');
    } finally {
      setIsResearching(false);
    }
  };

  const handleSaveThresholds = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsSaving(true);

    try {
      const now = Date.now();
      const numTempMin = Number(tempMin);
      const numTempMax = Number(tempMax);
      const numHumMin = Number(humMin);
      const numHumMax = Number(humMax);
      const numGas = Number(gasThreshold);
      const numGasWarn = Number(gasWarning);

      // 1. Save to Device in AppContext (updates state immediately and syncs RTDB + Firestore)
      if (activeDevice) {
        await updateDeviceData(selectedDeviceId, {
          temperature_min: numTempMin,
          temperature_max: numTempMax,
          humidity_min: numHumMin,
          humidity_max: numHumMax,
          mq135_threshold: numGas,
          last_update: now,
          website_updated_at: now,
        } as any);
      }

      // 2. Save product profile in AppContext
      await updateProductProfile({
        id: `p_${canonical}`,
        name: activeProduct,
        temperature_min: numTempMin,
        temperature_max: numTempMax,
        humidity_min: numHumMin,
        humidity_max: numHumMax,
        mq135_threshold: numGas,
      });

      // 3. Save globally to Firebase RTDB and Firestore
      await saveProductThresholdToFirebase(
        activeProduct,
        {
          productId: selectedDeviceId,
          productName: activeProduct,
          tempMin: numTempMin,
          tempMax: numTempMax,
          humMin: numHumMin,
          humMax: numHumMax,
          mq135_threshold: numGas,
          gasWarning: numGasWarn,
        },
        userProfile?.name || 'Admin'
      );

      // 4. Update global sensor threshold context
      updateThresholds({
        tempMin: numTempMin,
        tempMax: numTempMax,
        tempCritical: numTempMax + 8,
        humidityMin: numHumMin,
        humidityMax: numHumMax,
        gasWarning: numGasWarn,
        gasCritical: numGas,
      });

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2500);
    } catch (err) {
      console.error('Threshold save error:', err);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2500);
    } finally {
      setIsSaving(false);
    }
  };

  const handleResetDefaults = () => {
    setTempMin(2.0);
    setTempMax(6.0);
    setHumMin(50);
    setHumMax(70);
    setGasThreshold(1500);
    setGasWarning(250);
    setImpactThreshold(1.2);
    setLightThreshold(50);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto select-none font-sans pb-12">
      {/* Top Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#13493B]/10 pb-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#07221A] text-[#20E79A] border border-[#20E79A]/30 text-[10px] font-black uppercase tracking-wider mb-1 shadow-xs">
            <Sliders className="w-3 h-3 text-[#20E79A]" /> Safety & Telemetry Bounds
          </div>
          <h1 className="text-2xl font-black text-[#07221A] tracking-tight">IoT Sensor Thresholds</h1>
          <p className="text-xs text-[#5C7F75] font-semibold">
            Define environmental alarm limits, real-time trigger bounds, and AI-verified food preservation ranges
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Audio Alert Toggle */}
          <button
            type="button"
            onClick={toggleAudioMute}
            className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 border transition-all cursor-pointer shadow-xs ${
              !isAudioMuted
                ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                : 'bg-slate-100 text-slate-600 border-slate-300'
            }`}
            title={!isAudioMuted ? 'Alarm Siren Enabled' : 'Alarm Siren Muted'}
          >
            {!isAudioMuted ? (
              <>
                <Volume2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Siren Active</span>
              </>
            ) : (
              <>
                <VolumeX className="w-3.5 h-3.5 text-slate-500" />
                <span>Siren Muted</span>
              </>
            )}
          </button>

          {/* Save Button */}
          <button
            type="button"
            onClick={handleSaveThresholds}
            disabled={isSaving}
            className="px-4 py-2 rounded-xl bg-[#07221A] text-white font-black text-xs hover:bg-[#134336] border border-[#20E79A]/40 flex items-center gap-1.5 cursor-pointer shadow-sm hover:shadow-md transition-all disabled:opacity-50"
          >
            {isSaving ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin text-[#20E79A]" />
            ) : saveSuccess ? (
              <CheckCircle2 className="w-3.5 h-3.5 text-[#20E79A]" />
            ) : (
              <Save className="w-3.5 h-3.5 text-[#20E79A]" />
            )}
            <span>{saveSuccess ? 'SAVED TO CLOUD' : 'SAVE THRESHOLDS'}</span>
          </button>
        </div>
      </div>

      {/* Device Selector Pills */}
      <div className="flex flex-wrap items-center gap-2 p-1.5 rounded-2xl bg-white border border-[#13493B]/10 shadow-xs">
        <span className="text-[10px] font-black uppercase tracking-wider text-[#5C7F75] px-3">
          Select Node:
        </span>
        {devicesList.map((dev) => {
          const isSelected = dev.device_id === selectedDeviceId;
          const devProd = dev.product && dev.product !== 'Cold Drinks' && dev.product !== 'Meat' && dev.product !== 'IoT Node'
            ? dev.product
            : (dev.device_id.includes('124') || dev.device_id.includes('MILK') ? 'Milk' : 'Apple');
          return (
            <button
              key={dev.device_id}
              type="button"
              onClick={() => {
                setSelectedDeviceId(dev.device_id);
                setSearchProduct(devProd);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 ${
                isSelected
                  ? 'bg-[#07221A] text-white shadow-xs'
                  : 'bg-transparent text-[#07221A] hover:bg-[#F4F7F6]'
              }`}
            >
              <Cpu className={`w-3.5 h-3.5 ${isSelected ? 'text-[#20E79A]' : 'text-[#5C7F75]'}`} />
              <span>{devProd}</span>
              <span className="text-[9px] font-mono font-bold opacity-70">
                ({dev.device_id})
              </span>
            </button>
          );
        })}
      </div>

      {/* Main Grid: Form + AI Assistant */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Columns: Threshold Configuration Cards */}
        <div className="lg:col-span-2 space-y-5">
          {/* Active Device Overview Card */}
          <div className="p-4 sm:p-5 rounded-3xl bg-white border border-[#13493B]/10 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-0.5">
              <span className="text-[9px] font-black uppercase tracking-wider text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-md border border-emerald-300 inline-block">
                Configuring Hardware Node
              </span>
              <h2 className="text-xl font-black text-[#07221A] tracking-tight">{activeProduct}</h2>
              <p className="text-xs font-mono font-bold text-amber-900 flex items-center gap-1">
                <span className="text-[#5C7F75]">Target ID:</span>
                <span>{selectedDeviceId}</span>
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="text-right">
                <span className="text-[9px] font-bold text-[#5C7F75] uppercase block">Current Sensor Readings</span>
                <span className="text-xs font-black text-[#07221A]">
                  {activeDevice?.temperature ?? 3.5}°C • {activeDevice?.humidity ?? 58}% • {activeDevice?.mq135_raw ?? 110} raw
                </span>
              </div>
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            </div>
          </div>

          {/* Interactive Threshold Editor Form */}
          <form onSubmit={handleSaveThresholds} className="space-y-4">
            {/* 1. Temperature Threshold Card */}
            <div className="p-5 rounded-3xl bg-white border border-[#13493B]/10 shadow-sm space-y-4 relative overflow-hidden">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-red-50 text-[#FF5A67] border border-red-100 flex items-center justify-center shrink-0">
                    <Thermometer className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-[#07221A]">Thermal Preservation Window</h3>
                    <p className="text-[10px] text-[#5C7F75] font-semibold">
                      Safe cold-chain operating limits before acoustic and email alerts fire
                    </p>
                  </div>
                </div>
                <span className="text-xs font-black font-mono text-[#07221A] bg-[#F4F7F6] px-2.5 py-1 rounded-lg border border-[#13493B]/8">
                  {tempMin}°C – {tempMax}°C
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                <div className="space-y-1">
                  <label className="text-[11px] font-extrabold text-[#5C7F75] uppercase block">
                    Minimum Safe Temp (°C)
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      step="0.1"
                      value={tempMin}
                      onChange={(e) => setTempMin(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl bg-[#F4F7F6] border border-[#13493B]/15 font-mono font-bold text-sm text-[#07221A] focus:outline-none focus:border-[#20E79A]"
                    />
                    <span className="text-xs font-bold text-[#5C7F75]">Min</span>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-extrabold text-[#5C7F75] uppercase block">
                    Maximum Safe Temp (°C)
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      step="0.1"
                      value={tempMax}
                      onChange={(e) => setTempMax(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl bg-[#F4F7F6] border border-[#13493B]/15 font-mono font-bold text-sm text-[#07221A] focus:outline-none focus:border-[#20E79A]"
                    />
                    <span className="text-xs font-bold text-[#5C7F75]">Max</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 2. Humidity Threshold Card */}
            <div className="p-5 rounded-3xl bg-white border border-[#13493B]/10 shadow-sm space-y-4 relative overflow-hidden">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-500 border border-blue-100 flex items-center justify-center shrink-0">
                    <Droplets className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-[#07221A]">Relative Humidity Range</h3>
                    <p className="text-[10px] text-[#5C7F75] font-semibold">
                      Maintains optimal moisture vapor pressure to stop spoilage and desiccation
                    </p>
                  </div>
                </div>
                <span className="text-xs font-black font-mono text-[#07221A] bg-[#F4F7F6] px-2.5 py-1 rounded-lg border border-[#13493B]/8">
                  {humMin}% – {humMax}%
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                <div className="space-y-1">
                  <label className="text-[11px] font-extrabold text-[#5C7F75] uppercase block">
                    Minimum Humidity (%)
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min="10"
                      max="100"
                      value={humMin}
                      onChange={(e) => setHumMin(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl bg-[#F4F7F6] border border-[#13493B]/15 font-mono font-bold text-sm text-[#07221A] focus:outline-none focus:border-[#20E79A]"
                    />
                    <span className="text-xs font-bold text-[#5C7F75]">%</span>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-extrabold text-[#5C7F75] uppercase block">
                    Maximum Humidity (%)
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min="10"
                      max="100"
                      value={humMax}
                      onChange={(e) => setHumMax(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl bg-[#F4F7F6] border border-[#13493B]/15 font-mono font-bold text-sm text-[#07221A] focus:outline-none focus:border-[#20E79A]"
                    />
                    <span className="text-xs font-bold text-[#5C7F75]">%</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 3. Gas & Decomposition Card */}
            <div className="p-5 rounded-3xl bg-white border border-[#13493B]/10 shadow-sm space-y-4 relative overflow-hidden">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 border border-purple-100 flex items-center justify-center shrink-0">
                    <Wind className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-[#07221A]">MQ-135 Gas & Decomposition Alert</h3>
                    <p className="text-[10px] text-[#5C7F75] font-semibold">
                      Detects ammonia, alcohol, sulfide vapors, and bacterial off-gassing
                    </p>
                  </div>
                </div>
                <span className="text-xs font-black font-mono text-[#07221A] bg-[#F4F7F6] px-2.5 py-1 rounded-lg border border-[#13493B]/8">
                  Critical: {gasThreshold} raw
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                <div className="space-y-1">
                  <label className="text-[11px] font-extrabold text-[#5C7F75] uppercase block">
                    Warning Alert Level (PPM)
                  </label>
                  <input
                    type="number"
                    min="50"
                    max="5000"
                    value={gasWarning}
                    onChange={(e) => setGasWarning(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-[#F4F7F6] border border-[#13493B]/15 font-mono font-bold text-sm text-[#07221A] focus:outline-none focus:border-[#20E79A]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-extrabold text-[#5C7F75] uppercase block">
                    Critical Spoilage Cutoff (Raw)
                  </label>
                  <input
                    type="number"
                    min="100"
                    max="10000"
                    value={gasThreshold}
                    onChange={(e) => setGasThreshold(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-[#F4F7F6] border border-[#13493B]/15 font-mono font-bold text-sm text-[#07221A] focus:outline-none focus:border-[#20E79A]"
                  />
                </div>
              </div>
            </div>

            {/* 4. Shock & Seal Integrity (Impact & Light) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-3xl bg-white border border-[#13493B]/10 shadow-sm space-y-2">
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-amber-500" />
                  <span className="text-xs font-black text-[#07221A]">Impact & Shock Threshold</span>
                </div>
                <p className="text-[10px] text-[#5C7F75]">Detects rough transport drops and package impacts</p>
                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="number"
                    step="0.1"
                    value={impactThreshold}
                    onChange={(e) => setImpactThreshold(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-[#F4F7F6] border border-[#13493B]/15 font-mono font-bold text-sm text-[#07221A]"
                  />
                  <span className="text-xs font-bold text-[#5C7F75]">G</span>
                </div>
              </div>

              <div className="p-4 rounded-3xl bg-white border border-[#13493B]/10 shadow-sm space-y-2">
                <div className="flex items-center gap-2">
                  <Sun className="w-4 h-4 text-yellow-500" />
                  <span className="text-xs font-black text-[#07221A]">Light Exposure (Seal Breach)</span>
                </div>
                <p className="text-[10px] text-[#5C7F75]">Triggers warning if container seal or box is opened</p>
                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="number"
                    value={lightThreshold}
                    onChange={(e) => setLightThreshold(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-[#F4F7F6] border border-[#13493B]/15 font-mono font-bold text-sm text-[#07221A]"
                  />
                  <span className="text-xs font-bold text-[#5C7F75]">lx</span>
                </div>
              </div>
            </div>

            {/* Form Footer Buttons */}
            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={handleResetDefaults}
                className="px-4 py-2.5 rounded-xl bg-white border border-[#13493B]/15 text-xs font-bold text-[#5C7F75] hover:text-[#07221A] hover:bg-[#F4F7F6] flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Standard Presets</span>
              </button>

              <button
                type="submit"
                disabled={isSaving}
                className="px-6 py-2.5 rounded-xl bg-[#07221A] text-white font-black text-xs hover:bg-[#134336] flex items-center gap-2 cursor-pointer shadow-sm hover:shadow-md transition-all disabled:opacity-50"
              >
                {isSaving ? (
                  <Loader2 className="w-4 h-4 animate-spin text-[#20E79A]" />
                ) : (
                  <Save className="w-4 h-4 text-[#20E79A]" />
                )}
                <span>SAVE THRESHOLDS</span>
              </button>
            </div>
          </form>
        </div>

        {/* Right Column: AI Research Engine & Presets */}
        <div className="space-y-5">
          {/* AI Research Panel */}
          <div className="p-5 rounded-3xl bg-gradient-to-br from-[#07221A] to-[#134336] text-white shadow-lg space-y-4 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#20E79A]/15 rounded-full blur-2xl pointer-events-none" />

            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#20E79A]" />
              <span className="font-['Bricolage_Grotesque','Outfit',sans-serif] text-sm sm:text-base font-black uppercase tracking-widest text-[#20E79A] drop-shadow-[0_2px_10px_rgba(32,231,154,0.35)]">
                FRESHORA
              </span>
            </div>

            <p className="text-xs text-white/80 leading-relaxed">
              Research optimal thermal boundaries, moisture vapor tolerances, and safe shelf-life for any item.
            </p>

            <div className="flex gap-2">
              <input
                type="text"
                value={searchProduct}
                onChange={(e) => setSearchProduct(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleRunAIResearch();
                  }
                }}
                placeholder="e.g. Greek Yogurt, Apples, Milk"
                className="flex-1 px-3 py-2 rounded-xl bg-white/10 border border-white/20 text-xs text-white placeholder-white/50 focus:outline-none focus:border-[#20E79A]"
              />
              <button
                type="button"
                onClick={() => handleRunAIResearch()}
                disabled={isResearching}
                className="px-3.5 py-2 rounded-xl bg-[#20E79A] text-[#07221A] font-black text-xs hover:bg-[#19D48C] transition-colors cursor-pointer flex items-center gap-1 shrink-0 disabled:opacity-50"
              >
                {isResearching ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Search className="w-3.5 h-3.5" />
                )}
                <span>RESEARCH</span>
              </button>
            </div>

            {researchError && (
              <p className="text-xs text-red-300 font-semibold bg-red-900/30 p-2.5 rounded-xl border border-red-500/30">
                {researchError}
              </p>
            )}

            {aiResult && (
              <div className="p-3.5 rounded-2xl bg-white/10 border border-white/15 space-y-2.5 text-xs text-white">
                <div className="flex items-center justify-between">
                  <span className="font-black text-[#20E79A]">{aiResult.category}</span>
                  <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-md font-mono">
                    Shelf Life: {aiResult.shelfLifeDays}d
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
                  <div className="bg-black/20 p-2 rounded-lg">
                    <span className="text-white/60 block text-[9px] uppercase font-sans">Temp Bounds</span>
                    <span>{aiResult.tempMin}°C – {aiResult.tempMax}°C</span>
                  </div>
                  <div className="bg-black/20 p-2 rounded-lg">
                    <span className="text-white/60 block text-[9px] uppercase font-sans">RH Limits</span>
                    <span>{aiResult.humMin}% – {aiResult.humMax}%</span>
                  </div>
                </div>
                <p className="text-[11px] text-white/90 line-clamp-3 italic">
                  "{aiResult.scientificRationale || (aiResult as any).recommendations}"
                </p>
                {aiResult.citations && aiResult.citations.length > 0 && (
                  <p className="text-[9.5px] text-[#20E79A]/90 font-mono truncate">
                    Sources: {aiResult.citations.join(' • ')}
                  </p>
                )}
                <div className="pt-1 flex items-center justify-between text-[9px]">
                  <span className="font-black text-[#20E79A] uppercase tracking-wider block">
                    ✓ Thresholds applied to editor
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Quick Preset Selector */}
          <div className="p-5 rounded-3xl bg-white border border-[#13493B]/10 shadow-sm space-y-3">
            <h3 className="text-xs font-black uppercase tracking-wider text-[#07221A] flex items-center gap-1.5">
              <Package className="w-3.5 h-3.5 text-[#20E79A]" />
              Industry Safety Presets
            </h3>
            <div className="space-y-1.5">
              {[
                { name: 'Apples & Orchard Produce (001)', temp: '0°C – 4°C', rh: '85% – 95%', gas: 1200 },
                { name: 'Pasteurized Dairy & Milk (124)', temp: '1°C – 4°C', rh: '65% – 75%', gas: 900 },
                { name: 'Fresh Poultry & Meats', temp: '-1°C – 3°C', rh: '65% – 85%', gas: 800 },
                { name: 'Seafood & Shellfish', temp: '0°C – 2°C', rh: '85% – 95%', gas: 600 },
              ].map((preset) => (
                <button
                  key={preset.name}
                  type="button"
                  onClick={() => {
                    const [minT, maxT] = preset.temp.replace(/°C/g, '').split('–').map((n) => Number(n.trim()));
                    const [minH, maxH] = preset.rh.replace(/%/g, '').split('–').map((n) => Number(n.trim()));
                    setTempMin(minT);
                    setTempMax(maxT);
                    setHumMin(minH);
                    setHumMax(maxH);
                    setGasThreshold(preset.gas);
                    setGasWarning(Math.round(preset.gas * 0.5));
                  }}
                  className="w-full p-2.5 rounded-xl bg-[#F4F7F6] hover:bg-[#EBFBF4] border border-[#13493B]/8 hover:border-[#20E79A]/30 text-left transition-colors cursor-pointer group flex items-center justify-between"
                >
                  <div className="min-w-0">
                    <span className="text-xs font-bold text-[#07221A] block truncate group-hover:text-emerald-800">
                      {preset.name}
                    </span>
                    <span className="text-[10px] font-mono text-[#5C7F75] block mt-0.5">
                      {preset.temp} • {preset.rh}
                    </span>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-[#5C7F75] group-hover:text-[#20E79A] shrink-0" />
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

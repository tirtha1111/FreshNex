import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sliders, 
  Thermometer, 
  Wind, 
  Droplets, 
  Volume2, 
  VolumeX, 
  X, 
  Save, 
  RotateCcw, 
  Sparkles, 
  ShieldCheck,
  Check
} from 'lucide-react';
import { SensorThresholdConfig, DEFAULT_THRESHOLDS } from '../../services/alertThresholdService';

interface ThresholdConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  thresholds: SensorThresholdConfig;
  onSaveThresholds: (newConfig: SensorThresholdConfig) => void;
}

export const ThresholdConfigModal: React.FC<ThresholdConfigModalProps> = ({
  isOpen,
  onClose,
  thresholds,
  onSaveThresholds,
}) => {
  const [formState, setFormState] = useState<SensorThresholdConfig>(thresholds);
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveThresholds(formState);
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 1200);
  };

  const handleReset = () => {
    setFormState(DEFAULT_THRESHOLDS);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md select-none">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
          className="w-full max-w-lg glass-modal p-6 sm:p-7 depth-4 relative overflow-hidden text-[#07221A]"
        >
          {/* Top glow line */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#20E79A] to-transparent shadow-[0_0_12px_#20E79A]" />

          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-[#13493B]/10">
            <div className="flex items-center gap-2.5">
              <div className="neo-icon-box w-10 h-10 rounded-2xl text-[#20E79A] flex items-center justify-center">
                <Sliders className="w-5 h-5 glow-icon-emerald" />
              </div>
              <div>
                <h3 className="text-base font-bold text-[#07221A]">Sensor Alert Thresholds</h3>
                <p className="text-xs text-[#5C7F75]">Configure real-time IoT trigger levels & telemetry alarms</p>
              </div>
            </div>
            <motion.button
              whileTap={{ scale: 0.92 }}
              onClick={onClose}
              className="neo-btn p-2 rounded-xl text-[#5C7F75] hover:text-[#07221A] transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </motion.button>
          </div>

          <form onSubmit={handleSave} className="mt-5 space-y-4">
            {/* Temperature Thresholds */}
            <div className="p-4 rounded-2xl neo-panel border border-[#13493B]/10 space-y-3">
              <div className="flex items-center gap-2 text-xs font-black text-red-600">
                <Thermometer className="w-4 h-4" />
                <span>Temperature Safety Limits (°C)</span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] text-[#5C7F75] font-bold block mb-1">
                    Safe Max Warning (°C)
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    value={formState.tempMax}
                    onChange={(e) => setFormState({ ...formState, tempMax: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3.5 py-2 neo-input text-xs font-semibold text-[#07221A]"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-[#5C7F75] font-bold block mb-1">
                    Critical Thermal Spike (°C)
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    value={formState.tempCritical}
                    onChange={(e) => setFormState({ ...formState, tempCritical: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3.5 py-2 neo-input text-xs font-semibold text-[#07221A]"
                  />
                </div>
              </div>
            </div>

            {/* Gas / VOC Limits */}
            <div className="p-4 rounded-2xl neo-panel border border-[#13493B]/10 space-y-3">
              <div className="flex items-center gap-2 text-xs font-black text-purple-700">
                <Wind className="w-4 h-4" />
                <span>Gas / VOC Spoilage Limits (PPM)</span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] text-[#5C7F75] font-bold block mb-1">
                    VOC Warning Level (PPM)
                  </label>
                  <input
                    type="number"
                    step="10"
                    value={formState.gasWarning}
                    onChange={(e) => setFormState({ ...formState, gasWarning: parseInt(e.target.value, 10) || 0 })}
                    className="w-full px-3.5 py-2 neo-input text-xs font-semibold text-[#07221A]"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-[#5C7F75] font-bold block mb-1">
                    Critical Hazard Limit (PPM)
                  </label>
                  <input
                    type="number"
                    step="10"
                    value={formState.gasCritical}
                    onChange={(e) => setFormState({ ...formState, gasCritical: parseInt(e.target.value, 10) || 0 })}
                    className="w-full px-3.5 py-2 neo-input text-xs font-semibold text-[#07221A]"
                  />
                </div>
              </div>
            </div>

            {/* Humidity Limits */}
            <div className="p-4 rounded-2xl neo-panel border border-[#13493B]/10 space-y-3">
              <div className="flex items-center gap-2 text-xs font-black text-blue-700">
                <Droplets className="w-4 h-4" />
                <span>Relative Humidity Limits (%)</span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] text-[#5C7F75] font-bold block mb-1">
                    Min Moisture (%)
                  </label>
                  <input
                    type="number"
                    value={formState.humidityMin}
                    onChange={(e) => setFormState({ ...formState, humidityMin: parseInt(e.target.value, 10) || 0 })}
                    className="w-full px-3.5 py-2 neo-input text-xs font-semibold text-[#07221A]"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-[#5C7F75] font-bold block mb-1">
                    Max Moisture Warning (%)
                  </label>
                  <input
                    type="number"
                    value={formState.humidityMax}
                    onChange={(e) => setFormState({ ...formState, humidityMax: parseInt(e.target.value, 10) || 0 })}
                    className="w-full px-3.5 py-2 neo-input text-xs font-semibold text-[#07221A]"
                  />
                </div>
              </div>
            </div>

            {/* Audio Feedback Toggle with Neomorphic Toggle */}
            <div className="flex items-center justify-between p-3.5 rounded-2xl neo-panel border border-[#13493B]/10">
              <div className="flex items-center gap-2.5">
                {formState.enableAudio ? <Volume2 className="w-4 h-4 text-[#20E79A] glow-icon-emerald" /> : <VolumeX className="w-4 h-4 text-[#5C7F75]" />}
                <div>
                  <span className="text-xs font-bold text-[#07221A] block">Audible Alert Chime</span>
                  <span className="text-[10px] text-[#5C7F75]">Play audio warning tone when sensor threshold is exceeded</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setFormState({ ...formState, enableAudio: !formState.enableAudio })}
                className={`w-12 h-6.5 rounded-full transition-all relative cursor-pointer ${
                  formState.enableAudio ? 'neo-toggle-track bg-[#20E79A]' : 'neo-toggle-track bg-slate-300'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white absolute top-0.5 transition-transform shadow-sm ${
                    formState.enableAudio ? 'left-6' : 'left-1'
                  }`}
                />
              </button>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={handleReset}
                className="text-xs font-bold text-[#5C7F75] hover:text-[#20E79A] flex items-center gap-1 cursor-pointer transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset to Defaults</span>
              </button>

              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={onClose}
                  className="neo-btn px-4 py-2 text-xs font-bold text-[#5C7F75] hover:text-[#07221A] rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <motion.button
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.96 }}
                  type="submit"
                  disabled={savedSuccess}
                  className={`px-5 py-2.5 text-xs font-black rounded-xl flex items-center gap-1.5 cursor-pointer shadow-md transition-all ${
                    savedSuccess 
                      ? 'bg-[#20E79A] text-white animate-success-pop glow-emerald' 
                      : 'neo-btn-primary glow-emerald'
                  }`}
                >
                  {savedSuccess ? (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Saved!</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      <span>Save Thresholds</span>
                    </>
                  )}
                </motion.button>
              </div>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

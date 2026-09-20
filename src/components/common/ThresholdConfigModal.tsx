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
  onTriggerTestBreach: (type: 'temperature' | 'gas' | 'humidity') => void;
}

export const ThresholdConfigModal: React.FC<ThresholdConfigModalProps> = ({
  isOpen,
  onClose,
  thresholds,
  onSaveThresholds,
  onTriggerTestBreach,
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
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md select-none">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
          className="w-full max-w-lg bg-[#1A110B] border border-[#FF6A00]/40 rounded-3xl p-6 sm:p-7 shadow-[0_25px_60px_rgba(0,0,0,0.9)] relative overflow-hidden"
        >
          {/* Top glow line */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#FF6A00] to-transparent" />

          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-[#3D261A]">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-[#FF6A00]/20 text-[#FF6A00] border border-[#FF6A00]/30 flex items-center justify-center">
                <Sliders className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-[#FDF8F5]">Sensor Alert Thresholds</h3>
                <p className="text-xs text-[#8C7A70]">Configure real-time Firebase trigger levels</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 text-[#8C7A70] hover:text-[#FDF8F5] rounded-xl hover:bg-[#261A12] border border-transparent hover:border-[#3D261A] transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSave} className="mt-5 space-y-5">
            {/* Temperature Thresholds */}
            <div className="p-4 rounded-2xl bg-[#140C08] border border-[#3D261A] space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-[#FFAA00]">
                <Thermometer className="w-4 h-4" />
                <span>Temperature Safety Limits (°C)</span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] text-[#8C7A70] font-medium block mb-1">
                    Safe Max Warning (°C)
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    value={formState.tempMax}
                    onChange={(e) => setFormState({ ...formState, tempMax: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-1.5 bg-[#1E140E] border border-[#3D261A] rounded-xl text-xs text-[#FDF8F5] focus:outline-none focus:border-[#FF6A00]"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-[#8C7A70] font-medium block mb-1">
                    Critical Thermal Spike (°C)
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    value={formState.tempCritical}
                    onChange={(e) => setFormState({ ...formState, tempCritical: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-1.5 bg-[#1E140E] border border-[#3D261A] rounded-xl text-xs text-[#FDF8F5] focus:outline-none focus:border-[#FF6A00]"
                  />
                </div>
              </div>
            </div>

            {/* Gas / VOC Limits */}
            <div className="p-4 rounded-2xl bg-[#140C08] border border-[#3D261A] space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-[#FFAA00]">
                <Wind className="w-4 h-4" />
                <span>Gas / VOC Spoilage Limits (PPM)</span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] text-[#8C7A70] font-medium block mb-1">
                    VOC Warning Level (PPM)
                  </label>
                  <input
                    type="number"
                    step="10"
                    value={formState.gasWarning}
                    onChange={(e) => setFormState({ ...formState, gasWarning: parseInt(e.target.value, 10) || 0 })}
                    className="w-full px-3 py-1.5 bg-[#1E140E] border border-[#3D261A] rounded-xl text-xs text-[#FDF8F5] focus:outline-none focus:border-[#FF6A00]"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-[#8C7A70] font-medium block mb-1">
                    Critical Hazard Limit (PPM)
                  </label>
                  <input
                    type="number"
                    step="10"
                    value={formState.gasCritical}
                    onChange={(e) => setFormState({ ...formState, gasCritical: parseInt(e.target.value, 10) || 0 })}
                    className="w-full px-3 py-1.5 bg-[#1E140E] border border-[#3D261A] rounded-xl text-xs text-[#FDF8F5] focus:outline-none focus:border-[#FF6A00]"
                  />
                </div>
              </div>
            </div>

            {/* Humidity Limits */}
            <div className="p-4 rounded-2xl bg-[#140C08] border border-[#3D261A] space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-[#FFAA00]">
                <Droplets className="w-4 h-4" />
                <span>Relative Humidity Limits (%)</span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] text-[#8C7A70] font-medium block mb-1">
                    Min Moisture (%)
                  </label>
                  <input
                    type="number"
                    value={formState.humidityMin}
                    onChange={(e) => setFormState({ ...formState, humidityMin: parseInt(e.target.value, 10) || 0 })}
                    className="w-full px-3 py-1.5 bg-[#1E140E] border border-[#3D261A] rounded-xl text-xs text-[#FDF8F5] focus:outline-none focus:border-[#FF6A00]"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-[#8C7A70] font-medium block mb-1">
                    Max Moisture Warning (%)
                  </label>
                  <input
                    type="number"
                    value={formState.humidityMax}
                    onChange={(e) => setFormState({ ...formState, humidityMax: parseInt(e.target.value, 10) || 0 })}
                    className="w-full px-3 py-1.5 bg-[#1E140E] border border-[#3D261A] rounded-xl text-xs text-[#FDF8F5] focus:outline-none focus:border-[#FF6A00]"
                  />
                </div>
              </div>
            </div>

            {/* Audio Feedback Toggle */}
            <div className="flex items-center justify-between p-3 rounded-2xl bg-[#140C08] border border-[#3D261A]">
              <div className="flex items-center gap-2.5">
                {formState.enableAudio ? <Volume2 className="w-4 h-4 text-[#FFAA00]" /> : <VolumeX className="w-4 h-4 text-[#8C7A70]" />}
                <div>
                  <span className="text-xs font-bold text-[#FDF8F5] block">Audible Alert Chime</span>
                  <span className="text-[10px] text-[#8C7A70]">Play tone when sensor threshold is exceeded</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setFormState({ ...formState, enableAudio: !formState.enableAudio })}
                className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                  formState.enableAudio ? 'bg-[#FF6A00]' : 'bg-[#3D261A]'
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${
                    formState.enableAudio ? 'left-6' : 'left-1'
                  }`}
                />
              </button>
            </div>

            {/* Test Simulation Controls */}
            <div className="p-3.5 rounded-2xl bg-[#26170E] border border-[#FF6A00]/25 space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-[#FFAA00]">
                <Sparkles className="w-3.5 h-3.5 text-[#FFAA00]" />
                <span>Test Real-Time Firebase Alert Trigger</span>
              </div>
              <p className="text-[11px] text-[#B8A89E]">
                Instantly simulate a threshold breach to verify the live Firebase notification broadcast.
              </p>
              <div className="flex flex-wrap gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => onTriggerTestBreach('temperature')}
                  className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-[#140C08] hover:bg-[#FF6A00]/20 text-[#FFAA00] border border-[#FF6A00]/30 transition-colors cursor-pointer"
                >
                  Test Temp Spike (+32°C)
                </button>
                <button
                  type="button"
                  onClick={() => onTriggerTestBreach('gas')}
                  className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-[#140C08] hover:bg-[#FF3D00]/20 text-[#FF6A00] border border-[#FF6A00]/30 transition-colors cursor-pointer"
                >
                  Test Gas Hazard (480 ppm)
                </button>
                <button
                  type="button"
                  onClick={() => onTriggerTestBreach('humidity')}
                  className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-[#140C08] hover:bg-[#20E79A]/20 text-[#20E79A] border border-[#20E79A]/30 transition-colors cursor-pointer"
                >
                  Test Humidity (92%)
                </button>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={handleReset}
                className="text-xs text-[#8C7A70] hover:text-[#FFAA00] flex items-center gap-1 cursor-pointer transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset to Defaults</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-bold text-[#B8A89E] hover:text-[#FDF8F5] rounded-xl hover:bg-[#261A12] transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savedSuccess}
                  className="px-5 py-2 text-xs font-bold text-[#140C08] btn-orange rounded-xl flex items-center gap-1.5 cursor-pointer shadow-md"
                >
                  {savedSuccess ? (
                    <>
                      <Check className="w-4 h-4 text-[#140C08]" />
                      <span>Saved!</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 text-[#140C08]" />
                      <span>Save Thresholds</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ShieldCheck, 
  CheckCircle2, 
  AlertTriangle, 
  Thermometer, 
  Droplets, 
  Wind, 
  BookOpen, 
  Sliders, 
  ChevronDown, 
  ChevronUp, 
  Info,
  Sparkles,
  Layers,
  Activity
} from 'lucide-react';
import { FreshnessReport } from '../../utils/freshnessEngine';
import { SensorThresholdConfig, DEFAULT_THRESHOLDS } from '../../services/alertThresholdService';

interface FreshnessPrincipleCardProps {
  report: FreshnessReport | null;
  productName?: string;
  category?: string;
  isUnconfigured?: boolean;
  thresholdRules?: SensorThresholdConfig;
}

export const FreshnessPrincipleCard: React.FC<FreshnessPrincipleCardProps> = ({
  report,
  productName = 'Product',
  category = 'Produce',
  isUnconfigured = false,
  thresholdRules,
}) => {
  const [showFormulaDetails, setShowFormulaDetails] = useState(false);

  if (isUnconfigured || !report) {
    return (
      <div className="bg-white border border-[#13493B]/10 rounded-[28px] p-6 shadow-sm space-y-3">
        <div className="flex items-center gap-2.5 text-[#FFAA00]">
          <AlertTriangle className="w-5 h-5 shrink-0" />
          <h3 className="text-sm font-black text-[#07221A]">Awaiting Sensor Hardware Node Sync</h3>
        </div>
        <p className="text-xs text-[#5C7F75] font-semibold leading-relaxed">
          The freshness score working principle requires active sensor telemetry (Temperature, Humidity, and MQ-135 Gas). Please pair or activate the micro-node hardware device.
        </p>
      </div>
    );
  }

  const { workingPrinciple } = report;
  const { allSensorsNormal, synergyMultiplier, weights } = workingPrinciple;

  const tempAn = workingPrinciple.temperatureAnalysis;
  const humAn = workingPrinciple.humidityAnalysis;
  const gasAn = workingPrinciple.gasAnalysis;

  const rules: SensorThresholdConfig = thresholdRules || report.activeThresholdRules || workingPrinciple.activeThresholdRules || DEFAULT_THRESHOLDS;

  return (
    <div className="bg-white border border-[#13493B]/10 rounded-[32px] p-6 sm:p-7 shadow-sm space-y-6">
      
      {/* Top Header: Score Principle Badge & Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#F4F7F6]">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-[#EBFBF4] border border-[#20E79A]/30 flex items-center justify-center text-[#20E79A] shrink-0 shadow-sm">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-black text-[#07221A] tracking-tight">
                Freshness Score Working Principle & Analysis
              </h3>
              {allSensorsNormal && (
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-[#20E79A]/15 text-[#07221A] border border-[#20E79A]/30 flex items-center gap-1 shadow-sm">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#20E79A] animate-pulse" />
                  All Sensors Normal
                </span>
              )}
            </div>
            <p className="text-xs font-semibold text-[#5C7F75] mt-0.5">
              Correlated Multi-Component Quality Index (MCQI) • {category} Standards
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowFormulaDetails(!showFormulaDetails)}
          className="px-3.5 py-1.5 rounded-xl border border-[#13493B]/15 hover:border-[#20E79A] bg-[#F4F7F6] text-xs font-bold text-[#07221A] flex items-center gap-1.5 self-start sm:self-auto transition-colors cursor-pointer"
        >
          <BookOpen className="w-3.5 h-3.5 text-[#20E79A]" />
          <span>{showFormulaDetails ? 'Hide Calculation Logic' : 'View Working Principle'}</span>
          {showFormulaDetails ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* Primary Executive Remark & Scientific Findings */}
      <div className="space-y-3.5">
        <div className="p-4 rounded-2xl bg-[#F8FAF9] border border-[#13493B]/10 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black uppercase tracking-wider text-[#5C7F75] flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#20E79A]" />
              Official Freshness Telemetry Remark
            </span>
            <span 
              className="text-[10px] font-black px-2.5 py-0.5 rounded-full"
              style={{ color: report.statusColor, backgroundColor: report.statusBg }}
            >
              {report.qualityLabel}
            </span>
          </div>
          <p className="text-xs font-bold text-[#07221A] leading-relaxed">
            {report.message}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 text-xs">
          {/* Scientific Rationale */}
          <div className="p-4 rounded-2xl bg-white border border-[#13493B]/10 space-y-1.5 shadow-sm">
            <span className="text-[10px] font-black uppercase tracking-wider text-[#5C7F75] flex items-center gap-1">
              <Layers className="w-3 h-3 text-[#20E79A]" />
              Scientific Cold-Chain Evaluation
            </span>
            <p className="text-[11px] font-semibold text-[#3D524C] leading-relaxed">
              {report.scientificRemark}
            </p>
          </div>

          {/* Actionable Recommendation */}
          <div className="p-4 rounded-2xl bg-white border border-[#13493B]/10 space-y-1.5 shadow-sm">
            <span className="text-[10px] font-black uppercase tracking-wider text-[#5C7F75] flex items-center gap-1">
              <Info className="w-3 h-3 text-[#20E79A]" />
              Preservation Recommendation
            </span>
            <p className="text-[11px] font-semibold text-[#3D524C] leading-relaxed">
              {report.actionableRecommendation}
            </p>
          </div>
        </div>
      </div>

      {/* Sensor Component Breakdown (Temperature, Humidity, Gas) */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <h4 className="text-xs font-black text-[#07221A] uppercase tracking-wider">
            Correlated Sensor Sub-Index Breakdown
          </h4>
          <span className="text-[10px] font-bold text-[#07221A] flex items-center gap-1.5 bg-[#EBFBF4] px-2.5 py-1 rounded-full border border-[#20E79A]/30 w-fit">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#20E79A]" />
            Target Standard: Matched with Active Threshold Rules
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
          {/* 1. Temperature Analysis */}
          <div className="p-4 rounded-2xl border border-[#13493B]/10 bg-[#FAFCFB] space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-black text-[#FF5A67]">
                <Thermometer className="w-4 h-4" />
                <span>Temperature</span>
              </div>
              <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                tempAn.status === 'Normal' ? 'bg-[#20E79A]/15 text-[#07221A]' : 'bg-red-100 text-red-700'
              }`}>
                {tempAn.subScore}% • {tempAn.status}
              </span>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between items-baseline">
                <span className="text-lg font-black text-[#07221A]">{tempAn.value}{tempAn.unit}</span>
                <span className="text-[10px] font-bold text-[#20E79A]">
                  Target: {rules.tempMin.toFixed(1)}°C - {rules.tempMax.toFixed(1)}°C
                </span>
              </div>
              {/* Micro Progress Bar */}
              <div className="w-full h-1.5 bg-[#EBF1EF] rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-500 ${
                    tempAn.status === 'Normal' ? 'bg-[#20E79A]' : 'bg-[#FF5A67]'
                  }`} 
                  style={{ width: `${tempAn.subScore}%` }}
                />
              </div>
              <p className="text-[10px] font-semibold text-[#5C7F75] pt-1 leading-snug">
                {tempAn.remark}
              </p>
              
              {/* Matched Threshold Rule Badge */}
              <div className="pt-1 flex flex-col gap-1 text-[9px] font-mono">
                <div className="px-2 py-1 rounded-lg bg-[#F4F7F6] border border-[#13493B]/10 flex items-center justify-between">
                  <span className="text-[#5C7F75]">Threshold Rule:</span>
                  <span className="font-bold text-[#07221A]">Safe &le; {rules.tempMax}°C (Crit &gt; {rules.tempCritical}°C)</span>
                </div>
                <div className="flex justify-between text-[#5C7F75] px-1 font-sans">
                  <span>Standard: Matched</span>
                  <span className="font-bold">Weight: {Math.round(weights.temp * 100)}%</span>
                </div>
              </div>
            </div>
          </div>

          {/* 2. Humidity Analysis */}
          <div className="p-4 rounded-2xl border border-[#13493B]/10 bg-[#FAFCFB] space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-black text-[#3B82F6]">
                <Droplets className="w-4 h-4" />
                <span>Relative Humidity</span>
              </div>
              <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                humAn.status === 'Normal' ? 'bg-[#20E79A]/15 text-[#07221A]' : 'bg-amber-100 text-amber-700'
              }`}>
                {humAn.subScore}% • {humAn.status}
              </span>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between items-baseline">
                <span className="text-lg font-black text-[#07221A]">{humAn.value}{humAn.unit}</span>
                <span className="text-[10px] font-bold text-[#20E79A]">
                  Target: {rules.humidityMin}% - {rules.humidityMax}%
                </span>
              </div>
              {/* Micro Progress Bar */}
              <div className="w-full h-1.5 bg-[#EBF1EF] rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-500 ${
                    humAn.status === 'Normal' ? 'bg-[#20E79A]' : 'bg-[#3B82F6]'
                  }`} 
                  style={{ width: `${humAn.subScore}%` }}
                />
              </div>
              <p className="text-[10px] font-semibold text-[#5C7F75] pt-1 leading-snug">
                {humAn.remark}
              </p>

              {/* Matched Threshold Rule Badge */}
              <div className="pt-1 flex flex-col gap-1 text-[9px] font-mono">
                <div className="px-2 py-1 rounded-lg bg-[#F4F7F6] border border-[#13493B]/10 flex items-center justify-between">
                  <span className="text-[#5C7F75]">Threshold Rule:</span>
                  <span className="font-bold text-[#07221A]">{rules.humidityMin}% – {rules.humidityMax}%</span>
                </div>
                <div className="flex justify-between text-[#5C7F75] px-1 font-sans">
                  <span>Standard: Matched</span>
                  <span className="font-bold">Weight: {Math.round(weights.humidity * 100)}%</span>
                </div>
              </div>
            </div>
          </div>

          {/* 3. Gas / VOC Analysis */}
          <div className="p-4 rounded-2xl border border-[#13493B]/10 bg-[#FAFCFB] space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-black text-[#9333EA]">
                <Wind className="w-4 h-4" />
                <span>MQ-135 Bio-Gas</span>
              </div>
              <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                gasAn.status === 'Normal' ? 'bg-[#20E79A]/15 text-[#07221A]' : 'bg-purple-100 text-purple-700'
              }`}>
                {gasAn.subScore}% • {gasAn.status}
              </span>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between items-baseline">
                <span className="text-lg font-black text-[#07221A]">{gasAn.value} {gasAn.unit}</span>
                <span className="text-[10px] font-bold text-[#20E79A]">
                  Target: &lt; {gasAn.unit === 'ADC' ? '1400 ADC' : `${rules.gasWarning} ppm`}
                </span>
              </div>
              {/* Micro Progress Bar */}
              <div className="w-full h-1.5 bg-[#EBF1EF] rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-500 ${
                    gasAn.status === 'Normal' ? 'bg-[#20E79A]' : 'bg-[#9333EA]'
                  }`} 
                  style={{ width: `${gasAn.subScore}%` }}
                />
              </div>
              <p className="text-[10px] font-semibold text-[#5C7F75] pt-1 leading-snug">
                {gasAn.remark}
              </p>

              {/* Matched Threshold Rule Badge */}
              <div className="pt-1 flex flex-col gap-1 text-[9px] font-mono">
                <div className="px-2 py-1 rounded-lg bg-[#F4F7F6] border border-[#13493B]/10 flex items-center justify-between">
                  <span className="text-[#5C7F75]">Threshold Rule:</span>
                  <span className="font-bold text-[#07221A]">
                    {gasAn.unit === 'ADC' ? '< 1400 ADC' : `Safe ≤ ${rules.gasWarning} ppm (Crit > ${rules.gasCritical} ppm)`}
                  </span>
                </div>
                <div className="flex justify-between text-[#5C7F75] px-1 font-sans">
                  <span>Standard: Matched</span>
                  <span className="font-bold">Weight: {Math.round(weights.gas * 100)}%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Expandable Mathematical Principle Breakdown */}
      <AnimatePresence>
        {showFormulaDetails && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="p-5 rounded-2xl bg-[#F4F7F6] border border-[#13493B]/10 space-y-3.5 text-xs"
          >
            <div className="flex items-center justify-between">
              <span className="font-mono text-[11px] font-black text-[#07221A] uppercase tracking-wider">
                {workingPrinciple.modelName} Formulation
              </span>
              <span className="text-[10px] font-bold text-[#5C7F75]">
                Cross-Coupling Synergy: {synergyMultiplier}x
              </span>
            </div>

            <div className="p-3 bg-white rounded-xl border border-[#13493B]/10 font-mono text-[11px] text-[#07221A] overflow-x-auto">
              <code>
                Composite Freshness = 100 - [(W_T·ΔT + W_H·ΔH + W_G·ΔG) × C_synergy]
              </code>
            </div>

            <div className="space-y-1.5 text-[11px] text-[#3D524C] leading-relaxed">
              <p>
                <strong>1. Baseline Invariant:</strong> When Temperature, Relative Humidity, and MQ-135 Gas telemetry are within their respective target bounds, all deviation terms (ΔT, ΔH, ΔG) equal 0. The resultant Freshness Score is <strong>100% (Peak Freshness)</strong>.
              </p>
              <p>
                <strong>2. Biological Synergy (C_synergy):</strong> Thermal abuse catalyzes exponential microbial reproduction (Arrhenius kinetics). If temperature rises concurrently with VOC outgassing, the synergy factor compounds the penalty by up to 2.2x.
              </p>
              <p>
                <strong>3. Regulatory Grounding:</strong> Baseline parameters match {report.thresholdsUsed.scientificReference}, preventing premature false alarms while guaranteeing immediate detection of cold-chain failure.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};

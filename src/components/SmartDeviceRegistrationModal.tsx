import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Radio, 
  Sparkles, 
  X, 
  Cpu, 
  Wifi, 
  CheckCircle2, 
  Sliders, 
  Thermometer, 
  Droplets, 
  Wind, 
  Waves, 
  Loader2, 
  RefreshCw, 
  Scan, 
  ShieldCheck, 
  Layers, 
  ArrowRight, 
  ArrowLeft, 
  Check, 
  Zap,
  Tag,
  MapPin,
  QrCode,
  Copy,
  Activity,
  AlertCircle
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { calculateMoisture } from '../utils/moistureCalculator';
import { researchProductThresholds, AIThresholdResearchResult } from '../services/aiThresholdService';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (deviceId: string) => void;
}

interface DiscoveredNode {
  id: string;
  mac: string;
  name: string;
  signalRssi: number;
  batteryPct: number;
  firmware: string;
  suggestedProduct: string;
}

const DISCOVERED_NODES: DiscoveredNode[] = [
  { id: 'YGS-FD-894120', mac: '24:6F:28:9A:C3:10', name: 'FreshNode Alpha-1', signalRssi: -42, batteryPct: 98, firmware: 'v2.4.1', suggestedProduct: 'Fresh Whole Milk' },
  { id: 'YGS-FD-629401', mac: '30:AE:A4:7B:11:F8', name: 'ColdGuard Vault-2', signalRssi: -56, batteryPct: 91, firmware: 'v2.4.1', suggestedProduct: 'Atlantic Salmon' },
  { id: 'YGS-FD-315892', mac: 'A4:CF:12:33:9E:04', name: 'AgriSense Edge-3', signalRssi: -68, batteryPct: 84, firmware: 'v2.3.9', suggestedProduct: 'Strawberries' },
  { id: 'YGS-FD-704153', mac: 'CC:50:E3:48:D2:77', name: 'BioTrack Sensor-4', signalRssi: -72, batteryPct: 100, firmware: 'v2.4.1', suggestedProduct: 'Roma Tomatoes' }
];

const FOOD_PRESETS = [
  { name: 'Fresh Whole Milk', category: 'Dairy Products', tempMin: 1.5, tempMax: 4.0, humMin: 55, humMax: 68, mq: 850, icon: '🥛' },
  { name: 'Atlantic Salmon', category: 'Seafood & Aquaculture', tempMin: 0.0, tempMax: 2.0, humMin: 70, humMax: 85, mq: 700, icon: '🐟' },
  { name: 'Roma Tomatoes', category: 'Fresh Produce', tempMin: 10.0, tempMax: 15.0, humMin: 80, humMax: 90, mq: 1100, icon: '🍅' },
  { name: 'Fresh Strawberries', category: 'Berries & Fruits', tempMin: 0.5, tempMax: 2.5, humMin: 85, humMax: 95, mq: 900, icon: '🍓' },
  { name: 'Organic Chicken Breast', category: 'Meat & Poultry', tempMin: 0.0, tempMax: 3.0, humMin: 65, humMax: 78, mq: 650, icon: '🍗' },
  { name: 'Baby Spinach', category: 'Leafy Greens', tempMin: 1.0, tempMax: 4.0, humMin: 85, humMax: 95, mq: 800, icon: '🥬' },
  { name: 'Vaccine / Cold Meds', category: 'Pharmaceuticals', tempMin: 2.0, tempMax: 8.0, humMin: 40, humMax: 60, mq: 500, icon: '💉' },
  { name: 'Cheddar Cheese', category: 'Dairy Products', tempMin: 3.0, tempMax: 7.0, humMin: 60, humMax: 75, mq: 950, icon: '🧀' }
];

type StepType = 'pairing' | 'product' | 'thresholds' | 'deploying';

export const SmartDeviceRegistrationModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const { updateDeviceData, updateProductProfile } = useApp();

  const [step, setStep] = useState<StepType>('pairing');
  const [pairingMode, setPairingMode] = useState<'radar' | 'manual' | 'qr'>('radar');
  const [isScanningRadar, setIsScanningRadar] = useState(false);
  const [radarNodes, setRadarNodes] = useState<DiscoveredNode[]>([]);
  
  // Device details
  const [deviceId, setDeviceId] = useState('');
  const [nodeName, setNodeName] = useState('FreshNex ESP32 Node');
  const [macAddress, setMacAddress] = useState('');
  const [storageLocation, setStorageLocation] = useState('Central Cold Storage (Chamber A)');
  
  // Product details
  const [productName, setProductName] = useState('Fresh Whole Milk');
  const [productCategory, setProductCategory] = useState('Dairy Products');
  
  // AI & Thresholds
  const [tempMin, setTempMin] = useState<number>(2.0);
  const [tempMax, setTempMax] = useState<number>(5.0);
  const [humMin, setHumMin] = useState<number>(55);
  const [humMax, setHumMax] = useState<number>(70);
  const [mqThreshold, setMqThreshold] = useState<number>(900);
  const [shelfLifeDays, setShelfLifeDays] = useState<number>(14);
  const [isResearching, setIsResearching] = useState(false);
  const [aiResult, setAiResult] = useState<AIThresholdResearchResult | null>(null);
  const [researchError, setResearchError] = useState<string | null>(null);

  // Deployment state
  const [deployProgress, setDeployProgress] = useState(0);
  const [deployStageText, setDeployStageText] = useState('Initiating cryptographic handshake...');
  const [isDeployed, setIsDeployed] = useState(false);
  const [copiedId, setCopiedId] = useState(false);

  // Initial random device ID generation
  const generateNewId = () => {
    const num = Math.floor(100000 + Math.random() * 900000);
    const newId = `YGS-FD-${num}`;
    setDeviceId(newId);
    const randomMac = Array.from({ length: 6 }, () => 
      Math.floor(Math.random() * 256).toString(16).padStart(2, '0').toUpperCase()
    ).join(':');
    setMacAddress(randomMac);
  };

  useEffect(() => {
    if (isOpen && !deviceId) {
      generateNewId();
      triggerRadarScan();
    }
  }, [isOpen]);

  const triggerRadarScan = () => {
    setIsScanningRadar(true);
    setRadarNodes([]);
    
    // Simulate staggered radar discovery
    setTimeout(() => {
      setRadarNodes([DISCOVERED_NODES[0]]);
    }, 600);

    setTimeout(() => {
      setRadarNodes([DISCOVERED_NODES[0], DISCOVERED_NODES[1]]);
    }, 1200);

    setTimeout(() => {
      setRadarNodes(DISCOVERED_NODES);
      setIsScanningRadar(false);
    }, 1900);
  };

  const handleSelectDiscoveredNode = (node: DiscoveredNode) => {
    setDeviceId(node.id);
    setNodeName(node.name);
    setMacAddress(node.mac);
    setProductName(node.suggestedProduct);
    
    // Apply matching preset if any
    const match = FOOD_PRESETS.find(p => p.name.toLowerCase().includes(node.suggestedProduct.toLowerCase()));
    if (match) {
      applyPreset(match);
    }
  };

  const applyPreset = (preset: typeof FOOD_PRESETS[0]) => {
    setProductName(preset.name);
    setProductCategory(preset.category);
    setTempMin(preset.tempMin);
    setTempMax(preset.tempMax);
    setHumMin(preset.humMin);
    setHumMax(preset.humMax);
    setMqThreshold(preset.mq);
  };

  const handleRunAIResearch = async () => {
    if (!productName.trim()) return;
    setIsResearching(true);
    setResearchError(null);

    try {
      const res = await researchProductThresholds(productName, productCategory, storageLocation);
      setAiResult(res);
      setTempMin(res.tempMin);
      setTempMax(res.tempMax);
      setHumMin(res.humMin);
      setHumMax(res.humMax);
      setMqThreshold(res.mq135Threshold);
      setShelfLifeDays(res.shelfLifeDays);
      if (res.category) setProductCategory(res.category);
    } catch (err: any) {
      setResearchError(err.message || 'AI threshold recommendation could not be retrieved.');
    } finally {
      setIsResearching(false);
    }
  };

  const calculatedMoisture = calculateMoisture(
    (tempMin + tempMax) / 2, 
    (humMin + humMax) / 2
  );

  const handleStartDeployment = async () => {
    setStep('deploying');
    setDeployProgress(15);
    setDeployStageText('Allocating cryptographic encryption certificates...');

    setTimeout(() => {
      setDeployProgress(45);
      setDeployStageText('Binding wireless ESP32 node to Firebase Cloud...');
    }, 600);

    setTimeout(() => {
      setDeployProgress(75);
      setDeployStageText('Calibrating psychrometric equilibrium threshold bounds...');
    }, 1200);

    setTimeout(async () => {
      setDeployProgress(100);
      setDeployStageText('Hardware node provisioned & streaming live!');
      
      const nominalTemp = Number(((tempMin + tempMax) / 2).toFixed(1));
      const nominalHum = Number(((humMin + humMax) / 2).toFixed(1));

      // Push to Firebase / App Context
      await updateDeviceData(deviceId, {
        product: productName,
        online: true,
        temperature: nominalTemp,
        humidity: nominalHum,
        mq135_raw: mqThreshold - 150,
        last_update: Date.now()
      });

      await updateProductProfile({
        id: `p_${productName.trim().toLowerCase().replace(/\s+/g, '_')}`,
        name: productName.trim(),
        category: productCategory,
        temperature_min: tempMin,
        temperature_max: tempMax,
        humidity_min: humMin,
        humidity_max: humMax,
        mq135_threshold: mqThreshold
      });

      setIsDeployed(true);
      if (onSuccess) onSuccess(deviceId);
    }, 1900);
  };

  const handleCopyId = () => {
    navigator.clipboard.writeText(deviceId);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 md:p-6 overflow-hidden">
        {/* Holographic Blurred Backdrop with Animated Radial Ambient Pulse */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-[#04140F]/85 backdrop-blur-2xl"
        >
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-[#20E79A]/15 rounded-full blur-[140px] pointer-events-none animate-pulse" />
          <div className="absolute bottom-10 right-10 w-[350px] h-[350px] bg-[#00E5FF]/10 rounded-full blur-[120px] pointer-events-none" />
        </motion.div>

        {/* Floating Holographic Cyber-Pod Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.88, y: 30, rotateX: 6 }}
          animate={{ opacity: 1, scale: 1, y: 0, rotateX: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20, rotateX: -4 }}
          transition={{ type: "spring", stiffness: 320, damping: 26 }}
          onClick={e => e.stopPropagation()}
          className="relative w-full max-w-2xl max-h-[90vh] bg-gradient-to-b from-[#0C241C]/95 via-[#071C15]/98 to-[#030E0A] rounded-[28px] sm:rounded-[36px] border border-[#20E79A]/35 shadow-[0_30px_90px_-15px_rgba(0,0,0,0.8),0_0_50px_rgba(32,231,154,0.2)] text-[#E2F7ED] flex flex-col overflow-hidden"
        >
          {/* Top Luminous Neon Track */}
          <div className="absolute top-0 inset-x-0 h-[2.5px] bg-gradient-to-r from-transparent via-[#20E79A] to-[#00E5FF] shadow-[0_0_15px_#20E79A]" />

          {/* WINDOW HEADER */}
          <div className="shrink-0 px-5 py-4 sm:px-7 sm:py-5 border-b border-[#20E79A]/20 bg-[#071C15]/80 backdrop-blur-md flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-br from-[#20E79A]/25 to-[#00E5FF]/15 border border-[#20E79A]/40 flex items-center justify-center shadow-inner">
                <Radio className="w-5 h-5 sm:w-6 sm:h-6 text-[#20E79A] animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-full bg-[#20E79A]/20 text-[#20E79A] text-[9px] font-black uppercase tracking-wider border border-[#20E79A]/40">
                    IoT Edge Matrix
                  </span>
                  <span className="text-[10px] text-[#5C7F75] font-mono">v3.8 • AI Active</span>
                </div>
                <h2 className="text-lg sm:text-xl font-black text-white tracking-tight flex items-center gap-1.5">
                  Hardware Node Provisioning
                </h2>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-9 h-9 rounded-full bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white flex items-center justify-center border border-white/10 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* STEP INDICATOR TRACK */}
          {step !== 'deploying' && (
            <div className="shrink-0 px-5 py-2.5 sm:px-7 bg-[#051711] border-b border-[#20E79A]/15 flex items-center justify-between gap-2 overflow-x-auto">
              {[
                { id: 'pairing', label: '1. Discovery & Pairing', icon: Wifi },
                { id: 'product', label: '2. AI Food Matrix', icon: Sparkles },
                { id: 'thresholds', label: '3. Sensor Guardrails', icon: Sliders }
              ].map((s, idx) => {
                const isActive = step === s.id;
                const isPassed = (step === 'product' && s.id === 'pairing') || 
                                 (step === 'thresholds' && (s.id === 'pairing' || s.id === 'product'));
                const Icon = s.icon;
                return (
                  <button
                    key={s.id}
                    onClick={() => setStep(s.id as StepType)}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer whitespace-nowrap ${
                      isActive 
                        ? 'bg-[#20E79A] text-[#07221A] shadow-md shadow-[#20E79A]/30' 
                        : isPassed 
                        ? 'bg-[#20E79A]/15 text-[#20E79A] border border-[#20E79A]/30' 
                        : 'text-[#5C7F75] hover:text-slate-300'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{s.label}</span>
                    {isPassed && <Check className="w-3 h-3 text-[#20E79A]" />}
                  </button>
                );
              })}
            </div>
          )}

          {/* WINDOW SCROLLABLE BODY */}
          <div className="flex-1 overflow-y-auto overscroll-contain px-5 py-5 sm:px-7 sm:py-6 space-y-6">
            
            {/* -------------------------------------------------------------
                STEP 1: DISCOVERY & HARDWARE PAIRING
               ------------------------------------------------------------- */}
            {step === 'pairing' && (
              <motion.div
                key="step-pairing"
                initial={{ opacity: 0, x: -15 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -15 }}
                transition={{ duration: 0.25 }}
                className="space-y-5"
              >
                {/* Pairing Mode Switcher */}
                <div className="grid grid-cols-3 gap-2 p-1 rounded-2xl bg-[#030E0A] border border-[#20E79A]/20 text-xs font-bold">
                  {[
                    { id: 'radar', label: 'Smart Radar Sweep', icon: Scan },
                    { id: 'qr', label: 'Serial & QR Code', icon: QrCode },
                    { id: 'manual', label: 'Custom Mac/IP', icon: Cpu }
                  ].map(m => {
                    const Icon = m.icon;
                    return (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => setPairingMode(m.id as any)}
                        className={`py-2 px-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                          pairingMode === m.id
                            ? 'bg-gradient-to-r from-[#20E79A] to-[#10B981] text-[#07221A] font-black shadow-sm'
                            : 'text-[#5C7F75] hover:text-white'
                        }`}
                      >
                        <Icon className="w-3.5 h-3.5 shrink-0" />
                        <span className="truncate">{m.label}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Radar Discovery Mode */}
                {pairingMode === 'radar' && (
                  <div className="space-y-4">
                    {/* Visual Radar Scanner Graphic */}
                    <div className="relative rounded-3xl bg-gradient-to-b from-[#061F16] to-[#020B07] border border-[#20E79A]/30 p-6 flex flex-col items-center justify-center overflow-hidden min-h-[190px]">
                      {/* Concentric Radar Rings */}
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="w-44 h-44 rounded-full border border-[#20E79A]/15 animate-ping opacity-30" />
                        <div className="w-32 h-32 rounded-full border border-[#20E79A]/25" />
                        <div className="w-20 h-20 rounded-full border border-[#20E79A]/40 bg-[#20E79A]/5" />
                        <div className="w-2.5 h-2.5 rounded-full bg-[#20E79A] shadow-[0_0_12px_#20E79A]" />
                      </div>

                      {/* Rotating Radar Sweep Needle */}
                      <div className="absolute w-44 h-44 rounded-full pointer-events-none animate-spin" style={{ animationDuration: '4s' }}>
                        <div className="w-1/2 h-1/2 bg-gradient-to-br from-[#20E79A]/40 to-transparent origin-bottom-right rounded-tl-full" />
                      </div>

                      <div className="relative z-10 text-center space-y-1">
                        <span className="text-[10px] font-black uppercase text-[#20E79A] tracking-wider block">
                          {isScanningRadar ? 'Scanning BLE & Wi-Fi Mesh Frequencies...' : 'Radar Discovery Active'}
                        </span>
                        <p className="text-xs text-slate-300 font-medium">
                          {radarNodes.length} Unpaired ESP32 Hardware Beacon{radarNodes.length !== 1 ? 's' : ''} detected
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={triggerRadarScan}
                        disabled={isScanningRadar}
                        className="relative z-10 mt-3 px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 border border-[#20E79A]/30 text-[#20E79A] text-xs font-bold flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                      >
                        <RefreshCw className={`w-3.5 h-3.5 ${isScanningRadar ? 'animate-spin' : ''}`} />
                        <span>Rescan Network</span>
                      </button>
                    </div>

                    {/* Discovered Nodes List */}
                    <div className="space-y-2">
                      <span className="text-[10px] font-extrabold uppercase text-[#5C7F75] tracking-wider block">
                        Nearby Auto-Discovered Hardware Nodes:
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        {radarNodes.map(node => {
                          const isSelected = deviceId === node.id;
                          return (
                            <motion.div
                              key={node.id}
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              onClick={() => handleSelectDiscoveredNode(node)}
                              className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between space-y-2 ${
                                isSelected 
                                  ? 'bg-[#20E79A]/20 border-[#20E79A] shadow-[0_0_20px_rgba(32,231,154,0.25)]' 
                                  : 'bg-[#061A13] border-white/10 hover:border-[#20E79A]/40'
                              }`}
                            >
                              <div className="flex items-start justify-between gap-2">
                                <div>
                                  <div className="flex items-center gap-1.5">
                                    <span className="text-xs font-black text-white">{node.name}</span>
                                    {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-[#20E79A]" />}
                                  </div>
                                  <span className="text-[10px] font-mono font-bold text-[#FFAA00] block">{node.id}</span>
                                </div>
                                <span className="px-2 py-0.5 rounded-md text-[9px] font-mono font-bold bg-black/40 text-[#20E79A] border border-[#20E79A]/20">
                                  {node.signalRssi} dBm
                                </span>
                              </div>

                              <div className="flex items-center justify-between text-[10px] text-[#5C7F75] font-mono border-t border-white/5 pt-1.5">
                                <span>MAC: {node.mac}</span>
                                <span className="text-emerald-400">Bat: {node.batteryPct}%</span>
                              </div>
                            </motion.div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}

                {/* QR / Serial Mode */}
                {pairingMode === 'qr' && (
                  <div className="p-5 rounded-3xl bg-[#061A13] border border-[#20E79A]/30 space-y-4 text-center">
                    <div className="w-24 h-24 mx-auto bg-white p-2 rounded-2xl shadow-lg flex items-center justify-center">
                      <QrCode className="w-20 h-20 text-[#07221A]" />
                    </div>
                    <div>
                      <span className="text-xs font-black text-white block">Cryptographic Node Serial</span>
                      <div className="inline-flex items-center gap-2 mt-1 px-3 py-1.5 rounded-xl bg-black/40 border border-[#20E79A]/40 font-mono font-black text-sm text-[#20E79A]">
                        <span>{deviceId}</span>
                        <button onClick={handleCopyId} className="hover:text-white cursor-pointer">
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      {copiedId && <span className="block text-[10px] text-emerald-400 mt-1">Copied to clipboard!</span>}
                    </div>
                    <button
                      type="button"
                      onClick={generateNewId}
                      className="px-3.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-bold text-slate-300 border border-white/10 cursor-pointer inline-flex items-center gap-1.5"
                    >
                      <RefreshCw className="w-3 h-3" />
                      <span>Generate New Cryptographic Key</span>
                    </button>
                  </div>
                )}

                {/* Manual Mode */}
                {pairingMode === 'manual' && (
                  <div className="space-y-3 p-4 rounded-3xl bg-[#061A13] border border-[#20E79A]/30">
                    <div>
                      <label className="text-[10px] font-black uppercase text-[#5C7F75] block mb-1">Hardware Device ID</label>
                      <input
                        type="text"
                        value={deviceId}
                        onChange={e => setDeviceId(e.target.value)}
                        className="w-full bg-[#020B07] border border-[#20E79A]/30 px-3 py-2 rounded-xl text-xs font-mono font-bold text-white focus:outline-none focus:border-[#20E79A]"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-black uppercase text-[#5C7F75] block mb-1">Hardware MAC Address</label>
                      <input
                        type="text"
                        value={macAddress}
                        onChange={e => setMacAddress(e.target.value)}
                        placeholder="24:6F:28:XX:XX:XX"
                        className="w-full bg-[#020B07] border border-[#20E79A]/30 px-3 py-2 rounded-xl text-xs font-mono font-bold text-white focus:outline-none focus:border-[#20E79A]"
                      />
                    </div>
                  </div>
                )}

                {/* Storage Zone Input */}
                <div>
                  <label className="text-[10px] font-black uppercase text-[#5C7F75] block mb-1">Deployment Location / Cold Chamber</label>
                  <div className="relative">
                    <MapPin className="w-4 h-4 text-[#20E79A] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="text"
                      value={storageLocation}
                      onChange={e => setStorageLocation(e.target.value)}
                      placeholder="e.g. Cold Chamber 04 (Dairy Vault)"
                      className="w-full bg-[#061A13] border border-[#20E79A]/30 pl-9 pr-3 py-2.5 rounded-2xl text-xs font-bold text-white focus:outline-none focus:border-[#20E79A]"
                    />
                  </div>
                </div>
              </motion.div>
            )}

            {/* -------------------------------------------------------------
                STEP 2: AI FOOD MATRIX & PRODUCT PROFILE
               ------------------------------------------------------------- */}
            {step === 'product' && (
              <motion.div
                key="step-product"
                initial={{ opacity: 0, x: 15 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 15 }}
                transition={{ duration: 0.25 }}
                className="space-y-5"
              >
                {/* Product Name Input with AI Research Trigger */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-black uppercase tracking-wider text-white">
                      Food Item or Perishable Payload
                    </label>
                    <span className="text-[10px] text-[#20E79A] font-bold">1-Click AI Scientific Research</span>
                  </div>
                  
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={productName}
                      onChange={e => setProductName(e.target.value)}
                      placeholder="e.g., Whole Milk, Atlantic Salmon, Roma Tomatoes..."
                      className="flex-1 bg-[#061A13] border border-[#20E79A]/30 px-3.5 py-2.5 rounded-2xl text-xs font-bold text-white focus:outline-none focus:border-[#20E79A]"
                    />
                    <button
                      type="button"
                      onClick={handleRunAIResearch}
                      disabled={isResearching || !productName.trim()}
                      className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-[#20E79A] to-[#00E5FF] text-[#07221A] font-black text-xs flex items-center gap-1.5 shadow-md shadow-[#20E79A]/20 hover:brightness-110 cursor-pointer disabled:opacity-60 shrink-0"
                    >
                      {isResearching ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>Analyzing...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-3.5 h-3.5 text-[#07221A]" />
                          <span>AI Auto-Tune</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {researchError && (
                  <div className="p-3 rounded-xl bg-red-950/60 border border-red-500/40 text-red-300 text-xs font-medium flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                    <span>{researchError}</span>
                  </div>
                )}

                {/* Instant Food Presets Matrix */}
                <div className="space-y-2">
                  <span className="text-[10px] font-black uppercase text-[#5C7F75] tracking-wider block">
                    One-Tap Food Matrix Presets:
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {FOOD_PRESETS.map(p => {
                      const isSelected = productName.toLowerCase() === p.name.toLowerCase();
                      return (
                        <motion.button
                          key={p.name}
                          type="button"
                          whileHover={{ scale: 1.03 }}
                          whileTap={{ scale: 0.97 }}
                          onClick={() => applyPreset(p)}
                          className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-1.5 ${
                            isSelected
                              ? 'bg-[#20E79A]/25 border-[#20E79A] text-white shadow-[0_0_15px_rgba(32,231,154,0.3)]'
                              : 'bg-[#061A13] border-white/10 hover:border-[#20E79A]/30 text-slate-300'
                          }`}
                        >
                          <span className="text-xl">{p.icon}</span>
                          <span className="text-xs font-black truncate">{p.name}</span>
                          <span className="text-[9px] font-mono text-[#20E79A]">{p.tempMin}°C - {p.tempMax}°C</span>
                        </motion.button>
                      );
                    })}
                  </div>
                </div>

                {/* AI Research Dossier Badge (if available) */}
                {aiResult && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 rounded-2xl bg-gradient-to-br from-[#0B2C20] to-[#04160F] border border-[#20E79A]/40 space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-[#20E79A]" />
                        <span className="text-xs font-black text-white">AI Post-Harvest Rationale</span>
                      </div>
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-black bg-[#20E79A]/20 text-[#20E79A]">
                        Verified Model {aiResult.provider}
                      </span>
                    </div>
                    <p className="text-[11px] text-emerald-200/90 leading-relaxed">
                      {aiResult.scientificRationale}
                    </p>
                    <div className="flex items-center gap-2 pt-1 text-[10px] font-mono text-[#5C7F75]">
                      <span>Ethylene Sensitivity: <strong className="text-white">{aiResult.ethyleneSensitivity}</strong></span>
                      <span>• Shelf Life: <strong className="text-white">{aiResult.shelfLifeDays} days</strong></span>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            )}

            {/* -------------------------------------------------------------
                STEP 3: SENSOR THRESHOLD GUARDRAILS & PSYCHROMETRICS
               ------------------------------------------------------------- */}
            {step === 'thresholds' && (
              <motion.div
                key="step-thresholds"
                initial={{ opacity: 0, x: 15 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 15 }}
                transition={{ duration: 0.25 }}
                className="space-y-5"
              >
                {/* 4-Metric Equilibrium Live Gauge */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-3.5 rounded-3xl bg-[#030E0A] border border-[#20E79A]/30 text-center">
                  <div className="p-2.5 rounded-2xl bg-white/5 space-y-1">
                    <span className="text-[9px] font-black uppercase text-red-400 block flex items-center justify-center gap-1">
                      <Thermometer className="w-3 h-3" /> Temp Target
                    </span>
                    <span className="text-base font-black text-white font-mono">{tempMin}°C - {tempMax}°C</span>
                  </div>

                  <div className="p-2.5 rounded-2xl bg-white/5 space-y-1">
                    <span className="text-[9px] font-black uppercase text-blue-400 block flex items-center justify-center gap-1">
                      <Droplets className="w-3 h-3" /> Humidity
                    </span>
                    <span className="text-base font-black text-white font-mono">{humMin}% - {humMax}%</span>
                  </div>

                  <div className="p-2.5 rounded-2xl bg-[#20E79A]/15 border border-[#20E79A]/30 space-y-1">
                    <span className="text-[9px] font-black uppercase text-[#20E79A] block flex items-center justify-center gap-1">
                      <Waves className="w-3 h-3" /> Moisture
                    </span>
                    <span className="text-base font-black text-[#20E79A] font-mono">{calculatedMoisture.absoluteMoisture} g/m³</span>
                  </div>

                  <div className="p-2.5 rounded-2xl bg-white/5 space-y-1">
                    <span className="text-[9px] font-black uppercase text-purple-400 block flex items-center justify-center gap-1">
                      <Wind className="w-3 h-3" /> MQ-135 Limit
                    </span>
                    <span className="text-base font-black text-white font-mono">{mqThreshold}</span>
                  </div>
                </div>

                {/* Temperature Controls */}
                <div className="p-4 rounded-3xl bg-[#061A13] border border-white/10 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-white flex items-center gap-1.5">
                      <Thermometer className="w-4 h-4 text-red-400" /> Temperature Range (°C)
                    </span>
                    <span className="text-xs font-mono font-bold text-red-300">{tempMin}°C to {tempMax}°C</span>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] text-[#5C7F75] uppercase font-bold block mb-1">Lower Bound (°C)</label>
                      <input
                        type="number"
                        step="0.5"
                        value={tempMin}
                        onChange={e => setTempMin(Number(e.target.value))}
                        className="w-full bg-[#020B07] border border-white/10 px-3 py-2 rounded-xl text-xs font-bold text-white focus:outline-none focus:border-[#20E79A]"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-[#5C7F75] uppercase font-bold block mb-1">Upper Bound (°C)</label>
                      <input
                        type="number"
                        step="0.5"
                        value={tempMax}
                        onChange={e => setTempMax(Number(e.target.value))}
                        className="w-full bg-[#020B07] border border-white/10 px-3 py-2 rounded-xl text-xs font-bold text-white focus:outline-none focus:border-[#20E79A]"
                      />
                    </div>
                  </div>
                </div>

                {/* Humidity Controls */}
                <div className="p-4 rounded-3xl bg-[#061A13] border border-white/10 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-white flex items-center gap-1.5">
                      <Droplets className="w-4 h-4 text-blue-400" /> Relative Humidity (% RH)
                    </span>
                    <span className="text-xs font-mono font-bold text-blue-300">{humMin}% to {humMax}%</span>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] text-[#5C7F75] uppercase font-bold block mb-1">Min (% RH)</label>
                      <input
                        type="number"
                        value={humMin}
                        onChange={e => setHumMin(Number(e.target.value))}
                        className="w-full bg-[#020B07] border border-white/10 px-3 py-2 rounded-xl text-xs font-bold text-white focus:outline-none focus:border-[#20E79A]"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-[#5C7F75] uppercase font-bold block mb-1">Max (% RH)</label>
                      <input
                        type="number"
                        value={humMax}
                        onChange={e => setHumMax(Number(e.target.value))}
                        className="w-full bg-[#020B07] border border-white/10 px-3 py-2 rounded-xl text-xs font-bold text-white focus:outline-none focus:border-[#20E79A]"
                      />
                    </div>
                  </div>
                </div>

                {/* MQ-135 Gas Limit */}
                <div className="p-4 rounded-3xl bg-[#061A13] border border-white/10 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-white flex items-center gap-1.5">
                      <Wind className="w-4 h-4 text-purple-400" /> MQ-135 Gas Critical Alert Limit
                    </span>
                    <span className="text-xs font-mono font-bold text-purple-300">{mqThreshold} RAW</span>
                  </div>
                  <input
                    type="range"
                    min="400"
                    max="2500"
                    step="50"
                    value={mqThreshold}
                    onChange={e => setMqThreshold(Number(e.target.value))}
                    className="w-full accent-[#20E79A] cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-[#5C7F75] font-mono">
                    <span>Ultra-Sensitive (400)</span>
                    <span>Standard (900)</span>
                    <span>High Tolerance (2500)</span>
                  </div>
                </div>
              </motion.div>
            )}

            {/* -------------------------------------------------------------
                STEP 4: DEPLOYMENT PIPELINE & LAUNCH
               ------------------------------------------------------------- */}
            {step === 'deploying' && (
              <motion.div
                key="step-deploying"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="py-8 space-y-6 text-center"
              >
                {!isDeployed ? (
                  <div className="space-y-5">
                    <div className="relative w-24 h-24 mx-auto">
                      <div className="w-24 h-24 rounded-full border-4 border-[#20E79A]/20 border-t-[#20E79A] animate-spin" />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Zap className="w-8 h-8 text-[#20E79A] animate-pulse" />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <h3 className="text-lg font-black text-white">Deploying Hardware Node</h3>
                      <p className="text-xs text-[#20E79A] font-mono">{deployStageText}</p>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full max-w-md mx-auto h-2 rounded-full bg-black/50 overflow-hidden border border-white/10">
                      <motion.div
                        className="h-full bg-gradient-to-r from-[#20E79A] to-[#00E5FF]"
                        animate={{ width: `${deployProgress}%` }}
                        transition={{ duration: 0.4 }}
                      />
                    </div>
                  </div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="space-y-5"
                  >
                    <div className="w-20 h-20 mx-auto rounded-3xl bg-[#20E79A]/20 border border-[#20E79A] flex items-center justify-center shadow-[0_0_30px_#20E79A]">
                      <CheckCircle2 className="w-10 h-10 text-[#20E79A]" />
                    </div>

                    <div className="space-y-1">
                      <h3 className="text-xl font-black text-white">Node Successfully Provisioned!</h3>
                      <p className="text-xs text-slate-300">
                        {productName} is now actively monitored by node <span className="text-[#20E79A] font-mono font-bold">{deviceId}</span>.
                      </p>
                    </div>

                    <div className="p-4 rounded-2xl bg-[#061A13] border border-[#20E79A]/30 max-w-sm mx-auto text-left text-xs space-y-1.5 font-mono">
                      <div className="flex justify-between">
                        <span className="text-[#5C7F75]">Target Range:</span>
                        <span className="text-white font-bold">{tempMin}°C - {tempMax}°C</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#5C7F75]">Moisture Target:</span>
                        <span className="text-[#20E79A] font-bold">{calculatedMoisture.absoluteMoisture} g/m³</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#5C7F75]">Live Stream:</span>
                        <span className="text-emerald-400 font-bold">ONLINE (100%)</span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={onClose}
                      className="px-6 py-3 rounded-2xl bg-gradient-to-r from-[#20E79A] to-[#00E5FF] text-[#07221A] font-black text-xs shadow-lg shadow-[#20E79A]/30 hover:brightness-110 cursor-pointer"
                    >
                      Open Live Telemetry Dashboard
                    </button>
                  </motion.div>
                )}
              </motion.div>
            )}
          </div>

          {/* WINDOW FOOTER */}
          {step !== 'deploying' && (
            <div className="shrink-0 px-5 py-3.5 sm:px-7 sm:py-4 border-t border-[#20E79A]/20 bg-[#071C15]/90 backdrop-blur-md flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => {
                  if (step === 'product') setStep('pairing');
                  if (step === 'thresholds') setStep('product');
                }}
                disabled={step === 'pairing'}
                className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-bold text-slate-300 flex items-center gap-1.5 cursor-pointer disabled:opacity-30"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back</span>
              </button>

              <div className="flex items-center gap-2">
                {step !== 'thresholds' ? (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="button"
                    onClick={() => {
                      if (step === 'pairing') setStep('product');
                      else if (step === 'product') setStep('thresholds');
                    }}
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#20E79A] to-[#10B981] text-[#07221A] font-black text-xs flex items-center gap-1.5 shadow-md shadow-[#20E79A]/20 hover:brightness-105 cursor-pointer"
                  >
                    <span>Next: {step === 'pairing' ? 'Food Profile' : 'Sensor Guardrails'}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </motion.button>
                ) : (
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    type="button"
                    onClick={handleStartDeployment}
                    className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#20E79A] via-[#00E5FF] to-[#10B981] text-[#07221A] font-black text-xs flex items-center gap-2 shadow-lg shadow-[#20E79A]/30 hover:brightness-110 cursor-pointer"
                  >
                    <Zap className="w-4 h-4 fill-current" />
                    <span>Deploy Node to Live Mesh</span>
                  </motion.button>
                )}
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

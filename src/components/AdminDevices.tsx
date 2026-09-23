import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { FirebaseService } from '../services/firebaseService';
import { 
  Cpu, 
  Wifi, 
  WifiOff, 
  Edit3, 
  Save, 
  X, 
  Activity, 
  Thermometer, 
  Droplets, 
  Wind, 
  CheckCircle2, 
  Bluetooth, 
  Radio, 
  Database,
  ArrowLeft,
  ShieldAlert,
  Sliders,
  RefreshCw,
  Plus,
  Sparkles,
  BookOpen,
  Info,
  Check,
  Loader2,
  Calendar,
  AlertTriangle
} from 'lucide-react';
import { DeviceData } from '../types';
import { ChangeWifiModal } from './ChangeWifiModal';
import { DeviceCard } from './DeviceCard';
import { researchProductThresholds, AIThresholdResearchResult } from '../services/aiThresholdService';

export const AdminDevices: React.FC = () => {
  const { userProfile, isDemoMode } = useAuth();
  const { devicesMap, updateDeviceData, updateProductProfile, productProfiles } = useApp();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const isAdmin = userProfile?.role === 'admin' || isDemoMode;

  // Selected device for Device Details view
  const [activeDeviceId, setActiveDeviceId] = useState<string | null>(null);
  
  // Modals state
  const [wifiModalDeviceId, setWifiModalDeviceId] = useState<string | null>(null);
  const [configModalDevice, setConfigModalDevice] = useState<DeviceData | null>(null);

  // Form state for configuration
  const [productName, setProductName] = useState('');
  const [tempMin, setTempMin] = useState<number | ''>(2.0);
  const [tempMax, setTempMax] = useState<number | ''>(6.0);
  const [humMin, setHumMin] = useState<number | ''>(50);
  const [humMax, setHumMax] = useState<number | ''>(70);
  const [mqThreshold, setMqThreshold] = useState<number | ''>(1500);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Registration Modal State
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [registerStep, setRegisterStep] = useState<'details' | 'thresholds'>('details');
  const [regCode, setRegCode] = useState('YGS-FD-000125');
  const [regProduct, setRegProduct] = useState('');
  const [regCategory, setRegCategory] = useState('');
  const [regLocation, setRegLocation] = useState('Central Cold Storage (Chamber A)');
  const [regTempMin, setRegTempMin] = useState<number | ''>(2.0);
  const [regTempMax, setRegTempMax] = useState<number | ''>(6.0);
  const [regHumMin, setRegHumMin] = useState<number | ''>(60);
  const [regHumMax, setRegHumMax] = useState<number | ''>(80);
  const [regMqThreshold, setRegMqThreshold] = useState<number | ''>(1400);
  const [regShelfLife, setRegShelfLife] = useState<number | ''>(7);
  const [isResearching, setIsResearching] = useState(false);
  const [aiDossier, setAiDossier] = useState<AIThresholdResearchResult | null>(null);
  const [researchError, setResearchError] = useState<string | null>(null);
  const [regSuccess, setRegSuccess] = useState(false);

  // Config Modal AI Research State
  const [isConfigResearching, setIsConfigResearching] = useState(false);
  const [configAiDossier, setConfigAiDossier] = useState<AIThresholdResearchResult | null>(null);
  const [configResearchError, setConfigResearchError] = useState<string | null>(null);

  // Close modals on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsRegisterModalOpen(false);
        setConfigModalDevice(null);
        setWifiModalDeviceId(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const devicesList: DeviceData[] = Object.values(devicesMap);

  const generateNewDeviceCode = () => {
    const num = Math.floor(100000 + Math.random() * 900000);
    setRegCode(`YGS-FD-${num}`);
  };

  const handleRunAIResearch = async (productToQuery: string, categoryToQuery?: string) => {
    const query = productToQuery.trim();
    if (!query) {
      setResearchError('Please enter a product name first to research.');
      return;
    }

    setIsResearching(true);
    setResearchError(null);

    try {
      const result = await researchProductThresholds(query, categoryToQuery, regLocation);
      setAiDossier(result);
      setRegTempMin(result.tempMin);
      setRegTempMax(result.tempMax);
      setRegHumMin(result.humMin);
      setRegHumMax(result.humMax);
      setRegMqThreshold(result.mq135Threshold);
      setRegShelfLife(result.shelfLifeDays);
      if (!regCategory || regCategory === 'Produce') {
        setRegCategory(result.category);
      }
    } catch (err: any) {
      console.error('AI Research Error:', err);
      setResearchError(err.message || 'Unable to complete AI research. Please verify product name.');
    } finally {
      setIsResearching(false);
    }
  };

  const handleConfigAIResearch = async () => {
    if (!productName.trim()) return;
    setIsConfigResearching(true);
    setConfigResearchError(null);

    try {
      const result = await researchProductThresholds(productName);
      setConfigAiDossier(result);
      setTempMin(result.tempMin);
      setTempMax(result.tempMax);
      setHumMin(result.humMin);
      setHumMax(result.humMax);
      setMqThreshold(result.mq135Threshold);
    } catch (err: any) {
      setConfigResearchError(err.message || 'AI threshold lookup failed.');
    } finally {
      setIsConfigResearching(false);
    }
  };

  const handleRegisterDevice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regCode.trim() || !regProduct.trim()) return;

    const baseTemp = typeof regTempMin === 'number' ? regTempMin + 0.8 : 3.2;
    const baseHum = typeof regHumMin === 'number' ? regHumMin + 4 : 65;

    await updateDeviceData(regCode.trim(), {
      product: regProduct.trim(),
      online: true,
      temperature: Number(baseTemp.toFixed(1)),
      humidity: Number(baseHum.toFixed(1)),
      mq135_raw: 940,
      last_update: Date.now()
    });

    await updateProductProfile({
      id: `p_${regProduct.trim().toLowerCase().replace(/\s+/g, '_')}`,
      name: regProduct.trim(),
      category: regCategory || 'Monitored Food Item',
      temperature_min: regTempMin === '' ? null : Number(regTempMin),
      temperature_max: regTempMax === '' ? null : Number(regTempMax),
      humidity_min: regHumMin === '' ? null : Number(regHumMin),
      humidity_max: regHumMax === '' ? null : Number(regHumMax),
      mq135_threshold: regMqThreshold === '' ? null : Number(regMqThreshold)
    });

    setRegSuccess(true);
    setTimeout(() => {
      setRegSuccess(false);
      setIsRegisterModalOpen(false);
      setRegProduct('');
      setAiDossier(null);
      generateNewDeviceCode();
    }, 1200);
  };

  const [realtimeStatus, setRealtimeStatus] = useState<'online' | 'offline' | undefined>(undefined);
  const [liveSensor, setLiveSensor] = useState({
    temperature: 4.2,
    humidity: 62.0,
    mq135_raw: 120
  });

  // Subscribe to real-time status and sensor data
  useEffect(() => {
    if (!activeDeviceId) {
      setRealtimeStatus(undefined);
      return;
    }
    const unsubStatus = FirebaseService.subscribeToDeviceStatus(activeDeviceId, (status) => {
      setRealtimeStatus(status);
    });

    const dev = devicesMap[activeDeviceId];
    if (dev) {
      setLiveSensor({
        temperature: dev.temperature ?? 4.2,
        humidity: dev.humidity ?? 62.0,
        mq135_raw: dev.mq135_raw ?? 120
      });
    }

    const unsubSensor = FirebaseService.subscribeToSensorData(activeDeviceId, (data) => {
      if (data) {
        setLiveSensor({
          temperature: data.temperature ?? dev?.temperature ?? 4.2,
          humidity: data.humidity ?? dev?.humidity ?? 62.0,
          mq135_raw: (data as any).gas ?? (data as any).mq135_raw ?? dev?.mq135_raw ?? 120
        });
      }
    });

    return () => {
      unsubStatus();
      unsubSensor();
    };
  }, [activeDeviceId, devicesMap]);

  // Sync URL search params ?id=YGS-FD-000124
  useEffect(() => {
    const devId = searchParams.get('id');
    if (devId && devicesMap[devId]) {
      setActiveDeviceId(devId);
    }
  }, [searchParams, devicesMap]);

  if (!isAdmin) {
    return (
      <div className="max-w-md mx-auto text-center py-20 px-6 space-y-4">
        <ShieldAlert className="w-16 h-16 text-red-500 mx-auto" />
        <h2 className="text-xl font-black text-[#1A120D]">Admin Access Required</h2>
        <p className="text-xs text-slate-500 font-semibold">
          This device management console is restricted to authenticated FreshNex administrators.
        </p>
        <button
          onClick={() => navigate('/dashboard')}
          className="px-6 py-2.5 rounded-xl bg-[#07221A] text-white font-bold text-xs"
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  const baseDevice = activeDeviceId ? devicesMap[activeDeviceId] : null;
  const activeDevice = baseDevice ? {
    ...baseDevice,
    temperature: liveSensor.temperature,
    humidity: liveSensor.humidity,
    mq135_raw: liveSensor.mq135_raw,
    online: realtimeStatus === 'online'
  } : null;

  const handleOpenConfigModal = (dev: DeviceData) => {
    setConfigModalDevice(dev);
    setProductName(dev.product || 'Milk');
    
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
    if (!configModalDevice) return;

    await updateDeviceData(configModalDevice.device_id, {
      product: productName
    });

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
      setConfigModalDevice(null);
    }, 1200);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto select-none font-sans pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#13493B]/10 pb-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FF6A00]/15 text-[#FFAA00] border border-[#FF6A00]/30 text-[10px] font-black uppercase tracking-wider mb-1">
            <Radio className="w-3 h-3" /> Admin Device Management
          </div>
          <h1 className="text-2xl font-black text-[#07221A] tracking-tight">IoT Hardware Nodes</h1>
          <p className="text-xs text-[#5C7F75] font-semibold">
            Manage ESP32 micro-nodes, Wi-Fi reprovisioning, and AI-researched safety thresholds
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {activeDevice && (
            <button
              onClick={() => { setActiveDeviceId(null); setSearchParams({}); }}
              className="px-4 py-2 rounded-xl bg-white border border-[#13493B]/15 text-xs font-bold text-[#07221A] hover:bg-[#F4F7F6] flex items-center gap-1.5 cursor-pointer shadow-sm self-start sm:self-auto"
            >
              <ArrowLeft className="w-4 h-4 text-[#20E79A]" />
              <span>View All Devices</span>
            </button>
          )}

          <motion.button
            whileHover={{ scale: 1.03, y: -1 }}
            whileTap={{ scale: 0.97 }}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
            onClick={() => {
              setIsRegisterModalOpen(true);
              if (!regCode) generateNewDeviceCode();
            }}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#20E79A] via-[#10B981] to-[#047857] text-[#07221A] hover:brightness-105 font-black text-xs flex items-center gap-2 shadow-md shadow-emerald-500/20 cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Register Device & Product</span>
            <Sparkles className="w-3.5 h-3.5 text-[#07221A] animate-pulse" />
          </motion.button>
        </div>
      </div>

      {/* VIEW MODE A: SINGLE DEVICE DETAILS VIEW */}
      {activeDevice ? (
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="space-y-6"
        >
          {/* Main Device Details Floating Panel */}
          <div className="glass-card bg-white/95 rounded-[28px] sm:rounded-[36px] p-5 sm:p-8 border border-[#13493B]/10 shadow-[0_16px_40px_-8px_rgba(7,34,26,0.08),0_4px_12px_rgba(0,0,0,0.03)] relative overflow-hidden space-y-6">
            {/* Top Accent Floating Highlight */}
            <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-[#20E79A]/60 to-transparent pointer-events-none" />

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#F4F7F6] pb-5">
              <div className="space-y-1">
                <span className="text-[10px] font-black uppercase tracking-wider text-[#20E79A] bg-[#EBFBF4] px-2.5 py-1 rounded-full border border-[#20E79A]/20 inline-flex items-center gap-1.5 shadow-xs">
                  <Radio className="w-3 h-3 text-[#20E79A]" />
                  ESP32 Monitored Node
                </span>
                <h2 className="text-2xl sm:text-3xl font-black text-[#07221A] tracking-tight">{activeDevice.product || 'Milk'}</h2>
                <p className="text-xs font-mono font-bold text-[#FFAA00] flex items-center gap-1">
                  <span>Device ID:</span>
                  <span className="bg-[#FFAA00]/10 px-2 py-0.5 rounded-md border border-[#FFAA00]/20">{activeDevice.device_id}</span>
                </p>
              </div>

              <div className="flex items-center gap-2 self-start sm:self-auto">
                <motion.span 
                  whileHover={{ scale: 1.05 }}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-black flex items-center gap-2 shadow-xs ${
                    realtimeStatus === 'online' ? 'bg-emerald-100/90 text-emerald-700 border border-emerald-300' : 'bg-slate-100 text-slate-600 border border-slate-300'
                  }`}
                >
                  <span className={`w-2.5 h-2.5 rounded-full ${realtimeStatus === 'online' ? 'bg-emerald-500 animate-pulse ring-4 ring-emerald-400/20' : 'bg-slate-400'}`} />
                  <span>{realtimeStatus === 'online' ? 'ONLINE' : 'OFFLINE'}</span>
                </motion.span>
              </div>
            </div>

            {/* Status Floating Grid: ESP32, Wi-Fi, Firebase */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
              {/* ESP32 Status */}
              <motion.div 
                whileHover={{ y: -3, scale: 1.02 }}
                transition={{ type: "spring", stiffness: 350, damping: 20 }}
                className="p-4 sm:p-5 rounded-2xl sm:rounded-3xl bg-gradient-to-b from-[#F4F7F6] to-[#E9EEEB] border border-[#13493B]/10 shadow-sm hover:shadow-md transition-all flex items-center gap-3.5"
              >
                <div className="w-11 h-11 rounded-2xl bg-white text-[#20E79A] border border-[#13493B]/10 flex items-center justify-center shrink-0 shadow-sm">
                  <Cpu className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <span className="text-[10px] font-extrabold uppercase text-[#5C7F75] block truncate">ESP32 Hardware</span>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className={`w-2 h-2 rounded-full ${realtimeStatus === 'online' ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                    <span className="text-xs font-black text-[#07221A]">{realtimeStatus === 'online' ? 'Online' : 'Offline'}</span>
                  </div>
                </div>
              </motion.div>

              {/* Wi-Fi Status */}
              <motion.div 
                whileHover={{ y: -3, scale: 1.02 }}
                transition={{ type: "spring", stiffness: 350, damping: 20 }}
                className="p-4 sm:p-5 rounded-2xl sm:rounded-3xl bg-gradient-to-b from-[#F4F7F6] to-[#E9EEEB] border border-[#13493B]/10 shadow-sm hover:shadow-md transition-all flex items-center gap-3.5"
              >
                <div className="w-11 h-11 rounded-2xl bg-white text-blue-500 border border-[#13493B]/10 flex items-center justify-center shrink-0 shadow-sm">
                  <Wifi className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <span className="text-[10px] font-extrabold uppercase text-[#5C7F75] block truncate">Wi-Fi Connection</span>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span className="text-xs font-black text-[#07221A]">Connected</span>
                  </div>
                </div>
              </motion.div>

              {/* Firebase Status */}
              <motion.div 
                whileHover={{ y: -3, scale: 1.02 }}
                transition={{ type: "spring", stiffness: 350, damping: 20 }}
                className="p-4 sm:p-5 rounded-2xl sm:rounded-3xl bg-gradient-to-b from-[#F4F7F6] to-[#E9EEEB] border border-[#13493B]/10 shadow-sm hover:shadow-md transition-all flex items-center gap-3.5"
              >
                <div className="w-11 h-11 rounded-2xl bg-white text-[#FFAA00] border border-[#13493B]/10 flex items-center justify-center shrink-0 shadow-sm">
                  <Database className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <span className="text-[10px] font-extrabold uppercase text-[#5C7F75] block truncate">Firebase Cloud</span>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span className="text-xs font-black text-[#07221A]">Connected</span>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Live Sensor Telemetry Floating Cards */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-black uppercase tracking-wider text-[#5C7F75] flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-[#20E79A]" />
                  Live Telemetry Readings
                </h3>
                <span className="text-[10px] font-bold text-[#20E79A] bg-[#EBFBF4] px-2 py-0.5 rounded-full">Real-time Stream</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                <motion.div 
                  whileHover={{ y: -3, scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 350, damping: 20 }}
                  className="p-4 sm:p-5 rounded-2xl sm:rounded-3xl bg-gradient-to-br from-white via-white to-[#F7FAF8] border border-[#13493B]/10 shadow-sm hover:shadow-md transition-all flex items-center justify-between"
                >
                  <div>
                    <span className="text-[10px] font-extrabold text-[#5C7F75] uppercase block tracking-wider">Temperature</span>
                    <span className="text-2xl sm:text-3xl font-black text-[#07221A]">{activeDevice.temperature} <span className="text-sm font-bold text-[#5C7F75]">°C</span></span>
                  </div>
                  <div className="w-12 h-12 rounded-2xl bg-red-50 text-[#FF5A67] border border-red-100 flex items-center justify-center shrink-0 shadow-xs">
                    <Thermometer className="w-6 h-6" />
                  </div>
                </motion.div>

                <motion.div 
                  whileHover={{ y: -3, scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 350, damping: 20 }}
                  className="p-4 sm:p-5 rounded-2xl sm:rounded-3xl bg-gradient-to-br from-white via-white to-[#F7FAF8] border border-[#13493B]/10 shadow-sm hover:shadow-md transition-all flex items-center justify-between"
                >
                  <div>
                    <span className="text-[10px] font-extrabold text-[#5C7F75] uppercase block tracking-wider">Humidity</span>
                    <span className="text-2xl sm:text-3xl font-black text-[#07221A]">{activeDevice.humidity} <span className="text-sm font-bold text-[#5C7F75]">%</span></span>
                  </div>
                  <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-500 border border-blue-100 flex items-center justify-center shrink-0 shadow-xs">
                    <Droplets className="w-6 h-6" />
                  </div>
                </motion.div>

                <motion.div 
                  whileHover={{ y: -3, scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 350, damping: 20 }}
                  className="p-4 sm:p-5 rounded-2xl sm:rounded-3xl bg-gradient-to-br from-white via-white to-[#F7FAF8] border border-[#13493B]/10 shadow-sm hover:shadow-md transition-all flex items-center justify-between"
                >
                  <div>
                    <span className="text-[10px] font-extrabold text-[#5C7F75] uppercase block tracking-wider">MQ-135 Gas Raw</span>
                    <span className="text-2xl sm:text-3xl font-black text-[#07221A]">{activeDevice.mq135_raw}</span>
                  </div>
                  <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 border border-purple-100 flex items-center justify-center shrink-0 shadow-xs">
                    <Wind className="w-6 h-6" />
                  </div>
                </motion.div>
              </div>
            </div>

            {/* Device Management Section */}
            <div className="border-t border-[#13493B]/10 pt-6 space-y-4">
              <h3 className="text-xs sm:text-sm font-black text-[#07221A] uppercase tracking-wider">Device Hardware Control</h3>

              <div className="flex flex-col sm:flex-row gap-3">
                {/* Admin Only Change Wi-Fi Button */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setWifiModalDeviceId(activeDevice.device_id)}
                  className="px-6 py-3.5 rounded-2xl btn-orange text-white font-black text-xs shadow-lg hover:brightness-110 flex items-center justify-center gap-2 cursor-pointer flex-1 min-h-[44px]"
                >
                  <Wifi className="w-4 h-4" />
                  <span>CHANGE WI-FI</span>
                </motion.button>

                {/* Configure Thresholds Button */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => handleOpenConfigModal(activeDevice)}
                  className="px-6 py-3.5 rounded-2xl bg-white border border-[#13493B]/20 text-[#07221A] font-black text-xs hover:bg-[#F4F7F6] flex items-center justify-center gap-2 cursor-pointer flex-1 shadow-sm min-h-[44px]"
                >
                  <Sliders className="w-4 h-4 text-[#20E79A]" />
                  <span>CONFIGURE THRESHOLDS</span>
                </motion.button>
              </div>
            </div>
          </div>
        </motion.div>
      ) : (
        /* VIEW MODE B: ALL DEVICES FLOATING GRID */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 md:gap-6">
          {devicesList.map((dev, idx) => (
            <DeviceCard
              key={dev.device_id}
              dev={dev}
              idx={idx}
              onDetailsClick={() => { setActiveDeviceId(dev.device_id); setSearchParams({ id: dev.device_id }); }}
              onWifiClick={() => setWifiModalDeviceId(dev.device_id)}
            />
          ))}
        </div>
      )}

      {/* ADMIN CHANGE WI-FI REPROVISIONING MODAL */}
      {wifiModalDeviceId && (
        <ChangeWifiModal
          deviceId={wifiModalDeviceId}
          currentWifiSsid="Home Wi-Fi"
          onClose={() => setWifiModalDeviceId(null)}
          onSuccess={() => {
            // Refresh device view if active
          }}
        />
      )}

      {/* DEVICE CONFIGURATION      {/* CONFIGURE THRESHOLDS FLOATING WINDOW */}
      <AnimatePresence>
        {configModalDevice && (
          <motion.div
            key="config-modal-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => setConfigModalDevice(null)}
            className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 md:p-6 bg-[#07221A]/80 backdrop-blur-xl overflow-hidden"
          >
            <motion.div
              key="config-modal-window"
              initial={{ opacity: 0, scale: 0.94, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 20 }}
              transition={{ type: "spring", damping: 26, stiffness: 360 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-md sm:max-w-lg max-h-[85vh] sm:max-h-[80vh] bg-white/95 rounded-[20px] sm:rounded-[28px] shadow-[0_25px_70px_-15px_rgba(7,34,26,0.35),0_0_40px_rgba(32,231,154,0.12)] border border-[#13493B]/20 flex flex-col overflow-hidden"
            >
              {/* Floating Top Glow */}
              <div className="absolute top-0 inset-x-0 h-[2.5px] bg-gradient-to-r from-transparent via-[#20E79A] to-transparent pointer-events-none" />

              {/* Fixed Header */}
              <div className="shrink-0 px-4 py-3 sm:px-5 sm:py-4 border-b border-[#13493B]/10 bg-white/90 backdrop-blur-md flex items-center justify-between gap-3">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#EBFBF4] text-[#07221A] text-[10px] font-black uppercase tracking-wider mb-1 border border-[#20E79A]/30">
                    <Sliders className="w-3 h-3 text-[#20E79A]" />
                    Threshold Settings
                  </div>
                  <h3 className="text-base sm:text-lg font-black text-[#07221A]">Device Threshold Configuration</h3>
                  <p className="text-xs text-[#5C7F75] font-mono font-semibold">Node ID: {configModalDevice.device_id}</p>
                </div>
                <motion.button
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setConfigModalDevice(null)}
                  className="w-7 h-7 rounded-full bg-slate-100 text-slate-600 hover:text-[#07221A] flex items-center justify-center hover:bg-slate-200 cursor-pointer shrink-0 transition-colors"
                  aria-label="Close modal"
                >
                  <X className="w-5 h-5" />
                </motion.button>
              </div>

              {/* Scrollable Content Body */}
              <div className="flex-1 overflow-y-auto overscroll-contain px-4 py-4 sm:px-6 sm:py-5 space-y-4">
                {saveSuccess && (
                  <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Configuration saved to Firebase!</span>
                  </div>
                )}

                <form id="config-form" onSubmit={handleSaveConfig} className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-bold text-[#07221A] uppercase block">
                        Assigned Product Name
                      </label>
                      <button
                        type="button"
                        onClick={handleConfigAIResearch}
                        disabled={isConfigResearching || !productName.trim()}
                        className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-300 text-[11px] font-black flex items-center gap-1.5 hover:bg-emerald-100 cursor-pointer disabled:opacity-50 transition-colors min-h-[32px]"
                      >
                        {isConfigResearching ? (
                          <Loader2 className="w-3 h-3 animate-spin text-emerald-600" />
                        ) : (
                          <Sparkles className="w-3 h-3 text-emerald-600" />
                        )}
                        <span>{isConfigResearching ? 'Researching AI...' : 'Auto-Set with AI'}</span>
                      </button>
                    </div>
                    <input
                      type="text"
                      required
                      value={productName}
                      onChange={e => setProductName(e.target.value)}
                      className="w-full border border-slate-200 px-3.5 py-2.5 rounded-xl text-sm font-bold text-[#07221A] focus:outline-none focus:border-[#20E79A]"
                    />
                  </div>

                  {configResearchError && (
                    <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 shrink-0" />
                      <span>{configResearchError}</span>
                    </div>
                  )}

                  {configAiDossier && (
                    <div className="p-3.5 rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50/50 border border-emerald-200 space-y-2">
                      <div className="flex items-center justify-between text-[10px] font-black uppercase text-emerald-800">
                        <span className="flex items-center gap-1.5">
                          <Sparkles className="w-3 h-3 text-emerald-600" />
                          {configAiDossier.provider === 'ai-gpt-oss-120b' || configAiDossier.model === 'openai/gpt-oss-120b'
                            ? 'AI Model (GPT-OSS 120B)'
                            : 'Scientific Research Base'}
                        </span>
                        <span>Target: {configAiDossier.optimalTemp}°C @ {configAiDossier.optimalHumidity}% RH</span>
                      </div>
                      <p className="text-xs text-[#07221A] font-medium leading-relaxed">
                        {configAiDossier.scientificRationale}
                      </p>
                    </div>
                  )}

                  <div className="p-4 rounded-2xl bg-[#F4F7F6] border border-[#13493B]/10 space-y-3">
                    <h4 className="text-xs font-bold text-[#07221A] uppercase tracking-wider flex items-center gap-1.5">
                      <Thermometer className="w-4 h-4 text-[#FF5A67]" /> Temperature Thresholds (°C)
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-[10px] font-bold text-[#5C7F75] uppercase block mb-1">Min (°C)</label>
                        <input
                          type="number"
                          step="0.1"
                          value={tempMin}
                          onChange={e => setTempMin(e.target.value === '' ? '' : Number(e.target.value))}
                          className="w-full bg-white border border-slate-200 px-3 py-2 rounded-xl text-xs font-bold"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-[#5C7F75] uppercase block mb-1">Max (°C)</label>
                        <input
                          type="number"
                          step="0.1"
                          value={tempMax}
                          onChange={e => setTempMax(e.target.value === '' ? '' : Number(e.target.value))}
                          className="w-full bg-white border border-slate-200 px-3 py-2 rounded-xl text-xs font-bold"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-[#F4F7F6] border border-[#13493B]/10 space-y-3">
                    <h4 className="text-xs font-bold text-[#07221A] uppercase tracking-wider flex items-center gap-1.5">
                      <Droplets className="w-4 h-4 text-blue-500" /> Humidity Thresholds (%)
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-[10px] font-bold text-[#5C7F75] uppercase block mb-1">Min (%)</label>
                        <input
                          type="number"
                          value={humMin}
                          onChange={e => setHumMin(e.target.value === '' ? '' : Number(e.target.value))}
                          className="w-full bg-white border border-slate-200 px-3 py-2 rounded-xl text-xs font-bold"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-[#5C7F75] uppercase block mb-1">Max (%)</label>
                        <input
                          type="number"
                          value={humMax}
                          onChange={e => setHumMax(e.target.value === '' ? '' : Number(e.target.value))}
                          className="w-full bg-white border border-slate-200 px-3 py-2 rounded-xl text-xs font-bold"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-[#F4F7F6] border border-[#13493B]/10 space-y-2">
                    <h4 className="text-xs font-bold text-[#07221A] uppercase tracking-wider flex items-center gap-1.5">
                      <Wind className="w-4 h-4 text-purple-600" /> MQ-135 Gas Reference Threshold
                    </h4>
                    <div>
                      <label className="text-[10px] font-bold text-[#5C7F75] uppercase block mb-1">Threshold Raw Value</label>
                      <input
                        type="number"
                        value={mqThreshold}
                        onChange={e => setMqThreshold(e.target.value === '' ? '' : Number(e.target.value))}
                        className="w-full bg-white border border-slate-200 px-3 py-2 rounded-xl text-xs font-bold"
                      />
                    </div>
                  </div>
                </form>
              </div>

              {/* Fixed Footer */}
              <div className="shrink-0 px-4 py-3 sm:px-6 sm:py-4 border-t border-[#13493B]/10 bg-slate-50/90 backdrop-blur-sm flex flex-col-reverse sm:flex-row items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setConfigModalDevice(null)}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-100 cursor-pointer transition-colors text-center min-h-[44px]"
                >
                  Cancel
                </button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  form="config-form"
                  type="submit"
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#07221A] text-white font-bold text-xs shadow-md hover:bg-[#134336] flex items-center justify-center gap-2 cursor-pointer transition-colors min-h-[44px]"
                >
                  <Save className="w-4 h-4 text-[#20E79A]" />
                  <span>SAVE CONFIGURATION</span>
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* REGISTER NEW IOT NODE WITH AI RESEARCH FLOATING WINDOW */}
      <AnimatePresence>
        {isRegisterModalOpen && (
          <motion.div
            key="register-modal-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => setIsRegisterModalOpen(false)}
            className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 md:p-6 bg-[#07221A]/80 backdrop-blur-xl overflow-hidden"
          >
            <motion.div
              key="register-modal-window"
              initial={{ opacity: 0, scale: 0.94, y: 24 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 24 }}
              transition={{ type: "spring", damping: 26, stiffness: 360 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-md sm:max-w-lg md:max-w-xl max-h-[85vh] sm:max-h-[80vh] bg-white/95 rounded-[20px] sm:rounded-[28px] shadow-[0_25px_70px_-15px_rgba(7,34,26,0.4),0_0_40px_rgba(32,231,154,0.15)] border border-[#13493B]/20 flex flex-col overflow-hidden"
            >
              {/* Floating Top Neon Highlight */}
              <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-[#20E79A] to-transparent pointer-events-none" />

              {/* Floating Window Fixed Header */}
              <div className="shrink-0 px-4 py-3 sm:px-5 sm:py-4 border-b border-[#13493B]/10 bg-white/95 backdrop-blur-md space-y-2">
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-0.5">
                    <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[#EBFBF4] text-[#07221A] text-[9px] font-black uppercase tracking-wider border border-[#20E79A]/30">
                      <Sparkles className="w-2.5 h-2.5 text-[#20E79A]" />
                      AI Powered
                    </div>
                    <h3 className="text-base sm:text-lg font-black text-[#07221A] tracking-tight">Register IoT Node</h3>
                    <p className="text-[10px] text-[#5C7F75] font-semibold line-clamp-1 sm:line-clamp-none">
                      Assign hardware ID, select food item, research thresholds
                    </p>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.1, rotate: 90 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setIsRegisterModalOpen(false)}
                    className="w-8 h-8 rounded-full bg-slate-100 text-slate-600 hover:text-[#07221A] flex items-center justify-center hover:bg-slate-200 cursor-pointer shrink-0 transition-colors"
                    aria-label="Close modal"
                  >
                    <X className="w-4 h-4" />
                  </motion.button>
                </div>


                {/* Floating Segmented Step Switcher Tabs */}
                <div className="grid grid-cols-2 gap-1.5 p-1 rounded-xl sm:rounded-2xl bg-[#F4F7F6] border border-[#13493B]/10 text-xs font-black">
                  <button
                    type="button"
                    onClick={() => setRegisterStep('details')}
                    className={`py-2 px-3 rounded-lg sm:rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                      registerStep === 'details'
                        ? 'bg-white text-[#07221A] shadow-sm font-black border border-[#13493B]/10'
                        : 'text-[#5C7F75] hover:text-[#07221A]'
                    }`}
                  >
                    <Cpu className="w-3.5 h-3.5 text-[#20E79A]" />
                    <span className="truncate">1. Device & Product</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setRegisterStep('thresholds')}
                    className={`py-2 px-3 rounded-lg sm:rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                      registerStep === 'thresholds'
                        ? 'bg-white text-[#07221A] shadow-sm font-black border border-[#13493B]/10'
                        : 'text-[#5C7F75] hover:text-[#07221A]'
                    }`}
                  >
                    <Sliders className="w-3.5 h-3.5 text-[#FFAA00]" />
                    <span className="truncate">2. AI Thresholds</span>
                    {aiDossier && (
                      <span className="w-2 h-2 rounded-full bg-[#20E79A] animate-pulse shrink-0" />
                    )}
                  </button>
                </div>
              </div>

              {/* Floating Window Scrollable Body */}
              <div className="flex-1 overflow-y-auto overscroll-contain px-4 py-4 sm:px-6 sm:py-5">
                {regSuccess && (
                  <div className="mb-4 p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2.5 animate-fadeIn">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                    <span>Device node registered and tracking activated successfully!</span>
                  </div>
                )}

                <form id="register-device-form" onSubmit={handleRegisterDevice} className="space-y-4">
                  {/* STEP 1: HARDWARE & PRODUCT DETAILS */}
                  {registerStep === 'details' ? (
                    <motion.div
                      key="step-details"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      transition={{ duration: 0.2 }}
                      className="space-y-4"
                    >
                      {/* Device Code & Generation */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-[#07221A] uppercase block">
                          Device Code / Hardware Node ID
                        </label>
                        <div className="flex flex-col sm:flex-row gap-2">
                          <input
                            type="text"
                            required
                            value={regCode}
                            onChange={e => setRegCode(e.target.value)}
                            placeholder="e.g., YGS-FD-000125"
                            className="flex-1 border border-slate-200 px-3.5 py-2.5 rounded-xl text-sm font-mono font-bold text-[#07221A] focus:outline-none focus:border-[#20E79A] bg-white"
                          />
                          <button
                            type="button"
                            onClick={generateNewDeviceCode}
                            className="py-2.5 px-3.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-[#07221A] font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer border border-slate-200/80 transition-colors shrink-0 min-h-[44px]"
                          >
                            <RefreshCw className="w-3.5 h-3.5 text-slate-600" />
                            <span>Generate ID</span>
                          </button>
                        </div>
                      </div>

                      {/* Product Name Input & Quick Select Pills */}
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-[#07221A] uppercase block">
                          Product / Food Item to Monitor
                        </label>
                        <input
                          type="text"
                          required
                          value={regProduct}
                          onChange={e => setRegProduct(e.target.value)}
                          placeholder="e.g., Fresh Organic Milk, Roma Tomatoes, Atlantic Salmon, Baby Spinach..."
                          className="w-full border border-slate-200 px-3.5 py-2.5 rounded-xl text-sm font-bold text-[#07221A] focus:outline-none focus:border-[#20E79A] bg-white"
                        />

                        {/* Popular Food Presets for Instant 1-Click Setup */}
                        <div className="space-y-1.5 pt-1">
                          <span className="text-[10px] font-black uppercase text-[#5C7F75] block">Quick Presets (1-Click AI Research):</span>
                          <div className="flex flex-wrap gap-1.5">
                            {[
                              'Milk',
                              'Roma Tomatoes',
                              'Atlantic Salmon',
                              'Spinach',
                              'Strawberries',
                              'Cheddar Cheese',
                              'Chicken Breast',
                              'Apples'
                            ].map(food => (
                              <button
                                key={food}
                                type="button"
                                onClick={() => {
                                  setRegProduct(food);
                                  handleRunAIResearch(food);
                                }}
                                className={`px-2.5 py-1.5 rounded-xl text-[11px] font-bold cursor-pointer transition-all border ${
                                  regProduct.toLowerCase() === food.toLowerCase()
                                    ? 'bg-emerald-100 text-emerald-900 border-emerald-300 shadow-xs'
                                    : 'bg-white hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-300 border-slate-200 text-[#07221A]'
                                }`}
                              >
                                {food}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Facility / Storage Zone */}
                      <div>
                        <label className="text-xs font-bold text-[#07221A] uppercase block mb-1">
                          Storage Facility / Zone (Optional)
                        </label>
                        <input
                          type="text"
                          value={regLocation}
                          onChange={e => setRegLocation(e.target.value)}
                          placeholder="e.g., Central Cold Storage (Chamber A)"
                          className="w-full border border-slate-200 px-3.5 py-2.5 rounded-xl text-xs font-medium text-[#07221A] focus:outline-none focus:border-[#20E79A] bg-white"
                        />
                      </div>

                      {/* AI RESEARCH TRIGGER BUTTON */}
                      <div className="pt-2">
                        <motion.button
                          whileHover={{ scale: 1.01 }}
                          whileTap={{ scale: 0.99 }}
                          type="button"
                          onClick={async () => {
                            await handleRunAIResearch(regProduct, regCategory);
                            setRegisterStep('thresholds');
                          }}
                          disabled={isResearching || !regProduct.trim()}
                          className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-[#07221A] via-[#10B981] to-[#047857] text-white font-black text-xs shadow-md shadow-emerald-900/20 hover:brightness-110 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 transition-all min-h-[44px]"
                        >
                          {isResearching ? (
                            <>
                              <Loader2 className="w-4 h-4 animate-spin text-white" />
                              <span>Researching Post-Harvest Bounds with AI...</span>
                            </>
                          ) : (
                            <>
                              <Sparkles className="w-4 h-4 text-yellow-300 animate-pulse" />
                              <span>RESEARCH & AUTO-SET THRESHOLDS WITH AI</span>
                            </>
                          )}
                        </motion.button>
                      </div>

                      {researchError && (
                        <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-center gap-2">
                          <AlertTriangle className="w-4 h-4 shrink-0" />
                          <span>{researchError}</span>
                        </div>
                      )}

                      {/* Manual Next Button */}
                      <div className="pt-1 flex justify-end">
                        <button
                          type="button"
                          onClick={() => setRegisterStep('thresholds')}
                          className="text-xs font-black text-[#13493B] hover:text-[#20E79A] flex items-center gap-1 cursor-pointer py-1.5 px-2"
                        >
                          <span>Fine-tune Safety Thresholds</span>
                          <span>→</span>
                        </button>
                      </div>
                    </motion.div>
                  ) : (
                    /* STEP 2: AI DOSSIER & THRESHOLD CALIBRATION */
                    <motion.div
                      key="step-thresholds"
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 10 }}
                      transition={{ duration: 0.2 }}
                      className="space-y-4"
                    >
                      {/* AI DOSSIER FINDINGS CARD */}
                      {aiDossier ? (
                        <div className="p-4 rounded-2xl sm:rounded-3xl bg-gradient-to-br from-emerald-50/90 via-teal-50/40 to-white border border-emerald-200/80 shadow-xs space-y-3">
                          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-emerald-100 pb-2">
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-600 text-white text-[10px] font-black uppercase tracking-wider shadow-xs">
                              <Sparkles className="w-3 h-3 text-yellow-300" />
                              {aiDossier.provider === 'ai-gpt-oss-120b' || aiDossier.model === 'openai/gpt-oss-120b'
                                ? 'AI Model (GPT-OSS 120B)'
                                : 'Post-Harvest Research'}
                            </span>
                            <span className="text-[11px] font-bold text-emerald-800">
                              {regProduct || aiDossier.category}
                            </span>
                          </div>

                          {/* Highlights Grid */}
                          <div className="grid grid-cols-3 gap-2 text-center">
                            <div className="p-2.5 rounded-xl bg-white border border-emerald-100 shadow-xs">
                              <span className="text-[9px] font-bold text-slate-500 uppercase block truncate">Optimal</span>
                              <span className="text-xs font-black text-emerald-700">
                                {aiDossier.optimalTemp}°C / {aiDossier.optimalHumidity}%
                              </span>
                            </div>
                            <div className="p-2.5 rounded-xl bg-white border border-emerald-100 shadow-xs">
                              <span className="text-[9px] font-bold text-slate-500 uppercase block truncate">Shelf Life</span>
                              <span className="text-xs font-black text-emerald-700">
                                ~{aiDossier.shelfLifeDays} Days
                              </span>
                            </div>
                            <div className="p-2.5 rounded-xl bg-white border border-emerald-100 shadow-xs">
                              <span className="text-[9px] font-bold text-slate-500 uppercase block truncate">Ethylene</span>
                              <span className="text-xs font-black text-emerald-700 truncate block">
                                {aiDossier.ethyleneSensitivity}
                              </span>
                            </div>
                          </div>

                          {/* Scientific Rationale */}
                          <div className="text-xs text-[#07221A] leading-relaxed bg-white/80 p-3 rounded-xl border border-emerald-100/70">
                            <p className="font-semibold text-emerald-950 flex items-center gap-1">
                              <BookOpen className="w-3.5 h-3.5 text-emerald-600" />
                              <span>Scientific Rationale:</span>
                            </p>
                            <p className="mt-1 text-slate-700 text-[11px]">{aiDossier.scientificRationale}</p>
                          </div>
                        </div>
                      ) : (
                        <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between gap-3">
                          <div className="flex items-center gap-2">
                            <Info className="w-4 h-4 text-slate-500 shrink-0" />
                            <span className="text-xs text-slate-600 font-semibold">
                              Default standard food thresholds applied. Run AI research for custom bounds.
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRunAIResearch(regProduct)}
                            disabled={isResearching || !regProduct.trim()}
                            className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shrink-0 cursor-pointer disabled:opacity-50"
                          >
                            {isResearching ? 'Researching...' : 'Run AI'}
                          </button>
                        </div>
                      )}

                      {/* THRESHOLD VALUE INPUTS */}
                      <div className="space-y-3">
                        <div className="p-3.5 rounded-2xl bg-[#F4F7F6] border border-[#13493B]/10 space-y-2">
                          <h4 className="text-xs font-black text-[#07221A] uppercase tracking-wider flex items-center justify-between">
                            <span className="flex items-center gap-1.5">
                              <Thermometer className="w-4 h-4 text-[#FF5A67]" /> Temperature Safety Range (°C)
                            </span>
                          </h4>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                              <label className="text-[10px] font-bold text-[#5C7F75] uppercase block mb-1">Safe Min (°C)</label>
                              <input
                                type="number"
                                step="0.1"
                                required
                                value={regTempMin}
                                onChange={e => setRegTempMin(e.target.value === '' ? '' : Number(e.target.value))}
                                className="w-full bg-white border border-slate-200 px-3 py-2 rounded-xl text-xs font-bold text-[#07221A]"
                              />
                            </div>
                            <div>
                              <label className="text-[10px] font-bold text-[#5C7F75] uppercase block mb-1">Safe Max (°C)</label>
                              <input
                                type="number"
                                step="0.1"
                                required
                                value={regTempMax}
                                onChange={e => setRegTempMax(e.target.value === '' ? '' : Number(e.target.value))}
                                className="w-full bg-white border border-slate-200 px-3 py-2 rounded-xl text-xs font-bold text-[#07221A]"
                              />
                            </div>
                          </div>
                        </div>

                        <div className="p-3.5 rounded-2xl bg-[#F4F7F6] border border-[#13493B]/10 space-y-2">
                          <h4 className="text-xs font-black text-[#07221A] uppercase tracking-wider flex items-center justify-between">
                            <span className="flex items-center gap-1.5">
                              <Droplets className="w-4 h-4 text-blue-500" /> Relative Humidity Bounds (% RH)
                            </span>
                          </h4>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                              <label className="text-[10px] font-bold text-[#5C7F75] uppercase block mb-1">Min (% RH)</label>
                              <input
                                type="number"
                                required
                                value={regHumMin}
                                onChange={e => setRegHumMin(e.target.value === '' ? '' : Number(e.target.value))}
                                className="w-full bg-white border border-slate-200 px-3 py-2 rounded-xl text-xs font-bold text-[#07221A]"
                              />
                            </div>
                            <div>
                              <label className="text-[10px] font-bold text-[#5C7F75] uppercase block mb-1">Max (% RH)</label>
                              <input
                                type="number"
                                required
                                value={regHumMax}
                                onChange={e => setRegHumMax(e.target.value === '' ? '' : Number(e.target.value))}
                                className="w-full bg-white border border-slate-200 px-3 py-2 rounded-xl text-xs font-bold text-[#07221A]"
                              />
                            </div>
                          </div>
                        </div>

                        <div className="p-3.5 rounded-2xl bg-[#F4F7F6] border border-[#13493B]/10 space-y-2">
                          <h4 className="text-xs font-black text-[#07221A] uppercase tracking-wider flex items-center justify-between">
                            <span className="flex items-center gap-1.5">
                              <Wind className="w-4 h-4 text-purple-600" /> MQ-135 Gas Spoilage Threshold
                            </span>
                          </h4>
                          <div>
                            <label className="text-[10px] font-bold text-[#5C7F75] uppercase block mb-1">
                              Critical Spoilage Alert Limit (Raw Index / ppm)
                            </label>
                            <input
                              type="number"
                              required
                              value={regMqThreshold}
                              onChange={e => setRegMqThreshold(e.target.value === '' ? '' : Number(e.target.value))}
                              className="w-full bg-white border border-slate-200 px-3 py-2 rounded-xl text-xs font-bold text-[#07221A]"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Back Link */}
                      <div className="pt-1">
                        <button
                          type="button"
                          onClick={() => setRegisterStep('details')}
                          className="text-xs font-black text-[#13493B] hover:text-[#20E79A] flex items-center gap-1 cursor-pointer py-1.5 px-2"
                        >
                          <span>← Back to Device & Product Info</span>
                        </button>
                      </div>
                    </motion.div>
                  )}
                </form>
              </div>

              {/* Floating Window Fixed Action Footer */}
              <div className="shrink-0 px-4 py-3 sm:px-6 sm:py-4 border-t border-[#13493B]/10 bg-slate-50/95 backdrop-blur-md flex flex-col-reverse sm:flex-row items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsRegisterModalOpen(false)}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-100 cursor-pointer transition-colors text-center min-h-[44px]"
                >
                  Cancel
                </button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  form="register-device-form"
                  type="submit"
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#07221A] via-[#10B981] to-[#047857] hover:brightness-110 text-white font-black text-xs shadow-lg shadow-emerald-950/20 flex items-center justify-center gap-2 cursor-pointer transition-all min-h-[44px]"
                >
                  <Save className="w-4 h-4 text-[#20E79A]" />
                  <span>REGISTER NODE & AUTHORIZE TRACKING</span>
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

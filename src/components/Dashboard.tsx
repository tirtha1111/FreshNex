import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { 
  Bell, 
  QrCode, 
  Activity, 
  Clock, 
  FileText, 
  Camera, 
  ArrowRight, 
  Leaf, 
  Sparkles,
  ShieldCheck,
  ChevronRight,
  TrendingUp,
  Thermometer,
  Droplets,
  Wind,
  Plus,
  Compass,
  MessageSquare,
  HelpCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const Dashboard: React.FC = () => {
  const { userRecord, scanHistory, devicesMap } = useApp();
  const navigate = useNavigate();

  const userName = userRecord?.name?.split(' ')[0] || 'Alex';
  const latestScan = scanHistory && scanHistory.length > 0 ? scanHistory[0] : null;

  // Food Safety AI Assistant Q&A State
  const [activeQuestion, setActiveQuestion] = useState<string | null>(null);
  const [aiAnswer, setAiAnswer] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);

  const qaSuggestions = [
    {
      q: "How to prolong Strawberry shelf-life?",
      a: "Store strawberries unwashed in a single layer lined with paper towels in a shallow container. Wash them only right before eating. Ideal temperature: 0°C to 2°C with 90% humidity."
    },
    {
      q: "Is 12°C temperature safe for Milk?",
      a: "No, milk should always be stored below 4°C. At 12°C, bacterial growth accelerates rapidly, causing milk to spoil within hours. Ensure your dairy chiller is adjusted."
    },
    {
      q: "What is optimal Lettuce humidity?",
      a: "Leafy greens like Organic Lettuce thrive in high humidity (90% to 95%). Use a perforated storage container or wrapped damp cloth to maintain freshness."
    }
  ];

  const handleAskAi = (question: string, answer: string) => {
    setActiveQuestion(question);
    setIsAiLoading(true);
    setAiAnswer(null);
    setTimeout(() => {
      setAiAnswer(answer);
      setIsAiLoading(false);
    }, 600);
  };

  // Dynamic Fridge Inventory Items based on scanned products or default list
  const fridgeItems = [
    {
      id: 'YGS-FD-000124',
      name: 'Organic Lettuce',
      icon: '🥗',
      defaultTemp: 4.5,
      defaultHum: 85,
      defaultGas: 120,
      location: 'Cold Storage A'
    },
    {
      id: 'item-2',
      name: 'Strawberries',
      icon: '🍓',
      defaultTemp: 1.8,
      defaultHum: 90,
      defaultGas: 80,
      location: 'Cold Storage B'
    },
    {
      id: 'item-4',
      name: 'Fresh Milk',
      icon: '🥛',
      defaultTemp: 3.2,
      defaultHum: 62,
      defaultGas: 150,
      location: 'Dairy Chiller'
    }
  ];

  return (
    <div className="space-y-6 pb-8 select-none text-[#edeff2]">
      {/* Top Header Bar */}
      <div className="flex items-center justify-between pt-1">
        <div>
          <span className="text-[9px] font-black tracking-widest text-[#21c55d] uppercase bg-emerald-500/10 border border-[#21c55d]/20 px-2.5 py-1 rounded-full">
            IoT Freshness Hub
          </span>
          <h1 className="text-xl md:text-2xl font-black text-[#edeff2] tracking-tight mt-2.5">
            Welcome back, {userName}!
          </h1>
          <p className="text-xs font-semibold text-slate-400 mt-0.5">
            Pantry freshness index looks excellent today.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Bell with red notification badge */}
          <button
            onClick={() => navigate('/alerts')}
            className="w-10 h-10 rounded-2xl bg-[#141416] border border-white/5 text-slate-300 flex items-center justify-center relative shadow-xs hover:bg-[#141416]/80 hover:scale-105 active:scale-95 transition-all cursor-pointer"
          >
            <Bell className="w-5 h-5" />
            <span className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full bg-red-500 ring-2 ring-[#0b0b0c]" />
          </button>

          {/* User Profile Avatar circle */}
          <button
            onClick={() => navigate('/profile')}
            className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#1267D6] to-[#21c55d] text-white text-xs font-black flex items-center justify-center shadow-lg shadow-emerald-500/10 hover:scale-105 active:scale-95 transition-all cursor-pointer"
          >
            {userRecord?.name 
              ? userRecord.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() 
              : 'AJ'}
          </button>
        </div>
      </div>

      {/* Hero Banner Card */}
      <div className="relative w-full rounded-3xl bg-gradient-to-br from-[#141416] via-[#101012] to-[#0b0b0c] p-6 text-white shadow-xl border border-white/5 overflow-hidden">
        {/* Glowing background ambient lights */}
        <div className="absolute top-0 right-0 w-48 h-48 rounded-full bg-[#21c55d]/10 blur-3xl pointer-events-none animate-pulse" />
        <div className="absolute bottom-0 right-10 w-36 h-36 rounded-full bg-sky-400/5 blur-2xl pointer-events-none" />

        <div className="relative z-10 flex items-center justify-between">
          <div className="space-y-2 max-w-[210px]">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[8.5px] font-black uppercase tracking-widest bg-white/5 text-emerald-400 border border-white/10">
              <Leaf className="w-3.5 h-3.5 text-emerald-400 fill-emerald-400/20" />
              <span>Verified Harvest</span>
            </span>
            <h2 className="text-xl font-black leading-tight text-white pt-1">
              Smarter Storage.<br />Zero Waste.
            </h2>
            <p className="text-[11px] text-slate-300 font-semibold leading-relaxed">
              FreshNex combines custom ESP32 node arrays to track atmospheric safety indexes in real time.
            </p>
          </div>

          {/* Fresh vegetable crate visual mockup */}
          <div className="w-24 h-24 rounded-2xl bg-white/5 border border-white/10 p-2 flex flex-col items-center justify-center text-center shadow-inner relative shrink-0">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-[#21c55d] to-[#1267D6] flex items-center justify-center shadow-md mb-1.5">
              <Leaf className="w-5 h-5 text-white" />
            </div>
            <span className="text-[9px] font-extrabold text-[#21c55d] uppercase tracking-wider block">
              100% Secure
            </span>
          </div>
        </div>
      </div>

      {/* Quick Navigation grid */}
      <div className="grid grid-cols-2 gap-3.5">
        {/* 1. Live IoT Scanner */}
        <button
          onClick={() => navigate('/scan')}
          className="p-4 rounded-3xl bg-[#141416] border border-white/5 shadow-xs hover:border-[#21c55d]/30 hover:shadow-md transition-all text-left flex flex-col justify-between h-32 cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-[#21c55d] flex items-center justify-center group-hover:scale-105 transition-all">
            <QrCode className="w-5 h-5 stroke-[2.2px]" />
          </div>
          <div>
            <h3 className="text-xs font-black text-[#edeff2]">Scan Tag</h3>
            <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Deploy new QR / RFID</p>
          </div>
        </button>

        {/* 2. Primary Telemetry */}
        <button
          onClick={() => {
            const targetId = latestScan?.productId || 'YGS-FD-000124';
            navigate(`/products/${targetId}`);
          }}
          className="p-4 rounded-3xl bg-[#141416] border border-white/5 shadow-xs hover:border-[#21c55d]/30 hover:shadow-md transition-all text-left flex flex-col justify-between h-32 cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-[#21c55d] flex items-center justify-center group-hover:scale-105 transition-all">
            <Activity className="w-5 h-5 stroke-[2.2px]" />
          </div>
          <div>
            <h3 className="text-xs font-black text-[#edeff2]">Atmosphere</h3>
            <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Live sensor logs</p>
          </div>
        </button>
      </div>

      {/* VIRTUAL FRIDGE FRESHNESS TRACKER */}
      <div className="w-full rounded-3xl bg-[#141416] border border-white/5 p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xs font-black text-[#edeff2] uppercase tracking-wide flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#21c55d]" />
              <span>Active Freshness Tracker</span>
            </h3>
            <p className="text-[10px] text-slate-400 font-semibold">Real-time status of your food containers</p>
          </div>
          <span className="px-2.5 py-0.5 rounded-full text-[9px] font-black bg-emerald-500/10 text-[#21c55d] border border-emerald-500/20">
            {fridgeItems.length} Tracked
          </span>
        </div>

        {/* List of tracked items */}
        <div className="space-y-3">
          {fridgeItems.map((item) => {
            const liveDevice = devicesMap[item.id];
            const liveTemp = liveDevice ? liveDevice.temperature : item.defaultTemp;
            const liveHum = liveDevice ? liveDevice.humidity : item.defaultHum;
            const liveGas = liveDevice ? liveDevice.mq135_raw : item.defaultGas;

            let freshnessScore = 98;
            if (liveTemp > 8) freshnessScore -= (liveTemp - 8) * 10;
            if (liveGas > 1500) freshnessScore -= (liveGas - 1500) * 0.05;
            freshnessScore = Math.max(12, Math.min(100, Math.round(freshnessScore)));

            const isFresh = freshnessScore > 75;
            const isWarning = freshnessScore <= 75 && freshnessScore > 40;

            return (
              <div
                key={item.id}
                onClick={() => navigate(`/products/${item.id}`)}
                className="p-3.5 rounded-2xl bg-[#0b0b0c] border border-white/5 hover:border-[#21c55d]/40 hover:bg-[#0b0b0c]/80 transition-all flex items-center justify-between cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-xl shrink-0 group-hover:scale-105 transition-transform">
                    {item.icon}
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-[#edeff2] group-hover:text-[#21c55d] transition-colors">
                      {item.name}
                    </h4>
                    <div className="flex items-center gap-2 mt-1 text-[9px] font-bold text-slate-400">
                      <span className="flex items-center gap-0.5">
                        <Thermometer className="w-3 h-3 text-amber-500" />
                        <span>{liveTemp}°C</span>
                      </span>
                      <span className="flex items-center gap-0.5">
                        <Droplets className="w-3 h-3 text-sky-500" />
                        <span>{liveHum}%</span>
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3.5">
                  <div className="text-right">
                    <span className="text-[9px] font-extrabold text-slate-400 block">Freshness Index</span>
                    <div className="flex items-center gap-2 mt-0.5">
                      <div className="w-16 h-1.5 bg-white/10 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full transition-all duration-500 ${
                            isFresh ? 'bg-emerald-500' : isWarning ? 'bg-amber-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${freshnessScore}%` }}
                        />
                      </div>
                      <span className={`text-[10px] font-black ${
                        isFresh ? 'text-emerald-500' : isWarning ? 'text-amber-500' : 'text-red-500'
                      }`}>
                        {freshnessScore}%
                      </span>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* FOOD SAFETY AI ASSISTANT */}
      <div className="w-full rounded-3xl bg-[#141416] border border-white/5 p-5 shadow-xs space-y-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-[#21c55d]/10 text-[#21c55d] flex items-center justify-center border border-[#21c55d]/20">
            <Sparkles className="w-4 h-4 fill-[#21c55d]/20" />
          </div>
          <div>
            <h3 className="text-xs font-black text-[#edeff2] uppercase tracking-wide">Food Safety AI Guide</h3>
            <p className="text-[10px] text-slate-400 font-semibold">Instant scientific storage recommendations</p>
          </div>
        </div>

        {/* Suggestion Chips */}
        <div className="flex flex-wrap gap-2 pt-1">
          {qaSuggestions.map((item, idx) => (
            <button
              key={idx}
              onClick={() => handleAskAi(item.q, item.a)}
              className={`px-3 py-2 rounded-xl text-[10px] font-bold text-left transition-all border cursor-pointer ${
                activeQuestion === item.q 
                  ? 'bg-[#21c55d] text-[#0b0b0c] border-transparent shadow-md font-extrabold' 
                  : 'bg-white/5 text-slate-300 border-white/5 hover:border-white/10 hover:bg-white/10'
              }`}
            >
              {item.q}
            </button>
          ))}
        </div>

        {/* Output Screen */}
        <AnimatePresence mode="wait">
          {activeQuestion && (
            <motion.div
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              className="p-4 rounded-2xl bg-[#0b0b0c] border border-white/5 shadow-xs space-y-2"
            >
              <p className="text-[10px] font-black text-[#21c55d] uppercase tracking-wider flex items-center gap-1">
                <span>AI Guidance</span>
                <span className="w-1.5 h-1.5 rounded-full bg-white/10" />
                <span className="text-slate-400 normal-case font-bold">{activeQuestion}</span>
              </p>
              
              {isAiLoading ? (
                <div className="flex items-center gap-1.5 py-1 text-xs text-slate-400 font-semibold">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#21c55d] animate-bounce" />
                  <span className="w-1.5 h-1.5 rounded-full bg-[#21c55d] animate-bounce [animation-delay:0.2s]" />
                  <span className="w-1.5 h-1.5 rounded-full bg-[#21c55d] animate-bounce [animation-delay:0.4s]" />
                  <span>Analyzing food parameters...</span>
                </div>
              ) : (
                <p className="text-xs text-slate-300 font-semibold leading-relaxed">
                  {aiAnswer}
                </p>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Main Status / Scan Prompt Card */}
      <div className="w-full rounded-3xl bg-[#141416] border border-white/5 p-6 shadow-xs text-center flex flex-col items-center justify-center space-y-4">
        {/* Big Blue QR Code Circle with radial gradient */}
        <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-[#21c55d]">
          <QrCode className="w-8 h-8 stroke-[1.8px]" />
        </div>

        <div className="space-y-1 max-w-xs">
          <h3 className="text-xs font-black text-[#edeff2] uppercase tracking-wider">
            {latestScan ? 'Latest Registered Tag' : 'No Active Scans'}
          </h3>
          <p className="text-xs text-slate-400 font-semibold leading-relaxed">
            {latestScan 
              ? `${latestScan.productName || 'Organic Lettuce'} was loaded successfully from cold storage.` 
              : 'Deploy or scan a freshness tag to inspect temperature and gas curves.'}
          </p>
        </div>

        <button
          onClick={() => navigate('/scan')}
          className="w-full max-w-xs h-11 rounded-2xl font-black text-xs text-[#0b0b0c] bg-[#21c55d] shadow-lg shadow-emerald-500/10 hover:brightness-110 active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          <Camera className="w-4 h-4" />
          <span>Launch Scanner</span>
        </button>
      </div>
    </div>
  );
};

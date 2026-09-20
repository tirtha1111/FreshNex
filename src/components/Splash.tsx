import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ShieldCheck, 
  ArrowRight, 
  CheckCircle2, 
  Leaf, 
  Heart, 
  Globe, 
  QrCode, 
  Sparkles,
  Users
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface SplashProps {
  onFinish: (targetMode?: 'login' | 'signup') => void;
}

export const Splash: React.FC<SplashProps> = ({ onFinish }) => {
  // Screen 1: Splash/Onboarding (Dark Blue Earth)
  // Screen 2: Welcome/Landing (White card with Produce & Checkmarks)
  const [slide, setSlide] = useState<number>(0);
  const [isMobile, setIsMobile] = useState<boolean>(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Desktop automatic splash timer
  useEffect(() => {
    if (!isMobile) {
      const timer = setTimeout(() => {
        onFinish();
      }, 2200);
      return () => clearTimeout(timer);
    }
  }, [onFinish, isMobile]);

  if (!isMobile) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-gradient-to-br from-[#082A52] via-[#0D4180] to-[#1267D6] text-white overflow-hidden select-none">
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 0.35, scale: 1.2 }}
          transition={{ duration: 2, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }}
          className="absolute w-96 h-96 rounded-full bg-sky-400 blur-3xl pointer-events-none"
        />
        <div className="relative z-10 flex flex-col items-center text-center px-6 max-w-sm">
          <motion.div
            initial={{ scale: 0.5, opacity: 0, rotate: -20 }}
            animate={{ scale: 1, opacity: 1, rotate: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="relative mb-6"
          >
            <div className="w-24 h-24 rounded-3xl bg-white/10 backdrop-blur-2xl border border-white/20 flex items-center justify-center shadow-2xl shadow-sky-500/30">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#1267D6] to-[#2196F3] flex items-center justify-center text-white shadow-inner">
                <ShieldCheck className="w-10 h-10 text-white" />
              </div>
            </div>
            <motion.div 
              animate={{ scale: [1, 1.3, 1], opacity: [0.6, 0, 0.6] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="absolute inset-0 rounded-3xl border-2 border-sky-300 pointer-events-none"
            />
          </motion.div>
          <motion.h1
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="text-4xl font-black tracking-tight text-white mb-2"
          >
            Fresh<span className="text-sky-300">Nex</span>
          </motion.h1>
          <motion.p
            initial={{ y: 15, opacity: 0 }}
            animate={{ y: 0, opacity: 0.9 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="text-sm font-medium text-sky-100/90 tracking-wide mb-8"
          >
            Smarter Food. Safer Tomorrow.
          </motion.p>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="w-48 flex flex-col items-center gap-3"
          >
            <div className="w-full h-1.5 bg-white/20 rounded-full overflow-hidden backdrop-blur-md">
              <motion.div
                initial={{ width: "0%" }}
                animate={{ width: "100%" }}
                transition={{ duration: 1.8, ease: "easeInOut" }}
                className="h-full bg-gradient-to-r from-sky-300 via-white to-sky-400 rounded-full"
              />
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-[#082A52] text-white overflow-hidden select-none flex flex-col">
      <AnimatePresence mode="wait">
        {slide === 0 ? (
          // ==================== SCREEN 1: Splash / Onboarding ====================
          <motion.div
            key="screen1"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, x: -60 }}
            transition={{ duration: 0.4 }}
            className="flex-1 flex flex-col justify-between p-6 pt-10 pb-8 bg-gradient-to-b from-[#082A52] via-[#0A3B74] to-[#041B34] relative overflow-hidden"
            onClick={() => setSlide(1)}
          >
            {/* Background glowing orbs & stars */}
            <div className="absolute top-10 right-[-20%] w-80 h-80 rounded-full bg-[#1267D6]/25 blur-3xl pointer-events-none" />
            <div className="absolute bottom-20 left-[-20%] w-80 h-80 rounded-full bg-[#19A463]/20 blur-3xl pointer-events-none" />

            {/* Top FreshNex Logo */}
            <div className="flex flex-col items-center text-center mt-2 z-10">
              <div className="flex items-center gap-2 mb-1.5">
                {/* Twin leaf logo matching image */}
                <div className="flex items-center">
                  <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-[#2196F3] to-[#19A463] flex items-center justify-center shadow-lg shadow-emerald-500/20">
                    <Leaf className="w-4.5 h-4.5 text-white" />
                  </div>
                </div>
                <h1 className="text-2xl font-black text-white tracking-tight">
                  Fresh<span className="text-[#38BDF8]">Nex</span>
                </h1>
              </div>
              <p className="text-[10px] font-bold text-sky-200/80 uppercase tracking-widest">
                Smarter Food. Safer Tomorrow.
              </p>
            </div>

            {/* Central Earth & Sustainable Dome Visual */}
            <div className="flex-1 flex flex-col items-center justify-center my-4 relative z-10">
              <div className="relative w-64 h-64 rounded-full flex items-center justify-center">
                {/* Outer glowing atmosphere */}
                <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-[#1267D6]/40 via-[#19A463]/20 to-sky-300/30 blur-xl animate-pulse" />
                
                {/* Earth sphere illustration container */}
                <div className="w-56 h-56 rounded-full bg-gradient-to-b from-[#0F4C81] via-[#0B3C68] to-[#062444] border-2 border-sky-400/40 shadow-2xl relative overflow-hidden flex items-center justify-center p-4">
                  {/* Grid Lines */}
                  <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#ffffff_1.5px,transparent_1.5px)] [background-size:18px_18px]" />
                  
                  {/* Eco Dome Greenhouse & Globe */}
                  <div className="relative z-10 flex flex-col items-center justify-center text-center">
                    <div className="w-20 h-20 rounded-full bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center mb-2 shadow-inner">
                      <Globe className="w-12 h-12 text-[#38BDF8]" />
                    </div>
                    <span className="text-[10px] font-black uppercase text-emerald-400 tracking-widest">
                      REAL-TIME SENSING
                    </span>
                  </div>

                  {/* Floating leafy elements */}
                  <div className="absolute bottom-2 left-4 w-6 h-6 rounded-full bg-emerald-500/30 flex items-center justify-center">
                    <Leaf className="w-3.5 h-3.5 text-emerald-300" />
                  </div>
                  <div className="absolute top-4 right-4 w-5 h-5 rounded-full bg-sky-400/30 flex items-center justify-center">
                    <Sparkles className="w-3 h-3 text-sky-200" />
                  </div>
                </div>
              </div>
            </div>

            {/* Title & 4 Dots */}
            <div className="text-center space-y-5 z-10">
              <div className="space-y-1">
                <h2 className="text-base font-extrabold text-white leading-snug">
                  Real-time food insights<br />for a healthier, safer world.
                </h2>
              </div>

              {/* 4 Dots Pagination Indicator (matching screen 1 exactly) */}
              <div className="flex items-center justify-center gap-1.5">
                <span className="w-6 h-1.5 rounded-full bg-[#38BDF8] shadow-sm shadow-sky-400/50" />
                <span className="w-1.5 h-1.5 rounded-full bg-white/40" />
                <span className="w-1.5 h-1.5 rounded-full bg-white/40" />
                <span className="w-1.5 h-1.5 rounded-full bg-white/40" />
              </div>

              {/* Bottom tag and button */}
              <div className="space-y-3 pt-1">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSlide(1);
                  }}
                  className="w-full py-3.5 rounded-2xl font-black text-xs bg-gradient-to-r from-[#1267D6] to-[#2196F3] text-white shadow-lg shadow-sky-500/30 active:scale-[0.98] transition-transform flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>CONTINUE</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
                <p className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider">
                  A Healthier World Starts with Safer Food
                </p>
              </div>
            </div>
          </motion.div>
        ) : (
          // ==================== SCREEN 2: Welcome / Landing ====================
          <motion.div
            key="screen2"
            initial={{ opacity: 0, x: 60 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -60 }}
            transition={{ duration: 0.4 }}
            className="flex-1 flex flex-col justify-between p-6 pt-8 pb-6 bg-gradient-to-b from-[#F5F9FF] via-[#EAF4FF] to-[#D9ECFF] text-[#082A52] relative overflow-hidden"
          >
            {/* Ambient background decoration */}
            <div className="absolute top-[-10%] right-[-10%] w-72 h-72 rounded-full bg-[#1267D6]/10 blur-3xl pointer-events-none" />
            <div className="absolute bottom-[-10%] left-[-10%] w-72 h-72 rounded-full bg-[#19A463]/15 blur-3xl pointer-events-none" />

            {/* Top Logo */}
            <div className="flex flex-col items-center text-center z-10">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-[#1267D6] to-[#19A463] flex items-center justify-center text-white shadow-md">
                  <Leaf className="w-4 h-4 text-white" />
                </div>
                <h1 className="text-xl font-black text-[#082A52] tracking-tight">
                  Fresh<span className="text-[#1267D6]">Nex</span>
                </h1>
              </div>
              <span className="text-[9px] font-black text-[#1267D6] uppercase tracking-widest">
                REAL-TIME FOOD MONITORING
              </span>
            </div>

            {/* Main Headline & Description */}
            <div className="text-center space-y-1.5 z-10 mt-1">
              <h2 className="text-2xl font-black text-[#082A52] tracking-tight leading-tight">
                Scan Today.<br />Safer Tomorrow.
              </h2>
              <p className="text-[11px] text-slate-500 max-w-[240px] mx-auto font-semibold leading-relaxed">
                Real-time food freshness monitoring using QR/RFID scanning and live sensor data.
              </p>
            </div>

            {/* 3 Checkpoint Pills (matching screen 2) */}
            <div className="flex flex-col gap-2 max-w-[220px] mx-auto w-full z-10">
              <div className="flex items-center gap-2.5 text-xs font-black text-[#082A52]">
                <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center text-[#19A463] shrink-0">
                  <CheckCircle2 className="w-3.5 h-3.5 fill-[#19A463] text-white" />
                </div>
                <span>Safer Food</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs font-black text-[#082A52]">
                <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center text-[#19A463] shrink-0">
                  <CheckCircle2 className="w-3.5 h-3.5 fill-[#19A463] text-white" />
                </div>
                <span>Healthier People</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs font-black text-[#082A52]">
                <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center text-[#19A463] shrink-0">
                  <CheckCircle2 className="w-3.5 h-3.5 fill-[#19A463] text-white" />
                </div>
                <span>Sustainable Communities</span>
              </div>
            </div>

            {/* Crate with QR tag visual (matching screen 2 wooden crate) */}
            <div className="relative w-full max-w-[260px] mx-auto rounded-2xl bg-[#5d3a1a] border-2 border-amber-900/60 p-3 shadow-xl overflow-hidden z-10 flex items-center justify-between text-white">
              {/* Tomato & produce background simulation */}
              <div className="absolute inset-0 bg-gradient-to-r from-[#e11d48]/40 via-amber-700/60 to-[#5d3a1a]/90" />
              
              <div className="relative z-10 space-y-1">
                <span className="text-[8px] font-black uppercase tracking-widest text-amber-200 block">
                  PRODUCE TAG
                </span>
                <p className="text-xs font-black leading-tight text-white">
                  Good Food<br />Brighter Lives
                </p>
              </div>

              {/* QR Code Badge */}
              <div className="relative z-10 w-16 h-16 bg-white rounded-xl p-1 shadow-md flex items-center justify-center">
                <div className="w-full h-full bg-[#082A52] rounded-lg flex items-center justify-center text-white">
                  <QrCode className="w-9 h-9 text-white" />
                </div>
              </div>
            </div>

            {/* Action Buttons (Login -> and Sign Up) */}
            <div className="space-y-2.5 z-10">
              <button
                onClick={() => onFinish('login')}
                className="w-full h-12 rounded-2xl font-black text-xs text-white bg-gradient-to-r from-[#1267D6] to-[#2196F3] shadow-lg shadow-sky-500/20 flex items-center justify-center gap-2 active:scale-[0.98] transition-all cursor-pointer"
              >
                <span>Login →</span>
              </button>
              <button
                onClick={() => onFinish('signup')}
                className="w-full h-12 rounded-2xl font-black text-xs text-[#082A52] bg-white border border-slate-200 shadow-sm hover:bg-slate-50 active:scale-[0.98] transition-all cursor-pointer"
              >
                Sign Up
              </button>

              <p className="text-center text-[10px] text-slate-400 font-bold uppercase tracking-wider pt-1">
                Better Food. Brighter Communities.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

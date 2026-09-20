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
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#0b0b0c] text-[#edeff2] overflow-hidden select-none">
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 0.35, scale: 1.2 }}
          transition={{ duration: 2, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }}
          className="absolute w-96 h-96 rounded-full bg-[#21c55d]/10 blur-3xl pointer-events-none"
        />
        <div className="relative z-10 flex flex-col items-center text-center px-6 max-w-sm">
          <motion.div
            initial={{ scale: 0.5, opacity: 0, rotate: -20 }}
            animate={{ scale: 1, opacity: 1, rotate: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="relative mb-6"
          >
            <div className="w-24 h-24 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center shadow-2xl shadow-emerald-500/20">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#1267D6] to-[#21c55d] flex items-center justify-center text-white shadow-inner">
                <ShieldCheck className="w-10 h-10 text-white" />
              </div>
            </div>
            <motion.div 
              animate={{ scale: [1, 1.3, 1], opacity: [0.6, 0, 0.6] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="absolute inset-0 rounded-3xl border-2 border-emerald-400/40 pointer-events-none"
            />
          </motion.div>
          <motion.h1
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="text-4xl font-black tracking-tight text-white mb-2"
          >
            Fresh<span className="text-[#38bdf8]">Nex</span>
          </motion.h1>
          <motion.p
            initial={{ y: 15, opacity: 0 }}
            animate={{ y: 0, opacity: 0.9 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="text-sm font-medium text-slate-400 tracking-wide mb-8"
          >
            Smarter Food. Safer Tomorrow.
          </motion.p>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="w-48 flex flex-col items-center gap-3"
          >
            <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: "0%" }}
                animate={{ width: "100%" }}
                transition={{ duration: 1.8, ease: "easeInOut" }}
                className="h-full bg-gradient-to-r from-emerald-400 to-[#21c55d] rounded-full"
              />
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-[#0b0b0c] text-[#edeff2] overflow-hidden select-none flex flex-col">
      <AnimatePresence mode="wait">
        {slide === 0 ? (
          // ==================== SCREEN 1: Splash / Onboarding ====================
          <motion.div
            key="screen1"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, x: -60 }}
            transition={{ duration: 0.4 }}
            className="flex-1 flex flex-col justify-between p-6 pt-10 pb-8 bg-gradient-to-b from-[#0b0b0c] via-[#141416] to-[#0b0b0c] relative overflow-hidden"
            onClick={() => setSlide(1)}
          >
            {/* Background glowing orbs */}
            <div className="absolute top-10 right-[-20%] w-80 h-80 rounded-full bg-[#1267D6]/10 blur-3xl pointer-events-none" />
            <div className="absolute bottom-20 left-[-20%] w-80 h-80 rounded-full bg-[#21c55d]/10 blur-3xl pointer-events-none" />

            {/* Top FreshNex Logo */}
            <div className="flex flex-col items-center text-center mt-2 z-10">
              <div className="flex items-center gap-2.5 mb-1.5">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-[#1267D6] to-[#21c55d] flex items-center justify-center text-white shadow-lg shadow-emerald-500/10">
                  <Leaf className="w-4.5 h-4.5 text-white" />
                </div>
                <h1 className="text-2xl font-black text-white tracking-tight">
                  Fresh<span className="text-[#38bdf8]">Nex</span>
                </h1>
              </div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                Smarter Food. Safer Tomorrow.
              </p>
            </div>

            {/* Central Earth & Sustainable Dome Visual */}
            <div className="flex-1 flex flex-col items-center justify-center my-4 relative z-10">
              <div className="relative w-64 h-64 rounded-full flex items-center justify-center">
                {/* Outer glowing atmosphere */}
                <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-[#1267D6]/20 via-[#21c55d]/20 to-[#38bdf8]/10 blur-2xl animate-pulse" />
                
                {/* Earth sphere container */}
                <div className="w-56 h-56 rounded-full bg-[#141416] border-2 border-white/5 shadow-2xl relative overflow-hidden flex items-center justify-center p-4">
                  {/* Grid Lines */}
                  <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#ffffff_1.5px,transparent_1.5px)] [background-size:18px_18px]" />
                  
                  {/* Eco Dome Greenhouse & Globe */}
                  <div className="relative z-10 flex flex-col items-center justify-center text-center">
                    <div className="w-20 h-20 rounded-full bg-[#21c55d]/10 border border-[#21c55d]/20 flex items-center justify-center mb-2 shadow-inner">
                      <Globe className="w-12 h-12 text-[#38bdf8]" />
                    </div>
                    <span className="text-[10px] font-mono font-black uppercase text-[#21c55d] tracking-widest">
                      REAL-TIME SENSING
                    </span>
                  </div>

                  {/* Floating elements */}
                  <div className="absolute bottom-4 left-4 w-6 h-6 rounded-full bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                    <Leaf className="w-3.5 h-3.5 text-[#21c55d]" />
                  </div>
                  <div className="absolute top-4 right-4 w-5 h-5 rounded-full bg-sky-400/10 flex items-center justify-center border border-sky-400/20">
                    <Sparkles className="w-3 h-3 text-[#38bdf8]" />
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

              {/* 4 Dots Pagination Indicator */}
              <div className="flex items-center justify-center gap-1.5">
                <span className="w-6 h-1.5 rounded-full bg-[#21c55d] shadow-sm shadow-emerald-400/50" />
                <span className="w-1.5 h-1.5 rounded-full bg-white/20" />
                <span className="w-1.5 h-1.5 rounded-full bg-white/20" />
                <span className="w-1.5 h-1.5 rounded-full bg-white/20" />
              </div>

              {/* Bottom tag and button */}
              <div className="space-y-3 pt-1">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSlide(1);
                  }}
                  className="w-full py-4 rounded-2xl font-black text-xs bg-[#21c55d] text-[#0b0b0c] shadow-lg shadow-emerald-500/10 active:scale-[0.98] transition-transform flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>CONTINUE</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
                <p className="text-[10px] text-[#21c55d] font-bold uppercase tracking-wider">
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
            className="flex-1 flex flex-col justify-between p-6 pt-8 pb-6 bg-[#0b0b0c] relative overflow-hidden text-[#edeff2]"
          >
            {/* Ambient background decoration */}
            <div className="absolute top-[-10%] right-[-10%] w-72 h-72 rounded-full bg-[#1267D6]/5 blur-3xl pointer-events-none" />
            <div className="absolute bottom-[-10%] left-[-10%] w-72 h-72 rounded-full bg-[#21c55d]/5 blur-3xl pointer-events-none" />

            {/* Top Logo */}
            <div className="flex flex-col items-center text-center z-10">
              <div className="flex items-center gap-2.5 mb-1.5">
                <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-[#1267D6] to-[#21c55d] flex items-center justify-center text-white shadow-lg shadow-emerald-500/10">
                  <Leaf className="w-4.5 h-4.5 text-white" />
                </div>
                <h1 className="text-xl font-black text-[#edeff2] tracking-tight">
                  Fresh<span className="text-[#38bdf8]">Nex</span>
                </h1>
              </div>
              <span className="text-[9px] font-mono font-black text-[#21c55d] uppercase tracking-widest">
                REAL-TIME FOOD MONITORING
              </span>
            </div>

            {/* Main Headline & Description */}
            <div className="text-center space-y-1.5 z-10 mt-1">
              <h2 className="text-2xl font-black text-white tracking-tight leading-tight">
                Scan Today.<br />Safer Tomorrow.
              </h2>
              <p className="text-[11px] text-slate-400 max-w-[240px] mx-auto font-semibold leading-relaxed">
                Real-time food freshness monitoring using QR/RFID scanning and live sensor data.
              </p>
            </div>

            {/* 3 Checkpoint Pills */}
            <div className="flex flex-col gap-2.5 max-w-[220px] mx-auto w-full z-10">
              <div className="flex items-center gap-2.5 text-xs font-black text-slate-200">
                <div className="w-5 h-5 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-[#21c55d] shrink-0">
                  <CheckCircle2 className="w-3.5 h-3.5 fill-[#21c55d]/20 text-[#21c55d]" />
                </div>
                <span>Safer Food</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs font-black text-slate-200">
                <div className="w-5 h-5 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-[#21c55d] shrink-0">
                  <CheckCircle2 className="w-3.5 h-3.5 fill-[#21c55d]/20 text-[#21c55d]" />
                </div>
                <span>Healthier People</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs font-black text-slate-200">
                <div className="w-5 h-5 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-[#21c55d] shrink-0">
                  <CheckCircle2 className="w-3.5 h-3.5 fill-[#21c55d]/20 text-[#21c55d]" />
                </div>
                <span>Sustainable Communities</span>
              </div>
            </div>

            {/* Wooden crate with QR tag visual */}
            <div className="relative w-full max-w-[260px] mx-auto rounded-3xl bg-[#141416] border border-white/5 p-4 shadow-2xl overflow-hidden z-10 flex items-center justify-between text-white">
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 to-[#141416]/50" />
              
              <div className="relative z-10 space-y-1">
                <span className="text-[8px] font-mono font-black uppercase tracking-widest text-[#21c55d] block">
                  PRODUCE TAG
                </span>
                <p className="text-xs font-black leading-tight text-white">
                  Good Food<br />Brighter Lives
                </p>
              </div>

              {/* QR Code Badge */}
              <div className="relative z-10 w-14 h-14 bg-white/5 border border-white/10 rounded-2xl p-1 shadow-md flex items-center justify-center">
                <div className="w-full h-full bg-[#0b0b0c] rounded-xl flex items-center justify-center text-[#21c55d]">
                  <QrCode className="w-7 h-7 text-[#21c55d]" />
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3 z-10">
              <button
                onClick={() => onFinish('login')}
                className="w-full h-12 rounded-2xl font-black text-xs text-[#0b0b0c] bg-[#21c55d] shadow-lg shadow-emerald-500/10 flex items-center justify-center gap-2 active:scale-[0.98] transition-all cursor-pointer"
              >
                <span>Login →</span>
              </button>
              <button
                onClick={() => onFinish('signup')}
                className="w-full h-12 rounded-2xl font-black text-xs text-white bg-white/5 border border-white/10 shadow-sm hover:bg-white/10 active:scale-[0.98] transition-all cursor-pointer"
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

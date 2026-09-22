import React, { useEffect } from 'react';
import { motion } from 'motion/react';
import { Cpu } from 'lucide-react';
import { FreshNexEmblem } from './common/FreshNexEmblem';

interface SplashProps {
  onFinish: () => void;
}

export const Splash: React.FC<SplashProps> = ({ onFinish }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onFinish();
    }, 2400);
    return () => clearTimeout(timer);
  }, [onFinish]);

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-gradient-to-br from-[#041712] via-[#07221A] to-[#020D0A] text-[#FDF8F5] overflow-hidden select-none">
      {/* Background Animated Emerald Glow Orb */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: [0.25, 0.45, 0.25], scale: [1, 1.25, 1] }}
        transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
        className="absolute w-[500px] h-[500px] rounded-full bg-[#22C55E]/20 blur-3xl pointer-events-none"
      />

      <div className="relative z-10 flex flex-col items-center text-center px-6 max-w-sm">
        {/* Animated Brand Logo Emblem */}
        <motion.div
          initial={{ scale: 0.6, opacity: 0, y: -20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          className="relative mb-6"
        >
          {/* Backing glassy glow container */}
          <div className="w-28 h-28 rounded-3xl bg-gradient-to-tr from-[#13493B]/40 to-[#22C55E]/10 backdrop-blur-2xl border border-[#22C55E]/30 flex items-center justify-center shadow-2xl shadow-[#22C55E]/20">
            <FreshNexEmblem size={64} animated={true} withGlow={true} />
          </div>

          {/* Micro pulsing ring */}
          <motion.div 
            animate={{ scale: [1, 1.35, 1], opacity: [0.5, 0, 0.5] }}
            transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
            className="absolute inset-0 rounded-3xl border-2 border-[#4ADE80]/30 pointer-events-none"
          />
        </motion.div>

        {/* Brand Name */}
        <motion.h1
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.25 }}
          className="text-4xl font-black tracking-tight text-white mb-2 flex items-center justify-center"
        >
          <span>Fresh</span>
          <span className="bg-gradient-to-r from-[#22C55E] via-[#34D399] to-[#4ADE80] bg-clip-text text-transparent ml-0.5">Nex</span>
          <span className="text-xs font-bold text-[#22C55E] -mt-4 ml-0.5">™</span>
        </motion.h1>

        {/* Tagline */}
        <motion.p
          initial={{ y: 15, opacity: 0 }}
          animate={{ y: 0, opacity: 0.9 }}
          transition={{ duration: 0.6, delay: 0.45 }}
          className="text-sm font-medium text-[#A7F3D0] tracking-wide mb-8"
        >
          Track Freshness. Trust Every Bite.
        </motion.p>

        {/* Progress Bar & IoT Badge */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.65 }}
          className="w-52 flex flex-col items-center gap-3"
        >
          <div className="w-full h-1.5 bg-[#13493B]/60 rounded-full overflow-hidden backdrop-blur-md border border-[#22C55E]/20">
            <motion.div
              initial={{ width: "0%" }}
              animate={{ width: "100%" }}
              transition={{ duration: 2.2, ease: "easeInOut" }}
              className="h-full bg-gradient-to-r from-[#15803D] via-[#22C55E] to-[#4ADE80] rounded-full shadow-[0_0_12px_#22C55E]"
            />
          </div>
          <div className="flex items-center gap-1.5 text-xs text-[#86EFAC] font-medium">
            <Cpu className="w-3.5 h-3.5 text-[#22C55E] animate-pulse" />
            <span>Connecting IoT Telemetry...</span>
          </div>
        </motion.div>
      </div>

      {/* Footer Branding */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.7 }}
        transition={{ delay: 0.9 }}
        className="absolute bottom-6 text-center text-xs text-[#6EE7B7]/70 font-medium tracking-wider uppercase"
      >
        Smart RFID & ESP32 Platform
      </motion.div>
    </div>
  );
};

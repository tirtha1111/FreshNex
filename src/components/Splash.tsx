import React, { useEffect } from 'react';
import { motion } from 'motion/react';
import { ShieldCheck, Cpu } from 'lucide-react';

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
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-gradient-to-br from-[#120A06] via-[#1E1109] to-[#0A0604] text-[#FDF8F5] overflow-hidden select-none">
      {/* Background Animated Glow Orb */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 0.35, scale: 1.2 }}
        transition={{ duration: 2, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }}
        className="absolute w-96 h-96 rounded-full bg-[#FF6A00] blur-3xl pointer-events-none"
      />

      <div className="relative z-10 flex flex-col items-center text-center px-6 max-w-sm">
        {/* Animated Brand Logo Icon */}
        <motion.div
          initial={{ scale: 0.5, opacity: 0, rotate: -20 }}
          animate={{ scale: 1, opacity: 1, rotate: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="relative mb-6"
        >
          <div className="w-24 h-24 rounded-3xl bg-gradient-to-tr from-[#FF6A00]/20 to-[#FFAA00]/10 backdrop-blur-2xl border border-[#FF6A00]/30 flex items-center justify-center shadow-2xl shadow-[#FF6A00]/40">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#FF6A00] to-[#FFAA00] flex items-center justify-center text-white shadow-inner">
              <ShieldCheck className="w-10 h-10 text-white" />
            </div>
          </div>
          {/* Micro pulsing ring */}
          <motion.div 
            animate={{ scale: [1, 1.3, 1], opacity: [0.6, 0, 0.6] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="absolute inset-0 rounded-3xl border-2 border-[#FFAA00]/40 pointer-events-none"
          />
        </motion.div>

        {/* Brand Name */}
        <motion.h1
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="text-4xl font-black tracking-tight text-[#FDF8F5] mb-2"
        >
          Fresh<span className="text-[#FFAA00]">Nex</span>
        </motion.h1>

        {/* Tagline */}
        <motion.p
          initial={{ y: 15, opacity: 0 }}
          animate={{ y: 0, opacity: 0.9 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="text-sm font-medium text-[#D6C8C0] tracking-wide mb-8"
        >
          Track Freshness. Trust Every Bite.
        </motion.p>

        {/* Progress Bar & IoT Badge */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="w-48 flex flex-col items-center gap-3"
        >
          <div className="w-full h-1.5 bg-[#FF6A00]/20 rounded-full overflow-hidden backdrop-blur-md">
            <motion.div
              initial={{ width: "0%" }}
              animate={{ width: "100%" }}
              transition={{ duration: 2, ease: "easeInOut" }}
              className="h-full bg-gradient-to-r from-[#FF6A00] via-[#FFAA00] to-[#FF4500] rounded-full"
            />
          </div>
          <div className="flex items-center gap-1.5 text-xs text-[#FFAA00] font-medium">
            <Cpu className="w-3.5 h-3.5 text-[#FFAA00] animate-pulse" />
            <span>Connecting IoT Telemetry...</span>
          </div>
        </motion.div>
      </div>

      {/* Footer Branding */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.6 }}
        transition={{ delay: 1 }}
        className="absolute bottom-6 text-center text-xs text-[#8C7A70] font-medium tracking-wider uppercase"
      >
        Smart RFID & ESP32 Platform
      </motion.div>
    </div>
  );
};

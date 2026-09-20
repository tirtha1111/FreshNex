import React from 'react';
import { motion } from 'motion/react';

export const AnimatedBackground: React.FC = () => {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0 select-none">
      {/* Ambient Radial Glow Orbs */}
      <motion.div
        animate={{
          x: [0, 40, -30, 0],
          y: [0, -30, 20, 0],
          scale: [1, 1.15, 0.95, 1],
          opacity: [0.15, 0.25, 0.18, 0.15],
        }}
        transition={{
          duration: 18,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-[#FF6A00] blur-[120px]"
      />

      <motion.div
        animate={{
          x: [0, -50, 30, 0],
          y: [0, 40, -30, 0],
          scale: [1, 1.2, 0.9, 1],
          opacity: [0.12, 0.22, 0.15, 0.12],
        }}
        transition={{
          duration: 22,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: 2,
        }}
        className="absolute top-1/3 -right-32 w-[28rem] h-[28rem] rounded-full bg-[#FFAA00] blur-[140px]"
      />

      <motion.div
        animate={{
          x: [0, 30, -40, 0],
          y: [0, -40, 30, 0],
          scale: [0.9, 1.1, 1, 0.9],
          opacity: [0.08, 0.18, 0.12, 0.08],
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: 4,
        }}
        className="absolute -bottom-40 left-1/4 w-[32rem] h-[32rem] rounded-full bg-[#FF3D00] blur-[150px]"
      />

      {/* Subtle Matrix Micro-Grid Lines */}
      <div 
        className="absolute inset-0 opacity-[0.035]"
        style={{
          backgroundImage: `radial-gradient(rgba(255, 170, 0, 0.6) 1px, transparent 1px)`,
          backgroundSize: '32px 32px'
        }}
      />
    </div>
  );
};

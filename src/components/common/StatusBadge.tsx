import React from 'react';
import { motion } from 'motion/react';

export interface StatusBadgeProps {
  status: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className = '', size = 'md' }) => {
  const norm = status.trim().toLowerCase();

  let colorClasses = 'bg-[#20E79A]/15 text-[#20E79A] border-[#20E79A]/30 shadow-[0_0_12px_rgba(32,231,154,0.15)]';
  let dotColor = 'bg-[#20E79A]';

  if (norm === 'fresh' || norm === 'normal' || norm === 'optimal' || norm === 'excellent') {
    colorClasses = 'bg-[#20E79A]/15 text-[#20E79A] border-[#20E79A]/30 shadow-[0_0_12px_rgba(32,231,154,0.15)]';
    dotColor = 'bg-[#20E79A]';
  } else if (norm === 'good') {
    colorClasses = 'bg-[#FFAA00]/15 text-[#FFAA00] border-[#FFAA00]/30 shadow-[0_0_12px_rgba(255,170,0,0.15)]';
    dotColor = 'bg-[#FFAA00]';
  } else if (norm === 'warning' || norm === 'fair') {
    colorClasses = 'bg-[#FF8A3D]/15 text-[#FF8A3D] border-[#FF8A3D]/30 shadow-[0_0_12px_rgba(255,138,61,0.2)]';
    dotColor = 'bg-[#FF8A3D]';
  } else if (norm === 'at risk' || norm === 'atrisk') {
    colorClasses = 'bg-[#FF6A00]/20 text-[#FF6A00] border-[#FF6A00]/40 shadow-[0_0_15px_rgba(255,106,0,0.25)]';
    dotColor = 'bg-[#FF6A00]';
  } else if (norm === 'expired' || norm === 'critical' || norm === 'unsafe') {
    colorClasses = 'bg-[#FF5A67]/20 text-[#FF5A67] border-[#FF5A67]/40 shadow-[0_0_15px_rgba(255,90,103,0.3)]';
    dotColor = 'bg-[#FF5A67]';
  } else {
    colorClasses = 'bg-[#3D261A]/50 text-[#B8A89E] border-[#3D261A]';
    dotColor = 'bg-[#8C7A70]';
  }

  const sizeClasses = {
    sm: 'text-[10px] px-2.5 py-0.5 font-bold gap-1.5',
    md: 'text-xs px-3 py-1 font-bold gap-2',
    lg: 'text-sm px-4 py-1.5 font-extrabold gap-2',
  };

  return (
    <motion.span
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.2 }}
      className={`inline-flex items-center justify-center rounded-full border tracking-wide select-none ${colorClasses} ${sizeClasses[size]} ${className}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${dotColor} animate-pulse`} />
      <span>{status}</span>
    </motion.span>
  );
};

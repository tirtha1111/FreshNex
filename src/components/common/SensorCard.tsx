import React from 'react';
import { motion } from 'motion/react';
import { StatusBadge } from './StatusBadge';
import { Activity } from 'lucide-react';

interface SensorCardProps {
  title: string;
  value: string | number;
  unit?: string;
  status?: string;
  icon: React.ReactNode;
  iconBgColor?: string;
  iconColor?: string;
  isEmpty?: boolean;
  className?: string;
}

export const SensorCard: React.FC<SensorCardProps> = ({
  title,
  value,
  unit,
  status,
  icon,
  iconBgColor = 'bg-[#FF6A00]/15',
  iconColor = 'text-[#FF6A00]',
  isEmpty = false,
  className = '',
}) => {
  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.02 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      className={`card-solid p-5 flex flex-col justify-between transition-all duration-300 relative overflow-hidden group shadow-lg ${className}`}
    >
      {/* Subtle top edge glow on hover */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#FF6A00]/0 to-transparent group-hover:via-[#FF6A00]/60 transition-all duration-300" />

      <div className="flex items-center justify-between gap-3 mb-3">
        <div className="flex items-center gap-2.5">
          <motion.div
            whileHover={{ rotate: 8, scale: 1.1 }}
            className={`w-10 h-10 rounded-xl flex items-center justify-center ${iconBgColor} ${iconColor} border border-[#3D261A]/70 shadow-sm`}
          >
            {icon}
          </motion.div>
          <span className="text-xs font-bold text-[#B8A89E] tracking-wide">
            {title}
          </span>
        </div>
        {status && !isEmpty && (
          <StatusBadge status={status} size="sm" />
        )}
      </div>

      <div className="flex items-baseline justify-between mt-2">
        <div className="flex items-baseline gap-1.5">
          <motion.span 
            key={String(value)}
            initial={{ opacity: 0.6, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.25 }}
            className="text-2xl sm:text-3xl font-black text-[#FDF8F5] tracking-tight"
          >
            {isEmpty ? '--' : value}
          </motion.span>
          {unit && (
            <span className="text-sm font-bold text-[#8C7A70]">
              {unit}
            </span>
          )}
        </div>
        {isEmpty ? (
          <span className="text-[11px] font-medium text-[#8C7A70] flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[#8C7A70]" />
            Awaiting scan
          </span>
        ) : (
          <span className="text-[10px] font-bold text-[#20E79A] flex items-center gap-1 bg-[#20E79A]/10 px-2 py-0.5 rounded-full border border-[#20E79A]/20">
            <span className="w-1.5 h-1.5 rounded-full bg-[#20E79A] animate-ping" />
            Live
          </span>
        )}
      </div>
    </motion.div>
  );
};

import React from 'react';
import { motion } from 'motion/react';
import { StatusBadge } from './StatusBadge';

interface SensorCardProps {
  title: string;
  value: string | number;
  unit?: string;
  status?: string;
  icon: any; // Allow both elements and component types
  color?: string; // Hex color for metrics
  iconBgColor?: string;
  iconColor?: string;
  isEmpty?: boolean;
  className?: string;
  message?: string;
}

export const SensorCard: React.FC<SensorCardProps> = ({
  title,
  value,
  unit,
  status,
  icon,
  color,
  iconBgColor = 'bg-[#20E79A]/10',
  iconColor = 'text-[#20E79A]',
  isEmpty = false,
  className = '',
  message,
}) => {
  // Gracefully handle icon if passed as a Component rather than an Element
  const IconComponent = typeof icon === 'function' || (icon && typeof icon === 'object' && 'render' in icon)
    ? icon as React.ComponentType<any>
    : null;

  // Compute elegant custom color tokens for light mode
  const customIconStyle = color ? { color: color } : {};
  const customIconBgStyle = color ? { backgroundColor: `${color}14`, borderColor: `${color}25` } : {};
  const hoverTopBorderColor = color ? color : '#20E79A';

  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.02 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      className={`bg-white border border-[#13493B]/10 rounded-[24px] p-5 flex flex-col justify-between transition-all duration-300 relative overflow-hidden group shadow-sm ${className}`}
    >
      {/* Subtle top edge glow on hover */}
      <div 
        className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-transparent to-transparent group-hover:via-current transition-all duration-300"
        style={{ color: hoverTopBorderColor }}
      />

      <div className="flex items-center justify-between gap-3 mb-3">
        <div className="flex items-center gap-2.5">
          <motion.div
            whileHover={{ rotate: 8, scale: 1.1 }}
            className={`w-10 h-10 rounded-xl flex items-center justify-center ${color ? '' : iconBgColor} ${color ? '' : iconColor} border ${color ? '' : 'border-[#13493B]/10'} shadow-sm`}
            style={customIconBgStyle}
          >
            {IconComponent ? <IconComponent className="w-5 h-5" style={customIconStyle} /> : icon}
          </motion.div>
          <span className="text-xs font-bold text-[#5C7F75] tracking-wide">
            {title}
          </span>
        </div>
        {status && !isEmpty && (
          <StatusBadge status={status} size="sm" />
        )}
      </div>

      <div className="flex flex-col mt-1">
        <div className="flex items-baseline gap-1.5">
          <motion.span 
            key={String(value)}
            initial={{ opacity: 0.6, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.25 }}
            className="text-2xl sm:text-3xl font-black text-[#07221A] tracking-tight"
          >
            {isEmpty ? '--' : value}
          </motion.span>
          {unit && (
            <span className="text-sm font-bold text-[#5C7F75]">
              {unit}
            </span>
          )}
        </div>

        {/* Message / Status footer */}
        <div className="flex items-center justify-between mt-2.5 pt-2 border-t border-[#F4F7F6]">
          <span className="text-[10px] font-bold text-[#5C7F75] truncate max-w-[150px]">
            {message || (isEmpty ? 'Awaiting connection' : 'Sensor Active')}
          </span>
          {isEmpty ? (
            <span className="text-[11px] font-medium text-[#5C7F75] flex items-center gap-1 shrink-0">
              <span className="w-1.5 h-1.5 rounded-full bg-[#5C7F75]" />
              Offline
            </span>
          ) : (
            <span className="text-[10px] font-bold text-[#20E79A] flex items-center gap-1 bg-[#20E79A]/10 px-2 py-0.5 rounded-full border border-[#20E79A]/20 shrink-0">
              <span className="w-1.5 h-1.5 rounded-full bg-[#20E79A] animate-ping" />
              Live
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
};

import React from 'react';
import { motion } from 'motion/react';

interface FreshnessGaugeProps {
  score: number;
  label?: string;
  qualityLabel?: string;
  size?: number;
}

export const FreshnessGauge: React.FC<FreshnessGaugeProps> = ({
  score = 92,
  label = 'Freshness Score',
  qualityLabel = 'Excellent',
  size = 130,
}) => {
  const strokeWidth = 8;
  const radius = (size - strokeWidth * 2) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  let strokeColor = '#20E79A'; // fresh green
  if (score < 35) strokeColor = '#FF5A67';
  else if (score < 55) strokeColor = '#FF8A3D';
  else if (score < 75) strokeColor = '#F5B942';
  else if (score < 90) strokeColor = '#FF6A00';

  return (
    <div className="flex flex-col items-center justify-center select-none text-center">
      <span className="text-[11px] font-medium text-[#B8A89E] mb-1.5 uppercase tracking-wider">
        {label}
      </span>
      <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="rotate-[-90deg]">
          {/* Background Track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#3D261A"
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          {/* Animated Value Arc */}
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            fill="transparent"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
          />
        </svg>

        {/* Center Metric */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.span
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-2xl sm:text-3xl font-extrabold text-[#FDF8F5] tracking-tight"
          >
            {score}%
          </motion.span>
          <span
            className="text-[11px] font-semibold mt-0.5 tracking-wide"
            style={{ color: strokeColor }}
          >
            {qualityLabel}
          </span>
        </div>
      </div>
    </div>
  );
};

import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  linkTo?: string;
}

export const Logo: React.FC<LogoProps> = ({ className = '', size = 'md', linkTo = '/' }) => {
  const iconSizes = {
    sm: 'w-7 h-7',
    md: 'w-9 h-9',
    lg: 'w-11 h-11',
  };

  const textSizes = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl',
  };

  const content = (
    <motion.div 
      whileHover={{ scale: 1.04 }}
      whileTap={{ scale: 0.96 }}
      transition={{ type: 'spring', stiffness: 400, damping: 20 }}
      className={`flex items-center gap-2.5 font-bold tracking-tight select-none ${className}`}
    >
      {/* Precision Leaf/Sprout Emblem */}
      <div className={`relative flex items-center justify-center rounded-xl bg-gradient-to-br from-[#3B82F6]/25 to-[#4ADE80]/10 border border-[#3B82F6]/40 p-1.5 shadow-[0_0_20px_rgba(74,222,128,0.3)] ${iconSizes[size]}`}>
        <svg
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full text-[#4ADE80]"
        >
          {/* Leaf Infinity Emblem resembling the uploaded logo */}
          <path
            d="M2.5 12C2.5 8.5 5.5 6.5 8 8C10.5 9.5 13.5 14.5 16 16C18.5 17.5 21.5 15.5 21.5 12C21.5 8.5 18.5 6.5 16 8C13.5 9.5 10.5 14.5 8 16C5.5 17.5 2.5 15.5 2.5 12Z"
            stroke="#3B82F6"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M16 8C18 5 21 6 22 9C20 11 17 10 16 8Z"
            fill="#4ADE80"
          />
          <path
            d="M17.5 11.5C19.5 9.5 21.5 10.5 22 13C20 14.5 18.5 13.5 17.5 11.5Z"
            fill="#22C55E"
          />
        </svg>
      </div>

      {/* Brand Typography */}
      <div className={`flex items-center tracking-tight font-extrabold ${textSizes[size]}`}>
        <span className="text-[#F8FAFC]">Fresh</span>
        <span className="text-[#4ADE80] drop-shadow-[0_0_12px_rgba(74,222,128,0.4)]">Nex</span>
      </div>
    </motion.div>
  );

  if (linkTo) {
    return (
      <Link to={linkTo} className="inline-block focus:outline-none focus-visible:ring-2 focus-visible:ring-[#4ADE80] rounded-xl">
        {content}
      </Link>
    );
  }

  return content;
};

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
      <div className={`relative flex items-center justify-center rounded-xl bg-gradient-to-br from-[#FF6A00]/25 to-[#FFAA00]/10 border border-[#FF6A00]/40 p-1.5 shadow-[0_0_20px_rgba(255,106,0,0.3)] ${iconSizes[size]}`}>
        <svg
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full text-[#FF6A00]"
        >
          <path
            d="M12 2C7.5 2 3.8 5.7 3.8 10.2C3.8 15.5 8.5 19.5 12 22C15.5 19.5 20.2 15.5 20.2 10.2C20.2 5.7 16.5 2 12 2Z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="rgba(255, 106, 0, 0.15)"
          />
          <path
            d="M12 22V10M12 10C10 8 7 8 7 8M12 14C14 12 17 12 17 12"
            stroke="#FFAA00"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      </div>

      {/* Brand Typography */}
      <div className={`flex items-center tracking-tight font-extrabold ${textSizes[size]}`}>
        <span className="text-[#FDF8F5]">Fresh</span>
        <span className="text-[#FF6A00] drop-shadow-[0_0_12px_rgba(255,106,0,0.4)]">Nex</span>
      </div>
    </motion.div>
  );

  if (linkTo) {
    return (
      <Link to={linkTo} className="inline-block focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6A00] rounded-xl">
        {content}
      </Link>
    );
  }

  return content;
};

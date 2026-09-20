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
    md: 'text-[22px]',
    lg: 'text-2xl',
  };

  const content = (
    <div className={`flex flex-col select-none ${className}`}>
      <div className="flex items-center gap-2">
        {/* Precision Twin Leaves Logo Emblem exactly copying the image */}
        <div className="flex items-center justify-center shrink-0">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-10 h-10 text-[#20E79A]"
          >
            {/* Left Leaf */}
            <path
              d="M11.5 2C11.5 2 6 5.5 4.5 10C3.3 13.6 4.8 17 8 18.5C9.5 16.5 10 13.5 10.5 10C11 6.5 11.5 2 11.5 2Z"
              fill="currentColor"
            />
            {/* Right smaller Leaf */}
            <path
              d="M18.5 7.5C18.5 7.5 14.5 10 13.5 13.5C12.7 16.2 13.7 19 16 20C17 18.5 17.5 16 18 13.5C18.5 11 18.5 7.5 18.5 7.5Z"
              fill="currentColor"
              fillOpacity="0.85"
            />
          </svg>
        </div>

        {/* Brand Typography */}
        <div className={`tracking-tight font-black font-sans flex items-center ${textSizes[size]}`}>
          <span className="text-white">Fresh</span>
          <span className="text-[#20E79A]">Nex</span>
        </div>
      </div>
      
      {/* Subtitle exact copy from the image */}
      <span className="text-[10px] text-[#20E79A]/80 font-medium tracking-wide mt-1 pl-1 font-sans">
        Track Freshness. Trust Every Bite.
      </span>
    </div>
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

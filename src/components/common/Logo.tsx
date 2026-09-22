import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { FreshNexEmblem } from './FreshNexEmblem';

export interface LogoProps {
  className?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  linkTo?: string | null;
  animated?: boolean;
  variant?: 'light' | 'dark' | 'auto';
  showTagline?: boolean;
  orientation?: 'horizontal' | 'vertical';
}

export const Logo: React.FC<LogoProps> = ({
  className = '',
  size = 'md',
  linkTo = '/',
  animated = true,
  variant = 'auto',
  showTagline = false,
  orientation = 'horizontal',
}) => {
  // Size mapping for typography and proportions
  const textSizes: Record<string, string> = {
    xs: 'text-xs sm:text-sm',
    sm: 'text-sm sm:text-base',
    md: 'text-lg sm:text-xl',
    lg: 'text-xl sm:text-2xl',
    xl: 'text-2xl sm:text-3xl',
    '2xl': 'text-3xl sm:text-4xl',
  };

  const taglineSizes: Record<string, string> = {
    xs: 'text-[7px]',
    sm: 'text-[8px]',
    md: 'text-[9px] sm:text-[10px]',
    lg: 'text-[10px] sm:text-[11px]',
    xl: 'text-xs',
    '2xl': 'text-sm',
  };

  const gapSizes: Record<string, string> = {
    xs: 'gap-1',
    sm: 'gap-1.5',
    md: 'gap-2',
    lg: 'gap-2 sm:gap-2.5',
    xl: 'gap-3',
    '2xl': 'gap-4',
  };

  // Color logic for "Fresh"
  // In 'dark' mode or 'auto', we provide a bright white with deep readability
  // In 'light' mode, we use deep forest charcoal (#07221A)
  const freshTextColor =
    variant === 'light'
      ? 'text-[#07221A]'
      : variant === 'dark'
      ? 'text-white'
      : 'text-white group-hover:text-white';

  const content = (
    <motion.div
      className={`group inline-flex select-none transition-all duration-300 ${
        orientation === 'vertical' ? 'flex-col items-center text-center' : 'items-center'
      } ${gapSizes[size]} ${className}`}
      whileHover={animated ? { scale: 1.02 } : undefined}
      whileTap={animated ? { scale: 0.98 } : undefined}
    >
      {/* Precision FreshNex Infinity & Leaves Emblem with Multi-layer Animation */}
      <FreshNexEmblem
        size={size}
        animated={animated}
        withGlow={true}
        interactive={animated}
      />

      {/* Brand Typography */}
      <div className={`flex flex-col ${orientation === 'vertical' ? 'items-center' : 'items-start'}`}>
        <div
          className={`font-black tracking-tight font-sans flex items-center leading-none ${textSizes[size]}`}
        >
          {/* "Fresh" */}
          <span className={`${freshTextColor} transition-colors duration-200 drop-shadow-sm`}>
            Fresh
          </span>

          {/* "Nex" in radiant fresh green gradient */}
          <span className="bg-gradient-to-r from-[#22C55E] via-[#34D399] to-[#4ADE80] bg-clip-text text-transparent ml-0.5 filter drop-shadow-[0_2px_8px_rgba(34,197,94,0.35)]">
            Nex
          </span>

          {/* Trademark ™ symbol */}
          <span className="text-[0.42em] font-extrabold text-[#22C55E]/90 align-top ml-0.5 -mt-1 tracking-normal">
            ™
          </span>
        </div>

        {/* Optional Tagline */}
        {showTagline && (
          <span
            className={`font-medium tracking-wide text-[#22C55E]/90 mt-0.5 font-sans leading-tight hidden sm:block ${taglineSizes[size]}`}
          >
            Track Freshness. Trust Every Bite.
          </span>
        )}
      </div>
    </motion.div>
  );

  if (linkTo) {
    return (
      <Link
        to={linkTo}
        className="inline-block focus:outline-none focus-visible:ring-2 focus-visible:ring-[#22C55E] rounded-2xl"
        aria-label="FreshNex Home"
      >
        {content}
      </Link>
    );
  }

  return content;
};

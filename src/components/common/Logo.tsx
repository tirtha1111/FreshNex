import React from 'react';
import { Link } from 'react-router-dom';
import { Leaf } from 'lucide-react';
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
  animated: _animated = false,
  variant = 'auto',
  showTagline = false,
  orientation = 'horizontal',
}) => {
  // Size mapping for typography and proportions
  const textSizes: Record<string, string> = {
    xs: 'text-xs',
    sm: 'text-xs sm:text-sm',
    md: 'text-sm sm:text-[15px]',
    lg: 'text-xl sm:text-2xl',
    xl: 'text-2xl sm:text-3xl',
    '2xl': 'text-3xl sm:text-4xl',
  };

  const taglineSizes: Record<string, string> = {
    xs: 'text-[6.5px]',
    sm: 'text-[7px]',
    md: 'text-[7.5px] tracking-tight',
    lg: 'text-[10px] sm:text-[11px] tracking-wide',
    xl: 'text-xs tracking-wide',
    '2xl': 'text-sm tracking-wide',
  };

  const gapSizes: Record<string, string> = {
    xs: 'gap-1',
    sm: 'gap-1.5',
    md: 'gap-1.5',
    lg: 'gap-2.5 sm:gap-3',
    xl: 'gap-3.5',
    '2xl': 'gap-4',
  };

  const isLight = variant === 'light';
  const isCompact = size === 'xs' || size === 'sm' || size === 'md';

  const content = (
    <div
      className={`inline-flex max-w-full select-none ${
        orientation === 'vertical' ? 'flex-col items-center text-center' : 'items-center'
      } ${gapSizes[size]} ${className}`}
    >
      {/* Precision FreshNex Infinity & Leaves Emblem (Static) */}
      <FreshNexEmblem
        size={size}
        animated={false}
        withGlow={false}
        interactive={false}
      />

      {/* Brand Typography Container */}
      <div
        className={`relative flex flex-col min-w-0 max-w-full ${
          orientation === 'vertical' ? 'items-center' : 'items-start'
        }`}
      >
        {/* Static Wordmark Row */}
        <div
          className={`relative font-['Plus_Jakarta_Sans',sans-serif] font-extrabold tracking-tight flex items-center leading-none ${textSizes[size]}`}
        >
          {/* "Fresh" */}
          <span
            className={`inline-block ${
              isLight
                ? 'text-[#07221A] drop-shadow-[0_1px_2px_rgba(16,185,129,0.12)]'
                : 'text-white drop-shadow-[0_1px_6px_rgba(16,185,129,0.28)]'
            }`}
          >
            Fresh
          </span>

          {/* "Nex" */}
          <span
            className={`inline-flex items-center bg-gradient-to-r ${
              isLight
                ? 'from-[#059669] via-[#10B981] to-[#65A30D]'
                : 'from-[#20E79A] via-[#34D399] to-[#A3E635]'
            } bg-clip-text text-transparent ml-0.5 filter drop-shadow-[0_2px_10px_rgba(16,185,129,0.32)]`}
          >
            Nex
          </span>

          {/* Botanical Leaf Accent (Static) */}
          <span
            className={`inline-flex items-center ml-0.5 -mt-1.5 ${
              isLight ? 'text-emerald-600' : 'text-[#20E79A]'
            }`}
          >
            <Leaf className={`${isCompact ? 'w-2.5 h-2.5' : 'w-3 h-3'} fill-emerald-400/30 stroke-[2.4]`} />
          </span>
        </div>

        {/* Optional Tagline (Static) */}
        {showTagline && (
          <div
            className={`relative mt-1 overflow-hidden rounded-full ${
              isCompact ? 'px-1.5 py-0.5 gap-1' : 'px-2 py-0.5 gap-1.5'
            } max-w-full bg-gradient-to-r ${
              isLight
                ? 'from-emerald-500/10 via-teal-500/12 to-lime-500/10 border-emerald-500/20'
                : 'from-[#13493B]/70 via-[#0F3D31]/80 to-[#13493B]/70 border-[#20E79A]/30'
            } border flex items-center`}
          >
            <span
              className={`${isCompact ? 'w-1 h-1' : 'w-1.5 h-1.5'} rounded-full ${
                isLight ? 'bg-emerald-500' : 'bg-[#20E79A]'
              } shrink-0`}
            />

            <span
              className={`relative font-['DM_Sans',sans-serif] font-bold bg-gradient-to-r ${
                isLight
                  ? 'from-[#047857] via-[#059669] to-[#0D9488]'
                  : 'from-[#34D399] via-[#20E79A] to-[#6EE7B7]'
              } bg-clip-text text-transparent leading-tight truncate ${taglineSizes[size]}`}
            >
              Track Freshness · Trust Every Bite
            </span>
          </div>
        )}
      </div>
    </div>
  );

  if (linkTo) {
    return (
      <Link
        to={linkTo}
        className="inline-block focus:outline-none focus-visible:ring-2 focus-visible:ring-[#10B981] rounded-2xl"
        aria-label="FreshNex Home"
      >
        {content}
      </Link>
    );
  }

  return content;
};


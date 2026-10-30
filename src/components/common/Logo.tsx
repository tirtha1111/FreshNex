import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
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
  animated = true,
  variant = 'auto',
  showTagline = false,
  orientation = 'horizontal',
}) => {
  const [isHovered, setIsHovered] = useState(false);

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

  const freshLetters = ['F', 'r', 'e', 's', 'h'];
  const nexLetters = ['N', 'e', 'x'];

  const isLight = variant === 'light';
  const isCompact = size === 'xs' || size === 'sm' || size === 'md';

  const content = (
    <motion.div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`group inline-flex max-w-full select-none transition-all duration-300 ${
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

      {/* Brand Typography Container (Target Element: div:nth-of-type(2)) */}
      <motion.div
        animate={
          animated && isHovered
            ? { x: 1.5 }
            : { x: 0 }
        }
        transition={{ type: 'spring', stiffness: 360, damping: 24 }}
        className={`relative flex flex-col min-w-0 max-w-full ${
          orientation === 'vertical' ? 'items-center' : 'items-start'
        }`}
      >
        {/* Subtle Ambient Fresh Chlorophyll Glow Behind Typography */}
        <motion.div
          animate={
            animated
              ? {
                  opacity: isHovered ? [0.45, 0.75, 0.45] : [0.15, 0.35, 0.15],
                  scale: isHovered ? 1.06 : 1,
                }
              : undefined
          }
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute -inset-x-1.5 -inset-y-0.5 rounded-xl bg-gradient-to-r from-emerald-400/20 via-teal-300/15 to-lime-400/20 blur-md pointer-events-none"
        />

        {/* Interactive Wordmark Row */}
        <div
          className={`relative font-['Plus_Jakarta_Sans',sans-serif] font-extrabold tracking-tight flex items-center leading-none ${textSizes[size]}`}
        >
          {/* "Fresh" with Interactive Per-Character Wave & Deep Forest-Mint Tint */}
          <span className="inline-flex items-center">
            {freshLetters.map((char, idx) => (
              <motion.span
                key={`fresh-${idx}`}
                animate={
                  animated && isHovered
                    ? {
                        y: [0, -2.5, 0],
                        color: isLight ? '#059669' : '#34D399',
                      }
                    : {
                        y: 0,
                        color: isLight ? '#07221A' : '#FFFFFF',
                      }
                }
                transition={{
                  duration: 0.38,
                  delay: idx * 0.035,
                  ease: [0.16, 1, 0.3, 1],
                }}
                className={`inline-block transition-colors duration-200 ${
                  isLight
                    ? 'text-[#07221A] drop-shadow-[0_1px_2px_rgba(16,185,129,0.12)]'
                    : 'text-white drop-shadow-[0_1px_6px_rgba(16,185,129,0.28)]'
                }`}
              >
                {char}
              </motion.span>
            ))}
          </span>

          {/* "Nex" in Flowing Animated Fresh Emerald-Lime Shimmer Gradient */}
          <motion.span
            animate={
              animated
                ? {
                    backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
                    y: isHovered ? [0, -2.5, 0] : 0,
                  }
                : undefined
            }
            transition={{
              backgroundPosition: { duration: 4.5, repeat: Infinity, ease: 'linear' },
              y: { duration: 0.4, delay: 0.18, ease: [0.16, 1, 0.3, 1] },
            }}
            style={{ backgroundSize: '200% 200%' }}
            className={`inline-flex items-center bg-gradient-to-r ${
              isLight
                ? 'from-[#059669] via-[#10B981] to-[#65A30D]'
                : 'from-[#20E79A] via-[#34D399] to-[#A3E635]'
            } bg-clip-text text-transparent ml-0.5 filter drop-shadow-[0_2px_10px_rgba(16,185,129,0.32)]`}
          >
            {nexLetters.map((char, idx) => (
              <span key={`nex-${idx}`} className="inline-block">
                {char}
              </span>
            ))}
          </motion.span>

          {/* Animated Botanical Leaf & Trademark Superscript Accent */}
          <motion.span
            animate={
              animated
                ? {
                    rotate: isHovered ? [0, 18, -10, 0] : [0, 8, 0],
                    y: isHovered ? -1.5 : 0,
                    scale: isHovered ? 1.12 : 1,
                  }
                : undefined
            }
            transition={{
              duration: isHovered ? 0.5 : 3.2,
              repeat: isHovered ? 0 : Infinity,
              ease: 'easeInOut',
            }}
            className={`inline-flex items-center ml-0.5 -mt-1.5 ${
              isLight ? 'text-emerald-600' : 'text-[#20E79A]'
            }`}
          >
            <Leaf className={`${isCompact ? 'w-2.5 h-2.5' : 'w-3 h-3'} fill-emerald-400/30 stroke-[2.4]`} />
          </motion.span>
        </div>

        {/* Optional Interactive Fresh-Tint Tagline with Animated Dew Sweep */}
        {showTagline && (
          <motion.div
            initial={{ opacity: 0.9 }}
            animate={
              animated
                ? {
                    opacity: isHovered ? 1 : 0.94,
                  }
                : undefined
            }
            className={`relative mt-1 overflow-hidden rounded-full ${
              isCompact ? 'px-1.5 py-0.5 gap-1' : 'px-2 py-0.5 gap-1.5'
            } max-w-full bg-gradient-to-r ${
              isLight
                ? 'from-emerald-500/10 via-teal-500/12 to-lime-500/10 border-emerald-500/20'
                : 'from-[#13493B]/70 via-[#0F3D31]/80 to-[#13493B]/70 border-[#20E79A]/30'
            } border flex items-center`}
          >
            {/* Flowing Shimmer Highlight across Tagline */}
            <motion.span
              animate={{ x: ['-120%', '220%'] }}
              transition={{ duration: 3.8, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute inset-y-0 w-1/3 bg-gradient-to-r from-transparent via-white/40 to-transparent skew-x-12 pointer-events-none"
            />

            <motion.span
              animate={{ scale: [1, 1.25, 1], opacity: [0.7, 1, 0.7] }}
              transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
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
          </motion.div>
        )}
      </motion.div>
    </motion.div>
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

import React from 'react';
import { motion } from 'motion/react';

const UPLOADED_LOGO_CLEAN_SRC = '/assets/aistudio/freshnex_logo_clean.png?v=2';

interface FreshNexEmblemProps {
  className?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | number;
  animated?: boolean;
  withGlow?: boolean;
  interactive?: boolean;
}

export const FreshNexEmblem: React.FC<FreshNexEmblemProps> = ({
  className = '',
  size = 'md',
  animated = true,
  withGlow = true,
  interactive = true,
}) => {
  // Preset pixel dimensions calibrated to the full uncropped FreshNex logo aspect ratio (586 x 388 ~ 1.51)
  const sizeMap: Record<string, { height: number; width: number }> = {
    xs: { height: 28, width: 42 },
    sm: { height: 36, width: 54 },
    md: { height: 42, width: 64 },
    lg: { height: 78, width: 118 },
    xl: { height: 98, width: 148 },
    '2xl': { height: 122, width: 184 },
  };

  const dimensions =
    typeof size === 'number'
      ? { height: size, width: Math.round(size * (586 / 388)) }
      : sizeMap[size] || sizeMap.md;

  return (
    <motion.div
      className={`relative inline-flex items-center justify-center shrink-0 select-none ${className}`}
      style={{ width: dimensions.width, height: dimensions.height }}
      initial={animated ? { opacity: 0, scale: 0.88, y: 6 } : undefined}
      animate={
        animated
          ? {
              opacity: 1,
              scale: [1, 1.035, 1],
              y: [0, -3.5, 0],
              filter: withGlow
                ? [
                    'drop-shadow(0 4px 10px rgba(16, 185, 129, 0.22))',
                    'drop-shadow(0 8px 20px rgba(34, 197, 94, 0.45))',
                    'drop-shadow(0 4px 10px rgba(16, 185, 129, 0.22))',
                  ]
                : undefined,
            }
          : undefined
      }
      transition={
        animated
          ? {
              opacity: { duration: 0.45, ease: 'easeOut' },
              scale: { duration: 4, repeat: Infinity, ease: 'easeInOut' },
              y: { duration: 3.6, repeat: Infinity, ease: 'easeInOut' },
              filter: { duration: 3.6, repeat: Infinity, ease: 'easeInOut' },
            }
          : undefined
      }
      whileHover={
        interactive
          ? {
              scale: 1.08,
              y: -3,
              filter: 'drop-shadow(0 10px 24px rgba(16, 185, 129, 0.6))',
              transition: { duration: 0.3, ease: 'easeOut' },
            }
          : undefined
      }
      whileTap={interactive ? { scale: 0.95 } : undefined}
    >
      {/* Full Uncropped Transparent FreshNex Logo */}
      <img
        src={UPLOADED_LOGO_CLEAN_SRC}
        alt="FreshNex Official Logo"
        draggable={false}
        className="relative z-10 w-full h-full object-contain pointer-events-none select-none"
      />
    </motion.div>
  );
};

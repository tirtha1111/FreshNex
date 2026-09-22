import React from 'react';
import { motion } from 'motion/react';

const EMBLEM_SRC = '/freshnex-emblem.png';

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
  // Preset pixel dimensions calibrated to the authentic uncut emblem aspect ratio (747 x 565 ~ 1.322)
  const sizeMap: Record<string, { height: number; width: number }> = {
    xs: { height: 18, width: 24 },
    sm: { height: 24, width: 32 },
    md: { height: 32, width: 42 },
    lg: { height: 40, width: 53 },
    xl: { height: 52, width: 69 },
    '2xl': { height: 68, width: 90 },
  };

  const dimensions = typeof size === 'number'
    ? { height: size, width: Math.round(size * (747 / 565)) }
    : sizeMap[size] || sizeMap.md;

  return (
    <motion.div
      className={`relative inline-flex items-center justify-center shrink-0 select-none ${className}`}
      style={{ width: dimensions.width, height: dimensions.height }}
      animate={
        animated
          ? {
              y: [0, -2.5, 0],
              filter: withGlow
                ? [
                    'drop-shadow(0 0 6px rgba(34, 197, 94, 0.3))',
                    'drop-shadow(0 0 16px rgba(74, 222, 128, 0.55))',
                    'drop-shadow(0 0 6px rgba(34, 197, 94, 0.3))',
                  ]
                : undefined,
            }
          : undefined
      }
      transition={
        animated
          ? {
              duration: 3.5,
              repeat: Infinity,
              ease: 'easeInOut',
            }
          : undefined
      }
      whileHover={
        interactive
          ? {
              scale: 1.08,
              filter: 'drop-shadow(0 0 20px rgba(74, 222, 128, 0.75))',
              transition: { duration: 0.25, ease: 'easeOut' },
            }
          : undefined
      }
      whileTap={interactive ? { scale: 0.95 } : undefined}
    >
      <svg
        viewBox="0 0 747 565"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full overflow-visible pointer-events-none"
      >
        <image
          href={EMBLEM_SRC}
          x="0"
          y="0"
          width="747"
          height="565"
          preserveAspectRatio="xMidYMid meet"
        />
      </svg>
    </motion.div>
  );
};


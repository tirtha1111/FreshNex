import React from 'react';

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
  // Props kept for backward compatibility, now strictly static
  animated: _animated = false,
  withGlow: _withGlow = false,
  interactive: _interactive = false,
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
    <div
      className={`relative inline-flex items-center justify-center shrink-0 select-none ${className}`}
      style={{ width: dimensions.width, height: dimensions.height }}
    >
      {/* Full Uncropped Transparent FreshNex Logo (Static) */}
      <img
        src={UPLOADED_LOGO_CLEAN_SRC}
        alt="FreshNex Official Logo"
        draggable={false}
        className="relative z-10 w-full h-full object-contain pointer-events-none select-none drop-shadow-[0_2px_8px_rgba(16,185,129,0.18)]"
      />
    </div>
  );
};


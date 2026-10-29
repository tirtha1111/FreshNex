import React from 'react';

interface FreshNexLogoProps {
  showTagline?: boolean;
  compact?: boolean;
  className?: string;
}

export const FreshNexLogo: React.FC<FreshNexLogoProps> = ({
  showTagline = true,
  compact = false,
  className = '',
}) => {
  return (
    <div className={`flex items-center gap-3 select-none ${className}`}>
      {/* Leaf-inspired circle emblem */}
      <div
        className={`${
          compact ? 'w-9 h-9' : 'w-11 h-11'
        } rounded-full bg-gradient-to-br from-[#20C997] to-[#079B68] flex items-center justify-center shadow-sm shrink-0 relative overflow-hidden`}
      >
        <svg
          viewBox="0 0 40 40"
          fill="none"
          className={compact ? 'w-6 h-6' : 'w-7 h-7'}
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Main organic leaf shape */}
          <path
            d="M31.5 9.5C22.5 9.5 12 13.5 9.5 24.5C8.9 27.1 9.5 29.5 10.5 31C15.5 31.5 26.5 29.5 30.5 19.5C32 15.8 32 11.8 31.5 9.5Z"
            fill="#FFFFFF"
            fillOpacity="0.95"
          />
          {/* Leaf central vein and smart node circuit line */}
          <path
            d="M9.5 31C14.5 25.5 20.5 19.5 28.5 13.5"
            stroke="#079B68"
            strokeWidth="2.4"
            strokeLinecap="round"
          />
          <path
            d="M17 23.5L22.5 24.2M19.5 19.5L18.5 15"
            stroke="#079B68"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
          <circle cx="28.5" cy="13.5" r="2" fill="#079B68" />
        </svg>
      </div>

      <div className="flex flex-col min-w-0">
        <div className={`${compact ? 'text-xl' : 'text-[24px]'} font-extrabold tracking-tight leading-none flex items-center`}>
          <span className="text-[#102F46]">Fresh</span>
          <span className="text-[#079B68]">Nex</span>
        </div>
        {showTagline && (
          <span className="text-[10.5px] font-medium text-[#71869A] tracking-tight mt-1 truncate">
            Smarter Monitoring. Fresher Tomorrow.
          </span>
        )}
      </div>
    </div>
  );
};

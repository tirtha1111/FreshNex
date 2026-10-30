import React from 'react';
import { ShieldCheck, AlertTriangle, AlertCircle, HelpCircle, Activity, LucideIcon } from 'lucide-react';

// -----------------------------------------------------------------
// FRESHNESS BADGE
// -----------------------------------------------------------------
interface FreshnessBadgeProps {
  status: 'Fresh' | 'Warning' | 'Unsafe' | 'Unknown';
}

export const FreshnessBadge: React.FC<FreshnessBadgeProps> = ({ status }) => {
  const configs = {
    Fresh: {
      bg: 'bg-emerald-500/15 border-emerald-500/30 shadow-emerald-500/10',
      text: 'text-emerald-400',
      dot: 'bg-emerald-400 shadow-[0_0_8px_#34d399]',
      icon: ShieldCheck,
      label: 'FRESH'
    },
    Warning: {
      bg: 'bg-amber-500/15 border-amber-500/30 shadow-amber-500/10',
      text: 'text-amber-400',
      dot: 'bg-amber-400 shadow-[0_0_8px_#fbbf24]',
      icon: AlertTriangle,
      label: 'WARNING'
    },
    Unsafe: {
      bg: 'bg-rose-500/15 border-rose-500/30 shadow-rose-500/10',
      text: 'text-rose-400',
      dot: 'bg-rose-400 shadow-[0_0_8px_#f87171]',
      icon: AlertCircle,
      label: 'UNSAFE'
    },
    Unknown: {
      bg: 'bg-[#FF6A00]/10 border-[#FF6A00]/20',
      text: 'text-[#B8A89E]',
      dot: 'bg-[#B8A89E]',
      icon: HelpCircle,
      label: 'UNKNOWN'
    }
  };

  const config = configs[status] || configs.Unknown;
  const Icon = config.icon;

  return (
    <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-bold uppercase tracking-wider backdrop-blur-md shadow-sm ${config.bg} ${config.text}`}>
      <span className={`w-2 h-2 rounded-full ${config.dot}`} />
      <Icon className="w-3.5 h-3.5" />
      <span className="whitespace-nowrap">{config.label}</span>
    </div>
  );
};

// -----------------------------------------------------------------
// LIVE CONNECTION INDICATOR
// -----------------------------------------------------------------
interface LiveIndicatorProps {
  isConnected: boolean;
  isDemo?: boolean;
}

export const LiveIndicator: React.FC<LiveIndicatorProps> = ({ isConnected, isDemo = false }) => {
  if (isDemo) {
    return (
      <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-[#FF6A00]/15 border border-[#FF6A00]/35 text-[#FFAA00] rounded-full text-xs font-bold select-none shadow-sm shadow-[#FF6A00]/20 backdrop-blur-md">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#FFAA00] opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-[#FF6A00]"></span>
        </span>
        <Activity className="w-3.5 h-3.5" />
        <span className="uppercase tracking-wider">ESP32 Telemetry Live</span>
      </div>
    );
  }

  return (
    <div className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border text-xs font-bold shadow-sm backdrop-blur-md ${
      isConnected 
        ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400' 
        : 'bg-[#1C1410] border-[#FF6A00]/20 text-[#B8A89E]'
    }`}>
      <span className="relative flex h-2 w-2">
        {isConnected && (
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
        )}
        <span className={`relative inline-flex rounded-full h-2 w-2 ${isConnected ? 'bg-emerald-400' : 'bg-[#7E6A5E]'}`}></span>
      </span>
      <span className="uppercase tracking-wider">{isConnected ? 'LIVE IoT CONNECTED' : 'DISCONNECTED'}</span>
    </div>
  );
};

// -----------------------------------------------------------------
// EMPTY STATE
// -----------------------------------------------------------------
interface EmptyStateProps {
  title: string;
  description: string;
  icon: LucideIcon;
  actionLabel?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ title, description, icon: Icon, actionLabel, onAction }) => {
  return (
    <div className="flex flex-col items-center justify-center text-center p-8 glass-card border border-[#FF6A00]/25 rounded-2xl shadow-xl max-w-lg mx-auto">
      <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#FF6A00]/20 to-[#FFAA00]/20 border border-[#FF6A00]/30 flex items-center justify-center mb-4 text-[#FFAA00] shadow-lg shadow-[#FF6A00]/20">
        <Icon className="w-7 h-7" />
      </div>
      <h3 className="text-lg font-black text-[#FDF8F5] mb-1">{title}</h3>
      <p className="text-sm text-[#B8A89E] mb-6 leading-relaxed max-w-sm">{description}</p>
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="btn-orange px-6 py-2.5 rounded-xl font-bold text-sm shadow-md cursor-pointer whitespace-nowrap"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
};

// -----------------------------------------------------------------
// LOADING SKELETON
// -----------------------------------------------------------------
export const LoadingSkeleton: React.FC = () => {
  return (
    <div className="animate-pulse space-y-4 w-full">
      <div className="h-32 bg-[#221711]/60 rounded-2xl w-full border border-[#FF6A00]/10"></div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="h-24 bg-[#221711]/60 rounded-2xl border border-[#FF6A00]/10"></div>
        <div className="h-24 bg-[#221711]/60 rounded-2xl border border-[#FF6A00]/10"></div>
      </div>
      <div className="h-48 bg-[#221711]/60 rounded-2xl w-full border border-[#FF6A00]/10"></div>
    </div>
  );
};

// -----------------------------------------------------------------
// SENSOR CARD
// -----------------------------------------------------------------
interface SensorCardProps {
  label: string;
  value: string | number;
  unit: string;
  status: 'Optimal' | 'Caution' | 'Danger' | 'Offline';
  trend?: 'up' | 'down' | 'stable';
  lastUpdated?: string;
  icon: LucideIcon;
}

export const SensorCard: React.FC<SensorCardProps> = ({
  label,
  value,
  unit,
  status,
  trend,
  lastUpdated,
  icon: Icon
}) => {
  const statusColors = {
    Optimal: {
      text: 'text-emerald-400',
      badge: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30',
      iconBg: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
    },
    Caution: {
      text: 'text-amber-400',
      badge: 'bg-amber-500/20 text-amber-400 border border-amber-500/30',
      iconBg: 'bg-amber-500/15 text-amber-400 border-amber-500/30'
    },
    Danger: {
      text: 'text-rose-400',
      badge: 'bg-rose-500/20 text-rose-400 border border-rose-500/30',
      iconBg: 'bg-rose-500/15 text-rose-400 border-rose-500/30'
    },
    Offline: {
      text: 'text-[#B8A89E]',
      badge: 'bg-[#1C1410] text-[#B8A89E] border border-[#FF6A00]/20',
      iconBg: 'bg-[#FF6A00]/10 text-[#FFAA00] border-[#FF6A00]/20'
    }
  };

  const style = statusColors[status] || statusColors.Offline;

  return (
    <div className="p-5 rounded-2xl glass-card border border-[#FF6A00]/20 shadow-xl card-hover">
      <div className="flex items-center justify-between mb-4">
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center border ${style.iconBg}`}>
          <Icon className="w-5.5 h-5.5 stroke-[2]" />
        </div>
        <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider ${style.badge}`}>
          {status}
        </span>
      </div>
      
      <span className="text-xs font-bold text-[#B8A89E] uppercase tracking-wider block mb-1">
        {label}
      </span>
      
      <div className="flex items-baseline gap-1 mb-2">
        <span className="text-3xl font-black text-[#FDF8F5] tracking-tight">
          {value}
        </span>
        <span className="text-sm font-bold text-[#FFAA00]">
          {unit}
        </span>
      </div>

      <div className="flex items-center justify-between text-[11px] text-[#B8A89E] border-t border-[#FF6A00]/15 pt-3 font-medium">
        <span>Updated {lastUpdated || 'just now'}</span>
        {trend && (
          <span className="flex items-center font-bold text-[#FFAA00]">
            {trend === 'up' && '↗ Upward'}
            {trend === 'down' && '↘ Downward'}
            {trend === 'stable' && '→ Stable'}
          </span>
        )}
      </div>
    </div>
  );
};

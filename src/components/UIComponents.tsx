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
      bg: 'bg-emerald-50/70 border-emerald-100',
      text: 'text-emerald-700',
      dot: 'bg-emerald-500',
      icon: ShieldCheck,
      label: 'FRESH'
    },
    Warning: {
      bg: 'bg-amber-50/70 border-amber-100',
      text: 'text-amber-700',
      dot: 'bg-amber-500',
      icon: AlertTriangle,
      label: 'WARNING'
    },
    Unsafe: {
      bg: 'bg-rose-50/70 border-rose-100',
      text: 'text-rose-700',
      dot: 'bg-rose-500',
      icon: AlertCircle,
      label: 'UNSAFE'
    },
    Unknown: {
      bg: 'bg-slate-50/70 border-slate-200',
      text: 'text-slate-500',
      dot: 'bg-slate-400',
      icon: HelpCircle,
      label: 'UNKNOWN'
    }
  };

  const config = configs[status] || configs.Unknown;
  const Icon = config.icon;

  return (
    <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-semibold uppercase tracking-wider ${config.bg} ${config.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
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
      <div className="inline-flex items-center gap-2 px-3 py-1 bg-sky-50 border border-sky-100 text-sky-700 rounded-full text-xs font-semibold select-none shadow-sm shadow-sky-100/50">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-sky-500"></span>
        </span>
        <Activity className="w-3 h-3" />
        <span className="uppercase tracking-wider">Demo / Telemetry Mode</span>
      </div>
    );
  }

  return (
    <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border text-xs font-semibold shadow-sm ${
      isConnected 
        ? 'bg-emerald-50 border-emerald-100 text-emerald-700' 
        : 'bg-slate-50 border-slate-200 text-slate-500'
    }`}>
      <span className="relative flex h-2 w-2">
        {isConnected && (
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
        )}
        <span className={`relative inline-flex rounded-full h-2 w-2 ${isConnected ? 'bg-emerald-500' : 'bg-slate-400'}`}></span>
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
    <div className="flex flex-col items-center justify-center text-center p-8 bg-white border border-slate-100 rounded-2xl shadow-sm max-w-lg mx-auto">
      <div className="w-14 h-14 rounded-full bg-sky-50 flex items-center justify-center mb-4 text-sky-600 border border-sky-100">
        <Icon className="w-7 h-7" />
      </div>
      <h3 className="text-lg font-bold text-slate-900 mb-1">{title}</h3>
      <p className="text-sm text-slate-500 mb-6 leading-relaxed max-w-sm">{description}</p>
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="px-5 py-2.5 bg-gradient-to-r from-sky-600 to-blue-600 text-white rounded-xl font-medium text-sm shadow-sm shadow-blue-200 hover:shadow-md hover:from-sky-500 hover:to-blue-500 transition-all cursor-pointer whitespace-nowrap"
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
      <div className="h-32 bg-slate-100 rounded-2xl w-full"></div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="h-24 bg-slate-100 rounded-2xl"></div>
        <div className="h-24 bg-slate-100 rounded-2xl"></div>
      </div>
      <div className="h-48 bg-slate-100 rounded-2xl w-full"></div>
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
      text: 'text-emerald-700',
      bg: 'bg-emerald-50/50',
      border: 'border-emerald-100',
      badge: 'bg-emerald-100 text-emerald-800'
    },
    Caution: {
      text: 'text-amber-700',
      bg: 'bg-amber-50/50',
      border: 'border-amber-100',
      badge: 'bg-amber-100 text-amber-800'
    },
    Danger: {
      text: 'text-rose-700',
      bg: 'bg-rose-50/50',
      border: 'border-rose-100',
      badge: 'bg-rose-100 text-rose-800'
    },
    Offline: {
      text: 'text-slate-500',
      bg: 'bg-slate-50/50',
      border: 'border-slate-200',
      badge: 'bg-slate-100 text-slate-800'
    }
  };

  const style = statusColors[status] || statusColors.Offline;

  return (
    <div className={`p-5 rounded-2xl bg-white border ${style.border} shadow-sm shadow-slate-100 hover:shadow-md hover:scale-[1.01] transition-all`}>
      <div className="flex items-center justify-between mb-4">
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-sky-600 bg-sky-50 border border-sky-100`}>
          <Icon className="w-5.5 h-5.5 stroke-[1.75]" />
        </div>
        <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium uppercase tracking-wider ${style.badge}`}>
          {status}
        </span>
      </div>
      
      <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
        {label}
      </span>
      
      <div className="flex items-baseline gap-1 mb-2">
        <span className="text-3xl font-extrabold text-slate-800 tracking-tight transition-all">
          {value}
        </span>
        <span className="text-sm font-semibold text-slate-500">
          {unit}
        </span>
      </div>

      <div className="flex items-center justify-between text-[11px] text-slate-400 border-t border-slate-50 pt-3">
        <span>Updated {lastUpdated || 'just now'}</span>
        {trend && (
          <span className="flex items-center font-semibold">
            {trend === 'up' && '↗ Upward'}
            {trend === 'down' && '↘ Downward'}
            {trend === 'stable' && '→ Stable'}
          </span>
        )}
      </div>
    </div>
  );
};

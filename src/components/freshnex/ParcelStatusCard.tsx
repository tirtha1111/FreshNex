import React from 'react';
import { ShieldCheck, ShieldAlert, ShieldQuestion, Package, Leaf, MapPin, Clock } from 'lucide-react';
import { useFreshNex } from '../../context/FreshNexContext';

export const ParcelStatusCard: React.FC = () => {
  const {
    selectedParcel,
    currentTelemetry,
    overallParcelStatus,
    dataMode,
  } = useFreshNex();

  const statusConfig = {
    SAFE: {
      label: 'SAFE',
      bg: 'bg-[#E5F8F0]',
      border: 'border-[#079B68]/25',
      text: 'text-[#079B68]',
      iconBg: 'bg-[#079B68]',
      Icon: ShieldCheck,
    },
    WARNING: {
      label: 'WARNING',
      bg: 'bg-[#FFF8E6]',
      border: 'border-[#F5B82E]/40',
      text: 'text-[#B7791F]',
      iconBg: 'bg-[#F5B82E]',
      Icon: ShieldAlert,
    },
    CRITICAL: {
      label: 'CRITICAL',
      bg: 'bg-[#FEECEC]',
      border: 'border-[#EF5350]/40',
      text: 'text-[#EF5350]',
      iconBg: 'bg-[#EF5350]',
      Icon: ShieldAlert,
    },
    UNKNOWN: {
      label: 'STALE / OFFLINE',
      bg: 'bg-[#F0F4F8]',
      border: 'border-[#71869A]/30',
      text: 'text-[#71869A]',
      iconBg: 'bg-[#71869A]',
      Icon: ShieldQuestion,
    },
  }[overallParcelStatus];

  const StatusIcon = statusConfig.Icon;

  // Format relative time based on latest recorded reading
  const getRelativeUpdateText = () => {
    if (!currentTelemetry.timestamp) return 'No readings yet';
    const diffMins = Math.max(
      1,
      Math.round((Date.now() - currentTelemetry.timestamp) / 60000)
    );
    if (diffMins < 60) return `${diffMins} min ago`;
    const hrs = Math.round(diffMins / 60);
    return `${hrs} hr ago`;
  };

  return (
    <div className="fnx-card p-5 sm:p-6 relative overflow-hidden flex flex-col justify-between h-full">
      {/* Subtle decorative shield watermark on right */}
      <div className="pointer-events-none absolute -right-4 top-14 w-24 h-24 rounded-full bg-[#E5F8F0]/60 flex items-center justify-center">
        <ShieldCheck className="w-12 h-12 text-[#20C997]/40" />
      </div>

      {/* Header + Dynamic Status Badge */}
      <div className="flex items-center justify-between gap-2 mb-4 relative z-10">
        <h2 className="text-[17px] font-extrabold text-[#102F46]">Parcel Status</h2>

        <div
          className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border ${statusConfig.bg} ${statusConfig.border} shadow-2xs`}
        >
          <span
            className={`w-5 h-5 rounded-full ${statusConfig.iconBg} text-white flex items-center justify-center`}
          >
            <StatusIcon className="w-3.5 h-3.5" />
          </span>
          <span className={`text-xs font-extrabold tracking-wide ${statusConfig.text}`}>
            {statusConfig.label}
          </span>
        </div>
      </div>

      {/* 4 Info Rows matching reference image */}
      <div className="divide-y divide-[#DFEAF0] relative z-10">
        {/* Parcel ID */}
        <div className="py-2.5 flex items-center gap-3.5">
          <div className="w-9 h-9 rounded-full bg-[#E5F8F0] text-[#079B68] flex items-center justify-center shrink-0">
            <Package className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="text-[11.5px] font-medium text-[#71869A]">Parcel ID</div>
            <div className="text-[14.5px] font-extrabold text-[#102F46] font-mono-tabular">
              {selectedParcel.id}
            </div>
          </div>
        </div>

        {/* Product */}
        <div className="py-2.5 flex items-center gap-3.5">
          <div className="w-9 h-9 rounded-full bg-[#E5F8F0] text-[#079B68] flex items-center justify-center shrink-0">
            <Leaf className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="text-[11.5px] font-medium text-[#71869A]">Product</div>
            <div className="text-[14.5px] font-extrabold text-[#102F46] truncate">
              {selectedParcel.productName}
            </div>
          </div>
        </div>

        {/* Location (Only shown when valid GPS fix is available per Section 6 & 9) */}
        <div className="py-2.5 flex items-center gap-3.5">
          <div className="w-9 h-9 rounded-full bg-[#E5F8F0] text-[#079B68] flex items-center justify-center shrink-0">
            <MapPin className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="text-[11.5px] font-medium text-[#71869A]">Location</div>
            {currentTelemetry.gpsFixAvailable && currentTelemetry.locationLabel ? (
              <div className="text-[13.5px] font-bold text-[#102F46] font-mono-tabular">
                {currentTelemetry.locationLabel}
              </div>
            ) : (
              <div className="text-[12.5px] font-semibold text-[#71869A] italic">
                Waiting for GPS signal
              </div>
            )}
          </div>
        </div>

        {/* Last Update */}
        <div className="pt-2.5 flex items-center justify-between gap-3.5">
          <div className="flex items-center gap-3.5">
            <div className="w-9 h-9 rounded-full bg-[#E5F8F0] text-[#079B68] flex items-center justify-center shrink-0">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[11.5px] font-medium text-[#71869A]">Last Update</div>
              <div className="text-[13.5px] font-bold text-[#102F46] font-mono-tabular">
                {getRelativeUpdateText()}
              </div>
            </div>
          </div>

          <span className="text-[10.5px] font-semibold px-2 py-0.5 rounded-md bg-[#F7FAFC] border border-[#DFEAF0] text-[#71869A]">
            {dataMode === 'demo' ? 'Demo' : dataMode === 'live' ? 'Live RTDB' : 'Stale'}
          </span>
        </div>
      </div>
    </div>
  );
};

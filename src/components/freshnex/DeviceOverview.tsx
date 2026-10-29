import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Cpu, Leaf, Thermometer, BatteryCharging } from 'lucide-react';
import { useFreshNex } from '../../context/FreshNexContext';

export const DeviceOverview: React.FC = () => {
  const {
    selectedParcel,
    selectedDevice,
    currentTelemetry,
    overallParcelStatus,
  } = useFreshNex();
  const navigate = useNavigate();

  const isDeviceOnline = !currentTelemetry.isStale && selectedDevice.online;
  const batteryVal = currentTelemetry.batteryPercent;
  const enclosureTemp = currentTelemetry.deviceEnclosureTempC;

  const conditionDisplay = {
    SAFE: { label: 'Good', color: 'text-[#102F46]', sub: 'Within configured thresholds' },
    WARNING: { label: 'Warning', color: 'text-[#B7791F]', sub: 'Near threshold boundary' },
    CRITICAL: { label: 'Critical', color: 'text-[#EF5350]', sub: 'Threshold excursion active' },
    UNKNOWN: { label: 'Unknown', color: 'text-[#71869A]', sub: 'Awaiting live telemetry' },
  }[overallParcelStatus];

  return (
    <div className="fnx-card p-5">
      <div className="flex items-center justify-between mb-3.5">
        <h2 className="text-[16px] font-extrabold text-[#102F46]">
          Product & Device Overview
        </h2>
        <span className="text-[11px] font-medium text-[#71869A]">
          Click any card to open detailed diagnostics
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3.5">
        {/* 1. PRODUCT CARD */}
        <div
          onClick={() => navigate('/products')}
          className="border border-[#DFEAF0] rounded-2xl p-3 bg-[#FFFFFF] hover:border-[#079B68] hover:bg-[#F7FAFC]/60 transition-all flex items-center gap-3.5 cursor-pointer"
        >
          <img
            src={selectedParcel.productImage}
            alt={selectedParcel.productName}
            className="w-14 h-14 rounded-xl object-cover border border-[#DFEAF0] shrink-0"
          />
          <div className="min-w-0">
            <div className="text-[11px] font-medium text-[#71869A]">Product</div>
            <div className="text-[14px] font-extrabold text-[#102F46] truncate">
              {selectedParcel.productName}
            </div>
            <div className="text-[11.5px] font-semibold text-[#71869A] font-mono-tabular mt-0.5">
              ID: {selectedParcel.id}
            </div>
          </div>
        </div>

        {/* 2. DEVICE STATUS CARD */}
        <div
          onClick={() => navigate('/devices')}
          className="border border-[#DFEAF0] rounded-2xl p-3 bg-[#FFFFFF] hover:border-[#079B68] hover:bg-[#F7FAFC]/60 transition-all flex items-center justify-between gap-3 cursor-pointer"
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-11 h-11 rounded-full bg-[#E5F8F0] text-[#079B68] flex items-center justify-center shrink-0">
              <Cpu className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="text-[11px] font-medium text-[#71869A]">Device Status</div>
              <div
                className={`text-[14.5px] font-extrabold ${
                  isDeviceOnline ? 'text-[#079B68]' : 'text-[#71869A]'
                }`}
              >
                {isDeviceOnline ? 'Online' : 'Offline'}
              </div>
              <div className="flex items-center gap-1.5 text-[11px] font-semibold text-[#71869A] font-mono-tabular mt-0.5">
                <span
                  className={`w-2 h-2 rounded-full ${
                    isDeviceOnline ? 'bg-[#079B68]' : 'bg-[#71869A]'
                  }`}
                />
                <span>
                  Battery: {batteryVal !== null ? `${batteryVal}%` : 'No Data'}
                </span>
              </div>
            </div>
          </div>
          <BatteryCharging className="w-5 h-5 text-[#079B68] shrink-0 mr-1" />
        </div>

        {/* 3. STORAGE CONDITION CARD (Strictly derived from configured thresholds, no unvalidated freshness %) */}
        <div
          onClick={() => navigate('/parcels')}
          className="border border-[#DFEAF0] rounded-2xl p-3 bg-[#FFFFFF] hover:border-[#079B68] hover:bg-[#F7FAFC]/60 transition-all flex items-center gap-3 cursor-pointer"
        >
          <div className="w-11 h-11 rounded-full bg-[#E5F8F0] text-[#079B68] flex items-center justify-center shrink-0">
            <Leaf className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <div className="text-[11px] font-medium text-[#71869A]">Storage Condition</div>
            <div className={`text-[14.5px] font-extrabold ${conditionDisplay.color}`}>
              {conditionDisplay.label}
            </div>
            <div className="text-[11px] font-medium text-[#71869A] truncate mt-0.5">
              {conditionDisplay.sub}
            </div>
          </div>
        </div>

        {/* 4. DEVICE TEMPERATURE CARD (Explicitly hardware enclosure temp, distinct from food temp) */}
        <div
          onClick={() => navigate('/devices')}
          className="border border-[#DFEAF0] rounded-2xl p-3 bg-[#FFFFFF] hover:border-[#079B68] hover:bg-[#F7FAFC]/60 transition-all flex items-center gap-3 cursor-pointer"
        >
          <div className="w-11 h-11 rounded-full bg-[#EBF5FF] text-[#339AF0] flex items-center justify-center shrink-0">
            <Thermometer className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <div className="text-[11px] font-medium text-[#71869A]">
              Device Temperature
            </div>
            <div className="text-[14.5px] font-extrabold text-[#102F46] font-mono-tabular">
              {enclosureTemp !== null ? `${enclosureTemp}°C` : 'Not Reported'}
            </div>
            <div className="text-[11px] font-medium text-[#71869A] mt-0.5">
              {enclosureTemp !== null
                ? '(Enclosure Normal Range)'
                : 'Separate MCU sensor required'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

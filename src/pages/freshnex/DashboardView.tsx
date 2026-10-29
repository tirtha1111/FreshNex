import React from 'react';
import { DashboardHero } from '../../components/freshnex/DashboardHero';
import { ParcelStatusCard } from '../../components/freshnex/ParcelStatusCard';
import { SensorMetricsGrid } from '../../components/freshnex/SensorMetricCard';
import { SensorTrendChart } from '../../components/freshnex/SensorTrendChart';
import { LocationMap } from '../../components/freshnex/LocationMap';
import { RecentAlerts } from '../../components/freshnex/RecentAlerts';
import { RecentActivity } from '../../components/freshnex/RecentActivity';
import { DeviceOverview } from '../../components/freshnex/DeviceOverview';
import { useFreshNex } from '../../context/FreshNexContext';

export const DashboardView: React.FC = () => {
  const { parcels, selectedParcelId, setSelectedParcelId, dataMode } = useFreshNex();

  return (
    <div className="space-y-4">
      {/* Compact Parcel Context Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-1">
        <div className="flex items-center gap-2 text-xs text-[#71869A]">
          <span className="font-bold text-[#102F46]">Active Monitored Parcel:</span>
          <div className="flex flex-wrap items-center gap-1.5">
            {parcels.map((p) => (
              <button
                key={p.id}
                onClick={() => setSelectedParcelId(p.id)}
                className={`px-2.5 py-1 rounded-lg text-[11.5px] font-bold transition-colors cursor-pointer ${
                  selectedParcelId === p.id
                    ? 'bg-[#079B68] text-white shadow-2xs'
                    : 'bg-white border border-[#DFEAF0] text-[#102F46] hover:border-[#079B68]'
                }`}
              >
                {p.id} ({p.productName})
              </button>
            ))}
          </div>
        </div>

        <div className="text-[11.5px] font-medium text-[#71869A]">
          Data Source:{' '}
          <span className="font-bold text-[#102F46]">
            {dataMode === 'demo'
              ? 'Demonstration Mode (Sample Telemetry)'
              : dataMode === 'live'
              ? 'Live Hardware Mode (ESP32 / Firebase RTDB)'
              : 'Disconnected / Stale State'}
          </span>
        </div>
      </div>

      {/* Main 12-Column Responsive Dashboard Grid matching Reference Image */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 items-start">
        {/* LEFT / CENTER WORKSPACE (9 Columns on XL screens) */}
        <div className="xl:col-span-9 space-y-5">
          {/* 1. Main Dashboard Hero Section */}
          <DashboardHero />

          {/* 2. Five Sensor Metric Cards */}
          <SensorMetricsGrid />

          {/* 3. Live Sensor Trends + Location & Route */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
            <div className="lg:col-span-7">
              <SensorTrendChart />
            </div>
            <div className="lg:col-span-5">
              <LocationMap />
            </div>
          </div>

          {/* 4. Product & Device Overview Bottom Summary */}
          <DeviceOverview />
        </div>

        {/* RIGHT SIDEBAR COLUMN (3 Columns on XL screens) */}
        <div className="xl:col-span-3 space-y-5">
          {/* Upper-Right: Parcel Status Card */}
          <ParcelStatusCard />

          {/* Middle-Right: Recent Alerts Panel */}
          <RecentAlerts />

          {/* Lower-Right: Recent Activity Panel */}
          <RecentActivity />
        </div>
      </div>
    </div>
  );
};

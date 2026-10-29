import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Thermometer,
  Wind,
  Activity,
  Sun,
  MapPin,
  ArrowRight,
  Radio,
} from 'lucide-react';
import { useFreshNex } from '../../context/FreshNexContext';
import { ASSETS } from '../../assets/images';

export const DashboardHero: React.FC = () => {
  const navigate = useNavigate();
  const { dataMode } = useFreshNex();

  const features = [
    { label: 'Temperature\n& Humidity', icon: Thermometer },
    { label: 'Gas\nDetection', icon: Wind },
    { label: 'Impact\nMonitoring', icon: Activity },
    { label: 'Light\nExposure', icon: Sun },
    { label: 'GPS\nLocation', icon: MapPin },
  ];

  return (
    <div className="fnx-card relative overflow-hidden p-5 sm:p-6 lg:p-7 bg-gradient-to-r from-[#EFFAF5] via-[#F7FCFA] to-[#FFFFFF] flex flex-col xl:flex-row items-stretch justify-between gap-6">
      {/* Subtle decorative mint glow in top right */}
      <div className="pointer-events-none absolute -right-12 -top-12 w-72 h-72 rounded-full bg-[#E5F8F0]/70 blur-3xl" />

      {/* Left Content */}
      <div className="relative z-10 flex-1 flex flex-col justify-between max-w-xl">
        <div>
          {/* Top Status Pill */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#20C997]/20 border border-[#079B68]/25 text-[#079B68] text-[11px] font-extrabold tracking-wider uppercase mb-3">
            <span className="w-2 h-2 rounded-full bg-[#079B68] animate-pulse" />
            <span>LIVE TRACKING</span>
            {dataMode === 'demo' && (
              <span className="ml-1 px-1.5 py-0.2 rounded bg-white/80 text-[#102F46] text-[9.5px] font-bold">
                DEMO DATA
              </span>
            )}
          </div>

          {/* Main Heading & Subheading */}
          <h1 className="text-2xl sm:text-[32px] font-extrabold tracking-tight leading-tight text-[#102F46]">
            <span className="text-[#102F46]">Fresh</span>
            <span className="text-[#079B68]">Nex</span>
            <span className="block text-xl sm:text-[25px] text-[#102F46] mt-0.5">
              Real-Time Food Monitoring
            </span>
          </h1>

          {/* Description */}
          <p className="text-[13.5px] text-[#71869A] leading-relaxed mt-2 max-w-md">
            Monitor temperature, humidity, gas levels, light exposure and transportation
            conditions for safer food delivery.
          </p>
        </div>

        {/* 5 Compact Feature Icon Cards + CTA */}
        <div className="mt-5 space-y-4">
          <div className="grid grid-cols-5 gap-2 sm:gap-2.5">
            {features.map((feat) => {
              const Icon = feat.icon;
              return (
                <div
                  key={feat.label}
                  className="bg-white/95 border border-[#DFEAF0] rounded-xl p-2.5 flex flex-col items-center text-center shadow-2xs hover:border-[#20C997] transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-[#E5F8F0] text-[#079B68] flex items-center justify-center mb-1.5">
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className="text-[10.5px] font-semibold text-[#102F46] leading-tight whitespace-pre-line">
                    {feat.label}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-1">
            <button
              onClick={() => navigate('/live-monitoring')}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#079B68] hover:bg-[#068559] text-white text-xs sm:text-[13px] font-bold shadow-xs transition-all cursor-pointer"
            >
              <Radio className="w-4 h-4" />
              <span>View Live Monitoring</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <span className="text-[11.5px] text-[#71869A] font-medium">
              ESP32 Multi-Sensor Telemetry • SHT31 • MQ135 • MPU6050 • NEO-6M
            </span>
          </div>
        </div>
      </div>

      {/* Right Content: Visual representation of FreshNex transparent smart parcel monitoring device */}
      <div className="relative z-10 xl:w-[370px] min-h-[220px] flex flex-col items-center justify-center">
        {/* Soft fresh produce backdrop */}
        <div className="relative w-full h-full rounded-2xl overflow-hidden border border-[#DFEAF0] bg-gradient-to-br from-[#E5F8F0]/70 via-white to-[#EDF7F3] p-4 flex flex-col items-center justify-between shadow-inner">
          {/* Blurred fresh greens accent on left edge */}
          <img
            src={ASSETS.heroCrate}
            alt="Fresh produce background"
            className="absolute inset-0 w-full h-full object-cover opacity-20 scale-110 blur-[1px] pointer-events-none"
          />

          {/* Top-right handwritten slogan matching reference image */}
          <div className="relative z-10 self-end text-right pr-1">
            <p className="font-handwritten text-[21px] leading-none text-[#102F46] font-bold -rotate-6">
              Fresh Food,
              <br />
              Safe Journey
            </p>
            <div className="h-0.5 w-16 bg-[#079B68] ml-auto mt-0.5 rounded-full -rotate-6" />
          </div>

          {/* Transparent Polycarbonate Smart Container & Electronics Enclosure Visual */}
          <div className="relative z-10 w-full max-w-[300px] my-1">
            <div className="relative rounded-2xl bg-white/75 backdrop-blur-md border-2 border-white shadow-[0_12px_28px_rgba(16,47,70,0.12)] p-3.5">
              {/* Top transparent lid rim */}
              <div className="h-2.5 -mx-3.5 -mt-3.5 mb-2.5 rounded-t-xl bg-gradient-to-r from-[#DFEAF0] via-white to-[#CBD9E2] border-b border-[#CBD9E2]" />

              {/* Side heavy-duty black polycarbonate latch clips */}
              <div className="absolute -right-2 top-6 w-3.5 h-12 rounded-md bg-[#102F46] border border-white/30 shadow-md" />
              <div className="absolute -left-1.5 top-6 w-2.5 h-12 rounded-md bg-[#102F46]/80" />

              <div className="flex items-center gap-3">
                {/* Internal Blue/Green PCB Sensor Controller Preview */}
                <div className="w-24 h-24 rounded-xl bg-[#0D3B56] border border-[#339AF0]/40 p-2 flex flex-col justify-between text-white shrink-0 relative overflow-hidden shadow-inner">
                  <div className="flex items-center justify-between">
                    <span className="text-[8px] font-mono-tabular uppercase tracking-wider text-[#20C997] font-bold">
                      ESP32-FNX
                    </span>
                    <span className="w-2 h-2 rounded-full bg-[#20C997] animate-ping" />
                  </div>
                  {/* Simulated PCB IC chips & traces */}
                  <div className="grid grid-cols-2 gap-1 my-1">
                    <div className="h-4 rounded bg-[#102F46] border border-[#339AF0]/50 flex items-center justify-center text-[7px] font-mono-tabular text-[#94D2BD]">
                      SHT31
                    </div>
                    <div className="h-4 rounded bg-[#102F46] border border-[#20C997]/50 flex items-center justify-center text-[7px] font-mono-tabular text-[#94D2BD]">
                      MQ135
                    </div>
                    <div className="h-4 rounded bg-[#102F46] border border-[#F5B82E]/50 flex items-center justify-center text-[7px] font-mono-tabular text-[#94D2BD]">
                      NEO6M
                    </div>
                    <div className="h-4 rounded bg-[#102F46] border border-white/30 flex items-center justify-center text-[7px] font-mono-tabular text-[#94D2BD]">
                      MPU60
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-[7.5px] font-mono-tabular text-[#CBD9E2]">
                    <span>3.7V LiPo</span>
                    <span className="text-[#20C997]">TX OK</span>
                  </div>
                </div>

                {/* Front FreshNex Branded Enclosure Sticker */}
                <div className="flex-1 bg-white/95 rounded-xl border border-[#DFEAF0] p-2.5 text-center shadow-xs">
                  <div className="flex items-center justify-center gap-1 mb-0.5">
                    <svg className="w-4 h-4 text-[#079B68]" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M17 8C8 10 5.9 16.17 3.82 21.34L5.71 22L6.66 19.7C7.14 19.87 7.64 20 8 20C19 20 22 3 22 3C21 5 14 5.25 9 6.25C4 7.25 2 11.5 2 13.5C2 15.5 3.75 17.25 3.75 17.25C7 8 17 8 17 8Z" />
                    </svg>
                    <span className="text-[16px] font-extrabold tracking-tight">
                      <span className="text-[#102F46]">Fresh</span>
                      <span className="text-[#079B68]">Nex</span>
                    </span>
                  </div>
                  <div className="text-[9.5px] font-semibold text-[#71869A]">
                    Fresh Food • Safe Journey
                  </div>
                  <div className="mt-2 pt-1.5 border-t border-[#DFEAF0] flex items-center justify-around text-[9px] font-mono-tabular font-bold text-[#079B68]">
                    <span>IP65 SEALED</span>
                    <span>•</span>
                    <span>NODE #01</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="relative z-10 w-full flex items-center justify-between text-[10.5px] font-semibold text-[#102F46]/80 pt-1">
            <span>Transparent Polycarbonate Enclosure</span>
            <span className="text-[#079B68] font-bold">Active Telemetry</span>
          </div>
        </div>
      </div>
    </div>
  );
};

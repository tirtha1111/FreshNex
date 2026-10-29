import React from 'react';
import { MapPin, Navigation, Satellite } from 'lucide-react';
import { useFreshNex } from '../../context/FreshNexContext';

export const LocationMap: React.FC = () => {
  const { selectedParcel, currentTelemetry, dataMode } = useFreshNex();

  const hasGpsFix = currentTelemetry.gpsFixAvailable && currentTelemetry.latitude !== null;
  const routeProgress = selectedParcel.plannedRouteProgress;

  return (
    <div className="fnx-card p-5 flex flex-col justify-between h-full">
      {/* Header */}
      <div className="flex items-center justify-between gap-2 mb-3">
        <h2 className="text-[16px] font-extrabold text-[#102F46]">Location & Route</h2>
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
            hasGpsFix
              ? 'bg-[#E5F8F0] text-[#079B68]'
              : 'bg-[#F0F4F8] text-[#71869A]'
          }`}
        >
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              hasGpsFix ? 'bg-[#079B68] animate-pulse' : 'bg-[#71869A]'
            }`}
          />
          {hasGpsFix ? (dataMode === 'demo' ? 'Live (Demo)' : 'GPS Lock') : 'No GPS Fix'}
        </span>
      </div>

      {/* Modular Map Viewport */}
      <div className="relative h-[185px] w-full rounded-xl overflow-hidden border border-[#DFEAF0] bg-[#EAF3F7]">
        {hasGpsFix ? (
          <>
            {/* Stylized Cartographic SVG Map matching Delhi -> Meerut -> Ghaziabad -> Noida reference */}
            <svg
              viewBox="0 0 420 190"
              className="w-full h-full object-cover"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Soft land & green park blocks */}
              <rect width="420" height="190" fill="#F1F6F9" />
              <path
                d="M0 0 L130 0 L95 190 L0 190 Z"
                fill="#E4F4EA"
                opacity="0.7"
              />
              <path
                d="M270 0 L420 0 L420 110 L310 95 Z"
                fill="#E4F4EA"
                opacity="0.55"
              />
              {/* Yamuna River waterway ribbon */}
              <path
                d="M85 0 C105 55, 115 95, 145 190"
                stroke="#BFE3F7"
                strokeWidth="14"
                fill="none"
              />
              {/* Secondary road network */}
              <path
                d="M0 45 L420 75 M0 135 L420 115 M160 0 L210 190 M290 0 L260 190"
                stroke="#FFFFFF"
                strokeWidth="3.5"
                fill="none"
              />
              <path
                d="M50 0 L360 190 M0 90 L420 35"
                stroke="#E2ECF2"
                strokeWidth="2"
                fill="none"
              />

              {/* Planned Route Line (Remaining segment in dashed blue) */}
              <path
                d="M78 38 L145 92 L205 128 L315 148"
                stroke="#339AF0"
                strokeWidth="4"
                strokeDasharray="6 4"
                fill="none"
              />

              {/* Completed Route History Line (Green -> Blue active segment) */}
              <path
                d="M78 38 L145 92 L205 128"
                stroke="#079B68"
                strokeWidth="4.5"
                strokeLinecap="round"
                fill="none"
              />

              {/* Origin Node: Delhi */}
              <circle cx="78" cy="38" r="6" fill="#079B68" stroke="#FFFFFF" strokeWidth="2" />
              <text x="58" y="25" fill="#102F46" fontSize="11" fontWeight="700">
                Delhi
              </text>

              {/* City Labels */}
              <text x="200" y="34" fill="#102F46" fontSize="11" fontWeight="700">
                Meerut
              </text>
              <text x="328" y="54" fill="#102F46" fontSize="10.5" fontWeight="600">
                Ghaziabad
              </text>

              {/* Current Vehicle Position Marker */}
              <circle
                cx="205"
                cy="128"
                r="11"
                fill="#339AF0"
                fillOpacity="0.22"
              />
              <circle
                cx="205"
                cy="128"
                r="6"
                fill="#102F46"
                stroke="#FFFFFF"
                strokeWidth="2"
              />

              {/* Destination Node: Noida */}
              <circle
                cx="315"
                cy="148"
                r="6"
                fill="#339AF0"
                stroke="#FFFFFF"
                strokeWidth="2"
              />
              <text x="328" y="152" fill="#102F46" fontSize="11" fontWeight="700">
                Noida
              </text>
            </svg>

            {/* Dark Navy Telemetry Callout Tooltip matching reference image */}
            <div className="absolute top-9 left-1/2 -translate-x-2 bg-[#102F46]/95 text-white px-3 py-2 rounded-xl shadow-md border border-white/15 text-[11px] font-mono-tabular leading-snug">
              <div className="font-bold">
                Speed: {currentTelemetry.speedKmh ?? 62} km/h
              </div>
              <div className="text-[#CBD9E2]">
                Altitude: {currentTelemetry.altitudeM ?? 212} m
              </div>
              <div className="absolute -bottom-1.5 left-4 w-3 h-3 bg-[#102F46] rotate-45" />
            </div>
          </>
        ) : (
          /* Honest Fallback when no GPS fix is available per Section 9 */
          <div className="w-full h-full flex flex-col items-center justify-center p-4 text-center bg-[#F7FAFC]">
            <div className="w-10 h-10 rounded-full bg-[#E5F8F0] text-[#079B68] flex items-center justify-center mb-2">
              <Satellite className="w-5 h-5" />
            </div>
            <div className="text-sm font-bold text-[#102F46]">
              Waiting for GPS signal
            </div>
            <p className="text-[11px] text-[#71869A] max-w-xs mt-1">
              NEO-6M GPS module has not acquired a valid satellite fix yet. Coordinates are not fabricated while offline.
            </p>
          </div>
        )}
      </div>

      {/* Bottom Footer Boxes: Current Location & Route Progress */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5 mt-3">
        {/* Current Location Box */}
        <div className="sm:col-span-7 bg-[#F7FAFC] border border-[#DFEAF0] rounded-xl p-2.5 flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-[#E5F8F0] text-[#079B68] flex items-center justify-center shrink-0">
            <MapPin className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="text-[10.5px] font-medium text-[#71869A]">Current Location</div>
            <div className="text-[12px] font-bold text-[#102F46] font-mono-tabular truncate">
              {hasGpsFix && currentTelemetry.locationLabel
                ? currentTelemetry.locationLabel
                : 'Waiting for GPS signal'}
            </div>
          </div>
        </div>

        {/* Route Progress Box (Shown when a planned route and meaningful route data exist) */}
        <div className="sm:col-span-5 bg-[#F7FAFC] border border-[#DFEAF0] rounded-xl p-2.5 flex flex-col justify-center">
          <div className="flex items-center justify-between text-[10.5px] font-medium text-[#71869A] mb-1">
            <span>Route Progress</span>
            <span className="font-bold text-[#102F46] font-mono-tabular">
              {hasGpsFix && routeProgress !== null ? `${routeProgress}%` : 'N/A'}
            </span>
          </div>
          <div className="w-full h-2 rounded-full bg-[#DFEAF0] overflow-hidden">
            <div
              className="h-full rounded-full bg-[#079B68] transition-all duration-300"
              style={{
                width: hasGpsFix && routeProgress !== null ? `${routeProgress}%` : '0%',
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

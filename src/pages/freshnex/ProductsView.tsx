import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Thermometer, Droplets, Sun, Wind, Settings2 } from 'lucide-react';
import { useFreshNex } from '../../context/FreshNexContext';

export const ProductsView: React.FC = () => {
  const { products, thresholds, searchQuery } = useFreshNex();
  const navigate = useNavigate();

  const q = searchQuery.trim().toLowerCase();
  const filtered = products.filter(
    (p) =>
      !q ||
      p.name.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q) ||
      p.sku.toLowerCase().includes(q)
  );

  return (
    <div className="space-y-5">
      <div className="fnx-card p-5 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-[#102F46]">
            Product Catalogue & Storage Profiles
          </h1>
          <p className="text-xs text-[#71869A] mt-0.5">
            Review monitored food products, packaging enclosures, and category-specific environmental threshold windows.
          </p>
        </div>
        <button
          onClick={() => navigate('/settings')}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#E5F8F0] hover:bg-[#079B68] text-[#079B68] hover:text-white text-xs font-bold transition-colors cursor-pointer"
        >
          <Settings2 className="w-4 h-4" />
          <span>Configure Thresholds</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filtered.map((prod) => {
          const catRule =
            thresholds.find((t) => t.id === prod.thresholdCategoryId) || thresholds[0];
          return (
            <div key={prod.id} className="fnx-card p-5 flex flex-col justify-between gap-4">
              <div className="flex items-start gap-4">
                <img
                  src={prod.image}
                  alt={prod.name}
                  className="w-16 h-16 rounded-2xl object-cover border border-[#DFEAF0] shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-base font-extrabold text-[#102F46]">
                      {prod.name}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full bg-[#E5F8F0] text-[#079B68] text-[11px] font-bold">
                      {prod.activeParcelsCount} Active{' '}
                      {prod.activeParcelsCount === 1 ? 'Parcel' : 'Parcels'}
                    </span>
                  </div>
                  <div className="text-xs font-semibold text-[#71869A] font-mono-tabular mt-0.5">
                    SKU: {prod.sku} • Category: {prod.category}
                  </div>
                  <p className="text-xs text-[#71869A] mt-1.5 leading-relaxed">
                    {prod.storageNotes}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-3 border-t border-[#DFEAF0]">
                <div className="p-2.5 rounded-xl bg-[#F7FAFC] border border-[#DFEAF0]">
                  <div className="flex items-center gap-1 text-[10.5px] text-[#71869A]">
                    <Thermometer className="w-3.5 h-3.5 text-[#079B68]" />
                    <span>Temp Range</span>
                  </div>
                  <div className="text-xs font-extrabold text-[#102F46] font-mono-tabular mt-1">
                    {catRule.temperature.min}°C – {catRule.temperature.max}°C
                  </div>
                </div>
                <div className="p-2.5 rounded-xl bg-[#F7FAFC] border border-[#DFEAF0]">
                  <div className="flex items-center gap-1 text-[10.5px] text-[#71869A]">
                    <Droplets className="w-3.5 h-3.5 text-[#339AF0]" />
                    <span>Humidity</span>
                  </div>
                  <div className="text-xs font-extrabold text-[#102F46] font-mono-tabular mt-1">
                    {catRule.humidity.min}% – {catRule.humidity.max}%
                  </div>
                </div>
                <div className="p-2.5 rounded-xl bg-[#F7FAFC] border border-[#DFEAF0]">
                  <div className="flex items-center gap-1 text-[10.5px] text-[#71869A]">
                    <Wind className="w-3.5 h-3.5 text-[#F5B82E]" />
                    <span>MQ135 Raw</span>
                  </div>
                  <div className="text-xs font-extrabold text-[#102F46] font-mono-tabular mt-1">
                    &le; {catRule.mq135Raw.normalMax} raw
                  </div>
                </div>
                <div className="p-2.5 rounded-xl bg-[#F7FAFC] border border-[#DFEAF0]">
                  <div className="flex items-center gap-1 text-[10.5px] text-[#71869A]">
                    <Sun className="w-3.5 h-3.5 text-[#F5B82E]" />
                    <span>Light Max</span>
                  </div>
                  <div className="text-xs font-extrabold text-[#102F46] font-mono-tabular mt-1">
                    &le; {catRule.lightLux.max} lux
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

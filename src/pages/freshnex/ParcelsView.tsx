import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Package, Plus, MapPin, Cpu, Truck, ArrowUpRight } from 'lucide-react';
import { useFreshNex } from '../../context/FreshNexContext';
import { ASSETS } from '../../assets/images';

export const ParcelsView: React.FC = () => {
  const {
    parcels,
    selectedParcelId,
    setSelectedParcelId,
    registerNewParcel,
    searchQuery,
  } = useFreshNex();
  const navigate = useNavigate();

  const [showModal, setShowModal] = useState(false);
  const [parcelId, setParcelId] = useState('FNX-00142');
  const [productName, setProductName] = useState('Mixed Vegetables');
  const [category, setCategory] = useState('Mixed Vegetables');
  const [deviceId, setDeviceId] = useState('ESP32-FNX-01');
  const [origin, setOrigin] = useState('Delhi Cold Hub');
  const [destination, setDestination] = useState('Noida Sector 62');

  const q = searchQuery.trim().toLowerCase();
  const filtered = parcels.filter(
    (p) =>
      !q ||
      p.id.toLowerCase().includes(q) ||
      p.productName.toLowerCase().includes(q) ||
      p.origin.toLowerCase().includes(q) ||
      p.destination.toLowerCase().includes(q)
  );

  const handleAddParcel = (e: React.FormEvent) => {
    e.preventDefault();
    registerNewParcel({
      id: parcelId.trim().toUpperCase(),
      productId: 'PROD-01',
      productName,
      category,
      productImage:
        category === 'Cold Drinks' ? ASSETS.colddrinks : ASSETS.tomatoProduct,
      deviceId,
      origin,
      destination,
      plannedRouteProgress: 15,
      eta: 'Today, 06:30 PM',
      batchCode: `BATCH-${Date.now().toString().slice(-4)}`,
      weightKg: 16.0,
      carrierName: 'FreshFleet Express #FF-301',
    });
    setShowModal(false);
  };

  const badgeStyle = (status: string) => {
    switch (status) {
      case 'SAFE':
        return 'bg-[#E5F8F0] text-[#079B68] border-[#079B68]/25';
      case 'WARNING':
        return 'bg-[#FFF8E6] text-[#B7791F] border-[#F5B82E]/40';
      case 'CRITICAL':
        return 'bg-[#FEECEC] text-[#EF5350] border-[#EF5350]/40';
      default:
        return 'bg-[#F0F4F8] text-[#71869A] border-[#DFEAF0]';
    }
  };

  return (
    <div className="space-y-5">
      <div className="fnx-card p-5 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-[#102F46]">
            Monitored Food Parcels
          </h1>
          <p className="text-xs text-[#71869A] mt-0.5">
            Track active cold-chain shipments, assigned IoT sensor enclosures, route waypoints, and condition compliance.
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#079B68] hover:bg-[#068559] text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Register Parcel</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filtered.map((p) => {
          const isSelected = p.id === selectedParcelId;
          return (
            <div
              key={p.id}
              className={`fnx-card p-5 flex flex-col justify-between gap-4 transition-all ${
                isSelected ? 'ring-2 ring-[#079B68]' : ''
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3.5">
                  <img
                    src={p.productImage}
                    alt={p.productName}
                    className="w-14 h-14 rounded-2xl object-cover border border-[#DFEAF0]"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-base font-extrabold text-[#102F46] font-mono-tabular">
                        {p.id}
                      </span>
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[11px] font-extrabold border ${badgeStyle(
                          p.status
                        )}`}
                      >
                        {p.status}
                      </span>
                    </div>
                    <div className="text-sm font-bold text-[#102F46] mt-0.5">
                      {p.productName}
                    </div>
                    <div className="text-[11px] text-[#71869A]">
                      Batch: {p.batchCode} • Weight: {p.weightKg} kg
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setSelectedParcelId(p.id);
                    navigate('/live-monitoring');
                  }}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[#E5F8F0] hover:bg-[#079B68] text-[#079B68] hover:text-white text-xs font-bold transition-colors cursor-pointer"
                >
                  <span>Inspect Live</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-[#F7FAFC] border border-[#DFEAF0] flex items-center gap-2.5">
                  <MapPin className="w-4 h-4 text-[#079B68] shrink-0" />
                  <div className="min-w-0">
                    <div className="text-[10.5px] text-[#71869A]">Route</div>
                    <div className="font-bold text-[#102F46] truncate">
                      {p.origin} → {p.destination}
                    </div>
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-[#F7FAFC] border border-[#DFEAF0] flex items-center gap-2.5">
                  <Cpu className="w-4 h-4 text-[#339AF0] shrink-0" />
                  <div className="min-w-0">
                    <div className="text-[10.5px] text-[#71869A]">Assigned IoT Node</div>
                    <div className="font-bold text-[#102F46] font-mono-tabular">
                      {p.deviceId}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs pt-2 border-t border-[#DFEAF0]">
                <span className="flex items-center gap-1.5 text-[#71869A]">
                  <Truck className="w-3.5 h-3.5" />
                  {p.carrierName}
                </span>
                <span className="font-bold text-[#102F46] font-mono-tabular">
                  Route Progress:{' '}
                  {p.plannedRouteProgress !== null ? `${p.plannedRouteProgress}%` : 'Awaiting GPS'}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 bg-[#102F46]/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-[#DFEAF0] shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-extrabold text-[#102F46]">
              Register New Monitored Parcel
            </h3>
            <form onSubmit={handleAddParcel} className="space-y-3.5 mt-4">
              <div>
                <label className="block text-xs font-bold text-[#102F46] mb-1">
                  Parcel ID
                </label>
                <input
                  type="text"
                  value={parcelId}
                  onChange={(e) => setParcelId(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl border border-[#DFEAF0] text-xs font-mono-tabular"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#102F46] mb-1">
                  Product Name
                </label>
                <input
                  type="text"
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl border border-[#DFEAF0] text-xs"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#102F46] mb-1">
                  Threshold Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl border border-[#DFEAF0] text-xs"
                >
                  <option value="Mixed Vegetables">Mixed Vegetables</option>
                  <option value="Cold Drinks">Cold Drinks</option>
                  <option value="Dairy & Milk Products">Dairy & Milk Products</option>
                  <option value="Meat & Poultry">Meat & Poultry</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-xs font-bold text-[#102F46] mb-1">
                    Origin
                  </label>
                  <input
                    type="text"
                    value={origin}
                    onChange={(e) => setOrigin(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl border border-[#DFEAF0] text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#102F46] mb-1">
                    Destination
                  </label>
                  <input
                    type="text"
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl border border-[#DFEAF0] text-xs"
                  />
                </div>
              </div>
              <div className="flex items-center justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl border border-[#DFEAF0] text-xs font-bold text-[#71869A]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#079B68] text-white text-xs font-bold"
                >
                  Register Parcel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

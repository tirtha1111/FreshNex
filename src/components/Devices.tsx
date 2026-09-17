import React, { useState } from 'react';
import { 
  Cpu, 
  Plus, 
  MapPin, 
  Wifi, 
  WifiOff, 
  CheckCircle2, 
  Activity, 
  Clock, 
  HelpCircle,
  Tag,
  PlusSquare,
  Sparkles
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { EmptyState } from './UIComponents';

export const Devices: React.FC = () => {
  const { devices, addDevice, products, liveReadings } = useApp();

  const [isRegistering, setIsRegistering] = useState(false);
  const [name, setName] = useState('');
  const [location, setLocation] = useState('Coldroom A');
  const [macAddress, setMacAddress] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !macAddress) {
      alert('Please fill out all hardware details before authorizing device entry.');
      return;
    }

    // Format ID
    const randomHex = Math.floor(1000 + Math.random() * 9000).toString();
    const cleanId = `esp32_${name.toLowerCase().replace(/[^a-z0-9]/g, '_')}_${randomHex}`;

    addDevice({
      id: cleanId,
      name,
      location,
      status: 'ONLINE',
      macAddress: macAddress.toUpperCase(),
      lastSeen: new Date().toISOString()
    });

    // Reset Form
    setName('');
    setMacAddress('');
    setIsRegistering(false);
  };

  const handleGenerateMac = () => {
    const mockMac = Array.from({ length: 6 }, () => 
      Math.floor(Math.random() * 256).toString(16).padStart(2, '0').toUpperCase()
    ).join(':');
    setMacAddress(mockMac);
    setName(`ESP32-Node-${Math.floor(10 + Math.random() * 89)}`);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-3">
        <div>
          <h2 className="text-xl font-black text-slate-950 tracking-tight flex items-center gap-2">
            <Cpu className="w-5.5 h-5.5 text-sky-500" />
            ESP32 / RFID Hardware Manager
          </h2>
          <p className="text-xs text-slate-500">Deploy wireless receivers, trace MAC addresses, and manage gateway connections.</p>
        </div>

        <button
          onClick={() => setIsRegistering(!isRegistering)}
          className="px-4 py-2.5 bg-gradient-to-r from-sky-600 to-blue-600 text-white font-extrabold text-xs rounded-xl shadow shadow-blue-100 flex items-center gap-2 hover:shadow-md cursor-pointer whitespace-nowrap self-start sm:self-center"
        >
          {isRegistering ? 'Cancel Registry' : 'Register IoT Node'}
          {isRegistering ? null : <Plus className="w-4 h-4" />}
        </button>
      </div>

      {/* -----------------------------------------------------------------
          HARDWARE REGISTRATION FORM
         ----------------------------------------------------------------- */}
      {isRegistering && (
        <form onSubmit={handleSubmit} className="bg-white border border-slate-100 p-6 rounded-3xl shadow-sm space-y-4 max-w-xl animate-fade-in">
          <div className="flex items-center justify-between border-b border-slate-50 pb-2">
            <h3 className="text-sm font-black text-slate-950 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-4.5 h-4.5 text-sky-500" />
              Provision Edge Receiver Node
            </h3>
            <button
              type="button"
              onClick={handleGenerateMac}
              className="text-[10px] font-extrabold text-sky-600 uppercase hover:underline cursor-pointer"
            >
              Generate Mock MAC
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] text-slate-500 font-bold block">Receiver Name / Nickname</label>
              <input 
                type="text" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Coldroom A Main Receiver" 
                className="w-full px-3 py-2 bg-slate-50 border border-slate-100 rounded-xl text-xs font-semibold focus:outline-none focus:border-sky-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] text-slate-500 font-bold block">MAC Address</label>
              <input 
                type="text" 
                value={macAddress}
                onChange={(e) => setMacAddress(e.target.value)}
                placeholder="e.g. 24:0A:C4:05:08:C2" 
                className="w-full px-3 py-2 bg-slate-50 border border-slate-100 rounded-xl text-xs font-semibold focus:outline-none focus:border-sky-500"
              />
            </div>

            <div className="space-y-1 sm:col-span-2">
              <label className="text-[10px] text-slate-500 font-bold block">Facility Location Assignment</label>
              <select 
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold text-slate-600 focus:outline-none focus:border-sky-500"
              >
                <option value="Coldroom A">Coldroom A (Vegetables / Fruits)</option>
                <option value="Coldroom B">Coldroom B (Dairy / Bakery)</option>
                <option value="Deep Freezer">Deep Freezer (Meat / Seafood)</option>
                <option value="Loading Dock C">Loading Dock C (Dispatch Transit)</option>
                <option value="Storage Facility 4">Storage Facility 4 (Dry Goods)</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-2.5 bg-slate-900 hover:bg-slate-950 text-white font-extrabold text-xs rounded-xl transition-all uppercase tracking-wider cursor-pointer"
          >
            Authorize Gateway Cryptographic Handshake
          </button>
        </form>
      )}

      {/* -----------------------------------------------------------------
          HARDWARE DISPLAY LISTINGS
         ----------------------------------------------------------------- */}
      {devices.length === 0 ? (
        <EmptyState
          title="No Hardware Provisioned"
          description="Register your first ESP32 active transmitter nodes to begin receiving physical climate streams."
          icon={Cpu}
          actionLabel="Provision First Gateway"
          onAction={() => setIsRegistering(true)}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {devices.map(dev => {
            // Find products bound to this device ID
            const associatedProducts = products.filter(p => p.deviceId === dev.id);
            const isOnline = dev.status === 'ONLINE';

            return (
              <div 
                key={dev.id}
                className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm space-y-4 hover:shadow hover:border-sky-200 transition-all"
              >
                {/* Status indicator row */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    {isOnline ? (
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                    ) : (
                      <span className="w-2.5 h-2.5 rounded-full bg-slate-300" />
                    )}
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">
                      {isOnline ? 'Online / Connected' : 'Offline'}
                    </span>
                  </div>

                  <div className="text-slate-400">
                    {isOnline ? (
                      <Wifi className="w-4.5 h-4.5 text-emerald-500" />
                    ) : (
                      <WifiOff className="w-4.5 h-4.5" />
                    )}
                  </div>
                </div>

                {/* Device Title info */}
                <div>
                  <h4 className="text-sm font-black text-slate-950">{dev.name}</h4>
                  <p className="text-[10px] text-slate-400 font-bold mt-0.5">ID: {dev.id}</p>
                </div>

                {/* Hardware profile */}
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-50 space-y-1.5 text-xs text-slate-600">
                  <div className="flex justify-between font-bold">
                    <span className="text-slate-400">MAC Addr:</span>
                    <span className="text-slate-700">{dev.macAddress}</span>
                  </div>
                  <div className="flex justify-between font-bold">
                    <span className="text-slate-400">Location:</span>
                    <span className="text-slate-700 flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-sky-500" />
                      {dev.location}
                    </span>
                  </div>
                </div>

                {/* Associated Products list */}
                <div className="space-y-1.5 pt-2 border-t border-slate-50">
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Bound Trace Items</span>
                  {associatedProducts.length === 0 ? (
                    <p className="text-[10px] text-slate-400 italic">No food items assigned to this ESP32 controller.</p>
                  ) : (
                    <div className="space-y-1">
                      {associatedProducts.map(p => (
                        <div key={p.id} className="text-[10px] font-bold text-slate-700 flex items-center justify-between">
                          <span className="truncate max-w-[150px]">{p.name}</span>
                          <span className="text-sky-600 bg-sky-50 px-1 py-0.5 rounded text-[9px] shrink-0">{p.batchId}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};

import React, { useState } from 'react';
import { Cpu, Plus, CheckCircle2, XCircle, BatteryCharging, Thermometer, Radio } from 'lucide-react';
import { useFreshNex } from '../../context/FreshNexContext';

export const DevicesView: React.FC = () => {
  const { devices, registerNewDevice, searchQuery } = useFreshNex();
  const [showAddModal, setShowAddModal] = useState(false);
  const [newId, setNewId] = useState('ESP32-FNX-05');
  const [newName, setNewName] = useState('FreshNex Smart Container Node #05');
  const [newMcu, setNewMcu] = useState('ESP32-WROOM-32D (Dual-Core)');
  const [newParcelId, setNewParcelId] = useState('FNX-00124');

  const q = searchQuery.trim().toLowerCase();
  const filteredDevices = devices.filter(
    (d) =>
      !q ||
      d.id.toLowerCase().includes(q) ||
      d.name.toLowerCase().includes(q) ||
      (d.assignedParcelId && d.assignedParcelId.toLowerCase().includes(q))
  );

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newId.trim()) return;
    registerNewDevice({
      id: newId.trim().toUpperCase(),
      name: newName.trim() || 'FreshNex Node',
      mcuModel: newMcu,
      assignedParcelId: newParcelId || null,
      online: true,
      batteryPercent: 100,
      enclosureTempC: 30,
      firmwareVersion: 'v2.4.1-rtdb',
      sensors: {
        sht31TempHumidity: true,
        mq135Gas: true,
        bh1750Light: true,
        mpu6050Motion: true,
        neo6mGps: true,
        phProbe: false,
      },
    });
    setShowAddModal(false);
  };

  return (
    <div className="space-y-5">
      <div className="fnx-card p-5 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-[#102F46]">
            IoT Monitoring Devices
          </h1>
          <p className="text-xs text-[#71869A] mt-0.5">
            Manage ESP32 smart container hardware nodes, connected sensor probes, battery levels, and enclosure temperatures.
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#079B68] hover:bg-[#068559] text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Register ESP32 Node</span>
        </button>
      </div>

      {/* Device Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filteredDevices.map((dev) => (
          <div key={dev.id} className="fnx-card p-5 flex flex-col justify-between gap-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div
                  className={`w-11 h-11 rounded-2xl flex items-center justify-center ${
                    dev.online
                      ? 'bg-[#E5F8F0] text-[#079B68]'
                      : 'bg-[#F0F4F8] text-[#71869A]'
                  }`}
                >
                  <Cpu className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-base font-extrabold text-[#102F46] font-mono-tabular">
                      {dev.id}
                    </span>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                        dev.online
                          ? 'bg-[#E5F8F0] text-[#079B68]'
                          : 'bg-[#F0F4F8] text-[#71869A]'
                      }`}
                    >
                      {dev.online ? 'Online' : 'Offline'}
                    </span>
                  </div>
                  <div className="text-xs font-medium text-[#71869A] mt-0.5">
                    {dev.name} • {dev.mcuModel}
                  </div>
                </div>
              </div>
              <span className="text-[11px] font-mono-tabular text-[#71869A] bg-[#F7FAFC] px-2.5 py-1 rounded-lg border border-[#DFEAF0]">
                {dev.firmwareVersion}
              </span>
            </div>

            {/* Hardware Telemetry Summary */}
            <div className="grid grid-cols-3 gap-3">
              <div className="p-3 rounded-xl bg-[#F7FAFC] border border-[#DFEAF0]">
                <div className="text-[11px] text-[#71869A]">Assigned Parcel</div>
                <div className="text-xs font-extrabold text-[#102F46] font-mono-tabular mt-0.5">
                  {dev.assignedParcelId || 'Unassigned'}
                </div>
              </div>
              <div className="p-3 rounded-xl bg-[#F7FAFC] border border-[#DFEAF0]">
                <div className="text-[11px] text-[#71869A] flex items-center gap-1">
                  <BatteryCharging className="w-3.5 h-3.5 text-[#079B68]" />
                  <span>Battery</span>
                </div>
                <div className="text-xs font-extrabold text-[#102F46] font-mono-tabular mt-0.5">
                  {dev.batteryPercent !== null ? `${dev.batteryPercent}%` : 'No Data'}
                </div>
              </div>
              <div className="p-3 rounded-xl bg-[#F7FAFC] border border-[#DFEAF0]">
                <div className="text-[11px] text-[#71869A] flex items-center gap-1">
                  <Thermometer className="w-3.5 h-3.5 text-[#339AF0]" />
                  <span>Enclosure Temp</span>
                </div>
                <div className="text-xs font-extrabold text-[#102F46] font-mono-tabular mt-0.5">
                  {dev.enclosureTempC !== null ? `${dev.enclosureTempC}°C` : 'No Data'}
                </div>
              </div>
            </div>

            {/* Connected Sensor Matrix */}
            <div className="pt-3 border-t border-[#DFEAF0]">
              <div className="text-[11px] font-bold text-[#71869A] uppercase tracking-wider mb-2">
                Hardware Sensor Bus Matrix
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                {[
                  { label: 'SHT31 Temp/RH', ok: dev.sensors.sht31TempHumidity },
                  { label: 'MQ135 Gas (Raw)', ok: dev.sensors.mq135Gas },
                  { label: 'BH1750 Light', ok: dev.sensors.bh1750Light },
                  { label: 'MPU6050 Motion', ok: dev.sensors.mpu6050Motion },
                  { label: 'NEO-6M GPS', ok: dev.sensors.neo6mGps },
                  { label: 'BNC pH Probe', ok: dev.sensors.phProbe },
                ].map((s) => (
                  <div
                    key={s.label}
                    className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#F7FAFC] border border-[#DFEAF0]"
                  >
                    {s.ok ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#079B68] shrink-0" />
                    ) : (
                      <XCircle className="w-3.5 h-3.5 text-[#71869A] shrink-0" />
                    )}
                    <span
                      className={`text-[11px] font-semibold truncate ${
                        s.ok ? 'text-[#102F46]' : 'text-[#71869A]'
                      }`}
                    >
                      {s.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add Device Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-[#102F46]/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-[#DFEAF0] shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-extrabold text-[#102F46]">
              Register New ESP32 Monitoring Node
            </h3>
            <p className="text-xs text-[#71869A] mt-1">
              Provision an ESP32 telemetry unit for real-time parcel monitoring.
            </p>
            <form onSubmit={handleCreate} className="space-y-3.5 mt-4">
              <div>
                <label className="block text-xs font-bold text-[#102F46] mb-1">
                  Device ID
                </label>
                <input
                  type="text"
                  value={newId}
                  onChange={(e) => setNewId(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl border border-[#DFEAF0] text-xs font-mono-tabular"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#102F46] mb-1">
                  Node Description
                </label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl border border-[#DFEAF0] text-xs"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#102F46] mb-1">
                  Microcontroller Model
                </label>
                <input
                  type="text"
                  value={newMcu}
                  onChange={(e) => setNewMcu(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl border border-[#DFEAF0] text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#102F46] mb-1">
                  Assigned Parcel ID
                </label>
                <input
                  type="text"
                  value={newParcelId}
                  onChange={(e) => setNewParcelId(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl border border-[#DFEAF0] text-xs font-mono-tabular"
                />
              </div>
              <div className="flex items-center justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl border border-[#DFEAF0] text-xs font-bold text-[#71869A]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#079B68] text-white text-xs font-bold"
                >
                  Register Device
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

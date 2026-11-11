import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { getDirectDatabase } from '../services/firebaseService';
import { ensureFirebaseAuthenticated } from '../firebase/firebase';
import { ref, onValue, off } from 'firebase/database';
import { WarehouseDeviceDetails } from '../components/WarehouseDeviceDetails';
import { useAuth } from '../context/AuthContext';
import { Logo } from '../components/common/Logo';
import {
  Warehouse,
  Radio,
  Cpu,
  ShieldCheck,
  Clock,
  History,
  CheckCircle2,
  AlertTriangle,
  Search,
  Filter,
  ArrowRight,
  ArrowLeft,
  Layers,
  ChevronRight,
  Tag,
  Wifi,
  Package,
  LogOut,
} from 'lucide-react';
import { formatRealtimeDateTime } from '../utils/dateUtils';

interface WarehouseScanEntry {
  id: string;
  tag_uid?: string;
  device_id?: string;
  product?: string;
  warehouse_id?: string;
  warehouse_device?: string;
  timestamp_ms?: number;
  scanner_status?: string;
  verified?: boolean;
}

export interface RFIDRegistryEntry {
  device_id?: string;
  product?: string;
  active?: boolean;
}

export interface RFIDRegistryMap {
  [uid: string]: RFIDRegistryEntry;
}

export const WarehousePage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { warehouseSession, logoutWarehouse, userProfile } = useAuth();
  const [manualOverviewMode, setManualOverviewMode] = useState(false);

  // Selected device query params or active RFID session device (unless user explicitly returned to overview)
  const queryDeviceId = searchParams.get('deviceId') || searchParams.get('id');
  const queryRfid = searchParams.get('rfid');
  const selectedDeviceId =
    queryDeviceId || (!manualOverviewMode && warehouseSession?.deviceId ? warehouseSession.deviceId : null);
  const selectedRfid =
    queryRfid || (!manualOverviewMode && warehouseSession?.tagUid ? warehouseSession.tagUid : null);

  const handleWarehouseLogout = async () => {
    await logoutWarehouse();
    navigate('/login');
  };

  const [registryMap, setRegistryMap] = useState<RFIDRegistryMap>({});
  const [scansList, setScansList] = useState<WarehouseScanEntry[]>([]);
  const [deviceStatuses, setDeviceStatuses] = useState<Record<string, boolean>>({});
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [productFilter, setProductFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);

  // Synchronize with Firebase Realtime Database
  useEffect(() => {
    let isCancelled = false;
    let cleanupScans: (() => void) | null = null;
    let cleanupRegistry: (() => void) | null = null;
    let cleanupDevices: (() => void) | null = null;

    const initData = async () => {
      setLoading(true);

      // 1. Instant prefetch from backend proxy endpoints for sub-100ms display
      try {
        const [regRes, scansRes] = await Promise.all([
          fetch('/api/warehouse/registry', { signal: AbortSignal.timeout(2500) }),
          fetch('/api/warehouse/scans', { signal: AbortSignal.timeout(2500) }),
        ]);

        if (regRes.ok) {
          const regData = await regRes.json();
          if (regData && typeof regData === 'object') {
            const normalized: RFIDRegistryMap = {};
            Object.entries(regData).forEach(([uid, entry]) => {
              normalized[uid.trim().toUpperCase()] = entry as any;
            });
            if (!isCancelled) setRegistryMap((prev) => ({ ...prev, ...normalized }));
          }
        }

        if (scansRes.ok) {
          const scansData = await scansRes.json();
          if (scansData && typeof scansData === 'object') {
            const list: WarehouseScanEntry[] = Object.entries(scansData).map(([key, v]: [string, any]) => ({
              id: key,
              tag_uid: v?.tag_uid ? String(v.tag_uid).trim().toUpperCase() : '',
              device_id: v?.device_id || '',
              product: v?.product || '',
              warehouse_id: v?.warehouse_id || 'WH-001',
              warehouse_device: v?.warehouse_device || 'FRESHNEX-WH-001',
              timestamp_ms: Number(v?.timestamp_ms) || Date.now(),
              scanner_status: v?.scanner_status || 'identified',
              verified: Boolean(v?.verified),
            }));
            list.sort((a, b) => (b.timestamp_ms || 0) - (a.timestamp_ms || 0));
            if (!isCancelled) setScansList(list);
          }
        }
      } catch (err) {
        console.warn('[WarehousePage] Prefetch warning:', err);
      } finally {
        if (!isCancelled) setLoading(false);
      }

      // 2. Ensure Firebase authenticated for Realtime Database WebSockets
      await ensureFirebaseAuthenticated();
      if (isCancelled) return;

      const db = getDirectDatabase();
      if (!db) {
        return;
      }

      // 1. Listen to /rfid_registry
      const regRef = ref(db, 'rfid_registry');
      const handleRegistry = (snap: any) => {
        if (isCancelled) return;
        if (snap.exists()) {
          const val = snap.val() || {};
          const normalized: RFIDRegistryMap = {};
          Object.entries(val).forEach(([uid, entry]) => {
            normalized[uid.trim().toUpperCase()] = entry as any;
          });
          setRegistryMap((prev) => ({ ...prev, ...normalized }));
        }
      };
      onValue(regRef, handleRegistry, (err) => {
        console.warn('[WarehousePage] Realtime registry notice:', err?.message || err);
      });
      cleanupRegistry = () => off(regRef, 'value', handleRegistry);

      // 2. Listen to /warehouse_scans
      const scansRef = ref(db, 'warehouse_scans');
      const handleScans = (snap: any) => {
        if (isCancelled) return;
        setLoading(false);
        if (snap.exists()) {
          const raw = snap.val() || {};
          const list: WarehouseScanEntry[] = Object.entries(raw).map(([key, v]: [string, any]) => ({
            id: key,
            tag_uid: v?.tag_uid ? String(v.tag_uid).trim().toUpperCase() : '',
            device_id: v?.device_id || '',
            product: v?.product || '',
            warehouse_id: v?.warehouse_id || 'WH-001',
            warehouse_device: v?.warehouse_device || 'FRESHNEX-WH-001',
            timestamp_ms: Number(v?.timestamp_ms) || Date.now(),
            scanner_status: v?.scanner_status || 'identified',
            verified: Boolean(v?.verified),
          }));
          list.sort((a, b) => (b.timestamp_ms || 0) - (a.timestamp_ms || 0));
          setScansList(list);
        } else {
          setScansList([]);
        }
      };
      onValue(scansRef, handleScans, (err) => {
        console.warn('[WarehousePage] Realtime scans notice:', err?.message || err);
        setLoading(false);
      });
      cleanupScans = () => off(scansRef, 'value', handleScans);

      // 3. Listen to /devices for live online statuses
      const devRef = ref(db, 'devices');
      const handleDevices = (snap: any) => {
        if (isCancelled) return;
        if (snap.exists()) {
          const raw = snap.val() || {};
          const statuses: Record<string, boolean> = {};
          Object.entries(raw).forEach(([devId, devVal]: [string, any]) => {
            const isOnline =
              devVal?.online !== undefined
                ? Boolean(devVal.online)
                : devVal?.status
                ? devVal.status.toLowerCase() !== 'offline'
                : true;
            statuses[devId] = isOnline;
          });
          setDeviceStatuses(statuses);
        }
      };
      onValue(devRef, handleDevices, (err) => {
        console.warn('[WarehousePage] Realtime devices notice:', err?.message || err);
      });
      cleanupDevices = () => off(devRef, 'value', handleDevices);
    };

    initData();

    // Listen to custom window event if a scan happened on this page
    const handleScanEvent = (e: Event) => {
      const detail = (e as CustomEvent)?.detail;
      if (detail?.deviceId) {
        setManualOverviewMode(false);
        setSearchParams({
          deviceId: detail.deviceId,
          rfid: detail.tagUid || '',
        });
      }
    };
    window.addEventListener('freshnex_warehouse_rfid_scan', handleScanEvent);

    return () => {
      isCancelled = true;
      if (cleanupScans) cleanupScans();
      if (cleanupRegistry) cleanupRegistry();
      if (cleanupDevices) cleanupDevices();
      window.removeEventListener('freshnex_warehouse_rfid_scan', handleScanEvent);
    };
  }, [setSearchParams]);

  // Registered Devices List derived from /rfid_registry
  const registeredDevicesList = useMemo(() => {
    return (Object.entries(registryMap) as [string, RFIDRegistryEntry][]).map(([uid, entry]) => {
      const devId = entry.device_id || 'Unassigned';
      const prodName = entry.product
        ? entry.product.charAt(0).toUpperCase() + entry.product.slice(1).toLowerCase()
        : 'Monitored Item';
      const isOnline = deviceStatuses[devId] ?? true;
      const isActive = entry.active !== false;

      // Find last scan for this device
      const matchingScan = scansList.find(
        (s) => s.tag_uid === uid || (s.device_id && s.device_id === devId)
      );

      return {
        uid,
        deviceId: devId,
        product: prodName,
        active: isActive,
        online: isOnline,
        lastScanMs: matchingScan?.timestamp_ms,
      };
    });
  }, [registryMap, deviceStatuses, scansList]);

  // Dynamically derive unique product filter options from Firebase registry and scans
  const availableProducts = useMemo(() => {
    const prodSet = new Set<string>();
    (Object.values(registryMap) as RFIDRegistryEntry[]).forEach((entry) => {
      if (entry?.product) {
        prodSet.add(entry.product.trim().toLowerCase());
      }
    });
    scansList.forEach((scan) => {
      if (scan?.product) {
        prodSet.add(scan.product.trim().toLowerCase());
      }
    });
    return Array.from(prodSet);
  }, [registryMap, scansList]);

  // Aggregate Metrics
  const totalRegisteredDevices = Object.keys(registryMap).length;
  const totalScans = scansList.length;

  // Recently Scanned Products (Unique products from recent scans)
  const recentlyScannedProducts = useMemo(() => {
    const map = new Map<string, { count: number; lastTime: number }>();
    scansList.forEach((s) => {
      let p = s.product ? s.product.trim() : '';
      if (!p && s.tag_uid && registryMap[s.tag_uid]?.product) {
        p = registryMap[s.tag_uid].product || '';
      }
      if (!p) p = 'Unknown Product';
      const cap = p.charAt(0).toUpperCase() + p.slice(1).toLowerCase();
      const existing = map.get(cap);
      if (existing) {
        map.set(cap, {
          count: existing.count + 1,
          lastTime: Math.max(existing.lastTime, s.timestamp_ms || 0),
        });
      } else {
        map.set(cap, { count: 1, lastTime: s.timestamp_ms || 0 });
      }
    });

    return Array.from(map.entries())
      .map(([name, data]) => ({ name, ...data }))
      .sort((a, b) => b.lastTime - a.lastTime)
      .slice(0, 4);
  }, [scansList, registryMap]);

  // Filtered Scan History
  const filteredScans = useMemo(() => {
    return scansList.filter((s) => {
      const q = searchQuery.toLowerCase().trim();
      const matchSearch =
        !q ||
        (s.tag_uid && s.tag_uid.toLowerCase().includes(q)) ||
        (s.device_id && s.device_id.toLowerCase().includes(q)) ||
        (s.product && s.product.toLowerCase().includes(q)) ||
        (s.warehouse_id && s.warehouse_id.toLowerCase().includes(q));

      const matchProduct =
        productFilter === 'ALL' ||
        (s.product && s.product.toLowerCase() === productFilter.toLowerCase());

      return matchSearch && matchProduct;
    });
  }, [scansList, searchQuery, productFilter]);

  const handleOpenDevice = (deviceId: string, rfidUid?: string) => {
    setManualOverviewMode(false);
    setSearchParams({
      deviceId,
      rfid: rfidUid || '',
    });
  };

  const handleReturnToOverview = () => {
    setManualOverviewMode(true);
    setSearchParams({});
  };

  // Find scan meta for selected device
  const activeScanMeta = useMemo(() => {
    if (!selectedDeviceId) return null;
    return scansList.find(
      (s) => s.device_id === selectedDeviceId || (selectedRfid && s.tag_uid === selectedRfid)
    );
  }, [selectedDeviceId, selectedRfid, scansList]);

  return (
    <div className="space-y-6 font-sans select-none">
      {/* Section Title Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#13493B]/10 pb-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#07221A] text-[#20E79A] border border-[#20E79A]/30 text-[10px] font-black uppercase tracking-wider mb-1.5 shadow-xs">
            <Warehouse className="w-3.5 h-3.5 text-[#20E79A]" /> Independent Warehouse Operations
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#07221A] tracking-tight">
            Warehouse RFID Management
          </h1>
          <p className="text-xs text-[#5C7F75] font-semibold">
            Real-time RC522 scanner telemetry, RFID registry verification, and live device inspection
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto flex-wrap">
          {selectedDeviceId && (
            <button
              type="button"
              onClick={handleReturnToOverview}
              className="px-4 py-2 rounded-xl bg-white border border-[#13493B]/15 text-xs font-black text-[#07221A] hover:bg-[#F4F7F6] flex items-center gap-2 cursor-pointer shadow-sm transition-all"
            >
              <Warehouse className="w-4 h-4 text-[#20E79A]" />
              <span>Warehouse Overview</span>
            </button>
          )}
          <button
            type="button"
            onClick={handleWarehouseLogout}
            className="px-4 py-2 rounded-xl bg-[#07221A] hover:bg-[#134336] text-white border border-[#20E79A]/30 text-xs font-black flex items-center gap-2 cursor-pointer shadow-sm transition-all"
          >
            <LogOut className="w-4 h-4 text-[#20E79A]" />
            <span>Warehouse Logout</span>
          </button>
        </div>
      </div>

      {/* Prominent Active Warehouse Session Banner */}
      {(warehouseSession || userProfile?.role === 'warehouse') && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 rounded-2xl bg-[#07221A] border border-[#20E79A]/40 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-lg"
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-[#20E79A]/15 border border-[#20E79A]/40 text-[#20E79A] flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] font-black uppercase tracking-wider text-[#20E79A] bg-[#20E79A]/15 px-2 py-0.5 rounded-md border border-[#20E79A]/30">
                  Active Warehouse Operator Session
                </span>
                <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold text-emerald-400">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping inline-block" />
                  Live Verified
                </span>
              </div>
              <div className="text-xs font-medium text-[#D5E6DF] mt-1 flex items-center gap-2 flex-wrap">
                <span>
                  Authorized Device:{' '}
                  <strong className="font-mono text-[#20E79A] font-bold">
                    {warehouseSession?.deviceId || userProfile?.assignedProductId || 'Registered Unit'}
                  </strong>
                </span>
                {(warehouseSession?.product || userProfile?.assignedProductName) && (
                  <span className="text-[#8AB5A8]">
                    • Product: <strong>{warehouseSession?.product || userProfile?.assignedProductName}</strong>
                  </span>
                )}
                {warehouseSession?.tagUid && (
                  <span className="text-amber-300 font-mono text-[11px]">
                    • RFID UID: <strong>{warehouseSession.tagUid}</strong>
                  </span>
                )}
                <span className="text-[#8AB5A8]">
                  • Scanner: ESP32-RC522 ({warehouseSession?.warehouseId || 'WH-001'})
                </span>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={handleWarehouseLogout}
            className="px-3.5 py-2 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 border border-rose-400/40 text-rose-300 hover:text-rose-100 text-xs font-bold flex items-center gap-2 cursor-pointer transition-colors shadow-xs shrink-0 self-end sm:self-auto"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>End Warehouse Session</span>
          </button>
        </motion.div>
      )}

      {/* VIEW A: DEDICATED DEVICE DETAILS AREA (When deviceId is selected via URL or Scan) */}
      <AnimatePresence mode="wait">
        {selectedDeviceId ? (
          <WarehouseDeviceDetails
            key={selectedDeviceId}
            deviceId={selectedDeviceId}
            rfidUid={selectedRfid || activeScanMeta?.tag_uid}
            warehouseId={activeScanMeta?.warehouse_id || 'WH-001'}
            warehouseDevice={activeScanMeta?.warehouse_device || 'FRESHNEX-WH-001'}
            lastScanTimestamp={activeScanMeta?.timestamp_ms}
            onBack={handleReturnToOverview}
          />
        ) : (
          /* VIEW B: WAREHOUSE OVERVIEW DASHBOARD */
          <motion.div
            key="overview"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="space-y-6"
          >
            {/* Overview Metrics Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Metric 1: Registered RFID Devices */}
              <motion.div
                whileHover={{ y: -3 }}
                className="p-5 rounded-2xl bg-white border border-[#13493B]/10 shadow-xs flex items-center justify-between"
              >
                <div>
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#5C7F75] block">
                    Registered RFID Devices
                  </span>
                  <span className="text-3xl font-black text-[#07221A] block mt-1">
                    {totalRegisteredDevices}
                  </span>
                  <span className="text-[10px] font-mono text-emerald-700 font-bold block mt-0.5">
                    Verified in /rfid_registry
                  </span>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-[#EBFBF4] text-[#13493B] border border-[#20E79A]/30 flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-6 h-6 text-[#20E79A]" />
                </div>
              </motion.div>

              {/* Metric 2: Total Warehouse Scans */}
              <motion.div
                whileHover={{ y: -3 }}
                className="p-5 rounded-2xl bg-white border border-[#13493B]/10 shadow-xs flex items-center justify-between"
              >
                <div>
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#5C7F75] block">
                    Total Warehouse Scans
                  </span>
                  <span className="text-3xl font-black text-[#07221A] block mt-1">
                    {totalScans}
                  </span>
                  <span className="text-[10px] font-mono text-[#5C7F75] font-semibold block mt-0.5">
                    Logged in /warehouse_scans
                  </span>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center shrink-0">
                  <History className="w-6 h-6" />
                </div>
              </motion.div>

              {/* Metric 3: Connected Warehouse Scanner Status */}
              <motion.div
                whileHover={{ y: -3 }}
                className="p-5 rounded-2xl bg-white border border-[#13493B]/10 shadow-xs flex items-center justify-between"
              >
                <div className="min-w-0">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#5C7F75] block truncate">
                    Warehouse Scanner Status
                  </span>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-base font-black text-[#07221A] truncate">
                      ACTIVE & ONLINE
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-[#5C7F75] block mt-0.5 truncate">
                    Reader: ESP32-RC522 (WH-001)
                  </span>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-[#07221A] text-[#20E79A] border border-[#20E79A]/30 flex items-center justify-center shrink-0">
                  <Radio className="w-6 h-6 animate-pulse" />
                </div>
              </motion.div>

              {/* Metric 4: Recently Scanned Products */}
              <motion.div
                whileHover={{ y: -3 }}
                className="p-5 rounded-2xl bg-white border border-[#13493B]/10 shadow-xs flex flex-col justify-between"
              >
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#5C7F75] block">
                  Recently Scanned Products
                </span>
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {recentlyScannedProducts.length > 0 ? (
                    recentlyScannedProducts.map((p) => (
                      <span
                        key={p.name}
                        className="px-2.5 py-1 rounded-lg text-[10px] font-black bg-[#EBFBF4] text-[#07221A] border border-[#20E79A]/30 flex items-center gap-1 shadow-2xs"
                      >
                        <Tag className="w-3 h-3 text-[#20E79A]" />
                        {p.name}
                        <span className="text-[9px] font-mono text-[#5C7F75]">({p.count})</span>
                      </span>
                    ))
                  ) : (
                    <span className="text-xs font-bold text-[#5C7F75]">No scans logged yet</span>
                  )}
                </div>
              </motion.div>
            </div>

            {/* Registered RFID Devices Section */}
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h3 className="text-base font-black text-[#07221A] flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-[#20E79A]" />
                    Registered RFID Devices in Warehouse Registry
                  </h3>
                  <p className="text-xs text-[#5C7F75]">
                    Authoritative devices registered in Firebase Realtime Database (/rfid_registry)
                  </p>
                </div>
                <span className="text-xs font-bold font-mono text-[#13493B] bg-[#EBFBF4] px-3 py-1 rounded-full border border-[#20E79A]/30 self-start sm:self-auto">
                  {registeredDevicesList.length} Units Active
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {registeredDevicesList.map((dev) => {
                  const { dateStr, timeStr } = dev.lastScanMs
                    ? formatRealtimeDateTime(dev.lastScanMs)
                    : { dateStr: 'No Scan Recorded', timeStr: '' };

                  return (
                    <motion.div
                      key={dev.uid}
                      whileHover={{ y: -3 }}
                      className="p-5 rounded-2xl bg-white border border-[#13493B]/10 hover:border-[#20E79A]/50 transition-all shadow-xs flex flex-col justify-between space-y-4"
                    >
                      <div className="space-y-3">
                        <div className="flex items-start justify-between gap-2">
                          <div className="space-y-0.5">
                            <span className="text-[10px] font-black uppercase tracking-wider text-[#20E79A] bg-[#07221A] px-2 py-0.5 rounded-md inline-block">
                              {dev.product}
                            </span>
                            <h4 className="text-lg font-black text-[#07221A] tracking-tight">
                              Device: {dev.deviceId}
                            </h4>
                          </div>
                          <span
                            className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase border ${
                              dev.online
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                                : 'bg-slate-100 text-slate-600 border-slate-300'
                            }`}
                          >
                            {dev.online ? 'Online' : 'Offline'}
                          </span>
                        </div>

                        <div className="space-y-1.5 text-xs bg-[#F4F7F6] p-3 rounded-xl border border-[#13493B]/8">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold text-[#5C7F75] uppercase">
                              RFID UID
                            </span>
                            <span className="font-mono font-black text-amber-700 bg-amber-100/80 px-2 py-0.5 rounded-md border border-amber-300">
                              {dev.uid}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold text-[#5C7F75] uppercase">
                              Registry Status
                            </span>
                            <span className="font-bold text-[#13493B]">
                              {dev.active ? 'Active Registration' : 'Inactive'}
                            </span>
                          </div>
                          <div className="flex items-center justify-between pt-1 border-t border-[#13493B]/10">
                            <span className="text-[10px] font-bold text-[#5C7F75] uppercase">
                              Last Scan
                            </span>
                            <span className="font-mono text-[11px] text-[#07221A]">
                              {dateStr} {timeStr ? `• ${timeStr}` : ''}
                            </span>
                          </div>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleOpenDevice(dev.deviceId, dev.uid)}
                        className="w-full py-2.5 px-4 rounded-xl bg-[#07221A] text-white hover:bg-[#134336] transition-all font-black text-xs flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                      >
                        <span>Open Device Details</span>
                        <ArrowRight className="w-3.5 h-3.5 text-[#20E79A]" />
                      </button>
                    </motion.div>
                  );
                })}
              </div>
            </div>

            {/* Real-time Warehouse Scan History Table */}
            <div className="space-y-4 pt-4 border-t border-[#13493B]/10">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-base font-black text-[#07221A] flex items-center gap-2">
                    <History className="w-4 h-4 text-[#20E79A]" />
                    Real-Time Warehouse Scan History (/warehouse_scans)
                  </h3>
                  <p className="text-xs text-[#5C7F75]">
                    Click any entry to automatically inspect that registered device
                  </p>
                </div>

                {/* Filters */}
                <div className="flex flex-wrap items-center gap-2">
                  <div className="relative min-w-[200px]">
                    <Search className="w-3.5 h-3.5 text-[#5C7F75] absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Search scan, UID, device..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full bg-white border border-[#13493B]/15 pl-8 pr-3 py-1.5 rounded-xl text-xs font-bold text-[#07221A] focus:outline-none focus:border-[#20E79A]"
                    />
                  </div>

                  <select
                    value={productFilter}
                    onChange={(e) => setProductFilter(e.target.value)}
                    className="bg-white border border-[#13493B]/15 px-3 py-1.5 rounded-xl text-xs font-bold text-[#07221A] focus:outline-none focus:border-[#20E79A] cursor-pointer"
                  >
                    <option value="ALL">All Products</option>
                    {availableProducts.map((prod) => (
                      <option key={prod} value={prod}>
                        {prod.charAt(0).toUpperCase() + prod.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Table Container */}
              <div className="bg-white rounded-2xl border border-[#13493B]/10 shadow-xs overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-[#F4F7F6] border-b border-[#13493B]/10 text-[10px] font-black uppercase tracking-wider text-[#5C7F75]">
                        <th className="py-3 px-4">Time</th>
                        <th className="py-3 px-4">RFID UID</th>
                        <th className="py-3 px-4">Product</th>
                        <th className="py-3 px-4">Device ID</th>
                        <th className="py-3 px-4">Warehouse</th>
                        <th className="py-3 px-4">Status</th>
                        <th className="py-3 px-4 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#13493B]/8">
                      {filteredScans.length > 0 ? (
                        filteredScans.map((scan) => {
                          const { dateStr, timeStr } = formatRealtimeDateTime(scan.timestamp_ms);
                          const isVerified = scan.verified === true;
                          const isIdentified =
                            String(scan.scanner_status || '').toLowerCase() === 'identified';
                          const prodLabel = scan.product
                            ? scan.product.charAt(0).toUpperCase() + scan.product.slice(1).toLowerCase()
                            : 'Monitored';

                          return (
                            <tr
                              key={scan.id}
                              onClick={() => {
                                if (scan.device_id) {
                                  handleOpenDevice(scan.device_id, scan.tag_uid);
                                }
                              }}
                              className="hover:bg-[#EBFBF4]/60 transition-colors cursor-pointer group"
                            >
                              <td className="py-3 px-4">
                                <span className="font-bold text-[#07221A] block">{dateStr}</span>
                                <span className="text-[10px] font-mono text-[#5C7F75]">
                                  {timeStr}
                                </span>
                              </td>
                              <td className="py-3 px-4">
                                <span className="font-mono font-bold text-amber-800 bg-amber-100/80 px-2 py-0.5 rounded-md border border-amber-300">
                                  {scan.tag_uid || 'N/A'}
                                </span>
                              </td>
                              <td className="py-3 px-4 font-bold text-[#07221A]">
                                {prodLabel}
                              </td>
                              <td className="py-3 px-4 font-mono font-bold text-[#13493B]">
                                {scan.device_id || 'N/A'}
                              </td>
                              <td className="py-3 px-4 font-bold text-[#5C7F75]">
                                {scan.warehouse_id || 'WH-001'}
                              </td>
                              <td className="py-3 px-4">
                                <span
                                  className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black ${
                                    isVerified && isIdentified
                                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                      : 'bg-amber-100 text-amber-800 border border-amber-300'
                                  }`}
                                >
                                  {isVerified && isIdentified ? (
                                    <>
                                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                      Identified
                                    </>
                                  ) : (
                                    <>
                                      <AlertTriangle className="w-3 h-3 text-amber-600" />
                                      {scan.scanner_status || 'Unverified'}
                                    </>
                                  )}
                                </span>
                              </td>
                              <td className="py-3 px-4 text-right">
                                <span className="inline-flex items-center gap-1 text-[11px] font-black text-[#13493B] group-hover:text-[#20E79A] transition-colors">
                                  View Details
                                  <ChevronRight className="w-3.5 h-3.5" />
                                </span>
                              </td>
                            </tr>
                          );
                        })
                      ) : (
                        <tr>
                          <td colSpan={7} className="py-8 text-center text-xs font-semibold text-[#5C7F75]">
                            {loading
                              ? 'Loading warehouse scans from Firebase...'
                              : 'No warehouse scans found matching filters.'}
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

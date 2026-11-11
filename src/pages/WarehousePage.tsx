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
  const [permissionError, setPermissionError] = useState<string | null>(null);

  const isDevicePermitted = (devId: string): boolean => {
    if (!warehouseSession || !warehouseSession.permittedDevices || warehouseSession.permittedDevices.length === 0) {
      return true;
    }
    return warehouseSession.permittedDevices.some(
      (d) => d.trim().toUpperCase() === devId.trim().toUpperCase()
    );
  };

  // Selected device query params or active RFID session device (unless user explicitly returned to overview)
  const queryDeviceId = searchParams.get('deviceId') || searchParams.get('id');
  const queryRfid = searchParams.get('rfid');
  const rawSelectedDeviceId =
    queryDeviceId ||
    (!manualOverviewMode && (warehouseSession?.selectedDeviceId || warehouseSession?.deviceId)
      ? warehouseSession?.selectedDeviceId || warehouseSession?.deviceId
      : null);

  const isPermitted = rawSelectedDeviceId ? isDevicePermitted(rawSelectedDeviceId) : true;
  const selectedDeviceId = isPermitted ? rawSelectedDeviceId : null;
  const selectedRfid =
    queryRfid ||
    (!manualOverviewMode && (warehouseSession?.selectedTagUid || warehouseSession?.tagUid)
      ? warehouseSession?.selectedTagUid || warehouseSession?.tagUid
      : null);

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
        if (!isDevicePermitted(detail.deviceId)) {
          setPermissionError('Access denied. This device is not assigned to your warehouse.');
          return;
        }
        setPermissionError(null);
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
    if (!isDevicePermitted(deviceId)) {
      setPermissionError('Access denied. This device is not assigned to your warehouse.');
      return;
    }
    setPermissionError(null);
    setManualOverviewMode(false);
    setSearchParams({
      deviceId,
      rfid: rfidUid || '',
    });
  };

  const handleReturnToOverview = () => {
    setPermissionError(null);
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

  const latestScan = scansList.length > 0 ? scansList[0] : null;
  const latestScanUid = latestScan?.tag_uid || 'None';
  const { dateStr: lastScanDate, timeStr: lastScanTime } = latestScan?.timestamp_ms
    ? formatRealtimeDateTime(latestScan.timestamp_ms)
    : { dateStr: 'Awaiting scan', timeStr: '' };

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
              <span>Back to RFID Devices</span>
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

      {/* Permission Error Banner */}
      {permissionError && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-300 text-rose-800 text-xs font-bold flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2.5">
            <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
            <span>{permissionError}</span>
          </div>
          <button
            type="button"
            onClick={() => setPermissionError(null)}
            className="px-3 py-1.5 rounded-xl bg-rose-600 text-white hover:bg-rose-700 text-xs font-black cursor-pointer transition-colors"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Prominent Active Warehouse Session Banner */}
      {(warehouseSession || userProfile?.role === 'warehouse') && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 sm:p-5 rounded-2xl bg-[#07221A] border border-[#20E79A]/40 text-white flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl"
        >
          <div className="flex items-start sm:items-center gap-3.5 min-w-0">
            <div className="w-12 h-12 rounded-2xl bg-[#20E79A]/15 border border-[#20E79A]/40 text-[#20E79A] flex items-center justify-center shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div className="min-w-0 space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] font-black uppercase tracking-wider text-[#20E79A] bg-[#20E79A]/15 px-2.5 py-0.5 rounded-md border border-[#20E79A]/30">
                  Authenticated Warehouse Session
                </span>
                <span className="font-mono font-black text-white text-xs bg-white/10 px-2 py-0.5 rounded-md border border-white/15">
                  ID: {warehouseSession?.warehouseId || 'WH-001'}
                </span>
                <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold text-emerald-400">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping inline-block" />
                  Live Verified
                </span>
              </div>
              <div className="text-xs text-[#D5E6DF] flex items-center gap-2 flex-wrap">
                <span className="font-bold text-white">
                  {warehouseSession?.warehouseName || 'Central FreshNex Hub'}
                </span>
                {warehouseSession?.location && (
                  <span className="text-[#8AB5A8] hidden sm:inline">
                    • {warehouseSession.location}
                  </span>
                )}
                <span className="text-[#8AB5A8]">
                  • Scanner: <strong className="font-mono text-white">{warehouseSession?.scannerDevice || 'FRESHNEX-WH-001'}</strong>
                </span>
                {warehouseSession?.permittedDevices && warehouseSession.permittedDevices.length > 0 && (
                  <span className="text-[#20E79A] font-mono text-[11px]">
                    • Permitted: [{warehouseSession.permittedDevices.join(', ')}]
                  </span>
                )}
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={handleWarehouseLogout}
            className="px-4 py-2.5 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 border border-rose-400/40 text-rose-300 hover:text-rose-100 text-xs font-bold flex items-center gap-2 cursor-pointer transition-colors shadow-xs shrink-0 self-end md:self-auto"
          >
            <LogOut className="w-4 h-4" />
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
            warehouseId={activeScanMeta?.warehouse_id || warehouseSession?.warehouseId || 'WH-001'}
            warehouseDevice={activeScanMeta?.warehouse_device || warehouseSession?.scannerDevice || 'FRESHNEX-WH-001'}
            lastScanTimestamp={activeScanMeta?.timestamp_ms}
            onBack={handleReturnToOverview}
          />
        ) : (
          /* VIEW B: WAREHOUSE RFID SCANNER TERMINAL */
          <motion.div
            key="overview"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="space-y-6 max-w-4xl mx-auto py-6"
          >
            {/* RFID Scanner Terminal Card */}
            <div className="bg-gradient-to-br from-[#07221A] via-[#0A2E23] to-[#041410] rounded-[32px] border border-[#20E79A]/40 p-8 sm:p-12 text-white shadow-[0_24px_60px_rgba(7,34,26,0.45)] relative overflow-hidden text-center space-y-6">
              {/* Glow orb */}
              <div className="absolute -top-24 -right-24 w-80 h-80 bg-gradient-to-bl from-[#20E79A]/25 to-transparent rounded-full blur-3xl pointer-events-none" />
              <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-gradient-to-tr from-emerald-500/20 to-transparent rounded-full blur-3xl pointer-events-none" />

              <div className="relative z-15 space-y-4">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#20E79A]/15 text-[#20E79A] border border-[#20E79A]/40 text-xs font-black uppercase tracking-wider shadow-inner">
                  <Radio className="w-4 h-4 text-[#20E79A] animate-pulse" /> ESP32-RC522 Hardware Scanner Active
                </div>

                <div className="w-24 h-24 mx-auto rounded-3xl bg-[#20E79A]/10 border border-[#20E79A]/30 flex items-center justify-center text-[#20E79A] shadow-2xl relative">
                  <div className="absolute inset-0 rounded-3xl bg-[#20E79A]/20 animate-ping" />
                  <Radio className="w-12 h-12 relative z-10 animate-pulse" />
                </div>

                <div className="space-y-2 max-w-lg mx-auto">
                  <span className="text-xs font-mono font-black uppercase tracking-widest text-[#20E79A] bg-white/10 px-3 py-1 rounded-full border border-white/15 inline-block">
                    Status: Waiting for RFID scan
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight pt-1">
                    Tap a registered RFID card on the scanner to view its live product data.
                  </h2>
                  <p className="text-xs font-semibold text-[#8AB5A8]">
                    Real-time listener active on /warehouse_scans. No manual selection required.
                  </p>
                </div>

                {/* Scan Telemetry Bar */}
                <div className="pt-4 border-t border-white/10 grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-md mx-auto text-xs font-mono">
                  <div className="p-3 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between">
                    <span className="text-[#8AB5A8]">Last Scanned UID:</span>
                    <span className="font-bold text-amber-300">{latestScanUid}</span>
                  </div>
                  <div className="p-3 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between">
                    <span className="text-[#8AB5A8]">Last Scan Time:</span>
                    <span className="font-bold text-white">{lastScanDate} {lastScanTime ? `• ${lastScanTime}` : ''}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Live Product Monitoring Area (Waiting State) */}
            <div className="p-8 rounded-[32px] bg-white border border-[#13493B]/10 text-center space-y-3 shadow-xs">
              <div className="w-12 h-12 mx-auto rounded-2xl bg-[#EBFBF4] text-[#13493B] border border-[#20E79A]/30 flex items-center justify-center">
                <Cpu className="w-6 h-6 text-[#20E79A]" />
              </div>
              <h3 className="text-base font-black text-[#07221A]">
                Waiting for RFID scan...
              </h3>
              <p className="text-xs text-[#5C7F75] font-semibold max-w-sm mx-auto">
                Scan any registered product RFID card to automatically open its live telemetry, sensors, and freshness quality metrics.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

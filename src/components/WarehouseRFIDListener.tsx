import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { getDirectDatabase } from '../services/firebaseService';
import { ensureFirebaseAuthenticated, auth } from '../firebase/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { ref, onValue, get, off, query, limitToLast } from 'firebase/database';
import { useApp } from '../context/AppContext';
import { useAuth, WarehouseSession } from '../context/AuthContext';
import { CheckCircle2, AlertTriangle, Radio, X, Cpu, ShieldCheck, Warehouse } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export interface WarehouseScanRecord {
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

export type RFIDScanStatus = 'waiting' | 'detected' | 'verifying' | 'granted' | 'denied';

export interface RFIDStatusEventDetail {
  status: RFIDScanStatus;
  message?: string;
  tagUid?: string;
  deviceId?: string;
  product?: string;
}

interface RFIDNotificationState {
  id: string;
  title: string;
  message?: string;
  type: 'success' | 'warning' | 'error';
  details?: {
    product: string;
    deviceId: string;
    rfidUid: string;
    warehouse: string;
    status: string;
  };
}

function formatProductLabel(rawProduct?: string): string {
  if (!rawProduct) return 'Unknown';
  const clean = rawProduct.trim();
  if (!clean) return 'Unknown';
  return clean.charAt(0).toUpperCase() + clean.slice(1).toLowerCase();
}

export const WarehouseRFIDListener: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { devicesMap, addScanToHistory } = useApp();
  const { loginWithWarehouseRFID, currentUser, userProfile } = useAuth();
  const [notification, setNotification] = useState<RFIDNotificationState | null>(null);

  // Track processed Firebase scan keys and timestamps across rerenders
  const processedKeysRef = useRef<Set<string>>(new Set());
  const baselineInitializedRef = useRef<boolean>(false);
  const baselineKeyRef = useRef<string | null>(null);
  const lastProcessedTimeRef = useRef<number>(Date.now());
  const registryCacheRef = useRef<Record<string, RFIDRegistryEntry>>({});
  const devicesMapRef = useRef(devicesMap);
  const navigateRef = useRef(navigate);
  const locationRef = useRef(location);
  const addScanRef = useRef(addScanToHistory);
  const loginWithRfidRef = useRef(loginWithWarehouseRFID);
  const currentUserRef = useRef(currentUser);
  const userProfileRef = useRef(userProfile);
  const dismissTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isBindingRef = useRef<boolean>(false);
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    devicesMapRef.current = devicesMap;
  }, [devicesMap]);

  useEffect(() => {
    navigateRef.current = navigate;
  }, [navigate]);

  useEffect(() => {
    locationRef.current = location;
  }, [location]);

  useEffect(() => {
    addScanRef.current = addScanToHistory;
  }, [addScanToHistory]);

  useEffect(() => {
    loginWithRfidRef.current = loginWithWarehouseRFID;
  }, [loginWithWarehouseRFID]);

  useEffect(() => {
    currentUserRef.current = currentUser;
    userProfileRef.current = userProfile;
  }, [currentUser, userProfile]);

  const dispatchStatus = (detail: RFIDStatusEventDetail) => {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('freshnex_rfid_status', { detail }));
    }
  };

  const showNotification = (next: RFIDNotificationState, durationMs = 6000) => {
    if (dismissTimerRef.current) {
      clearTimeout(dismissTimerRef.current);
    }
    setNotification(next);
    dismissTimerRef.current = setTimeout(() => {
      setNotification((curr) => (curr?.id === next.id ? null : curr));
    }, durationMs);
  };

  // Authoritative scan processor used for real-time ESP32 scans
  const processScan = async (record: WarehouseScanRecord | null, scanKey: string) => {
    console.log('[FRESHNEX RFID] Processing scan record', { scanKey, record });

    if (!record || typeof record !== 'object') {
      const msg = 'Access Denied — RFID verification failed.';
      dispatchStatus({ status: 'denied', message: msg });
      showNotification({
        id: scanKey,
        title: msg,
        type: 'error',
      });
      return;
    }

    const rawUid = record.tag_uid ? String(record.tag_uid).trim().toUpperCase() : '';
    const warehouseLabel = record.warehouse_id || record.warehouse_device || 'WH-001';

    // 1. Emit: RFID detected
    dispatchStatus({
      status: 'detected',
      tagUid: rawUid,
      message: 'RFID detected. Reading tag data...',
    });

    // Small delay to allow UI state transition: Waiting -> Detected -> Verifying
    await new Promise((resolve) => setTimeout(resolve, 250));

    // 2. Emit: Verifying RFID
    dispatchStatus({
      status: 'verifying',
      tagUid: rawUid,
      message: 'Verifying RFID credentials against /rfid_registry...',
    });

    if (!rawUid) {
      const msg = 'Access Denied — RFID verification failed.';
      dispatchStatus({ status: 'denied', message: msg });
      showNotification({
        id: scanKey,
        title: msg,
        type: 'warning',
      });
      return;
    }

    // 3. Look up UID dynamically in /rfid_registry from Firebase
    const db = getDirectDatabase();
    let registryEntry: RFIDRegistryEntry | undefined = undefined;

    if (db) {
      try {
        const directRegSnap = await get(ref(db, `rfid_registry/${rawUid}`));
        if (directRegSnap.exists()) {
          registryEntry = directRegSnap.val() as RFIDRegistryEntry;
          registryCacheRef.current[rawUid] = registryEntry;
        } else {
          const fullRegSnap = await get(ref(db, 'rfid_registry'));
          if (fullRegSnap.exists()) {
            const allReg = fullRegSnap.val();
            if (allReg && typeof allReg === 'object') {
              for (const [k, v] of Object.entries(allReg)) {
                const normKey = k.trim().toUpperCase();
                registryCacheRef.current[normKey] = v as RFIDRegistryEntry;
                if (normKey === rawUid) {
                  registryEntry = v as RFIDRegistryEntry;
                }
              }
            }
          }
        }
      } catch (regErr: any) {
        console.warn('[FRESHNEX RFID] Registry direct lookup notice:', regErr?.message || regErr);
        registryEntry = registryCacheRef.current[rawUid];
      }
    } else {
      registryEntry = registryCacheRef.current[rawUid];
    }

    // Check 1: Does RFID UID exist in /rfid_registry?
    if (!registryEntry || typeof registryEntry !== 'object') {
      const msg = 'Access Denied — RFID card is not registered.';
      console.warn('[FRESHNEX RFID] Unregistered RFID UID:', rawUid);
      dispatchStatus({
        status: 'denied',
        message: msg,
        tagUid: rawUid,
      });
      showNotification({
        id: scanKey,
        title: msg,
        type: 'error',
        details: {
          product: formatProductLabel(record.product),
          deviceId: record.device_id || 'Unassigned',
          rfidUid: rawUid,
          warehouse: warehouseLabel,
          status: 'Unregistered',
        },
      });
      return;
    }

    // Check 2: Is the RFID card active (active === true)?
    if (registryEntry.active !== true) {
      const msg = 'Access Denied — This RFID card is inactive.';
      console.warn('[FRESHNEX RFID] Inactive RFID tag:', rawUid);
      dispatchStatus({
        status: 'denied',
        message: msg,
        tagUid: rawUid,
      });
      showNotification({
        id: scanKey,
        title: msg,
        type: 'warning',
        details: {
          product: formatProductLabel(registryEntry.product),
          deviceId: registryEntry.device_id || 'N/A',
          rfidUid: rawUid,
          warehouse: warehouseLabel,
          status: 'Inactive',
        },
      });
      return;
    }

    // Check 3: Authoritative device ID and product from /rfid_registry
    const authoritativeDeviceId = registryEntry.device_id ? String(registryEntry.device_id).trim() : '';
    const authoritativeProduct = registryEntry.product ? String(registryEntry.product).trim().toLowerCase() : '';

    // Check 4: Verify scan has verified === true, scanner_status === "identified",
    // and confirm registered device ID and product match the scan record
    const isScanVerified = record.verified === true;
    const isStatusIdentified =
      String(record.scanner_status || '').trim().toLowerCase() === 'identified';
    const scanDeviceId = record.device_id ? String(record.device_id).trim() : '';
    const scanProduct = record.product ? String(record.product).trim().toLowerCase() : '';

    const deviceMatches = !scanDeviceId || scanDeviceId === authoritativeDeviceId;
    const productMatches = !scanProduct || !authoritativeProduct || scanProduct === authoritativeProduct;

    if (!isScanVerified || !isStatusIdentified || !deviceMatches || !productMatches) {
      const msg = 'Access Denied — RFID verification failed.';
      console.warn('[FRESHNEX RFID] Scan verification or registry match failed:', {
        verified: record.verified,
        scanner_status: record.scanner_status,
        scanDeviceId,
        authoritativeDeviceId,
        scanProduct,
        authoritativeProduct,
      });
      dispatchStatus({
        status: 'denied',
        message: msg,
        tagUid: rawUid,
      });
      showNotification({
        id: scanKey,
        title: msg,
        type: 'warning',
      });
      return;
    }

    // Check 5: Confirm device exists in /devices/{authoritativeDeviceId}
    if (!authoritativeDeviceId) {
      const msg = 'Device identified, but device information is unavailable.';
      dispatchStatus({
        status: 'denied',
        message: msg,
        tagUid: rawUid,
      });
      showNotification({
        id: scanKey,
        title: msg,
        type: 'error',
      });
      return;
    }

    let deviceExists = Boolean(devicesMapRef.current[authoritativeDeviceId]);
    if (db) {
      try {
        const devSnap = await get(ref(db, `devices/${authoritativeDeviceId}`));
        deviceExists = devSnap.exists();
      } catch (devErr: any) {
        console.warn('[FRESHNEX RFID] Device existence check notice:', devErr?.message || devErr);
      }
    }

    if (!deviceExists) {
      const msg = 'Device identified, but device information is unavailable.';
      console.warn('[FRESHNEX RFID] Device node not found in /devices:', authoritativeDeviceId);
      dispatchStatus({
        status: 'denied',
        message: msg,
        tagUid: rawUid,
        deviceId: authoritativeDeviceId,
      });
      showNotification({
        id: scanKey,
        title: msg,
        type: 'error',
        details: {
          product: formatProductLabel(registryEntry.product),
          deviceId: authoritativeDeviceId,
          rfidUid: rawUid,
          warehouse: warehouseLabel,
          status: 'Unavailable',
        },
      });
      return;
    }

    const displayProduct = formatProductLabel(registryEntry.product);

    // Record scan in history non-blockingly
    try {
      addScanRef.current(authoritativeDeviceId, displayProduct).catch(() => {});
    } catch {}

    // Check current route and session before creating a Warehouse session or navigating:
    // Do not unexpectedly replace an existing Admin or User session when they are on another page
    const currentPath = locationRef.current.pathname;
    const isLoginOrRoot = currentPath === '/login' || currentPath === '/' || currentPath === '';
    const isWarehouse = currentPath.startsWith('/warehouse');
    const hasActiveUserOrAdminSession =
      Boolean(currentUserRef.current) &&
      (userProfileRef.current?.role === 'admin' || userProfileRef.current?.role === 'user');

    if (!isLoginOrRoot && !isWarehouse && hasActiveUserOrAdminSession) {
      console.log(
        '[FRESHNEX RFID] Active User/Admin session on',
        currentPath,
        '- scan logged without replacing session.'
      );
      showNotification({
        id: scanKey,
        title: `Warehouse Scan Logged: ${authoritativeDeviceId} (${displayProduct})`,
        type: 'success',
        details: {
          product: displayProduct,
          deviceId: authoritativeDeviceId,
          rfidUid: rawUid,
          warehouse: warehouseLabel,
          status: 'Verified',
        },
      });
      return;
    }

    console.log('[FRESHNEX RFID] Access Granted:', `${authoritativeDeviceId} (${displayProduct})`);

    // 4. Emit: Access granted
    dispatchStatus({
      status: 'granted',
      message: `Access Granted — Device ${authoritativeDeviceId} (${displayProduct}) identified. Opening Warehouse...`,
      tagUid: rawUid,
      deviceId: authoritativeDeviceId,
      product: displayProduct,
    });

    // 5. Authenticate into dedicated Warehouse Session
    const warehouseSessionData: WarehouseSession = {
      tagUid: rawUid,
      deviceId: authoritativeDeviceId,
      product: displayProduct,
      warehouseId: warehouseLabel,
      warehouseDevice: record.warehouse_device || 'FRESHNEX-WH-001',
      authenticatedAt: Date.now(),
    };

    try {
      await loginWithRfidRef.current(warehouseSessionData);
    } catch (authErr) {
      console.warn('[FRESHNEX RFID] Warehouse session error:', authErr);
    }

    // Notification toast
    showNotification({
      id: scanKey,
      title: `RFID detected. Device ${authoritativeDeviceId} opened in Warehouse.`,
      type: 'success',
      details: {
        product: displayProduct,
        deviceId: authoritativeDeviceId,
        rfidUid: rawUid,
        warehouse: warehouseLabel,
        status: 'Verified',
      },
    });

    // Dispatch custom scan event for active Warehouse pages
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('freshnex_warehouse_rfid_scan', {
          detail: {
            deviceId: authoritativeDeviceId,
            product: displayProduct,
            tagUid: rawUid,
            warehouseId: warehouseLabel,
            warehouseDevice: record.warehouse_device || 'FRESHNEX-WH-001',
            scanKey,
            timestampMs: record.timestamp_ms || Date.now(),
          },
        })
      );
    }

    // 6. Navigate directly to /warehouse and open the device associated with the RFID scan
    const targetUrl = `/warehouse?deviceId=${encodeURIComponent(authoritativeDeviceId)}&rfid=${encodeURIComponent(rawUid)}`;
    setTimeout(() => {
      navigateRef.current(targetUrl);
    }, 80);
  };

  useEffect(() => {
    let isCancelled = false;
    let isSubscribed = false;
    let cleanupScanListener: (() => void) | null = null;
    let cleanupRegistryListener: (() => void) | null = null;

    const bindListeners = async (forceRebind = false) => {
      if (isCancelled || isBindingRef.current) return;
      if (isSubscribed && !forceRebind) return;
      isBindingRef.current = true;

      // Clean up previous listeners if rebinding
      if (cleanupScanListener) {
        cleanupScanListener();
        cleanupScanListener = null;
      }
      if (cleanupRegistryListener) {
        cleanupRegistryListener();
        cleanupRegistryListener = null;
      }
      isSubscribed = false;

      const db = getDirectDatabase();
      if (!db) {
        isBindingRef.current = false;
        return;
      }

      // Ensure Firebase Auth session is active so /warehouse_scans and /rfid_registry are permitted
      await ensureFirebaseAuthenticated();
      if (isCancelled) {
        isBindingRef.current = false;
        return;
      }

      const registryRef = ref(db, 'rfid_registry');

      // 1. Keep /rfid_registry synchronized in memory
      const handleRegistryValue = (snapshot: any) => {
        if (snapshot.exists()) {
          const val = snapshot.val();
          if (val && typeof val === 'object') {
            const normalized: Record<string, RFIDRegistryEntry> = {};
            Object.entries(val).forEach(([uid, entry]) => {
              normalized[uid.trim().toUpperCase()] = entry as RFIDRegistryEntry;
            });
            registryCacheRef.current = normalized;
          }
        }
      };

      const unsubRegistry = onValue(
        registryRef,
        handleRegistryValue,
        async (err) => {
          console.warn('[FRESHNEX RFID] Registry listener notice:', err?.message || err);
          isSubscribed = false;
          if (err?.message?.includes('permission_denied') || err?.message?.includes('Permission denied')) {
            await ensureFirebaseAuthenticated();
            scheduleReconnect(1000, true);
          }
        }
      );

      cleanupRegistryListener = () => {
        unsubRegistry();
        off(registryRef, 'value', handleRegistryValue);
      };

      // 2. Subscribe once to /warehouse_scans (latest 25 records)
      // On initial snapshot, record all existing child keys so historical scans are never replayed as logins.
      const scansQuery = query(ref(db, 'warehouse_scans'), limitToLast(25));
      const handleScansValue = async (snapshot: any) => {
        if (isCancelled) return;
        if (!snapshot.exists()) {
          if (!baselineInitializedRef.current) {
            baselineInitializedRef.current = true;
            dispatchStatus({ status: 'waiting', message: 'Waiting for RFID scan...' });
          }
          return;
        }

        const val = snapshot.val();
        if (!val || typeof val !== 'object') return;

        const entries: [string, WarehouseScanRecord][] = Object.entries(val);
        entries.sort((a, b) => {
          const tA = Number(a[1]?.timestamp_ms) || 0;
          const tB = Number(b[1]?.timestamp_ms) || 0;
          if (tA !== tB) return tA - tB;
          return a[0].localeCompare(b[0]);
        });

        // Initial snapshot baseline check: record all existing child keys without triggering login
        if (!baselineInitializedRef.current) {
          baselineInitializedRef.current = true;
          entries.forEach(([k]) => processedKeysRef.current.add(k));
          if (entries.length > 0) {
            baselineKeyRef.current = entries[entries.length - 1][0];
          }
          console.log('[FRESHNEX RFID] Live scanner baseline ready. Listening on /warehouse_scans...');
          dispatchStatus({ status: 'waiting', message: 'Waiting for RFID scan...' });
          return;
        }

        // Process only newly added scan keys (deduplicated by Firebase child key)
        for (const [scanKey, record] of entries) {
          if (!processedKeysRef.current.has(scanKey)) {
            processedKeysRef.current.add(scanKey);
            baselineKeyRef.current = scanKey;
            lastProcessedTimeRef.current = Date.now();
            console.log('[FRESHNEX RFID] New scan detected from ESP32:', scanKey, record);
            await processScan(record, scanKey);
          }
        }
      };

      const unsubScans = onValue(
        scansQuery,
        handleScansValue,
        async (error) => {
          console.warn('[FRESHNEX RFID] Warehouse scans listener notice:', error?.message || error);
          isSubscribed = false;
          if (error?.message?.includes('permission_denied') || error?.message?.includes('Permission denied')) {
            await ensureFirebaseAuthenticated();
            scheduleReconnect(1000, true);
          }
        }
      );

      cleanupScanListener = () => {
        unsubScans();
        off(scansQuery, 'value', handleScansValue);
      };

      isSubscribed = true;
      isBindingRef.current = false;
    };

    const scheduleReconnect = (delayMs = 1000, force = false) => {
      if (reconnectTimerRef.current) clearTimeout(reconnectTimerRef.current);
      reconnectTimerRef.current = setTimeout(() => {
        if (!isCancelled) {
          isBindingRef.current = false;
          bindListeners(force);
        }
      }, delayMs);
    };

    // Initial binding
    bindListeners(true);

    // If Firebase Auth ever drops to null (e.g. after Admin signOut), restore anonymous RTDB auth and ensure listener is bound
    let unsubAuth: (() => void) | null = null;
    if (auth) {
      unsubAuth = onAuthStateChanged(auth, async (user) => {
        if (!user) {
          await ensureFirebaseAuthenticated();
          scheduleReconnect(300, true);
        } else if (!isSubscribed) {
          scheduleReconnect(200, false);
        }
      });
    }

    // Listen for custom warehouse logout event: resets UI status to waiting while keeping listener continuously active
    const handleLogoutEvent = async () => {
      console.log('[FRESHNEX RFID] Warehouse logout event caught. Ready for next scan.');
      dispatchStatus({ status: 'waiting', message: 'Waiting for RFID scan...' });
      lastProcessedTimeRef.current = Date.now();
      await ensureFirebaseAuthenticated();
      if (!isSubscribed) {
        scheduleReconnect(200, true);
      }
    };

    window.addEventListener('freshnex_warehouse_logout', handleLogoutEvent);

    return () => {
      isCancelled = true;
      isSubscribed = false;
      if (reconnectTimerRef.current) clearTimeout(reconnectTimerRef.current);
      if (cleanupScanListener) cleanupScanListener();
      if (cleanupRegistryListener) cleanupRegistryListener();
      if (unsubAuth) unsubAuth();
      window.removeEventListener('freshnex_warehouse_logout', handleLogoutEvent);
    };
  }, []);

  return (
    <AnimatePresence>
      {notification && (
        <motion.div
          key={notification.id}
          initial={{ opacity: 0, y: -24, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.96 }}
          transition={{ duration: 0.22 }}
          className="fixed top-4 right-4 z-50 max-w-sm w-full bg-[#07221A]/95 backdrop-blur-xl border border-[#20E79A]/40 p-4 rounded-2xl shadow-[0_20px_50px_rgba(7,34,26,0.45)] text-white"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3 min-w-0">
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 border ${
                  notification.type === 'success'
                    ? 'bg-[#20E79A]/15 border-[#20E79A]/40 text-[#20E79A]'
                    : notification.type === 'warning'
                    ? 'bg-amber-500/15 border-amber-400/40 text-amber-400'
                    : 'bg-rose-500/15 border-rose-400/40 text-rose-400'
                }`}
              >
                {notification.type === 'success' && <CheckCircle2 className="w-5 h-5" />}
                {notification.type === 'warning' && <AlertTriangle className="w-5 h-5" />}
                {notification.type === 'error' && <AlertTriangle className="w-5 h-5" />}
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <Radio className="w-3.5 h-3.5 text-[#20E79A] animate-pulse shrink-0" />
                  <span className="text-[10px] font-black uppercase tracking-wider text-[#20E79A]">
                    Warehouse RFID Scanner
                  </span>
                </div>
                <h4 className="text-sm font-black text-white mt-0.5 tracking-tight">
                  {notification.title}
                </h4>
                {notification.message && (
                  <p className="text-xs font-medium text-[#D5E6DF] mt-1 leading-relaxed">
                    {notification.message}
                  </p>
                )}
              </div>
            </div>

            <button
              type="button"
              onClick={() => setNotification(null)}
              className="text-white/60 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors cursor-pointer shrink-0"
              aria-label="Dismiss notification"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {notification.details && (
            <div className="mt-3 pt-3 border-t border-white/10 grid grid-cols-2 gap-2 text-[11px] bg-white/5 rounded-xl p-2.5">
              <div>
                <span className="text-[9px] font-bold uppercase tracking-wider text-[#8AB5A8] block">
                  Product
                </span>
                <span className="font-black text-white">{notification.details.product}</span>
              </div>
              <div>
                <span className="text-[9px] font-bold uppercase tracking-wider text-[#8AB5A8] block">
                  Device ID
                </span>
                <span className="font-mono font-black text-[#20E79A]">
                  {notification.details.deviceId}
                </span>
              </div>
              <div>
                <span className="text-[9px] font-bold uppercase tracking-wider text-[#8AB5A8] block">
                  RFID UID
                </span>
                <span className="font-mono font-bold text-amber-300">
                  {notification.details.rfidUid}
                </span>
              </div>
              <div>
                <span className="text-[9px] font-bold uppercase tracking-wider text-[#8AB5A8] block">
                  Warehouse
                </span>
                <span className="font-bold text-white flex items-center gap-1">
                  <Warehouse className="w-3 h-3 text-[#20E79A]" />
                  {notification.details.warehouse}
                </span>
              </div>
              <div className="col-span-2 flex items-center justify-between pt-1 border-t border-white/10">
                <span className="text-[9px] font-bold uppercase tracking-wider text-[#8AB5A8] flex items-center gap-1">
                  <Cpu className="w-3 h-3 text-[#20E79A]" />
                  Status
                </span>
                <span
                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black ${
                    notification.type === 'success'
                      ? 'bg-[#20E79A]/20 text-[#20E79A] border border-[#20E79A]/40'
                      : 'bg-amber-500/20 text-amber-300 border border-amber-400/40'
                  }`}
                >
                  <ShieldCheck className="w-3 h-3" />
                  {notification.details.status}
                </span>
              </div>
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

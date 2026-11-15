import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { getDirectDatabase } from '../services/firebaseService';
import {
  ensureFirebaseAuthenticated,
  auth,
  getActiveFirebaseConfig,
  DEFAULT_REALTIME_DATABASE_URL,
} from '../firebase/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { ref, onValue, get, off, query, limitToLast } from 'firebase/database';
import { useApp } from '../context/AppContext';
import { useAuth, WarehouseSession } from '../context/AuthContext';
import { CheckCircle2, AlertTriangle, Radio, X, Cpu, ShieldCheck, Warehouse } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import {
  normalizeRfidUid,
  resolveRfidScanTimestamp,
  findRegistryEntryByUid,
} from '../utils/rfidUtils';

export type ScanSource = 'warehouse_scans' | 'device_rfid_scans';

export interface WarehouseScanRecord {
  tag_uid?: string;
  rfid_uid?: string;
  uid?: string;
  device_id?: string;
  product?: string;
  warehouse_id?: string;
  warehouse_device?: string;
  timestamp_ms?: number;
  detected_at_ms?: number;
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
  const { warehouseSession, setWarehouseSelectedDevice, currentUser, userProfile } = useAuth();
  const [notification, setNotification] = useState<RFIDNotificationState | null>(null);

  // Track processed Firebase scan keys and per-source baselines across rerenders
  const processedKeysRef = useRef<Set<string>>(new Set());
  const warehouseBaselineInitializedRef = useRef<boolean>(false);
  const deviceScansBaselineInitializedRef = useRef<boolean>(false);
  const recentPhysicalScansRef = useRef<
    Record<string, { timestamp: number; source: ScanSource; scanKey: string }>
  >({});
  const baselineKeyRef = useRef<string | null>(null);
  const lastProcessedTimeRef = useRef<number>(Date.now());
  const registryCacheRef = useRef<Record<string, RFIDRegistryEntry>>({});
  const devicesMapRef = useRef(devicesMap);
  const navigateRef = useRef(navigate);
  const locationRef = useRef(location);
  const addScanRef = useRef(addScanToHistory);
  const warehouseSessionRef = useRef(warehouseSession);
  const setWarehouseSelectedDeviceRef = useRef(setWarehouseSelectedDevice);
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
    warehouseSessionRef.current = warehouseSession;
  }, [warehouseSession]);

  useEffect(() => {
    setWarehouseSelectedDeviceRef.current = setWarehouseSelectedDevice;
  }, [setWarehouseSelectedDevice]);

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

  // Authoritative scan processor used for real-time ESP32 scans from both /warehouse_scans and /devices/YGS-FD-124/rfid_scans
  const processScan = async (
    record: WarehouseScanRecord | null,
    scanKey: string,
    source: ScanSource = 'warehouse_scans'
  ) => {
    console.log('[FRESHNEX RFID] Processing scan record', { source, scanKey, record });

    // 1. User or Admin Logged In: Scanning an RFID card must NOT log in, navigate to warehouse, or interrupt user/admin experience
    if (currentUserRef.current) {
      console.log(
        '[FRESHNEX RFID] User or Admin session active. RFID scan ignored to prevent interruption.'
      );
      return;
    }

    // 2. Not Logged In: Scanning an RFID card must NOT open the Warehouse section.
    // Display message: "Warehouse login required. Please log in with your Warehouse ID and Password."
    const currentSession = warehouseSessionRef.current;
    if (!currentSession || !currentSession.token || !currentSession.warehouseId) {
      console.log('[FRESHNEX RFID] Unauthenticated RFID scan detected. Warehouse login required.');
      showNotification({
        id: `login_required_${Date.now()}`,
        title: 'Warehouse login required.',
        message: 'Please log in with your Warehouse ID and Password.',
        type: 'warning',
      });
      return;
    }

    if (!record || typeof record !== 'object') {
      const msg = 'RFID verification failed.';
      showNotification({
        id: `${source}:${scanKey}`,
        title: msg,
        type: 'error',
      });
      return;
    }

    const rawUid = normalizeRfidUid(record.tag_uid ?? record.rfid_uid ?? record.uid);
    const warehouseLabel = currentSession.warehouseId || record.warehouse_id || 'WH-001';

    if (!rawUid) {
      const msg = 'RFID verification failed.';
      showNotification({
        id: `${source}:${scanKey}`,
        title: msg,
        type: 'warning',
      });
      return;
    }

    // Prevent duplicate processing when the same physical scan appears rapidly across both listeners or bounces
    const nowMs = Date.now();
    const recentEntry = recentPhysicalScansRef.current[rawUid];
    if (recentEntry) {
      const elapsed = nowMs - recentEntry.timestamp;
      const isCrossSourceDuplicate = recentEntry.source !== source && elapsed < 2500;
      const isSameSourceBounce =
        recentEntry.source === source && recentEntry.scanKey !== scanKey && elapsed < 1200;
      if (isCrossSourceDuplicate || isSameSourceBounce) {
        console.log('[FRESHNEX RFID] Duplicate physical scan ignored:', {
          rawUid,
          source,
          scanKey,
          previousSource: recentEntry.source,
          elapsedMs: elapsed,
        });
        return;
      }
    }
    recentPhysicalScansRef.current[rawUid] = { timestamp: nowMs, source, scanKey };

    // 3. Look up UID dynamically in /rfid_registry from Firebase (case-insensitive)
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
                const normKey = normalizeRfidUid(k);
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
        registryEntry = findRegistryEntryByUid(registryCacheRef.current, rawUid);
      }
    } else {
      registryEntry = findRegistryEntryByUid(registryCacheRef.current, rawUid);
    }

    // REST fallback if SDK lookup returned nothing (e.g., transient socket reconnect)
    if (!registryEntry) {
      try {
        const cfg = getActiveFirebaseConfig();
        const base = (cfg.databaseURL || DEFAULT_REALTIME_DATABASE_URL).replace(/\/$/, '');
        const restRes = await fetch(`${base}/rfid_registry.json`, {
          signal: AbortSignal.timeout(2500),
        });
        if (restRes.ok) {
          const allReg = await restRes.json();
          if (allReg && typeof allReg === 'object') {
            for (const [k, v] of Object.entries(allReg)) {
              const normKey = normalizeRfidUid(k);
              registryCacheRef.current[normKey] = v as RFIDRegistryEntry;
              if (normKey === rawUid) {
                registryEntry = v as RFIDRegistryEntry;
              }
            }
          }
        }
      } catch {
        // Non-blocking fallback
      }
    }

    // Check 1: Does RFID UID exist in /rfid_registry?
    if (!registryEntry || typeof registryEntry !== 'object') {
      const msg = 'Unknown RFID card. No registered product found.';
      console.warn('[FRESHNEX RFID] Unregistered RFID UID:', rawUid);
      showNotification({
        id: `${source}:${scanKey}`,
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
      const msg = 'This RFID card is inactive.';
      console.warn('[FRESHNEX RFID] Inactive RFID tag:', rawUid);
      showNotification({
        id: `${source}:${scanKey}`,
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

    // Check 4: Source-aware verification without mutating or forging record fields
    if (source === 'warehouse_scans') {
      // Existing /warehouse_scans reader protocol: requires verified === true, scanner_status === "identified", and matching device/product if provided
      const isScanVerified = record.verified === true;
      const isStatusIdentified =
        String(record.scanner_status || '').trim().toLowerCase() === 'identified';
      const scanDeviceId = record.device_id ? String(record.device_id).trim() : '';
      const scanProduct = record.product ? String(record.product).trim().toLowerCase() : '';

      const deviceMatches =
        !scanDeviceId || scanDeviceId.toUpperCase() === authoritativeDeviceId.toUpperCase();
      const productMatches =
        !scanProduct || !authoritativeProduct || scanProduct === authoritativeProduct;

      if (!isScanVerified || !isStatusIdentified || !deviceMatches || !productMatches) {
        const msg = 'RFID verification failed.';
        console.warn('[FRESHNEX RFID] Scan verification or registry match failed:', {
          verified: record.verified,
          scanner_status: record.scanner_status,
          scanDeviceId,
          authoritativeDeviceId,
          scanProduct,
          authoritativeProduct,
        });
        showNotification({
          id: `${source}:${scanKey}`,
          title: msg,
          type: 'warning',
        });
        return;
      }
    } else {
      // New /devices/YGS-FD-124/rfid_scans ESP32 reader protocol:
      // The hardware uploads { device_id: "YGS-FD-124", tag_uid, detected_at_ms } without scanner_status/verified fields.
      // Do NOT accept records explicitly marked rejected/false, and resolve the authoritative product & device_id strictly from /rfid_registry.
      const explicitlyRejected =
        record.verified === false ||
        ['denied', 'rejected', 'unverified', 'unknown', 'failed', 'error'].includes(
          String(record.scanner_status || '').trim().toLowerCase()
        );
      if (explicitlyRejected) {
        const msg = 'RFID verification failed.';
        console.warn('[FRESHNEX RFID] Device RFID scan explicitly flagged invalid:', {
          source,
          scanKey,
          verified: record.verified,
          scanner_status: record.scanner_status,
        });
        showNotification({
          id: `${source}:${scanKey}`,
          title: msg,
          type: 'warning',
        });
        return;
      }
    }

    // Check 5: Confirm device exists in /devices/{authoritativeDeviceId}
    if (!authoritativeDeviceId) {
      const msg = 'Device identified, but device information is unavailable.';
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

    const displayProduct = formatProductLabel(registryEntry.product);

    if (!deviceExists) {
      const msg = 'Device identified, but device information is unavailable.';
      console.warn('[FRESHNEX RFID] Device node not found in /devices:', authoritativeDeviceId);
      showNotification({
        id: scanKey,
        title: msg,
        type: 'error',
        details: {
          product: displayProduct,
          deviceId: authoritativeDeviceId,
          rfidUid: rawUid,
          warehouse: warehouseLabel,
          status: 'Unavailable',
        },
      });
      return;
    }

    // Check 6: Warehouse-Level Device Permissions
    // A warehouse operator must only be permitted to view devices that belong to their warehouse
    const permittedList = currentSession.permittedDevices || [];
    const isAssigned =
      permittedList.length === 0 ||
      permittedList.some((d) => d.trim().toUpperCase() === authoritativeDeviceId.toUpperCase());

    if (!isAssigned) {
      const deniedMsg = 'Access denied. This product is not assigned to your warehouse.';
      console.warn('[FRESHNEX RFID] Warehouse device permission check failed:', {
        deviceId: authoritativeDeviceId,
        warehouseId: currentSession.warehouseId,
        permitted: permittedList,
      });
      showNotification({
        id: `denied_${scanKey}`,
        title: deniedMsg,
        message: `Device ${authoritativeDeviceId} is not assigned to warehouse ${currentSession.warehouseId}.`,
        type: 'error',
        details: {
          product: displayProduct,
          deviceId: authoritativeDeviceId,
          rfidUid: rawUid,
          warehouse: currentSession.warehouseId,
          status: 'Unassigned',
        },
      });
      return;
    }

    // Compute reliable wall-clock timestamp (explicitly ignoring ESP32 millis() detected_at_ms as epoch)
    const resolvedTimestampMs = resolveRfidScanTimestamp(scanKey, record, nowMs);

    // Record scan in history non-blockingly
    try {
      addScanRef.current(authoritativeDeviceId, displayProduct).catch(() => {});
    } catch {}

    // Update selected device in warehouse session
    setWarehouseSelectedDeviceRef.current(authoritativeDeviceId, rawUid);

    console.log(
      '[FRESHNEX RFID] Access Granted for Warehouse Session:',
      `${authoritativeDeviceId} (${displayProduct}) via ${source}`
    );

    // Notification toast
    showNotification({
      id: `${source}:${scanKey}`,
      title: `RFID detected. Device ${authoritativeDeviceId} opened in Warehouse.`,
      type: 'success',
      details: {
        product: displayProduct,
        deviceId: authoritativeDeviceId,
        rfidUid: rawUid,
        warehouse: currentSession.warehouseId,
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
            warehouseId: currentSession.warehouseId,
            warehouseDevice:
              record.warehouse_device ||
              (source === 'device_rfid_scans' ? 'YGS-FD-124' : undefined) ||
              currentSession.scannerDevice ||
              'FRESHNEX-WH-001',
            scanKey,
            source,
            timestampMs: resolvedTimestampMs,
            detectedAtMs: record.detected_at_ms,
          },
        })
      );
    }

    // Stay inside /warehouse and open the device associated with the RFID scan
    const targetUrl = `/warehouse?deviceId=${encodeURIComponent(authoritativeDeviceId)}&rfid=${encodeURIComponent(rawUid)}`;
    if (!locationRef.current.pathname.startsWith('/warehouse')) {
      navigateRef.current(targetUrl);
    } else {
      navigateRef.current(targetUrl, { replace: true });
    }
  };

  useEffect(() => {
    let isCancelled = false;
    let isSubscribed = false;
    let cleanupScanListener: (() => void) | null = null;
    let cleanupDeviceScansListener: (() => void) | null = null;
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
      if (cleanupDeviceScansListener) {
        cleanupDeviceScansListener();
        cleanupDeviceScansListener = null;
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

      // Ensure Firebase Auth session is active so /warehouse_scans, /devices/YGS-FD-124/rfid_scans, and /rfid_registry are permitted
      await ensureFirebaseAuthenticated();
      if (isCancelled) {
        isBindingRef.current = false;
        return;
      }

      const registryRef = ref(db, 'rfid_registry');

      // 1. Keep /rfid_registry synchronized in memory (normalized uppercase UIDs)
      const handleRegistryValue = (snapshot: any) => {
        if (snapshot.exists()) {
          const val = snapshot.val();
          if (val && typeof val === 'object') {
            const normalized: Record<string, RFIDRegistryEntry> = {};
            Object.entries(val).forEach(([uid, entry]) => {
              normalized[normalizeRfidUid(uid)] = entry as RFIDRegistryEntry;
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

      // 2. Subscribe to /warehouse_scans (existing old Milk ESP32 reader, latest 25 records)
      // On initial snapshot, record all existing child keys so historical scans are never replayed as logins.
      const scansQuery = query(ref(db, 'warehouse_scans'), limitToLast(25));
      const handleScansValue = async (snapshot: any) => {
        if (isCancelled) return;
        if (!snapshot.exists()) {
          if (!warehouseBaselineInitializedRef.current) {
            warehouseBaselineInitializedRef.current = true;
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
        if (!warehouseBaselineInitializedRef.current) {
          warehouseBaselineInitializedRef.current = true;
          entries.forEach(([k]) => processedKeysRef.current.add(`warehouse_scans:${k}`));
          if (entries.length > 0) {
            baselineKeyRef.current = entries[entries.length - 1][0];
          }
          console.log('[FRESHNEX RFID] Live scanner baseline ready. Listening on /warehouse_scans...');
          dispatchStatus({ status: 'waiting', message: 'Waiting for RFID scan...' });
          return;
        }

        // Process only newly added scan keys (deduplicated by source + Firebase child key)
        for (const [scanKey, record] of entries) {
          const namespacedKey = `warehouse_scans:${scanKey}`;
          if (!processedKeysRef.current.has(namespacedKey)) {
            processedKeysRef.current.add(namespacedKey);
            baselineKeyRef.current = scanKey;
            lastProcessedTimeRef.current = Date.now();
            console.log('[FRESHNEX RFID] New scan detected from /warehouse_scans:', scanKey, record);
            await processScan(record, scanKey, 'warehouse_scans');
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

      // 3. Subscribe to /devices/YGS-FD-124/rfid_scans (new separate RFID ESP32 reader, latest 25 records)
      // Uses its own baseline flag so historical scans on startup/reload never replay.
      const deviceScansQuery = query(ref(db, 'devices/YGS-FD-124/rfid_scans'), limitToLast(25));
      const handleDeviceScansValue = async (snapshot: any) => {
        if (isCancelled) return;
        if (!snapshot.exists()) {
          if (!deviceScansBaselineInitializedRef.current) {
            deviceScansBaselineInitializedRef.current = true;
          }
          return;
        }

        const val = snapshot.val();
        if (!val || typeof val !== 'object') return;

        const entries: [string, WarehouseScanRecord][] = Object.entries(val);
        // Sort strictly by Firebase push key order (NOT detected_at_ms, which is ESP32 local millis() uptime)
        entries.sort((a, b) => a[0].localeCompare(b[0]));

        if (!deviceScansBaselineInitializedRef.current) {
          deviceScansBaselineInitializedRef.current = true;
          entries.forEach(([k]) =>
            processedKeysRef.current.add(`device_rfid_scans:YGS-FD-124:${k}`)
          );
          console.log(
            '[FRESHNEX RFID] Live scanner baseline ready. Listening on /devices/YGS-FD-124/rfid_scans...'
          );
          return;
        }

        for (const [scanKey, record] of entries) {
          const namespacedKey = `device_rfid_scans:YGS-FD-124:${scanKey}`;
          if (!processedKeysRef.current.has(namespacedKey)) {
            processedKeysRef.current.add(namespacedKey);
            lastProcessedTimeRef.current = Date.now();
            console.log(
              '[FRESHNEX RFID] New scan detected from /devices/YGS-FD-124/rfid_scans:',
              scanKey,
              record
            );
            await processScan(record, scanKey, 'device_rfid_scans');
          }
        }
      };

      const unsubDeviceScans = onValue(
        deviceScansQuery,
        handleDeviceScansValue,
        async (error) => {
          console.warn(
            '[FRESHNEX RFID] Device RFID scans listener notice (/devices/YGS-FD-124/rfid_scans):',
            error?.message || error
          );
          isSubscribed = false;
          if (error?.message?.includes('permission_denied') || error?.message?.includes('Permission denied')) {
            await ensureFirebaseAuthenticated();
            scheduleReconnect(1000, true);
          }
        }
      );

      cleanupDeviceScansListener = () => {
        unsubDeviceScans();
        off(deviceScansQuery, 'value', handleDeviceScansValue);
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
      recentPhysicalScansRef.current = {};
      lastProcessedTimeRef.current = Date.now();
      await ensureFirebaseAuthenticated();
      if (!isSubscribed) {
        scheduleReconnect(200, true);
      }
    };

    const handleScanResetEvent = () => {
      recentPhysicalScansRef.current = {};
    };

    window.addEventListener('freshnex_warehouse_logout', handleLogoutEvent);
    window.addEventListener('freshnex_warehouse_scan_reset', handleScanResetEvent);

    return () => {
      isCancelled = true;
      isSubscribed = false;
      if (reconnectTimerRef.current) clearTimeout(reconnectTimerRef.current);
      if (cleanupScanListener) cleanupScanListener();
      if (cleanupDeviceScansListener) cleanupDeviceScansListener();
      if (cleanupRegistryListener) cleanupRegistryListener();
      if (unsubAuth) unsubAuth();
      window.removeEventListener('freshnex_warehouse_logout', handleLogoutEvent);
      window.removeEventListener('freshnex_warehouse_scan_reset', handleScanResetEvent);
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

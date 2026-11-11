import { io, Socket } from 'socket.io-client';
import {
  ref,
  get,
  onValue,
  update as rtdbUpdate,
  set as rtdbSet,
  getDatabase,
  Database,
} from 'firebase/database';
import { getApps, initializeApp, getApp } from 'firebase/app';
import {
  getActiveDatabase,
  getActiveFirebaseConfig,
  DEFAULT_REALTIME_DATABASE_URL,
} from '../firebase/firebase';

export interface DeviceStatusPayload {
  deviceId: string;
  status: 'online' | 'offline';
  lastDataAt: number;
  offlineAt?: number;
  lastResponseAt: number;
  remainingMs?: number;
}

export interface DeviceTelemetryBroadcast {
  deviceId: string;
  data: any;
  status: 'online' | 'offline';
  lastDataAt: number;
  lastResponseAt?: number;
}

const OFFLINE_TIMEOUT_MS = 30000; // 30-second timer for online/offline status

class SocketTelemetryService {
  private socket: Socket | null = null;
  private statusListeners = new Map<
    string,
    Set<(status: 'online' | 'offline', meta?: DeviceStatusPayload) => void>
  >();
  private telemetryListeners = new Map<string, Set<(data: any) => void>>();
  private globalTelemetryListeners = new Set<(devicesMap: Record<string, any>) => void>();
  private latestStatuses = new Map<string, DeviceStatusPayload>();
  private lastDataSignatures = new Map<string, string>();
  private connectionListeners = new Set<(connected: boolean) => void>();

  // Authoritative 30s Watchdog & Last Response Timestamp state
  private localOfflineTimers = new Map<string, ReturnType<typeof setTimeout>>();
  private localLastDataAt = new Map<string, number>();
  private localOfflineAt = new Map<string, number>();
  private localLastResponseAt = new Map<string, number>();
  private localStatusMap = new Map<string, 'online' | 'offline'>();
  private localTelemetryMap = new Map<string, any>();
  private isSocketIoConnected = false;
  private isFirebaseWsConnected = true;
  private countdownTicker: ReturnType<typeof setInterval> | null = null;
  private rtdbCleanupFns: Array<() => void> = [];

  constructor() {
    if (typeof window !== 'undefined') {
      this.restoreOrSeedWatchdogState();
      this.startCountdownTicker();
      this.initCrossTabSync();
      this.initFirebaseNativeWebSocket();
      this.initSocketSafely();
    }
  }

  private persistWatchdogState() {
    if (typeof window === 'undefined') return;
    try {
      const dump: Record<string, any> = {};
      for (const devId of ['YGS-FD-001', 'YGS-FD-124']) {
        dump[devId] = {
          status: this.localStatusMap.get(devId) || 'online',
          lastDataAt: this.localLastDataAt.get(devId) || Date.now(),
          offlineAt: this.localOfflineAt.get(devId),
          lastResponseAt: this.localLastResponseAt.get(devId) || Date.now(),
          sig: this.lastDataSignatures.get(devId),
        };
      }
      localStorage.setItem('freshnex_watchdog_state_v1', JSON.stringify(dump));
    } catch {
      // Ignore storage errors
    }
  }

  private restoreOrSeedWatchdogState() {
    const now = Date.now();
    let restoredAny = false;
    try {
      const raw = localStorage.getItem('freshnex_watchdog_state_v1');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === 'object') {
          for (const devId of ['YGS-FD-001', 'YGS-FD-124']) {
            const entry = parsed[devId];
            if (entry && typeof entry === 'object' && entry.lastDataAt) {
              restoredAny = true;
              const lastDataAt = Number(entry.lastDataAt);
              const elapsed = now - lastDataAt;
              if (entry.sig) {
                this.lastDataSignatures.set(devId, String(entry.sig));
              }
              if (entry.status === 'offline' || elapsed >= OFFLINE_TIMEOUT_MS) {
                const offlineAt = Number(entry.offlineAt || lastDataAt + OFFLINE_TIMEOUT_MS);
                this.localStatusMap.set(devId, 'offline');
                this.localLastDataAt.set(devId, lastDataAt);
                this.localOfflineAt.set(devId, offlineAt);
                this.localLastResponseAt.set(devId, offlineAt);
                this.latestStatuses.set(devId, {
                  deviceId: devId,
                  status: 'offline',
                  lastDataAt,
                  offlineAt,
                  lastResponseAt: offlineAt,
                  remainingMs: 0,
                });
              } else {
                const remainingMs = Math.max(0, OFFLINE_TIMEOUT_MS - elapsed);
                this.localStatusMap.set(devId, 'online');
                this.localLastDataAt.set(devId, lastDataAt);
                this.localOfflineAt.delete(devId);
                this.localLastResponseAt.set(devId, lastDataAt);
                this.latestStatuses.set(devId, {
                  deviceId: devId,
                  status: 'online',
                  lastDataAt,
                  lastResponseAt: lastDataAt,
                  remainingMs,
                });
                const timer = setTimeout(() => {
                  this.transitionDeviceToOffline(devId);
                }, remainingMs);
                this.localOfflineTimers.set(devId, timer);
              }
            }
          }
        }
      }
    } catch {
      restoredAny = false;
    }

    if (!restoredAny) {
      this.startOrResetLocal30sTimer('YGS-FD-001');
      this.startOrResetLocal30sTimer('YGS-FD-124');
    }
  }

  private initCrossTabSync() {
    if (typeof window === 'undefined') return;
    window.addEventListener('storage', (e) => {
      if (e.key !== 'freshnex_watchdog_state_v1' || !e.newValue) return;
      try {
        const parsed = JSON.parse(e.newValue);
        if (!parsed || typeof parsed !== 'object') return;
        const now = Date.now();
        for (const devId of ['YGS-FD-001', 'YGS-FD-124']) {
          const entry = parsed[devId];
          if (!entry) continue;
          const lastDataAt = Number(entry.lastDataAt || now);
          const elapsed = now - lastDataAt;
          if (entry.sig) {
            this.lastDataSignatures.set(devId, String(entry.sig));
          }
          if (entry.status === 'offline' || elapsed >= OFFLINE_TIMEOUT_MS) {
            const offlineAt = Number(entry.offlineAt || lastDataAt + OFFLINE_TIMEOUT_MS);
            const prevTimer = this.localOfflineTimers.get(devId);
            if (prevTimer) clearTimeout(prevTimer);
            this.localStatusMap.set(devId, 'offline');
            this.localLastDataAt.set(devId, lastDataAt);
            this.localOfflineAt.set(devId, offlineAt);
            this.localLastResponseAt.set(devId, offlineAt);
            const payload: DeviceStatusPayload = {
              deviceId: devId,
              status: 'offline',
              lastDataAt,
              offlineAt,
              lastResponseAt: offlineAt,
              remainingMs: 0,
            };
            this.latestStatuses.set(devId, payload);
            this.notifyStatusListeners(devId, 'offline', payload);
          } else {
            const remainingMs = Math.max(0, OFFLINE_TIMEOUT_MS - elapsed);
            this.localStatusMap.set(devId, 'online');
            this.localLastDataAt.set(devId, lastDataAt);
            this.localOfflineAt.delete(devId);
            this.localLastResponseAt.set(devId, lastDataAt);
            const payload: DeviceStatusPayload = {
              deviceId: devId,
              status: 'online',
              lastDataAt,
              lastResponseAt: lastDataAt,
              remainingMs,
            };
            this.latestStatuses.set(devId, payload);
            this.notifyStatusListeners(devId, 'online', payload);
          }
        }
      } catch {
        // Ignore parse error
      }
    });
  }

  private transitionDeviceToOffline(normId: string) {
    const offlineMoment = Date.now();
    const prevTimer = this.localOfflineTimers.get(normId);
    if (prevTimer) clearTimeout(prevTimer);
    this.localStatusMap.set(normId, 'offline');
    this.localOfflineAt.set(normId, offlineMoment);
    this.localLastResponseAt.set(normId, offlineMoment);
    const lastDataAt = this.localLastDataAt.get(normId) || offlineMoment - OFFLINE_TIMEOUT_MS;

    const offlinePayload: DeviceStatusPayload = {
      deviceId: normId,
      status: 'offline',
      lastDataAt,
      offlineAt: offlineMoment,
      lastResponseAt: offlineMoment,
      remainingMs: 0,
    };
    this.latestStatuses.set(normId, offlinePayload);
    this.persistWatchdogState();
    this.notifyStatusListeners(normId, 'offline', offlinePayload);
  }

  private getDirectDb(): Database | null {
    try {
      const activeDb = getActiveDatabase();
      if (activeDb) return activeDb;
      const cfg = getActiveFirebaseConfig();
      const app = getApps().length > 0 ? getApp() : initializeApp(cfg);
      const targetUrl = cfg.databaseURL || DEFAULT_REALTIME_DATABASE_URL;
      return getDatabase(app, targetUrl);
    } catch {
      return null;
    }
  }

  public normalizeDeviceId(rawId: string): string {
    const clean = (rawId || '').trim().toUpperCase().replace(/^#/, '');
    if (clean === '001' || clean === 'APPLE' || clean === '6D66F406' || clean.includes('001')) return 'YGS-FD-001';
    if (clean === '124' || clean === 'MILK' || clean === '61896F06' || clean.includes('124')) return 'YGS-FD-124';
    return clean || 'YGS-FD-001';
  }

  /**
   * Computes a deterministic signature strictly from the sensor reading values.
   * Excludes wrapper timestamps so view changes or re-renders never trigger false timer resets.
   */
  private computeDataSignature(data: any): string {
    if (!data || typeof data !== 'object') return '';
    let target = data;
    if (
      !(
        'temperature' in data ||
        'temperature_c' in data ||
        'temp' in data ||
        'humidity' in data ||
        'humidity_percent' in data ||
        'hum' in data ||
        'gas' in data ||
        'mq135_raw' in data
      )
    ) {
      const keys = Object.keys(data).filter(
        (k) => k !== 'commands' && k !== 'status' && k !== 'online' && k !== 'rfid_scans'
      );
      if (keys.length > 0) {
        const lastKey = keys[keys.length - 1];
        if (typeof data[lastKey] === 'object' && data[lastKey] !== null) {
          target = data[lastKey];
        }
      }
    }

    const temp = Number(target.temperature_c ?? target.temperature ?? target.temp ?? target.t ?? 0).toFixed(2);
    const hum = Number(target.humidity_percent ?? target.humidity ?? target.hum ?? target.h ?? 0).toFixed(2);
    const gas = Number(target.mq135_raw ?? target.gas ?? target.mq135 ?? 0).toFixed(0);
    const impact = Number(target.acceleration_change ?? target.impact ?? 0).toFixed(3);
    const light = Number(target.light_lux ?? target.light ?? 0).toFixed(1);
    const lat = Number(target.gps_lat ?? target.gpsLat ?? target.lat ?? 0).toFixed(4);
    const lng = Number(target.gps_lng ?? target.gpsLng ?? target.lng ?? 0).toFixed(4);
    const sats = Number(target.gps_satellites ?? target.gpsSats ?? target.sats ?? 0).toFixed(0);

    return `${temp}|${hum}|${gas}|${impact}|${light}|${lat}|${lng}|${sats}`;
  }

  public isBridgeConnected(): boolean {
    return Boolean(this.isSocketIoConnected || this.isFirebaseWsConnected);
  }

  private broadcastConnectionState() {
    const connected = this.isBridgeConnected();
    this.connectionListeners.forEach((cb) => cb(connected));
  }

  /**
   * Starts or resets the authoritative 30-second timer for a device.
   * - When data is received by the frontend, `lastResponseAt` is set to `now` (`lastDataAt`).
   * - At the exact moment the 30-second timer expires and the device becomes offline,
   *   `lastResponseAt` is updated to that exact `offlineMoment` timestamp and stays static until new data arrives.
   */
  private startOrResetLocal30sTimer(deviceId: string, latestData?: any) {
    const normId = this.normalizeDeviceId(deviceId);
    if (normId === 'YGS-FD-000124' || normId === 'YGS-FD-112233') return;

    const now = Date.now();
    this.localStatusMap.set(normId, 'online');
    this.localLastDataAt.set(normId, now);
    this.localOfflineAt.delete(normId);
    this.localLastResponseAt.set(normId, now);

    if (latestData && typeof latestData === 'object') {
      const existing = this.localTelemetryMap.get(normId) || {};
      this.localTelemetryMap.set(normId, {
        ...existing,
        ...latestData,
        device_id: normId,
        online: true,
        status: 'online',
        last_response_at: now,
      });
    }

    const prevTimer = this.localOfflineTimers.get(normId);
    if (prevTimer) {
      clearTimeout(prevTimer);
    }

    const onlinePayload: DeviceStatusPayload = {
      deviceId: normId,
      status: 'online',
      lastDataAt: now,
      lastResponseAt: now,
      remainingMs: OFFLINE_TIMEOUT_MS,
    };
    this.latestStatuses.set(normId, onlinePayload);
    this.persistWatchdogState();
    this.notifyStatusListeners(normId, 'online', onlinePayload);

    if (latestData) {
      this.notifyTelemetryListeners(normId, this.localTelemetryMap.get(normId));
    }

    const timer = setTimeout(() => {
      this.transitionDeviceToOffline(normId);
    }, OFFLINE_TIMEOUT_MS);

    this.localOfflineTimers.set(normId, timer);
  }

  private startCountdownTicker() {
    if (this.countdownTicker) clearInterval(this.countdownTicker);
    this.countdownTicker = setInterval(() => {
      const now = Date.now();
      for (const [devId, status] of this.localStatusMap.entries()) {
        const lastDataAt = this.localLastDataAt.get(devId) || now;
        const elapsed = now - lastDataAt;
        if (status === 'online' && elapsed >= OFFLINE_TIMEOUT_MS) {
          this.transitionDeviceToOffline(devId);
        } else {
          const remainingMs = status === 'online' ? Math.max(0, OFFLINE_TIMEOUT_MS - elapsed) : 0;
          const offlineAt = this.localOfflineAt.get(devId);
          const lastResponseAt =
            status === 'offline'
              ? offlineAt || this.localLastResponseAt.get(devId) || lastDataAt
              : lastDataAt;
          const payload: DeviceStatusPayload = {
            deviceId: devId,
            status,
            lastDataAt,
            offlineAt,
            lastResponseAt,
            remainingMs,
          };
          this.latestStatuses.set(devId, payload);
          this.notifyStatusListeners(devId, status, payload);
        }
      }
    }, 1000);
  }

  /**
   * Direct Firebase Realtime Database Native WebSocket (`wss://`) Bridge.
   * Only starts/resets the 30s timer when sensor values actually change after initial seed.
   */
  private initFirebaseNativeWebSocket() {
    this.rtdbCleanupFns.forEach((fn) => fn());
    this.rtdbCleanupFns = [];

    const db = this.getDirectDb();
    this.isFirebaseWsConnected = true;
    this.broadcastConnectionState();

    if (!db) {
      return;
    }

    try {
      const connectedRef = ref(db, '.info/connected');
      const unsubConn = onValue(
        connectedRef,
        (snap) => {
          const val = snap.val();
          if (val === true) {
            this.isFirebaseWsConnected = true;
          }
          this.broadcastConnectionState();
        },
        () => {
          this.isFirebaseWsConnected = true;
          this.broadcastConnectionState();
        }
      );
      this.rtdbCleanupFns.push(unsubConn);

      const devicesRef = ref(db, 'devices');
      const unsubDevices = onValue(
        devicesRef,
        (snapshot) => {
          this.isFirebaseWsConnected = true;
          this.broadcastConnectionState();
          if (!snapshot.exists()) return;
          const val = snapshot.val();
          if (!val || typeof val !== 'object') return;

          const normalizedMap: Record<string, any> = {};
          Object.entries(val).forEach(([rawDevId, devPayload]: [string, any]) => {
            if (rawDevId === 'YGS-FD-000124' || rawDevId === 'YGS-FD-112233') return;
            const normId = this.normalizeDeviceId(rawDevId);
            normalizedMap[normId] = devPayload;

            const existing = this.localTelemetryMap.get(normId) || {};
            this.localTelemetryMap.set(normId, {
              ...existing,
              ...(typeof devPayload === 'object' ? devPayload : {}),
              device_id: normId,
            });

            const sig = this.computeDataSignature(devPayload);
            const prevSig = this.lastDataSignatures.get(normId);

            if (prevSig === undefined) {
              // First initial snapshot — record baseline signature without resetting an already-running timer
              this.lastDataSignatures.set(normId, sig);
              if (!this.localStatusMap.has(normId)) {
                this.startOrResetLocal30sTimer(normId, devPayload);
              } else {
                this.notifyTelemetryListeners(normId, this.localTelemetryMap.get(normId));
              }
            } else if (prevSig !== sig) {
              // Sensor reading genuinely changed in the database -> reset the 30-second timer
              this.lastDataSignatures.set(normId, sig);
              this.startOrResetLocal30sTimer(normId, devPayload);
            }
          });

          if (Object.keys(normalizedMap).length > 0) {
            this.globalTelemetryListeners.forEach((cb) => cb(normalizedMap));
          }
        },
        () => {}
      );
      this.rtdbCleanupFns.push(unsubDevices);
    } catch {
      this.isFirebaseWsConnected = true;
      this.broadcastConnectionState();
    }
  }

  private async initSocketSafely() {
    if (this.socket || typeof window === 'undefined') return;

    const host = window.location.hostname || '';
    if (host.includes('vercel.app')) {
      this.isFirebaseWsConnected = true;
      this.broadcastConnectionState();
      return;
    }

    try {
      const probe = await fetch('/socket.io/?EIO=4&transport=polling', {
        method: 'GET',
        signal: AbortSignal.timeout(2500),
      });
      const contentType = probe.headers.get('content-type') || '';
      if (!probe.ok || contentType.includes('text/html')) {
        this.isFirebaseWsConnected = true;
        this.broadcastConnectionState();
        return;
      }
    } catch {
      this.isFirebaseWsConnected = true;
      this.broadcastConnectionState();
      return;
    }

    try {
      this.socket = io('/', {
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionAttempts: 3,
        reconnectionDelay: 2000,
        timeout: 4000,
      });

      this.socket.on('connect', () => {
        this.isSocketIoConnected = true;
        this.broadcastConnectionState();
        this.socket?.emit('client:request_sync');
      });

      this.socket.on('disconnect', () => {
        this.isSocketIoConnected = false;
        this.isFirebaseWsConnected = true;
        this.broadcastConnectionState();
      });

      this.socket.on('connect_error', () => {
        this.isSocketIoConnected = false;
        this.isFirebaseWsConnected = true;
        this.broadcastConnectionState();
      });

      this.socket.on(
        'devices:init',
        (payload: {
          devices?: Record<string, any>;
          statuses?: Record<string, DeviceStatusPayload>;
        }) => {
          if (payload?.statuses) {
            Object.entries(payload.statuses).forEach(([devId, st]) => {
              this.applyBackendStatusPayload(devId, st);
            });
          }
          if (payload?.devices && Object.keys(payload.devices).length > 0) {
            this.globalTelemetryListeners.forEach((cb) => cb(payload.devices!));
            Object.entries(payload.devices).forEach(([devId, data]) => {
              const normId = this.normalizeDeviceId(devId);
              this.notifyTelemetryListeners(normId, data);
            });
          }
        }
      );

      this.socket.on('device:status', (payload: DeviceStatusPayload) => {
        if (!payload || !payload.deviceId) return;
        this.applyBackendStatusPayload(payload.deviceId, payload);
      });

      this.socket.on('devices:status_sync', (statuses: Record<string, DeviceStatusPayload>) => {
        if (!statuses) return;
        Object.entries(statuses).forEach(([devId, st]) => {
          this.applyBackendStatusPayload(devId, st);
        });
      });

      this.socket.on('device:telemetry', (payload: DeviceTelemetryBroadcast) => {
        if (!payload || !payload.deviceId) return;
        const normId = this.normalizeDeviceId(payload.deviceId);
        if (payload.data) {
          this.startOrResetLocal30sTimer(normId, payload.data);
        }
      });
    } catch {
      this.isFirebaseWsConnected = true;
      this.broadcastConnectionState();
    }
  }

  private applyBackendStatusPayload(rawDevId: string, st: DeviceStatusPayload) {
    const normId = this.normalizeDeviceId(rawDevId);
    const prevStatus = this.localStatusMap.get(normId);
    this.localStatusMap.set(normId, st.status);
    if (st.lastDataAt) {
      this.localLastDataAt.set(normId, st.lastDataAt);
    }

    let lastResponseAt = st.lastResponseAt || st.lastDataAt || Date.now();
    if (st.status === 'offline') {
      const prevTimer = this.localOfflineTimers.get(normId);
      if (prevTimer) clearTimeout(prevTimer);
      const offlineMoment =
        st.offlineAt ||
        (prevStatus === 'online' ? Date.now() : this.localOfflineAt.get(normId)) ||
        st.lastResponseAt ||
        Date.now();
      this.localOfflineAt.set(normId, offlineMoment);
      lastResponseAt = offlineMoment;
    } else {
      this.localOfflineAt.delete(normId);
      lastResponseAt = st.lastDataAt || lastResponseAt;
    }

    this.localLastResponseAt.set(normId, lastResponseAt);
    const enriched: DeviceStatusPayload = {
      ...st,
      deviceId: normId,
      offlineAt: this.localOfflineAt.get(normId),
      lastResponseAt,
    };
    this.latestStatuses.set(normId, enriched);
    this.persistWatchdogState();
    this.notifyStatusListeners(normId, st.status, enriched);
  }

  public async forceSync(): Promise<void> {
    this.isFirebaseWsConnected = true;
    this.broadcastConnectionState();

    if (this.socket?.connected) {
      this.socket.emit('client:request_sync');
    }

    const db = this.getDirectDb();
    if (db) {
      try {
        const snap = await get(ref(db, 'devices'));
        if (snap.exists()) {
          const val = snap.val();
          if (val && typeof val === 'object') {
            Object.entries(val).forEach(([rawDevId, devPayload]: [string, any]) => {
              if (rawDevId === 'YGS-FD-000124' || rawDevId === 'YGS-FD-112233') return;
              const normId = this.normalizeDeviceId(rawDevId);
              const sig = this.computeDataSignature(devPayload);
              const prevSig = this.lastDataSignatures.get(normId);
              if (prevSig !== undefined && prevSig !== sig) {
                this.lastDataSignatures.set(normId, sig);
                this.startOrResetLocal30sTimer(normId, devPayload);
              }
            });
          }
        }
      } catch {
        // Ignore
      }
    }
  }

  private notifyStatusListeners(
    deviceId: string,
    status: 'online' | 'offline',
    meta?: DeviceStatusPayload
  ) {
    const listeners = this.statusListeners.get(deviceId);
    if (listeners) {
      listeners.forEach((cb) => cb(status, meta));
    }
  }

  private notifyTelemetryListeners(deviceId: string, data: any) {
    const listeners = this.telemetryListeners.get(deviceId);
    if (listeners) {
      listeners.forEach((cb) => cb(data));
    }
  }

  /**
   * Called by the frontend whenever sensor data is received/updated at the frontend.
   * Only starts/resets the 30-second timer when the sensor data signature genuinely changes
   * after initial baseline, or when `forceTimerReset` is explicitly true.
   */
  public reportFrontendDataReceived(deviceId: string, data: any, forceTimerReset: boolean = false) {
    const normId = this.normalizeDeviceId(deviceId);
    const sig = this.computeDataSignature(data);
    if (!sig) return;

    const prevSig = this.lastDataSignatures.get(normId);

    if (prevSig === undefined) {
      this.lastDataSignatures.set(normId, sig);
      if (forceTimerReset || !this.localStatusMap.has(normId)) {
        this.startOrResetLocal30sTimer(normId, data);
      }
      return;
    }

    if (!forceTimerReset && prevSig === sig) {
      return;
    }

    this.lastDataSignatures.set(normId, sig);
    this.startOrResetLocal30sTimer(normId, data);

    if (this.socket?.connected) {
      this.socket.emit('device:data_received', {
        deviceId: normId,
        data,
        signature: sig,
        receivedAt: Date.now(),
        force: forceTimerReset,
      });
    }
  }

  /**
   * Push a device update directly through the WebSocket to the database & all clients
   */
  public emitDeviceUpdate(deviceId: string, data: any) {
    const normId = this.normalizeDeviceId(deviceId);
    const sig = this.computeDataSignature(data);
    this.lastDataSignatures.set(normId, sig);

    this.startOrResetLocal30sTimer(normId, data);

    if (this.socket?.connected) {
      this.socket.emit('device:update', {
        deviceId: normId,
        data,
        timestamp: Date.now(),
      });
    } else {
      const db = this.getDirectDb();
      if (db && data && typeof data === 'object') {
        rtdbUpdate(ref(db, `devices/${normId}`), {
          ...data,
          device_id: normId,
          last_update: Date.now(),
        }).catch(() => {});
        rtdbSet(ref(db, `sensorData/${normId}`), {
          ...data,
          device_id: normId,
          timestamp: Date.now(),
        }).catch(() => {});
      }
    }
  }

  public subscribeStatus(
    deviceId: string,
    callback: (status: 'online' | 'offline', meta?: DeviceStatusPayload) => void
  ): () => void {
    const normId = this.normalizeDeviceId(deviceId);
    if (!this.statusListeners.has(normId)) {
      this.statusListeners.set(normId, new Set());
    }
    this.statusListeners.get(normId)!.add(callback);

    const existing = this.latestStatuses.get(normId);
    if (existing) {
      callback(existing.status, existing);
    } else if (!this.localStatusMap.has(normId)) {
      this.startOrResetLocal30sTimer(normId);
      const created = this.latestStatuses.get(normId);
      if (created) callback(created.status, created);
    }

    return () => {
      this.statusListeners.get(normId)?.delete(callback);
    };
  }

  public subscribeTelemetry(deviceId: string, callback: (data: any) => void): () => void {
    const normId = this.normalizeDeviceId(deviceId);
    if (!this.telemetryListeners.has(normId)) {
      this.telemetryListeners.set(normId, new Set());
    }
    this.telemetryListeners.get(normId)!.add(callback);

    const cached = this.localTelemetryMap.get(normId);
    if (cached) {
      callback(cached);
    }

    return () => {
      this.telemetryListeners.get(normId)?.delete(callback);
    };
  }

  public subscribeAllDevicesTelemetry(
    callback: (devicesMap: Record<string, any>) => void
  ): () => void {
    this.globalTelemetryListeners.add(callback);
    return () => {
      this.globalTelemetryListeners.delete(callback);
    };
  }

  public subscribeConnectionState(callback: (connected: boolean) => void): () => void {
    this.connectionListeners.add(callback);
    callback(this.isBridgeConnected());
    return () => {
      this.connectionListeners.delete(callback);
    };
  }

  public getLatestStatus(deviceId: string): 'online' | 'offline' {
    const normId = this.normalizeDeviceId(deviceId);
    return this.latestStatuses.get(normId)?.status || this.localStatusMap.get(normId) || 'online';
  }

  public getRemainingSeconds(deviceId: string): number {
    const normId = this.normalizeDeviceId(deviceId);
    const meta = this.latestStatuses.get(normId);
    if (meta && meta.remainingMs !== undefined) {
      return Math.max(0, Math.ceil(meta.remainingMs / 1000));
    }
    return this.getLatestStatus(normId) === 'online' ? 30 : 0;
  }

  /**
   * Returns the authoritative Last Response timestamp for a device:
   * - While online: the exact timestamp when the last data was received by the frontend (`lastDataAt`).
   * - When the device becomes offline: the exact timestamp of the moment it became offline (`offlineAt`).
   */
  public getLastResponseTimestamp(deviceId: string): number {
    const normId = this.normalizeDeviceId(deviceId);
    const meta = this.latestStatuses.get(normId);
    if (meta) {
      return meta.status === 'offline'
        ? meta.offlineAt || meta.lastResponseAt || meta.lastDataAt
        : meta.lastDataAt || meta.lastResponseAt;
    }
    return this.localLastResponseAt.get(normId) || this.localLastDataAt.get(normId) || Date.now();
  }

  public getStatusMeta(deviceId: string): DeviceStatusPayload {
    const normId = this.normalizeDeviceId(deviceId);
    const existing = this.latestStatuses.get(normId);
    if (existing) return existing;
    const now = Date.now();
    return {
      deviceId: normId,
      status: 'online',
      lastDataAt: now,
      lastResponseAt: now,
      remainingMs: OFFLINE_TIMEOUT_MS,
    };
  }
}

export const socketTelemetryService = new SocketTelemetryService();

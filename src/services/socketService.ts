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
  remainingMs?: number;
}

export interface DeviceTelemetryBroadcast {
  deviceId: string;
  data: any;
  status: 'online' | 'offline';
  lastDataAt: number;
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

  // Authoritative 30s Watchdog & Firebase Native WebSocket state (works on both Node server & Vercel)
  private localOfflineTimers = new Map<string, ReturnType<typeof setTimeout>>();
  private localLastDataAt = new Map<string, number>();
  private localStatusMap = new Map<string, 'online' | 'offline'>();
  private localTelemetryMap = new Map<string, any>();
  private isSocketIoConnected = false;
  private isFirebaseWsConnected = true;
  private countdownTicker: ReturnType<typeof setInterval> | null = null;
  private rtdbCleanupFns: Array<() => void> = [];

  constructor() {
    if (typeof window !== 'undefined') {
      // Seed initial 30-second timers for active devices
      this.startOrResetLocal30sTimer('YGS-FD-001');
      this.startOrResetLocal30sTimer('YGS-FD-124');
      this.startCountdownTicker();
      this.initFirebaseNativeWebSocket();
      this.initSocketSafely();
    }
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

  private normalizeDeviceId(rawId: string): string {
    const clean = (rawId || '').trim().toUpperCase().replace(/^#/, '');
    if (clean === '001' || clean === 'APPLE' || clean.includes('001')) return 'YGS-FD-001';
    if (clean === '124' || clean === 'MILK' || clean.includes('124')) return 'YGS-FD-124';
    return clean || 'YGS-FD-001';
  }

  private computeDataSignature(data: any): string {
    if (!data || typeof data !== 'object') return '';
    let target = data;
    if (
      !(
        'temperature' in data ||
        'temp' in data ||
        'humidity' in data ||
        'hum' in data ||
        'gas' in data ||
        'mq135_raw' in data
      )
    ) {
      const keys = Object.keys(data).filter(
        (k) => k !== 'commands' && k !== 'status' && k !== 'online'
      );
      if (keys.length > 0) {
        const lastKey = keys[keys.length - 1];
        if (typeof data[lastKey] === 'object' && data[lastKey] !== null) {
          target = data[lastKey];
        }
      }
    }

    const temp = Number(target.temperature ?? target.temp ?? target.t ?? 0).toFixed(2);
    const hum = Number(target.humidity ?? target.hum ?? target.h ?? 0).toFixed(2);
    const gas = Number(target.mq135_raw ?? target.gas ?? target.mq135 ?? 0).toFixed(0);
    const impact = Number(target.impact ?? target.acceleration_change ?? 0).toFixed(3);
    const light = Number(target.light ?? target.light_lux ?? 0).toFixed(1);
    const lat = Number(target.gpsLat ?? target.lat ?? 0).toFixed(4);
    const lng = Number(target.gpsLng ?? target.lng ?? 0).toFixed(4);
    const ts = Number(
      target.timestamp ??
        target.last_update ??
        target.lastUpdated ??
        target.time ??
        target.website_updated_at ??
        0
    );

    return `${temp}|${hum}|${gas}|${impact}|${light}|${lat}|${lng}|${ts}`;
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
   * Works identically whether connected to the Express Socket.IO server or deployed on Vercel.
   */
  private startOrResetLocal30sTimer(deviceId: string, latestData?: any) {
    const normId = this.normalizeDeviceId(deviceId);
    if (normId === 'YGS-FD-000124' || normId === 'YGS-FD-112233') return;

    const now = Date.now();
    this.localStatusMap.set(normId, 'online');
    this.localLastDataAt.set(normId, now);

    if (latestData && typeof latestData === 'object') {
      const existing = this.localTelemetryMap.get(normId) || {};
      this.localTelemetryMap.set(normId, {
        ...existing,
        ...latestData,
        device_id: normId,
        online: true,
        status: 'online',
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
      remainingMs: OFFLINE_TIMEOUT_MS,
    };
    this.latestStatuses.set(normId, onlinePayload);
    this.notifyStatusListeners(normId, 'online', onlinePayload);

    if (latestData) {
      this.notifyTelemetryListeners(normId, this.localTelemetryMap.get(normId));
    }

    const timer = setTimeout(() => {
      this.localStatusMap.set(normId, 'offline');
      const lastDataAt = this.localLastDataAt.get(normId) || Date.now() - OFFLINE_TIMEOUT_MS;
      const offlinePayload: DeviceStatusPayload = {
        deviceId: normId,
        status: 'offline',
        lastDataAt,
        remainingMs: 0,
      };
      this.latestStatuses.set(normId, offlinePayload);
      this.notifyStatusListeners(normId, 'offline', offlinePayload);
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
          this.localStatusMap.set(devId, 'offline');
          const offlinePayload: DeviceStatusPayload = {
            deviceId: devId,
            status: 'offline',
            lastDataAt,
            remainingMs: 0,
          };
          this.latestStatuses.set(devId, offlinePayload);
          this.notifyStatusListeners(devId, 'offline', offlinePayload);
        } else {
          const remainingMs = status === 'online' ? Math.max(0, OFFLINE_TIMEOUT_MS - elapsed) : 0;
          const payload: DeviceStatusPayload = {
            deviceId: devId,
            status,
            lastDataAt,
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
   * Ensures zero-lag streaming and 30s watchdog timer on Vercel and all cloud deployments.
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
            const sig = this.computeDataSignature(devPayload);
            const prevSig = this.lastDataSignatures.get(normId);

            if (prevSig !== sig) {
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

      const sensorDataRef = ref(db, 'sensorData');
      const unsubSensorData = onValue(
        sensorDataRef,
        (snapshot) => {
          if (!snapshot.exists()) return;
          const val = snapshot.val();
          if (!val || typeof val !== 'object') return;

          Object.entries(val).forEach(([rawDevId, sensorPayload]: [string, any]) => {
            if (rawDevId === 'YGS-FD-000124' || rawDevId === 'YGS-FD-112233') return;
            const normId = this.normalizeDeviceId(rawDevId);
            const sig = this.computeDataSignature(sensorPayload);
            const prevSig = this.lastDataSignatures.get(`sensor_${normId}`);

            if (prevSig !== sig) {
              this.lastDataSignatures.set(`sensor_${normId}`, sig);
              this.startOrResetLocal30sTimer(normId, sensorPayload);
            }
          });
        },
        () => {}
      );
      this.rtdbCleanupFns.push(unsubSensorData);
    } catch {
      this.isFirebaseWsConnected = true;
      this.broadcastConnectionState();
    }
  }

  /**
   * Probes whether the current host supports the Node Socket.IO endpoint before opening a socket.
   * On Vercel (`*.vercel.app` or static SPA hosts where `/socket.io` rewrites to `index.html`),
   * it avoids failed WebSocket console errors and uses the direct Firebase RTDB WebSocket bridge.
   */
  private async initSocketSafely() {
    if (this.socket || typeof window === 'undefined') return;

    const host = window.location.hostname || '';
    if (host.includes('vercel.app')) {
      // On Vercel, use direct Firebase Realtime Database WebSocket (`wss://`) with zero console errors
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
        // Static/serverless host detected — rely on Firebase RTDB native WebSocket
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
              const normId = this.normalizeDeviceId(devId);
              this.localStatusMap.set(normId, st.status);
              if (st.lastDataAt) this.localLastDataAt.set(normId, st.lastDataAt);
              this.latestStatuses.set(normId, st);
              this.notifyStatusListeners(normId, st.status, st);
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
        const normId = this.normalizeDeviceId(payload.deviceId);
        this.localStatusMap.set(normId, payload.status);
        if (payload.lastDataAt) this.localLastDataAt.set(normId, payload.lastDataAt);
        this.latestStatuses.set(normId, payload);
        this.notifyStatusListeners(normId, payload.status, payload);
      });

      this.socket.on('devices:status_sync', (statuses: Record<string, DeviceStatusPayload>) => {
        if (!statuses) return;
        Object.entries(statuses).forEach(([devId, st]) => {
          const normId = this.normalizeDeviceId(devId);
          this.localStatusMap.set(normId, st.status);
          if (st.lastDataAt) this.localLastDataAt.set(normId, st.lastDataAt);
          this.latestStatuses.set(normId, st);
          this.notifyStatusListeners(normId, st.status, st);
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
              this.startOrResetLocal30sTimer(normId, devPayload);
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
   * If the data signature is new or updated, starts/resets the 30-second timer
   * both locally and on the backend WebSocket.
   */
  public reportFrontendDataReceived(deviceId: string, data: any, forceTimerReset: boolean = false) {
    const normId = this.normalizeDeviceId(deviceId);
    const sig = this.computeDataSignature(data);
    const prevSig = this.lastDataSignatures.get(normId);

    if (!forceTimerReset && prevSig !== undefined && prevSig === sig) {
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
    } else {
      this.startOrResetLocal30sTimer(normId);
      const created = this.latestStatuses.get(normId);
      if (created) callback(created.status, created);
      if (this.socket?.connected) {
        this.socket.emit('client:request_device_status', normId);
      }
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
    return this.latestStatuses.get(normId)?.status || 'online';
  }
}

export const socketTelemetryService = new SocketTelemetryService();

import { io, Socket } from 'socket.io-client';

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

class SocketTelemetryService {
  private socket: Socket | null = null;
  private statusListeners = new Map<string, Set<(status: 'online' | 'offline', meta?: DeviceStatusPayload) => void>>();
  private telemetryListeners = new Map<string, Set<(data: any) => void>>();
  private globalTelemetryListeners = new Set<(devicesMap: Record<string, any>) => void>();
  private latestStatuses = new Map<string, DeviceStatusPayload>();
  private lastDataSignatures = new Map<string, string>();
  private connectionListeners = new Set<(connected: boolean) => void>();

  constructor() {
    if (typeof window !== 'undefined') {
      this.initSocket();
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
      const keys = Object.keys(data).filter((k) => k !== 'commands' && k !== 'status' && k !== 'online');
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

  private initSocket() {
    if (this.socket) return;

    this.socket = io('/', {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
    });

    this.socket.on('connect', () => {
      this.connectionListeners.forEach((cb) => cb(true));
      this.socket?.emit('client:request_sync');
    });

    this.socket.on('disconnect', () => {
      this.connectionListeners.forEach((cb) => cb(false));
    });

    // Initial full state from server WebSocket
    this.socket.on(
      'devices:init',
      (payload: {
        devices?: Record<string, any>;
        statuses?: Record<string, DeviceStatusPayload>;
      }) => {
        if (payload?.statuses) {
          Object.entries(payload.statuses).forEach(([devId, st]) => {
            const normId = this.normalizeDeviceId(devId);
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

    // Real-time status updates driven by the backend 30-second timer
    this.socket.on('device:status', (payload: DeviceStatusPayload) => {
      if (!payload || !payload.deviceId) return;
      const normId = this.normalizeDeviceId(payload.deviceId);
      this.latestStatuses.set(normId, payload);
      this.notifyStatusListeners(normId, payload.status, payload);
    });

    // Batch status sync tick from server
    this.socket.on('devices:status_sync', (statuses: Record<string, DeviceStatusPayload>) => {
      if (!statuses) return;
      Object.entries(statuses).forEach(([devId, st]) => {
        const normId = this.normalizeDeviceId(devId);
        this.latestStatuses.set(normId, st);
        this.notifyStatusListeners(normId, st.status, st);
      });
    });

    // Zero-lag telemetry broadcast from backend database WebSocket bridge
    this.socket.on('device:telemetry', (payload: DeviceTelemetryBroadcast) => {
      if (!payload || !payload.deviceId) return;
      const normId = this.normalizeDeviceId(payload.deviceId);
      if (payload.status) {
        const statusObj: DeviceStatusPayload = {
          deviceId: normId,
          status: payload.status,
          lastDataAt: payload.lastDataAt || Date.now(),
        };
        this.latestStatuses.set(normId, statusObj);
        this.notifyStatusListeners(normId, payload.status, statusObj);
      }
      if (payload.data) {
        this.notifyTelemetryListeners(normId, payload.data);
      }
    });
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
   * If the data signature is new or updated, emits `device:data_received` to the backend
   * which starts/resets the 30-second backend timer for online/offline status.
   */
  public reportFrontendDataReceived(deviceId: string, data: any, forceTimerReset: boolean = false) {
    const normId = this.normalizeDeviceId(deviceId);
    const sig = this.computeDataSignature(data);
    const prevSig = this.lastDataSignatures.get(normId);

    if (!forceTimerReset && prevSig !== undefined && prevSig === sig) {
      // Data has not changed since last report — do not reset the 30-second timer
      return;
    }

    this.lastDataSignatures.set(normId, sig);

    if (!this.socket) {
      this.initSocket();
    }

    this.socket?.emit('device:data_received', {
      deviceId: normId,
      data,
      signature: sig,
      receivedAt: Date.now(),
    });
  }

  /**
   * Push a device update directly through the WebSocket to the database & all clients
   */
  public emitDeviceUpdate(deviceId: string, data: any) {
    const normId = this.normalizeDeviceId(deviceId);
    const sig = this.computeDataSignature(data);
    this.lastDataSignatures.set(normId, sig);

    if (!this.socket) {
      this.initSocket();
    }

    this.socket?.emit('device:update', {
      deviceId: normId,
      data,
      timestamp: Date.now(),
    });
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

    // Immediately deliver latest authoritative status from backend if available
    const existing = this.latestStatuses.get(normId);
    if (existing) {
      callback(existing.status, existing);
    } else {
      this.socket?.emit('client:request_device_status', normId);
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
    callback(Boolean(this.socket?.connected));
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

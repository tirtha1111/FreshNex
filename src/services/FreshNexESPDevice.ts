import { Security1 } from './Security1';
import { Security0 } from './Security0';
import { Security } from './Security';
import * as proto from './generated/proto.js';

export interface DiscoveredWifiNetwork {
  ssid: string;
  rssi: number;
  auth: number;
  bssid?: string;
  channel?: number;
}

export interface WifiStatusResult {
  connected: boolean;
  staState: 'disconnected' | 'connecting' | 'connected' | 'failed';
  ip?: string;
  ssid?: string;
  rssi?: number;
  failedReason?: 'authError' | 'networkNotFound' | 'unknown';
}

export interface HandshakeDiagnostics {
  characteristicName: string;
  characteristicUuid: string;
  writeSupported: boolean;
  writeWithoutResponseSupported: boolean;
  readSupported: boolean;
  connected: boolean;
  lastError?: string;
}

export type ProvisioningState =
  | 'DISCONNECTED'
  | 'CONNECTING'
  | 'CONNECTED'
  | 'DISCOVERING'
  | 'READY'
  | 'SECURITY_HANDSHAKE'
  | 'SECURITY_ESTABLISHED'
  | 'WIFI_SCANNING'
  | 'WIFI_CONFIGURING'
  | 'WIFI_APPLYING'
  | 'VERIFYING_FIREBASE'
  | 'SUCCESS'
  | 'ERROR';

// Official Espressif WiFiProv Primary Service UUIDs
export const ESP_PROV_PRIMARY_SERVICE_UUIDS = [
  '1775244d-6b43-439b-877c-060f2d9bed07', // Official Espressif 128-bit default service UUID
  'b4df5a1c-3f6b-f4bf-ea4a-820304901a02', // Arduino firmware primary provisioning service UUID
  '021a9004-0382-4aea-bff4-6b3f1c5adfb4', // Little Endian variant
  '0000ffff-0000-1000-8000-00805f9b34fb', // Standard 16-bit 0xffff service UUID
];

// Alias for backwards compatibility
export const ESP_PROV_SERVICE_UUIDS = ESP_PROV_PRIMARY_SERVICE_UUIDS;

/**
 * Robust protobuf decoder for WiFiScanPayload that handles standard protobuf,
 * length-delimited protobuf, and varint-prefixed frames from Espressif protocomm.
 */
function hex16(buf: Uint8Array): string {
  return Array.from(buf.slice(0, 16)).map(b => b.toString(16).padStart(2, '0')).join(' ');
}

/**
 * Robust protobuf decoder for WiFiScanPayload that handles standard protobuf
 * and length-delimited protobuf from Espressif protocomm.
 */
function decodeWiFiScanPayloadRobust(bytes: Uint8Array): {
  payload: proto.WiFiScanPayload;
  decodeMethod: string;
} {
  console.log(`PROTOBUF INPUT:\nlength = ${bytes.length}\nfirst 16 bytes = ${hex16(bytes)}`);

  // Strategy 1: Standard Protobuf decode
  try {
    const p1 = proto.WiFiScanPayload.decode(bytes);
    if (p1 && (p1.msg !== undefined && p1.msg !== null) && (p1.respScanResult || p1.respScanStart || p1.respScanStatus)) {
      const count = p1.respScanResult?.entries?.length || 0;
      console.log(`PROTOBUF RESULT:\nAP count = ${count}`);
      return { payload: p1, decodeMethod: 'standard' };
    }
  } catch (e1: any) {
    console.warn('[ESP32-PROV] Standard protobuf decode note:', e1?.message || e1);
  }

  // Strategy 2: Length-delimited Protobuf decode
  try {
    const p2 = proto.WiFiScanPayload.decodeDelimited(bytes);
    if (p2 && (p2.msg !== undefined && p2.msg !== null) && (p2.respScanResult || p2.respScanStart || p2.respScanStatus)) {
      const count = p2.respScanResult?.entries?.length || 0;
      console.log(`PROTOBUF RESULT:\nAP count = ${count}`);
      return { payload: p2, decodeMethod: 'delimited' };
    }
  } catch (e2: any) {
    console.warn('[ESP32-PROV] Delimited protobuf decode note:', e2?.message || e2);
  }

  // Strategy 3: Varint length prefix slice fallback
  try {
    let pos = 0;
    let len = 0;
    let shift = 0;
    while (pos < bytes.length && pos < 5) {
      const b = bytes[pos];
      len |= (b & 0x7f) << shift;
      pos++;
      if ((b & 0x80) === 0) break;
      shift += 7;
    }
    if (pos > 0 && pos < bytes.length && len > 0) {
      const sliced = bytes.subarray(pos, pos + len);
      const p3 = proto.WiFiScanPayload.decode(sliced);
      if (p3 && (p3.msg !== undefined && p3.msg !== null) && (p3.respScanResult || p3.respScanStart || p3.respScanStatus)) {
        const count = p3.respScanResult?.entries?.length || 0;
        console.log(`PROTOBUF RESULT:\nAP count = ${count}`);
        return { payload: p3, decodeMethod: 'varint_slice' };
      }
    }
  } catch (e3: any) {
    console.warn('[ESP32-PROV] Varint slice protobuf decode note:', e3?.message || e3);
  }

  console.error('PROTOBUF RESULT:\nAP count = 0 (Decode Failed)');
  throw new Error(`Scan response decode error: Unable to parse protobuf bytes (${bytes.length} bytes)`);
}

export class FreshNexESPDevice {
  private device: any;
  private pop: string;
  private isVirtual: boolean;
  private virtualStep: number = 0;

  // BLE GATT handles
  private gattServer: any = null;
  private primaryService: any = null;
  private endpointChars: Map<string, any> = new Map();
  private security: Security | null = null;
  private isConnectedFlag: boolean = false;
  private currentState: ProvisioningState = 'DISCONNECTED';

  // Callbacks
  private onProgressCallback?: (msg: string) => void;
  private onStateChangeCallback?: (state: ProvisioningState, msg: string) => void;

  // Serialized operation queue (Mutex)
  private gattQueue: Promise<any> = Promise.resolve();

  private diagnostics: HandshakeDiagnostics = {
    characteristicName: 'prov-session',
    characteristicUuid: '',
    writeSupported: false,
    writeWithoutResponseSupported: false,
    readSupported: false,
    connected: false
  };

  constructor(device: any, pop: string = '12345678', isVirtual: boolean = false) {
    this.device = device;
    this.pop = pop;
    this.isVirtual = isVirtual;
    if (this.device) {
      this.attachGattListener();
    }
  }

  isVirtualDevice(): boolean {
    return this.isVirtual;
  }

  setPopCode(pop: string) {
    this.pop = pop;
  }

  getDeviceName(): string {
    if (this.isVirtual) return 'PROV_YGSFD000124 (Virtual)';
    return this.device?.name || 'PROV_YGSFD000124';
  }

  isDeviceConnected(): boolean {
    if (this.isVirtual) return this.isConnectedFlag;
    return !!(this.device?.gatt?.connected && this.gattServer?.connected);
  }

  getState(): ProvisioningState {
    return this.currentState;
  }

  getDiagnostics(): HandshakeDiagnostics {
    return {
      ...this.diagnostics,
      connected: this.isDeviceConnected()
    };
  }

  private updateState(state: ProvisioningState, message?: string) {
    this.currentState = state;
    if (message && this.onProgressCallback) {
      this.onProgressCallback(message);
    }
    if (this.onStateChangeCallback) {
      this.onStateChangeCallback(state, message || '');
    }
  }

  private reportProgress(msg: string) {
    if (this.onProgressCallback) {
      this.onProgressCallback(msg);
    }
  }

  /**
   * Enqueues BLE GATT operations sequentially to prevent concurrent access
   */
  private async runGattOp<T>(fn: () => Promise<T>): Promise<T> {
    const res = this.gattQueue.then(() => fn());
    this.gattQueue = res.catch(() => {});
    return res;
  }

  /**
   * Bound GATT disconnect event handler with timestamped diagnostic logging
   */
  private handleGattDisconnected = (event: Event) => {
    console.warn('[ESP32-BLE-PROV] ⚠️ gattserverdisconnected event fired on BluetoothDevice!', {
      deviceId: this.device?.id,
      deviceName: this.device?.name,
      timestamp: new Date().toISOString(),
      event
    });
    this.isConnectedFlag = false;
    this.gattServer = null;
    this.primaryService = null;
    this.endpointChars.clear();
    // Invalidate security session on disconnect so fresh keys are exchanged on reconnect
    this.security = null;
    this.updateState('DISCONNECTED', 'BLE connection lost.');
  };

  private attachGattListener(): void {
    if (this.device) {
      try {
        this.device.removeEventListener('gattserverdisconnected', this.handleGattDisconnected);
      } catch {}
      this.device.addEventListener('gattserverdisconnected', this.handleGattDisconnected);
    }
  }

  /**
   * Active GATT verification and automatic reconnect sequence
   */
  private async ensureActiveConnection(): Promise<void> {
    if (this.isVirtual) return;

    if (!this.device || !this.device.gatt) {
      throw new Error('Bluetooth device handle is unavailable.');
    }

    const isGattActive = !!(this.device.gatt.connected && this.gattServer && this.gattServer.connected && this.endpointChars.has('prov-session'));

    if (!isGattActive) {
      console.warn('[ESP32-BLE-PROV] GATT server is disconnected or endpoint handles are stale. Initiating reconnection & discovery sequence...');
      this.updateState('DISCONNECTED', 'BLE connection lost. Reconnecting...');

      // Clear stale service & characteristic handles and invalidate security session
      this.primaryService = null;
      this.endpointChars.clear();
      this.security = null;

      let reconnected = false;
      for (let attempt = 1; attempt <= 3; attempt++) {
        try {
          console.log(`[ESP32-BLE-PROV] Reconnect attempt ${attempt}/3 to device "${this.getDeviceName()}"...`);
          this.attachGattListener();
          this.gattServer = await this.device.gatt.connect();
          await new Promise(r => setTimeout(r, 200));

          if (this.device.gatt.connected) {
            reconnected = true;
            console.log('[ESP32-BLE-PROV] GATT server reconnected successfully.');
            break;
          }
        } catch (rErr: any) {
          console.warn(`[ESP32-BLE-PROV] Reconnect attempt ${attempt} failed:`, rErr?.message || rErr);
          await new Promise(r => setTimeout(r, 300));
        }
      }

      if (!reconnected || !this.device.gatt.connected) {
        this.updateState('ERROR', 'ESP32 BLE connection was lost. Please press Retry Handshake.');
        throw new Error('ESP32 BLE connection was lost. Please press Retry Handshake.');
      }

      this.updateState('DISCOVERING', 'BLE reconnected. Rediscovering services and endpoints...');
      await this.discoverProvisioningServiceInternal();
      await this.discoverEndpointCharacteristicsInternal();
      this.updateState('READY', 'BLE reconnected and verified.');
    }
  }

  /**
   * Connects over BLE, discovers Espressif WiFiProv services, and executes Security 1 handshake.
   */
  async connect(
    options: { type?: string } = { type: 'Security1' },
    onProgress?: (msg: string) => void,
    onStateChange?: (state: ProvisioningState, msg: string) => void
  ): Promise<void> {
    this.onProgressCallback = onProgress;
    this.onStateChangeCallback = onStateChange;

    if (this.isVirtual) {
      this.updateState('CONNECTING', 'Connecting to virtual ESP32...');
      await new Promise(r => setTimeout(r, 300));
      this.updateState('CONNECTED', '✓ Connected to ESP32');
      await new Promise(r => setTimeout(r, 250));
      this.updateState('DISCOVERING', '✓ Provisioning service found');
      await new Promise(r => setTimeout(r, 250));
      this.updateState('READY', '✓ prov-session found');
      await new Promise(r => setTimeout(r, 250));
      this.updateState('SECURITY_HANDSHAKE', 'Starting Security 1 handshake...');
      await new Promise(r => setTimeout(r, 300));
      this.updateState('SECURITY_ESTABLISHED', 'Handshake successful');
      this.isConnectedFlag = true;
      return;
    }

    return this.runGattOp(async () => {
      this.updateState('CONNECTING', 'Connecting to ESP32...');

      if (!this.device || !this.device.gatt) {
        throw new Error('Invalid Bluetooth device. GATT interface is missing.');
      }

      this.attachGattListener();

      // 1. Connect GATT
      console.log(`[ESP32-BLE-PROV] 1. Connecting to GATT Server on "${this.getDeviceName()}"...`);
      const connectPromise = this.device.gatt.connect();
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('BLE GATT connection timed out after 12 seconds.')), 12000)
      );

      this.gattServer = await Promise.race([connectPromise, timeoutPromise]);
      this.updateState('CONNECTED', 'Connected to ESP32');
      console.log('[ESP32-BLE-PROV] 2. GATT server connected successfully. device.gatt.connected =', this.device.gatt.connected);

      await new Promise(r => setTimeout(r, 200));

      if (!this.device.gatt.connected) {
        throw new Error('GATT connection failed immediately after connect.');
      }

      // 2. Discover Primary Provisioning Service
      this.updateState('DISCOVERING', 'Discovering provisioning service...');
      await this.discoverProvisioningServiceInternal();
      this.reportProgress('Provisioning service found');

      // 3. Discover Characteristics / Endpoints
      this.updateState('DISCOVERING', 'Discovering provisioning characteristics...');
      await this.discoverEndpointCharacteristicsInternal();
      this.reportProgress('prov-session found');

      // 4. Verify Connection Status
      this.updateState('READY', 'Checking GATT connection...');
      if (!this.device.gatt.connected) {
        await this.ensureActiveConnection();
      }
      this.reportProgress('GATT connection verified');

      // 5. Establish Espressif Security 1 Handshake
      this.updateState('SECURITY_HANDSHAKE', 'Starting Security 1 handshake...');
      console.log('[ESP32-BLE-PROV] 5. Starting Espressif Security 1 handshake...');

      this.security = new Security1(this.pop);

      try {
        await this.performSecurity1HandshakeInternal();
        this.updateState('SECURITY_ESTABLISHED', 'Handshake successful');
      } catch (sec1Err: any) {
        console.warn('[ESP32-BLE-PROV] Security 1 handshake initial attempt failed:', sec1Err?.message || sec1Err);
        
        // Handle connection drop during handshake: Reconnect & restart fresh Security 1 session
        if (!this.device?.gatt?.connected) {
          console.log('[ESP32-BLE-PROV] GATT disconnected during handshake. Reconnecting & restarting Security 1 session...');
          this.reportProgress('BLE connection lost. Reconnecting...');
          await this.ensureActiveConnection();
          this.reportProgress('BLE reconnected. Restarting secure handshake...');
          this.security = new Security1(this.pop); // Fresh cryptographic session!
          await this.performSecurity1HandshakeInternal();
          this.updateState('SECURITY_ESTABLISHED', 'Handshake successful');
        } else if (
          sec1Err?.message?.includes('Invalid security scheme') ||
          sec1Err?.message?.includes('SecScheme0') ||
          !this.pop
        ) {
          console.log('[ESP32-BLE-PROV] Attempting fallback to Security 0 (Unencrypted)...');
          this.security = new Security0();
          const req0 = await this.security.getSessionSetupRequest();
          const resp0 = await this.sendRawDataInternal('prov-session', req0, 1);
          await this.security.processSessionSetupResponse(resp0);
          this.updateState('SECURITY_ESTABLISHED', 'Security 0 handshake successful');
        } else {
          this.updateState('ERROR', sec1Err?.message || 'Security Handshake Failed');
          throw sec1Err;
        }
      }

      this.isConnectedFlag = true;
      console.log('[ESP32-BLE-PROV] 6. Secure provisioning session successfully established!');
    });
  }

  /**
   * Discovers active Espressif provisioning GATT primary service using ONLY primary service UUIDs
   */
  private async discoverProvisioningServiceInternal(): Promise<void> {
    if (!this.device || !this.device.gatt) throw new Error('Bluetooth device is unavailable');
    if (!this.device.gatt.connected) {
      console.log('[ESP32-BLE-PROV] Connecting GATT in discoverProvisioningServiceInternal...');
      this.gattServer = await this.device.gatt.connect();
    } else {
      this.gattServer = this.device.gatt;
    }

    let discoveredServices: any[] = [];
    try {
      discoveredServices = await this.gattServer.getPrimaryServices();
    } catch (e) {
      console.warn('[ESP32-BLE-PROV] getPrimaryServices() failed, querying specific candidate service UUIDs individually.');
    }

    if (discoveredServices.length > 0) {
      for (const service of discoveredServices) {
        const sUuid = service.uuid.toLowerCase();
        const isKnown = ESP_PROV_PRIMARY_SERVICE_UUIDS.some(u => sUuid.includes(u.toLowerCase()) || u.toLowerCase().includes(sUuid));
        if (isKnown) {
          this.primaryService = service;
          console.log(`[ESP32-BLE-PROV] Selected primary provisioning service: ${sUuid}`);
          return;
        }
      }

      for (const service of discoveredServices) {
        try {
          const chars = await service.getCharacteristics();
          if (chars && chars.length >= 2) {
            this.primaryService = service;
            console.log(`[ESP32-BLE-PROV] Selected candidate service with ${chars.length} characteristics: ${service.uuid}`);
            return;
          }
        } catch {}
      }
    }

    for (const candidateUuid of ESP_PROV_PRIMARY_SERVICE_UUIDS) {
      try {
        const s = await this.gattServer.getPrimaryService(candidateUuid);
        if (s) {
          this.primaryService = s;
          console.log(`[ESP32-BLE-PROV] Found matching primary service via candidate UUID: ${candidateUuid}`);
          return;
        }
      } catch {}
    }

    throw new Error('Espressif provisioning service was not found. Ensure ESP32 is powered on and running WiFiProv firmware.');
  }

  /**
   * Discovers and maps endpoint characteristics directly on primary service
   */
  private async discoverEndpointCharacteristicsInternal(): Promise<void> {
    if (!this.primaryService) throw new Error('Primary service not found');

    const chars = await this.primaryService.getCharacteristics();
    console.log(`[ESP32-BLE-PROV] Discovered ${chars.length} characteristics on primary service ${this.primaryService.uuid}`);

    this.endpointChars.clear();

    for (const char of chars) {
      const charUuid = char.uuid.toLowerCase();
      const props = char.properties;

      let endpointName: string | null = null;

      if (charUuid.includes('ff51') || charUuid.endsWith('ff51') || charUuid.includes('0001')) {
        endpointName = 'prov-session';
      } else if (charUuid.includes('ff52') || charUuid.endsWith('ff52') || charUuid.includes('0002')) {
        endpointName = 'prov-config';
      } else if (charUuid.includes('ff53') || charUuid.endsWith('ff53') || charUuid.includes('0003')) {
        endpointName = 'prov-scan';
      } else if (charUuid.includes('ff50') || charUuid.endsWith('ff50') || charUuid.includes('0000')) {
        endpointName = 'proto-ver';
      } else if (charUuid.includes('ff54') || charUuid.endsWith('ff54') || charUuid.includes('0004')) {
        endpointName = 'prov-ctrl';
      }

      if (endpointName) {
        this.endpointChars.set(endpointName, char);
        console.log(`[ESP32-BLE-PROV] Mapped endpoint '${endpointName}' -> UUID: ${charUuid}, write: ${props.write}, writeWithoutResponse: ${props.writeWithoutResponse}, read: ${props.read}`);

        if (endpointName === 'prov-session') {
          this.diagnostics.characteristicUuid = charUuid;
          this.diagnostics.writeSupported = !!props.write;
          this.diagnostics.writeWithoutResponseSupported = !!props.writeWithoutResponse;
          this.diagnostics.readSupported = !!props.read;
        }
      }
    }

    // Positional fallback if UUIDs are unmapped
    if (!this.endpointChars.has('prov-session')) {
      if (chars.length >= 2) {
        const sessionChar = chars[1] || chars[0];
        this.endpointChars.set('prov-session', sessionChar);
        console.warn(`[ESP32-BLE-PROV] Positional fallback for prov-session -> UUID: ${sessionChar.uuid}`);
        this.diagnostics.characteristicUuid = sessionChar.uuid;
        this.diagnostics.writeSupported = !!sessionChar.properties.write;
        this.diagnostics.writeWithoutResponseSupported = !!sessionChar.properties.writeWithoutResponse;
        this.diagnostics.readSupported = !!sessionChar.properties.read;
      }
    }

    if (!this.endpointChars.has('prov-config') && chars.length >= 3) {
      const configChar = chars[2] || chars[0];
      if (![...this.endpointChars.values()].includes(configChar)) {
        this.endpointChars.set('prov-config', configChar);
        console.warn(`[ESP32-BLE-PROV] Positional fallback for prov-config -> UUID: ${configChar.uuid}`);
      }
    }

    if (!this.endpointChars.has('prov-scan')) {
      for (const char of chars) {
        if (![...this.endpointChars.values()].includes(char)) {
          this.endpointChars.set('prov-scan', char);
          console.warn(`[ESP32-BLE-PROV] Positional fallback for prov-scan -> UUID: ${char.uuid}`);
          break;
        }
      }
    }

    if (!this.endpointChars.has('prov-session')) {
      throw new Error('Endpoint characteristic "prov-session" was not found on this BLE device.');
    }
  }

  /**
   * Executes the 2-step Curve25519 + AES-256-CTR Security 1 handshake
   */
  private async performSecurity1HandshakeInternal(): Promise<void> {
    if (!this.security) throw new Error('Security module not initialized');

    await new Promise(r => setTimeout(r, 100));

    // --- STEP 1: Exchange 0 ---
    if (process.env.NODE_ENV !== 'production') {
      console.log('[ESP32-BLE-PROV-DEBUG] Handshake Step: Session_Command0');
    }
    const setupReq0 = await this.security.getSessionSetupRequest();
    const setupResp0 = await this.sendRawDataInternal('prov-session', setupReq0, 1);

    await new Promise(r => setTimeout(r, 100));

    // --- STEP 2: Exchange 1 ---
    if (process.env.NODE_ENV !== 'production') {
      console.log('[ESP32-BLE-PROV-DEBUG] Handshake Step: Session_Command1');
    }
    const sec1 = this.security as Security1;
    const setupReq1 = await sec1.processSessionSetupResponse0(setupResp0);
    const setupResp1 = await this.sendRawDataInternal('prov-session', setupReq1, 2);

    // --- STEP 3: Verify and Establish ---
    if (process.env.NODE_ENV !== 'production') {
      console.log('[ESP32-BLE-PROV-DEBUG] Handshake Step: Verify Session_Response1');
    }
    await sec1.processSessionSetupResponse1(setupResp1);
  }

  /**
   * Writes raw binary data with required logging format and pre-write active connection verification.
   * If disconnected, reconnects and rediscovers services & characteristics to ensure fresh characteristic handles.
   */
  private async sendRawDataInternal(endpoint: string, data: Uint8Array, handshakeStep?: number): Promise<Uint8Array> {
    const endpointKey = endpoint.toLowerCase();

    // 1. Verify device.gatt.connected BEFORE EVERY GATT OPERATION
    if (!this.device || !this.device.gatt || !this.device.gatt.connected || !this.gattServer || !this.gattServer.connected || !this.endpointChars.has(endpointKey)) {
      console.warn(`[ESP32-BLE-PROV] GATT disconnected or characteristic handle missing before write to '${endpoint}'. Initiating connection & discovery...`);
      this.primaryService = null;
      this.endpointChars.clear();

      this.attachGattListener();
      this.gattServer = await this.device.gatt.connect();
      await new Promise(r => setTimeout(r, 150));

      await this.discoverProvisioningServiceInternal();
      await this.discoverEndpointCharacteristicsInternal();
    }

    // 2. Fetch fresh characteristic instance (never reuse stale handles)
    let char = this.endpointChars.get(endpointKey);
    if (!char) {
      throw new Error(`Characteristic for endpoint '${endpoint}' not found after discovery.`);
    }

    // MANDATORY STANDALONE CLEAN PAYLOAD:
    // Create an isolated Uint8Array copy with byteOffset = 0 and buffer length = data.length.
    // This prevents Web Bluetooth GATT drivers from sending pooled ArrayBuffer fragments or garbage bytes.
    const cleanPayload = new Uint8Array(data.length);
    cleanPayload.set(data);

    const gattConn = !!(this.device?.gatt?.connected);
    const charConn = !!(this.gattServer?.connected && char);

    const hexPayload = Array.from(cleanPayload).map(b => b.toString(16).padStart(2, '0')).join('');
    console.log(`[ESP32-BLE-PROV] Write Check -> GATT connected: ${gattConn}, Characteristic connected: ${charConn}, Endpoint: ${endpoint}, Write method: writeValueWithResponse, Payload length: ${cleanPayload.length}`);
    console.log(`[ESP32-BLE-PROV] Outgoing Protocomm Payload (${cleanPayload.length} bytes): ${hexPayload}`);

    let writeSuccess = false;
    let lastWriteErr: any = null;

    // Strategy 1: Perform write with active GATT verification
    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        if (!this.device?.gatt?.connected) {
          console.warn(`[ESP32-BLE-PROV] GATT dropped right before write attempt ${attempt}. Reconnecting...`);
          this.primaryService = null;
          this.endpointChars.clear();
          this.gattServer = await this.device.gatt.connect();
          await this.discoverProvisioningServiceInternal();
          await this.discoverEndpointCharacteristicsInternal();
          char = this.endpointChars.get(endpointKey);
        }

        if (typeof char.writeValueWithResponse === 'function') {
          await char.writeValueWithResponse(cleanPayload);
          writeSuccess = true;
          break;
        } else if (typeof char.writeValue === 'function') {
          await char.writeValue(cleanPayload);
          writeSuccess = true;
          break;
        } else if (typeof char.writeValueWithoutResponse === 'function') {
          await char.writeValueWithoutResponse(cleanPayload);
          writeSuccess = true;
          break;
        }
      } catch (wErr: any) {
        lastWriteErr = wErr;
        console.warn(`[ESP32-BLE-PROV] Write attempt ${attempt} on ${endpoint} failed:`, wErr?.message || wErr);
        await new Promise(r => setTimeout(r, 200));
      }
    }

    // Strategy 2: MTU Chunking fallback if direct write failed
    if (!writeSuccess) {
      console.log(`[ESP32-BLE-PROV] Single write failed on ${endpoint}, attempting 20-byte chunked write...`);
      try {
        if (!this.device?.gatt?.connected) {
          this.gattServer = await this.device.gatt.connect();
          await this.discoverProvisioningServiceInternal();
          await this.discoverEndpointCharacteristicsInternal();
          char = this.endpointChars.get(endpointKey);
        }

        const chunkSize = 20;
        for (let offset = 0; offset < cleanPayload.length; offset += chunkSize) {
          const slice = cleanPayload.subarray(offset, Math.min(offset + chunkSize, cleanPayload.length));
          const cleanSlice = new Uint8Array(slice.length);
          cleanSlice.set(slice);

          if (typeof char.writeValueWithResponse === 'function') {
            await char.writeValueWithResponse(cleanSlice);
          } else if (typeof char.writeValueWithoutResponse === 'function') {
            await char.writeValueWithoutResponse(cleanSlice);
          } else {
            await char.writeValue(cleanSlice);
          }
          await new Promise(r => setTimeout(r, 40));
        }
        writeSuccess = true;
      } catch (chunkErr: any) {
        lastWriteErr = chunkErr;
        console.warn(`[ESP32-BLE-PROV] Chunked write on ${endpoint} failed:`, chunkErr?.message || chunkErr);
      }
    }

    if (!writeSuccess) {
      const errMsg = lastWriteErr?.message || 'GATT write error unknown';
      this.diagnostics.lastError = errMsg;
      throw new Error(`Failed to write to ESP32 characteristic '${endpoint}': ${errMsg}`);
    }

    // Pause briefly for FreeRTOS processing on ESP32
    await new Promise(r => setTimeout(r, 150));

    // 3. Read Response from ESP32 with connection verification
    let resp: DataView | null = null;
    let lastReadErr: any = null;

    for (let attempt = 1; attempt <= 4; attempt++) {
      try {
        if (!this.device?.gatt?.connected) {
          console.warn(`[ESP32-BLE-PROV] GATT dropped before read attempt ${attempt}. Reconnecting...`);
          this.gattServer = await this.device.gatt.connect();
          await this.discoverProvisioningServiceInternal();
          await this.discoverEndpointCharacteristicsInternal();
          char = this.endpointChars.get(endpointKey);
        }

        resp = await char.readValue();
        if (resp && resp.byteLength > 0) {
          break;
        }
        await new Promise(r => setTimeout(r, 120));
      } catch (rErr: any) {
        lastReadErr = rErr;
        console.warn(`[ESP32-BLE-PROV] Read attempt ${attempt} on ${endpoint} failed:`, rErr?.message || rErr);
        await new Promise(r => setTimeout(r, 150));
      }
    }

    if (!resp || resp.byteLength === 0) {
      const readErrMsg = lastReadErr?.message || 'GATT read timeout';
      this.diagnostics.lastError = readErrMsg;
      throw new Error(`GATT read error: No response received from ${endpoint} on ESP32 (${readErrMsg})`);
    }

    const rawResponse = new Uint8Array(resp.buffer, resp.byteOffset, resp.byteLength);
    console.log(`RAW BLE RESPONSE:\nlength = ${rawResponse.length}\nfirst 16 bytes = ${hex16(rawResponse)}`);
    console.log(`AFTER PROTOCOMM UNWRAP:\nlength = ${rawResponse.length}\nfirst 16 bytes = ${hex16(rawResponse)}`);

    return rawResponse;
  }

  /**
   * Sends data through active secure channel (encrypted if Security1 is established)
   */
  async sendData(endpoint: string, data: Uint8Array): Promise<Uint8Array> {
    if (this.isVirtual) {
      return new Uint8Array(0);
    }

    return this.runGattOp(async () => {
      let payload = data;
      if (this.security && this.security.isEstablished() && endpoint !== 'prov-session') {
        payload = await this.security.encrypt(data);
      }

      const rawResponse = await this.sendRawDataInternal(endpoint, payload);

      if (this.security && this.security.isEstablished() && endpoint !== 'prov-session') {
        return await this.security.decrypt(rawResponse);
      }

      return rawResponse;
    });
  }

  /**
   * Full provision sequence: sets credentials and applies configuration
   */
  async provision(ssid: string, pass: string): Promise<boolean> {
    if (this.isVirtual) {
      await new Promise(r => setTimeout(r, 1000));
      return true;
    }

    this.updateState('WIFI_CONFIGURING', `Transmitting credentials for SSID: ${ssid}...`);
    const setOk = await this.setWifiCredentials(ssid, pass);
    if (!setOk) {
      throw new Error('Failed to set Wi-Fi credentials on ESP32');
    }

    this.updateState('WIFI_APPLYING', 'Applying Wi-Fi configuration on ESP32...');
    const applyOk = await this.applyWifiConfig();
    if (!applyOk) {
      throw new Error('Failed to apply Wi-Fi configuration on ESP32');
    }

    return true;
  }

  /**
   * Scans for available Wi-Fi networks using Espressif WiFiScan protocol
   */
  async scanWifiList(): Promise<DiscoveredWifiNetwork[]> {
    if (this.isVirtual) {
      console.log('Starting ESP32 Wi-Fi scan...');
      console.log('Sending provisioning scan request...');
      console.log('Waiting for ESP32 scan response...');
      console.log('ESP32 scan response received.');
      await new Promise(r => setTimeout(r, 600));
      const mockNetworks = [
        { ssid: 'Home-WiFi_2.4G', rssi: -45, auth: 3 },
        { ssid: 'FreshNex_IoT_Warehouse', rssi: -58, auth: 3 },
        { ssid: 'Office_Guest_Network', rssi: -66, auth: 0 },
        { ssid: 'SmartLab_AP_24', rssi: -72, auth: 3 }
      ];
      console.log(`Number of networks returned: ${mockNetworks.length}`);
      return mockNetworks;
    }

    // State 4 Check: BLE Disconnected
    if (!this.device || !this.device.gatt || !this.device.gatt.connected || !this.gattServer || !this.gattServer.connected) {
      const err = new Error('Bluetooth connection to ESP32 was lost. Please reconnect BLE.');
      (err as any).stateCode = 'BLE_DISCONNECTED';
      throw err;
    }

    // State 5 Check: Provisioning session is not established
    if (!this.security || !this.security.isEstablished()) {
      console.log('[ESP32-BLE-PROV] Security session not established. Performing fresh Security 1 handshake...');
      this.security = new Security1(this.pop);
      await this.performSecurity1HandshakeInternal();
    }

    // State 1 Check: Endpoint characteristic
    if (!this.endpointChars.has('prov-scan')) {
      const err = new Error("Scan request failed: Characteristic 'prov-scan' not found on ESP32 BLE service.");
      (err as any).stateCode = 'SCAN_FAILED';
      throw err;
    }

    console.log('Starting ESP32 Wi-Fi scan...');
    this.updateState('WIFI_SCANNING', 'Scanning Wi-Fi access points over BLE...');

    return this.runGattOp(async () => {
      const scanChar = 'prov-scan';

      console.log('Sending provisioning scan request...');

      // Step A: Send CmdScanStart
      let rawStartResp: Uint8Array;
      try {
        const scanStartMsg = proto.WiFiScanPayload.create({
          msg: proto.WiFiScanMsgType.TypeCmdScanStart,
          cmdScanStart: proto.CmdScanStart.create({
            blocking: true,
            passive: false,
            groupChannels: 0,
            periodMs: 120
          })
        });
        const scanStartBytes = proto.WiFiScanPayload.encode(scanStartMsg).finish();

        console.log('Waiting for ESP32 scan response...');
        rawStartResp = await this.sendDataInternal(scanChar, scanStartBytes);
        console.log('ESP32 scan response received.');

        if (rawStartResp && rawStartResp.length > 0) {
          try {
            const { payload: startPayload } = decodeWiFiScanPayloadRobust(rawStartResp);
            if (startPayload.status !== undefined && startPayload.status !== proto.Status.Success) {
              console.warn(`[ESP32-BLE-PROV] ScanStart returned status: ${startPayload.status}`);
            }
          } catch (e) {
            console.warn('[ESP32-BLE-PROV] ScanStart response decode note:', e);
          }
        }
      } catch (scanStartErr: any) {
        console.error('[ESP32-BLE-PROV] Scan request failed during CmdScanStart:', scanStartErr);
        const err = new Error(`Scan request failed: ${scanStartErr?.message || 'GATT write/read timeout on prov-scan'}`);
        (err as any).stateCode = 'SCAN_FAILED';
        throw err;
      }

      // Brief pause while ESP32 finishes hardware Wi-Fi radio scan
      await new Promise(r => setTimeout(r, 1200));

      // Step B: Send TypeCmdScanResult to fetch AP records
      console.log('[ESP32-BLE-PROV] Requesting Wi-Fi scan result entries from ESP32...');

      let rawResultBytes: Uint8Array;
      try {
        const scanResultMsg = proto.WiFiScanPayload.create({
          msg: proto.WiFiScanMsgType.TypeCmdScanResult,
          cmdScanResult: proto.CmdScanResult.create({
            startIndex: 0,
            count: 20
          })
        });
        rawResultBytes = await this.sendDataInternal(scanChar, proto.WiFiScanPayload.encode(scanResultMsg).finish());
      } catch (fetchErr: any) {
        console.error('[ESP32-BLE-PROV] CmdScanResult request failed:', fetchErr);
        const err = new Error(`Scan request failed: ${fetchErr?.message || 'Failed to retrieve scan results from ESP32'}`);
        (err as any).stateCode = 'SCAN_FAILED';
        throw err;
      }

      // Step C: Decode scan results using robust multi-strategy decoder
      let decodedResultPayload: proto.WiFiScanPayload;
      try {
        const { payload, decodeMethod } = decodeWiFiScanPayloadRobust(rawResultBytes);
        decodedResultPayload = payload;
        console.log(`[ESP32-BLE-PROV] Successfully decoded scan payload using method '${decodeMethod}'.`);
      } catch (decodeErr: any) {
        console.error('[ESP32-BLE-PROV] Failed to decode scan response payload:', decodeErr);
        const err = new Error(`ESP32 returned scan response, but the app failed to decode it: ${decodeErr?.message || decodeErr}`);
        (err as any).stateCode = 'DECODE_FAILED';
        throw err;
      }

      if (decodedResultPayload.status !== undefined && decodedResultPayload.status !== proto.Status.Success) {
        const err = new Error(`Scan request failed: ESP32 returned error status code ${decodedResultPayload.status}`);
        (err as any).stateCode = 'SCAN_FAILED';
        throw err;
      }

      const entries = decodedResultPayload.respScanResult?.entries || [];
      console.log(`[ESP32-PROV-DIAG] Number of AP records decoded: ${entries.length}`);
      console.log(`Number of networks returned: ${entries.length}`);

      const networks: DiscoveredWifiNetwork[] = [];

      for (const entry of entries) {
        let ssidStr = '';
        if (entry.ssid) {
          if (typeof entry.ssid === 'string') {
            ssidStr = entry.ssid;
          } else if (entry.ssid instanceof Uint8Array || ArrayBuffer.isView(entry.ssid)) {
            ssidStr = new TextDecoder().decode(entry.ssid).replace(/\0/g, '').trim();
          } else if (Array.isArray(entry.ssid)) {
            ssidStr = new TextDecoder().decode(new Uint8Array(entry.ssid)).replace(/\0/g, '').trim();
          }
        }
        if (ssidStr && !networks.some(n => n.ssid === ssidStr)) {
          networks.push({
            ssid: ssidStr,
            rssi: typeof entry.rssi === 'number' ? entry.rssi : -70,
            auth: typeof entry.auth === 'number' ? entry.auth : 0
          });
        }
      }

      return networks;
    });
  }

  private async sendDataInternal(endpoint: string, data: Uint8Array): Promise<Uint8Array> {
    const isProtectedEndpoint = endpoint !== 'prov-session';

    if (isProtectedEndpoint && (!this.security || !this.security.isEstablished())) {
      console.log(`[ESP32-BLE-PROV] Security 1 session is missing or lost prior to endpoint '${endpoint}'. Performing fresh handshake...`);
      this.security = new Security1(this.pop);
      await this.performSecurity1HandshakeInternal();
    }

    let payload = data;
    if (this.security && this.security.isEstablished() && isProtectedEndpoint) {
      payload = await this.security.encrypt(data);
    }

    const rawResponse = await this.sendRawDataInternal(endpoint, payload);

    if (this.security && this.security.isEstablished() && isProtectedEndpoint) {
      const decrypted = await this.security.decrypt(rawResponse);
      console.log(`AFTER SECURITY 1 DECRYPTION:\nlength = ${decrypted.length}\nfirst 16 bytes = ${hex16(decrypted)}`);

      return decrypted;
    }

    return rawResponse;
  }

  async setWifiCredentials(ssid: string, pass: string): Promise<boolean> {
    if (this.isVirtual) {
      await new Promise(r => setTimeout(r, 800));
      return true;
    }

    const ssidBytes = new TextEncoder().encode(ssid);
    const passBytes = new TextEncoder().encode(pass);

    const configMsg = proto.WiFiConfigPayload.create({
      msg: proto.WiFiConfigMsgType.TypeCmdSetConfig,
      cmdSetConfig: proto.CmdSetConfig.create({
        ssid: ssidBytes,
        passphrase: passBytes
      })
    });

    const configBytes = proto.WiFiConfigPayload.encode(configMsg).finish();
    const resp = await this.sendData('prov-config', configBytes);
    const decoded = proto.WiFiConfigPayload.decode(resp);

    return decoded.respSetConfig?.status === proto.Status.Success;
  }

  async applyWifiConfig(): Promise<boolean> {
    if (this.isVirtual) {
      await new Promise(r => setTimeout(r, 800));
      return true;
    }

    const applyMsg = proto.WiFiConfigPayload.create({
      msg: proto.WiFiConfigMsgType.TypeCmdApplyConfig,
      cmdApplyConfig: proto.CmdApplyConfig.create({})
    });

    const applyBytes = proto.WiFiConfigPayload.encode(applyMsg).finish();
    const resp = await this.sendData('prov-config', applyBytes);
    const decoded = proto.WiFiConfigPayload.decode(resp);

    return decoded.respApplyConfig?.status === proto.Status.Success;
  }

  async getWifiStatus(): Promise<WifiStatusResult> {
    if (this.isVirtual) {
      await new Promise(r => setTimeout(r, 600));
      this.virtualStep++;
      if (this.virtualStep >= 2) {
        return {
          connected: true,
          staState: 'connected',
          ip: '192.168.1.142',
          rssi: -52
        };
      }
      return {
        connected: false,
        staState: 'connecting'
      };
    }

    const statusMsg = proto.WiFiConfigPayload.create({
      msg: proto.WiFiConfigMsgType.TypeCmdGetStatus,
      cmdGetStatus: proto.CmdGetStatus.create({})
    });

    const statusBytes = proto.WiFiConfigPayload.encode(statusMsg).finish();
    const resp = await this.sendData('prov-config', statusBytes);
    const decoded = proto.WiFiConfigPayload.decode(resp);

    if (decoded.respGetStatus) {
      const respStatus = decoded.respGetStatus;
      const staStateEnum = respStatus.staState;

      let staStateStr: 'disconnected' | 'connecting' | 'connected' | 'failed' = 'disconnected';
      if (staStateEnum === proto.WifiStationState.Connected) {
        staStateStr = 'connected';
      } else if (staStateEnum === proto.WifiStationState.Connecting) {
        staStateStr = 'connecting';
      } else if (staStateEnum === proto.WifiStationState.ConnectionFailed) {
        staStateStr = 'failed';
      }

      let ipStr = undefined;
      if (respStatus.connected?.ip4Addr) {
        ipStr = respStatus.connected.ip4Addr;
      }

      return {
        connected: staStateEnum === proto.WifiStationState.Connected,
        staState: staStateStr,
        ip: ipStr
      };
    }

    return {
      connected: false,
      staState: 'disconnected'
    };
  }

  async disconnect(): Promise<void> {
    if (this.isVirtual) {
      this.isConnectedFlag = false;
      this.updateState('DISCONNECTED', 'Virtual device disconnected.');
      return;
    }

    try {
      if (this.device) {
        try {
          this.device.removeEventListener('gattserverdisconnected', this.handleGattDisconnected);
        } catch {}
      }
      if (this.gattServer && typeof this.gattServer.disconnect === 'function') {
        this.gattServer.disconnect();
      } else if (this.device && this.device.gatt && typeof this.device.gatt.disconnect === 'function') {
        this.device.gatt.disconnect();
      }
    } catch (e) {
      console.warn('[ESP32-BLE-PROV] Error during disconnect:', e);
    } finally {
      this.gattServer = null;
      this.primaryService = null;
      this.endpointChars.clear();
      this.security = null;
      this.isConnectedFlag = false;
      this.updateState('DISCONNECTED', 'GATT disconnected.');
    }
  }
}

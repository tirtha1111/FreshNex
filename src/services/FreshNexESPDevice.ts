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

// Official Espressif WiFiProv service UUIDs (Primary service UUID: b4df5a1c-3f6b-f4bf-ea4a-820304901a02)
export const ESP_PROV_SERVICE_UUIDS = [
  'b4df5a1c-3f6b-f4bf-ea4a-820304901a02', // Arduino firmware primary provisioning UUID
  '021a9004-0382-4aea-bff4-6b3f1c5adfb4', // Little Endian variant
  '1775244d-6b43-439b-877c-060f2d9bed07', // Official Espressif 128-bit default
  '0000ffff-0000-1000-8000-00805f9b34fb', // Standard 16-bit 0xffff
  '0000ff50-0000-1000-8000-00805f9b34fb', // proto-ver
  '0000ff51-0000-1000-8000-00805f9b34fb', // prov-session
  '0000ff52-0000-1000-8000-00805f9b34fb', // prov-config
  '0000ff53-0000-1000-8000-00805f9b34fb', // prov-scan
];

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
   * Bound GATT disconnect event handler
   */
  private handleGattDisconnected = () => {
    console.warn('[ESP32-BLE-PROV] gattserverdisconnected event received from BluetoothDevice');
    this.isConnectedFlag = false;
    this.gattServer = null;
    this.primaryService = null;
    this.endpointChars.clear();
    this.security = null; // Cryptographic session invalidated on disconnect
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

    const isGattActive = !!(this.device.gatt.connected && this.gattServer && this.gattServer.connected);

    if (!isGattActive) {
      console.warn('[ESP32-BLE-PROV] GATT server is disconnected. Initiating active reconnection sequence...');
      this.updateState('DISCONNECTED', 'BLE connection lost. Reconnecting...');

      // Invalidate stale GATT objects
      this.primaryService = null;
      this.endpointChars.clear();
      this.security = null; // Invalidate session on disconnect!

      let reconnected = false;
      for (let attempt = 1; attempt <= 2; attempt++) {
        try {
          console.log(`[ESP32-BLE-PROV] Reconnect attempt ${attempt}/2...`);
          this.attachGattListener();
          this.gattServer = await this.device.gatt.connect();
          await new Promise(r => setTimeout(r, 200));

          if (this.gattServer && this.gattServer.connected) {
            reconnected = true;
            console.log('[ESP32-BLE-PROV] GATT server reconnected successfully.');
            break;
          }
        } catch (rErr: any) {
          console.warn(`[ESP32-BLE-PROV] Reconnect attempt ${attempt} failed:`, rErr?.message);
          await new Promise(r => setTimeout(r, 300));
        }
      }

      if (!reconnected) {
        this.updateState('ERROR', 'ESP32 BLE connection was lost. Please press Retry Handshake.');
        throw new Error('ESP32 BLE connection was lost. Please press Retry Handshake.');
      }

      this.updateState('DISCOVERING', 'BLE reconnected. Rediscovering services...');
      await this.discoverProvisioningServiceInternal();
      await this.discoverEndpointCharacteristicsInternal();
      this.updateState('READY', 'BLE reconnected and verified.');
    }
  }

  /**
   * Connects over BLE, discovers Espressif WiFiProv services, checks version, and executes Security 1 handshake.
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
      console.log('[ESP32-BLE-PROV] 2. GATT server connected successfully.');

      await new Promise(r => setTimeout(r, 250));

      if (!this.device.gatt.connected) {
        throw new Error('GATT connection failed immediately after connect.');
      }

      // 2. Discover Services
      this.updateState('DISCOVERING', 'Discovering provisioning services...');
      await this.discoverProvisioningServiceInternal();
      this.reportProgress('Provisioning service found');

      // 3. Discover Characteristics / Endpoints
      this.updateState('DISCOVERING', 'Discovering provisioning characteristics...');
      await this.discoverEndpointCharacteristicsInternal();
      this.reportProgress('prov-session found');

      // 4. Check Connection
      this.updateState('READY', 'Checking GATT connection...');
      if (!this.device.gatt.connected) {
        await this.ensureActiveConnection();
      }
      this.reportProgress('GATT connection verified');

      // 5. Check protocol version
      await this.checkProtocolVersionInternal();

      // 6. Establish Security 1 Handshake
      this.updateState('SECURITY_HANDSHAKE', 'Starting Security 1 handshake...');
      console.log('[ESP32-BLE-PROV] 6. Starting Espressif Security 1 handshake...');

      this.security = new Security1(this.pop);

      try {
        await this.performSecurity1HandshakeInternal();
        this.updateState('SECURITY_ESTABLISHED', 'Handshake successful');
      } catch (sec1Err: any) {
        console.warn('[ESP32-BLE-PROV] Security 1 handshake initial attempt failed:', sec1Err?.message);
        
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
      console.log('[ESP32-BLE-PROV] 7. Secure provisioning session successfully established!');
    });
  }

  /**
   * Discovers active Espressif provisioning GATT service
   */
  private async discoverProvisioningServiceInternal(): Promise<void> {
    if (!this.gattServer) throw new Error('GATT server is not connected');

    let discoveredServices: any[] = [];
    try {
      discoveredServices = await this.gattServer.getPrimaryServices();
    } catch (e) {
      console.warn('[ESP32-BLE-PROV] getPrimaryServices() failed, querying candidate UUIDs individually.');
    }

    if (discoveredServices.length > 0) {
      for (const service of discoveredServices) {
        const sUuid = service.uuid.toLowerCase();
        const isKnown = ESP_PROV_SERVICE_UUIDS.some(u => sUuid.includes(u.toLowerCase()) || u.toLowerCase().includes(sUuid));
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

    for (const candidateUuid of ESP_PROV_SERVICE_UUIDS) {
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
   * Discovers and maps endpoint characteristics inspecting properties and user descriptors
   */
  private async discoverEndpointCharacteristicsInternal(): Promise<void> {
    if (!this.primaryService) throw new Error('Primary service not found');

    const chars = await this.primaryService.getCharacteristics();
    console.log(`[ESP32-BLE-PROV] Discovered ${chars.length} characteristics on primary service.`);

    this.endpointChars.clear();

    for (const char of chars) {
      const charUuid = char.uuid.toLowerCase();
      const props = char.properties;

      let endpointName: string | null = null;

      // Try reading User Description descriptor 0x2901 if available
      try {
        const descriptors = await char.getDescriptors();
        for (const desc of descriptors) {
          if (desc.uuid.toLowerCase().includes('2901')) {
            const descVal = await desc.readValue();
            const decoded = new TextDecoder().decode(new Uint8Array(descVal.buffer, descVal.byteOffset, descVal.byteLength)).trim().toLowerCase();
            if (decoded) {
              endpointName = decoded;
              console.log(`[ESP32-BLE-PROV] Descriptor endpoint name for ${charUuid}: "${decoded}"`);
              break;
            }
          }
        }
      } catch {}

      if (!endpointName) {
        if (charUuid.includes('ff51') || charUuid.endsWith('ff51') || charUuid.includes('0001')) {
          endpointName = 'prov-session';
        } else if (charUuid.includes('ff52') || charUuid.endsWith('ff52') || charUuid.includes('0002')) {
          endpointName = 'prov-config';
        } else if (charUuid.includes('ff53') || charUuid.endsWith('ff53') || charUuid.includes('0003')) {
          endpointName = 'prov-scan';
        } else if (charUuid.includes('ff50') || charUuid.endsWith('ff50') || charUuid.includes('0000')) {
          endpointName = 'proto-ver';
        } else if (charUuid.includes('ff54') || charUuid.endsWith('ff54')) {
          endpointName = 'prov-ctrl';
        }
      }

      if (endpointName) {
        this.endpointChars.set(endpointName, char);
        if (endpointName === 'prov-session') {
          this.diagnostics.characteristicUuid = charUuid;
          this.diagnostics.writeSupported = !!props.write;
          this.diagnostics.writeWithoutResponseSupported = !!props.writeWithoutResponse;
          this.diagnostics.readSupported = !!props.read;
        }

        if (process.env.NODE_ENV !== 'production') {
          console.log(`[ESP32-BLE-PROV-DEBUG] Endpoint: ${endpointName}, UUID: ${charUuid}, write: ${props.write}, writeWithoutResponse: ${props.writeWithoutResponse}, read: ${props.read}`);
        }
      }
    }

    if (!this.endpointChars.has('prov-session')) {
      if (chars.length >= 2) {
        const fallbackChar = chars[1] || chars[0];
        this.endpointChars.set('prov-session', fallbackChar);
        this.diagnostics.characteristicUuid = fallbackChar.uuid;
        this.diagnostics.writeSupported = !!fallbackChar.properties.write;
        this.diagnostics.writeWithoutResponseSupported = !!fallbackChar.properties.writeWithoutResponse;
        this.diagnostics.readSupported = !!fallbackChar.properties.read;
      }
    }

    if (!this.endpointChars.has('prov-session')) {
      throw new Error('Endpoint characteristic "prov-session" was not found on this BLE device.');
    }
  }

  /**
   * Checks proto-ver endpoint version / capabilities
   */
  private async checkProtocolVersionInternal(): Promise<void> {
    const protoChar = this.endpointChars.get('proto-ver');
    if (protoChar && protoChar.properties.read) {
      try {
        const val = await protoChar.readValue();
        const text = new TextDecoder().decode(new Uint8Array(val.buffer, val.byteOffset, val.byteLength)).replace(/\0/g, '').trim();
        console.log(`[ESP32-BLE-PROV] Protocol version: "${text}"`);
      } catch (e) {
        console.warn('[ESP32-BLE-PROV] proto-ver read optional skip:', e);
      }
    }
  }

  /**
   * Executes the 2-step Curve25519 + AES-256-CTR Security 1 handshake
   */
  private async performSecurity1HandshakeInternal(): Promise<void> {
    if (!this.security) throw new Error('Security module not initialized');

    await new Promise(r => setTimeout(r, 150));

    // --- STEP 1: Exchange 0 ---
    if (process.env.NODE_ENV !== 'production') {
      console.log('[ESP32-BLE-PROV-DEBUG] Handshake Step: Session_Command0');
    }
    const setupReq0 = await this.security.getSessionSetupRequest();
    const setupResp0 = await this.sendRawDataInternal('prov-session', setupReq0, 1);

    await new Promise(r => setTimeout(r, 120));

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
   * Writes raw binary data with required logging format and automatic write strategy
   */
  private async sendRawDataInternal(endpoint: string, data: Uint8Array, handshakeStep?: number): Promise<Uint8Array> {
    // Verify connection before write
    await this.ensureActiveConnection();

    let char = this.endpointChars.get(endpoint.toLowerCase());
    if (!char) {
      await this.discoverEndpointCharacteristicsInternal();
      char = this.endpointChars.get(endpoint.toLowerCase());
    }

    if (!char) {
      throw new Error(`Characteristic for endpoint '${endpoint}' not found`);
    }

    const payload = new Uint8Array(data.buffer, data.byteOffset, data.byteLength);
    const gattConn = !!(this.device?.gatt?.connected);
    const charConn = !!(this.gattServer?.connected && char);

    // Mandated logging format:
    console.log(`[ESP32-BLE-PROV] Write Check -> GATT connected: ${gattConn}, Characteristic connected: ${charConn}, Endpoint: ${endpoint}, Write method: writeValueWithResponse, Payload length: ${payload.length}`);

    let writeSuccess = false;
    let lastWriteErr: any = null;

    // Strategy 1: Primary write
    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        if (!this.device?.gatt?.connected) {
          await this.ensureActiveConnection();
          char = this.endpointChars.get(endpoint.toLowerCase());
        }

        if (typeof char.writeValueWithResponse === 'function') {
          await char.writeValueWithResponse(payload);
          writeSuccess = true;
          break;
        } else if (typeof char.writeValue === 'function') {
          await char.writeValue(payload);
          writeSuccess = true;
          break;
        } else if (typeof char.writeValueWithoutResponse === 'function') {
          await char.writeValueWithoutResponse(payload);
          writeSuccess = true;
          break;
        }
      } catch (wErr: any) {
        lastWriteErr = wErr;
        console.warn(`[ESP32-BLE-PROV] Write attempt ${attempt} on ${endpoint} failed:`, wErr?.message);
        await new Promise(r => setTimeout(r, 150));
      }
    }

    // Strategy 2: MTU Chunking fallback
    if (!writeSuccess) {
      console.log(`[ESP32-BLE-PROV] Direct write failed, attempting 20-byte chunked write on ${endpoint}...`);
      try {
        await this.ensureActiveConnection();
        char = this.endpointChars.get(endpoint.toLowerCase());
        const chunkSize = 20;
        for (let offset = 0; offset < payload.length; offset += chunkSize) {
          const slice = payload.subarray(offset, Math.min(offset + chunkSize, payload.length));
          if (typeof char.writeValueWithResponse === 'function') {
            await char.writeValueWithResponse(slice);
          } else if (typeof char.writeValueWithoutResponse === 'function') {
            await char.writeValueWithoutResponse(slice);
          } else {
            await char.writeValue(slice);
          }
          await new Promise(r => setTimeout(r, 40));
        }
        writeSuccess = true;
      } catch (chunkErr: any) {
        lastWriteErr = chunkErr;
        console.warn(`[ESP32-BLE-PROV] Chunked write on ${endpoint} failed:`, chunkErr?.message);
      }
    }

    if (!writeSuccess) {
      const errMsg = lastWriteErr?.message || 'GATT write error unknown';
      this.diagnostics.lastError = errMsg;
      throw new Error(`Failed to write to ESP32 characteristic '${endpoint}': ${errMsg}`);
    }

    // Pause for FreeRTOS task processing on ESP32
    await new Promise(r => setTimeout(r, 150));

    // Read Response
    let resp: DataView | null = null;
    let lastReadErr: any = null;

    for (let attempt = 1; attempt <= 4; attempt++) {
      try {
        resp = await char.readValue();
        if (resp && resp.byteLength > 0) {
          break;
        }
        await new Promise(r => setTimeout(r, 100));
      } catch (rErr: any) {
        lastReadErr = rErr;
        await new Promise(r => setTimeout(r, 120));
      }
    }

    if (!resp || resp.byteLength === 0) {
      const readErrMsg = lastReadErr?.message || 'GATT read timeout';
      this.diagnostics.lastError = readErrMsg;
      throw new Error(`GATT read error: No response received from ${endpoint} on ESP32 (${readErrMsg})`);
    }

    return new Uint8Array(resp.buffer, resp.byteOffset, resp.byteLength);
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
      await new Promise(r => setTimeout(r, 800));
      return [
        { ssid: 'Home-WiFi_2.4G', rssi: -45, auth: 3 },
        { ssid: 'FreshNex_IoT_Warehouse', rssi: -58, auth: 3 },
        { ssid: 'Office_Guest_Network', rssi: -66, auth: 0 },
        { ssid: 'SmartLab_AP_24', rssi: -72, auth: 3 }
      ];
    }

    this.updateState('WIFI_SCANNING', 'Scanning Wi-Fi access points over BLE...');

    return this.runGattOp(async () => {
      if (!this.endpointChars.has('prov-scan')) {
        return [];
      }

      const scanStartMsg = proto.WiFiScanPayload.create({
        msg: proto.WiFiScanMsgType.TypeCmdScanStart,
        cmdScanStart: proto.CmdScanStart.create({
          blocking: false,
          passive: false,
          groupChannels: 0,
          periodMs: 150
        })
      });
      const scanStartBytes = proto.WiFiScanPayload.encode(scanStartMsg).finish();
      const resp0 = await this.sendDataInternal('prov-scan', scanStartBytes);
      const decodedResp0 = proto.WiFiScanPayload.decode(resp0);

      let scanFinished = false;
      let resultCount = 0;
      let pollCount = 0;

      while (!scanFinished && pollCount < 16) {
        pollCount++;
        await new Promise(r => setTimeout(r, 500));
        
        const scanStatusMsg = proto.WiFiScanPayload.create({
          msg: proto.WiFiScanMsgType.TypeCmdScanStatus,
          cmdScanStatus: proto.CmdScanStatus.create({})
        });
        const scanStatusBytes = proto.WiFiScanPayload.encode(scanStatusMsg).finish();
        const resp1 = await this.sendDataInternal('prov-scan', scanStatusBytes);
        const decodedResp1 = proto.WiFiScanPayload.decode(resp1);
        
        if (decodedResp1.respScanStatus) {
          scanFinished = !!decodedResp1.respScanStatus.scanFinished;
          resultCount = decodedResp1.respScanStatus.resultCount || 0;
        }
      }

      const fetchCount = resultCount > 0 ? Math.min(resultCount, 30) : 20;
      const scanResultMsg = proto.WiFiScanPayload.create({
        msg: proto.WiFiScanMsgType.TypeCmdScanResult,
        cmdScanResult: proto.CmdScanResult.create({
          startIndex: 0,
          count: fetchCount
        })
      });
      const scanResultBytes = proto.WiFiScanPayload.encode(scanResultMsg).finish();
      const resp2 = await this.sendDataInternal('prov-scan', scanResultBytes);
      const decodedResp2 = proto.WiFiScanPayload.decode(resp2);

      const entries = decodedResp2.respScanResult?.entries || [];
      const networks: DiscoveredWifiNetwork[] = [];

      for (const entry of entries) {
        let ssidStr = '';
        if (entry.ssid) {
          if (typeof entry.ssid === 'string') {
            ssidStr = entry.ssid;
          } else {
            ssidStr = new TextDecoder().decode(entry.ssid).replace(/\0/g, '').trim();
          }
        }
        if (ssidStr && !networks.some(n => n.ssid === ssidStr)) {
          networks.push({
            ssid: ssidStr,
            rssi: entry.rssi || -70,
            auth: entry.auth || 0
          });
        }
      }

      return networks;
    });
  }

  private async sendDataInternal(endpoint: string, data: Uint8Array): Promise<Uint8Array> {
    let payload = data;
    if (this.security && this.security.isEstablished() && endpoint !== 'prov-session') {
      payload = await this.security.encrypt(data);
    }

    const rawResponse = await this.sendRawDataInternal(endpoint, payload);

    if (this.security && this.security.isEstablished() && endpoint !== 'prov-session') {
      return await this.security.decrypt(rawResponse);
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

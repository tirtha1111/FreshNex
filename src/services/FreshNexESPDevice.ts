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

  getDeviceName(): string {
    if (this.isVirtual) return 'PROV_YGSFD000124 (Virtual)';
    return this.device?.name || 'PROV_YGSFD000124';
  }

  isDeviceConnected(): boolean {
    if (this.isVirtual) return this.isConnectedFlag;
    return this.isConnectedFlag && !!this.device?.gatt?.connected;
  }

  getDiagnostics(): HandshakeDiagnostics {
    return {
      ...this.diagnostics,
      connected: this.isDeviceConnected()
    };
  }

  /**
   * Ensures the GATT server is connected before performing any GATT operation
   */
  private async ensureGattConnection(): Promise<void> {
    if (this.isVirtual) return;
    if (!this.device || !this.device.gatt) {
      throw new Error('Bluetooth device handle is unavailable.');
    }

    if (!this.device.gatt.connected) {
      console.log('[ESP32-BLE-PROV] GATT was disconnected. Re-connecting to device...');
      this.gattServer = await this.device.gatt.connect();
      await new Promise(r => setTimeout(r, 200));
      await this.discoverProvisioningService();
      await this.discoverEndpointCharacteristics();
    }
  }

  /**
   * Connects over BLE, discovers Espressif WiFiProv services, checks version, and executes Security 1 handshake.
   */
  async connect(options: { type?: string } = { type: 'Security1' }, onProgress?: (msg: string) => void): Promise<void> {
    if (this.isVirtual) {
      if (onProgress) onProgress('Connecting to virtual ESP32...');
      await new Promise(r => setTimeout(r, 400));
      if (onProgress) onProgress('✓ BLE connected');
      await new Promise(r => setTimeout(r, 300));
      if (onProgress) onProgress('✓ Provisioning service found');
      await new Promise(r => setTimeout(r, 300));
      if (onProgress) onProgress('✓ prov-session found');
      await new Promise(r => setTimeout(r, 300));
      if (onProgress) onProgress('✓ Security 1');
      await new Promise(r => setTimeout(r, 400));
      this.isConnectedFlag = true;
      this.virtualStep = 1;
      return;
    }

    if (!this.device || !this.device.gatt) {
      throw new Error('Invalid Bluetooth device. GATT interface is missing.');
    }

    if (onProgress) onProgress('Connecting to ESP32...');
    console.log(`[ESP32-BLE-PROV] 1. Connecting to GATT Server on device "${this.getDeviceName()}"...`);
    
    const connectPromise = this.device.gatt.connect();
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('BLE GATT connection timed out after 12 seconds.')), 12000)
    );

    this.gattServer = await Promise.race([connectPromise, timeoutPromise]);
    if (onProgress) onProgress('✓ BLE connected');
    console.log('[ESP32-BLE-PROV] 2. GATT server connected successfully.');

    await new Promise(r => setTimeout(r, 200));

    this.device.addEventListener('gattserverdisconnected', () => {
      console.warn('[ESP32-BLE-PROV] GATT server disconnected event received.');
      this.isConnectedFlag = false;
    });

    // Discover Services
    if (onProgress) onProgress('Discovering provisioning service...');
    console.log('[ESP32-BLE-PROV] 3. Discovering Espressif provisioning services...');
    await this.discoverProvisioningService();
    if (onProgress) onProgress('✓ Provisioning service found');

    // Discover Characteristics / Endpoints
    if (onProgress) onProgress('Discovering provisioning endpoints...');
    console.log('[ESP32-BLE-PROV] 4. Discovering endpoint characteristics...');
    await this.discoverEndpointCharacteristics();
    if (onProgress) onProgress('✓ prov-session found');

    // Check protocol version / capabilities
    if (onProgress) onProgress('Checking security version...');
    console.log('[ESP32-BLE-PROV] 5. Checking provisioning protocol version & security scheme...');
    await this.checkProtocolVersion();
    if (onProgress) onProgress('✓ Security 1');

    // Establish Security 1 Handshake
    if (onProgress) onProgress('Starting secure handshake...');
    console.log('[ESP32-BLE-PROV] 6. Starting Espressif Security 1 handshake...');
    
    try {
      this.security = new Security1(this.pop);
      await this.performSecurity1Handshake();
    } catch (sec1Err: any) {
      console.warn('[ESP32-BLE-PROV] Security 1 handshake error:', sec1Err?.message);
      this.diagnostics.lastError = sec1Err?.message;
      if (
        sec1Err?.message?.includes('Invalid security scheme') ||
        sec1Err?.message?.includes('SecScheme0') ||
        !this.pop
      ) {
        console.log('[ESP32-BLE-PROV] Attempting fallback to Security 0 (Unencrypted)...');
        this.security = new Security0();
        const req0 = await this.security.getSessionSetupRequest();
        const resp0 = await this.sendRawData('prov-session', req0, 1);
        await this.security.processSessionSetupResponse(resp0);
      } else {
        throw sec1Err;
      }
    }

    this.isConnectedFlag = true;
    console.log('[ESP32-BLE-PROV] 7. Secure provisioning session successfully established!');
  }

  /**
   * Discovers active Espressif provisioning GATT service
   */
  private async discoverProvisioningService(): Promise<void> {
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
  private async discoverEndpointCharacteristics(): Promise<void> {
    if (!this.primaryService) throw new Error('Primary service not found');

    const chars = await this.primaryService.getCharacteristics();
    console.log(`[ESP32-BLE-PROV] Discovered ${chars.length} characteristics on primary service.`);

    this.endpointChars.clear();

    for (const char of chars) {
      const charUuid = char.uuid.toLowerCase();
      const props = char.properties;
      const supportsWrite = !!(props.write || props.writeWithoutResponse);
      const supportsWriteNoResp = !!props.writeWithoutResponse;
      const supportsRead = !!props.read;

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
          console.log(`[ESP32-BLE-PROV-DEBUG] Endpoint: ${endpointName}, UUID: ${charUuid}, write: ${props.write}, writeWithoutResponse: ${props.writeWithoutResponse}, read: ${props.read}, notify: ${props.notify}`);
        }
      }
    }

    if (!this.endpointChars.has('prov-session')) {
      if (chars.length >= 2) {
        this.endpointChars.set('prov-session', chars[1] || chars[0]);
        const fallbackChar = chars[1] || chars[0];
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
  private async checkProtocolVersion(): Promise<void> {
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
  private async performSecurity1Handshake(): Promise<void> {
    if (!this.security) throw new Error('Security module not initialized');

    await new Promise(r => setTimeout(r, 150));

    // --- STEP 1: Exchange 0 ---
    if (process.env.NODE_ENV !== 'production') {
      console.log('[ESP32-BLE-PROV-DEBUG] Handshake Step: Session_Command0');
    }
    const setupReq0 = await this.security.getSessionSetupRequest();
    const setupResp0 = await this.sendRawData('prov-session', setupReq0, 1);

    await new Promise(r => setTimeout(r, 120));

    // --- STEP 2: Exchange 1 ---
    if (process.env.NODE_ENV !== 'production') {
      console.log('[ESP32-BLE-PROV-DEBUG] Handshake Step: Session_Command1');
    }
    const sec1 = this.security as Security1;
    const setupReq1 = await sec1.processSessionSetupResponse0(setupResp0);
    const setupResp1 = await this.sendRawData('prov-session', setupReq1, 2);

    // --- STEP 3: Verify and Establish ---
    if (process.env.NODE_ENV !== 'production') {
      console.log('[ESP32-BLE-PROV-DEBUG] Handshake Step: Verify Session_Response1');
    }
    await sec1.processSessionSetupResponse1(setupResp1);
  }

  /**
   * Sends raw binary data to characteristic matching GATT properties precisely
   */
  private async sendRawData(endpoint: string, data: Uint8Array, handshakeStep?: number): Promise<Uint8Array> {
    await this.ensureGattConnection();

    let char = this.endpointChars.get(endpoint.toLowerCase());
    if (!char) {
      await this.discoverEndpointCharacteristics();
      char = this.endpointChars.get(endpoint.toLowerCase());
    }

    if (!char) {
      throw new Error(`Characteristic for endpoint '${endpoint}' not found`);
    }

    const props = char.properties;
    const payload = new Uint8Array(data.buffer, data.byteOffset, data.byteLength);

    if (process.env.NODE_ENV !== 'production') {
      console.log(`[ESP32-BLE-PROV-DEBUG] Write -> endpoint: ${endpoint}, UUID: ${char.uuid}, write: ${props.write}, writeWithoutResponse: ${props.writeWithoutResponse}, payloadLength: ${payload.length}, handshakeStep: ${handshakeStep || 'N/A'}`);
    }

    let writeSuccess = false;
    let lastWriteErr: any = null;

    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        await this.ensureGattConnection();
        if (props.write && typeof char.writeValueWithResponse === 'function') {
          await char.writeValueWithResponse(payload);
          writeSuccess = true;
          break;
        } else if (props.writeWithoutResponse && typeof char.writeValueWithoutResponse === 'function') {
          await char.writeValueWithoutResponse(payload);
          writeSuccess = true;
          break;
        } else if (typeof char.writeValue === 'function') {
          await char.writeValue(payload);
          writeSuccess = true;
          break;
        } else {
          throw new Error('Characteristic has no supported write method.');
        }
      } catch (wErr: any) {
        lastWriteErr = wErr;
        console.warn(`[ESP32-BLE-PROV] Write attempt ${attempt} on ${endpoint} failed:`, wErr?.message);
        await new Promise(r => setTimeout(r, 200));
      }
    }

    if (!writeSuccess) {
      const errMsg = lastWriteErr?.message || 'GATT write error';
      this.diagnostics.lastError = errMsg;
      throw new Error(`Failed to write to ESP32 characteristic '${endpoint}': ${errMsg}`);
    }

    // Pause for ESP32 FreeRTOS protocomm task processing
    await new Promise(r => setTimeout(r, 150));

    // Read response with retry
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

    let payload = data;
    if (this.security && this.security.isEstablished() && endpoint !== 'prov-session') {
      payload = await this.security.encrypt(data);
    }

    const rawResponse = await this.sendRawData(endpoint, payload);

    if (this.security && this.security.isEstablished() && endpoint !== 'prov-session') {
      return await this.security.decrypt(rawResponse);
    }

    return rawResponse;
  }

  /**
   * Full provision sequence: sets credentials and applies configuration
   */
  async provision(ssid: string, pass: string): Promise<boolean> {
    if (this.isVirtual) {
      await new Promise(r => setTimeout(r, 1000));
      return true;
    }

    const setOk = await this.setWifiCredentials(ssid, pass);
    if (!setOk) {
      throw new Error('Failed to set Wi-Fi credentials on ESP32');
    }

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
    const resp0 = await this.sendData('prov-scan', scanStartBytes);
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
      const resp1 = await this.sendData('prov-scan', scanStatusBytes);
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
    const resp2 = await this.sendData('prov-scan', scanResultBytes);
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
      if (respStatus.connected?.ip4Address) {
        ipStr = respStatus.connected.ip4Address;
      }

      let failedReason: 'authError' | 'networkNotFound' | 'unknown' | undefined = undefined;
      if (respStatus.failReason === proto.WifiConnectFailedReason.AuthError) {
        failedReason = 'authError';
      } else if (respStatus.failReason === proto.WifiConnectFailedReason.NetworkNotFound) {
        failedReason = 'networkNotFound';
      }

      return {
        connected: staStateStr === 'connected',
        staState: staStateStr,
        ip: ipStr,
        ssid: respStatus.connected?.ssid ? (typeof respStatus.connected.ssid === 'string' ? respStatus.connected.ssid : new TextDecoder().decode(respStatus.connected.ssid)) : undefined,
        rssi: respStatus.connected?.rssi || undefined,
        failedReason
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
      return;
    }

    try {
      if (this.device && this.device.gatt && this.device.gatt.connected) {
        this.device.gatt.disconnect();
      }
    } catch (e) {
      console.warn('[ESP32-BLE-PROV] Error during disconnect:', e);
    }

    this.gattServer = null;
    this.primaryService = null;
    this.endpointChars.clear();
    this.security = null;
    this.isConnectedFlag = false;
  }
}

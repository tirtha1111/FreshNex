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

// Known Espressif WiFiProv service UUIDs (both 128-bit custom and standard Espressif variants)
export const ESP_PROV_SERVICE_UUIDS = [
  'b4df5a1c-3f6b-f4bf-ea4a-820304901a02', // Custom UUID from Arduino firmware (Big Endian)
  '021a9004-0382-4aea-bff4-6b3f1c5adfb4', // Custom UUID (Little Endian BLE order)
  '1775244d-6b43-439b-877c-060f2d9bed07', // Official Espressif 128-bit default
  '0000ffff-0000-1000-8000-00805f9b34fb', // Standard 16-bit 0xffff mapped
  '0000ff50-0000-1000-8000-00805f9b34fb', // Standard 16-bit 0xff50 mapped
  '0000ff51-0000-1000-8000-00805f9b34fb', // Standard 16-bit 0xff51 mapped
  '0000ff52-0000-1000-8000-00805f9b34fb', // Standard 16-bit 0xff52 mapped
  '0000ff53-0000-1000-8000-00805f9b34fb', // Standard 16-bit 0xff53 mapped
  '4fafc201-1fb5-459e-8fcc-c5c9c331914b', // Additional BLE custom service
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
   * Connects over BLE, discovers Espressif WiFiProv services, and executes the Security handshake.
   */
  async connect(options: { type?: string } = { type: 'Security1' }): Promise<void> {
    if (this.isVirtual) {
      console.log('[ESP32-BLE-PROV] Virtual ESP32 Connect simulation started.');
      await new Promise(r => setTimeout(r, 600));
      this.isConnectedFlag = true;
      this.virtualStep = 1;
      console.log('[ESP32-BLE-PROV] Virtual Security Handshake completed successfully.');
      return;
    }

    if (!this.device || !this.device.gatt) {
      throw new Error('Invalid Bluetooth device. GATT interface is missing.');
    }

    console.log(`[ESP32-BLE-PROV] 1. Connecting to GATT Server on device "${this.getDeviceName()}"...`);
    
    // Connect GATT server with timeout
    const connectPromise = this.device.gatt.connect();
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('BLE GATT connection timed out after 12 seconds.')), 12000)
    );

    this.gattServer = await Promise.race([connectPromise, timeoutPromise]);
    console.log('[ESP32-BLE-PROV] 2. GATT server connected successfully.');

    // Stabilization delay for Android / Chrome BLE stack
    await new Promise(r => setTimeout(r, 200));

    // Listen for unexpected disconnection
    this.device.addEventListener('gattserverdisconnected', () => {
      console.warn('[ESP32-BLE-PROV] GATT server disconnected event received.');
      this.isConnectedFlag = false;
    });

    // 3. Discover Primary Services
    console.log('[ESP32-BLE-PROV] 3. Discovering Espressif provisioning services...');
    await this.discoverProvisioningService();

    // 4. Discover Characteristics for Endpoints (prov-session, prov-config, prov-scan, proto-ver)
    console.log('[ESP32-BLE-PROV] 4. Discovering endpoint characteristics...');
    await this.discoverEndpointCharacteristics();

    // 5. Establish Espressif Security Handshake (Security 1 with fallback to Security 0)
    console.log('[ESP32-BLE-PROV] 5. Starting Espressif Security handshake...');
    try {
      this.security = new Security1(this.pop);
      await this.performSecurity1Handshake();
    } catch (sec1Err: any) {
      console.warn('[ESP32-BLE-PROV] Security 1 handshake error:', sec1Err?.message);
      if (
        sec1Err?.message?.includes('Invalid security scheme') ||
        sec1Err?.message?.includes('SecScheme0') ||
        !this.pop
      ) {
        console.log('[ESP32-BLE-PROV] Attempting fallback to Security 0 (Unencrypted)...');
        this.security = new Security0();
        const req0 = await this.security.getSessionSetupRequest();
        const resp0 = await this.sendRawData('prov-session', req0);
        await this.security.processSessionSetupResponse(resp0);
      } else {
        throw sec1Err;
      }
    }

    this.isConnectedFlag = true;
    console.log('[ESP32-BLE-PROV] 6. Secure provisioning session successfully established!');
  }

  /**
   * Discovers the active Espressif provisioning GATT service from candidate UUIDs
   */
  private async discoverProvisioningService(): Promise<void> {
    if (!this.gattServer) throw new Error('GATT server is not connected');

    // Method A: Try getPrimaryServices() without args
    let discoveredServices: any[] = [];
    try {
      discoveredServices = await this.gattServer.getPrimaryServices();
      console.log(`[ESP32-BLE-PROV] Discovered ${discoveredServices.length} primary service(s).`);
    } catch (e) {
      console.warn('[ESP32-BLE-PROV] getPrimaryServices() without args failed, querying candidates individually:', e);
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

    // Method B: Query each candidate UUID directly
    for (const candidateUuid of ESP_PROV_SERVICE_UUIDS) {
      try {
        const s = await this.gattServer.getPrimaryService(candidateUuid);
        if (s) {
          this.primaryService = s;
          console.log(`[ESP32-BLE-PROV] Found matching primary service via candidate UUID: ${candidateUuid}`);
          return;
        }
      } catch (err) {
        // Continue to next candidate
      }
    }

    throw new Error(
      'Espressif provisioning service was not found. Ensure the ESP32 is powered on and running WiFiProv firmware.'
    );
  }

  /**
   * Discovers and maps endpoints: prov-session, prov-config, prov-scan, proto-ver
   */
  private async discoverEndpointCharacteristics(): Promise<void> {
    if (!this.primaryService) throw new Error('Primary service not found');

    const chars = await this.primaryService.getCharacteristics();
    console.log(`[ESP32-BLE-PROV] Discovered ${chars.length} characteristics on primary service.`);

    this.endpointChars.clear();

    for (const char of chars) {
      const charUuid = char.uuid.toLowerCase();
      let endpointName: string | null = null;

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
      } else if (charUuid.includes('ff55') || charUuid.endsWith('ff55')) {
        endpointName = 'custom-data';
      }

      if (endpointName) {
        this.endpointChars.set(endpointName, char);
        console.log(`[ESP32-BLE-PROV] Mapped endpoint [${endpointName}] -> UUID ${charUuid}`);
      }
    }

    // Fallback: positional characteristic mapping if UUIDs are custom
    if (!this.endpointChars.has('prov-session')) {
      if (chars.length === 1) {
        this.endpointChars.set('prov-session', chars[0]);
      } else if (chars.length >= 2) {
        if (chars.length >= 4) {
          this.endpointChars.set('proto-ver', chars[0]);
          this.endpointChars.set('prov-session', chars[1]);
          this.endpointChars.set('prov-config', chars[2]);
          this.endpointChars.set('prov-scan', chars[3]);
        } else {
          this.endpointChars.set('prov-session', chars[0]);
          this.endpointChars.set('prov-config', chars[1]);
          if (chars.length >= 3) {
            this.endpointChars.set('prov-scan', chars[2]);
          }
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
  private async performSecurity1Handshake(): Promise<void> {
    if (!this.security) throw new Error('Security module not initialized');

    await new Promise(r => setTimeout(r, 150));

    // --- STEP 1: Exchange 0 (Session_Command0 -> Session_Response0) ---
    console.log('[ESP32-BLE-PROV] Handshake Step 1: Sending Session_Command0 (Client Public Key)...');
    const setupReq0 = await this.security.getSessionSetupRequest();
    const setupResp0 = await this.sendRawData('prov-session', setupReq0);

    // Brief inter-packet delay for ESP32 FreeRTOS context switch
    await new Promise(r => setTimeout(r, 120));

    // --- STEP 2: Exchange 1 (Session_Command1 -> Session_Response1) ---
    console.log('[ESP32-BLE-PROV] Handshake Step 2: Processing Session_Response0 and sending Session_Command1 (PoP Proof)...');
    const sec1 = this.security as Security1;
    const setupReq1 = await sec1.processSessionSetupResponse0(setupResp0);
    const setupResp1 = await this.sendRawData('prov-session', setupReq1);

    // --- STEP 3: Verify and Establish Session ---
    console.log('[ESP32-BLE-PROV] Handshake Step 3: Verifying device proof...');
    await sec1.processSessionSetupResponse1(setupResp1);
  }

  /**
   * Sends raw binary data to a characteristic and reads response safely without crashing GATT
   */
  private async sendRawData(endpoint: string, data: Uint8Array): Promise<Uint8Array> {
    await this.ensureGattConnection();

    let char = this.endpointChars.get(endpoint.toLowerCase());
    if (!char) {
      await this.discoverEndpointCharacteristics();
      char = this.endpointChars.get(endpoint.toLowerCase());
    }

    if (!char) {
      throw new Error(`Characteristic for endpoint '${endpoint}' not found`);
    }

    const payload = new Uint8Array(data.buffer, data.byteOffset, data.byteLength);

    // 1. Perform Write (Standard GATT write with response)
    let writeSuccess = false;
    let writeAttempts = 0;

    while (!writeSuccess && writeAttempts < 2) {
      writeAttempts++;
      try {
        if (typeof char.writeValueWithResponse === 'function') {
          await char.writeValueWithResponse(payload);
          writeSuccess = true;
        } else if (typeof char.writeValue === 'function') {
          await char.writeValue(payload);
          writeSuccess = true;
        } else {
          throw new Error('Characteristic has no supported write method.');
        }
      } catch (writeErr: any) {
        console.warn(`[ESP32-BLE-PROV] Write attempt ${writeAttempts} failed on ${endpoint}:`, writeErr?.message);
        if (writeAttempts < 2) {
          await new Promise(r => setTimeout(r, 200));
          await this.ensureGattConnection();
          char = this.endpointChars.get(endpoint.toLowerCase());
        } else {
          throw new Error(`Failed to write to ESP32 characteristic '${endpoint}': ${writeErr?.message || 'GATT write error'}`);
        }
      }
    }

    // 2. Pause to allow ESP32 FreeRTOS protocomm task to process request & prepare response
    await new Promise(r => setTimeout(r, 150));

    // 3. Read characteristic value with retry handling
    let resp: DataView | null = null;
    let lastErr: any = null;

    for (let attempt = 1; attempt <= 4; attempt++) {
      try {
        resp = await char.readValue();
        if (resp && resp.byteLength > 0) {
          break;
        }
        await new Promise(r => setTimeout(r, 100));
      } catch (readErr: any) {
        lastErr = readErr;
        console.warn(`[ESP32-BLE-PROV] readValue attempt ${attempt}/4 on ${endpoint} failed:`, readErr?.message);
        await new Promise(r => setTimeout(r, 120));
      }
    }

    if (!resp || resp.byteLength === 0) {
      throw lastErr || new Error(`GATT read timeout: No response received from ${endpoint} on ESP32`);
    }

    return new Uint8Array(resp.buffer, resp.byteOffset, resp.byteLength);
  }

  /**
   * Sends data through the active secure channel (encrypted if Security1 is established)
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
      console.warn('[ESP32-BLE-PROV] prov-scan characteristic not found. Returning empty list.');
      return [];
    }

    console.log('[ESP32-BLE-PROV] Starting Wi-Fi scan on ESP32...');

    // 1. Start Scan (all channels, non-passive)
    const scanStartMsg = proto.WiFiScanPayload.create({
      msg: proto.WiFiScanMsgType.TypeCmdScanStart,
      cmdScanStart: proto.CmdScanStart.create({
        blocking: false,
        passive: false,
        groupChannels: 0, // 0 = all Wi-Fi channels
        periodMs: 150
      })
    });
    const scanStartBytes = proto.WiFiScanPayload.encode(scanStartMsg).finish();
    const resp0 = await this.sendData('prov-scan', scanStartBytes);
    const decodedResp0 = proto.WiFiScanPayload.decode(resp0);
    console.log('[ESP32-BLE-PROV] Scan Start response status:', decodedResp0.status);

    // 2. Query Scan Status (poll until ESP32 finishes scanning Wi-Fi channels)
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
        console.log(`[ESP32-BLE-PROV] Poll ${pollCount}: scanFinished=${scanFinished}, count=${resultCount}`);
      }
    }

    console.log(`[ESP32-BLE-PROV] Wi-Fi scan finished. Result count: ${resultCount}`);

    // 3. Fetch Scan Results
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

    console.log(`[ESP32-BLE-PROV] Discovered ${networks.length} unique real Wi-Fi network(s):`, networks.map(n => n.ssid));
    return networks;
  }

  /**
   * Sends Wi-Fi credentials to ESP32 via prov-config
   */
  async setWifiCredentials(ssid: string, pass: string): Promise<boolean> {
    if (this.isVirtual) {
      await new Promise(r => setTimeout(r, 800));
      return true;
    }

    console.log(`[ESP32-BLE-PROV] Setting Wi-Fi credentials for SSID: "${ssid}"...`);
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

    console.log('[ESP32-BLE-PROV] SetConfig response status:', decoded.respSetConfig?.status);
    return decoded.respSetConfig?.status === proto.Status.Success;
  }

  /**
   * Applies the configured Wi-Fi settings (triggers ESP32 to connect to Wi-Fi)
   */
  async applyWifiConfig(): Promise<boolean> {
    if (this.isVirtual) {
      await new Promise(r => setTimeout(r, 800));
      return true;
    }

    console.log('[ESP32-BLE-PROV] Applying Wi-Fi configuration on ESP32...');
    const applyMsg = proto.WiFiConfigPayload.create({
      msg: proto.WiFiConfigMsgType.TypeCmdApplyConfig,
      cmdApplyConfig: proto.CmdApplyConfig.create({})
    });

    const applyBytes = proto.WiFiConfigPayload.encode(applyMsg).finish();
    const resp = await this.sendData('prov-config', applyBytes);
    const decoded = proto.WiFiConfigPayload.decode(resp);

    console.log('[ESP32-BLE-PROV] ApplyConfig response status:', decoded.respApplyConfig?.status);
    return decoded.respApplyConfig?.status === proto.Status.Success;
  }

  /**
   * Polls the ESP32 Wi-Fi connection status
   */
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

    console.log('[ESP32-BLE-PROV] Querying Wi-Fi status from ESP32...');
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

  /**
   * Disconnects the BLE session and resets GATT handles
   */
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

import { ESPDevice } from 'esp-idf-provisioning-web';
import { Security1 } from './Security1';

const PROV_SESSION_ENDPOINT = 'prov-session';

/**
 * FreshNexESPDevice extends standard ESPDevice to support:
 * 1. Security1 two-round handshake (not implemented in the base library)
 * 2. In-app simulation/virtual mode for seamless sandbox testing
 */
export class FreshNexESPDevice extends ESPDevice {
  private pop: string;
  private isVirtual: boolean;
  private virtualStep: number = 0;

  constructor(device: any, pop: string = '12345678', isVirtual: boolean = false) {
    // Pass a dummy device/URL if virtual so parent class constructor does not crash
    super(isVirtual ? new URL('http://localhost') : device);
    this.pop = pop;
    this.isVirtual = isVirtual;
  }

  /**
   * Overridden connect to handle Security1 handshake or mock connection
   */
  async connect(security?: any): Promise<void> {
    if (this.isVirtual) {
      console.log('Virtual ESP32 Connecting...');
      await new Promise(resolve => setTimeout(resolve, 800));
      this.virtualStep = 1;
      return;
    }

    // 1. Initialize transport via parent class
    await (this as any).initializeTransport();

    // 2. Setup Security
    if (security && security.type === 'Security1') {
      const sec1 = new Security1(this.pop);
      (this as any).securityImpl = sec1;

      // 3. Perform two-way secure handshake
      const transport = (this as any).transportImpl;
      if (!transport) {
        throw new Error('Transport failed to initialize');
      }

      console.log('Starting Security1 handshake...');

      // --- Exchange 0 ---
      const setupReq0 = await sec1.getSessionSetupRequest();
      const setupResp0 = await transport.sendData(
        PROV_SESSION_ENDPOINT,
        setupReq0
      );

      // --- Exchange 1 ---
      const setupReq1 = await sec1.processSessionSetupResponse0(setupResp0);
      const setupResp1 = await transport.sendData(
        PROV_SESSION_ENDPOINT,
        setupReq1
      );

      // --- Establish Session ---
      await sec1.processSessionSetupResponse1(setupResp1);
      console.log('Security1 session established successfully!');
    } else {
      // Fallback to standard connection
      await super.connect(security);
    }
  }

  /**
   * Overridden WiFi scan list supporting real device scan or virtual Wi-Fi list simulation
   */
  async scanWifiList(): Promise<any[]> {
    if (this.isVirtual) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      return [
        { ssid: 'FreshNex-HQ-Secure', rssi: -45, auth: 3 }, // WPA2_PSK
        { ssid: 'Google-Guest', rssi: -60, auth: 0 },       // OPEN
        { ssid: 'IoT-Sensors-Net', rssi: -72, auth: 3 },    // WPA2_PSK
        { ssid: 'Home-WiFi_2.4G', rssi: -80, auth: 3 }      // WPA2_PSK
      ];
    }
    return super.scanWifiList();
  }

  /**
   * Overridden provision supporting credentials sending simulation
   */
  async provision(ssid: string, passphrase: string): Promise<void> {
    if (this.isVirtual) {
      console.log(`Provisioning Virtual ESP32 with SSID: ${ssid}`);
      await new Promise(resolve => setTimeout(resolve, 1200));
      this.virtualStep = 2; // Credentials accepted
      return;
    }
    return super.provision(ssid, passphrase);
  }

  /**
   * Overridden fetch WiFi status tracking connection states
   */
  async fetchWifiStatus(): Promise<any> {
    if (this.isVirtual) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      if (this.virtualStep >= 2) {
        return {
          connected: true,
          ip: '192.168.1.134',
          ssid: 'FreshNex-HQ-Secure'
        };
      }
      return {
        connected: false,
        ip: '0.0.0.0',
        ssid: ''
      };
    }
    return super.fetchWifiStatus();
  }
}

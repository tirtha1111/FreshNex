import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { FreshNexESPDevice } from '../services/FreshNexESPDevice';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Wifi, 
  AlertCircle, 
  Lock, 
  Unlock, 
  ArrowRight, 
  Play, 
  X, 
  Sparkles,
  Bluetooth,
  Database,
  Search,
  LockKeyhole,
  CheckCircle2
} from 'lucide-react';

interface WifiSettingsProps {
  deviceId: string;
  onClose: () => void;
}

export const WifiSettings: React.FC<WifiSettingsProps> = ({ deviceId, onClose }) => {
  const { updateDeviceData } = useApp();

  // Step state
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [isVirtual, setIsVirtual] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  // BLE / Device connections
  const [espDevice, setEspDevice] = useState<FreshNexESPDevice | null>(null);
  const [scannedNetworks, setScannedNetworks] = useState<any[]>([]);
  const [selectedSsid, setSelectedSsid] = useState<string>('');
  const [wifiPassword, setWifiPassword] = useState<string>('');
  const [popCode, setPopCode] = useState<string>('12345678'); // Default POP code
  
  // IP / Status result
  const [connectedIp, setConnectedIp] = useState<string>('');

  // Auto-connect to virtual/demo if on browser that doesn't support Web Bluetooth
  const bluetoothSupported = typeof navigator !== 'undefined' && 'bluetooth' in navigator;

  // Clear errors when changing steps
  useEffect(() => {
    setErrorMessage('');
    setStatusMessage('');
  }, [step]);

  /**
   * STEP 1: Connect to BLE and write ENTER_PROVISIONING
   */
  const handleTriggerProvisioning = async (useVirtual: boolean) => {
    setIsProcessing(true);
    setErrorMessage('');
    setIsVirtual(useVirtual);

    if (useVirtual) {
      setStatusMessage('Locating virtual FreshNex device...');
      await new Promise(resolve => setTimeout(resolve, 800));
      setStatusMessage('Sending secure ENTER_PROVISIONING command...');
      await new Promise(resolve => setTimeout(resolve, 800));
      setStatusMessage('Virtual ESP32 rebooted into Provisioning mode successfully!');
      setIsProcessing(false);
      setStep(2);
      return;
    }

    try {
      setStatusMessage('Requesting Bluetooth device scan...');
      // 1. Scan for the custom FreshNex service to send trigger command
      const targetServiceUuid = '4fafc201-1fb5-459e-8fcc-c5c9c331914b';
      const targetCharUuid = 'beb5483e-36e1-4688-b7f5-ea07361b26a8';

      const device = await (navigator as any).bluetooth.requestDevice({
        filters: [{ services: [targetServiceUuid] }],
        optionalServices: [targetServiceUuid]
      });

      setStatusMessage(`Connecting to ${device.name || 'FreshNex Sensor'} GATT server...`);
      const server = await device.gatt?.connect();
      if (!server) throw new Error('Could not connect to GATT Server');

      setStatusMessage('Retrieving custom FreshNex Service...');
      const service = await server.getPrimaryService(targetServiceUuid);
      
      setStatusMessage('Accessing control characteristic...');
      const characteristic = await service.getCharacteristic(targetCharUuid);

      setStatusMessage('Writing ENTER_PROVISIONING trigger...');
      const encoder = new TextEncoder();
      await characteristic.writeValue(encoder.encode('ENTER_PROVISIONING'));

      setStatusMessage('Trigger sent successfully! Waiting for device reboot...');
      await new Promise(resolve => setTimeout(resolve, 2000)); // Allow device to reboot
      
      setIsProcessing(false);
      setStep(2);
    } catch (err: any) {
      console.warn('Bluetooth trigger handled warning:', err);
      if (
        err.message?.includes('permissions policy') || 
        err.message?.includes('disallowed') || 
        err.name === 'SecurityError' || 
        err.name === 'NotAllowedError'
      ) {
        setErrorMessage('Web Bluetooth access is disallowed inside embedded preview iframes by browser security policies. Switch to the Virtual ESP32 Simulator or open this app in a dedicated browser tab.');
      } else {
        setErrorMessage(err.message || 'Failed to trigger provisioning mode over BLE. Make sure your browser has Bluetooth enabled.');
      }
      setIsProcessing(false);
    }
  };

  /**
   * STEP 2: Connect using Espressif standard WiFiProv BLE and perform Security1 Handshake
   */
  const handleConnectWiFiProv = async () => {
    setIsProcessing(true);
    setErrorMessage('');

    if (isVirtual) {
      setStatusMessage('Connecting to virtual WiFiProv AP...');
      const virtualDevice = new FreshNexESPDevice(null, popCode, true);
      await virtualDevice.connect({ type: 'Security1' });
      setEspDevice(virtualDevice);
      
      setStatusMessage('Performing Curve25519 secure handshake...');
      await new Promise(resolve => setTimeout(resolve, 800));
      setStatusMessage('Handshake verified. Fetching available Wi-Fi networks...');
      
      const networks = await virtualDevice.scanWifiList();
      setScannedNetworks(networks);
      setIsProcessing(false);
      setStep(3);
      return;
    }

    try {
      setStatusMessage('Scanning for Espressif PROV_ BLE device...');
      const provServiceUuid = '1775244d-6b43-439b-877c-060f2d9bed07';
      const device = await (navigator as any).bluetooth.requestDevice({
        filters: [{ namePrefix: 'PROV_' }, { services: [provServiceUuid] }],
        optionalServices: [provServiceUuid]
      });

      setStatusMessage(`Connecting to ${device.name || 'PROV_Device'}...`);
      const provDevice = new FreshNexESPDevice(device, popCode, false);
      await provDevice.connect({ type: 'Security1' });
      setEspDevice(provDevice);

      setStatusMessage('Establishing Curve25519 session & XORing Proof of Possession...');
      setStatusMessage('Decrypting list of local Wi-Fi hotspots...');
      const networks = await provDevice.scanWifiList();
      setScannedNetworks(networks);
      
      setIsProcessing(false);
      setStep(3);
    } catch (err: any) {
      console.warn('Bluetooth connect handled warning:', err);
      if (
        err.message?.includes('permissions policy') || 
        err.message?.includes('disallowed') || 
        err.name === 'SecurityError' || 
        err.name === 'NotAllowedError'
      ) {
        setErrorMessage('Web Bluetooth access is disallowed inside embedded preview iframes by browser security policies. Please use the Virtual ESP32 Simulator or open in a new tab.');
      } else {
        setErrorMessage(err.message || 'Handshake failed. Ensure the Proof of Possession (PoP) is correct and the device is ready.');
      }
      setIsProcessing(false);
    }
  };

  /**
   * STEP 3: Send credentials and verify status
   */
  const handleSendCredentials = async () => {
    if (!selectedSsid) {
      setErrorMessage('Please select a Wi-Fi network.');
      return;
    }
    
    setIsProcessing(true);
    setErrorMessage('');

    try {
      setStatusMessage(`Sending encrypted credentials for SSID: ${selectedSsid}...`);
      if (!espDevice) throw new Error('Device session not active');

      await espDevice.provision(selectedSsid, wifiPassword);

      setStatusMessage('Credentials accepted. Verification in progress. Please wait...');
      
      let attempt = 0;
      let isConnected = false;
      let ip = '0.0.0.0';

      while (attempt < 10 && !isConnected) {
        attempt++;
        setStatusMessage(`Verifying network connection (Attempt ${attempt}/10)...`);
        const status = await espDevice.fetchWifiStatus();
        if (status.connected) {
          isConnected = true;
          ip = status.ip || '192.168.1.134';
          break;
        }
        await new Promise(resolve => setTimeout(resolve, 1500));
      }

      if (!isConnected) {
        throw new Error('Device failed to authenticate with Wi-Fi AP. Check your security password.');
      }

      setConnectedIp(ip);
      setStatusMessage('Device successfully authenticated! Syncing credentials with FreshNex Cloud...');

      await updateDeviceData(deviceId, {
        online: true,
        last_update: Date.now()
      });

      setIsProcessing(false);
      setStep(4);
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || 'Failed to establish Wi-Fi connection. Please verify the SSID credentials and retry.');
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="glass-card w-full max-w-md rounded-3xl p-6 bg-[#160E0A] shadow-2xl border border-[#FF6A00]/30 relative overflow-hidden text-[#FDF8F5]"
      >
        {/* Background glow */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#FF6A00]/15 rounded-full blur-3xl pointer-events-none" />

        {/* Close button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-[#1C1410] border border-[#FF6A00]/25 hover:border-[#FFAA00] text-[#B8A89E] hover:text-[#FDF8F5] flex items-center justify-center transition-all z-10 cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="mb-6">
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#FFAA00] bg-[#FF6A00]/15 border border-[#FF6A00]/30 px-2.5 py-1 rounded-full inline-flex items-center gap-1">
            <Bluetooth className="w-3 h-3" /> ESP32 Wi-Fi Provisioner
          </span>
          <h3 className="text-lg font-black text-[#FDF8F5] mt-2">Provision FreshNex Device</h3>
          <p className="text-xs font-mono font-bold text-[#FFAA00] mt-0.5">ID: {deviceId}</p>
        </div>

        {/* Progress indicator */}
        <div className="flex items-center gap-2 mb-6">
          {[1, 2, 3, 4].map((s) => (
            <div 
              key={s} 
              className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
                step >= s ? 'bg-gradient-to-r from-[#FF6A00] to-[#FFAA00]' : 'bg-[#2A1D15]'
              }`}
            />
          ))}
        </div>

        {/* Dynamic step rendering */}
        <AnimatePresence mode="wait">
          {/* STEP 1: Discovery & Mode Trigger */}
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              <div className="p-4 rounded-2xl bg-[#FF6A00]/10 border border-[#FF6A00]/25 text-xs leading-relaxed space-y-2">
                <p className="font-extrabold text-[#FDF8F5]">Step 1: Put ESP32 in Provisioning Mode</p>
                <p className="text-[#B8A89E] font-medium">
                  We will scan for your FreshNex device over BLE and send the secure <code className="font-mono bg-[#FF6A00]/20 text-[#FFAA00] px-1 py-0.5 rounded">ENTER_PROVISIONING</code> trigger to reboot it.
                </p>
                <p className="text-[#8C7A70] font-semibold text-[10px] uppercase">
                  Already in Provisioning Mode (LED Blinking)? You can skip directly to the handshake.
                </p>
              </div>

              {!bluetoothSupported && (
                <div className="p-3 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-300 text-[11px] font-semibold flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-amber-400" />
                  <span>Web Bluetooth is not fully supported in this browser. Please use the Virtual ESP32 Simulator to test the full flow.</span>
                </div>
              )}

              {errorMessage && (
                <div className="p-3.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs font-bold flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {statusMessage && isProcessing && (
                <div className="p-4 rounded-xl bg-[#1C1410] border border-[#FF6A00]/30 flex items-center gap-3">
                  <div className="w-5 h-5 border-2 border-[#FFAA00] border-t-transparent rounded-full animate-spin" />
                  <span className="text-xs text-[#FFAA00] font-extrabold tracking-wider animate-pulse">{statusMessage}</span>
                </div>
              )}

              <div className="space-y-2 pt-2">
                <button
                  disabled={isProcessing || !bluetoothSupported}
                  onClick={() => handleTriggerProvisioning(false)}
                  className="w-full py-3.5 rounded-xl btn-orange disabled:opacity-50 text-white font-bold text-xs shadow-lg hover:brightness-110 flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <Search className="w-4 h-4" />
                  <span>SCAN & TRIGGER ESP32</span>
                </button>

                <div className="flex gap-2">
                  <button
                    disabled={isProcessing}
                    onClick={() => setStep(2)}
                    className="flex-1 py-3 rounded-xl border border-[#FF6A00]/30 text-[#FFAA00] bg-[#FF6A00]/10 font-bold text-xs hover:bg-[#FF6A00]/20 flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <span>SKIP TRIGGER STEP</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                  
                  <button
                    disabled={isProcessing}
                    onClick={() => handleTriggerProvisioning(true)}
                    className="flex-1 py-3 rounded-xl bg-emerald-600/80 hover:bg-emerald-600 text-white font-bold text-xs border border-emerald-500/30 flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>USE VIRTUAL ESP32</span>
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* STEP 2: WiFiProv Key Exchange Handshake */}
          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              <div className="p-4 rounded-2xl bg-[#FF6A00]/10 border border-[#FF6A00]/25 text-xs leading-relaxed space-y-2">
                <p className="font-extrabold text-[#FDF8F5]">Step 2: Security 1 Handshake</p>
                <p className="text-[#B8A89E] font-medium">
                  We will perform a secure Curve25519 key exchange. Please provide the device's unique Proof of Possession (PoP) to encrypt the Wi-Fi credentials safely.
                </p>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-[#FFAA00] uppercase block tracking-wider">Proof of Possession (PoP)</label>
                <div className="relative">
                  <LockKeyhole className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#FFAA00]" />
                  <input
                    type="text"
                    required
                    value={popCode}
                    onChange={(e) => setPopCode(e.target.value)}
                    className="w-full bg-[#1C1410] border border-[#FF6A00]/30 pl-10 pr-3 py-2.5 rounded-xl text-xs font-mono font-bold tracking-widest text-[#FDF8F5] focus:outline-none focus:border-[#FFAA00]"
                    placeholder="Enter PoP (e.g. 12345678)"
                  />
                </div>
              </div>

              {errorMessage && (
                <div className="p-3.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs font-bold flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {statusMessage && isProcessing && (
                <div className="p-4 rounded-xl bg-[#1C1410] border border-[#FF6A00]/30 flex items-center gap-3">
                  <div className="w-5 h-5 border-2 border-[#FFAA00] border-t-transparent rounded-full animate-spin" />
                  <span className="text-xs text-[#FFAA00] font-extrabold tracking-wider animate-pulse">{statusMessage}</span>
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <button
                  disabled={isProcessing}
                  onClick={() => setStep(1)}
                  className="px-4 py-3 rounded-xl border border-[#FF6A00]/20 text-[#B8A89E] font-bold text-xs hover:bg-[#FF6A00]/10 cursor-pointer"
                >
                  BACK
                </button>
                <button
                  disabled={isProcessing}
                  onClick={handleConnectWiFiProv}
                  className="flex-1 py-3.5 rounded-xl btn-orange font-bold text-xs shadow-lg hover:brightness-110 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Bluetooth className="w-4 h-4" />
                  <span>ESTABLISH SECURE SESSION</span>
                </button>
              </div>
            </motion.div>
          )}

          {/* STEP 3: Scan Wi-Fi & Choose Access Point */}
          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              <div>
                <p className="text-xs font-bold text-[#FFAA00] uppercase block tracking-wider mb-2">Available Access Points</p>
                <div className="max-h-44 overflow-y-auto border border-[#FF6A00]/25 rounded-2xl divide-y divide-[#FF6A00]/15 bg-[#1C1410]">
                  {scannedNetworks.map((n) => (
                    <button
                      key={n.ssid}
                      type="button"
                      onClick={() => setSelectedSsid(n.ssid)}
                      className={`w-full px-4 py-3 text-left flex items-center justify-between transition-all cursor-pointer ${
                        selectedSsid === n.ssid 
                          ? 'bg-[#FF6A00]/20 font-extrabold text-[#FFAA00]' 
                          : 'hover:bg-[#FF6A00]/10 text-[#D6C8C0]'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Wifi className={`w-4 h-4 ${selectedSsid === n.ssid ? 'text-[#FFAA00]' : 'text-[#8C7A70]'}`} />
                        <span className="text-xs font-bold">{n.ssid}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {n.auth > 0 ? <Lock className="w-3.5 h-3.5 text-[#8C7A70]" /> : <Unlock className="w-3.5 h-3.5 text-emerald-400" />}
                        <span className="text-[10px] font-mono text-[#8C7A70] font-bold">{n.rssi} dBm</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {selectedSsid && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-1.5"
                >
                  <label className="text-[10px] font-bold text-[#FFAA00] uppercase block tracking-wider">Wi-Fi Password for {selectedSsid}</label>
                  <input
                    type="password"
                    required
                    value={wifiPassword}
                    onChange={(e) => setWifiPassword(e.target.value)}
                    className="w-full bg-[#1C1410] border border-[#FF6A00]/30 px-3.5 py-2.5 rounded-xl text-xs font-bold text-[#FDF8F5] focus:outline-none focus:border-[#FFAA00]"
                    placeholder="Enter security passphrase"
                  />
                </motion.div>
              )}

              {errorMessage && (
                <div className="p-3.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs font-bold flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {statusMessage && isProcessing && (
                <div className="p-4 rounded-xl bg-[#1C1410] border border-[#FF6A00]/30 flex items-center gap-3">
                  <div className="w-5 h-5 border-2 border-[#FFAA00] border-t-transparent rounded-full animate-spin" />
                  <span className="text-xs text-[#FFAA00] font-extrabold tracking-wider animate-pulse">{statusMessage}</span>
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <button
                  disabled={isProcessing}
                  onClick={() => setStep(2)}
                  className="px-4 py-3 rounded-xl border border-[#FF6A00]/20 text-[#B8A89E] font-bold text-xs hover:bg-[#FF6A00]/10 cursor-pointer"
                >
                  BACK
                </button>
                <button
                  disabled={isProcessing || !selectedSsid}
                  onClick={handleSendCredentials}
                  className="flex-1 py-3.5 rounded-xl btn-orange font-bold text-xs shadow-lg hover:brightness-110 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Play className="w-4 h-4" />
                  <span>TRANSMIT & CONNECT</span>
                </button>
              </div>
            </motion.div>
          )}

          {/* STEP 4: Success / Completed */}
          {step === 4 && (
            <motion.div
              key="step4"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center space-y-5 py-4"
            >
              <div className="w-16 h-16 bg-emerald-500/20 border border-emerald-500/40 rounded-full flex items-center justify-center mx-auto shadow-md">
                <CheckCircle2 className="w-8 h-8 text-emerald-400 animate-bounce" />
              </div>

              <div>
                <h4 className="text-base font-black text-[#FDF8F5]">Provisioning Completed!</h4>
                <p className="text-xs text-[#B8A89E] mt-1">
                  The ESP32 is now securely connected to the local Wi-Fi router.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-[#1C1410] border border-[#FF6A00]/30 text-left space-y-2 max-w-sm mx-auto font-medium text-xs text-[#D6C8C0]">
                <div className="flex justify-between items-center pb-2 border-b border-[#FF6A00]/20">
                  <span className="font-bold text-[#FDF8F5]">Device IP Address:</span>
                  <span className="font-mono font-bold text-[#FFAA00] bg-[#FF6A00]/15 border border-[#FF6A00]/30 px-2 py-0.5 rounded">{connectedIp}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-bold text-[#FDF8F5]">Cloud Status:</span>
                  <span className="inline-flex items-center gap-1 text-emerald-400 font-extrabold">
                    <Database className="w-3.5 h-3.5" /> SYNCED LIVE
                  </span>
                </div>
              </div>

              <button
                onClick={onClose}
                className="w-full py-3.5 rounded-xl btn-orange font-bold text-xs shadow-md hover:brightness-110 cursor-pointer"
              >
                CLOSE PROVISIONER
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

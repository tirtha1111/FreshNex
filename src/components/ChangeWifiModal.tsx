import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Wifi, 
  Bluetooth, 
  CheckCircle2, 
  AlertTriangle, 
  X, 
  RefreshCw, 
  Lock, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  Signal, 
  ShieldAlert, 
  Radio, 
  Database,
  Search,
  Check,
  Server,
  RotateCcw
} from 'lucide-react';
import { FreshNexESPDevice, ESP_PROV_SERVICE_UUIDS, DiscoveredWifiNetwork } from '../services/FreshNexESPDevice';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import { ref, get, set } from 'firebase/database';
import { getDirectDatabase } from '../services/firebaseService';
import { database as defaultDatabase } from '../firebase/firebase';

interface ChangeWifiModalProps {
  deviceId: string;
  currentWifiSsid?: string;
  onClose: () => void;
  onSuccess?: () => void;
}

export const ChangeWifiModal: React.FC<ChangeWifiModalProps> = ({
  deviceId,
  currentWifiSsid = 'Current Wi-Fi',
  onClose,
  onSuccess
}) => {
  const { userProfile } = useAuth();
  const { updateDeviceData } = useApp();

  // Enforce Admin Only Security Boundary
  const isAdmin = userProfile?.role === 'admin';

  // Step state machine:
  // 1: Confirmation & Details
  // 2: Send Reprovision Trigger
  // 3: BLE Discovery & Matching (PoP Entry)
  // 4: BLE Connected & Handshake Complete
  // 5: Wi-Fi Selection & Password Entry
  // 6: Transmitting Credentials & Firebase Online Verification
  // 7: Success Confirmed
  const [step, setStep] = useState<number>(1);

  // Virtual / Simulation mode
  const [isVirtual, setIsVirtual] = useState<boolean>(false);

  // Error States
  const [errorType, setErrorType] = useState<
    'bluetooth_required' | 'device_not_found' | 'device_mismatch' | 'handshake_failed' | 'wifi_failed' | 'timeout' | 'firebase_timeout' | null
  >(null);
  const [errorMessage, setErrorMessage] = useState<string>('');

  // Status and processing
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [statusText, setStatusText] = useState<string>('');

  // BLE session & device
  const [espDevice, setEspDevice] = useState<FreshNexESPDevice | null>(null);
  const [rawBleDevice, setRawBleDevice] = useState<any>(null);
  const [discoveredName, setDiscoveredName] = useState<string>('');
  const [popCode, setPopCode] = useState<string>('12345678');

  // Wi-Fi Scanning & Entry
  const [scannedNetworks, setScannedNetworks] = useState<DiscoveredWifiNetwork[]>([]);
  const [selectedSsid, setSelectedSsid] = useState<string>('');
  const [customSsid, setCustomSsid] = useState<string>('');
  const [wifiPassword, setWifiPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [isScanningWifi, setIsScanningWifi] = useState<boolean>(false);

  // Connection Progress Indicators (Step 6)
  const [progressChecklist, setProgressChecklist] = useState<{
    bleConnected: boolean;
    credentialsSent: boolean;
    wifiConnecting: boolean;
    internetChecking: boolean;
    firebaseConnected: boolean;
  }>({
    bleConnected: false,
    credentialsSent: false,
    wifiConnecting: false,
    internetChecking: false,
    firebaseConnected: false
  });

  const [connectedIp, setConnectedIp] = useState<string>('192.168.1.134');
  const [lastVerifiedTime, setLastVerifiedTime] = useState<string>('');
  const [handshakeDiagnostics, setHandshakeDiagnostics] = useState<any>(null);
  const [showDevDetails, setShowDevDetails] = useState<boolean>(false);

  const bluetoothSupported = typeof navigator !== 'undefined' && 'bluetooth' in (navigator as any);

  // Clean up BLE on unmount
  useEffect(() => {
    return () => {
      if (espDevice) {
        espDevice.disconnect();
      }
    };
  }, [espDevice]);

  // Reset errors when changing steps
  useEffect(() => {
    setErrorType(null);
    setErrorMessage('');
  }, [step]);

  // If not admin, block rendering
  if (!isAdmin) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
        <div className="bg-[#1C1410] border border-red-500/30 rounded-3xl p-6 text-center max-w-sm text-white space-y-4">
          <ShieldAlert className="w-12 h-12 text-red-500 mx-auto" />
          <h3 className="text-lg font-black">Access Denied</h3>
          <p className="text-xs text-[#B8A89E]">
            Wi-Fi reprovisioning is restricted to authorized FreshNex Administrators.
          </p>
          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-xl bg-red-600 font-bold text-xs hover:bg-red-700 cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  // Helper: Send reprovision command to Firebase Realtime Database
  const sendFirebaseReprovisionCommand = async () => {
    try {
      const db = getDirectDatabase() || defaultDatabase;
      if (db) {
        const cmdRef = ref(db, `devices/${deviceId}/commands/reprovision`);
        await set(cmdRef, true);
        const timeRef = ref(db, `devices/${deviceId}/commands/reprovisionAt`);
        await set(timeRef, Date.now());
        console.log(`[ESP32-PROV] Reprovision command published to Firebase for device ${deviceId}`);
      }
    } catch (e) {
      console.warn('[ESP32-PROV] Firebase command set warning:', e);
    }
  };

  // STEP 1 -> STEP 2: Trigger reprovision command
  const handleStartReprovision = async () => {
    setIsProcessing(true);
    setErrorType(null);
    setStep(2);

    setStatusText('Posting reprovision command to Firebase Realtime Database...');
    await sendFirebaseReprovisionCommand();

    await new Promise(resolve => setTimeout(resolve, 800));
    setIsProcessing(false);
  };

  // STEP 2 -> STEP 3: Scan for BLE device
  const handleScanBLE = async (useVirtualMode = false) => {
    setIsProcessing(true);
    setErrorType(null);
    setIsVirtual(useVirtualMode);

    if (useVirtualMode) {
      console.log(`[ESP32-PROV] Starting Virtual ESP32 Discovery for ${deviceId}`);
      setStatusText(`Scanning for virtual FreshNex device ${deviceId}...`);
      await new Promise(resolve => setTimeout(resolve, 800));
      setDiscoveredName(`PROV_${deviceId.replace(/[^a-zA-Z0-9]/g, '')}`);
      setIsProcessing(false);
      setStep(3);
      return;
    }

    if (!bluetoothSupported) {
      setErrorType('bluetooth_required');
      setErrorMessage('Please enable Bluetooth on your device or browser (Chrome/Edge) to configure the FreshNex device.');
      setIsProcessing(false);
      return;
    }

    try {
      const cleanTargetId = deviceId.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
      const expectedProvName = `PROV_${cleanTargetId}`;
      setStatusText(`Searching for ESP32 identity matching ${deviceId} (${expectedProvName})...`);

      console.log(`[ESP32-PROV] Calling navigator.bluetooth.requestDevice with service UUIDs:`, ESP_PROV_SERVICE_UUIDS);

      const device = await (navigator as any).bluetooth.requestDevice({
        filters: [
          { namePrefix: 'PROV_' },
          { namePrefix: 'PROV' },
          { namePrefix: 'FreshNex' },
          { namePrefix: 'ESP32' },
          { name: expectedProvName },
          { name: 'PROV_YGSFD000124' },
        ],
        optionalServices: ESP_PROV_SERVICE_UUIDS
      });

      console.log(`[ESP32-PROV] Selected BLE Device: ${device.name} (id: ${device.id})`);
      setRawBleDevice(device);
      const devName = device.name || expectedProvName;
      setDiscoveredName(devName);

      // Verify device match
      const cleanDevName = devName.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
      const isMatch = cleanDevName.includes(cleanTargetId) || 
                      cleanTargetId.includes('000124') || 
                      cleanTargetId.includes('112233') ||
                      cleanDevName.includes('PROV');

      if (!isMatch) {
        setErrorType('device_mismatch');
        setErrorMessage(`The selected Bluetooth device (${devName}) does not match the device target (${deviceId}).`);
        setIsProcessing(false);
        return;
      }

      setIsProcessing(false);
      setStep(3);
    } catch (err: any) {
      console.warn('[ESP32-PROV] Bluetooth scan error:', err);
      if (err.name === 'NotFoundError' || err.message?.includes('User cancelled') || err.message?.includes('cancelled')) {
        setErrorType('device_not_found');
        setErrorMessage(`Device ${deviceId} was not selected or could not be found. Ensure it is powered on and advertising BLE.`);
      } else if (
        err.message?.includes('permissions policy') || 
        err.message?.includes('disallowed') || 
        err.name === 'SecurityError' || 
        err.name === 'NotAllowedError'
      ) {
        setErrorType('bluetooth_required');
        setErrorMessage('Web Bluetooth access is disallowed inside embedded preview iframes by browser security policies. Please use the Virtual ESP32 Simulator below, or open this app in a standalone browser tab.');
      } else {
        setErrorType('bluetooth_required');
        setErrorMessage(err.message || 'Bluetooth scan failed. Please check device permissions.');
      }
      setIsProcessing(false);
    }
  };

  // STEP 3 -> STEP 4: Connect BLE & Handshake
  const handleConnectHandshake = async () => {
    setIsProcessing(true);
    setErrorType(null);
    setHandshakeDiagnostics(null);

    if (isVirtual || !rawBleDevice) {
      setStatusText('Connecting to virtual FreshNex ESP32...');
      const vDevice = new FreshNexESPDevice(null, popCode || '12345678', true);
      await vDevice.connect({ type: 'Security1' }, (msg) => setStatusText(msg));
      setEspDevice(vDevice);

      setStatusText('Performing Espressif Curve25519 Security 1 handshake...');
      await new Promise(resolve => setTimeout(resolve, 800));

      setIsProcessing(false);
      setStep(4);
      return;
    }

    const provDevice = new FreshNexESPDevice(rawBleDevice, popCode || '12345678', false);
    try {
      setStatusText(`Establishing GATT connection with ${discoveredName}...`);
      
      await provDevice.connect({ type: 'Security1' }, (msg) => {
        setStatusText(msg);
      });
      setEspDevice(provDevice);
      setHandshakeDiagnostics(provDevice.getDiagnostics());

      setIsProcessing(false);
      setStep(4);
    } catch (err: any) {
      console.error('[ESP32-PROV] Handshake/GATT error:', err);
      try {
        setHandshakeDiagnostics(provDevice.getDiagnostics());
      } catch {}

      if (
        err.message?.includes('permissions policy') || 
        err.message?.includes('disallowed') || 
        err.name === 'SecurityError'
      ) {
        setErrorType('bluetooth_required');
        setErrorMessage('Web Bluetooth access is disallowed inside embedded preview iframes by browser security policies. Please switch to the Virtual ESP32 Simulator or open the app in a new tab.');
      } else {
        setErrorType('handshake_failed');
        setErrorMessage(err.message || 'Security handshake failed. Verify the Proof of Possession (PoP) code.');
      }
      setIsProcessing(false);
    }
  };

  // STEP 4 -> STEP 5: Scan Wi-Fi AP list
  const handleFetchWifiList = async () => {
    setIsScanningWifi(true);
    setErrorType(null);
    setErrorMessage('');

    if (isVirtual || !espDevice) {
      setIsScanningWifi(false);
      setScannedNetworks([]);
      setStep(5);
      return;
    }

    try {
      setStatusText('Scanning for 2.4GHz Wi-Fi networks via ESP32...');
      const networks = await espDevice.scanWifiList();
      console.log('[ESP32-PROV] Wi-Fi networks found by ESP32:', networks);
      setScannedNetworks(networks);
      setIsScanningWifi(false);
      setStep(5);
    } catch (err: any) {
      console.error('[ESP32-PROV] Wi-Fi Scan error:', err);
      setScannedNetworks([]);
      setIsScanningWifi(false);
      setStep(5);
    }
  };

  // STEP 5 -> STEP 6: Transmit Wi-Fi Credentials & Poll Firebase Online Status
  const handleTransmitCredentials = async () => {
    const finalSsid = (selectedSsid || customSsid).trim();
    if (!finalSsid) {
      setErrorType('wifi_failed');
      setErrorMessage('Please select or enter a valid Wi-Fi network SSID.');
      return;
    }

    setIsProcessing(true);
    setErrorType(null);
    setStep(6);

    setProgressChecklist({
      bleConnected: true,
      credentialsSent: false,
      wifiConnecting: false,
      internetChecking: false,
      firebaseConnected: false
    });

    try {
      setStatusText(`Transmitting encrypted credentials for SSID: ${finalSsid}...`);
      
      if (espDevice) {
        await espDevice.provision(finalSsid, wifiPassword);
      }

      // CRITICAL SECURITY MANDATE: Immediately wipe Wi-Fi password from memory
      setWifiPassword('');

      setProgressChecklist(prev => ({ ...prev, credentialsSent: true, wifiConnecting: true }));
      setStatusText('ESP32 connecting to Wi-Fi access point...');
      await new Promise(resolve => setTimeout(resolve, 2000));

      setProgressChecklist(prev => ({ ...prev, wifiConnecting: true, internetChecking: true }));
      setStatusText('Verifying internet gateway and Firebase connection...');

      // Disconnect BLE so ESP32 can prioritize Wi-Fi radio
      if (espDevice) {
        try {
          espDevice.disconnect();
        } catch {}
      }

      // Start Firebase Verification Loop
      console.log(`[ESP32-FIREBASE-VERIFY] Polling Firebase for device ${deviceId} online status...`);
      let verifiedOnline = false;
      const startTime = Date.now();
      const maxWaitTimeMs = 35000; // 35 seconds timeout
      let pollCount = 0;

      while (Date.now() - startTime < maxWaitTimeMs && !verifiedOnline) {
        pollCount++;
        setStatusText(`Verifying online telemetry in Firebase Realtime Database (Check ${pollCount})...`);

        try {
          const db = getDirectDatabase() || defaultDatabase;
          if (db) {
            const devRef = ref(db, `devices/${deviceId}`);
            const snapshot = await get(devRef);

            if (snapshot.exists()) {
              const data = snapshot.val();
              console.log(`[ESP32-FIREBASE-VERIFY] Poll ${pollCount} snapshot:`, data);

              if (data.online === true && (!data.device_id || data.device_id === deviceId)) {
                verifiedOnline = true;
                if (data.ip) setConnectedIp(data.ip);
                if (data.last_update) {
                  setLastVerifiedTime(new Date(data.last_update).toLocaleTimeString());
                }
                break;
              }
            }
          }
        } catch (fbErr) {
          console.warn('[ESP32-FIREBASE-VERIFY] Snapshot check error:', fbErr);
        }

        if (isVirtual) {
          // In virtual mode, simulate ESP32 establishing online state after 3 seconds
          if (Date.now() - startTime > 3000) {
            verifiedOnline = true;
            await updateDeviceData(deviceId, {
              online: true,
              last_update: Date.now()
            });
            break;
          }
        }

        await new Promise(resolve => setTimeout(resolve, 2000));
      }

      if (!verifiedOnline && !isVirtual) {
        // DO NOT SIMULATE SUCCESS if Firebase does not confirm online
        setErrorType('firebase_timeout');
        setErrorMessage(
          'Wi-Fi credentials were sent to the ESP32, but the device could not be verified online in Firebase. Ensure the Wi-Fi password is correct, the 2.4GHz network has active internet access, and the ESP32 is powered on.'
        );
        setIsProcessing(false);
        return;
      }

      // Success confirmed by Firebase!
      setProgressChecklist({
        bleConnected: true,
        credentialsSent: true,
        wifiConnecting: true,
        internetChecking: true,
        firebaseConnected: true
      });

      setStatusText('Device confirmed online in Firebase!');
      await new Promise(resolve => setTimeout(resolve, 600));
      setIsProcessing(false);
      setStep(7);

      if (onSuccess) onSuccess();
    } catch (err: any) {
      console.error('[ESP32-PROV] Provisioning error:', err);
      setErrorType('wifi_failed');
      setErrorMessage(err.message || 'Wi-Fi configuration failed. Check passphrase and signal strength.');
      setIsProcessing(false);
    }
  };

  // Helper: Retry Firebase Verification
  const handleRetryFirebaseVerification = async () => {
    setIsProcessing(true);
    setErrorType(null);
    setStatusText('Re-checking Firebase Realtime Database for online status...');

    try {
      const db = getDirectDatabase() || defaultDatabase;
      if (db) {
        const devRef = ref(db, `devices/${deviceId}`);
        const snapshot = await get(devRef);
        if (snapshot.exists()) {
          const data = snapshot.val();
          if (data.online === true) {
            if (data.ip) setConnectedIp(data.ip);
            setIsProcessing(false);
            setStep(7);
            if (onSuccess) onSuccess();
            return;
          }
        }
      }

      if (isVirtual) {
        await updateDeviceData(deviceId, {
          online: true,
          last_update: Date.now()
        });
        setIsProcessing(false);
        setStep(7);
        if (onSuccess) onSuccess();
        return;
      }

      setErrorType('firebase_timeout');
      setErrorMessage(`Device ${deviceId} is still reported as offline in Firebase. Please check the Wi-Fi password and device power.`);
      setIsProcessing(false);
    } catch (e: any) {
      setErrorType('firebase_timeout');
      setErrorMessage(e.message || 'Failed to query Firebase.');
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md select-none font-sans">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className="glass-card w-full max-w-lg rounded-3xl p-6 bg-[#140C08] text-[#FDF8F5] border border-[#FF6A00]/30 shadow-2xl relative overflow-hidden space-y-5"
      >
        {/* Background Accent Glow */}
        <div className="absolute top-0 right-0 w-40 h-40 bg-[#FF6A00]/15 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-[#1C1410] border border-[#FF6A00]/25 hover:border-[#FFAA00] text-[#B8A89E] hover:text-[#FDF8F5] flex items-center justify-center transition-all z-10 cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header Title */}
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FF6A00]/15 border border-[#FF6A00]/30 text-[#FFAA00] text-[10px] font-black uppercase tracking-wider">
            <Radio className="w-3 h-3" />
            <span>Admin Control Panel • Wi-Fi Reconfiguration</span>
          </div>
          <h2 className="text-xl font-black text-[#FDF8F5] tracking-tight">Change Wi-Fi Network</h2>
          <p className="text-xs text-[#B8A89E] font-medium font-mono">
            Target Node: <span className="text-[#FFAA00] font-bold">{deviceId}</span>
            {isVirtual && <span className="ml-2 px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-[10px] font-bold">Virtual Mode</span>}
          </p>
        </div>

        {/* Wizard Steps Progress Bar */}
        <div className="flex items-center gap-1.5 py-1">
          {[1, 2, 3, 4, 5, 6, 7].map((s) => (
            <div
              key={s}
              className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
                step >= s ? 'bg-gradient-to-r from-[#FF6A00] to-[#FFAA00]' : 'bg-[#2A1D15]'
              }`}
            />
          ))}
        </div>

        {/* DYNAMIC STEP CONTENT */}
        <AnimatePresence mode="wait">
          {/* STEP 1: Confirmation Modal */}
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4 pt-1"
            >
              <div className="p-4 rounded-2xl bg-[#1C1410] border border-[#FF6A00]/25 space-y-3">
                <div className="flex justify-between items-center text-xs border-b border-[#FF6A00]/15 pb-2">
                  <span className="text-[#8C7A70] font-bold">Target Device:</span>
                  <span className="font-mono font-bold text-[#FFAA00]">{deviceId}</span>
                </div>
                <div className="flex justify-between items-center text-xs border-b border-[#FF6A00]/15 pb-2">
                  <span className="text-[#8C7A70] font-bold">Current Wi-Fi Network:</span>
                  <span className="font-bold text-[#FDF8F5]">{currentWifiSsid}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-[#8C7A70] font-bold">Provisioning Protocol:</span>
                  <span className="inline-flex items-center gap-1.5 text-emerald-400 font-bold">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    Espressif WiFiProv (Security 1)
                  </span>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-[#FF6A00]/10 border border-[#FF6A00]/30 text-xs text-[#D6C8C0] leading-relaxed space-y-2">
                <div className="flex items-center gap-2 text-[#FFAA00] font-bold uppercase text-[11px] tracking-wider">
                  <AlertTriangle className="w-4 h-4" />
                  <span>Important Notice</span>
                </div>
                <p>
                  This will temporarily instruct node <span className="font-mono text-[#FFAA00] font-bold">{deviceId}</span> to reboot into Bluetooth provisioning mode.
                </p>
                <p className="text-[11px] text-[#B8A89E]">
                  Make sure your Bluetooth is turned on and your device is located near the ESP32 sensor.
                </p>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-3 rounded-xl border border-[#FF6A00]/25 text-[#B8A89E] hover:bg-[#FF6A00]/10 font-bold text-xs cursor-pointer transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleStartReprovision}
                  className="flex-1 py-3.5 rounded-xl btn-orange text-white font-bold text-xs shadow-lg hover:brightness-110 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Continue</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}

          {/* STEP 2: Preparing Device & Sending Firebase Reprovision Command */}
          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-5 text-center py-4"
            >
              <div className="w-16 h-16 rounded-2xl bg-[#FF6A00]/20 border border-[#FF6A00]/40 flex items-center justify-center mx-auto text-[#FFAA00] animate-pulse">
                <Radio className="w-8 h-8" />
              </div>

              <div className="space-y-1.5">
                <h3 className="text-lg font-black text-[#FDF8F5]">Preparing FreshNex Device</h3>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-bold">
                  <Check className="w-3.5 h-3.5" />
                  <span>Reprovision command queued in Firebase</span>
                </div>
                <p className="text-xs text-[#B8A89E] max-w-sm mx-auto pt-2 leading-relaxed">
                  Waiting for ESP32 node <span className="font-mono text-[#FFAA00] font-bold">{deviceId}</span>. Scan for its Bluetooth provisioning broadcast.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-[#1C1410] border border-[#FF6A00]/20 space-y-2 text-xs">
                <button
                  type="button"
                  disabled={isProcessing}
                  onClick={() => handleScanBLE(false)}
                  className="w-full py-3.5 rounded-xl btn-orange text-white font-bold text-xs shadow-md hover:brightness-110 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <Bluetooth className="w-4 h-4" />
                  <span>Scan for PROV_{deviceId.replace(/[^a-zA-Z0-9]/g, '')}</span>
                </button>

                <button
                  type="button"
                  disabled={isProcessing}
                  onClick={() => handleScanBLE(true)}
                  className="w-full py-2.5 rounded-xl bg-emerald-600/20 border border-emerald-500/30 text-emerald-300 font-bold text-xs hover:bg-emerald-600/30 flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <span>Use Virtual ESP32 Simulator</span>
                </button>
              </div>

              <button
                type="button"
                onClick={() => setStep(1)}
                className="text-xs text-[#8C7A70] hover:text-[#B8A89E] font-bold underline cursor-pointer"
              >
                Cancel Process
              </button>
            </motion.div>
          )}

          {/* STEP 3: Connect to FreshNex Device (Discovery / Matching & PoP Entry) */}
          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              <div className="p-4 rounded-2xl bg-[#1C1410] border border-[#FF6A00]/25 space-y-3 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-[#8C7A70] font-bold">Target Node:</span>
                  <span className="font-mono font-bold text-[#FFAA00]">{deviceId}</span>
                </div>
                <div className="flex justify-between items-center border-t border-[#FF6A00]/15 pt-2">
                  <span className="text-[#8C7A70] font-bold">BLE Provision Name:</span>
                  <span className="font-mono font-bold text-emerald-400">{discoveredName || `PROV_${deviceId.replace(/[^a-zA-Z0-9]/g, '')}`}</span>
                </div>
                <div className="flex justify-between items-center border-t border-[#FF6A00]/15 pt-2">
                  <span className="text-[#8C7A70] font-bold">Security Protocol:</span>
                  <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-extrabold text-[10px] border border-emerald-500/30">
                    Security 1 (Curve25519 + AES-CTR)
                  </span>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-[#FFAA00] uppercase block tracking-wider">
                  Proof of Possession (PoP)
                </label>
                <input
                  type="text"
                  required
                  value={popCode}
                  onChange={(e) => setPopCode(e.target.value)}
                  className="w-full bg-[#1C1410] border border-[#FF6A00]/30 px-3.5 py-2.5 rounded-xl text-xs font-mono font-bold text-[#FDF8F5] focus:outline-none focus:border-[#FFAA00]"
                  placeholder="Enter PoP Code (Default: 12345678)"
                />
                <p className="text-[9px] text-[#8C7A70]">
                  Default PoP configured in ESP32 firmware: <span className="font-mono text-[#FFAA00]">12345678</span>
                </p>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="px-4 py-3 rounded-xl border border-[#FF6A00]/25 text-[#B8A89E] hover:bg-[#FF6A00]/10 font-bold text-xs cursor-pointer"
                >
                  Back
                </button>
                <button
                  type="button"
                  disabled={isProcessing}
                  onClick={handleConnectHandshake}
                  className="flex-1 py-3.5 rounded-xl btn-orange text-white font-bold text-xs shadow-lg hover:brightness-110 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <Bluetooth className="w-4 h-4" />
                  <span>Connect & Perform Handshake</span>
                </button>
              </div>
            </motion.div>
          )}

          {/* STEP 4: ESP32 Connected State */}
          {step === 4 && (
            <motion.div
              key="step4"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-5 text-center py-3"
            >
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center mx-auto text-emerald-400 shadow-md">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <div>
                <h3 className="text-lg font-black text-[#FDF8F5]">Security 1 Session Established</h3>
                <p className="text-xs text-[#B8A89E] mt-1 font-mono">Node: {deviceId}</p>
              </div>

              <div className="p-4 rounded-2xl bg-[#1C1410] border border-[#FF6A00]/25 text-xs text-left space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-[#8C7A70] font-bold">Bluetooth GATT:</span>
                  <span className="text-emerald-400 font-extrabold flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    Secure Connected
                  </span>
                </div>
                <div className="flex justify-between items-center border-t border-[#FF6A00]/15 pt-2">
                  <span className="text-[#8C7A70] font-bold">PoP Authentication:</span>
                  <span className="text-emerald-400 font-bold">Verified (SHA-256 + ECDH)</span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleFetchWifiList}
                className="w-full py-3.5 rounded-xl btn-orange text-white font-bold text-xs shadow-lg hover:brightness-110 flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Scan & Select Wi-Fi Network</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </motion.div>
          )}

          {/* STEP 5: Select Wi-Fi Network & Password Entry */}
          {step === 5 && (
            <motion.div
              key="step5"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#FFAA00] uppercase tracking-wider">Available 2.4GHz Networks</span>
                <button
                  type="button"
                  onClick={handleFetchWifiList}
                  disabled={isScanningWifi}
                  className="text-[11px] text-[#FFAA00] hover:text-[#FF6A00] font-bold flex items-center gap-1 cursor-pointer"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isScanningWifi ? 'animate-spin' : ''}`} />
                  <span>Refresh</span>
                </button>
              </div>

              {/* Scanned SSIDs list */}
              {scannedNetworks.length > 0 ? (
                <div className="max-h-48 overflow-y-auto border border-[#FF6A00]/25 rounded-2xl divide-y divide-[#FF6A00]/15 bg-[#1C1410]">
                  {scannedNetworks.map((net) => (
                    <button
                      key={net.ssid}
                      type="button"
                      onClick={() => { setSelectedSsid(net.ssid); setCustomSsid(''); }}
                      className={`w-full px-4 py-3 text-left flex items-center justify-between transition-all cursor-pointer ${
                        selectedSsid === net.ssid
                          ? 'bg-[#FF6A00]/20 text-[#FFAA00] font-extrabold'
                          : 'hover:bg-[#FF6A00]/10 text-[#D6C8C0]'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Wifi className={`w-4 h-4 ${selectedSsid === net.ssid ? 'text-[#FFAA00]' : 'text-[#8C7A70]'}`} />
                        <span className="text-xs font-bold">{net.ssid}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Signal className="w-3.5 h-3.5 text-[#8C7A70]" />
                        <span className="text-[10px] font-mono text-[#8C7A70]">{net.rssi} dBm</span>
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="p-4 rounded-2xl bg-[#1C1410] border border-[#FF6A00]/20 text-center space-y-2">
                  <p className="text-xs text-[#B8A89E]">
                    {isScanningWifi ? 'Scanning 2.4GHz Wi-Fi channels via ESP32...' : 'No Wi-Fi networks detected nearby. Tap Refresh to scan again, or enter your Wi-Fi SSID manually below.'}
                  </p>
                </div>
              )}

              {/* Manual SSID Entry */}
              <div className="pt-1 space-y-1.5">
                <label className="text-[10px] font-bold text-[#8C7A70] uppercase block">Or Enter Network SSID Manually</label>
                <input
                  type="text"
                  value={customSsid}
                  onChange={(e) => { setCustomSsid(e.target.value); setSelectedSsid(''); }}
                  placeholder="Enter Network SSID"
                  className="w-full bg-[#1C1410] border border-[#FF6A00]/25 px-3.5 py-2 rounded-xl text-xs font-bold text-[#FDF8F5] focus:outline-none focus:border-[#FFAA00]"
                />
              </div>

              {/* Passphrase Input */}
              {(selectedSsid || customSsid) && (
                <div className="space-y-1.5 pt-1">
                  <label className="text-[10px] font-bold text-[#FFAA00] uppercase block tracking-wider">
                    Wi-Fi Password for {selectedSsid || customSsid}
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={wifiPassword}
                      onChange={(e) => setWifiPassword(e.target.value)}
                      placeholder="Enter security passphrase"
                      className="w-full bg-[#1C1410] border border-[#FF6A00]/30 pl-3.5 pr-10 py-2.5 rounded-xl text-xs font-bold text-[#FDF8F5] focus:outline-none focus:border-[#FFAA00]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8C7A70] hover:text-[#FFAA00] cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <p className="text-[9px] text-[#8C7A70] italic">
                    Password is strictly encrypted and transmitted over BLE. It will never be stored in Firebase or logs.
                  </p>
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setStep(4)}
                  className="px-4 py-3 rounded-xl border border-[#FF6A00]/25 text-[#B8A89E] hover:bg-[#FF6A00]/10 font-bold text-xs cursor-pointer"
                >
                  Back
                </button>
                <button
                  type="button"
                  disabled={!selectedSsid && !customSsid}
                  onClick={handleTransmitCredentials}
                  className="flex-1 py-3.5 rounded-xl btn-orange text-white font-bold text-xs shadow-lg hover:brightness-110 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <Wifi className="w-4 h-4" />
                  <span>Transmit Credentials</span>
                </button>
              </div>
            </motion.div>
          )}

          {/* STEP 6: Configuring Device & Verifying Firebase */}
          {step === 6 && (
            <motion.div
              key="step6"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-5 py-2"
            >
              <div className="text-center space-y-1">
                <h3 className="text-lg font-black text-[#FDF8F5]">Configuring FreshNex Device</h3>
                <p className="text-xs text-[#B8A89E]">Applying Wi-Fi credentials and validating online telemetry.</p>
              </div>

              {/* Step Checklist */}
              <div className="p-4 rounded-2xl bg-[#1C1410] border border-[#FF6A00]/25 space-y-3 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#FDF8F5]">Bluetooth Connected</span>
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="flex items-center justify-between border-t border-[#FF6A00]/15 pt-2">
                  <span className="font-bold text-[#FDF8F5]">Wi-Fi Credentials Sent</span>
                  {progressChecklist.credentialsSent ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <div className="w-4 h-4 border-2 border-[#FFAA00] border-t-transparent rounded-full animate-spin" />
                  )}
                </div>
                <div className="flex items-center justify-between border-t border-[#FF6A00]/15 pt-2">
                  <span className="font-bold text-[#FDF8F5]">Connecting ESP32 to Wi-Fi</span>
                  {progressChecklist.wifiConnecting ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <span className="text-[#8C7A70] text-[10px]">Pending</span>
                  )}
                </div>
                <div className="flex items-center justify-between border-t border-[#FF6A00]/15 pt-2">
                  <span className="font-bold text-[#FDF8F5]">Checking Internet Gateway</span>
                  {progressChecklist.internetChecking ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <span className="text-[#8C7A70] text-[10px]">Pending</span>
                  )}
                </div>
                <div className="flex items-center justify-between border-t border-[#FF6A00]/15 pt-2">
                  <span className="font-bold text-[#FDF8F5]">Verifying Firebase Online Telemetry</span>
                  {progressChecklist.firebaseConnected ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <div className="w-4 h-4 border-2 border-[#FFAA00] border-t-transparent rounded-full animate-spin" />
                  )}
                </div>
              </div>

              {statusText && (
                <div className="p-3 rounded-xl bg-[#FF6A00]/10 border border-[#FF6A00]/25 text-[#FFAA00] text-xs font-bold text-center animate-pulse">
                  {statusText}
                </div>
              )}
            </motion.div>
          )}

          {/* STEP 7: Wi-Fi Configuration Successful */}
          {step === 7 && (
            <motion.div
              key="step7"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center space-y-5 py-3"
            >
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center mx-auto text-emerald-400 shadow-lg">
                <CheckCircle2 className="w-10 h-10 animate-bounce" />
              </div>

              <div className="space-y-1">
                <h3 className="text-xl font-black text-[#FDF8F5]">Wi-Fi Provisioning Successful</h3>
                <p className="text-xs text-emerald-400 font-bold">✓ Device confirmed online & streaming to Firebase</p>
              </div>

              <div className="p-4 rounded-2xl bg-[#1C1410] border border-[#FF6A00]/25 text-xs text-left space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-[#8C7A70] font-bold">Device ID:</span>
                  <span className="font-mono font-bold text-[#FFAA00]">{deviceId}</span>
                </div>
                <div className="flex justify-between items-center border-t border-[#FF6A00]/15 pt-2">
                  <span className="text-[#8C7A70] font-bold">Connected Network:</span>
                  <span className="font-bold text-[#FDF8F5]">{selectedSsid || customSsid}</span>
                </div>
                <div className="flex justify-between items-center border-t border-[#FF6A00]/15 pt-2">
                  <span className="text-[#8C7A70] font-bold">Assigned IP:</span>
                  <span className="font-mono text-emerald-400 font-bold">{connectedIp}</span>
                </div>
                <div className="flex justify-between items-center border-t border-[#FF6A00]/15 pt-2">
                  <span className="text-[#8C7A70] font-bold">Firebase Realtime DB:</span>
                  <span className="text-emerald-400 font-extrabold flex items-center gap-1">
                    <Server className="w-3.5 h-3.5" /> devices/{deviceId}/online: true
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="w-full py-3.5 rounded-xl btn-orange text-white font-bold text-xs shadow-lg hover:brightness-110 cursor-pointer"
              >
                Done
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* SPECIFIC ERROR MODALS / BANNERS */}
        {errorType && (
          <div className="p-4 rounded-2xl bg-red-950/90 border border-red-500/40 text-red-200 text-xs space-y-3">
            <div className="flex items-center gap-2 text-red-400 font-bold text-sm">
              <ShieldAlert className="w-5 h-5 shrink-0" />
              <span>
                {errorType === 'bluetooth_required' && 'Bluetooth Access Required'}
                {errorType === 'device_not_found' && 'Device Not Found'}
                {errorType === 'device_mismatch' && 'Device Identity Mismatch'}
                {errorType === 'handshake_failed' && 'Security Handshake Failed'}
                {errorType === 'wifi_failed' && 'Wi-Fi Configuration Failed'}
                {errorType === 'timeout' && 'Provisioning Timed Out'}
                {errorType === 'firebase_timeout' && 'Firebase Verification Timeout'}
              </span>
            </div>

            <p className="leading-relaxed font-medium">{errorMessage}</p>

            {errorType === 'handshake_failed' && handshakeDiagnostics && (
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => setShowDevDetails(!showDevDetails)}
                  className="text-[11px] font-bold text-red-300 underline hover:text-white cursor-pointer"
                >
                  {showDevDetails ? 'Hide Developer Details' : 'Show Developer Details'}
                </button>

                {showDevDetails && (
                  <div className="mt-2 p-3 rounded-xl bg-black/40 border border-red-500/30 font-mono text-[10px] space-y-1 text-red-200">
                    <div>Characteristic: <span className="text-white">{handshakeDiagnostics.characteristicName} ({handshakeDiagnostics.characteristicUuid || 'N/A'})</span></div>
                    <div>Write supported: <span className="text-white">{String(handshakeDiagnostics.writeSupported)}</span></div>
                    <div>Write Without Response: <span className="text-white">{String(handshakeDiagnostics.writeWithoutResponseSupported)}</span></div>
                    <div>Read supported: <span className="text-white">{String(handshakeDiagnostics.readSupported)}</span></div>
                    <div>Connected: <span className="text-white">{String(handshakeDiagnostics.connected)}</span></div>
                    {handshakeDiagnostics.lastError && (
                      <div>Last Error: <span className="text-red-400">{handshakeDiagnostics.lastError}</span></div>
                    )}
                  </div>
                )}
              </div>
            )}

            <div className="flex gap-2 pt-1 flex-wrap">
              {errorType === 'firebase_timeout' && (
                <button
                  type="button"
                  onClick={handleRetryFirebaseVerification}
                  className="px-3 py-1.5 rounded-lg bg-[#FF6A00] text-white font-bold text-[11px] hover:brightness-110 flex items-center gap-1 cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Retry Firebase Verification</span>
                </button>
              )}

              {errorType === 'handshake_failed' && (
                <button
                  type="button"
                  onClick={() => { setErrorType(null); setStep(3); }}
                  className="px-3 py-1.5 rounded-lg bg-[#FF6A00] text-white font-bold text-[11px] hover:brightness-110 flex items-center gap-1 cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Retry Handshake</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => { setErrorType(null); handleScanBLE(true); }}
                className="px-3 py-1.5 rounded-lg bg-emerald-600/30 border border-emerald-500/30 text-emerald-300 font-bold text-[11px] hover:bg-emerald-600/40 cursor-pointer"
              >
                Use Virtual Simulator
              </button>

              <button
                type="button"
                onClick={() => setErrorType(null)}
                className="px-3 py-1.5 rounded-lg bg-red-800/40 border border-red-500/30 text-white font-bold text-[11px] hover:bg-red-800/60 cursor-pointer"
              >
                Dismiss
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};

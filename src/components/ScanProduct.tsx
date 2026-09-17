import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { motion, AnimatePresence } from 'motion/react';
import jsQR from 'jsqr';
import { 
  ArrowLeft, 
  Zap, 
  ZapOff, 
  QrCode, 
  Search, 
  AlertCircle, 
  CheckCircle2, 
  Camera, 
  RefreshCw,
  Info
} from 'lucide-react';

export const ScanProduct: React.FC = () => {
  const navigate = useNavigate();
  const { fetchDeviceById, addScanToHistory } = useApp();

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [flashlight, setFlashlight] = useState<boolean>(false);
  const [manualInput, setManualInput] = useState<string>('YGS-FD-000124');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);

  // Initialize camera stream & scanner loop
  useEffect(() => {
    let active = true;
    let animationFrameId: number;

    const startCamera = async () => {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } }
        });

        if (!active) {
          mediaStream.getTracks().forEach(t => t.stop());
          return;
        }

        setStream(mediaStream);
        setHasPermission(true);

        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
          videoRef.current.setAttribute('playsinline', 'true');
          await videoRef.current.play();
        }

        // Frame analyzer loop using jsQR
        const scanCanvas = () => {
          if (!active) return;
          const video = videoRef.current;
          const canvas = canvasRef.current;

          if (video && video.readyState === video.HAVE_ENOUGH_DATA && canvas) {
            const ctx = canvas.getContext('2d');
            if (ctx) {
              canvas.width = video.videoWidth;
              canvas.height = video.videoHeight;
              ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

              const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
              const code = jsQR(imageData.data, imageData.width, imageData.height, {
                inversionAttempts: 'dontInvert'
              });

              if (code && code.data && !isProcessing) {
                const scannedText = code.data.trim();
                handleScanResult(scannedText);
                return; // Stop scanning once found
              }
            }
          }

          animationFrameId = requestAnimationFrame(scanCanvas);
        };

        animationFrameId = requestAnimationFrame(scanCanvas);

      } catch (err) {
        console.warn('Camera access error or restricted:', err);
        setHasPermission(false);
      }
    };

    startCamera();

    return () => {
      active = false;
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
      if (stream) {
        stream.getTracks().forEach(t => t.stop());
      }
    };
  }, []);

  const toggleFlashlight = async () => {
    if (stream) {
      const track = stream.getVideoTracks()[0];
      if (track) {
        try {
          const newFlashState = !flashlight;
          // @ts-ignore
          await track.applyConstraints({ advanced: [{ torch: newFlashState }] });
          setFlashlight(newFlashState);
        } catch (e) {
          console.warn('Torch constraint not supported on this device/browser.');
        }
      }
    }
  };

  const handleScanResult = async (scannedId: string) => {
    setIsProcessing(true);
    setErrorMessage(null);

    // Clean scanned text
    const cleanId = scannedId.trim().toUpperCase();

    try {
      const device = await fetchDeviceById(cleanId);

      if (device) {
        // Device found! Save to scan history and navigate to details
        await addScanToHistory(device.device_id, device.product || 'Milk');
        navigate(`/products/${device.device_id}`);
      } else {
        setErrorMessage(`FreshNex device "${cleanId}" not found in database.`);
        setIsProcessing(false);
      }
    } catch (err) {
      setErrorMessage('Error querying device from Firebase.');
      setIsProcessing(false);
    }
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualInput.trim()) return;
    handleScanResult(manualInput.trim());
  };

  return (
    <div className="space-y-4 max-w-lg mx-auto">
      {/* Top Header Bar */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="w-10 h-10 rounded-2xl glass-card flex items-center justify-center text-[#082A52] hover:bg-white transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h2 className="text-lg font-black text-[#082A52]">Scan Product</h2>
        <button
          onClick={toggleFlashlight}
          className={`w-10 h-10 rounded-2xl glass-card flex items-center justify-center transition-colors ${
            flashlight ? 'bg-amber-400 text-slate-900' : 'text-[#082A52]'
          }`}
        >
          {flashlight ? <Zap className="w-5 h-5 fill-current" /> : <ZapOff className="w-5 h-5" />}
        </button>
      </div>

      {/* Main Scanner Viewport Card */}
      <div className="glass-card rounded-3xl p-4 border border-white/80 shadow-2xl relative overflow-hidden bg-slate-900 text-white min-h-[360px] flex flex-col items-center justify-center">
        {/* Hidden Canvas for QR Frame Extraction */}
        <canvas ref={canvasRef} className="hidden" />

        {hasPermission === false ? (
          <div className="text-center p-6 space-y-3">
            <div className="w-16 h-16 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center mx-auto">
              <Camera className="w-8 h-8" />
            </div>
            <h3 className="text-base font-bold text-white">Camera Access Required</h3>
            <p className="text-xs text-slate-300 max-w-xs">
              Please allow camera permissions in your browser or use the manual Device ID entry form below.
            </p>
          </div>
        ) : (
          <div className="relative w-full h-[320px] rounded-2xl overflow-hidden bg-black flex items-center justify-center">
            {/* Live Video Viewport */}
            <video
              ref={videoRef}
              className="w-full h-full object-cover"
              playsInline
              muted
            />

            {/* Blue Scanning Viewfinder Frame */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none p-6">
              <div className="w-64 h-64 border-2 border-sky-400/50 rounded-3xl relative shadow-[0_0_50px_rgba(33,150,243,0.3)] bg-sky-500/5">
                {/* Corner Accents */}
                <div className="absolute -top-1 -left-1 w-8 h-8 border-t-4 border-l-4 border-sky-400 rounded-tl-2xl" />
                <div className="absolute -top-1 -right-1 w-8 h-8 border-t-4 border-r-4 border-sky-400 rounded-tr-2xl" />
                <div className="absolute -bottom-1 -left-1 w-8 h-8 border-b-4 border-l-4 border-sky-400 rounded-bl-2xl" />
                <div className="absolute -bottom-1 -right-1 w-8 h-8 border-b-4 border-r-4 border-sky-400 rounded-br-2xl" />

                {/* Animated Laser Beam */}
                <div className="absolute left-2 right-2 h-1 bg-gradient-to-r from-sky-400 via-white to-sky-400 rounded-full shadow-[0_0_12px_#2196F3] animate-scan-laser" />
              </div>
            </div>

            {/* Instruction Overlay */}
            <div className="absolute bottom-4 left-0 right-0 text-center pointer-events-none">
              <span className="inline-block px-4 py-1.5 rounded-full bg-black/60 backdrop-blur-md text-xs font-bold text-sky-200 border border-white/10">
                Align the FreshNex QR code inside the frame
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Error Message Toast */}
      {errorMessage && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-300 text-rose-700 text-xs font-bold flex items-center gap-2"
        >
          <AlertCircle className="w-5 h-5 shrink-0 text-rose-600" />
          <span>{errorMessage}</span>
        </motion.div>
      )}

      {/* Manual Device ID Search Fallback */}
      <div className="glass-card rounded-2xl p-4 border border-white/80 space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-[#082A52] uppercase tracking-wider flex items-center gap-1.5">
            <QrCode className="w-4 h-4 text-[#1267D6]" />
            <span>Manual Device ID Entry</span>
          </label>
          <span className="text-[10px] text-slate-400 font-medium">Prototype: YGS-FD-000124</span>
        </div>

        <form onSubmit={handleManualSubmit} className="flex gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              value={manualInput}
              onChange={e => setManualInput(e.target.value)}
              placeholder="e.g. YGS-FD-000124"
              className="w-full glass-input px-3.5 py-2.5 rounded-xl text-sm font-mono font-bold text-[#082A52] uppercase tracking-wider uppercase"
            />
          </div>
          <button
            type="submit"
            disabled={isProcessing}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#1267D6] to-[#2196F3] text-white font-bold text-xs shadow-md hover:brightness-110 active:scale-95 transition-all flex items-center gap-1.5 shrink-0 cursor-pointer"
          >
            {isProcessing ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <Search className="w-4 h-4" />
                <span>VERIFY</span>
              </>
            )}
          </button>
        </form>
      </div>

      {/* Prototype Quick Test Chip */}
      <div 
        onClick={() => handleScanResult('YGS-FD-000124')}
        className="glass-card p-3 rounded-xl border border-sky-200/80 cursor-pointer hover:bg-sky-50 transition-colors flex items-center justify-between"
      >
        <div className="flex items-center gap-2">
          <Info className="w-4 h-4 text-[#1267D6]" />
          <div>
            <p className="text-xs font-bold text-[#082A52]">Quick Test Prototype Device</p>
            <p className="text-[10px] text-slate-500 font-mono">YGS-FD-000124 (Milk Package)</p>
          </div>
        </div>
        <span className="text-xs font-bold text-[#1267D6]">SCAN NOW →</span>
      </div>
    </div>
  );
};

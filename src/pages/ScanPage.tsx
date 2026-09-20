import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import jsQR from 'jsqr';
import { 
  Camera, 
  Scan, 
  QrCode, 
  Radio, 
  ArrowRight, 
  AlertCircle, 
  CheckCircle2, 
  RefreshCw,
  Upload,
  Zap,
  ZapOff,
  Image as ImageIcon
} from 'lucide-react';
import { useFreshness } from '../context/FreshnessContext';

export const ScanPage: React.FC = () => {
  const navigate = useNavigate();
  const { scanItem, isScanning } = useFreshness();

  const [tagInput, setTagInput] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [flashlight, setFlashlight] = useState(false);
  const [scannedResult, setScannedResult] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const handlePerformScan = useCallback(async (tagToScan: string) => {
    setErrorMessage(null);
    setSuccessMessage(null);

    const clean = tagToScan.trim().toUpperCase().replace(/^#/, '');
    if (!clean) {
      setErrorMessage('Please enter or scan a valid QR tag ID.');
      return;
    }

    try {
      setSuccessMessage(`QR Code Detected: #${clean}. Fetching telemetry...`);
      const item = await scanItem(clean);
      setSuccessMessage(`Verified: ${item.name} (${item.tagId})! Loading telemetry...`);
      
      // Brief pause to display verification success
      setTimeout(() => {
        navigate(`/live-data/${item.id}`);
      }, 800);
    } catch (err: any) {
      setErrorMessage(
        err.message || `Tag "${clean}" not recognized. Allowed QR tags are #YGS-FD-000124 (Milk) and #YGS-FD-112233 (Meat).`
      );
    }
  }, [scanItem, navigate]);

  // Start Camera Stream & Frame Scanner
  const startCamera = useCallback(async () => {
    setCameraError(null);
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera API not supported on this browser.');
      }

      let stream: MediaStream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: 'environment' }, width: { ideal: 1280 }, height: { ideal: 720 } }
        });
      } catch {
        // Fallback for basic camera constraint
        stream = await navigator.mediaDevices.getUserMedia({ video: true });
      }

      streamRef.current = stream;
      setCameraActive(true);

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.setAttribute('playsinline', 'true');
        await videoRef.current.play().catch(() => {});
      }
    } catch (err: any) {
      console.warn('Camera access restriction:', err);
      setCameraActive(false);
      setCameraError('Camera access unavailable. You can upload a QR image or enter tag manually below.');
    }
  }, []);

  useEffect(() => {
    startCamera();

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, [startCamera]);

  // Continuous frame analysis with jsQR
  useEffect(() => {
    if (!cameraActive) return;

    let active = true;
    let animationFrameId: number;

    const processFrame = () => {
      if (!active) return;

      const video = videoRef.current;
      const canvas = canvasRef.current;

      if (video && video.readyState === video.HAVE_ENOUGH_DATA && canvas) {
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        if (ctx) {
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

          try {
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const code = jsQR(imageData.data, imageData.width, imageData.height, {
              inversionAttempts: 'attemptBoth'
            });

            if (code && code.data) {
              const text = code.data.trim();
              if (text && text !== scannedResult && !isScanning) {
                setScannedResult(text);
                
                // Identify target tag
                let matchedTag = text;
                if (text.includes('112233')) matchedTag = 'YGS-FD-112233';
                else if (text.includes('000124')) matchedTag = 'YGS-FD-000124';

                handlePerformScan(matchedTag);
                return; // Stop scan loop on detection
              }
            }
          } catch (e) {
            console.warn('Frame processing error:', e);
          }
        }
      }

      animationFrameId = requestAnimationFrame(processFrame);
    };

    animationFrameId = requestAnimationFrame(processFrame);

    return () => {
      active = false;
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
    };
  }, [cameraActive, scannedResult, isScanning, handlePerformScan]);

  // Handle uploaded QR code image files
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setErrorMessage(null);
    setSuccessMessage('Processing QR code image file...');

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0, img.width, img.height);

        const imageData = ctx.getImageData(0, 0, img.width, img.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height, {
          inversionAttempts: 'attemptBoth'
        });

        if (code && code.data) {
          const rawText = code.data.trim();
          let matchedTag = rawText;
          if (rawText.includes('112233')) matchedTag = 'YGS-FD-112233';
          else if (rawText.includes('000124')) matchedTag = 'YGS-FD-000124';

          setTagInput(matchedTag);
          handlePerformScan(matchedTag);
        } else {
          setErrorMessage('No readable QR code found in the uploaded image. Please try another image or enter the Tag ID.');
          setSuccessMessage(null);
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const toggleFlashlight = async () => {
    if (streamRef.current) {
      const track = streamRef.current.getVideoTracks()[0];
      if (track) {
        try {
          const nextState = !flashlight;
          // @ts-ignore
          await track.applyConstraints({ advanced: [{ torch: nextState }] });
          setFlashlight(nextState);
        } catch {
          console.warn('Torch constraint not supported');
        }
      }
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="max-w-4xl mx-auto space-y-6 select-none font-sans"
    >
      {/* Offscreen Canvas for jsQR */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Hidden File Input for QR Image Upload */}
      <input 
        type="file" 
        ref={fileInputRef} 
        accept="image/*" 
        onChange={handleImageUpload} 
        className="hidden" 
      />

      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-serif italic font-black text-[#07221A] tracking-tight flex items-center gap-2">
            <QrCode className="w-7 h-7 text-[#20E79A]" />
            <span>Scan Product</span>
          </h1>
          <p className="text-xs font-bold text-[#5C7F75]">
            Align physical QR code tag or upload a QR image to view live IoT telemetry.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-4 py-2 bg-white border border-[#13493B]/20 hover:border-[#20E79A] rounded-xl text-xs font-bold text-[#07221A] flex items-center gap-2 shadow-sm transition-all cursor-pointer"
          >
            <Upload className="w-4 h-4 text-[#20E79A]" />
            <span>Upload QR Image</span>
          </button>

          {cameraActive && (
            <button
              onClick={toggleFlashlight}
              className={`p-2 rounded-xl border transition-all cursor-pointer ${
                flashlight 
                  ? 'bg-[#20E79A] text-[#07221A] border-[#20E79A] shadow-md' 
                  : 'bg-white border-[#13493B]/20 text-[#07221A] hover:border-[#20E79A]'
              }`}
              title="Toggle Flashlight"
            >
              {flashlight ? <Zap className="w-4 h-4" /> : <ZapOff className="w-4 h-4" />}
            </button>
          )}
        </div>
      </div>

      {/* Main Scanner Card */}
      <div className="bg-white border border-[#13493B]/10 rounded-[32px] p-6 sm:p-8 space-y-6 shadow-sm relative overflow-hidden">
        <AnimatePresence>
          {errorMessage && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="p-3.5 rounded-xl bg-red-50 border border-red-100 flex items-center gap-2.5 text-red-700 text-xs font-semibold"
            >
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </motion.div>
          )}

          {successMessage && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="p-3.5 rounded-xl bg-[#EBFBF4] border border-[#20E79A]/20 flex items-center gap-2.5 text-[#07221A] text-xs font-bold"
            >
              <CheckCircle2 className="w-4 h-4 shrink-0 text-[#20E79A]" />
              <span>{successMessage}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Viewport Box */}
        <div className="relative mx-auto w-full max-w-md aspect-square rounded-[24px] bg-[#07221A] border border-[#13493B]/20 overflow-hidden flex flex-col items-center justify-center shadow-inner">
          <video
            ref={videoRef}
            playsInline
            muted
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${
              cameraActive ? 'opacity-100' : 'opacity-0 pointer-events-none'
            }`}
          />

          {!cameraActive && (
            <div className="absolute inset-0 bg-gradient-to-b from-[#07221A] via-[#041410] to-[#010605] flex flex-col items-center justify-center p-6 text-center">
              <div className="relative flex items-center justify-center mb-4">
                <span className="absolute w-28 h-28 rounded-full bg-[#20E79A]/10 animate-ping opacity-60" />
                <span className="absolute w-20 h-20 rounded-full bg-[#20E79A]/15 animate-ping opacity-40 delay-300" />
                <div className="w-20 h-20 rounded-2xl bg-[#13493B]/40 border border-[#20E79A]/40 flex items-center justify-center text-[#20E79A] shadow-md relative z-10">
                  <Camera className="w-10 h-10" />
                </div>
              </div>
              <p className="text-xs font-black text-white uppercase tracking-wider">Camera Sensor Inactive</p>
              <p className="text-[11px] text-[#5C7F75] max-w-xs mt-1 font-semibold">
                {cameraError || 'Grant camera permission or select a QR image to scan.'}
              </p>
              <button
                onClick={startCamera}
                className="mt-4 px-4 py-2 rounded-xl bg-[#20E79A] text-[#07221A] text-xs font-black hover:bg-[#13C07C] transition-colors shadow-md cursor-pointer flex items-center gap-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Enable Camera</span>
              </button>
            </div>
          )}

          {/* Precision Target Brackets */}
          <div className="absolute inset-8 sm:inset-12 pointer-events-none">
            <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-[#20E79A] rounded-tl-lg" />
            <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-[#20E79A] rounded-tr-lg" />
            <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-[#20E79A] rounded-bl-lg" />
            <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-[#20E79A] rounded-br-lg" />

            {/* Continuous Animated Laser Beam */}
            <div className="absolute left-0 right-0 h-0.5 bg-[#20E79A] shadow-[0_0_12px_#20E79A] top-1/2 animate-pulse" />
          </div>

          {/* Floating Detection Status */}
          <motion.div 
            animate={{ y: [0, -3, 0] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute bottom-4 bg-[#07221A]/90 backdrop-blur-md px-4 py-1.5 rounded-full border border-[#20E79A]/30 flex items-center gap-2 shadow-xl"
          >
            <Radio className="w-3.5 h-3.5 text-[#20E79A] animate-pulse" />
            <span className="text-[11px] font-bold text-white">Live Optical QR Detection Active</span>
          </motion.div>
        </div>

        {/* Quick Upload or Manual Trigger Action */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2 max-w-md mx-auto">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => fileInputRef.current?.click()}
            className="w-full py-3 px-5 rounded-xl font-bold text-xs text-[#07221A] bg-[#EBF1EF] hover:bg-[#DCE7E3] border border-[#13493B]/10 flex items-center justify-center gap-2 cursor-pointer transition-all"
          >
            <ImageIcon className="w-4 h-4 text-[#20E79A]" />
            <span>Select QR Image File</span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => handlePerformScan(tagInput)}
            disabled={isScanning || !tagInput}
            className="w-full py-3 px-5 rounded-xl font-black text-xs text-white bg-[#07221A] hover:bg-[#134336] flex items-center justify-center gap-2 shadow-md disabled:opacity-50 cursor-pointer transition-all"
          >
            {isScanning ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-white" />
                <span>Reading Telemetry...</span>
              </>
            ) : (
              <>
                <Scan className="w-4 h-4 text-[#20E79A]" />
                <span>Scan Entry (#{tagInput || 'Manual'})</span>
              </>
            )}
          </motion.button>
        </div>

        {/* Presets & Manual Input */}
        <div className="pt-4 border-t border-[#13493B]/10 max-w-md mx-auto space-y-4">
          <div>
            <label className="text-xs font-bold text-[#5C7F75] block mb-2">
              Supported Authorized QR Code Tags:
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  setTagInput('YGS-FD-000124');
                  handlePerformScan('YGS-FD-000124');
                }}
                className="p-3 bg-emerald-50/60 hover:bg-emerald-100/70 border border-emerald-200/80 rounded-2xl text-left transition-all cursor-pointer group"
              >
                <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-800">MILK PACKAGE</div>
                <div className="text-xs font-mono font-black text-[#07221A] group-hover:text-[#20E79A] transition-colors">
                  #YGS-FD-000124
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  setTagInput('YGS-FD-112233');
                  handlePerformScan('YGS-FD-112233');
                }}
                className="p-3 bg-emerald-50/60 hover:bg-emerald-100/70 border border-emerald-200/80 rounded-2xl text-left transition-all cursor-pointer group"
              >
                <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-800">MEAT PACKAGE</div>
                <div className="text-xs font-mono font-black text-[#07221A] group-hover:text-[#20E79A] transition-colors">
                  #YGS-FD-112233
                </div>
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-[#5C7F75] block">
              Enter custom tag or batch ID:
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                placeholder="e.g. YGS-FD-112233"
                className="flex-1 px-4 py-2.5 bg-[#EBF1EF] text-sm font-mono text-[#07221A] placeholder-[#5C7F75] rounded-xl border border-transparent focus:outline-none focus:bg-white focus:border-[#20E79A]/50 focus:ring-4 focus:ring-[#20E79A]/10 transition-all duration-200 uppercase"
              />
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handlePerformScan(tagInput)}
                disabled={isScanning || !tagInput}
                className="px-5 py-2.5 rounded-xl font-black text-xs text-white bg-[#07221A] hover:bg-[#134336] flex items-center gap-1.5 transition-colors cursor-pointer shadow-md disabled:opacity-50"
              >
                <span>Verify</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </motion.button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

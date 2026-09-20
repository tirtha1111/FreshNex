import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Camera, 
  Scan, 
  QrCode, 
  Radio, 
  ArrowRight, 
  Sparkles, 
  AlertCircle, 
  CheckCircle2, 
  RefreshCw,
  Zap
} from 'lucide-react';
import { useFreshness } from '../context/FreshnessContext';

export const ScanPage: React.FC = () => {
  const navigate = useNavigate();
  const { scanItem, isScanning } = useFreshness();

  const [tagInput, setTagInput] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Optional real camera stream attempt
  useEffect(() => {
    let stream: MediaStream | null = null;
    const startCamera = async () => {
      try {
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
          stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: 'environment' }
          });
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            videoRef.current.play().catch(() => {});
            setCameraActive(true);
          }
        }
      } catch (e) {
        // Fallback to interactive simulated scanner
        setCameraActive(false);
      }
    };

    startCamera();

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const handlePerformScan = async (tagToScan: string) => {
    setErrorMessage(null);
    setSuccessMessage(null);

    const clean = tagToScan.trim().replace(/^#/, '');
    if (!clean) {
      setErrorMessage('Please enter a valid tag or batch ID.');
      return;
    }

    try {
      setSuccessMessage(`Identifying sensor tag #${clean}...`);
      const item = await scanItem(clean);
      setSuccessMessage(`Verified: ${item.name} (${item.tagId})! Loading telemetry...`);
      setTimeout(() => {
        navigate(`/live-data/${item.id}`);
      }, 700);
    } catch (err: any) {
      setErrorMessage(err.message || 'Tag could not be identified. Please try a preset tag.');
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="max-w-4xl mx-auto space-y-6 select-none"
    >
      {/* Title Header */}
      <div className="space-y-1 text-center sm:text-left">
        <h1 className="text-2xl sm:text-3xl font-black text-[#FDF8F5] tracking-tight">
          Scan Product
        </h1>
        <p className="text-sm text-[#B8A89E]">
          Scan QR code or RFID tag to monitor freshness and live environmental telemetry.
        </p>
      </div>

      {/* Main Scanner Card */}
      <div className="card-solid p-6 sm:p-8 space-y-6 shadow-2xl relative overflow-hidden border border-[#FF6A00]/30">
        {/* Top edge subtle orange glow */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#FF6A00]/60 to-transparent" />

        <AnimatePresence>
          {errorMessage && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="p-3.5 rounded-xl bg-[#FF5A67]/15 border border-[#FF5A67]/30 flex items-center gap-2.5 text-[#FF5A67] text-xs font-semibold"
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
              className="p-3.5 rounded-xl bg-[#20E79A]/15 border border-[#20E79A]/30 flex items-center gap-2.5 text-[#20E79A] text-xs font-bold"
            >
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{successMessage}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Viewport Box */}
        <div className="relative mx-auto w-full max-w-md aspect-square rounded-2xl bg-[#0D0A08] border border-[#FF6A00]/30 overflow-hidden flex flex-col items-center justify-center shadow-inner">
          {/* Camera feed or simulated backdrop */}
          {cameraActive ? (
            <video
              ref={videoRef}
              playsInline
              muted
              className="absolute inset-0 w-full h-full object-cover"
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-b from-[#1E140E] via-[#140C08] to-[#0A0705] flex flex-col items-center justify-center p-6 text-center">
              {/* Concentric animated pulse rings */}
              <div className="relative flex items-center justify-center mb-4">
                <span className="absolute w-28 h-28 rounded-full bg-[#FF6A00]/10 animate-ping opacity-60" />
                <span className="absolute w-20 h-20 rounded-full bg-[#FFAA00]/15 animate-ping opacity-40 delay-300" />
                <div className="w-20 h-20 rounded-2xl bg-[#261A12] border border-[#FF6A00]/40 flex items-center justify-center text-[#FF6A00] shadow-[0_0_25px_rgba(255,106,0,0.3)] relative z-10">
                  <QrCode className="w-10 h-10" />
                </div>
              </div>
              <p className="text-xs font-black text-[#FDF8F5] uppercase tracking-wider">Optical Sensor Ready</p>
              <p className="text-[11px] text-[#8C7A70] max-w-xs mt-1">
                Position QR code or hold RFID tag near device reader.
              </p>
            </div>
          )}

          {/* Precision Target Brackets with Animation */}
          <div className="absolute inset-8 sm:inset-12 pointer-events-none">
            {/* Top-Left */}
            <div className="absolute top-0 left-0 w-8 h-8 border-t-3 border-l-3 border-[#FFAA00] rounded-tl-lg shadow-[0_0_12px_#FFAA00]" />
            {/* Top-Right */}
            <div className="absolute top-0 right-0 w-8 h-8 border-t-3 border-r-3 border-[#FFAA00] rounded-tr-lg shadow-[0_0_12px_#FFAA00]" />
            {/* Bottom-Left */}
            <div className="absolute bottom-0 left-0 w-8 h-8 border-b-3 border-l-3 border-[#FFAA00] rounded-bl-lg shadow-[0_0_12px_#FFAA00]" />
            {/* Bottom-Right */}
            <div className="absolute bottom-0 right-0 w-8 h-8 border-b-3 border-r-3 border-[#FFAA00] rounded-br-lg shadow-[0_0_12px_#FFAA00]" />

            {/* Continuous Animated Laser Beam */}
            <div className="animate-laser" />
          </div>

          {/* Floating RFID Detection Pill with Pulsing Glow */}
          <motion.div 
            animate={{ y: [0, -4, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute bottom-4 bg-[#261A12]/95 backdrop-blur-md px-4 py-1.5 rounded-full border border-[#FF6A00]/40 flex items-center gap-2 shadow-xl"
          >
            <Radio className="w-3.5 h-3.5 text-[#FFAA00] animate-pulse" />
            <span className="text-[11px] font-bold text-[#FDF8F5]">RFID & QR Scanner Active</span>
          </motion.div>
        </div>

        {/* Quick Action Button */}
        <div className="flex justify-center pt-2">
          <motion.button
            whileHover={{ scale: 1.03, y: -2 }}
            whileTap={{ scale: 0.96 }}
            onClick={() => handlePerformScan(tagInput)}
            disabled={isScanning || !tagInput}
            className="w-full max-w-md py-3.5 px-6 rounded-xl font-black text-[#140C08] btn-orange flex items-center justify-center gap-2 shadow-[0_4px_25px_rgba(255,106,0,0.4)] disabled:opacity-50 cursor-pointer"
          >
            {isScanning ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-[#140C08]" />
                <span>Reading Sensor Telemetry...</span>
              </>
            ) : (
              <>
                <Scan className="w-4 h-4" />
                <span>Perform Real Scan ({tagInput ? `#${tagInput}` : 'Enter Tag ID below'})</span>
              </>
            )}
          </motion.button>
        </div>

        {/* Manual Input Section */}
        <div className="pt-4 border-t border-[#3D261A]/60 max-w-md mx-auto space-y-3">
          <label className="text-xs font-bold text-[#B8A89E] block text-center sm:text-left">
            Enter physical tag or batch ID to connect:
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              placeholder="e.g. FRX1024"
              className="flex-1 px-4 py-2.5 bg-[#1E140E] text-sm font-mono text-[#FDF8F5] placeholder-[#8C7A70] rounded-xl border border-[#3D261A] focus:outline-none focus:border-[#FF6A00] focus:ring-2 focus:ring-[#FF6A00]/20"
            />
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handlePerformScan(tagInput)}
              disabled={isScanning || !tagInput}
              className="px-5 py-2.5 rounded-xl font-bold text-xs text-[#FDF8F5] bg-[#261A12] hover:bg-[#302017] border border-[#3D261A] hover:border-[#FF6A00]/50 flex items-center gap-1.5 transition-colors cursor-pointer shadow-md disabled:opacity-50"
            >
              <span>Connect</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </motion.button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

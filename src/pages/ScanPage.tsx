import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Camera, 
  Scan, 
  QrCode, 
  Radio, 
  ArrowRight, 
  AlertCircle, 
  CheckCircle2, 
  RefreshCw
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
      className="max-w-4xl mx-auto space-y-6 select-none font-sans"
    >
      {/* Title Header */}
      <div className="space-y-1 text-center sm:text-left">
        <h1 className="text-2xl sm:text-3xl font-serif italic font-black text-[#07221A] tracking-tight">
          Scan Product
        </h1>
        <p className="text-xs font-bold text-[#5C7F75]">
          Scan QR code or RFID tag to monitor freshness and live environmental telemetry.
        </p>
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
              className="p-3.5 rounded-xl bg-[#EBFBF4] border border-[#20E79A]/20 flex items-center gap-2.5 text-[#20E79A] text-xs font-bold"
            >
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{successMessage}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Viewport Box */}
        <div className="relative mx-auto w-full max-w-md aspect-square rounded-[24px] bg-[#07221A] border border-[#13493B]/20 overflow-hidden flex flex-col items-center justify-center shadow-inner">
          {cameraActive ? (
            <video
              ref={videoRef}
              playsInline
              muted
              className="absolute inset-0 w-full h-full object-cover"
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-b from-[#07221A] via-[#041410] to-[#010605] flex flex-col items-center justify-center p-6 text-center">
              <div className="relative flex items-center justify-center mb-4">
                <span className="absolute w-28 h-28 rounded-full bg-[#20E79A]/10 animate-ping opacity-60" />
                <span className="absolute w-20 h-20 rounded-full bg-[#20E79A]/15 animate-ping opacity-40 delay-300" />
                <div className="w-20 h-20 rounded-2xl bg-[#13493B]/40 border border-[#20E79A]/40 flex items-center justify-center text-[#20E79A] shadow-md relative z-10">
                  <QrCode className="w-10 h-10" />
                </div>
              </div>
              <p className="text-xs font-black text-white uppercase tracking-wider">Optical Sensor Ready</p>
              <p className="text-[11px] text-[#5C7F75] max-w-xs mt-1 font-semibold">
                Position QR code or hold RFID tag near device reader.
              </p>
            </div>
          )}

          {/* Precision Target Brackets with Animation */}
          <div className="absolute inset-8 sm:inset-12 pointer-events-none">
            <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-[#20E79A] rounded-tl-lg" />
            <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-[#20E79A] rounded-tr-lg" />
            <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-[#20E79A] rounded-bl-lg" />
            <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-[#20E79A] rounded-br-lg" />

            {/* Continuous Animated Laser Beam */}
            <div className="absolute left-0 right-0 h-0.5 bg-[#20E79A] shadow-[0_0_10px_#20E79A] top-1/2 animate-pulse" />
          </div>

          {/* Floating RFID Detection Pill with Pulsing Glow */}
          <motion.div 
            animate={{ y: [0, -4, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute bottom-4 bg-[#07221A]/95 backdrop-blur-md px-4 py-1.5 rounded-full border border-[#20E79A]/30 flex items-center gap-2 shadow-xl"
          >
            <Radio className="w-3.5 h-3.5 text-[#20E79A] animate-pulse" />
            <span className="text-[11px] font-bold text-white">RFID & QR Scanner Active</span>
          </motion.div>
        </div>

        {/* Quick Action Button */}
        <div className="flex justify-center pt-2">
          <motion.button
            whileHover={{ scale: 1.03, y: -2 }}
            whileTap={{ scale: 0.96 }}
            onClick={() => handlePerformScan(tagInput)}
            disabled={isScanning || !tagInput}
            className="w-full max-w-md py-3.5 px-6 rounded-xl font-black text-white bg-[#07221A] hover:bg-[#134336] flex items-center justify-center gap-2 shadow-md disabled:opacity-50 cursor-pointer"
          >
            {isScanning ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-white" />
                <span>Reading Sensor Telemetry...</span>
              </>
            ) : (
              <>
                <Scan className="w-4 h-4 text-[#20E79A]" />
                <span>Perform Real Scan ({tagInput ? `#${tagInput}` : 'Enter Tag ID below'})</span>
              </>
            )}
          </motion.button>
        </div>

        {/* Manual Input Section */}
        <div className="pt-4 border-t border-[#13493B]/10 max-w-md mx-auto space-y-3">
          <label className="text-xs font-bold text-[#5C7F75] block text-center sm:text-left">
            Enter physical tag or batch ID to connect:
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              placeholder="e.g. MILK1024"
              className="flex-1 px-4 py-2.5 bg-[#EBF1EF] text-sm font-mono text-[#07221A] placeholder-[#5C7F75] rounded-xl border border-transparent focus:outline-none focus:bg-white focus:border-[#20E79A]/50 focus:ring-4 focus:ring-[#20E79A]/10 transition-all duration-200"
            />
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handlePerformScan(tagInput)}
              disabled={isScanning || !tagInput}
              className="px-5 py-2.5 rounded-xl font-black text-xs text-white bg-[#07221A] hover:bg-[#134336] flex items-center gap-1.5 transition-colors cursor-pointer shadow-md disabled:opacity-50"
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

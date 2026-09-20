import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import jsQR from 'jsqr';
import { 
  ChevronLeft, 
  Zap, 
  ZapOff, 
  Camera, 
  Radio, 
  ShieldCheck, 
  Wifi, 
  RefreshCw,
  QrCode,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { motion } from 'motion/react';

export const ScanProduct: React.FC = () => {
  const navigate = useNavigate();
  const { handleScanSuccess, productsMap } = useApp();

  const [flashlightOn, setFlashlightOn] = useState<boolean>(false);
  const [manualCode, setManualCode] = useState<string>('');
  const [showManualInput, setShowManualInput] = useState<boolean>(false);
  const [cameraActive, setCameraActive] = useState<boolean>(false);
  const [scanStatusText, setScanStatusText] = useState<string>('Scanning...');
  
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationFrameId = useRef<number | null>(null);

  // Attempt to start real device camera
  useEffect(() => {
    let active = true;

    async function startCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' }
        });
        if (!active) return;
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.setAttribute('playsinline', 'true');
          await videoRef.current.play();
          setCameraActive(true);
        }
      } catch (err) {
        console.log('Camera not available, falling back to simulated scan viewfinder:', err);
        setCameraActive(false);
      }
    }

    startCamera();

    return () => {
      active = false;
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, []);

  // Frame processing loop for QR scanner
  useEffect(() => {
    if (!cameraActive) return;

    const scanFrame = () => {
      if (videoRef.current && canvasRef.current && videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA) {
        const video = videoRef.current;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');

        if (ctx) {
          canvas.height = video.videoHeight;
          canvas.width = video.videoWidth;
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const code = jsQR(imageData.data, imageData.width, imageData.height, {
            inversionAttempts: 'dontInvert',
          });

          if (code && code.data) {
            triggerSuccess(code.data);
            return;
          }
        }
      }
      animationFrameId.current = requestAnimationFrame(scanFrame);
    };

    animationFrameId.current = requestAnimationFrame(scanFrame);

    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, [cameraActive]);

  const triggerSuccess = (detectedCode: string) => {
    setScanStatusText('Code Verified!');
    handleScanSuccess(detectedCode);
    setTimeout(() => {
      navigate(`/products/${detectedCode}`);
    }, 600);
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualCode.trim()) return;
    triggerSuccess(manualCode.trim());
  };

  return (
    <div className="space-y-4 pb-6 select-none flex flex-col items-center">
      
      {/* Top Header Bar (matching Screen 6) */}
      <div className="w-full flex items-center justify-between pt-1">
        <button
          onClick={() => navigate(-1)}
          className="w-10 h-10 rounded-2xl bg-white border border-slate-200 text-[#082A52] flex items-center justify-center shadow-xs hover:bg-slate-50 transition-colors cursor-pointer"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>

        <h1 className="text-base font-black text-[#082A52] tracking-tight">
          Scan QR / RFID
        </h1>

        <button
          onClick={() => setFlashlightOn(!flashlightOn)}
          className={`w-10 h-10 rounded-2xl border flex items-center justify-center shadow-xs transition-colors cursor-pointer ${
            flashlightOn 
              ? 'bg-amber-400 text-amber-950 border-amber-500 shadow-md shadow-amber-400/30' 
              : 'bg-white border-slate-200 text-[#082A52] hover:bg-slate-50'
          }`}
        >
          {flashlightOn ? <Zap className="w-5 h-5 fill-amber-950" /> : <Zap className="w-5 h-5" />}
        </button>
      </div>

      {/* Subtitle */}
      <p className="text-xs text-slate-500 font-semibold text-center -mt-1">
        Position the QR code or RFID tag within the frame
      </p>

      {/* Central Viewfinder Card (matching Screen 6) */}
      <div className="relative w-full max-w-sm aspect-square rounded-3xl bg-[#021830] border-2 border-[#1267D6]/30 overflow-hidden shadow-2xl flex items-center justify-center p-4">
        
        {/* Real camera video background or simulated produce crate */}
        {cameraActive ? (
          <video
            ref={videoRef}
            className="absolute inset-0 w-full h-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 bg-[#061e38] flex flex-col items-center justify-center p-6 text-center">
            {/* Visual simulation of produce crate with QR tag */}
            <div className="relative w-48 h-40 rounded-2xl bg-gradient-to-tr from-amber-950 to-amber-900 border border-amber-800 p-3 flex flex-col justify-between shadow-lg">
              <div className="flex items-center justify-between">
                <span className="text-[9px] font-black text-amber-300 uppercase tracking-wider">
                  FRX PRODUCE
                </span>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              </div>
              <div className="w-16 h-16 bg-white rounded-xl mx-auto p-1 shadow-md flex items-center justify-center">
                <QrCode className="w-12 h-12 text-[#082A52]" />
              </div>
              <span className="text-[10px] font-bold text-white text-center">
                Batch: FRX20250316001
              </span>
            </div>
          </div>
        )}

        {/* Hidden processing canvas */}
        <canvas ref={canvasRef} className="hidden" />

        {/* Target Frame Corner Brackets [ ] (Screen 6 glowing emerald) */}
        <div className="relative w-56 h-56 pointer-events-none z-10 flex flex-col justify-between">
          {/* Top corners */}
          <div className="flex justify-between">
            <div className="w-8 h-8 border-t-4 border-l-4 border-emerald-400 rounded-tl-xl shadow-[0_0_12px_#34d399]" />
            <div className="w-8 h-8 border-t-4 border-r-4 border-emerald-400 rounded-tr-xl shadow-[0_0_12px_#34d399]" />
          </div>

          {/* Glowing Animated Laser Scanning Bar */}
          <motion.div
            animate={{ y: [-70, 70, -70] }}
            transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
            className="w-full h-0.5 bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_15px_#10b981]"
          />

          {/* Bottom corners */}
          <div className="flex justify-between">
            <div className="w-8 h-8 border-b-4 border-l-4 border-emerald-400 rounded-bl-xl shadow-[0_0_12px_#34d399]" />
            <div className="w-8 h-8 border-b-4 border-r-4 border-emerald-400 rounded-tr-xl shadow-[0_0_12px_#34d399]" />
          </div>
        </div>

        {/* Scanning... indicator at bottom of viewfinder */}
        <div className="absolute bottom-4 z-20 px-4 py-1.5 rounded-full bg-black/60 backdrop-blur-md border border-white/10 flex items-center gap-2">
          <RefreshCw className="w-3.5 h-3.5 text-emerald-400 animate-spin" />
          <span className="text-xs font-black text-emerald-400 tracking-wide">
            {scanStatusText}
          </span>
        </div>
      </div>

      {/* 3 Feature Badges (matching Screen 6) */}
      <div className="w-full max-w-sm grid grid-cols-3 gap-2 text-center">
        <div className="p-2.5 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex flex-col items-center">
          <Zap className="w-4 h-4 text-[#1267D6] mb-1" />
          <span className="text-[10px] font-black text-[#082A52]">Auto Detect</span>
          <span className="text-[8px] font-bold text-slate-400">QR or RFID</span>
        </div>

        <div className="p-2.5 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex flex-col items-center">
          <Wifi className="w-4 h-4 text-[#19A463] mb-1" />
          <span className="text-[10px] font-black text-[#082A52]">Real-time</span>
          <span className="text-[8px] font-bold text-slate-400">Connection</span>
        </div>

        <div className="p-2.5 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex flex-col items-center">
          <ShieldCheck className="w-4 h-4 text-purple-600 mb-1" />
          <span className="text-[10px] font-black text-[#082A52]">Secure</span>
          <span className="text-[8px] font-bold text-slate-400">Data Access</span>
        </div>
      </div>

      {/* Caption text (matching Screen 6) */}
      <p className="text-[11px] text-slate-400 font-bold text-center">
        Keep the code steady for best results
      </p>

      {/* Instant Demo Scan Action */}
      <div className="w-full max-w-sm space-y-2 pt-1">
        <button
          onClick={() => triggerSuccess('YGS-FD-000124')}
          className="w-full h-12 rounded-2xl font-black text-xs text-white bg-gradient-to-r from-[#1267D6] to-[#2196F3] shadow-lg shadow-sky-500/20 flex items-center justify-center gap-2 active:scale-[0.98] transition-all cursor-pointer"
        >
          <Sparkles className="w-4 h-4 text-sky-200" />
          <span>SIMULATE SCAN (Organic Lettuce)</span>
        </button>

        <button
          onClick={() => setShowManualInput(!showManualInput)}
          className="w-full text-center text-xs font-bold text-[#1267D6] hover:underline cursor-pointer py-1"
        >
          {showManualInput ? 'Hide manual code entry' : 'Or enter batch / tag ID manually'}
        </button>

        {showManualInput && (
          <form onSubmit={handleManualSubmit} className="flex gap-2">
            <input
              type="text"
              value={manualCode}
              onChange={e => setManualCode(e.target.value)}
              placeholder="e.g. YGS-FD-000124 or FRX20250316001"
              className="flex-1 bg-white px-3 py-2 rounded-xl text-xs border border-slate-300 font-mono text-[#082A52] outline-none focus:border-[#1267D6]"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-[#082A52] text-white rounded-xl text-xs font-bold"
            >
              Verify
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

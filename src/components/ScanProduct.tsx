import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import jsQR from 'jsqr';
import { 
  ChevronLeft, 
  Zap, 
  Camera, 
  Radio, 
  ShieldCheck, 
  Wifi, 
  RefreshCw,
  QrCode,
  Sparkles
} from 'lucide-react';
import { motion } from 'motion/react';

export const ScanProduct: React.FC = () => {
  const navigate = useNavigate();
  const { handleScanSuccess } = useApp();

  const [flashlightOn, setFlashlightOn] = useState<boolean>(false);
  const [manualCode, setManualCode] = useState<string>('');
  const [showManualInput, setShowManualInput] = useState<boolean>(false);
  const [cameraActive, setCameraActive] = useState<boolean>(false);
  const [scanStatusText, setScanStatusText] = useState<string>('SCANNING...');
  
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
    setScanStatusText('CODE VERIFIED!');
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
    <div className="space-y-5 pb-8 select-none flex flex-col items-center text-[#edeff2]">
      
      {/* Top Header Bar */}
      <div className="w-full flex items-center justify-between pt-1">
        <button
          onClick={() => navigate(-1)}
          className="w-10 h-10 rounded-2xl bg-white/5 border border-white/10 text-white flex items-center justify-center shadow-xs hover:bg-white/10 transition-colors cursor-pointer"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <h1 className="text-sm font-black tracking-widest text-slate-400 uppercase font-mono">
          Scan QR / RFID
        </h1>

        <button
          onClick={() => setFlashlightOn(!flashlightOn)}
          className={`w-10 h-10 rounded-2xl border flex items-center justify-center shadow-xs transition-all cursor-pointer ${
            flashlightOn 
              ? 'bg-amber-400 text-[#0b0b0c] border-amber-500 shadow-md shadow-amber-400/30' 
              : 'bg-white/5 border-white/10 text-white hover:bg-white/10'
          }`}
        >
          <Zap className={`w-4 h-4 ${flashlightOn ? 'fill-amber-950 stroke-amber-950' : ''}`} />
        </button>
      </div>

      {/* Subtitle */}
      <p className="text-xs text-slate-400 font-semibold text-center -mt-1">
        Position the QR code or RFID tag within the frame
      </p>

      {/* Central Viewfinder Card */}
      <div className="relative w-full max-w-sm aspect-square rounded-3xl bg-[#141416] border border-white/5 overflow-hidden shadow-2xl flex items-center justify-center p-4">
        
        {/* Real camera video background or simulated produce crate */}
        {cameraActive ? (
          <video
            ref={videoRef}
            className="absolute inset-0 w-full h-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 bg-[#0d0d0f] flex flex-col items-center justify-center p-6 text-center">
            {/* Visual simulation of produce crate with QR tag */}
            <div className="relative w-48 h-40 rounded-2xl bg-gradient-to-tr from-[#1267D6]/10 to-[#21c55d]/10 border border-white/5 p-4 flex flex-col justify-between shadow-lg">
              <div className="flex items-center justify-between">
                <span className="text-[8px] font-mono font-black text-emerald-400 uppercase tracking-widest">
                  FRX PRODUCE
                </span>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              </div>
              <div className="w-14 h-14 bg-[#0b0b0c] rounded-xl mx-auto p-1 shadow-md flex items-center justify-center border border-white/5">
                <QrCode className="w-9 h-9 text-[#21c55d]" />
              </div>
              <span className="text-[9px] font-mono font-extrabold text-slate-500 text-center uppercase tracking-wider">
                FRX20250316001
              </span>
            </div>
          </div>
        )}

        {/* Hidden processing canvas */}
        <canvas ref={canvasRef} className="hidden" />

        {/* Target Frame Corner Brackets [ ] */}
        <div className="relative w-56 h-56 pointer-events-none z-10 flex flex-col justify-between">
          {/* Top corners */}
          <div className="flex justify-between">
            <div className="w-8 h-8 border-t-4 border-l-4 border-[#21c55d] rounded-tl-xl shadow-[0_0_12px_rgba(33,197,93,0.4)]" />
            <div className="w-8 h-8 border-t-4 border-r-4 border-[#21c55d] rounded-tr-xl shadow-[0_0_12px_rgba(33,197,93,0.4)]" />
          </div>

          {/* Glowing Animated Laser Scanning Bar */}
          <motion.div
            animate={{ y: [-80, 80, -80] }}
            transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
            className="w-full h-0.5 bg-gradient-to-r from-transparent via-[#21c55d] to-transparent shadow-[0_0_15px_#21c55d]"
          />

          {/* Bottom corners */}
          <div className="flex justify-between">
            <div className="w-8 h-8 border-b-4 border-l-4 border-[#21c55d] rounded-bl-xl shadow-[0_0_12px_rgba(33,197,93,0.4)]" />
            <div className="w-8 h-8 border-b-4 border-r-4 border-[#21c55d] rounded-br-xl shadow-[0_0_12px_rgba(33,197,93,0.4)]" />
          </div>
        </div>

        {/* Scanning... indicator at bottom of viewfinder */}
        <div className="absolute bottom-4 z-20 px-4 py-1.5 rounded-full bg-[#0b0b0c]/80 backdrop-blur-md border border-white/5 flex items-center gap-2">
          <RefreshCw className="w-3.5 h-3.5 text-[#21c55d] animate-spin" />
          <span className="text-[10px] font-mono font-black text-[#21c55d] tracking-widest">
            {scanStatusText}
          </span>
        </div>
      </div>

      {/* 3 Feature Badges */}
      <div className="w-full max-w-sm grid grid-cols-3 gap-2 text-center">
        <div className="p-3 rounded-2xl bg-[#141416] border border-white/5 flex flex-col items-center">
          <QrCode className="w-4.5 h-4.5 text-[#38bdf8] mb-1.5" />
          <span className="text-[9px] font-mono font-black text-white uppercase tracking-wider">Auto Detect</span>
          <span className="text-[8px] font-bold text-slate-500 mt-0.5">QR or RFID</span>
        </div>

        <div className="p-3 rounded-2xl bg-[#141416] border border-white/5 flex flex-col items-center">
          <Radio className="w-4.5 h-4.5 text-[#21c55d] mb-1.5" />
          <span className="text-[9px] font-mono font-black text-white uppercase tracking-wider">Real-time</span>
          <span className="text-[8px] font-bold text-slate-500 mt-0.5">Sensing Data</span>
        </div>

        <div className="p-3 rounded-2xl bg-[#141416] border border-white/5 flex flex-col items-center">
          <ShieldCheck className="w-4.5 h-4.5 text-purple-400 mb-1.5" />
          <span className="text-[9px] font-mono font-black text-white uppercase tracking-wider">Secure</span>
          <span className="text-[8px] font-bold text-slate-500 mt-0.5">Cloud Vault</span>
        </div>
      </div>

      {/* Caption text */}
      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider text-center">
        Keep the code steady for best results
      </p>

      {/* Instant Demo Scan Action */}
      <div className="w-full max-w-sm space-y-3 pt-1">
        <button
          onClick={() => triggerSuccess('YGS-FD-000124')}
          className="w-full h-12 rounded-2xl font-black text-xs text-[#0b0b0c] bg-[#21c55d] shadow-lg shadow-emerald-500/10 active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          <Sparkles className="w-4 h-4 text-emerald-950" />
          <span>SIMULATE SCAN (Organic Lettuce)</span>
        </button>

        <button
          onClick={() => setShowManualInput(!showManualInput)}
          className="w-full text-center text-xs font-bold text-[#21c55d] hover:underline cursor-pointer py-1"
        >
          {showManualInput ? 'Hide manual code entry' : 'Or enter batch / tag ID manually'}
        </button>

        {showManualInput && (
          <form onSubmit={handleManualSubmit} className="flex gap-2">
            <input
              type="text"
              value={manualCode}
              onChange={e => setManualCode(e.target.value)}
              placeholder="e.g. YGS-FD-000124"
              className="flex-1 bg-white/5 px-3 py-2.5 rounded-xl text-xs border border-white/5 font-mono text-white outline-none focus:border-[#21c55d] placeholder:text-slate-600"
            />
            <button
              type="submit"
              className="px-4 py-2.5 bg-[#21c55d] text-[#0b0b0c] rounded-xl text-xs font-black cursor-pointer"
            >
              Verify
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  motion,
  AnimatePresence,
  useMotionValue,
  useSpring,
  useTransform
} from 'motion/react';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  AlertCircle,
  QrCode,
  Shield,
  Camera,
  X,
  Leaf,
  CheckCircle2,
  Sparkles
} from 'lucide-react';
import jsqr from 'jsqr';
import { Logo } from '../components/common/Logo';
import { useAuth } from '../context/AuthContext';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login, loginWithProductId, authError, clearAuthError } = useAuth();

  const [loginMode, setLoginMode] = useState<'user' | 'admin'>('user');

  // User product portal state
  const [productId, setProductId] = useState('COLD_DRINKS');
  const [focusedField, setFocusedField] = useState<string | null>(null);

  // Interactive 3D Card Tilt & Spotlight Motion Values
  const cardRef = useRef<HTMLDivElement | null>(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const smoothX = useSpring(mouseX, { stiffness: 220, damping: 25 });
  const smoothY = useSpring(mouseY, { stiffness: 220, damping: 25 });

  const rotateX = useTransform(smoothY, [-0.5, 0.5], [4, -4]);
  const rotateY = useTransform(smoothX, [-0.5, 0.5], [-4, 4]);

  const handleCardMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const xPct = (e.clientX - rect.left) / rect.width - 0.5;
    const yPct = (e.clientY - rect.top) / rect.height - 0.5;
    mouseX.set(xPct);
    mouseY.set(yPct);
  };

  const handleCardMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  // QR Code Scanner state
  const [showScanner, setShowScanner] = useState(false);
  const [scannerError, setScannerError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  // Admin login state
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const startScanner = async () => {
    setScannerError(null);
    setShowScanner(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.setAttribute('playsinline', 'true');
        await videoRef.current.play();
        animationFrameRef.current = requestAnimationFrame(tickScanner);
      }
    } catch (err: any) {
      console.warn('Camera access restriction (Permission denied):', err?.message || err);
      setScannerError('Camera access denied or unavailable. Please enter Product Tag ID manually.');
    }
  };

  const stopScanner = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setShowScanner(false);
  };

  const lastScanTimeRef = useRef<number>(0);

  const tickScanner = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const now = performance.now();
    if (now - lastScanTimeRef.current >= 200) {
      lastScanTimeRef.current = now;
      const video = videoRef.current;
      const canvas = canvasRef.current;

      if (video.readyState === video.HAVE_ENOUGH_DATA && video.videoWidth > 0) {
        const scale = Math.min(1, 480 / video.videoWidth);
        canvas.width = Math.floor(video.videoWidth * scale);
        canvas.height = Math.floor(video.videoHeight * scale);
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        if (ctx) {
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const code = jsqr(imageData.data, imageData.width, imageData.height);

          if (code) {
            const scannedText = code.data.trim();
            setProductId(scannedText);
            stopScanner();
            handleScannedLogin(scannedText);
            return;
          }
        }
      }
    }
    animationFrameRef.current = requestAnimationFrame(tickScanner);
  };

  const handleScannedLogin = async (tagId: string) => {
    setLocalError(null);
    clearAuthError();
    setIsSubmitting(true);
    try {
      await loginWithProductId(tagId);
      navigate('/dashboard');
    } catch (err: any) {
      setLocalError(err.message || `Scanned tag ID "${tagId}" is invalid or expired.`);
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    return () => {
      stopScanner();
    };
  }, []);

  const handleUserProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    clearAuthError();

    if (!productId.trim()) {
      setLocalError('Please enter a valid unique product tag ID (e.g. COLD_DRINKS or MEAT).');
      return;
    }

    setIsSubmitting(true);
    try {
      await loginWithProductId(productId.trim());
      navigate('/dashboard');
    } catch (err: any) {
      setLocalError(err.message || 'Failed to authenticate product ID. Please check the Tag ID.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAdminSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    clearAuthError();

    if (!adminEmail.trim() || !adminPassword.trim()) {
      setLocalError('Please enter both your administrator email and password.');
      return;
    }

    setIsSubmitting(true);
    try {
      await login(adminEmail.trim(), adminPassword);
      navigate('/dashboard');
    } catch (err: any) {
      setLocalError(err.message || 'Failed to sign in as Administrator. Please check your credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#EEFAF3] via-[#E4F6EC] to-[#F5FCF8] text-[#07221A] font-['DM_Sans',sans-serif] flex flex-col justify-center items-center px-4 py-8 relative overflow-hidden select-none">
      {/* =====================================================================
          CORNER-TO-CORNER ANIMATED BOTANICAL AMBIENCE & FLOATING DEW DROPS
         ===================================================================== */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        {/* Corner Animated Botanical Rings (Top-Left, Top-Right, Bottom-Left, Bottom-Right) */}
        <motion.div
          animate={{ rotate: 360, scale: [1, 1.07, 1] }}
          transition={{
            rotate: { duration: 48, repeat: Infinity, ease: 'linear' },
            scale: { duration: 8, repeat: Infinity, ease: 'easeInOut' }
          }}
          className="absolute -top-28 -left-28 w-80 h-80 rounded-full border border-emerald-500/20 flex items-center justify-center"
        >
          <div className="w-56 h-56 rounded-full border border-dashed border-emerald-500/25" />
        </motion.div>

        <motion.div
          animate={{ rotate: -360, scale: [1, 1.08, 1] }}
          transition={{
            rotate: { duration: 54, repeat: Infinity, ease: 'linear' },
            scale: { duration: 10, repeat: Infinity, ease: 'easeInOut' }
          }}
          className="absolute -top-24 -right-24 w-72 h-72 rounded-full border border-teal-500/20 flex items-center justify-center"
        >
          <div className="w-48 h-48 rounded-full border border-dashed border-lime-500/25" />
        </motion.div>

        <motion.div
          animate={{ rotate: -360, scale: [1, 1.06, 1] }}
          transition={{
            rotate: { duration: 50, repeat: Infinity, ease: 'linear' },
            scale: { duration: 9, repeat: Infinity, ease: 'easeInOut' }
          }}
          className="absolute -bottom-28 -left-28 w-76 h-76 rounded-full border border-lime-500/20 flex items-center justify-center"
        >
          <div className="w-52 h-52 rounded-full border border-dashed border-emerald-500/25" />
        </motion.div>

        <motion.div
          animate={{ rotate: 360, scale: [1, 1.09, 1] }}
          transition={{
            rotate: { duration: 44, repeat: Infinity, ease: 'linear' },
            scale: { duration: 7.5, repeat: Infinity, ease: 'easeInOut' }
          }}
          className="absolute -bottom-24 -right-24 w-80 h-80 rounded-full border border-emerald-500/20 flex items-center justify-center"
        >
          <div className="w-56 h-56 rounded-full border border-dashed border-teal-500/25" />
        </motion.div>

        {/* Soft Breathing Chlorophyll Aurora Blobs */}
        <motion.div
          animate={{
            x: [0, 45, -25, 0],
            y: [0, -35, 25, 0],
            scale: [1, 1.12, 0.95, 1]
          }}
          transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute -top-32 -left-24 w-[520px] h-[520px] rounded-full blur-[105px] opacity-60"
          style={{
            background:
              'radial-gradient(circle, rgba(16, 185, 129, 0.32) 0%, rgba(52, 211, 153, 0.1) 65%, transparent 100%)'
          }}
        />
        <motion.div
          animate={{
            x: [0, -45, 30, 0],
            y: [0, 40, -30, 0],
            scale: [1, 0.94, 1.1, 1]
          }}
          transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute top-1/4 -right-32 w-[560px] h-[560px] rounded-full blur-[115px] opacity-50"
          style={{
            background:
              'radial-gradient(circle, rgba(132, 204, 22, 0.28) 0%, rgba(16, 185, 129, 0.08) 70%, transparent 100%)'
          }}
        />
        <motion.div
          animate={{
            x: [0, 30, -30, 0],
            y: [0, -30, 20, 0]
          }}
          transition={{ duration: 13, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute -bottom-36 left-1/3 w-[500px] h-[500px] rounded-full blur-[105px] opacity-45"
          style={{
            background:
              'radial-gradient(circle, rgba(20, 184, 166, 0.26) 0%, transparent 70%)'
          }}
        />

        {/* Crisp Botanical Dot Matrix */}
        <div
          className="absolute inset-0 opacity-[0.22]"
          style={{
            backgroundImage: 'radial-gradient(rgba(7, 34, 26, 0.15) 1px, transparent 1px)',
            backgroundSize: '26px 26px'
          }}
        />

        {/* Floating Dew Micro-Orbs & Drifting Botanical Leaves Across All 4 Quadrants */}
        {[
          { left: '8%', top: '16%', size: 11, delay: 0, duration: 6.5 },
          { left: '18%', top: '48%', size: 8, delay: 1.4, duration: 7.5 },
          { left: '12%', top: '82%', size: 14, delay: 0.8, duration: 8.5 },
          { left: '88%', top: '15%', size: 12, delay: 1.9, duration: 7 },
          { left: '82%', top: '52%', size: 9, delay: 0.4, duration: 6 },
          { left: '89%', top: '80%', size: 13, delay: 1.1, duration: 8.2 },
          { left: '46%', top: '10%', size: 8, delay: 2.3, duration: 7.2 },
          { left: '54%', top: '90%', size: 10, delay: 1.5, duration: 6.8 }
        ].map((orb, i) => (
          <motion.div
            key={`orb-${i}`}
            animate={{
              y: [0, -26, 0],
              x: [0, i % 2 === 0 ? 12 : -12, 0],
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.75, 0.3]
            }}
            transition={{
              duration: orb.duration,
              delay: orb.delay,
              repeat: Infinity,
              ease: 'easeInOut'
            }}
            style={{
              left: orb.left,
              top: orb.top,
              width: orb.size,
              height: orb.size
            }}
            className="absolute rounded-full bg-gradient-to-br from-emerald-400 to-teal-300 shadow-[0_0_18px_rgba(16,185,129,0.6)]"
          />
        ))}

        {/* Floating Botanical Leaf Silhouettes */}
        {[
          { left: '15%', top: '28%', rotate: -18, delay: 0.2, duration: 9 },
          { left: '84%', top: '30%', rotate: 24, delay: 1.6, duration: 10.5 },
          { left: '20%', top: '70%', rotate: 15, delay: 0.9, duration: 8.8 },
          { left: '79%', top: '68%', rotate: -22, delay: 2.1, duration: 9.5 }
        ].map((leaf, i) => (
          <motion.div
            key={`leaf-${i}`}
            animate={{
              y: [0, -18, 0],
              rotate: [leaf.rotate, leaf.rotate + 14, leaf.rotate],
              opacity: [0.22, 0.48, 0.22]
            }}
            transition={{
              duration: leaf.duration,
              delay: leaf.delay,
              repeat: Infinity,
              ease: 'easeInOut'
            }}
            style={{ left: leaf.left, top: leaf.top }}
            className="absolute text-emerald-600/40"
          >
            <Leaf className="w-6 h-6" />
          </motion.div>
        ))}
      </div>

      {/* =====================================================================
          CENTERED INTERACTIVE 3D-TILT LOGIN PORTAL CARD
         ===================================================================== */}
      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
        style={{ perspective: 1200 }}
        className="w-full max-w-md space-y-6 relative z-10"
      >
        {/* Brand Logo & Animated Welcome Headline */}
        <div className="text-center space-y-2">
          <motion.div
            initial={{ scale: 0.85, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 320, damping: 20, delay: 0.05 }}
            whileHover={{ scale: 1.04, rotate: [0, -2, 2, 0] }}
            className="flex justify-center pb-1"
          >
            <Logo size="lg" variant="light" showTagline={true} linkTo="/" />
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.12 }}
            className="text-3xl font-extrabold text-[#07221A] font-['Plus_Jakarta_Sans',sans-serif] tracking-tight"
          >
            Welcome to{' '}
            <span className="bg-gradient-to-r from-[#059669] via-[#10B981] to-[#16A34A] bg-clip-text text-transparent">
              FreshNex
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.18 }}
            className="text-xs text-[#3B5E52] font-medium max-w-xs mx-auto leading-relaxed"
          >
            Select User or Admin portal to monitor live food freshness and quality sensors
          </motion.p>
        </div>

        {/* Main Glassmorphic Fresh Login Card with 3D Tilt & Animated Corner Brackets */}
        <motion.div
          ref={cardRef}
          onMouseMove={handleCardMouseMove}
          onMouseLeave={handleCardMouseLeave}
          style={{ rotateX, rotateY }}
          className="bg-white/95 backdrop-blur-2xl p-6 sm:p-8 rounded-[32px] shadow-[0_24px_60px_-15px_rgba(7,34,26,0.14)] border border-emerald-950/10 space-y-6 relative overflow-hidden"
        >
          {/* Animated Shimmer Top Fresh Leaf Bar */}
          <motion.div
            animate={{ backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'] }}
            transition={{ duration: 5, repeat: Infinity, ease: 'linear' }}
            style={{ backgroundSize: '200% 200%' }}
            className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-emerald-500 via-lime-400 to-teal-500"
          />

          {/* Subtle Animated Corner Accents inside the Card */}
          <motion.div
            animate={{ opacity: [0.3, 0.8, 0.3], scale: [0.96, 1.04, 0.96] }}
            transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
            className="w-4 h-4 border-t-2 border-l-2 border-emerald-500/40 rounded-tl-lg absolute top-3.5 left-3.5 pointer-events-none"
          />
          <motion.div
            animate={{ opacity: [0.3, 0.8, 0.3], scale: [0.96, 1.04, 0.96] }}
            transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut', delay: 0.8 }}
            className="w-4 h-4 border-t-2 border-r-2 border-emerald-500/40 rounded-tr-lg absolute top-3.5 right-3.5 pointer-events-none"
          />
          <motion.div
            animate={{ opacity: [0.3, 0.8, 0.3], scale: [0.96, 1.04, 0.96] }}
            transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut', delay: 1.6 }}
            className="w-4 h-4 border-b-2 border-l-2 border-emerald-500/40 rounded-bl-lg absolute bottom-3.5 left-3.5 pointer-events-none"
          />
          <motion.div
            animate={{ opacity: [0.3, 0.8, 0.3], scale: [0.96, 1.04, 0.96] }}
            transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut', delay: 2.4 }}
            className="w-4 h-4 border-b-2 border-r-2 border-emerald-500/40 rounded-br-lg absolute bottom-3.5 right-3.5 pointer-events-none"
          />

          {/* Segmented Mode Switcher with Sliding Spring Pill (`layoutId`) */}
          <div className="grid grid-cols-2 p-1.5 rounded-2xl bg-[#EDF7F2] border border-emerald-950/8 relative">
            <button
              type="button"
              onClick={() => {
                setLoginMode('user');
                setLocalError(null);
                clearAuthError();
              }}
              className={`relative z-10 py-3 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center justify-center gap-2 whitespace-nowrap ${
                loginMode === 'user' ? 'text-white' : 'text-[#3B5E52] hover:text-[#07221A]'
              }`}
            >
              {loginMode === 'user' && (
                <motion.div
                  layoutId="activeLoginModeTab"
                  transition={{ type: 'spring', stiffness: 380, damping: 28 }}
                  className="absolute inset-0 rounded-xl bg-gradient-to-r from-[#059669] to-[#10B981] shadow-md shadow-emerald-600/25 -z-10"
                />
              )}
              <motion.span
                animate={loginMode === 'user' ? { rotate: [0, -8, 8, 0] } : {}}
                transition={{ duration: 0.4 }}
              >
                <QrCode className="w-3.5 h-3.5" />
              </motion.span>
              <span>User Login</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setLoginMode('admin');
                setLocalError(null);
                clearAuthError();
              }}
              className={`relative z-10 py-3 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center justify-center gap-2 whitespace-nowrap ${
                loginMode === 'admin' ? 'text-white' : 'text-[#3B5E52] hover:text-[#07221A]'
              }`}
            >
              {loginMode === 'admin' && (
                <motion.div
                  layoutId="activeLoginModeTab"
                  transition={{ type: 'spring', stiffness: 380, damping: 28 }}
                  className="absolute inset-0 rounded-xl bg-gradient-to-r from-[#059669] to-[#10B981] shadow-md shadow-emerald-600/25 -z-10"
                />
              )}
              <motion.span
                animate={loginMode === 'admin' ? { scale: [1, 1.2, 1] } : {}}
                transition={{ duration: 0.4 }}
              >
                <Shield className="w-3.5 h-3.5" />
              </motion.span>
              <span>Admin Login</span>
            </button>
          </div>

          {/* Error Banner */}
          <AnimatePresence>
            {(localError || authError) && (
              <motion.div
                initial={{ opacity: 0, y: -8, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.96 }}
                className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 flex items-start gap-2.5 text-rose-700 text-xs font-semibold"
              >
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{localError || authError}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Animated Forms */}
          <AnimatePresence mode="wait">
            {loginMode === 'user' ? (
              <motion.form
                key="user-form"
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 16 }}
                transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                onSubmit={handleUserProductSubmit}
                className="space-y-4"
              >
                {/* Product Tag ID Input */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label
                      htmlFor="product-tag-input"
                      className="text-xs font-bold text-[#07221A] block"
                    >
                      Unique Product Tag ID
                    </label>
                    <motion.button
                      whileHover={{ scale: 1.05, y: -1 }}
                      whileTap={{ scale: 0.95 }}
                      type="button"
                      onClick={startScanner}
                      className="text-xs font-bold text-emerald-800 hover:text-emerald-950 flex items-center gap-1.5 cursor-pointer bg-emerald-50 hover:bg-emerald-100/90 px-3 py-1.5 rounded-xl border border-emerald-500/30 transition-all shadow-2xs"
                    >
                      <motion.span
                        animate={{ scale: [1, 1.15, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        <Camera className="w-3.5 h-3.5 text-emerald-600" />
                      </motion.span>
                      <span>Scan QR Code</span>
                    </motion.button>
                  </div>

                  <motion.div
                    animate={
                      focusedField === 'tag'
                        ? { scale: 1.01 }
                        : { scale: 1 }
                    }
                    transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                    className="relative"
                  >
                    <motion.span
                      animate={
                        focusedField === 'tag'
                          ? { rotate: [0, -10, 10, 0], scale: 1.1 }
                          : { rotate: 0, scale: 1 }
                      }
                      className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none text-emerald-600"
                    >
                      <QrCode className="w-4 h-4" />
                    </motion.span>
                    <input
                      id="product-tag-input"
                      type="text"
                      required
                      value={productId}
                      onFocus={() => setFocusedField('tag')}
                      onBlur={() => setFocusedField(null)}
                      onChange={(e) => setProductId(e.target.value)}
                      placeholder="e.g. COLD_DRINKS or MEAT"
                      className="w-full pl-11 pr-4 py-3.5 bg-[#F4FBF7] text-sm font-bold text-[#07221A] placeholder-[#6B8A7E] rounded-2xl border border-emerald-950/12 focus:outline-none focus:bg-white focus:border-emerald-600 focus:ring-4 focus:ring-emerald-500/15 transition-all uppercase font-mono tracking-wider"
                    />
                  </motion.div>

                  {/* Interactive One-Tap Demo Tags (Without Subtitle Spans) */}
                  <div className="pt-1 space-y-1.5">
                    <span className="text-[11px] font-semibold text-[#4A6B5F] block">
                      Quick Demo Tags (Click to select):
                    </span>
                    <div className="grid grid-cols-2 gap-2.5">
                      <motion.button
                        whileHover={{ y: -2, scale: 1.02 }}
                        whileTap={{ scale: 0.97 }}
                        type="button"
                        onClick={() => setProductId('COLD_DRINKS')}
                        className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between relative overflow-hidden ${
                          productId.trim().toUpperCase() === 'COLD_DRINKS'
                            ? 'bg-emerald-50/95 border-emerald-500/60 text-[#07221A] shadow-xs'
                            : 'bg-[#F6FBF8] border-emerald-950/8 text-[#3B5E52] hover:bg-emerald-50/40'
                        }`}
                      >
                        <div>
                          <span className="font-mono text-xs font-bold block text-[#07221A]">
                            COLD_DRINKS
                          </span>
                        </div>
                        <motion.span
                          animate={
                            productId.trim().toUpperCase() === 'COLD_DRINKS'
                              ? { scale: [0.8, 1.15, 1], rotate: [0, 10, 0] }
                              : { scale: 1 }
                          }
                        >
                          <CheckCircle2
                            className={`w-4 h-4 ${
                              productId.trim().toUpperCase() === 'COLD_DRINKS'
                                ? 'text-emerald-600 opacity-100'
                                : 'opacity-20'
                            }`}
                          />
                        </motion.span>
                      </motion.button>

                      <motion.button
                        whileHover={{ y: -2, scale: 1.02 }}
                        whileTap={{ scale: 0.97 }}
                        type="button"
                        onClick={() => setProductId('MEAT')}
                        className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between relative overflow-hidden ${
                          productId.trim().toUpperCase() === 'MEAT'
                            ? 'bg-emerald-50/95 border-emerald-500/60 text-[#07221A] shadow-xs'
                            : 'bg-[#F6FBF8] border-emerald-950/8 text-[#3B5E52] hover:bg-emerald-50/40'
                        }`}
                      >
                        <div>
                          <span className="font-mono text-xs font-bold block text-[#07221A]">
                            MEAT
                          </span>
                        </div>
                        <motion.span
                          animate={
                            productId.trim().toUpperCase() === 'MEAT'
                              ? { scale: [0.8, 1.15, 1], rotate: [0, 10, 0] }
                              : { scale: 1 }
                          }
                        >
                          <CheckCircle2
                            className={`w-4 h-4 ${
                              productId.trim().toUpperCase() === 'MEAT'
                                ? 'text-emerald-600 opacity-100'
                                : 'opacity-20'
                            }`}
                          />
                        </motion.span>
                      </motion.button>
                    </div>
                  </div>
                </div>

                {/* Remember Me Checkbox */}
                <div className="flex items-center justify-between text-xs pt-1">
                  <label className="flex items-center gap-2 cursor-pointer text-[#3B5E52] font-medium group">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-4 h-4 rounded border-emerald-300 text-emerald-600 focus:ring-0 cursor-pointer accent-emerald-600 transition-transform group-hover:scale-110"
                    />
                    <span className="group-hover:text-[#07221A] transition-colors">Remember Me</span>
                  </label>
                </div>

                {/* Submit Button with Continuous Shimmer Effect */}
                <div className="pt-2">
                  <motion.button
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-4 px-6 rounded-2xl font-bold text-sm text-white bg-gradient-to-r from-[#059669] via-[#10B981] to-[#0D9488] hover:from-[#047857] hover:to-[#059669] flex items-center justify-center gap-2 shadow-[0_12px_30px_-6px_rgba(16,185,129,0.5)] disabled:opacity-50 cursor-pointer transition-all relative overflow-hidden group"
                  >
                    <motion.span
                      animate={{ x: ['-120%', '220%'] }}
                      transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut' }}
                      className="absolute inset-y-0 w-1/3 bg-gradient-to-r from-transparent via-white/25 to-transparent skew-x-12 pointer-events-none"
                    />
                    <span className="relative z-10">
                      {isSubmitting ? 'Authenticating Tag...' : 'Access Product Portal'}
                    </span>
                    <motion.span
                      animate={{ x: [0, 4, 0] }}
                      transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
                      className="relative z-10"
                    >
                      <ArrowRight className="w-4 h-4" />
                    </motion.span>
                  </motion.button>
                </div>
              </motion.form>
            ) : (
              <motion.form
                key="admin-form"
                initial={{ opacity: 0, x: 16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -16 }}
                transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                onSubmit={handleAdminSubmit}
                className="space-y-4"
              >
                {/* Email Address */}
                <div className="space-y-1.5">
                  <label
                    htmlFor="admin-email-input"
                    className="text-xs font-bold text-[#07221A] block"
                  >
                    Email Address
                  </label>
                  <motion.div
                    animate={focusedField === 'email' ? { scale: 1.01 } : { scale: 1 }}
                    className="relative"
                  >
                    <Mail className="w-4 h-4 text-emerald-600 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      id="admin-email-input"
                      type="email"
                      required
                      value={adminEmail}
                      onFocus={() => setFocusedField('email')}
                      onBlur={() => setFocusedField(null)}
                      onChange={(e) => setAdminEmail(e.target.value)}
                      placeholder="Enter administrator email"
                      className="w-full pl-11 pr-4 py-3.5 bg-[#F4FBF7] text-sm font-semibold text-[#07221A] placeholder-[#6B8A7E] rounded-2xl border border-emerald-950/12 focus:outline-none focus:bg-white focus:border-emerald-600 focus:ring-4 focus:ring-emerald-500/15 transition-all"
                    />
                  </motion.div>
                </div>

                {/* Password */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label
                      htmlFor="admin-password-input"
                      className="text-xs font-bold text-[#07221A] block"
                    >
                      Password
                    </label>
                    <Link
                      to="/forgot-password"
                      className="text-xs font-semibold text-emerald-700 hover:text-emerald-900"
                    >
                      Forgot password?
                    </Link>
                  </div>
                  <motion.div
                    animate={focusedField === 'password' ? { scale: 1.01 } : { scale: 1 }}
                    className="relative"
                  >
                    <Lock className="w-4 h-4 text-emerald-600 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      id="admin-password-input"
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={adminPassword}
                      onFocus={() => setFocusedField('password')}
                      onBlur={() => setFocusedField(null)}
                      onChange={(e) => setAdminPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-11 pr-11 py-3.5 bg-[#F4FBF7] text-sm font-semibold text-[#07221A] placeholder-[#6B8A7E] rounded-2xl border border-emerald-950/12 focus:outline-none focus:bg-white focus:border-emerald-600 focus:ring-4 focus:ring-emerald-500/15 transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-[#527367] hover:text-[#07221A] cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </motion.div>
                </div>

                {/* Remember Me Checkbox */}
                <div className="flex items-center justify-between text-xs pt-1">
                  <label className="flex items-center gap-2 cursor-pointer text-[#3B5E52] font-medium group">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-4 h-4 rounded border-emerald-300 text-emerald-600 focus:ring-0 cursor-pointer accent-emerald-600 transition-transform group-hover:scale-110"
                    />
                    <span className="group-hover:text-[#07221A] transition-colors">Remember Me</span>
                  </label>
                </div>

                {/* Submit Button */}
                <div className="pt-2">
                  <motion.button
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-4 px-6 rounded-2xl font-bold text-sm text-white bg-gradient-to-r from-[#059669] via-[#10B981] to-[#0D9488] hover:from-[#047857] hover:to-[#059669] flex items-center justify-center gap-2 shadow-[0_12px_30px_-6px_rgba(16,185,129,0.5)] disabled:opacity-50 cursor-pointer transition-all relative overflow-hidden"
                  >
                    <motion.span
                      animate={{ x: ['-120%', '220%'] }}
                      transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut' }}
                      className="absolute inset-y-0 w-1/3 bg-gradient-to-r from-transparent via-white/25 to-transparent skew-x-12 pointer-events-none"
                    />
                    <span className="relative z-10">
                      {isSubmitting ? 'Signing in as Admin...' : 'Sign In as Admin'}
                    </span>
                    <motion.span
                      animate={{ x: [0, 4, 0] }}
                      transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
                      className="relative z-10"
                    >
                      <ArrowRight className="w-4 h-4" />
                    </motion.span>
                  </motion.button>
                </div>
              </motion.form>
            )}
          </AnimatePresence>

          {/* Bottom Card Footer */}
          <div className="pt-4 border-t border-emerald-950/8 flex items-center justify-between text-xs text-[#4A6B5F]">
            <span className="flex items-center gap-1.5">
              <motion.span
                animate={{ rotate: [0, 15, -10, 0] }}
                transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
              >
                <Leaf className="w-3.5 h-3.5 text-emerald-600" />
              </motion.span>
              <span>Real-time freshness monitoring</span>
            </span>
            <Link
              to="/signup"
              className="font-bold text-emerald-700 hover:text-emerald-900 inline-flex items-center gap-1 group"
            >
              <span>Create Account</span>
              <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </motion.div>
      </motion.div>

      {/* =====================================================================
          QR CODE CAMERA SCANNER MODAL OVERLAY
         ===================================================================== */}
      <AnimatePresence>
        {showScanner && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-[#07221A]/80 backdrop-blur-md flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.92, opacity: 0 }}
              className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-emerald-950/10 space-y-4 relative overflow-hidden"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold">
                    <QrCode className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-extrabold text-[#07221A]">Scan Product QR Code</h3>
                    <p className="text-[11px] text-[#4A6B5F]">Center the QR code in the viewfinder</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={stopScanner}
                  className="w-8 h-8 rounded-full bg-[#F4FBF7] flex items-center justify-center text-[#3B5E52] hover:bg-emerald-100 transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="relative w-full aspect-square rounded-2xl overflow-hidden bg-[#07221A] flex items-center justify-center shadow-inner">
                <video
                  ref={videoRef}
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />
                <canvas ref={canvasRef} className="hidden" />

                {/* Viewfinder overlay */}
                <div className="absolute inset-8 border-2 border-emerald-400/80 rounded-2xl pointer-events-none flex flex-col justify-between p-3">
                  <div className="flex justify-between">
                    <div className="w-6 h-6 border-t-2 border-l-2 border-emerald-400 rounded-tl" />
                    <div className="w-6 h-6 border-t-2 border-r-2 border-emerald-400 rounded-tr" />
                  </div>
                  <div className="w-full text-center">
                    <span className="bg-[#07221A]/85 backdrop-blur-md text-emerald-300 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest border border-emerald-400/30">
                      Scanning...
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <div className="w-6 h-6 border-b-2 border-l-2 border-emerald-400 rounded-bl" />
                    <div className="w-6 h-6 border-b-2 border-r-2 border-emerald-400 rounded-br" />
                  </div>
                </div>
              </div>

              {scannerError && (
                <div className="p-3 bg-rose-50 text-rose-700 text-xs font-semibold rounded-xl flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{scannerError}</span>
                </div>
              )}

              <div className="pt-1">
                <button
                  type="button"
                  onClick={stopScanner}
                  className="w-full py-3.5 rounded-2xl font-bold text-xs text-[#07221A] bg-[#EDF7F2] hover:bg-emerald-100 transition-colors cursor-pointer"
                >
                  Cancel &amp; Enter Manually
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

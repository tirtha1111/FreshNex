import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
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
  Warehouse,
  Radio,
  Cpu,
  RefreshCw,
  Zap
} from 'lucide-react';
import jsqr from 'jsqr';
import { Logo } from '../components/common/Logo';
import { useAuth } from '../context/AuthContext';
import { RFIDScanStatus, RFIDStatusEventDetail } from '../components/WarehouseRFIDListener';

export type LoginMode = 'user' | 'admin' | 'rfid';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser, userProfile, warehouseSession, login, loginWithProductId, authError, clearAuthError } = useAuth();

  useEffect(() => {
    if (currentUser && userProfile?.role !== 'warehouse') {
      navigate(userProfile?.role === 'admin' ? '/devices' : '/dashboard', { replace: true });
    } else if (warehouseSession && warehouseSession.deviceId && warehouseSession.tagUid) {
      navigate(
        `/warehouse?deviceId=${encodeURIComponent(warehouseSession.deviceId)}&rfid=${encodeURIComponent(warehouseSession.tagUid)}`,
        { replace: true }
      );
    }
  }, [currentUser, userProfile?.role, warehouseSession, navigate]);

  const [loginMode, setLoginMode] = useState<LoginMode>('user');

  // User device portal state
  const [productId, setProductId] = useState('');
  const [focusedField, setFocusedField] = useState<string | null>(null);

  // RFID Warehouse login live state
  const [rfidStatus, setRfidStatus] = useState<RFIDScanStatus>('waiting');
  const [rfidStatusMessage, setRfidStatusMessage] = useState<string>('Waiting for RFID scan...');
  const [rfidDetails, setRfidDetails] = useState<{
    tagUid?: string;
    deviceId?: string;
    product?: string;
  } | null>(null);
  const rfidResetTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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

  // Subscribe to live RFID scanner telemetry events from WarehouseRFIDListener
  useEffect(() => {
    const handleRfidStatus = (e: Event) => {
      const detail = (e as CustomEvent<RFIDStatusEventDetail>).detail;
      if (!detail) return;

      if (rfidResetTimerRef.current) {
        clearTimeout(rfidResetTimerRef.current);
        rfidResetTimerRef.current = null;
      }

      setRfidStatus(detail.status);
      if (detail.message) {
        setRfidStatusMessage(detail.message);
      }
      if (detail.tagUid || detail.deviceId || detail.product) {
        setRfidDetails({
          tagUid: detail.tagUid,
          deviceId: detail.deviceId,
          product: detail.product,
        });
      } else if (detail.status === 'waiting') {
        setRfidDetails(null);
      }

      // Automatically switch to the RFID tab when a hardware scan begins so the operator sees live feedback
      if (detail.status === 'detected' || detail.status === 'verifying' || detail.status === 'granted' || detail.status === 'denied') {
        setLoginMode('rfid');
      }

      // If access was denied, keep message visible for 4.5 seconds then reset back to waiting
      if (detail.status === 'denied') {
        rfidResetTimerRef.current = setTimeout(() => {
          setRfidStatus('waiting');
          setRfidStatusMessage('Waiting for RFID scan...');
          setRfidDetails(null);
        }, 4500);
      }
    };

    window.addEventListener('freshnex_rfid_status', handleRfidStatus);
    return () => {
      window.removeEventListener('freshnex_rfid_status', handleRfidStatus);
      if (rfidResetTimerRef.current) clearTimeout(rfidResetTimerRef.current);
    };
  }, []);

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
      setScannerError('Camera access denied or unavailable. Please enter Device ID manually.');
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
      setLocalError('Please enter a valid Device ID (e.g. YGS-FD-001 or YGS-FD-124).');
      return;
    }

    setIsSubmitting(true);
    try {
      await loginWithProductId(productId.trim());
      navigate('/dashboard');
    } catch (err: any) {
      setLocalError(err.message || 'Failed to authenticate Device ID. Please check the Device ID.');
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
      navigate('/devices');
    } catch (err: any) {
      setLocalError(err.message || 'Failed to sign in as Administrator. Please check your credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#EEFAF3] via-[#E4F6EC] to-[#F5FCF8] text-[#07221A] font-['DM_Sans',sans-serif] flex flex-col justify-center items-center px-4 py-8 relative overflow-hidden select-none">
      {/* Static Botanical Ambience Background */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        {/* Corner Static Botanical Rings */}
        <div className="absolute -top-28 -left-28 w-80 h-80 rounded-full border border-emerald-500/20 flex items-center justify-center">
          <div className="w-56 h-56 rounded-full border border-dashed border-emerald-500/25" />
        </div>
        <div className="absolute -top-24 -right-24 w-72 h-72 rounded-full border border-teal-500/20 flex items-center justify-center">
          <div className="w-48 h-48 rounded-full border border-dashed border-lime-500/25" />
        </div>
        <div className="absolute -bottom-28 -left-28 w-76 h-76 rounded-full border border-lime-500/20 flex items-center justify-center">
          <div className="w-52 h-52 rounded-full border border-dashed border-emerald-500/25" />
        </div>
        <div className="absolute -bottom-24 -right-24 w-80 h-80 rounded-full border border-emerald-500/20 flex items-center justify-center">
          <div className="w-56 h-56 rounded-full border border-dashed border-teal-500/25" />
        </div>

        {/* Static Chlorophyll Aurora Blobs */}
        <div
          className="absolute -top-32 -left-24 w-[520px] h-[520px] rounded-full blur-[105px] opacity-40 pointer-events-none"
          style={{
            background:
              'radial-gradient(circle, rgba(16, 185, 129, 0.28) 0%, rgba(52, 211, 153, 0.08) 65%, transparent 100%)'
          }}
        />
        <div
          className="absolute top-1/4 -right-32 w-[560px] h-[560px] rounded-full blur-[115px] opacity-35 pointer-events-none"
          style={{
            background:
              'radial-gradient(circle, rgba(132, 204, 22, 0.22) 0%, rgba(16, 185, 129, 0.06) 70%, transparent 100%)'
          }}
        />
        <div
          className="absolute -bottom-36 left-1/3 w-[500px] h-[500px] rounded-full blur-[105px] opacity-30 pointer-events-none"
          style={{
            background:
              'radial-gradient(circle, rgba(20, 184, 166, 0.2) 0%, transparent 70%)'
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
      </div>

      {/* Centered Login Portal Card */}
      <div className="w-full max-w-lg space-y-6 relative z-10">
        {/* Brand Logo & Welcome Headline */}
        <div className="text-center space-y-2">
          <div className="flex justify-center pb-1">
            <Logo size="lg" variant="light" showTagline={true} linkTo="/" />
          </div>

          <h1 className="text-3xl sm:text-[2.5rem] leading-[1.15] pt-1 flex items-baseline justify-center gap-2.5 flex-wrap">
            <span className="font-['Playfair_Display',Georgia,serif] italic font-medium text-[#174936] tracking-[-0.01em] text-[0.92em]">
              Welcome to
            </span>
            <span className="font-['Outfit',sans-serif] font-extrabold tracking-[-0.035em] bg-gradient-to-r from-[#064E3B] via-[#059669] to-[#10B981] bg-clip-text text-transparent drop-shadow-[0_4px_14px_rgba(16,185,129,0.25)] pb-0.5">
              FreshNex
            </span>
          </h1>
        </div>

        {/* Main Glassmorphic Login Card */}
        <div className="bg-white/95 backdrop-blur-2xl p-6 sm:p-8 rounded-[32px] shadow-[0_24px_60px_-15px_rgba(7,34,26,0.14)] border border-emerald-950/10 space-y-6 relative overflow-hidden">
          {/* Top Leaf Bar */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-emerald-500 via-lime-400 to-teal-500" />

          {/* Corner Accents */}
          <div className="w-4 h-4 border-t-2 border-l-2 border-emerald-500/40 rounded-tl-lg absolute top-3.5 left-3.5 pointer-events-none opacity-50" />
          <div className="w-4 h-4 border-t-2 border-r-2 border-emerald-500/40 rounded-tr-lg absolute top-3.5 right-3.5 pointer-events-none opacity-50" />
          <div className="w-4 h-4 border-b-2 border-l-2 border-emerald-500/40 rounded-bl-lg absolute bottom-3.5 left-3.5 pointer-events-none opacity-50" />
          <div className="w-4 h-4 border-b-2 border-r-2 border-emerald-500/40 rounded-br-lg absolute bottom-3.5 right-3.5 pointer-events-none opacity-50" />

          {/* 3-Way Segmented Mode Switcher: User Login | Admin Login | RFID Warehouse Login */}
          <div className="grid grid-cols-3 p-1.5 rounded-2xl bg-[#EDF7F2] border border-emerald-950/8 relative">
            <button
              type="button"
              onClick={() => {
                setLoginMode('user');
                setLocalError(null);
                clearAuthError();
              }}
              className={`py-2.5 px-2 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center justify-center gap-1.5 whitespace-nowrap ${
                loginMode === 'user'
                  ? 'bg-gradient-to-r from-[#059669] to-[#10B981] text-white shadow-md shadow-emerald-600/25'
                  : 'text-[#3B5E52] hover:text-[#07221A]'
              }`}
            >
              <QrCode className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">User Login</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setLoginMode('admin');
                setLocalError(null);
                clearAuthError();
              }}
              className={`py-2.5 px-2 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center justify-center gap-1.5 whitespace-nowrap ${
                loginMode === 'admin'
                  ? 'bg-gradient-to-r from-[#059669] to-[#10B981] text-white shadow-md shadow-emerald-600/25'
                  : 'text-[#3B5E52] hover:text-[#07221A]'
              }`}
            >
              <Shield className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">Admin Login</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setLoginMode('rfid');
                setLocalError(null);
                clearAuthError();
              }}
              className={`py-2.5 px-2 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center justify-center gap-1.5 whitespace-nowrap ${
                loginMode === 'rfid'
                  ? 'bg-gradient-to-r from-[#07221A] to-[#13493B] text-white shadow-md shadow-emerald-950/30'
                  : 'text-[#3B5E52] hover:text-[#07221A]'
              }`}
            >
              <Warehouse className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">RFID Warehouse</span>
            </button>
          </div>

          {/* Error Banner */}
          {(localError || authError) && (
            <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 flex items-start gap-2.5 text-rose-700 text-xs font-semibold">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{localError || authError}</span>
            </div>
          )}

          {/* Forms & Modes */}
          {loginMode === 'user' ? (
            <form onSubmit={handleUserProductSubmit} className="space-y-4">
              {/* Device ID Input */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label
                    htmlFor="product-tag-input"
                    className="text-xs font-bold text-[#07221A] block"
                  >
                    Unique Device ID
                  </label>
                  <button
                    type="button"
                    onClick={startScanner}
                    className="text-xs font-bold text-emerald-800 hover:text-emerald-950 flex items-center gap-1.5 cursor-pointer bg-emerald-50 hover:bg-emerald-100/90 px-3 py-1.5 rounded-xl border border-emerald-500/30 transition-colors shadow-2xs"
                  >
                    <Camera className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Scan QR Code</span>
                  </button>
                </div>

                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none text-emerald-600">
                    <QrCode className="w-4 h-4" />
                  </span>
                  <input
                    id="product-tag-input"
                    type="text"
                    required
                    value={productId}
                    onFocus={() => setFocusedField('tag')}
                    onBlur={() => setFocusedField(null)}
                    onChange={(e) => setProductId(e.target.value)}
                    placeholder="e.g. YGS-FD-001 (Apple) or YGS-FD-124 (Milk)"
                    className="w-full pl-11 pr-4 py-3.5 bg-[#F4FBF7] text-sm font-bold text-[#07221A] placeholder-[#6B8A7E] rounded-2xl border border-emerald-950/12 focus:outline-none focus:bg-white focus:border-emerald-600 focus:ring-4 focus:ring-emerald-500/15 transition-all uppercase font-mono tracking-wider"
                  />
                </div>
              </div>

              {/* Remember Me Checkbox */}
              <div className="flex items-center justify-between text-xs pt-1">
                <label className="flex items-center gap-2 cursor-pointer text-[#3B5E52] font-medium group">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded border-emerald-300 text-emerald-600 focus:ring-0 cursor-pointer accent-emerald-600"
                  />
                  <span className="group-hover:text-[#07221A] transition-colors">Remember Me</span>
                </label>
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-4 px-6 rounded-2xl font-bold text-sm text-white bg-gradient-to-r from-[#059669] via-[#10B981] to-[#0D9488] hover:from-[#047857] hover:to-[#059669] flex items-center justify-center gap-2 shadow-[0_12px_30px_-6px_rgba(16,185,129,0.5)] disabled:opacity-50 cursor-pointer transition-colors"
                >
                  <span>
                    {isSubmitting ? 'Authenticating Tag...' : 'Access Product Portal'}
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          ) : loginMode === 'admin' ? (
            <form onSubmit={handleAdminSubmit} className="space-y-4">
              {/* Email Address */}
              <div className="space-y-1.5">
                <label
                  htmlFor="admin-email-input"
                  className="text-xs font-bold text-[#07221A] block"
                >
                  Email Address
                </label>
                <div className="relative">
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
                </div>
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
                <div className="relative">
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
                </div>
              </div>

              {/* Remember Me Checkbox */}
              <div className="flex items-center justify-between text-xs pt-1">
                <label className="flex items-center gap-2 cursor-pointer text-[#3B5E52] font-medium group">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded border-emerald-300 text-emerald-600 focus:ring-0 cursor-pointer accent-emerald-600"
                  />
                  <span className="group-hover:text-[#07221A] transition-colors">Remember Me</span>
                </label>
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-4 px-6 rounded-2xl font-bold text-sm text-white bg-gradient-to-r from-[#059669] via-[#10B981] to-[#0D9488] hover:from-[#047857] hover:to-[#059669] flex items-center justify-center gap-2 shadow-[0_12px_30px_-6px_rgba(16,185,129,0.5)] disabled:opacity-50 cursor-pointer transition-colors"
                >
                  <span>
                    {isSubmitting ? 'Signing in as Admin...' : 'Sign In as Admin'}
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          ) : (
            /* =========================================================
               MODE 3: DEDICATED RFID WAREHOUSE LOGIN
               ========================================================= */
            <div className="space-y-4">
              {/* Instruction Header */}
              <div className="text-center space-y-1 pt-1">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#07221A] text-[#20E79A] text-[10px] font-black uppercase tracking-wider border border-[#20E79A]/30">
                  <Radio className="w-3 h-3 animate-pulse" />
                  <span>Real-Time Warehouse Gateway</span>
                </div>
                <h3 className="text-base font-black text-[#07221A]">
                  RFID Warehouse Login
                </h3>
                <p className="text-xs font-semibold text-[#3B5E52]">
                  Scan your registered RFID card to access the Warehouse.
                </p>
              </div>

              {/* LIVE STATUS INDICATOR CONTAINER */}
              <div className="p-4 rounded-2xl bg-gradient-to-br from-[#07221A] to-[#0D3429] border border-[#20E79A]/30 text-white shadow-xl space-y-3 relative overflow-hidden">
                {/* Status Indicator Bar */}
                <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
                  <span className="text-[10px] font-black uppercase tracking-wider text-[#8AB5A8] flex items-center gap-1.5">
                    <Cpu className="w-3.5 h-3.5 text-[#20E79A]" />
                    Live Status Indicator
                  </span>

                  <span
                    className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                      rfidStatus === 'waiting'
                        ? 'bg-[#20E79A]/15 text-[#20E79A] border border-[#20E79A]/40'
                        : rfidStatus === 'detected'
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-400/40'
                        : rfidStatus === 'verifying'
                        ? 'bg-blue-500/20 text-blue-300 border border-blue-400/40'
                        : rfidStatus === 'granted'
                        ? 'bg-emerald-500/25 text-emerald-300 border border-emerald-400/50'
                        : 'bg-rose-500/25 text-rose-300 border border-rose-400/50'
                    }`}
                  >
                    {rfidStatus === 'waiting' && (
                      <>
                        <span className="w-1.5 h-1.5 rounded-full bg-[#20E79A] animate-ping" />
                        Waiting for RFID scan
                      </>
                    )}
                    {rfidStatus === 'detected' && (
                      <>
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                        RFID detected
                      </>
                    )}
                    {rfidStatus === 'verifying' && (
                      <>
                        <RefreshCw className="w-3 h-3 animate-spin text-blue-300" />
                        Verifying RFID
                      </>
                    )}
                    {rfidStatus === 'granted' && (
                      <>
                        <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                        Access granted
                      </>
                    )}
                    {rfidStatus === 'denied' && (
                      <>
                        <AlertCircle className="w-3 h-3 text-rose-400" />
                        Access denied
                      </>
                    )}
                  </span>
                </div>

                {/* Visual Status Display */}
                <div className="flex items-center gap-4 py-2">
                  <div className="relative w-14 h-14 shrink-0 flex items-center justify-center">
                    {rfidStatus === 'waiting' && (
                      <div className="absolute inset-0 rounded-2xl bg-[#20E79A]/10 animate-ping" />
                    )}
                    <div
                      className={`w-14 h-14 rounded-2xl flex items-center justify-center border transition-all ${
                        rfidStatus === 'waiting'
                          ? 'bg-[#20E79A]/15 border-[#20E79A]/40 text-[#20E79A]'
                          : rfidStatus === 'detected'
                          ? 'bg-amber-500/20 border-amber-400/50 text-amber-300 animate-pulse'
                          : rfidStatus === 'verifying'
                          ? 'bg-blue-500/20 border-blue-400/50 text-blue-300'
                          : rfidStatus === 'granted'
                          ? 'bg-emerald-500/25 border-emerald-400/60 text-emerald-300'
                          : 'bg-rose-500/25 border-rose-400/60 text-rose-300'
                      }`}
                    >
                      {rfidStatus === 'waiting' && <Radio className="w-7 h-7" />}
                      {rfidStatus === 'detected' && <Zap className="w-7 h-7" />}
                      {rfidStatus === 'verifying' && <RefreshCw className="w-7 h-7 animate-spin" />}
                      {rfidStatus === 'granted' && <CheckCircle2 className="w-7 h-7" />}
                      {rfidStatus === 'denied' && <AlertCircle className="w-7 h-7" />}
                    </div>
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-white tracking-tight leading-tight">
                      {rfidStatus === 'waiting' && 'Ready for ESP32 RFID card reader'}
                      {rfidStatus === 'detected' && 'Tag detected — Reading UID'}
                      {rfidStatus === 'verifying' && 'Checking /rfid_registry in Firebase RTDB...'}
                      {rfidStatus === 'granted' && 'Authenticated! Redirecting to Warehouse...'}
                      {rfidStatus === 'denied' && 'Authentication Rejected'}
                    </p>
                    <p
                      className={`text-[11px] mt-1 font-medium leading-relaxed ${
                        rfidStatus === 'denied'
                          ? 'text-rose-300 font-bold'
                          : rfidStatus === 'granted'
                          ? 'text-emerald-300 font-bold'
                          : 'text-[#D5E6DF]'
                      }`}
                    >
                      {rfidStatusMessage}
                    </p>
                    {rfidDetails?.tagUid && (
                      <div className="mt-2 flex flex-wrap items-center gap-2 text-[10px] font-mono">
                        <span className="px-2 py-0.5 rounded bg-white/10 text-amber-300 border border-white/10">
                          UID: {rfidDetails.tagUid}
                        </span>
                        {rfidDetails.deviceId && (
                          <span className="px-2 py-0.5 rounded bg-white/10 text-[#20E79A] border border-white/10">
                            Device: {rfidDetails.deviceId}
                          </span>
                        )}
                        {rfidDetails.product && (
                          <span className="px-2 py-0.5 rounded bg-white/10 text-white border border-white/10">
                            Product: {rfidDetails.product}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Connected Hardware Telemetry Footer */}
                <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[10px] text-[#8AB5A8] font-mono">
                  <span>Reader: ESP32-RC522 (WH-001)</span>
                  <span className="text-[#20E79A] flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#20E79A] inline-block" />
                    Listening on /warehouse_scans
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Bottom Card Footer */}
          <div className="pt-4 border-t border-emerald-950/8 flex items-center justify-center text-xs text-[#4A6B5F]">
            <span className="flex items-center gap-1.5">
              <Leaf className="w-3.5 h-3.5 text-emerald-600" />
              <span>Real-time freshness monitoring &amp; automated RFID verification</span>
            </span>
          </div>
        </div>
      </div>

      {/* QR CODE CAMERA SCANNER MODAL OVERLAY (Static) */}
      {showScanner && (
        <div className="fixed inset-0 z-50 bg-[#07221A]/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-emerald-950/10 space-y-4 relative overflow-hidden">
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
          </div>
        </div>
      )}
    </div>
  );
};


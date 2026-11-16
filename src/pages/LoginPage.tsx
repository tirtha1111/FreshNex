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
  Warehouse,
  KeyRound,
  ShieldCheck,
} from 'lucide-react';
import jsqr from 'jsqr';
import { Logo } from '../components/common/Logo';
import { useAuth } from '../context/AuthContext';
import { getErrorMessage } from '../services/warehouseAuthService';

export type LoginMode = 'user' | 'admin' | 'warehouse';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const {
    currentUser,
    userProfile,
    warehouseSession,
    login,
    loginWithProductId,
    loginWarehouse,
    authError,
    clearAuthError,
  } = useAuth();

  useEffect(() => {
    if (currentUser && userProfile?.role !== 'warehouse') {
      navigate(userProfile?.role === 'admin' ? '/devices' : '/dashboard', { replace: true });
    } else if (warehouseSession && warehouseSession.warehouseId && warehouseSession.token) {
      navigate('/warehouse', { replace: true });
    }
  }, [currentUser, userProfile?.role, warehouseSession, navigate]);

  const [loginMode, setLoginMode] = useState<LoginMode>('user');

  // User device portal state
  const [productId, setProductId] = useState('');

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

  // Warehouse login state (Warehouse ID + Password)
  const [warehouseId, setWarehouseId] = useState(() => {
    try {
      return localStorage.getItem('freshnex_saved_wh_id') || 'WH-001';
    } catch {
      return 'WH-001';
    }
  });
  const [warehousePassword, setWarehousePassword] = useState('');
  const [showWarehousePassword, setShowWarehousePassword] = useState(false);
  const [rememberWarehouse, setRememberWarehouse] = useState(true);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const startScanner = async () => {
    setScannerError(null);
    setShowScanner(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
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

  const handleWarehouseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    clearAuthError();

    const cleanId = warehouseId.trim().toUpperCase();
    const cleanPass = warehousePassword.trim();

    if (!cleanId || !cleanPass) {
      setLocalError('Please enter both your Warehouse ID and Password.');
      return;
    }

    setIsSubmitting(true);
    try {
      if (rememberWarehouse) {
        try {
          localStorage.setItem('freshnex_saved_wh_id', cleanId);
        } catch {
          // ignore
        }
      }
      await loginWarehouse(cleanId, cleanPass);
      navigate('/warehouse');
    } catch (err: any) {
      setLocalError(getErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  const modeSubtitles: Record<LoginMode, string> = {
    user: 'Enter your product Device ID or scan its QR code for live freshness telemetry.',
    admin: 'Sign in with your administrator credentials to manage devices and thresholds.',
    warehouse: 'Authenticate with your Warehouse ID and password to enable RFID scanning.',
  };

  return (
    <div className="min-h-[100dvh] bg-[#F2FAF5] sm:bg-gradient-to-br sm:from-[#EEFAF3] sm:via-[#E4F6EC] sm:to-[#F5FCF8] text-[#07221A] font-['DM_Sans',sans-serif] flex flex-col justify-between sm:justify-center items-center px-4 py-6 sm:py-10 relative overflow-x-hidden select-none">
      {/* Lightweight Desktop-Only Ambient Accents (Zero GPU blur overhead on mobile) */}
      <div className="hidden sm:block fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div
          className="absolute -top-32 -left-24 w-[460px] h-[460px] rounded-full opacity-35"
          style={{
            background:
              'radial-gradient(circle, rgba(16, 185, 129, 0.22) 0%, rgba(52, 211, 153, 0.05) 65%, transparent 100%)',
          }}
        />
        <div
          className="absolute -bottom-36 -right-24 w-[460px] h-[460px] rounded-full opacity-30"
          style={{
            background:
              'radial-gradient(circle, rgba(20, 184, 166, 0.18) 0%, transparent 70%)',
          }}
        />
      </div>

      {/* Main Content Container */}
      <div className="w-full max-w-[440px] sm:max-w-lg my-auto space-y-5 sm:space-y-6 relative z-10">
        {/* Clean Header Lockup */}
        <div className="text-center space-y-2 px-1">
          <div className="flex justify-center">
            <Logo size="md" variant="light" showTagline={false} linkTo="/" />
          </div>

          <h1 className="text-2xl sm:text-3xl font-['Outfit',sans-serif] font-extrabold tracking-tight text-[#07221A]">
            Welcome to <span className="text-[#059669]">FreshNex</span>
          </h1>
          <p className="text-xs sm:text-sm text-[#4A6B5F] font-medium max-w-sm mx-auto leading-relaxed">
            {modeSubtitles[loginMode]}
          </p>
        </div>

        {/* Solid, Zero-Lag Login Card */}
        <div className="bg-white p-5 sm:p-8 rounded-3xl shadow-[0_12px_36px_-12px_rgba(7,34,26,0.10)] border border-emerald-950/10 space-y-5 relative overflow-hidden">
          {/* Subtle Top Accent Line */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#059669] via-[#10B981] to-[#0D9488]" />

          {/* 3-Way Segmented Mode Switcher — Thumb-Friendly on Mobile */}
          <div
            role="tablist"
            aria-label="Login portal mode"
            className="grid grid-cols-3 gap-1 p-1 rounded-2xl bg-[#EEF7F2] border border-emerald-950/8"
          >
            <button
              type="button"
              role="tab"
              aria-selected={loginMode === 'user'}
              onClick={() => {
                setLoginMode('user');
                setLocalError(null);
                clearAuthError();
              }}
              className={`min-h-[48px] py-2 px-2 rounded-xl text-xs font-bold transition-colors cursor-pointer flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-1.5 whitespace-nowrap ${
                loginMode === 'user'
                  ? 'bg-[#059669] text-white shadow-xs'
                  : 'text-[#3B5E52] hover:text-[#07221A]'
              }`}
            >
              <QrCode className="w-4 h-4 shrink-0" />
              <span>
                User<span className="hidden sm:inline"> Login</span>
              </span>
            </button>

            <button
              type="button"
              role="tab"
              aria-selected={loginMode === 'admin'}
              onClick={() => {
                setLoginMode('admin');
                setLocalError(null);
                clearAuthError();
              }}
              className={`min-h-[48px] py-2 px-2 rounded-xl text-xs font-bold transition-colors cursor-pointer flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-1.5 whitespace-nowrap ${
                loginMode === 'admin'
                  ? 'bg-[#059669] text-white shadow-xs'
                  : 'text-[#3B5E52] hover:text-[#07221A]'
              }`}
            >
              <Shield className="w-4 h-4 shrink-0" />
              <span>
                Admin<span className="hidden sm:inline"> Login</span>
              </span>
            </button>

            <button
              type="button"
              role="tab"
              aria-selected={loginMode === 'warehouse'}
              onClick={() => {
                setLoginMode('warehouse');
                setLocalError(null);
                clearAuthError();
              }}
              className={`min-h-[48px] py-2 px-2 rounded-xl text-xs font-bold transition-colors cursor-pointer flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-1.5 whitespace-nowrap ${
                loginMode === 'warehouse'
                  ? 'bg-[#07221A] text-white shadow-xs'
                  : 'text-[#3B5E52] hover:text-[#07221A]'
              }`}
            >
              <Warehouse className="w-4 h-4 shrink-0" />
              <span>
                Warehouse<span className="hidden sm:inline"> Login</span>
              </span>
            </button>
          </div>

          {/* Error Banner */}
          {(localError || authError) && (
            <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 flex items-start gap-2.5 text-rose-700 text-xs font-semibold leading-relaxed">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{localError || authError}</span>
            </div>
          )}

          {/* MODE 1: USER PRODUCT PORTAL */}
          {loginMode === 'user' ? (
            <form onSubmit={handleUserProductSubmit} className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label
                    htmlFor="product-tag-input"
                    className="text-xs font-bold text-[#07221A]"
                  >
                    Unique Device ID
                  </label>
                  <span className="text-[11px] font-mono text-[#5C7F75] font-medium">
                    YGS-FD-001 · YGS-FD-124
                  </span>
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
                    onChange={(e) => setProductId(e.target.value)}
                    placeholder="Enter Device ID (e.g. YGS-FD-001)"
                    className="w-full min-h-[48px] pl-11 pr-4 py-3 bg-[#F6FBF8] text-base sm:text-sm font-bold text-[#07221A] placeholder-[#6B8A7E] rounded-2xl border border-emerald-950/12 focus:outline-none focus:bg-white focus:border-emerald-600 transition-colors uppercase font-mono tracking-wider"
                  />
                </div>
              </div>

              {/* Remember Me Checkbox */}
              <div className="flex items-center justify-between text-xs">
                <label className="min-h-[36px] flex items-center gap-2.5 cursor-pointer text-[#3B5E52] font-medium">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded border-emerald-300 text-emerald-600 focus:ring-0 cursor-pointer accent-emerald-600"
                  />
                  <span>Remember this device</span>
                </label>
              </div>

              {/* Primary & QR Scanner Actions */}
              <div className="space-y-2.5 pt-1">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full min-h-[48px] py-3.5 px-6 rounded-2xl font-bold text-sm text-white bg-[#059669] hover:bg-[#047857] active:bg-[#065F46] flex items-center justify-center gap-2 shadow-sm disabled:opacity-50 cursor-pointer transition-colors"
                >
                  <span>
                    {isSubmitting ? 'Authenticating Device...' : 'Access Product Portal'}
                  </span>
                  <ArrowRight className="w-4 h-4 shrink-0" />
                </button>

                <button
                  type="button"
                  onClick={startScanner}
                  className="w-full min-h-[46px] py-3 px-4 rounded-2xl font-bold text-xs text-[#07221A] bg-[#EEF7F2] hover:bg-[#E1F2E9] border border-emerald-950/10 flex items-center justify-center gap-2 cursor-pointer transition-colors"
                >
                  <Camera className="w-4 h-4 text-[#059669] shrink-0" />
                  <span>Scan Product QR Code</span>
                </button>
              </div>
            </form>
          ) : loginMode === 'admin' ? (
            /* MODE 2: ADMIN LOGIN */
            <form onSubmit={handleAdminSubmit} className="space-y-4">
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
                    onChange={(e) => setAdminEmail(e.target.value)}
                    placeholder="admin@freshnex.com"
                    className="w-full min-h-[48px] pl-11 pr-4 py-3 bg-[#F6FBF8] text-base sm:text-sm font-semibold text-[#07221A] placeholder-[#6B8A7E] rounded-2xl border border-emerald-950/12 focus:outline-none focus:bg-white focus:border-emerald-600 transition-colors"
                  />
                </div>
              </div>

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
                    className="text-xs font-semibold text-[#059669] hover:text-[#047857]"
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
                    onChange={(e) => setAdminPassword(e.target.value)}
                    placeholder="Enter password"
                    className="w-full min-h-[48px] pl-11 pr-12 py-3 bg-[#F6FBF8] text-base sm:text-sm font-semibold text-[#07221A] placeholder-[#6B8A7E] rounded-2xl border border-emerald-950/12 focus:outline-none focus:bg-white focus:border-emerald-600 transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    className="w-11 h-11 absolute right-1 top-1/2 -translate-y-1/2 flex items-center justify-center text-[#527367] hover:text-[#07221A] cursor-pointer rounded-xl"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs">
                <label className="min-h-[36px] flex items-center gap-2.5 cursor-pointer text-[#3B5E52] font-medium">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded border-emerald-300 text-emerald-600 focus:ring-0 cursor-pointer accent-emerald-600"
                  />
                  <span>Remember Me</span>
                </label>
              </div>

              <div className="pt-1">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full min-h-[48px] py-3.5 px-6 rounded-2xl font-bold text-sm text-white bg-[#059669] hover:bg-[#047857] active:bg-[#065F46] flex items-center justify-center gap-2 shadow-sm disabled:opacity-50 cursor-pointer transition-colors"
                >
                  <span>
                    {isSubmitting ? 'Signing in...' : 'Sign In as Admin'}
                  </span>
                  <ArrowRight className="w-4 h-4 shrink-0" />
                </button>
              </div>
            </form>
          ) : (
            /* MODE 3: WAREHOUSE LOGIN (ID + PASSWORD) */
            <form onSubmit={handleWarehouseSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label
                    htmlFor="warehouse-id-input"
                    className="text-xs font-bold text-[#07221A]"
                  >
                    Warehouse ID
                  </label>
                  <span className="text-[11px] font-mono text-[#5C7F75] font-medium">
                    WH-001 · WH-002
                  </span>
                </div>
                <div className="relative">
                  <Warehouse className="w-4 h-4 text-emerald-700 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    id="warehouse-id-input"
                    type="text"
                    required
                    value={warehouseId}
                    onChange={(e) => setWarehouseId(e.target.value.toUpperCase())}
                    placeholder="e.g. WH-001"
                    className="w-full min-h-[48px] pl-11 pr-4 py-3 bg-[#F6FBF8] text-base sm:text-sm font-bold text-[#07221A] placeholder-[#6B8A7E] rounded-2xl border border-emerald-950/12 focus:outline-none focus:bg-white focus:border-emerald-600 transition-colors font-mono tracking-wider uppercase"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label
                  htmlFor="warehouse-password-input"
                  className="text-xs font-bold text-[#07221A] block"
                >
                  Warehouse Access Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-emerald-700 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    id="warehouse-password-input"
                    type={showWarehousePassword ? 'text' : 'password'}
                    required
                    value={warehousePassword}
                    onChange={(e) => setWarehousePassword(e.target.value)}
                    placeholder="Enter warehouse password"
                    className="w-full min-h-[48px] pl-11 pr-12 py-3 bg-[#F6FBF8] text-base sm:text-sm font-semibold text-[#07221A] placeholder-[#6B8A7E] rounded-2xl border border-emerald-950/12 focus:outline-none focus:bg-white focus:border-emerald-600 transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowWarehousePassword(!showWarehousePassword)}
                    aria-label={showWarehousePassword ? 'Hide password' : 'Show password'}
                    className="w-11 h-11 absolute right-1 top-1/2 -translate-y-1/2 flex items-center justify-center text-[#527367] hover:text-[#07221A] cursor-pointer rounded-xl"
                  >
                    {showWarehousePassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs">
                <label className="min-h-[36px] flex items-center gap-2.5 cursor-pointer text-[#3B5E52] font-medium">
                  <input
                    type="checkbox"
                    checked={rememberWarehouse}
                    onChange={(e) => setRememberWarehouse(e.target.checked)}
                    className="w-4 h-4 rounded border-emerald-300 text-emerald-600 focus:ring-0 cursor-pointer accent-emerald-600"
                  />
                  <span>Remember Warehouse ID</span>
                </label>
              </div>

              <div className="pt-1">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full min-h-[48px] py-3.5 px-6 rounded-2xl font-bold text-sm text-white bg-[#07221A] hover:bg-[#103E32] active:bg-[#041410] flex items-center justify-center gap-2 shadow-sm disabled:opacity-50 cursor-pointer transition-colors"
                >
                  <KeyRound className="w-4 h-4 text-[#20E79A] shrink-0" />
                  <span>
                    {isSubmitting ? 'Authenticating...' : 'Access Warehouse Portal'}
                  </span>
                  <ArrowRight className="w-4 h-4 shrink-0" />
                </button>
              </div>

              <div className="pt-1 flex items-center justify-center gap-1.5 text-[11px] text-[#4A6B5F]">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                <span>RFID scans activate automatically after warehouse sign-in</span>
              </div>
            </form>
          )}
        </div>

        {/* Minimal Footer */}
        <p className="text-center text-[11px] text-[#5C7F75] font-medium">
          FreshNex IoT · Real-time freshness &amp; RFID telemetry
        </p>
      </div>

      {/* QR CODE CAMERA SCANNER MODAL OVERLAY */}
      {showScanner && (
        <div className="fixed inset-0 z-50 bg-[#07221A]/80 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-5 sm:p-6 shadow-2xl border border-emerald-950/10 space-y-4 relative overflow-hidden">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold shrink-0">
                  <QrCode className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-[#07221A]">Scan Product QR Code</h3>
                  <p className="text-[11px] text-[#4A6B5F]">Center the QR code in the frame</p>
                </div>
              </div>
              <button
                type="button"
                onClick={stopScanner}
                aria-label="Close scanner"
                className="w-10 h-10 rounded-full bg-[#F4FBF7] flex items-center justify-center text-[#3B5E52] hover:bg-emerald-100 transition-colors cursor-pointer shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="relative w-full aspect-square rounded-2xl overflow-hidden bg-[#07221A] flex items-center justify-center">
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
                  <span className="bg-[#07221A]/90 text-emerald-300 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest border border-emerald-400/30">
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

            <button
              type="button"
              onClick={stopScanner}
              className="w-full min-h-[46px] py-3 rounded-2xl font-bold text-xs text-[#07221A] bg-[#EEF7F2] hover:bg-emerald-100 transition-colors cursor-pointer"
            >
              Cancel &amp; Enter Manually
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

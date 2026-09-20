import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Mail, Lock, Eye, EyeOff, ArrowRight, AlertCircle, QrCode, Shield, Sparkles } from 'lucide-react';
import { Logo } from '../components/common/Logo';
import { useAuth } from '../context/AuthContext';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login, loginWithProductId, authError, clearAuthError } = useAuth();

  const [loginMode, setLoginMode] = useState<'user' | 'admin'>('user');

  // User product portal state
  const [productId, setProductId] = useState('');
  
  // Admin login state
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const handleUserProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    clearAuthError();

    if (!productId.trim()) {
      setLocalError('Please enter a valid unique product tag ID (e.g. MILK or MEAT).');
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
    <div className="min-h-screen bg-gradient-to-br from-[#FFF8F0] via-[#F7F2EB] to-[#EFEAE2] flex flex-col justify-center items-center px-4 py-8 select-none relative font-sans text-slate-800">
      {/* Top subtle ambient warmth background circles */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-lg h-72 bg-gradient-to-b from-orange-200/40 via-amber-100/30 to-transparent blur-3xl pointer-events-none rounded-full" />

      <motion.div 
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-sm sm:max-w-md space-y-6 relative z-10"
      >
        {/* Brand Logo & Headline */}
        <div className="text-center space-y-2">
          <div className="flex justify-center pb-1">
            <Logo size="md" linkTo="/" />
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">
            Get Started Now
          </h1>
          <p className="text-xs text-slate-500 font-medium max-w-xs mx-auto leading-relaxed">
            Select User or Admin portal to access real-time food freshness telemetry
          </p>
        </div>

        {/* Soft Mobile Card Container matching the uploaded design */}
        <div className="bg-white/90 backdrop-blur-xl p-6 sm:p-8 rounded-[32px] shadow-[0_20px_50px_rgba(210,180,150,0.25)] border border-white/80 space-y-6">
          
          {/* Segmented Pill Switcher (User vs Admin) */}
          <div className="grid grid-cols-2 p-1.5 rounded-full bg-slate-100/80 border border-slate-200/60 shadow-inner">
            <button
              type="button"
              onClick={() => {
                setLoginMode('user');
                setLocalError(null);
                clearAuthError();
              }}
              className={`py-3 rounded-full text-xs font-black transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                loginMode === 'user'
                  ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md shadow-orange-500/30'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <QrCode className="w-3.5 h-3.5" />
              <span>User Login</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setLoginMode('admin');
                setLocalError(null);
                clearAuthError();
              }}
              className={`py-3 rounded-full text-xs font-black transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                loginMode === 'admin'
                  ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md shadow-orange-500/30'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Shield className="w-3.5 h-3.5" />
              <span>Admin Login</span>
            </button>
          </div>

          {/* Error Banner */}
          {(localError || authError) && (
            <motion.div 
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 flex items-start gap-2.5 text-rose-600 text-xs font-semibold"
            >
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{localError || authError}</span>
            </motion.div>
          )}

          {/* Forms */}
          <AnimatePresence mode="wait">
            {loginMode === 'user' ? (
              <motion.form
                key="user-form"
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 12 }}
                transition={{ duration: 0.25 }}
                onSubmit={handleUserProductSubmit}
                className="space-y-4 pt-1"
              >
                {/* Product Tag ID Input */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 block">
                    Unique Product Tag ID
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      value={productId}
                      onChange={(e) => setProductId(e.target.value)}
                      placeholder="e.g. MILK or MEAT"
                      className="w-full px-4 py-3.5 bg-slate-50 text-sm font-bold text-slate-900 placeholder-slate-400 rounded-2xl border border-slate-200/80 focus:outline-none focus:bg-white focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 transition-all uppercase font-mono tracking-wider"
                    />
                  </div>
                </div>

                {/* Remember Me Checkbox */}
                <div className="flex items-center justify-between text-xs pt-1">
                  <label className="flex items-center gap-2 cursor-pointer text-slate-600 font-medium">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-4 h-4 rounded border-slate-300 text-orange-500 focus:ring-0 cursor-pointer accent-orange-500"
                    />
                    <span>Remember Me</span>
                  </label>
                </div>

                {/* Submit Pill Button matching image */}
                <div className="pt-3">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-4 rounded-full font-extrabold text-sm text-white bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 flex items-center justify-center gap-2 shadow-[0_10px_30px_rgba(249,115,22,0.35)] disabled:opacity-50 cursor-pointer transition-all"
                  >
                    <span>{isSubmitting ? 'Authenticating Tag...' : 'Access Product Portal'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </motion.button>
                </div>
              </motion.form>
            ) : (
              <motion.form
                key="admin-form"
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -12 }}
                transition={{ duration: 0.25 }}
                onSubmit={handleAdminSubmit}
                className="space-y-4 pt-1"
              >
                {/* Email Address */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 block">
                    Email Address
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      required
                      value={adminEmail}
                      onChange={(e) => setAdminEmail(e.target.value)}
                      placeholder="Enter administrator email"
                      className="w-full px-4 py-3.5 bg-slate-50 text-sm font-semibold text-slate-900 placeholder-slate-400 rounded-2xl border border-slate-200/80 focus:outline-none focus:bg-white focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 transition-all"
                    />
                  </div>
                </div>

                {/* Set Password */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 block">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={adminPassword}
                      onChange={(e) => setAdminPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-4 pr-11 py-3.5 bg-slate-50 text-sm font-semibold text-slate-900 placeholder-slate-400 rounded-2xl border border-slate-200/80 focus:outline-none focus:bg-white focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Remember Me & Forgot Password */}
                <div className="flex items-center justify-between text-xs pt-1">
                  <label className="flex items-center gap-2 cursor-pointer text-slate-600 font-medium">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-4 h-4 rounded border-slate-300 text-orange-500 focus:ring-0 cursor-pointer accent-orange-500"
                    />
                    <span>Remember Me</span>
                  </label>

                  <button
                    type="button"
                    onClick={() => navigate('/forgot-password')}
                    className="text-orange-600 hover:text-orange-700 font-bold text-[11px] cursor-pointer"
                  >
                    Forgot Password?
                  </button>
                </div>

                {/* Submit Pill Button */}
                <div className="pt-3">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-4 rounded-full font-extrabold text-sm text-white bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 flex items-center justify-center gap-2 shadow-[0_10px_30px_rgba(249,115,22,0.35)] disabled:opacity-50 cursor-pointer transition-all"
                  >
                    <span>{isSubmitting ? 'Signing in as Admin...' : 'Sign In as Admin'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </motion.button>
                </div>
              </motion.form>
            )}
          </AnimatePresence>

        </div>
      </motion.div>
    </div>
  );
};

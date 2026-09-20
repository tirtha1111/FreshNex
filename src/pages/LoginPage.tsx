import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Mail, Lock, Eye, EyeOff, ArrowRight, AlertCircle, QrCode, Shield, Sparkles, Package } from 'lucide-react';
import { Logo } from '../components/common/Logo';
import { useAuth } from '../context/AuthContext';
import { AnimatedBackground } from '../components/common/AnimatedBackground';

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

  const handleQuickPreset = (tag: string) => {
    setProductId(tag);
    setLocalError(null);
  };

  const handleQuickAdminPreset = () => {
    setAdminEmail('admin@freshnex.com');
    setAdminPassword('admin123');
    setLocalError(null);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="min-h-screen bg-[#140C08] flex flex-col justify-center items-center px-4 py-12 select-none relative overflow-hidden font-sans"
    >
      <AnimatedBackground />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="w-full max-w-md space-y-6 relative z-10"
      >
        {/* Brand Logo & Header */}
        <div className="text-center space-y-2">
          <div className="flex justify-center">
            <Logo size="lg" linkTo="/" />
          </div>
          <h2 className="text-2xl font-black text-[#FDF8F5] tracking-tight mt-3">
            FreshNex Gateway Login
          </h2>
          <p className="text-xs text-[#B8A89E] font-medium">
            Select your access role to connect to the supply chain intelligence portal.
          </p>
        </div>

        {/* Tab Switcher: User (Product ID) vs Admin */}
        <div className="grid grid-cols-2 p-1.5 rounded-2xl bg-[#1E140E] border border-[#3D261A] shadow-inner">
          <button
            type="button"
            onClick={() => {
              setLoginMode('user');
              setLocalError(null);
              clearAuthError();
            }}
            className={`py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center justify-center gap-2 ${
              loginMode === 'user'
                ? 'bg-[#FF6A00] text-[#140C08] shadow-[0_4px_15px_rgba(255,106,0,0.35)]'
                : 'text-[#B8A89E] hover:text-[#FDF8F5]'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>User (Product ID)</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setLoginMode('admin');
              setLocalError(null);
              clearAuthError();
            }}
            className={`py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center justify-center gap-2 ${
              loginMode === 'admin'
                ? 'bg-[#20E79A] text-[#07221A] shadow-[0_4px_15px_rgba(32,231,154,0.35)]'
                : 'text-[#B8A89E] hover:text-[#FDF8F5]'
            }`}
          >
            <Shield className="w-4 h-4" />
            <span>Admin Login</span>
          </button>
        </div>

        {/* Form Card Container */}
        <div className="card-solid p-7 space-y-5 shadow-2xl relative border border-[#3D261A] overflow-hidden">
          <div className={`absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent ${
            loginMode === 'user' ? 'via-[#FF6A00]/70' : 'via-[#20E79A]/70'
          } to-transparent`} />

          {(localError || authError) && (
            <motion.div 
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-3.5 rounded-xl bg-[#FF5A67]/15 border border-[#FF5A67]/30 flex items-start gap-2.5 text-[#FF5A67] text-xs font-semibold"
            >
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{localError || authError}</span>
            </motion.div>
          )}

          <AnimatePresence mode="wait">
            {loginMode === 'user' ? (
              <motion.form
                key="user-form"
                initial={{ opacity: 0, x: -15 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 15 }}
                transition={{ duration: 0.25 }}
                onSubmit={handleUserProductSubmit}
                className="space-y-4"
              >
                <div className="space-y-1">
                  <h3 className="text-sm font-black text-[#FDF8F5] flex items-center gap-2">
                    <span>Product Unique ID Access</span>
                    <span className="px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider bg-[#FF6A00]/15 text-[#FF6A00] border border-[#FF6A00]/30">
                      User Portal
                    </span>
                  </h3>
                  <p className="text-xs text-[#B8A89E] font-medium leading-relaxed">
                    Enter the unique product Tag ID printed on your IoT package to unlock its dedicated monitoring portal.
                  </p>
                </div>

                {/* Product Tag ID Input */}
                <div className="space-y-1.5 pt-1">
                  <label className="text-xs font-bold text-[#B8A89E] block">
                    Unique Product Tag ID
                  </label>
                  <div className="relative">
                    <QrCode className="w-4 h-4 text-[#8C7A70] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="text"
                      required
                      value={productId}
                      onChange={(e) => setProductId(e.target.value)}
                      placeholder="e.g. MILK or MEAT"
                      className="w-full pl-10 pr-4 py-2.5 bg-[#1E140E] text-sm font-bold text-[#FDF8F5] placeholder-[#8C7A70] rounded-xl border border-[#3D261A] focus:outline-none focus:border-[#FF6A00] focus:ring-2 focus:ring-[#FF6A00]/20 transition-all uppercase font-mono tracking-wider"
                    />
                  </div>
                </div>

                {/* Quick Presets */}
                <div className="space-y-2 pt-1">
                  <span className="text-[10px] font-bold text-[#8C7A70] uppercase tracking-wider block">
                    Registered Tag Shortcuts:
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleQuickPreset('MILK')}
                      className={`flex-1 py-1.5 px-2.5 rounded-lg border text-xs font-extrabold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                        productId.toUpperCase() === 'MILK'
                          ? 'bg-[#20E79A]/20 border-[#20E79A] text-[#20E79A]'
                          : 'bg-[#1E140E] border-[#3D261A] text-[#B8A89E] hover:text-[#FDF8F5]'
                      }`}
                    >
                      <Sparkles className="w-3 h-3 text-[#20E79A]" />
                      <span>MILK (Live)</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleQuickPreset('MEAT')}
                      className={`flex-1 py-1.5 px-2.5 rounded-lg border text-xs font-extrabold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                        productId.toUpperCase() === 'MEAT'
                          ? 'bg-[#FFAA00]/20 border-[#FFAA00] text-[#FFAA00]'
                          : 'bg-[#1E140E] border-[#3D261A] text-[#B8A89E] hover:text-[#FDF8F5]'
                      }`}
                    >
                      <AlertCircle className="w-3 h-3 text-[#FFAA00]" />
                      <span>MEAT (Pending)</span>
                    </button>
                  </div>
                </div>

                {/* Submit Button */}
                <div className="pt-3">
                  <motion.button
                    whileHover={{ scale: 1.02, y: -1 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3 rounded-xl font-bold text-sm text-[#140C08] btn-orange flex items-center justify-center gap-2 shadow-[0_4px_25px_rgba(255,106,0,0.35)] disabled:opacity-50 cursor-pointer"
                  >
                    <span>{isSubmitting ? 'Authenticating Product...' : 'Access Product Portal'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </motion.button>
                </div>
              </motion.form>
            ) : (
              <motion.form
                key="admin-form"
                initial={{ opacity: 0, x: 15 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -15 }}
                transition={{ duration: 0.25 }}
                onSubmit={handleAdminSubmit}
                className="space-y-4"
              >
                <div className="space-y-1">
                  <h3 className="text-sm font-black text-[#FDF8F5] flex items-center gap-2">
                    <span>Administrator Credentials</span>
                    <span className="px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider bg-[#20E79A]/15 text-[#20E79A] border border-[#20E79A]/30">
                      System Admin
                    </span>
                  </h3>
                  <p className="text-xs text-[#B8A89E] font-medium leading-relaxed">
                    Full access to all registered products, live devices, system configurations, and user management.
                  </p>
                </div>

                {/* Admin Email */}
                <div className="space-y-1.5 pt-1">
                  <label className="text-xs font-bold text-[#B8A89E] block">
                    Admin Email Address
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-[#8C7A70] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="email"
                      required
                      value={adminEmail}
                      onChange={(e) => setAdminEmail(e.target.value)}
                      placeholder="admin@freshnex.com"
                      className="w-full pl-10 pr-4 py-2.5 bg-[#1E140E] text-sm text-[#FDF8F5] placeholder-[#8C7A70] rounded-xl border border-[#3D261A] focus:outline-none focus:border-[#20E79A] focus:ring-2 focus:ring-[#20E79A]/20 transition-all"
                    />
                  </div>
                </div>

                {/* Admin Password */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#B8A89E] block">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-[#8C7A70] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={adminPassword}
                      onChange={(e) => setAdminPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-11 py-2.5 bg-[#1E140E] text-sm text-[#FDF8F5] placeholder-[#8C7A70] rounded-xl border border-[#3D261A] focus:outline-none focus:border-[#20E79A] focus:ring-2 focus:ring-[#20E79A]/20 transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#8C7A70] hover:text-[#FDF8F5] cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Fill Admin Preset */}
                <div className="flex justify-end pt-0.5">
                  <button
                    type="button"
                    onClick={handleQuickAdminPreset}
                    className="text-[10px] text-[#20E79A] font-bold hover:underline cursor-pointer"
                  >
                    Autofill Admin Demo Credentials
                  </button>
                </div>

                {/* Admin Submit Button */}
                <div className="pt-2">
                  <motion.button
                    whileHover={{ scale: 1.02, y: -1 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3 rounded-xl font-bold text-sm text-[#07221A] bg-[#20E79A] hover:bg-[#1bd48c] flex items-center justify-center gap-2 shadow-[0_4px_25px_rgba(32,231,154,0.3)] disabled:opacity-50 cursor-pointer transition-all"
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
    </motion.div>
  );
};

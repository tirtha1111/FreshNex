import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useApp } from '../context/AppContext';
import { Role } from '../types';
import { ShieldCheck, Mail, Lock, User, Eye, EyeOff, ArrowRight, CheckCircle2, AlertCircle, Sparkles, KeyRound } from 'lucide-react';

interface AuthProps {
  onSuccess?: () => void;
  initialMode?: 'login' | 'signup';
}

export const AuthScreen: React.FC<AuthProps> = ({ onSuccess, initialMode = 'login' }) => {
  const { login, signup, resetPassword, authError, isLoading } = useApp();
  const [mode, setMode] = useState<'login' | 'signup' | 'forgot'>(initialMode);
  const [activeRoleTab, setActiveRoleTab] = useState<Role>('user');

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setSuccessMsg(null);

    if (!email.trim() || !password) {
      setFormError('Please enter both email and password.');
      return;
    }

    setIsSubmitting(true);
    try {
      await login(email.trim(), password, activeRoleTab);
      if (onSuccess) onSuccess();
    } catch (err: any) {
      setFormError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setSuccessMsg(null);

    if (!fullName.trim() || !email.trim() || !password) {
      setFormError('Please fill in all required fields.');
      return;
    }

    if (password.length < 6) {
      setFormError('Password must be at least 6 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setFormError('Passwords do not match.');
      return;
    }

    setIsSubmitting(true);
    try {
      await signup(email.trim(), password, fullName.trim());
      setSuccessMsg('Account created successfully! Redirecting...');
      setTimeout(() => {
        if (onSuccess) onSuccess();
      }, 1000);
    } catch (err: any) {
      setFormError(err.message || 'Registration failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setSuccessMsg(null);

    if (!email.trim()) {
      setFormError('Please enter your email address.');
      return;
    }

    setIsSubmitting(true);
    try {
      await resetPassword(email.trim());
      setSuccessMsg('Password reset email sent! Check your inbox.');
    } catch (err: any) {
      setFormError(err.message || 'Failed to send reset link.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center p-4 bg-gradient-to-br from-[#F5F9FF] via-[#EAF4FF] to-[#D9ECFF] relative overflow-hidden">
      {/* Background Glass Orbs */}
      <div className="absolute top-[-10%] right-[-10%] w-96 h-96 rounded-full bg-[#1267D6]/15 blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-96 h-96 rounded-full bg-[#2196F3]/20 blur-3xl pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md relative z-10"
      >
        {/* Brand Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#1267D6] to-[#2196F3] text-white shadow-xl shadow-sky-500/25 mb-3">
            <ShieldCheck className="w-9 h-9" />
          </div>
          <h1 className="text-3xl font-black tracking-tight text-[#082A52]">
            Fresh<span className="text-[#1267D6]">Nex</span>
          </h1>
          <p className="text-xs font-semibold text-[#1267D6]/80 tracking-wider uppercase mt-1">
            Smart Food Monitoring Console
          </p>
        </div>

        {/* Main Glass Card */}
        <div className="glass-card rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl border border-white/80">
          {mode === 'login' && (
            <>
              {/* USER / ADMIN Tab Switcher */}
              <div className="grid grid-cols-2 p-1.5 bg-[#EAF4FF] rounded-2xl mb-6 border border-sky-100">
                <button
                  type="button"
                  onClick={() => {
                    setActiveRoleTab('user');
                    setFormError(null);
                  }}
                  className={`py-2.5 text-xs font-bold rounded-xl transition-all duration-300 flex items-center justify-center gap-2 ${
                    activeRoleTab === 'user'
                      ? 'bg-gradient-to-r from-[#1267D6] to-[#2196F3] text-white shadow-md'
                      : 'text-[#082A52]/70 hover:text-[#082A52]'
                  }`}
                >
                  <User className="w-4 h-4" />
                  USER LOGIN
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setActiveRoleTab('admin');
                    setFormError(null);
                  }}
                  className={`py-2.5 text-xs font-bold rounded-xl transition-all duration-300 flex items-center justify-center gap-2 ${
                    activeRoleTab === 'admin'
                      ? 'bg-gradient-to-r from-[#082A52] to-[#1267D6] text-white shadow-md'
                      : 'text-[#082A52]/70 hover:text-[#082A52]'
                  }`}
                >
                  <ShieldCheck className="w-4 h-4" />
                  ADMIN LOGIN
                </button>
              </div>

              <div className="mb-4">
                <h2 className="text-xl font-bold text-[#082A52]">
                  {activeRoleTab === 'admin' ? 'Admin Portal Access' : 'Welcome Back'}
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  {activeRoleTab === 'admin' 
                    ? 'Log in with administrator credentials to manage devices & system' 
                    : 'Log in to view live food package telemetry & scan history'}
                </p>
              </div>

              {(formError || authError) && (
                <div className="p-3 mb-4 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{formError || authError}</span>
                </div>
              )}

              {successMsg && (
                <div className="p-3 mb-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{successMsg}</span>
                </div>
              )}

              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-[#082A52] uppercase tracking-wider mb-1.5">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-sky-600/60" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder={activeRoleTab === 'admin' ? 'admin@freshnex.io' : 'user@example.com'}
                      className="w-full glass-input pl-11 pr-4 py-3 rounded-xl text-sm font-medium text-[#082A52] placeholder-slate-400"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="block text-xs font-bold text-[#082A52] uppercase tracking-wider">
                      Password
                    </label>
                    <button
                      type="button"
                      onClick={() => setMode('forgot')}
                      className="text-xs font-semibold text-[#1267D6] hover:underline"
                    >
                      Forgot Password?
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-sky-600/60" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full glass-input pl-11 pr-11 py-3 rounded-xl text-sm font-medium text-[#082A52] placeholder-slate-400"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-sky-600"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3.5 px-4 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-[#1267D6] via-[#1A73E8] to-[#2196F3] hover:brightness-110 active:scale-[0.99] transition-all duration-200 shadow-lg shadow-sky-500/25 flex items-center justify-center gap-2 mt-2"
                >
                  {isSubmitting ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>LOG IN AS {activeRoleTab.toUpperCase()}</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>

              {/* Registration Prompt for Normal Users */}
              {activeRoleTab === 'user' && (
                <div className="mt-6 text-center pt-4 border-t border-sky-100/80">
                  <p className="text-xs text-slate-500 font-medium">
                    Don't have an account?{' '}
                    <button
                      onClick={() => {
                        setMode('signup');
                        setFormError(null);
                      }}
                      className="font-bold text-[#1267D6] hover:underline ml-1"
                    >
                      Create User Account
                    </button>
                  </p>
                </div>
              )}
            </>
          )}

          {mode === 'signup' && (
            <>
              <div className="mb-4">
                <h2 className="text-xl font-bold text-[#082A52]">Create User Account</h2>
                <p className="text-xs text-slate-500 mt-1">Register to track food freshness & save scan history</p>
              </div>

              {(formError || authError) && (
                <div className="p-3 mb-4 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{formError || authError}</span>
                </div>
              )}

              {successMsg && (
                <div className="p-3 mb-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{successMsg}</span>
                </div>
              )}

              <form onSubmit={handleSignupSubmit} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-bold text-[#082A52] uppercase tracking-wider mb-1">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-sky-600/60" />
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={e => setFullName(e.target.value)}
                      placeholder="Jane Doe"
                      className="w-full glass-input pl-11 pr-4 py-2.5 rounded-xl text-sm font-medium text-[#082A52]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#082A52] uppercase tracking-wider mb-1">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-sky-600/60" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="user@example.com"
                      className="w-full glass-input pl-11 pr-4 py-2.5 rounded-xl text-sm font-medium text-[#082A52]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#082A52] uppercase tracking-wider mb-1">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-sky-600/60" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full glass-input pl-11 pr-11 py-2.5 rounded-xl text-sm font-medium text-[#082A52]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-sky-600"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#082A52] uppercase tracking-wider mb-1">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <Lock className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-sky-600/60" />
                    <input
                      type="password"
                      required
                      value={confirmPassword}
                      onChange={e => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full glass-input pl-11 pr-4 py-2.5 rounded-xl text-sm font-medium text-[#082A52]"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3.5 px-4 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-[#1267D6] via-[#1A73E8] to-[#2196F3] hover:brightness-110 transition-all shadow-lg shadow-sky-500/25 flex items-center justify-center gap-2 mt-4"
                >
                  {isSubmitting ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>CREATE USER ACCOUNT</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>

              <div className="mt-5 text-center pt-3 border-t border-sky-100">
                <p className="text-xs text-slate-500">
                  Already have an account?{' '}
                  <button
                    onClick={() => {
                      setMode('login');
                      setFormError(null);
                    }}
                    className="font-bold text-[#1267D6] hover:underline ml-1"
                  >
                    Log In
                  </button>
                </p>
              </div>
            </>
          )}

          {mode === 'forgot' && (
            <>
              <div className="mb-4">
                <h2 className="text-xl font-bold text-[#082A52]">Reset Password</h2>
                <p className="text-xs text-slate-500 mt-1">Enter your registered email to receive a password reset link</p>
              </div>

              {formError && (
                <div className="p-3 mb-4 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              {successMsg && (
                <div className="p-3 mb-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{successMsg}</span>
                </div>
              )}

              <form onSubmit={handleForgotSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-[#082A52] uppercase tracking-wider mb-1">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-sky-600/60" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="user@example.com"
                      className="w-full glass-input pl-11 pr-4 py-3 rounded-xl text-sm font-medium text-[#082A52]"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3.5 px-4 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-[#1267D6] to-[#2196F3] shadow-lg shadow-sky-500/25 flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <span>SEND RESET LINK</span>
                  )}
                </button>
              </form>

              <div className="mt-5 text-center pt-3 border-t border-sky-100">
                <button
                  onClick={() => {
                    setMode('login');
                    setFormError(null);
                  }}
                  className="text-xs font-bold text-[#1267D6] hover:underline"
                >
                  ← Back to Login
                </button>
              </div>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
};

// Aliases for export compatibility
export const Login: React.FC = () => <AuthScreen initialMode="login" />;
export const SignUp: React.FC = () => <AuthScreen initialMode="signup" />;
export const ForgotPassword: React.FC = () => <AuthScreen initialMode="login" />;

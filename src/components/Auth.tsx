import React, { useState } from 'react';
import { motion } from 'motion/react';
import { useApp } from '../context/AppContext';
import { Role } from '../types';
import { 
  ChevronLeft, 
  Leaf, 
  Mail, 
  Lock, 
  User, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  CheckCircle2, 
  AlertCircle,
  Heart,
  Globe,
  ShieldCheck
} from 'lucide-react';

interface AuthProps {
  onSuccess?: () => void;
  initialMode?: 'login' | 'signup' | 'forgot';
  onBackToWelcome?: () => void;
}

export const AuthScreen: React.FC<AuthProps> = ({ 
  onSuccess, 
  initialMode = 'login',
  onBackToWelcome
}) => {
  const { login, signup, resetPassword, authError } = useApp();
  const [mode, setMode] = useState<'login' | 'signup' | 'forgot'>(initialMode);
  const [activeRoleTab, setActiveRoleTab] = useState<Role>('user');

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [rememberMe, setRememberMe] = useState(true);

  // Quick fill helper for testing
  const handleQuickFill = (role: 'user' | 'admin') => {
    if (role === 'user') {
      setActiveRoleTab('user');
      setEmail('alex.johnson@freshnex.com');
      setPassword('password123');
    } else {
      setActiveRoleTab('admin');
      setEmail('admin@freshnex.com');
      setPassword('admin123');
    }
  };

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
      setSuccessMsg('Account created successfully!');
      setTimeout(() => {
        if (onSuccess) onSuccess();
      }, 800);
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
    <div className="min-h-screen w-full flex flex-col items-center justify-between p-4 py-6 bg-[#0b0b0c] relative overflow-y-auto select-none text-[#edeff2]">
      
      {/* Background ambient light */}
      <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-[#1267D6]/5 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-72 h-72 rounded-full bg-[#21c55d]/5 blur-3xl pointer-events-none" />

      {/* Top Bar with Back Arrow (<) and FreshNex Logo */}
      <div className="w-full max-w-md flex items-center justify-between z-10 mb-2">
        <button
          onClick={() => {
            if (mode === 'signup') {
              setMode('login');
            } else if (onBackToWelcome) {
              onBackToWelcome();
            }
          }}
          className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-[#edeff2] hover:bg-white/10 shadow-xs cursor-pointer"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        {/* Center FreshNex Logo */}
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-[#1267D6] to-[#21c55d] flex items-center justify-center text-white shadow-lg shadow-emerald-500/10">
            <Leaf className="w-4 h-4 text-white" />
          </div>
          <h1 className="text-xl font-black text-white tracking-tight">
            Fresh<span className="text-[#38bdf8]">Nex</span>
          </h1>
        </div>

        {/* Role toggle badge */}
        <button
          onClick={() => {
            const nextRole = activeRoleTab === 'user' ? 'admin' : 'user';
            handleQuickFill(nextRole);
          }}
          className="px-3 py-1 rounded-full text-[9px] font-mono font-extrabold uppercase tracking-widest bg-[rgba(33,197,93,0.1)] text-[#21c55d] border border-[rgba(33,197,93,0.15)] cursor-pointer hover:brightness-110 transition-colors"
        >
          {activeRoleTab === 'user' ? 'Consumer' : 'Admin'}
        </button>
      </div>

      {/* Main Content Area */}
      <motion.div
        key={mode}
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -15 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-md relative z-10 my-auto"
      >
        {/* Error / Success Notifications */}
        {(formError || authError) && (
          <div className="p-3.5 mb-4.5 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span className="font-semibold">{formError || authError}</span>
          </div>
        )}

        {successMsg && (
          <div className="p-3.5 mb-4.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-[#21c55d] text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span className="font-semibold">{successMsg}</span>
          </div>
        )}

        {/* ==================== LOGIN VIEW ==================== */}
        {mode === 'login' ? (
          <div className="space-y-4">
            {/* Title & Subtitle */}
            <div className="text-center space-y-1 mb-5">
              <h2 className="text-2xl font-black text-white tracking-tight">
                Welcome Back!
              </h2>
              <p className="text-xs font-semibold text-slate-400">
                Log in to continue your FreshNex journey.
              </p>
            </div>

            <form onSubmit={handleLoginSubmit} className="space-y-3.5">
              {/* Email Field */}
              <div>
                <label className="block text-[10px] font-black uppercase text-slate-400 tracking-wider mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4.5 h-4.5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="w-full h-12 bg-white/5 pl-11 pr-4 py-3 rounded-2xl text-xs font-semibold text-white border border-white/5 focus:border-[#21c55d] outline-none transition-all placeholder:text-slate-600 shadow-xs"
                  />
                </div>
              </div>

              {/* Password Field */}
              <div>
                <label className="block text-[10px] font-black uppercase text-slate-400 tracking-wider mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4.5 h-4.5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full h-12 bg-white/5 pl-11 pr-11 py-3 rounded-2xl text-xs font-semibold text-white border border-white/5 focus:border-[#21c55d] outline-none transition-all placeholder:text-slate-600 shadow-xs"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-[#21c55d] cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Remember Me & Forgot Password Row */}
              <div className="flex items-center justify-between text-xs font-bold pt-0.5">
                <label className="flex items-center gap-2 cursor-pointer text-slate-400">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={e => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded border-white/10 bg-white/5 text-[#21c55d] focus:ring-0 cursor-pointer"
                  />
                  <span>Remember me</span>
                </label>
                <button
                  type="button"
                  onClick={() => setMode('forgot')}
                  className="text-[#21c55d] hover:underline cursor-pointer font-black"
                >
                  Forgot password?
                </button>
              </div>

              {/* Primary Action Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-12 rounded-2xl font-black text-xs text-[#0b0b0c] bg-[#21c55d] shadow-lg shadow-emerald-500/10 flex items-center justify-center gap-2 active:scale-[0.98] transition-all cursor-pointer mt-3"
              >
                {isSubmitting ? (
                  <div className="w-5 h-5 border-2 border-[#0b0b0c] border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Log In →</span>
                  </>
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="relative flex py-2 items-center">
              <div className="flex-grow border-t border-white/5"></div>
              <span className="flex-shrink mx-3 text-[10px] text-slate-500 font-mono font-extrabold uppercase tracking-widest">
                or continue with
              </span>
              <div className="flex-grow border-t border-white/5"></div>
            </div>

            {/* Google / Microsoft fast demo logins */}
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => handleQuickFill('user')}
                className="flex items-center justify-center gap-2 h-11 border border-white/5 rounded-2xl text-xs font-black text-white bg-white/5 hover:bg-white/10 transition-colors shadow-xs cursor-pointer"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="#EA4335" d="M12 5.04c1.62 0 3.08.56 4.22 1.64l3.15-3.15C17.45 1.74 14.93 1 12 1 7.35 1 3.4 3.65 1.48 7.5l3.6 2.8C6.01 7.04 8.78 5.04 12 5.04z" />
                  <path fill="#4285F4" d="M23.49 12.27c0-.81-.07-1.59-.2-2.27H12v4.51h6.46c-.29 1.48-1.14 2.73-2.4 3.58l3.6 2.8c2.1-1.94 3.83-4.79 3.83-8.62z" />
                  <path fill="#FBBC05" d="M5.08 14.3c-.25-.75-.39-1.55-.39-2.3s.14-1.55.39-2.3L1.48 6.9C.53 8.78 0 10.84 0 13s.53 4.22 1.48 6.1l3.6-2.8z" />
                  <path fill="#34A853" d="M12 23c3.24 0 5.97-1.07 7.96-2.91l-3.6-2.8c-1.1.74-2.52 1.18-4.36 1.18-3.22 0-5.99-2-6.96-4.96l-3.6 2.8C3.4 20.35 7.35 23 12 23z" />
                </svg>
                <span>Google</span>
              </button>
              <button
                type="button"
                onClick={() => handleQuickFill('admin')}
                className="flex items-center justify-center gap-2 h-11 border border-white/5 rounded-2xl text-xs font-black text-white bg-white/5 hover:bg-white/10 transition-colors shadow-xs cursor-pointer"
              >
                <svg className="w-4 h-4" viewBox="0 0 23 23">
                  <path fill="#F35325" d="M0 0h11v11H0z" />
                  <path fill="#80BC06" d="M12 0h11v11H12z" />
                  <path fill="#05A6F0" d="M0 12h11v11H0z" />
                  <path fill="#FFBA08" d="M12 12h11v11H12z" />
                </svg>
                <span>Microsoft</span>
              </button>
            </div>

            {/* Switch to Sign up */}
            <div className="text-center pt-2">
              <p className="text-xs font-semibold text-slate-400">
                Don't have an account?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setMode('signup');
                    setFormError(null);
                  }}
                  className="font-black text-[#21c55d] hover:underline cursor-pointer"
                >
                  Sign up
                </button>
              </p>
            </div>
          </div>
        ) : mode === 'signup' ? (
          // ==================== SIGN UP VIEW ====================
          <div className="space-y-4">
            {/* Title & Subtitle */}
            <div className="text-center space-y-1 mb-4">
              <h2 className="text-2xl font-black text-white tracking-tight">
                Create Your Account
              </h2>
              <p className="text-xs font-semibold text-slate-400">
                Join FreshNex and be part of a safer, healthier tomorrow.
              </p>
            </div>

            <form onSubmit={handleSignupSubmit} className="space-y-3">
              {/* Full Name */}
              <div>
                <label className="block text-[10px] font-black uppercase text-slate-400 tracking-wider mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <User className="w-4.5 h-4.5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={e => setFullName(e.target.value)}
                    placeholder="Enter your full name"
                    className="w-full h-11 bg-white/5 pl-11 pr-4 py-2.5 rounded-2xl text-xs font-semibold text-white border border-white/5 focus:border-[#21c55d] outline-none transition-all placeholder:text-slate-600 shadow-xs"
                  />
                </div>
              </div>

              {/* Email Address */}
              <div>
                <label className="block text-[10px] font-black uppercase text-slate-400 tracking-wider mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4.5 h-4.5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="Enter your email address"
                    className="w-full h-11 bg-white/5 pl-11 pr-4 py-2.5 rounded-2xl text-xs font-semibold text-white border border-white/5 focus:border-[#21c55d] outline-none transition-all placeholder:text-slate-600 shadow-xs"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-[10px] font-black uppercase text-slate-400 tracking-wider mb-1">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4.5 h-4.5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="Create a password"
                    className="w-full h-11 bg-white/5 pl-11 pr-11 py-2.5 rounded-2xl text-xs font-semibold text-white border border-white/5 focus:border-[#21c55d] outline-none transition-all placeholder:text-slate-600 shadow-xs"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-[#21c55d] cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-[10px] font-black uppercase text-slate-400 tracking-wider mb-1">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="w-4.5 h-4.5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    placeholder="Confirm your password"
                    className="w-full h-11 bg-white/5 pl-11 pr-11 py-2.5 rounded-2xl text-xs font-semibold text-white border border-white/5 focus:border-[#21c55d] outline-none transition-all placeholder:text-slate-600 shadow-xs"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-[#21c55d] cursor-pointer"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Create Account Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-12 rounded-2xl font-black text-xs text-[#0b0b0c] bg-[#21c55d] shadow-lg shadow-emerald-500/10 flex items-center justify-center gap-2 active:scale-[0.98] transition-all cursor-pointer mt-3"
              >
                {isSubmitting ? (
                  <div className="w-5 h-5 border-2 border-[#0b0b0c] border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Create Account →</span>
                  </>
                )}
              </button>
            </form>

            {/* Footer link */}
            <div className="text-center pt-2">
              <p className="text-xs font-semibold text-slate-400">
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setMode('login');
                    setFormError(null);
                  }}
                  className="font-black text-[#21c55d] hover:underline cursor-pointer"
                >
                  Log in
                </button>
              </p>
            </div>
          </div>
        ) : (
          // Forgot password
          <div className="space-y-4">
            <div className="text-center space-y-1 mb-4">
              <h2 className="text-2xl font-black text-white">Reset Password</h2>
              <p className="text-xs font-semibold text-slate-400">Enter your registered email address</p>
            </div>

            <form onSubmit={handleForgotSubmit} className="space-y-3.5">
              <div>
                <label className="block text-[10px] font-black uppercase text-slate-400 tracking-wider mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4.5 h-4.5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="w-full h-12 bg-white/5 pl-11 pr-4 py-3 rounded-2xl text-xs font-semibold text-white border border-white/5 focus:border-[#21c55d] outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-12 rounded-2xl font-black text-xs text-[#0b0b0c] bg-[#21c55d] shadow-lg shadow-emerald-500/10 flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>SEND RESET LINK</span>
              </button>
            </form>

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => setMode('login')}
                className="text-xs font-black text-[#21c55d] hover:underline cursor-pointer"
              >
                ← Back to Login
              </button>
            </div>
          </div>
        )}
      </motion.div>

      {/* Bottom 3 Icon Badges */}
      <div className="w-full max-w-md grid grid-cols-3 gap-2 pt-4 border-t border-white/5 z-10 text-center">
        <div className="flex flex-col items-center">
          <div className="w-9 h-9 rounded-full bg-emerald-500/10 text-[#21c55d] border border-emerald-500/15 flex items-center justify-center mb-1">
            <Leaf className="w-4.5 h-4.5" />
          </div>
          <span className="text-[10px] font-mono font-black text-white">Fresher</span>
          <span className="text-[9px] font-bold text-slate-500 -mt-0.5">Food</span>
        </div>

        <div className="flex flex-col items-center">
          <div className="w-9 h-9 rounded-full bg-sky-500/10 text-[#38bdf8] border border-sky-500/15 flex items-center justify-center mb-1">
            <Heart className="w-4.5 h-4.5" />
          </div>
          <span className="text-[10px] font-mono font-black text-white">Healthier</span>
          <span className="text-[9px] font-bold text-slate-500 -mt-0.5">People</span>
        </div>

        <div className="flex flex-col items-center">
          <div className="w-9 h-9 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/15 flex items-center justify-center mb-1">
            <Globe className="w-4.5 h-4.5" />
          </div>
          <span className="text-[10px] font-mono font-black text-white">Brighter</span>
          <span className="text-[9px] font-bold text-slate-500 -mt-0.5">Tomorrow</span>
        </div>
      </div>
    </div>
  );
};

export const Login: React.FC = () => <AuthScreen initialMode="login" />;
export const SignUp: React.FC = () => <AuthScreen initialMode="signup" />;
export const ForgotPassword: React.FC = () => <AuthScreen initialMode="forgot" />;

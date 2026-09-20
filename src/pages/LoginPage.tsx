import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { Mail, Lock, Eye, EyeOff, ArrowRight, AlertCircle } from 'lucide-react';
import { Logo } from '../components/common/Logo';
import { useAuth } from '../context/AuthContext';
import { AnimatedBackground } from '../components/common/AnimatedBackground';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login, authError, clearAuthError } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    clearAuthError();

    if (!email.trim() || !password.trim()) {
      setLocalError('Please enter both your email and password.');
      return;
    }

    setIsSubmitting(true);
    try {
      await login(email.trim(), password);
      navigate('/dashboard');
    } catch (err: any) {
      setLocalError(err.message || 'Failed to sign in. Please verify your credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="min-h-screen bg-[#140C08] flex flex-col justify-center items-center px-4 py-12 select-none relative overflow-hidden"
    >
      <AnimatedBackground />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="w-full max-w-md space-y-8 relative z-10"
      >
        {/* Brand Logo & Header */}
        <div className="text-center space-y-3">
          <div className="flex justify-center">
            <Logo size="lg" linkTo="/" />
          </div>
          <h2 className="text-2xl font-black text-[#FDF8F5] tracking-tight mt-4">
            Welcome back
          </h2>
          <p className="text-sm text-[#B8A89E]">
            Please enter your details to access your freshness dashboard.
          </p>
        </div>

        {/* Card Container */}
        <div className="card-solid p-8 space-y-6 shadow-2xl relative border border-[#FF6A00]/25">
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#FF6A00]/60 to-transparent" />

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

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Field */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#B8A89E] block">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#8C7A70] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="w-full pl-10 pr-4 py-2.5 bg-[#1E140E] text-sm text-[#FDF8F5] placeholder-[#8C7A70] rounded-xl border border-[#3D261A] focus:outline-none focus:border-[#FF6A00] focus:ring-2 focus:ring-[#FF6A00]/20 transition-all"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#B8A89E] block">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#8C7A70] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-11 py-2.5 bg-[#1E140E] text-sm text-[#FDF8F5] placeholder-[#8C7A70] rounded-xl border border-[#3D261A] focus:outline-none focus:border-[#FF6A00] focus:ring-2 focus:ring-[#FF6A00]/20 transition-all"
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

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between text-xs pt-1">
              <label className="flex items-center gap-2 cursor-pointer text-[#B8A89E]">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded bg-[#1E140E] border-[#3D261A] text-[#FF6A00] focus:ring-0 cursor-pointer accent-[#FF6A00]"
                />
                <span>Remember me</span>
              </label>

              <Link
                to="/forgot-password"
                className="text-[#FFAA00] hover:text-[#FF6A00] font-bold transition-colors"
              >
                Forgot Password?
              </Link>
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <motion.button
                whileHover={{ scale: 1.02, y: -1 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 rounded-xl font-bold text-sm text-[#140C08] btn-orange flex items-center justify-center gap-2 shadow-[0_4px_25px_rgba(255,106,0,0.35)] disabled:opacity-50 cursor-pointer"
              >
                <span>{isSubmitting ? 'Signing in...' : 'Sign In'}</span>
                <ArrowRight className="w-4 h-4" />
              </motion.button>
            </div>
          </form>

          {/* Switch to Sign Up */}
          <div className="text-center pt-2 border-t border-[#3D261A]/60">
            <p className="text-xs text-[#B8A89E]">
              Don't have an account yet?{' '}
              <Link to="/signup" className="text-[#FFAA00] hover:text-[#FF6A00] font-bold">
                Sign Up
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

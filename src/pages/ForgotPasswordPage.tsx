import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Mail, ArrowRight, ArrowLeft, CheckCircle2, AlertCircle } from 'lucide-react';
import { Logo } from '../components/common/Logo';
import { useAuth } from '../context/AuthContext';
import { AnimatedBackground } from '../components/common/AnimatedBackground';

export const ForgotPasswordPage: React.FC = () => {
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!email.trim()) {
      setError('Please enter your account email.');
      return;
    }

    setIsSubmitting(true);
    try {
      await resetPassword(email.trim());
      setSubmitted(true);
    } catch (err: any) {
      setError(err.message || 'Failed to send password reset email.');
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
        <div className="text-center space-y-3">
          <div className="flex justify-center">
            <Logo size="lg" linkTo="/" />
          </div>
          <h2 className="text-2xl font-black text-[#FDF8F5] tracking-tight mt-4">
            Reset your password
          </h2>
          <p className="text-sm text-[#B8A89E]">
            Enter your email to receive recovery instructions.
          </p>
        </div>

        <div className="card-solid p-8 space-y-6 shadow-2xl relative border border-[#FF6A00]/25">
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#FF6A00]/60 to-transparent" />

          {error && (
            <motion.div 
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-3.5 rounded-xl bg-[#FF5A67]/15 border border-[#FF5A67]/30 flex items-center gap-2.5 text-[#FF5A67] text-xs font-semibold"
            >
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </motion.div>
          )}

          {submitted ? (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-4 text-center"
            >
              <div className="w-12 h-12 rounded-full bg-[#20E79A]/15 text-[#20E79A] border border-[#20E79A]/30 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-[#FDF8F5]">Check your inbox</h3>
              <p className="text-xs text-[#B8A89E] leading-relaxed">
                If an account exists for <span className="text-[#FFAA00] font-bold">{email}</span>, password reset instructions have been dispatched.
              </p>
              <Link
                to="/login"
                className="inline-flex items-center gap-2 text-xs font-bold text-[#FFAA00] hover:text-[#FF6A00] pt-2"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Return to Login</span>
              </Link>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
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
                    className="w-full pl-10 pr-4 py-2.5 bg-[#1E140E] text-sm text-[#FDF8F5] placeholder-[#8C7A70] rounded-xl border border-[#3D261A] focus:outline-none focus:border-[#FF6A00] focus:ring-2 focus:ring-[#FF6A00]/20"
                  />
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.02, y: -1 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 px-4 rounded-xl font-bold text-sm text-[#140C08] btn-orange flex items-center justify-center gap-2 shadow-md cursor-pointer disabled:opacity-50"
              >
                <span>{isSubmitting ? 'Sending...' : 'Send Reset Link'}</span>
                <ArrowRight className="w-4 h-4" />
              </motion.button>

              <div className="text-center pt-2">
                <Link
                  to="/login"
                  className="inline-flex items-center gap-1.5 text-xs text-[#8C7A70] hover:text-[#FFAA00] font-bold transition-colors"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back to login</span>
                </Link>
              </div>
            </form>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

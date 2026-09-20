import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ShieldCheck, 
  Users, 
  Leaf, 
  Globe, 
  ArrowRight, 
  Play, 
  QrCode, 
  Thermometer, 
  Droplets, 
  Wind, 
  Database, 
  Cpu, 
  ChevronDown,
  CheckCircle2,
  X,
  Sparkles,
  Zap,
  Radio,
  Activity
} from 'lucide-react';
import { Logo } from '../components/common/Logo';
import { Footer } from '../components/common/Footer';
import { ASSETS } from '../assets/images';
import { AnimatedBackground } from '../components/common/AnimatedBackground';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const [videoModalOpen, setVideoModalOpen] = useState(false);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.12,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] },
    },
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      className="min-h-screen bg-[#140C08] text-[#FDF8F5] overflow-x-hidden selection:bg-[#FF6A00]/20 selection:text-[#FFAA00] relative"
    >
      <AnimatedBackground />

      {/* Sticky Top Header */}
      <header className="sticky top-0 z-50 bg-[#140C08]/90 backdrop-blur-xl border-b border-[#3D261A]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-6">
          {/* Left: FreshNex Logo */}
          <Logo size="lg" linkTo="/" />

          {/* Center Navigation Links */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-[#B8A89E]">
            <Link to="/" className="text-[#FF6A00] transition-colors">Home</Link>
            <a href="#features" className="hover:text-[#FDF8F5] transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-[#FDF8F5] transition-colors">How It Works</a>
            <Link to="/about" className="hover:text-[#FDF8F5] transition-colors">Impact</Link>
            <Link to="/about" className="hover:text-[#FDF8F5] transition-colors">About</Link>
          </nav>

          {/* Right: Auth Buttons */}
          <div className="flex items-center gap-3">
            <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}>
              <Link
                to="/login"
                className="px-4 py-2 text-sm font-semibold text-[#FDF8F5] bg-[#261A12] hover:bg-[#302017] border border-[#3D261A] rounded-xl transition-all"
              >
                Login
              </Link>
            </motion.div>
            <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}>
              <Link
                to="/signup"
                className="px-4 py-2 text-sm font-bold text-[#140C08] btn-orange rounded-xl shadow-[0_0_20px_rgba(255,106,0,0.3)]"
              >
                Sign Up
              </Link>
            </motion.div>
          </div>
        </div>
      </header>

      {/* HERO SECTION */}
      <section className="relative pt-10 sm:pt-16 pb-16 lg:pb-24 overflow-hidden z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            {/* Left Hero Column */}
            <motion.div 
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="lg:col-span-6 space-y-6"
            >
              {/* Eyebrow */}
              <motion.div variants={itemVariants} className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FF6A00]/10 border border-[#FF6A00]/30 shadow-[0_0_15px_rgba(255,106,0,0.15)]">
                <span className="w-2 h-2 rounded-full bg-[#FF6A00] animate-ping" />
                <span className="text-[11px] font-extrabold text-[#FFAA00] uppercase tracking-widest">
                  SMART MONITORING. FRESHER TOMORROW.
                </span>
              </motion.div>

              {/* Headline */}
              <motion.h1 
                variants={itemVariants} 
                className="text-4xl sm:text-5xl lg:text-6xl font-black text-[#FDF8F5] tracking-tight leading-[1.1]"
              >
                Good Food<br />
                Lasts <span className="text-[#FF6A00] drop-shadow-[0_0_30px_rgba(255,106,0,0.4)]">Longer</span>
              </motion.h1>

              {/* Description */}
              <motion.p variants={itemVariants} className="text-base sm:text-lg text-[#B8A89E] max-w-lg leading-relaxed font-normal">
                Real-time quality intelligence for safer food. Powered by smart IoT telemetry, continuous VOC gas analysis, and instant RFID tags.
              </motion.p>

              {/* CTA Buttons */}
              <motion.div variants={itemVariants} className="flex flex-wrap items-center gap-4 pt-2">
                <motion.button
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={() => navigate('/dashboard')}
                  className="px-6 py-3.5 rounded-xl font-bold text-[#140C08] btn-orange flex items-center gap-2 shadow-[0_4px_25px_rgba(255,106,0,0.4)] group cursor-pointer"
                >
                  <span>Get Started</span>
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.04, y: -2 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={() => setVideoModalOpen(true)}
                  className="px-5 py-3.5 rounded-xl font-semibold text-[#FDF8F5] bg-[#261A12] hover:bg-[#302017] border border-[#3D261A] hover:border-[#FF6A00]/40 flex items-center gap-2.5 transition-all cursor-pointer shadow-md"
                >
                  <div className="w-6 h-6 rounded-full bg-[#FF6A00]/20 text-[#FF6A00] flex items-center justify-center">
                    <Play className="w-3 h-3 fill-current ml-0.5" />
                  </div>
                  <span>Watch Demo Video</span>
                </motion.button>
              </motion.div>

              {/* 4 Feature Indicators Below */}
              <motion.div variants={itemVariants} className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-6 border-t border-[#3D261A]/60">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-[#261A12] border border-[#3D261A] flex items-center justify-center text-[#20E79A]">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-bold text-[#FDF8F5]">Safer Food</span>
                </div>

                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-[#261A12] border border-[#3D261A] flex items-center justify-center text-[#FF6A00]">
                    <Users className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-bold text-[#FDF8F5]">Healthier People</span>
                </div>

                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-[#261A12] border border-[#3D261A] flex items-center justify-center text-[#20E79A]">
                    <Leaf className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-bold text-[#FDF8F5]">Less Waste</span>
                </div>

                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-[#261A12] border border-[#3D261A] flex items-center justify-center text-[#FFAA00]">
                    <Globe className="w-4 h-4" />
                    </div>
                  <span className="text-xs font-bold text-[#FDF8F5]">Better Planet</span>
                </div>
              </motion.div>
            </motion.div>

            {/* Right Hero Column: Interactive Floating 3D Showcase Card */}
            <div className="lg:col-span-6 relative flex justify-center lg:justify-end">
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 30 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
                className="relative w-full max-w-lg"
              >
                {/* Glowing Aura */}
                <div className="absolute -inset-1 bg-gradient-to-r from-[#FF6A00] to-[#FFAA00] rounded-3xl blur-2xl opacity-25 group-hover:opacity-40 transition duration-1000 animate-pulse-glow" />

                {/* Primary Glass Device Container */}
                <div className="relative rounded-3xl glass-panel p-6 border border-[#FF6A00]/35 shadow-[0_25px_70px_rgba(0,0,0,0.85)] space-y-5">
                  {/* Top Status Bar */}
                  <div className="flex items-center justify-between border-b border-[#3D261A] pb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full bg-emerald-400 animate-ping" />
                      <span className="text-xs font-black tracking-wider text-[#FDF8F5] uppercase">
                        ESP32 NODE #YGS-124
                      </span>
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-[#20E79A]/15 text-[#20E79A] border border-[#20E79A]/30">
                      LIVE STREAMING
                    </span>
                  </div>

                  {/* Active Scanned Product Snapshot */}
                  <div className="p-4 rounded-2xl bg-[#1E140E] border border-[#3D261A] flex items-center gap-4 shadow-inner">
                    <img
                      src="https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&auto=format&fit=crop&q=80"
                      alt="Organic Vine Tomato"
                      className="w-16 h-16 rounded-xl object-cover border border-[#3D261A]"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-black text-[#FDF8F5] truncate">Organic Vine Tomato</h4>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#20E79A]/20 text-[#20E79A] border border-[#20E79A]/30">
                          Fresh
                        </span>
                      </div>
                      <p className="text-xs text-[#FF6A00] font-mono mt-0.5">Tag ID: #FRX1004</p>
                      <p className="text-[11px] text-[#8C7A70] mt-1">Batch BATCH-001 • Vault A4</p>
                    </div>
                  </div>

                  {/* 3 Live Telemetry Sensor Pills */}
                  <div className="grid grid-cols-3 gap-2.5">
                    <motion.div 
                      whileHover={{ scale: 1.05 }}
                      className="p-3 rounded-xl bg-[#261A12] border border-[#3D261A] text-center"
                    >
                      <span className="text-[10px] font-bold text-[#8C7A70] block">TEMP</span>
                      <span className="text-lg font-black text-[#FDF8F5] mt-0.5 block">4.2°C</span>
                      <span className="text-[9px] font-bold text-[#20E79A]">Optimal</span>
                    </motion.div>

                    <motion.div 
                      whileHover={{ scale: 1.05 }}
                      className="p-3 rounded-xl bg-[#261A12] border border-[#3D261A] text-center"
                    >
                      <span className="text-[10px] font-bold text-[#8C7A70] block">HUMIDITY</span>
                      <span className="text-lg font-black text-[#FDF8F5] mt-0.5 block">62%</span>
                      <span className="text-[9px] font-bold text-[#FFAA00]">Stable</span>
                    </motion.div>

                    <motion.div 
                      whileHover={{ scale: 1.05 }}
                      className="p-3 rounded-xl bg-[#261A12] border border-[#3D261A] text-center"
                    >
                      <span className="text-[10px] font-bold text-[#8C7A70] block">VOC GAS</span>
                      <span className="text-lg font-black text-[#FDF8F5] mt-0.5 block">120 ppm</span>
                      <span className="text-[9px] font-bold text-[#FF6A00]">Normal</span>
                    </motion.div>
                  </div>
                </div>

                {/* Floating Decorative Badges with Smooth Bobbing Animation */}
                <motion.div
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                  className="absolute -top-6 -right-6 p-3.5 rounded-2xl glass-card border border-[#FFAA00]/40 shadow-2xl flex items-center gap-2.5"
                >
                  <div className="w-8 h-8 rounded-xl bg-[#FFAA00]/20 text-[#FFAA00] flex items-center justify-center">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-[#8C7A70] block uppercase">Precision Rating</span>
                    <span className="text-xs font-black text-[#FDF8F5]">99.4% Accuracy</span>
                  </div>
                </motion.div>

                <motion.div
                  animate={{ y: [0, 10, 0] }}
                  transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
                  className="absolute -bottom-6 -left-6 p-3.5 rounded-2xl glass-card border border-[#20E79A]/40 shadow-2xl flex items-center gap-2.5"
                >
                  <div className="w-8 h-8 rounded-xl bg-[#20E79A]/20 text-[#20E79A] flex items-center justify-center">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-[#8C7A70] block uppercase">Cold Chain</span>
                    <span className="text-xs font-black text-[#20E79A]">Zero Spoilage</span>
                  </div>
                </motion.div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES SECTION (BENTO GRID WITH ANIMATION) */}
      <section id="features" className="py-20 bg-[#0F0A07] border-y border-[#3D261A] relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <h2 className="text-3xl sm:text-4xl font-black text-[#FDF8F5] tracking-tight">
              Next-Generation Cold-Chain Telemetry
            </h2>
            <p className="text-sm sm:text-base text-[#B8A89E]">
              FreshNex combines calibrated environmental sensors, instant optical scanning, and AI analytics.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Feature 1 */}
            <motion.div 
              whileHover={{ y: -6, scale: 1.02 }}
              transition={{ type: 'spring', stiffness: 350, damping: 25 }}
              className="card-solid p-6 space-y-4 relative overflow-hidden group shadow-xl"
            >
              <div className="w-12 h-12 rounded-2xl bg-[#FF6A00]/15 text-[#FF6A00] border border-[#FF6A00]/30 flex items-center justify-center group-hover:scale-110 transition-transform">
                <QrCode className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-black text-[#FDF8F5]">Instant QR & RFID Tagging</h3>
              <p className="text-xs text-[#B8A89E] leading-relaxed">
                Scan batch tags instantly to bind crate sensors with real-time digital twins. Works seamlessly with existing cold storage inventories.
              </p>
            </motion.div>

            {/* Feature 2 */}
            <motion.div 
              whileHover={{ y: -6, scale: 1.02 }}
              transition={{ type: 'spring', stiffness: 350, damping: 25 }}
              className="card-solid p-6 space-y-4 relative overflow-hidden group shadow-xl"
            >
              <div className="w-12 h-12 rounded-2xl bg-[#FFAA00]/15 text-[#FFAA00] border border-[#FFAA00]/30 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Activity className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-black text-[#FDF8F5]">Real-time VOC Gas & Temp</h3>
              <p className="text-xs text-[#B8A89E] leading-relaxed">
                Continuous sensing of organic volatile chemicals and DHT22 temperatures catches biological deterioration before visual rot happens.
              </p>
            </motion.div>

            {/* Feature 3 */}
            <motion.div 
              whileHover={{ y: -6, scale: 1.02 }}
              transition={{ type: 'spring', stiffness: 350, damping: 25 }}
              className="card-solid p-6 space-y-4 relative overflow-hidden group shadow-xl"
            >
              <div className="w-12 h-12 rounded-2xl bg-[#20E79A]/15 text-[#20E79A] border border-[#20E79A]/30 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Database className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-black text-[#FDF8F5]">Audit Trail & Firebase Sync</h3>
              <p className="text-xs text-[#B8A89E] leading-relaxed">
                Immutable compliance history and automated alerts streamed straight to your dashboard, mobile devices, and regulatory export reports.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS SECTION */}
      <section id="how-it-works" className="py-20 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <h2 className="text-3xl sm:text-4xl font-black text-[#FDF8F5] tracking-tight">
              How FreshNex Operates
            </h2>
            <p className="text-sm text-[#B8A89E]">
              From farm harvest to retail shelf, food tracking is automated in three straightforward steps.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="card-solid p-6 relative space-y-3 text-center sm:text-left">
              <span className="text-3xl font-black text-[#FF6A00] font-mono">01</span>
              <h4 className="text-base font-bold text-[#FDF8F5]">Attach & Scan Tag</h4>
              <p className="text-xs text-[#B8A89E] leading-relaxed">
                Mount ESP32 wireless nodes or attach RFID QR batch badges to produce crates or dairy crates.
              </p>
            </div>

            <div className="card-solid p-6 relative space-y-3 text-center sm:text-left">
              <span className="text-3xl font-black text-[#FFAA00] font-mono">02</span>
              <h4 className="text-base font-bold text-[#FDF8F5]">Continuous Telemetry</h4>
              <p className="text-xs text-[#B8A89E] leading-relaxed">
                Sensors stream temperature, moisture, and VOC gas ppm continuously to Firebase Realtime Database.
              </p>
            </div>

            <div className="card-solid p-6 relative space-y-3 text-center sm:text-left">
              <span className="text-3xl font-black text-[#20E79A] font-mono">03</span>
              <h4 className="text-base font-bold text-[#FDF8F5]">Prevent Spoilage</h4>
              <p className="text-xs text-[#B8A89E] leading-relaxed">
                Instant threshold alerts and automated freshness scoring ensure items are routed before degradation.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* VIDEO MODAL */}
      <AnimatePresence>
        {videoModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setVideoModalOpen(false)}
              className="fixed inset-0 bg-[#140C08]/90 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="relative w-full max-w-3xl glass-modal p-6 border border-[#FF6A00]/40 z-10 space-y-4"
            >
              <div className="flex items-center justify-between pb-3 border-b border-[#3D261A]">
                <div className="flex items-center gap-2">
                  <Play className="w-4 h-4 text-[#FF6A00]" />
                  <span className="text-sm font-bold text-[#FDF8F5]">FreshNex Platform Overview</span>
                </div>
                <button
                  onClick={() => setVideoModalOpen(false)}
                  className="p-1.5 text-[#B8A89E] hover:text-[#FDF8F5] bg-[#261A12] rounded-lg border border-[#3D261A] cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="aspect-video w-full rounded-2xl bg-[#061827] border border-[#3D261A] overflow-hidden flex flex-col items-center justify-center p-6 text-center">
                <div className="w-16 h-16 rounded-full bg-[#FF6A00]/20 text-[#FF6A00] flex items-center justify-center mb-3 animate-pulse">
                  <Play className="w-8 h-8 fill-current ml-1" />
                </div>
                <h4 className="text-base font-black text-[#FDF8F5]">Interactive IoT Telemetry Simulation</h4>
                <p className="text-xs text-[#B8A89E] max-w-md mt-1">
                  Demonstrating live ESP32 provisioning, MQ-135 VOC sensor calibration, and cold-chain alert dispatching in real time.
                </p>
                <button
                  onClick={() => {
                    setVideoModalOpen(false);
                    navigate('/dashboard');
                  }}
                  className="mt-4 px-5 py-2.5 rounded-xl text-xs font-bold text-[#140C08] btn-orange cursor-pointer"
                >
                  Launch Live Dashboard →
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* FOOTER */}
      <Footer />
    </motion.div>
  );
};

import React from 'react';
import { motion } from 'motion/react';
import { 
  ShieldCheck, 
  Eye, 
  Cpu, 
  Leaf, 
  Globe2, 
  ArrowRight,
  CheckCircle2,
  Sparkles
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Footer } from '../components/common/Footer';
import { ASSETS } from '../assets/images';
import { AnimatedBackground } from '../components/common/AnimatedBackground';

export const AboutPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <motion.div 
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="min-h-screen bg-[#140C08] text-[#FDF8F5] select-none flex flex-col justify-between relative overflow-x-hidden"
    >
      <AnimatedBackground />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12 flex-1 relative z-10">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="text-center max-w-2xl mx-auto space-y-3"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FF6A00]/10 border border-[#FF6A00]/30 shadow-[0_0_15px_rgba(255,106,0,0.15)]">
            <Sparkles className="w-3.5 h-3.5 text-[#FFAA00]" />
            <span className="text-[11px] font-bold text-[#FFAA00] uppercase tracking-wider">
              SMARTER FOOD. SAFER TOMORROW.
            </span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-[#FDF8F5] tracking-tight">
            About FreshNex
          </h1>
          <p className="text-base text-[#B8A89E] leading-relaxed">
            Smarter food monitoring for a healthier tomorrow, powered by IoT sensors and instant RFID tracking.
          </p>
        </motion.div>

        {/* Hero Feature Block with Visual Asset */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="card-solid p-6 sm:p-10 relative overflow-hidden shadow-2xl border border-[#FF6A00]/25"
        >
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#FF6A00]/60 to-transparent" />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7 space-y-4">
              <h2 className="text-2xl sm:text-3xl font-black text-[#FDF8F5]">
                Transforming Food Preservation Across the Supply Chain
              </h2>
              <p className="text-sm text-[#B8A89E] leading-relaxed">
                Food spoilage often happens invisibly inside refrigerated transport and cold-storage facilities. By the time visual deterioration occurs, safety is compromised and resources are squandered.
              </p>
              <p className="text-sm text-[#B8A89E] leading-relaxed">
                FreshNex bridges the physical and digital divide. Our connected sensors track micro-fluctuations in storage temperature, ambient moisture, and organic gas outgassing before biological spoilage manifests.
              </p>
              <div className="pt-2">
                <motion.button
                  whileHover={{ scale: 1.04, y: -2 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={() => navigate('/signup')}
                  className="px-6 py-3 rounded-xl font-bold text-xs text-[#140C08] btn-orange flex items-center gap-2 cursor-pointer shadow-md"
                >
                  <span>Join the Freshness Network</span>
                  <ArrowRight className="w-4 h-4" />
                </motion.button>
              </div>
            </div>

            <div className="lg:col-span-5">
              <motion.div 
                whileHover={{ scale: 1.02 }}
                className="relative rounded-2xl overflow-hidden border border-[#3D261A] bg-[#1E140E] shadow-2xl"
              >
                <img
                  src={ASSETS.farmLandscape}
                  alt="Sustainable agriculture and fresh farm logistics"
                  className="w-full h-72 object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#140C08] via-transparent to-transparent opacity-80" />
                <div className="absolute bottom-4 left-4 right-4 p-3 rounded-xl bg-[#261A12]/90 backdrop-blur-md border border-[#3D261A]">
                  <p className="text-[10px] font-bold text-[#20E79A] uppercase tracking-wider">Zero Spoilage Initiative</p>
                  <p className="text-xs text-[#FDF8F5] font-semibold">Continuous farm-to-shelf tracking</p>
                </div>
              </motion.div>
            </div>
          </div>
        </motion.div>

        {/* Three Pillar Cards: Mission, Vision, Technology */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Mission */}
          <motion.div 
            whileHover={{ y: -6, scale: 1.02 }}
            transition={{ type: 'spring', stiffness: 350, damping: 25 }}
            className="card-solid p-6 space-y-3 relative shadow-xl border border-[#FF6A00]/20"
          >
            <div className="w-12 h-12 rounded-2xl bg-[#20E79A]/15 text-[#20E79A] border border-[#20E79A]/30 flex items-center justify-center mb-2">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-black text-[#FDF8F5]">Our Mission</h3>
            <p className="text-xs text-[#B8A89E] leading-relaxed">
              To drastically reduce global food waste and protect consumers from foodborne illnesses through accessible, automated cold-chain IoT telemetry.
            </p>
          </motion.div>

          {/* Vision */}
          <motion.div 
            whileHover={{ y: -6, scale: 1.02 }}
            transition={{ type: 'spring', stiffness: 350, damping: 25 }}
            className="card-solid p-6 space-y-3 relative shadow-xl border border-[#FF6A00]/20"
          >
            <div className="w-12 h-12 rounded-2xl bg-[#FF6A00]/15 text-[#FF6A00] border border-[#FF6A00]/30 flex items-center justify-center mb-2">
              <Eye className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-black text-[#FDF8F5]">Our Vision</h3>
            <p className="text-xs text-[#B8A89E] leading-relaxed">
              A transparent supply chain where every agricultural crate and retail shelf operates with continuous environmental awareness and zero guesswork.
            </p>
          </motion.div>

          {/* Technology */}
          <motion.div 
            whileHover={{ y: -6, scale: 1.02 }}
            transition={{ type: 'spring', stiffness: 350, damping: 25 }}
            className="card-solid p-6 space-y-3 relative shadow-xl border border-[#FF6A00]/20"
          >
            <div className="w-12 h-12 rounded-2xl bg-[#FFAA00]/15 text-[#FFAA00] border border-[#FFAA00]/30 flex items-center justify-center mb-2">
              <Cpu className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-black text-[#FDF8F5]">Our Technology</h3>
            <p className="text-xs text-[#B8A89E] leading-relaxed">
              High-sensitivity DHT22 thermal arrays, MQ-135 volatile organic compound sniffers, and ESP32 nodes connected in real-time to Google Firebase.
            </p>
          </motion.div>
        </div>
      </div>

      <Footer />
    </motion.div>
  );
};

import React from 'react';
import { Link } from 'react-router-dom';
import { Logo } from './Logo';
import { 
  Linkedin, 
  Twitter, 
  Instagram, 
  Youtube, 
  Leaf, 
  Globe2 
} from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full bg-[#061827] border-t border-[#3D261A] pt-14 pb-8 select-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-[#3D261A]/70">
          {/* Brand Col */}
          <div className="lg:col-span-2 space-y-4">
            <Logo size="lg" variant="dark" showTagline={true} linkTo="/" />
            <p className="text-xs font-bold text-[#FF6A00] tracking-widest uppercase">
              SMART FOOD. BRIGHTER TOMORROWS.
            </p>
            <p className="text-sm text-[#B8A89E] max-w-sm leading-relaxed">
              Let's connect for a safer, more sustainable world through intelligent cold-chain IoT sensing and real-time freshness telemetry.
            </p>

            {/* Social Links */}
            <div className="flex items-center gap-3 pt-2">
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noreferrer"
                aria-label="LinkedIn"
                className="w-8 h-8 rounded-lg bg-[#261A12] border border-[#3D261A] flex items-center justify-center text-[#B8A89E] hover:text-[#FF6A00] hover:border-[#FF6A00]/40 transition-colors"
              >
                <Linkedin className="w-4 h-4" />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noreferrer"
                aria-label="Twitter / X"
                className="w-8 h-8 rounded-lg bg-[#261A12] border border-[#3D261A] flex items-center justify-center text-[#B8A89E] hover:text-[#FF6A00] hover:border-[#FF6A00]/40 transition-colors"
              >
                <Twitter className="w-4 h-4" />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noreferrer"
                aria-label="Instagram"
                className="w-8 h-8 rounded-lg bg-[#261A12] border border-[#3D261A] flex items-center justify-center text-[#B8A89E] hover:text-[#FF6A00] hover:border-[#FF6A00]/40 transition-colors"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noreferrer"
                aria-label="YouTube"
                className="w-8 h-8 rounded-lg bg-[#261A12] border border-[#3D261A] flex items-center justify-center text-[#B8A89E] hover:text-[#FF6A00] hover:border-[#FF6A00]/40 transition-colors"
              >
                <Youtube className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-[#FDF8F5] tracking-wider uppercase">
              Quick Links
            </h4>
            <ul className="space-y-2 text-sm text-[#B8A89E]">
              <li>
                <Link to="/" className="hover:text-[#FF6A00] transition-colors">Home</Link>
              </li>
              <li>
                <a href="#features" className="hover:text-[#FF6A00] transition-colors">Features</a>
              </li>
              <li>
                <a href="#how-it-works" className="hover:text-[#FF6A00] transition-colors">How It Works</a>
              </li>
              <li>
                <Link to="/about" className="hover:text-[#FF6A00] transition-colors">Impact</Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-[#FF6A00] transition-colors">About</Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-[#FDF8F5] tracking-wider uppercase">
              Support
            </h4>
            <ul className="space-y-2 text-sm text-[#B8A89E]">
              <li>
                <span className="hover:text-[#FF6A00] cursor-pointer transition-colors">Help Center</span>
              </li>
              <li>
                <span className="hover:text-[#FF6A00] cursor-pointer transition-colors">Contact Us</span>
              </li>
              <li>
                <span className="hover:text-[#FF6A00] cursor-pointer transition-colors">Privacy Policy</span>
              </li>
              <li>
                <span className="hover:text-[#FF6A00] cursor-pointer transition-colors">Terms & Conditions</span>
              </li>
            </ul>
          </div>

          {/* Right Card: Good Food Brighter Tomorrows */}
          <div className="lg:col-span-1">
            <div className="p-6 rounded-2xl bg-[#261A12] border border-[#3D261A] flex flex-col justify-between h-full relative overflow-hidden group hover:border-[#FF6A00]/30 transition-all">
              <div className="space-y-2 relative z-10">
                <div className="w-10 h-10 rounded-xl bg-[#20E79A]/10 border border-[#20E79A]/30 flex items-center justify-center text-[#20E79A] mb-3">
                  <Leaf className="w-5 h-5" />
                </div>
                <h5 className="text-lg font-extrabold text-[#FDF8F5] leading-snug">
                  Good Food<br />Brighter Tomorrows
                </h5>
                <p className="text-xs text-[#8C7A70] leading-relaxed">
                  Real-time sensing for zero food waste and safer nutrition globally.
                </p>
              </div>
              <div className="pt-4 mt-4 border-t border-[#3D261A]/60 flex items-center justify-between text-[11px] text-[#FF6A00] font-semibold">
                <Link to="/signup" className="hover:underline">Join the network →</Link>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom copyright line */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-[#8C7A70] gap-4">
          <p>© 2026 FreshNex. All rights reserved.</p>
          <div className="flex items-center gap-1.5 text-[#B8A89E]">
            <Leaf className="w-3.5 h-3.5 text-[#20E79A]" />
            <span>Designed for a healthier planet.</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

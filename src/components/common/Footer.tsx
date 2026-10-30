import React from 'react';
import { Link } from 'react-router-dom';
import { Logo } from './Logo';
import { 
  Linkedin, 
  Twitter, 
  Instagram, 
  Youtube, 
  Leaf,
  ArrowUpRight
} from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full bg-[#061C14] border-t border-emerald-900/40 pt-16 pb-10 select-none text-emerald-50/90 font-['DM_Sans',sans-serif]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 pb-12 border-b border-emerald-800/30">
          {/* Brand Column */}
          <div className="lg:col-span-5 space-y-5">
            <Logo size="lg" variant="dark" showTagline={false} linkTo="/" />
            <p className="text-sm text-emerald-100/70 max-w-md leading-relaxed">
              Continuous cold-chain quality intelligence combining wireless ESP32 environmental telemetry, volatile organic gas analysis, and optical QR/RFID traceability from farm harvest to table.
            </p>

            {/* Social Links */}
            <div className="flex items-center gap-3 pt-1">
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noreferrer"
                aria-label="LinkedIn"
                className="w-9 h-9 rounded-xl bg-emerald-950/80 border border-emerald-800/50 flex items-center justify-center text-emerald-200/70 hover:text-emerald-300 hover:border-emerald-500/50 transition-colors"
              >
                <Linkedin className="w-4 h-4" />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noreferrer"
                aria-label="Twitter / X"
                className="w-9 h-9 rounded-xl bg-emerald-950/80 border border-emerald-800/50 flex items-center justify-center text-emerald-200/70 hover:text-emerald-300 hover:border-emerald-500/50 transition-colors"
              >
                <Twitter className="w-4 h-4" />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noreferrer"
                aria-label="Instagram"
                className="w-9 h-9 rounded-xl bg-emerald-950/80 border border-emerald-800/50 flex items-center justify-center text-emerald-200/70 hover:text-emerald-300 hover:border-emerald-500/50 transition-colors"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noreferrer"
                aria-label="YouTube"
                className="w-9 h-9 rounded-xl bg-emerald-950/80 border border-emerald-800/50 flex items-center justify-center text-emerald-200/70 hover:text-emerald-300 hover:border-emerald-500/50 transition-colors"
              >
                <Youtube className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Platform Links */}
          <div className="lg:col-span-2 space-y-3.5">
            <h4 className="text-sm font-semibold text-white font-['Plus_Jakarta_Sans',sans-serif]">
              Platform
            </h4>
            <ul className="space-y-2.5 text-sm text-emerald-100/70">
              <li>
                <a href="#simulator" className="hover:text-emerald-300 transition-colors">Freshness Lab</a>
              </li>
              <li>
                <a href="#capabilities" className="hover:text-emerald-300 transition-colors">Capabilities</a>
              </li>
              <li>
                <a href="#workflow" className="hover:text-emerald-300 transition-colors">How It Works</a>
              </li>
              <li>
                <a href="#impact" className="hover:text-emerald-300 transition-colors">Verified Impact</a>
              </li>
            </ul>
          </div>

          {/* Access Portals */}
          <div className="lg:col-span-2 space-y-3.5">
            <h4 className="text-sm font-semibold text-white font-['Plus_Jakarta_Sans',sans-serif]">
              Portals
            </h4>
            <ul className="space-y-2.5 text-sm text-emerald-100/70">
              <li>
                <Link to="/login" className="hover:text-emerald-300 transition-colors">Product Tag Lookup</Link>
              </li>
              <li>
                <Link to="/login" className="hover:text-emerald-300 transition-colors">Admin Console</Link>
              </li>
              <li>
                <Link to="/signup" className="hover:text-emerald-300 transition-colors">Register Node</Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-emerald-300 transition-colors">About FreshNex</Link>
              </li>
            </ul>
          </div>

          {/* Right Action Card */}
          <div className="lg:col-span-3">
            <div className="p-6 rounded-2xl bg-emerald-950/70 border border-emerald-800/50 flex flex-col justify-between h-full">
              <div className="space-y-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-300">
                  <Leaf className="w-4 h-4" />
                </div>
                <h5 className="text-base font-bold text-white font-['Plus_Jakarta_Sans',sans-serif]">
                  Zero-Spoilage Cold Chain
                </h5>
                <p className="text-xs text-emerald-100/65 leading-relaxed">
                  Deploy calibrated sensor nodes or verify a live produce batch in seconds.
                </p>
              </div>
              <div className="pt-4 mt-4 border-t border-emerald-800/40">
                <Link
                  to="/login"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-300 hover:text-emerald-200 transition-colors"
                >
                  <span>Open Telemetry Portal</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom copyright line */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-emerald-200/60 gap-4">
          <p>© 2026 FreshNex Technologies. All rights reserved. · USDA Handbook 66 &amp; Postharvest Compliant</p>
          <div className="flex items-center gap-4">
            <Link to="/about" className="hover:text-emerald-200 transition-colors">Methodology</Link>
            <span aria-hidden="true">·</span>
            <Link to="/login" className="hover:text-emerald-200 transition-colors">Portal Login</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};


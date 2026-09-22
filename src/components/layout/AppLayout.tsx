import React, { useState } from 'react';
import { Outlet, useLocation, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { Home, QrCode, Activity, History, User, X } from 'lucide-react';
import { useFreshness } from '../../context/FreshnessContext';

export const AppLayout: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const { activeItem } = useFreshness();

  const liveDataPath = activeItem ? `/live-data/${activeItem.id}` : '/live-data';

  const mobileNav = [
    { label: 'Home', path: '/dashboard', icon: Home },
    { label: 'Scan', path: '/scan', icon: QrCode },
    { label: 'Live Data', path: liveDataPath, icon: Activity },
    { label: 'History', path: '/history', icon: History },
    { label: 'Profile', path: '/profile', icon: User },
  ];

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#F4F7F6] text-[#07221A] relative">
      {/* Ambient Glass Glow Orbs */}
      <div className="absolute top-[-120px] left-[15%] w-[550px] h-[550px] bg-gradient-to-br from-[#20E79A]/12 via-[#00D2FF]/08 to-transparent rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-150px] right-[10%] w-[600px] h-[600px] bg-gradient-to-tr from-[#20E79A]/10 via-[#3B82F6]/06 to-transparent rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-[40%] right-[30%] w-[400px] h-[400px] bg-gradient-to-r from-[#FFAA00]/06 to-transparent rounded-full blur-3xl pointer-events-none" />

      {/* Desktop Fixed Left Sidebar with Glass & Depth */}
      <div className="hidden md:flex h-full shrink-0 z-20 relative depth-2">
        <Sidebar />
      </div>

      {/* Mobile Drawer Overlay with AnimatePresence */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 flex md:hidden">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="fixed inset-0 bg-[#07221A]/60 backdrop-blur-md"
              onClick={() => setMobileMenuOpen(false)}
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="relative flex-1 flex flex-col max-w-xs w-full glass-modal border-r border-[#13493B]/15 z-10 depth-4"
            >
              <div className="absolute top-4 right-4 z-20">
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="neo-btn p-2 rounded-xl text-[#5C7F75] hover:text-[#07221A] cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <Sidebar onCloseMobile={() => setMobileMenuOpen(false)} />
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden z-10 relative">
        <Topbar onOpenMobileMenu={() => setMobileMenuOpen(true)} />

        <main className="flex-1 overflow-y-auto p-0 pb-24 md:pb-0">
          <div className="max-w-7xl mx-auto">
            <AnimatePresence mode="wait">
              <motion.div
                key={location.pathname}
                initial={{ opacity: 0, y: 16, filter: 'blur(4px)', scale: 0.99 }}
                animate={{ opacity: 1, y: 0, filter: 'blur(0px)', scale: 1 }}
                exit={{ opacity: 0, y: -12, filter: 'blur(3px)', scale: 0.995 }}
                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                className="w-full"
              >
                <Outlet />
              </motion.div>
            </AnimatePresence>
          </div>
        </main>

        {/* Mobile Bottom Navigation with Glass & Neomorphism */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-white/85 backdrop-blur-2xl border-t border-[#13493B]/10 px-3 flex items-center justify-around z-40 shadow-[0_-8px_25px_rgba(7,34,26,0.06)]">
          {mobileNav.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path || (item.path.startsWith('/live-data') && location.pathname.startsWith('/live-data'));

            return (
              <Link
                key={item.label}
                to={item.path}
                className="relative flex flex-col items-center justify-center py-1.5 px-3 rounded-2xl transition-all"
              >
                {isActive && (
                  <motion.div
                    layoutId="mobileNavActive"
                    className="absolute inset-0 bg-[#20E79A]/15 rounded-2xl border border-[#20E79A]/40 shadow-[0_0_12px_rgba(32,231,154,0.3)]"
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}
                <Icon className={`w-5 h-5 relative z-10 transition-colors ${isActive ? 'text-[#07221A] glow-icon-emerald' : 'text-[#5C7F75]'}`} />
                <span className={`text-[10px] font-extrabold mt-0.5 relative z-10 tracking-tight ${isActive ? 'text-[#07221A]' : 'text-[#5C7F75]'}`}>
                  {item.label}
                </span>
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
};



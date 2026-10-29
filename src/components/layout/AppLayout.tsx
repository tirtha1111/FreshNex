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
      {/* Ambient Glass Glow Orbs - Hidden on mobile to preserve GPU fill-rate */}
      <div className="hidden md:block absolute top-[-120px] left-[15%] w-[550px] h-[550px] bg-gradient-to-br from-[#20E79A]/12 via-[#00D2FF]/08 to-transparent rounded-full blur-3xl pointer-events-none" />
      <div className="hidden md:block absolute bottom-[-150px] right-[10%] w-[600px] h-[600px] bg-gradient-to-tr from-[#20E79A]/10 via-[#3B82F6]/06 to-transparent rounded-full blur-3xl pointer-events-none" />
      <div className="hidden md:block absolute top-[40%] right-[30%] w-[400px] h-[400px] bg-gradient-to-r from-[#FFAA00]/06 to-transparent rounded-full blur-3xl pointer-events-none" />

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
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-[#07221A]/65 backdrop-blur-xs"
              onClick={() => setMobileMenuOpen(false)}
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 320 }}
              className="relative flex flex-col w-[280px] sm:w-[300px] max-w-[85vw] h-full bg-[#07221A] border-r border-[#20E79A]/20 z-10 shadow-2xl overflow-hidden"
            >
              <Sidebar onCloseMobile={() => setMobileMenuOpen(false)} />
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden z-10 relative">
        <Topbar onOpenMobileMenu={() => setMobileMenuOpen(true)} />

        <main className="flex-1 overflow-y-auto overflow-x-hidden px-3.5 py-4 sm:px-6 sm:py-6 pb-24 md:pb-8">
          <div className="max-w-7xl mx-auto">
            <AnimatePresence mode="wait">
              <motion.div
                key={location.pathname}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                className="w-full"
              >
                <Outlet />
              </motion.div>
            </AnimatePresence>
          </div>
        </main>

        {/* Mobile Bottom Navigation */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-white/95 backdrop-blur-lg border-t border-[#13493B]/10 px-2 grid grid-cols-5 items-center z-40 shadow-[0_-8px_25px_rgba(7,34,26,0.06)]">
          {mobileNav.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path || (item.path.startsWith('/live-data') && location.pathname.startsWith('/live-data'));

            return (
              <Link
                key={item.label}
                to={item.path}
                className="relative flex flex-col items-center justify-center min-h-[46px] py-1 px-1 rounded-2xl transition-colors"
              >
                {isActive && (
                  <motion.div
                    layoutId="mobileNavActive"
                    className="absolute inset-x-1.5 inset-y-1 bg-[#20E79A]/15 rounded-xl border border-[#20E79A]/40 shadow-[0_0_10px_rgba(32,231,154,0.25)]"
                    transition={{ type: 'spring', stiffness: 420, damping: 32 }}
                  />
                )}
                <Icon className={`w-5 h-5 relative z-10 transition-colors ${isActive ? 'text-[#07221A] glow-icon-emerald' : 'text-[#5C7F75]'}`} />
                <span className={`text-[10px] font-extrabold mt-0.5 relative z-10 tracking-tight truncate max-w-full ${isActive ? 'text-[#07221A]' : 'text-[#5C7F75]'}`}>
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



import React, { useState } from 'react';
import { Outlet, useLocation, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { Home, QrCode, Activity, History, User, X } from 'lucide-react';
import { useFreshness } from '../../context/FreshnessContext';
import { AnimatedBackground } from '../common/AnimatedBackground';

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
      {/* Background Animated Ambient Lights - Disabled on light dashboard to maintain pristine high-contrast cards */}
      <div className="absolute inset-0 bg-[#F4F7F6] pointer-events-none" />

      {/* Desktop Fixed Left Sidebar */}
      <div className="hidden md:flex h-full shrink-0 z-20 relative shadow-lg">
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
              className="fixed inset-0 bg-[#140C08]/85 backdrop-blur-md"
              onClick={() => setMobileMenuOpen(false)}
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="relative flex-1 flex flex-col max-w-xs w-full bg-[#110B07] border-r border-[#3D261A] z-10 shadow-2xl"
            >
              <div className="absolute top-4 right-4 z-20">
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2 text-[#B8A89E] hover:text-[#FDF8F5] bg-[#261A12] rounded-xl border border-[#3D261A] cursor-pointer hover:border-[#FF6A00]/40 transition-colors"
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

        {/* Mobile Bottom Navigation */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-white/95 backdrop-blur-xl border-t border-[#13493B]/10 px-2 flex items-center justify-around z-40">
          {mobileNav.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path || (item.path.startsWith('/live-data') && location.pathname.startsWith('/live-data'));

            return (
              <Link
                key={item.label}
                to={item.path}
                className="relative flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all"
              >
                {isActive && (
                  <motion.div
                    layoutId="mobileNavActive"
                    className="absolute inset-0 bg-[#20E79A]/10 rounded-xl border border-[#20E79A]/30"
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}
                <Icon className={`w-5 h-5 relative z-10 transition-colors ${isActive ? 'text-[#20E79A]' : 'text-slate-400'}`} />
                <span className={`text-[10px] font-bold mt-1 relative z-10 ${isActive ? 'text-[#07221A]' : 'text-slate-400'}`}>
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


import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, 
  Bell, 
  Menu, 
  CheckCheck, 
  AlertTriangle, 
  ShieldCheck, 
  Sliders, 
  Volume2, 
  VolumeX, 
  ExternalLink
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useFreshness } from '../../context/FreshnessContext';
import { useNavigate } from 'react-router-dom';
import { ThresholdConfigModal } from '../common/ThresholdConfigModal';

interface TopbarProps {
  onOpenMobileMenu?: () => void;
}

export const Topbar: React.FC<TopbarProps> = ({ onOpenMobileMenu }) => {
  const { userProfile } = useAuth();
  const { 
    alerts, 
    unreadCount, 
    markNotificationsAsRead, 
    markAlertAsRead, 
    thresholds,
    updateThresholds,
    isAudioMuted,
    toggleAudioMute,
  } = useFreshness();

  const [searchQuery, setSearchQuery] = useState('');
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setIsNotifOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/history?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <>
      <header className="h-16 bg-white/80 backdrop-blur-md border-b border-[#13493B]/10 px-4 sm:px-6 flex items-center justify-between gap-4 z-30 select-none">
        {/* Mobile Menu Button */}
        <div className="flex items-center gap-3 md:hidden">
          <motion.button
            whileTap={{ scale: 0.92 }}
            onClick={onOpenMobileMenu}
            className="p-2 text-[#5C7F75] hover:text-[#07221A] hover:bg-[#EBF1EF] rounded-xl border border-[#13493B]/10 cursor-pointer"
            aria-label="Open navigation menu"
          >
            <Menu className="w-5 h-5" />
          </motion.button>
        </div>

        {/* Search Input Bar */}
        <form onSubmit={handleSearchSubmit} className="flex-1 max-w-md">
          <div className="relative flex items-center group">
            <Search className="w-4 h-4 text-[#5C7F75] group-focus-within:text-[#20E79A] absolute left-3.5 pointer-events-none transition-colors duration-200" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search devices, products or users..."
              className="w-full pl-10 pr-4 py-2 bg-[#EBF1EF] text-xs font-semibold text-[#07221A] placeholder-[#5C7F75] rounded-xl border border-transparent focus:outline-none focus:bg-white focus:border-[#20E79A]/50 focus:ring-4 focus:ring-[#20E79A]/10 transition-all duration-200"
            />
          </div>
        </form>

        {/* Right Controls */}
        <div className="flex items-center gap-2 sm:gap-4">
          {/* Subtle Theme Toggle Moon/Sun Emblem exactly copying the image */}
          <div className="p-2 rounded-xl bg-[#EBF1EF] text-[#07221A] cursor-pointer hover:bg-[#20E79A]/10 transition-colors flex items-center justify-center">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4 text-[#5C7F75]">
              <path d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m0-11.314l.707.707m11.314 11.314l.707-.707M12 7a5 5 0 100 10 5 5 0 000-10z" />
            </svg>
          </div>

          {/* Threshold Config Quick Button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsConfigModalOpen(true)}
            title="Configure Sensor Thresholds & Alerts"
            className="p-2 text-[#07221A] hover:text-[#20E79A] bg-[#EBF1EF] hover:bg-[#20E79A]/10 rounded-xl transition-all cursor-pointer shadow-sm hidden sm:flex items-center gap-1.5 text-xs font-bold"
          >
            <Sliders className="w-4 h-4 text-[#20E79A]" />
            <span>Thresholds</span>
          </motion.button>

          {/* Notifications Dropdown */}
          <div className="relative" ref={notifRef}>
            <motion.button
              whileHover={{ scale: 1.06 }}
              whileTap={{ scale: 0.92 }}
              onClick={() => {
                setIsNotifOpen(!isNotifOpen);
              }}
              aria-label="Notifications"
              className="relative p-2 text-[#07221A] hover:text-[#20E79A] bg-[#EBF1EF] hover:bg-[#20E79A]/10 rounded-xl transition-all cursor-pointer shadow-sm"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-black text-white border border-white">
                3
              </span>
            </motion.button>

            {/* Notifications Popover with AnimatePresence */}
            <AnimatePresence>
              {isNotifOpen && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 10 }}
                  transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                  className="absolute right-0 mt-2 w-80 sm:w-[420px] bg-white border border-[#13493B]/10 rounded-2xl shadow-xl p-4 z-50 text-[#07221A]"
                >
                  <div className="flex items-center justify-between pb-3 border-b border-[#13493B]/10">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black">Real-Time Alerts</span>
                      <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded-full bg-red-100 text-red-600">
                        3 Alerting
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={toggleAudioMute}
                        className="p-1 text-[#5C7F75] hover:text-[#20E79A] transition-colors cursor-pointer"
                        title={isAudioMuted ? 'Unmute alert audio' : 'Mute alert audio'}
                      >
                        {isAudioMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                      </button>

                      <button
                        onClick={markNotificationsAsRead}
                        className="text-[10px] text-[#20E79A] hover:underline flex items-center gap-0.5 cursor-pointer font-bold"
                      >
                        <CheckCheck className="w-3.5 h-3.5" />
                        <span>Mark read</span>
                      </button>
                    </div>
                  </div>

                  {/* Alerts list */}
                  <div className="mt-2.5 space-y-2 max-h-60 overflow-y-auto">
                    {alerts.length === 0 ? (
                      <div className="text-center py-6">
                        <ShieldCheck className="w-8 h-8 text-[#20E79A] mx-auto mb-2" />
                        <p className="text-xs text-[#5C7F75] font-semibold">All systems running fine</p>
                      </div>
                    ) : (
                      alerts.map((n) => (
                        <div key={n.id} className="p-2.5 rounded-xl bg-red-50 border border-red-100 flex gap-2">
                          <div className="p-1.5 rounded-lg bg-red-100 text-red-600 self-start">
                            <AlertTriangle className="w-3.5 h-3.5" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold text-red-950 truncate">{n.title}</p>
                            <p className="text-[10px] text-red-800 leading-normal">{n.message}</p>
                            <div className="mt-1 flex justify-end gap-2">
                              <button
                                onClick={() => markAlertAsRead(n.id)}
                                className="text-[10px] text-[#20E79A] font-bold hover:underline"
                              >
                                Clear
                              </button>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Quick User Badge matching image header */}
          <div className="flex items-center gap-2.5 pl-3 border-l border-[#13493B]/10">
            <div className="w-8 h-8 rounded-full bg-[#13493B] text-white flex items-center justify-center font-bold text-xs shadow-md border border-[#20E79A]/20">
              {userProfile?.name?.charAt(0) || 'A'}
            </div>
            <div className="hidden md:block text-left">
              <span className="text-xs font-extrabold text-[#07221A] block leading-tight">
                {userProfile?.name || 'Admin'}
              </span>
              <span className="text-[9px] text-[#5C7F75] font-semibold block uppercase tracking-wider">
                Administrator
              </span>
            </div>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-3 h-3 text-[#5C7F75]">
              <path d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </header>

      {/* Threshold Config Modal */}
      <ThresholdConfigModal
        isOpen={isConfigModalOpen}
        onClose={() => setIsConfigModalOpen(false)}
        thresholds={thresholds}
        onSaveThresholds={updateThresholds}
      />
    </>
  );
};

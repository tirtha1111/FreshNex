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
    clearAllAlerts,
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
      <header className="h-14 sm:h-16 glass-nav px-3.5 sm:px-6 flex items-center justify-between gap-2.5 sm:gap-4 z-30 select-none shrink-0">
        {/* Mobile Menu Button */}
        <div className="flex items-center md:hidden shrink-0">
          <button
            onClick={onOpenMobileMenu}
            className="neo-btn min-w-[40px] min-h-[40px] flex items-center justify-center rounded-xl text-[#07221A] hover:border-[#20E79A]/40 cursor-pointer"
            aria-label="Open navigation menu"
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>

        {/* Search Input Bar */}
        <form onSubmit={handleSearchSubmit} className="flex-1 max-w-md min-w-0">
          <div className="relative flex items-center group">
            <Search className="w-4 h-4 text-[#5C7F75] group-focus-within:text-[#20E79A] absolute left-3 sm:left-3.5 pointer-events-none transition-colors duration-200" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search devices, products..."
              className="w-full pl-9 sm:pl-10 pr-3 py-2 neo-input text-xs font-semibold text-[#07221A] placeholder-[#5C7F75]"
            />
          </div>
        </form>

        {/* Right Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
          {/* Threshold Config Quick Button */}
          <button
            onClick={() => setIsConfigModalOpen(true)}
            title="Configure Sensor Thresholds & Alerts"
            className="neo-btn min-w-[38px] min-h-[38px] px-2.5 sm:px-3 py-2 rounded-xl text-[#07221A] text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer shadow-sm hover:border-[#20E79A]/40"
          >
            <Sliders className="w-4 h-4 text-[#20E79A]" />
            <span className="hidden sm:inline">Thresholds</span>
          </button>

          {/* Notifications Dropdown */}
          <div className="relative" ref={notifRef}>
            <button
              onClick={() => {
                setIsNotifOpen(!isNotifOpen);
              }}
              aria-label="Notifications"
              className="relative neo-btn min-w-[38px] min-h-[38px] flex items-center justify-center rounded-xl text-[#07221A] cursor-pointer shadow-sm hover:border-[#20E79A]/40"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-black text-white border border-white shadow-sm">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Notifications Popover with AnimatePresence */}
            <AnimatePresence>
              {isNotifOpen && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.96, y: 6 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.96, y: 6 }}
                  transition={{ duration: 0.16, ease: 'easeOut' }}
                  className="fixed left-3 right-3 top-16 sm:absolute sm:left-auto sm:right-0 sm:top-full sm:mt-2 sm:w-[400px] glass-modal p-4 z-50 text-[#07221A] depth-4"
                >
                  <div className="flex items-center justify-between pb-3 border-b border-[#13493B]/10">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black">Real-Time Alerts</span>
                      <span className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded-full ${unreadCount > 0 ? 'bg-red-100 text-red-600' : 'bg-emerald-100 text-[#13493B]'}`}>
                        {unreadCount > 0 ? `${unreadCount} Alerting` : '0 Alerts'}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={toggleAudioMute}
                        className="p-1 text-[#5C7F75] hover:text-[#20E79A] transition-colors cursor-pointer"
                        title={isAudioMuted ? 'Unmute alert audio' : 'Mute alert audio'}
                      >
                        {isAudioMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-[#20E79A]" />}
                      </button>

                      {unreadCount > 0 && (
                        <button
                          onClick={markNotificationsAsRead}
                          className="text-[10px] text-[#20E79A] hover:underline flex items-center gap-0.5 cursor-pointer font-bold"
                        >
                          <CheckCheck className="w-3.5 h-3.5" />
                          <span>Mark read</span>
                        </button>
                      )}

                      {alerts.length > 0 && (
                        <button
                          onClick={clearAllAlerts}
                          className="text-[10px] text-red-500 hover:underline flex items-center gap-0.5 cursor-pointer font-bold ml-1"
                        >
                          <span>Clear all</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Alerts list */}
                  <div className="mt-2.5 space-y-2 max-h-60 overflow-y-auto">
                    {alerts.length === 0 ? (
                      <div className="text-center py-6">
                        <ShieldCheck className="w-8 h-8 text-[#20E79A] mx-auto mb-2" />
                        <p className="text-xs text-[#07221A] font-bold">0 Notifications</p>
                        <p className="text-[10px] text-[#5C7F75] font-semibold mt-0.5">All sensors safe. No active notifications.</p>
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

          {/* Quick User Badge */}
          <div
            onClick={() => navigate('/profile')}
            className="flex items-center gap-2 pl-2 sm:pl-3 border-l border-[#13493B]/10 cursor-pointer"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#13493B] to-[#20E79A] text-white flex items-center justify-center font-bold text-xs shadow-sm border border-[#20E79A]/30 shrink-0">
              {userProfile?.name?.charAt(0) || 'A'}
            </div>
            <div className="hidden md:block text-left">
              <span className="text-xs font-extrabold text-[#07221A] block leading-tight truncate max-w-[120px]">
                {userProfile?.name || (userProfile?.role === 'admin' ? 'Admin' : 'Product Access')}
              </span>
              <span className="text-[9px] text-[#5C7F75] font-semibold block uppercase tracking-wider truncate">
                {userProfile?.role === 'admin' ? 'Administrator' : `Product User (${userProfile?.assignedProductId || 'COLD_DRINKS'})`}
              </span>
            </div>
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

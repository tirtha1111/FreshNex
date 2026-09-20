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
  ExternalLink, 
  Sparkles,
  Thermometer,
  Wind,
  Droplets,
  Trash2,
  X
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
    notifications, 
    unreadCount, 
    markNotificationsAsRead, 
    markAlertAsRead, 
    resolveAlert, 
    deleteAlert,
    thresholds,
    updateThresholds,
    isAudioMuted,
    toggleAudioMute,
  } = useFreshness();

  const [searchQuery, setSearchQuery] = useState('');
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState<'all' | 'unread' | 'critical' | 'temp' | 'gas'>('all');
  const notifRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Close dropdown when clicking outside
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

  const filteredAlerts = alerts.filter(a => {
    if (activeFilter === 'unread') return !a.read;
    if (activeFilter === 'critical') return a.severity === 'critical';
    if (activeFilter === 'temp') return a.metric === 'temperature';
    if (activeFilter === 'gas') return a.metric === 'gas';
    return true;
  });

  return (
    <>
      <header className="h-16 bg-[#140C08]/90 backdrop-blur-md border-b border-[#3D261A] px-4 sm:px-6 flex items-center justify-between gap-4 z-30 select-none">
        {/* Mobile Menu Button */}
        <div className="flex items-center gap-3 md:hidden">
          <motion.button
            whileTap={{ scale: 0.92 }}
            onClick={onOpenMobileMenu}
            className="p-2 text-[#B8A89E] hover:text-[#FDF8F5] hover:bg-[#261A12] rounded-xl border border-[#3D261A] cursor-pointer"
            aria-label="Open navigation menu"
          >
            <Menu className="w-5 h-5" />
          </motion.button>
        </div>

        {/* Search Input Bar */}
        <form onSubmit={handleSearchSubmit} className="flex-1 max-w-md">
          <div className="relative flex items-center group">
            <Search className="w-4 h-4 text-[#8C7A70] group-focus-within:text-[#FF6A00] absolute left-3.5 pointer-events-none transition-colors duration-200" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search anything (e.g. Tomato, FRX1004)..."
              className="w-full pl-10 pr-4 py-2 bg-[#1E140E] text-sm text-[#FDF8F5] placeholder-[#8C7A70] rounded-xl border border-[#3D261A] focus:outline-none focus:border-[#FF6A00] focus:ring-2 focus:ring-[#FF6A00]/20 focus:bg-[#261A12] transition-all duration-200 shadow-inner"
            />
          </div>
        </form>

        {/* Right Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Threshold Config Quick Button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsConfigModalOpen(true)}
            title="Configure Sensor Thresholds & Alerts"
            className="p-2 text-[#8C7A70] hover:text-[#FFAA00] bg-[#1E140E] hover:bg-[#261A12] border border-[#3D261A] hover:border-[#FF6A00]/40 rounded-xl transition-all cursor-pointer shadow-sm hidden sm:flex items-center gap-1.5 text-xs font-semibold"
          >
            <Sliders className="w-4 h-4 text-[#FFAA00]" />
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
              className="relative p-2 text-[#B8A89E] hover:text-[#FDF8F5] bg-[#1E140E] hover:bg-[#261A12] border border-[#3D261A] hover:border-[#FF6A00]/40 rounded-xl transition-all cursor-pointer shadow-sm"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#FF6A00] opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#FF6A00]"></span>
                </span>
              )}
            </motion.button>

            {/* Notifications Popover with AnimatePresence */}
            <AnimatePresence>
              {isNotifOpen && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 10 }}
                  transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                  className="absolute right-0 mt-2 w-80 sm:w-[420px] bg-[#1A110B] border border-[#FF6A00]/30 rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.95)] p-4 z-50 backdrop-blur-xl"
                >
                  {/* Top bar */}
                  <div className="flex items-center justify-between pb-3 border-b border-[#3D261A]">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-[#FDF8F5]">Real-Time Alerts</span>
                      {unreadCount > 0 && (
                        <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-[#FF6A00]/20 text-[#FF6A00] border border-[#FF6A00]/40 animate-pulse">
                          {unreadCount} unread
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={toggleAudioMute}
                        className="p-1 text-[#8C7A70] hover:text-[#FFAA00] transition-colors cursor-pointer"
                        title={isAudioMuted ? 'Unmute alert audio' : 'Mute alert audio'}
                      >
                        {isAudioMuted ? <VolumeX className="w-3.5 h-3.5 text-[#8C7A70]" /> : <Volume2 className="w-3.5 h-3.5 text-[#FFAA00]" />}
                      </button>

                      <button
                        onClick={markNotificationsAsRead}
                        className="text-[11px] text-[#FF6A00] hover:text-[#FFAA00] transition-colors flex items-center gap-1 cursor-pointer font-bold"
                      >
                        <CheckCheck className="w-3.5 h-3.5" />
                        <span>Mark read</span>
                      </button>
                    </div>
                  </div>

                  {/* Filter Tabs */}
                  <div className="flex items-center gap-1.5 py-2 border-b border-[#3D261A]/60 overflow-x-auto text-[11px]">
                    {[
                      { key: 'all', label: 'All' },
                      { key: 'unread', label: `Unread (${unreadCount})` },
                      { key: 'critical', label: 'Critical' },
                      { key: 'temp', label: 'Temp' },
                      { key: 'gas', label: 'Gas VOC' },
                    ].map((tab) => (
                      <button
                        key={tab.key}
                        onClick={() => setActiveFilter(tab.key as any)}
                        className={`px-2.5 py-1 rounded-lg font-bold transition-all whitespace-nowrap cursor-pointer ${
                          activeFilter === tab.key
                            ? 'bg-[#FF6A00] text-[#140C08]'
                            : 'text-[#8C7A70] hover:text-[#FDF8F5] hover:bg-[#261A12]'
                        }`}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>

                  {/* Alerts List */}
                  <div className="mt-2.5 space-y-2 max-h-80 overflow-y-auto pr-1">
                    {filteredAlerts.length === 0 ? (
                      <div className="text-center py-8">
                        <ShieldCheck className="w-8 h-8 text-[#20E79A]/60 mx-auto mb-2" />
                        <p className="text-xs text-[#B8A89E] font-medium">All sensor telemetry within safe limits.</p>
                      </div>
                    ) : (
                      filteredAlerts.map((n, i) => {
                        const isCrit = n.severity === 'critical';
                        const isWarn = n.severity === 'warning';

                        return (
                          <motion.div
                            key={n.id}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.03 }}
                            className={`p-3 rounded-xl border text-left transition-all relative group ${
                              !n.read ? 'ring-1 ring-[#FF6A00]/40' : ''
                            } ${
                              isCrit
                                ? 'bg-[#220B0B] border-[#FF3D00]/40 text-[#FF3D00]'
                                : isWarn
                                ? 'bg-[#20150B] border-[#FFAA00]/40 text-[#FFAA00]'
                                : 'bg-[#1E140E] border-[#3D261A] text-[#B8A89E]'
                            }`}
                          >
                            <div className="flex items-start gap-2.5">
                              <div className={`p-1.5 rounded-lg shrink-0 mt-0.5 ${
                                isCrit ? 'bg-[#FF3D00]/20 text-[#FF3D00]' : isWarn ? 'bg-[#FFAA00]/20 text-[#FFAA00]' : 'bg-[#20E79A]/20 text-[#20E79A]'
                              }`}>
                                {n.metric === 'temperature' ? (
                                  <Thermometer className="w-3.5 h-3.5" />
                                ) : n.metric === 'gas' ? (
                                  <Wind className="w-3.5 h-3.5" />
                                ) : n.metric === 'humidity' ? (
                                  <Droplets className="w-3.5 h-3.5" />
                                ) : (
                                  <AlertTriangle className="w-3.5 h-3.5" />
                                )}
                              </div>

                              <div className="min-w-0 flex-1">
                                <div className="flex items-center justify-between">
                                  <p className="text-xs font-bold text-[#FDF8F5] truncate">{n.title}</p>
                                  <span className="text-[10px] text-[#8C7A70] font-mono">
                                    {new Date(n.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                  </span>
                                </div>
                                <p className="text-[11px] text-[#B8A89E] mt-0.5 leading-relaxed">{n.message}</p>
                                
                                {n.currentValue !== undefined && (
                                  <div className="mt-1.5 flex items-center justify-between text-[10px]">
                                    <span className="font-mono text-[#FFAA00] font-bold">
                                      Value: {n.currentValue} {n.unit}
                                    </span>
                                    <div className="flex items-center gap-2">
                                      <button
                                        onClick={() => {
                                          setIsNotifOpen(false);
                                          if (n.itemId) navigate(`/live-data/${n.itemId}`);
                                        }}
                                        className="text-[#FF6A00] hover:underline flex items-center gap-0.5 cursor-pointer font-bold"
                                      >
                                        <ExternalLink className="w-3 h-3" />
                                        <span>Telemetry</span>
                                      </button>
                                      <button
                                        onClick={() => markAlertAsRead(n.id)}
                                        className="text-[#8C7A70] hover:text-[#FDF8F5] cursor-pointer"
                                        title="Dismiss"
                                      >
                                        <CheckCheck className="w-3 h-3" />
                                      </button>
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          </motion.div>
                        );
                      })
                    )}
                  </div>

                  {/* Footer actions */}
                  <div className="mt-3 pt-2 border-t border-[#3D261A] flex items-center justify-between text-xs">
                    <button
                      onClick={() => {
                        setIsNotifOpen(false);
                        setIsConfigModalOpen(true);
                      }}
                      className="text-[#FFAA00] hover:underline flex items-center gap-1 font-bold cursor-pointer"
                    >
                      <Sliders className="w-3.5 h-3.5" />
                      <span>Threshold Settings</span>
                    </button>

                    <button
                      onClick={() => {
                        setIsNotifOpen(false);
                        navigate('/alerts');
                      }}
                      className="text-[#8C7A70] hover:text-[#FDF8F5] transition-colors cursor-pointer"
                    >
                      View All Alerts &rarr;
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Quick User Badge */}
          <motion.div 
            whileHover={{ scale: 1.04 }}
            className="hidden sm:flex items-center gap-2.5 pl-2 border-l border-[#3D261A]/60"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#FF6A00] to-[#FFAA00] flex items-center justify-center font-bold text-[#140C08] text-xs shadow-md">
              {userProfile?.name?.charAt(0) || userProfile?.email?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <span className="text-xs font-bold text-[#FDF8F5]">
              {userProfile?.name?.split(' ')[0] || userProfile?.email?.split('@')[0] || 'User'}
            </span>
          </motion.div>
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


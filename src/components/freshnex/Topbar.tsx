import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Bell,
  Sun,
  ChevronDown,
  Menu,
  User,
  Settings,
  LogOut,
  CheckCheck,
  Radio,
  Database,
  WifiOff,
  Package,
  Cpu,
  Boxes,
} from 'lucide-react';
import { useFreshNex } from '../../context/FreshNexContext';

interface TopbarProps {
  onOpenMobileMenu: () => void;
}

export const Topbar: React.FC<TopbarProps> = ({ onOpenMobileMenu }) => {
  const {
    searchQuery,
    setSearchQuery,
    unreadAlertsCount,
    alerts,
    acknowledgeAlert,
    acknowledgeAllAlerts,
    dataMode,
    setDataMode,
    parcels,
    devices,
    products,
    setSelectedParcelId,
    temperatureUnit,
    setTemperatureUnit,
  } = useFreshNex();

  const navigate = useNavigate();

  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifications(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setShowProfileMenu(false);
      }
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowSearchDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Filter matching entities for search bar
  const q = searchQuery.trim().toLowerCase();
  const matchedParcels = q
    ? parcels.filter(
        (p) =>
          p.id.toLowerCase().includes(q) ||
          p.productName.toLowerCase().includes(q) ||
          p.destination.toLowerCase().includes(q)
      )
    : [];
  const matchedDevices = q
    ? devices.filter(
        (d) =>
          d.id.toLowerCase().includes(q) ||
          d.name.toLowerCase().includes(q) ||
          d.mcuModel.toLowerCase().includes(q)
      )
    : [];
  const matchedProducts = q
    ? products.filter(
        (pr) =>
          pr.name.toLowerCase().includes(q) ||
          pr.category.toLowerCase().includes(q) ||
          pr.sku.toLowerCase().includes(q)
      )
    : [];

  return (
    <header className="sticky top-0 z-20 h-[68px] bg-white border-b border-[#DFEAF0] px-4 lg:px-7 flex items-center justify-between gap-4">
      {/* Left: Mobile Menu Trigger + Search Bar */}
      <div className="flex items-center gap-3 flex-1 max-w-xl" ref={searchRef}>
        <button
          onClick={onOpenMobileMenu}
          className="lg:hidden p-2 rounded-xl border border-[#DFEAF0] text-[#102F46] hover:bg-[#F7FAFC]"
          aria-label="Open menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="relative flex-1 max-w-[440px]">
          <Search className="w-4 h-4 text-[#71869A] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onFocus={() => setShowSearchDropdown(true)}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setShowSearchDropdown(true);
            }}
            placeholder="Search devices, products or parcels..."
            className="w-full h-10 pl-10 pr-4 rounded-full bg-[#F7FAFC] border border-[#DFEAF0] text-[13.5px] text-[#102F46] placeholder-[#71869A] focus:outline-none focus:bg-white focus:border-[#079B68] transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] font-semibold text-[#71869A] hover:text-[#102F46]"
            >
              Clear
            </button>
          )}

          {/* Live Search Results Dropdown */}
          {showSearchDropdown && q.length > 0 && (
            <div className="absolute left-0 right-0 mt-2 bg-white rounded-2xl border border-[#DFEAF0] shadow-lg p-3 z-50 max-h-[360px] overflow-y-auto">
              {matchedParcels.length === 0 &&
              matchedDevices.length === 0 &&
              matchedProducts.length === 0 ? (
                <div className="py-6 text-center text-xs text-[#71869A]">
                  No matching parcels, devices, or products for "{searchQuery}".
                </div>
              ) : (
                <div className="space-y-3">
                  {matchedParcels.length > 0 && (
                    <div>
                      <div className="text-[11px] font-bold uppercase tracking-wider text-[#71869A] px-2 mb-1">
                        Parcels
                      </div>
                      {matchedParcels.map((p) => (
                        <button
                          key={p.id}
                          onClick={() => {
                            setSelectedParcelId(p.id);
                            setShowSearchDropdown(false);
                            navigate('/parcels');
                          }}
                          className="w-full flex items-center justify-between px-2.5 py-2 rounded-xl hover:bg-[#F7FAFC] text-left transition-colors"
                        >
                          <div className="flex items-center gap-2.5">
                            <Package className="w-4 h-4 text-[#079B68]" />
                            <div>
                              <div className="text-xs font-bold text-[#102F46]">{p.id}</div>
                              <div className="text-[11px] text-[#71869A]">{p.productName}</div>
                            </div>
                          </div>
                          <span className="text-[11px] font-semibold text-[#079B68]">
                            Select & View
                          </span>
                        </button>
                      ))}
                    </div>
                  )}

                  {matchedDevices.length > 0 && (
                    <div>
                      <div className="text-[11px] font-bold uppercase tracking-wider text-[#71869A] px-2 mb-1">
                        IoT Devices
                      </div>
                      {matchedDevices.map((d) => (
                        <button
                          key={d.id}
                          onClick={() => {
                            setShowSearchDropdown(false);
                            navigate('/devices');
                          }}
                          className="w-full flex items-center justify-between px-2.5 py-2 rounded-xl hover:bg-[#F7FAFC] text-left transition-colors"
                        >
                          <div className="flex items-center gap-2.5">
                            <Cpu className="w-4 h-4 text-[#339AF0]" />
                            <div>
                              <div className="text-xs font-bold text-[#102F46]">{d.id}</div>
                              <div className="text-[11px] text-[#71869A]">{d.name}</div>
                            </div>
                          </div>
                          <span
                            className={`text-[11px] font-semibold ${
                              d.online ? 'text-[#079B68]' : 'text-[#71869A]'
                            }`}
                          >
                            {d.online ? 'Online' : 'Offline'}
                          </span>
                        </button>
                      ))}
                    </div>
                  )}

                  {matchedProducts.length > 0 && (
                    <div>
                      <div className="text-[11px] font-bold uppercase tracking-wider text-[#71869A] px-2 mb-1">
                        Products
                      </div>
                      {matchedProducts.map((pr) => (
                        <button
                          key={pr.id}
                          onClick={() => {
                            setShowSearchDropdown(false);
                            navigate('/products');
                          }}
                          className="w-full flex items-center justify-between px-2.5 py-2 rounded-xl hover:bg-[#F7FAFC] text-left transition-colors"
                        >
                          <div className="flex items-center gap-2.5">
                            <Boxes className="w-4 h-4 text-[#079B68]" />
                            <div>
                              <div className="text-xs font-bold text-[#102F46]">{pr.name}</div>
                              <div className="text-[11px] text-[#71869A]">{pr.sku}</div>
                            </div>
                          </div>
                          <span className="text-[11px] text-[#71869A]">{pr.category}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Right: Data Source Mode Selector, Notification Bell, Unit/Theme Button, Admin Profile */}
      <div className="flex items-center gap-2.5 sm:gap-3.5 shrink-0">
        {/* Explicit Data Mode Selector (Distinguishes Demo vs Live ESP32 vs Stale per Section 7 & 18) */}
        <div className="hidden md:flex items-center bg-[#F7FAFC] border border-[#DFEAF0] rounded-full p-0.5 text-[11.5px] font-semibold">
          <button
            onClick={() => setDataMode('demo')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full transition-colors ${
              dataMode === 'demo'
                ? 'bg-[#E5F8F0] text-[#079B68] font-bold'
                : 'text-[#71869A] hover:text-[#102F46]'
            }`}
            title="Demonstration dataset with sample sensor telemetry"
          >
            <Database className="w-3.5 h-3.5" />
            <span>Demo Data</span>
          </button>
          <button
            onClick={() => setDataMode('live')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full transition-colors ${
              dataMode === 'live'
                ? 'bg-[#079B68] text-white font-bold'
                : 'text-[#71869A] hover:text-[#102F46]'
            }`}
            title="Connect to live ESP32 hardware telemetry via Firebase RTDB"
          >
            <Radio className="w-3.5 h-3.5" />
            <span>Live Hardware</span>
          </button>
          <button
            onClick={() => setDataMode('stale')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full transition-colors ${
              dataMode === 'stale'
                ? 'bg-[#102F46] text-white font-bold'
                : 'text-[#71869A] hover:text-[#102F46]'
            }`}
            title="Inspect Disconnected / Stale telemetry state"
          >
            <WifiOff className="w-3.5 h-3.5" />
            <span>Stale</span>
          </button>
        </div>

        {/* Notification Bell with Unread Badge */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setShowNotifications((v) => !v)}
            className="relative w-10 h-10 rounded-full bg-[#F7FAFC] border border-[#DFEAF0] flex items-center justify-center text-[#102F46] hover:border-[#079B68] transition-colors"
            aria-label="Notifications"
          >
            <Bell className="w-[18px] h-[18px]" />
            {unreadAlertsCount > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-[#EF5350] text-white text-[10px] font-bold flex items-center justify-center tabular-nums border-2 border-white">
                {unreadAlertsCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl border border-[#DFEAF0] shadow-xl p-4 z-50">
              <div className="flex items-center justify-between pb-3 border-b border-[#DFEAF0]">
                <div>
                  <h4 className="text-sm font-bold text-[#102F46]">Alert Notifications</h4>
                  <p className="text-[11px] text-[#71869A]">
                    {unreadAlertsCount} unread condition {unreadAlertsCount === 1 ? 'alert' : 'alerts'}
                  </p>
                </div>
                {unreadAlertsCount > 0 && (
                  <button
                    onClick={acknowledgeAllAlerts}
                    className="flex items-center gap-1 text-xs font-semibold text-[#079B68] hover:underline"
                  >
                    <CheckCheck className="w-3.5 h-3.5" />
                    Acknowledge All
                  </button>
                )}
              </div>

              <div className="divide-y divide-[#DFEAF0] max-h-72 overflow-y-auto my-1">
                {alerts.slice(0, 5).map((alert) => (
                  <div
                    key={alert.id}
                    className={`py-2.5 px-2 rounded-xl flex items-start justify-between gap-2 ${
                      !alert.acknowledged ? 'bg-[#F7FAFC]' : ''
                    }`}
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`w-2 h-2 rounded-full shrink-0 ${
                            alert.severity === 'RED'
                              ? 'bg-[#EF5350]'
                              : alert.severity === 'YELLOW'
                              ? 'bg-[#F5B82E]'
                              : 'bg-[#079B68]'
                          }`}
                        />
                        <span className="text-xs font-bold text-[#102F46] truncate">
                          {alert.title}
                        </span>
                      </div>
                      <p className="text-[11px] text-[#71869A] mt-0.5 line-clamp-2">
                        {alert.description}
                      </p>
                      <span className="text-[10px] font-medium text-[#71869A]">
                        Parcel {alert.parcelId} • {alert.relativeTime}
                      </span>
                    </div>
                    {!alert.acknowledged && (
                      <button
                        onClick={() => acknowledgeAlert(alert.id)}
                        className="text-[11px] font-semibold text-[#079B68] hover:bg-[#E5F8F0] px-2 py-1 rounded-lg shrink-0"
                      >
                        Ack
                      </button>
                    )}
                  </div>
                ))}
              </div>

              <button
                onClick={() => {
                  setShowNotifications(false);
                  navigate('/alerts');
                }}
                className="w-full mt-2 py-2 rounded-xl bg-[#F7FAFC] hover:bg-[#E5F8F0] text-xs font-bold text-[#079B68] transition-colors"
              >
                View All Alerts
              </button>
            </div>
          )}
        </div>

        {/* Light Theme / Unit Quick Button matching reference sun icon */}
        <button
          onClick={() => {
            const nextUnit = temperatureUnit === 'C' ? 'F' : 'C';
            setTemperatureUnit(nextUnit);
            triggerToast(`Display unit switched to °${nextUnit} (Light Theme Active)`);
          }}
          title={`Light Theme Active • Click to toggle °C / °F (Current: °${temperatureUnit})`}
          className="w-10 h-10 rounded-full bg-[#F7FAFC] border border-[#DFEAF0] flex items-center justify-center text-[#102F46] hover:border-[#079B68] transition-colors"
        >
          <Sun className="w-[18px] h-[18px]" />
        </button>

        {/* Administrator Profile Avatar & Dropdown */}
        <div className="relative" ref={profileRef}>
          <button
            onClick={() => setShowProfileMenu((v) => !v)}
            className="flex items-center gap-2.5 pl-1 pr-2 py-1 rounded-full hover:bg-[#F7FAFC] transition-colors"
          >
            <div className="w-9 h-9 rounded-full bg-[#079B68] text-white font-bold text-sm flex items-center justify-center shadow-xs shrink-0">
              T
            </div>
            <div className="hidden sm:flex flex-col text-left leading-tight">
              <span className="text-[13.5px] font-bold text-[#102F46]">Tirtharaj Biswas</span>
              <span className="text-[11px] font-medium text-[#71869A]">Administrator</span>
            </div>
            <ChevronDown className="w-4 h-4 text-[#71869A] hidden sm:block" />
          </button>

          {showProfileMenu && (
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl border border-[#DFEAF0] shadow-xl py-2 z-50">
              <div className="px-4 py-2.5 border-b border-[#DFEAF0]">
                <div className="text-xs font-bold text-[#102F46]">Tirtharaj Biswas</div>
                <div className="text-[11px] text-[#71869A] truncate">
                  tirtharaj.biswas@freshnex.io
                </div>
                <span className="inline-block mt-1 px-2 py-0.5 rounded-md bg-[#E5F8F0] text-[#079B68] text-[10px] font-bold">
                  Administrator
                </span>
              </div>

              <div className="py-1">
                <button
                  onClick={() => {
                    setShowProfileMenu(false);
                    navigate('/users');
                  }}
                  className="w-full px-4 py-2 text-left text-xs font-medium text-[#102F46] hover:bg-[#F7FAFC] flex items-center gap-2.5"
                >
                  <User className="w-4 h-4 text-[#71869A]" />
                  Profile
                </button>
                <button
                  onClick={() => {
                    setShowProfileMenu(false);
                    navigate('/settings');
                  }}
                  className="w-full px-4 py-2 text-left text-xs font-medium text-[#102F46] hover:bg-[#F7FAFC] flex items-center gap-2.5"
                >
                  <Settings className="w-4 h-4 text-[#71869A]" />
                  Account Settings
                </button>
              </div>

              <div className="border-t border-[#DFEAF0] pt-1">
                <button
                  onClick={() => {
                    setShowProfileMenu(false);
                    setDataMode('demo');
                    triggerToast('Session refreshed • Administrator Dashboard Active');
                  }}
                  className="w-full px-4 py-2 text-left text-xs font-semibold text-[#EF5350] hover:bg-[#FEF2F2] flex items-center gap-2.5"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Subtle Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-[#102F46] text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-lg border border-white/10 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#20C997]" />
          {toastMessage}
        </div>
      )}
    </header>
  );
};

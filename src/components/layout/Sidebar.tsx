import React from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'motion/react';
import { 
  Home, 
  QrCode, 
  Cpu,
  PlusCircle,
  Package,
  BarChart3, 
  Bell,
  Users, 
  Settings, 
  LogOut,
  X,
  Sliders,
  Activity,
  Warehouse
} from 'lucide-react';
import { Logo } from '../common/Logo';
import { useAuth } from '../../context/AuthContext';
import { useFreshness } from '../../context/FreshnessContext';
import { socketTelemetryService } from '../../services/socketService';
import farmLandscapeImg from '../../assets/images/freshnex_farm_landscape_1789921215887.jpg';

interface SidebarProps {
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ onCloseMobile }) => {
  const { currentUser, userProfile, warehouseSession, logout, logoutWarehouse } = useAuth();
  const { activeItem } = useFreshness();
  const navigate = useNavigate();
  const location = useLocation();

  const isWarehouseView =
    location.pathname.startsWith('/warehouse') ||
    (!currentUser && Boolean(warehouseSession)) ||
    userProfile?.role === 'warehouse';
  const isAdmin = !isWarehouseView && userProfile?.role === 'admin';

  const targetDeviceId = React.useMemo(() => {
    const raw = (userProfile?.assignedProductId || activeItem?.id || 'YGS-FD-001').trim().toUpperCase();
    if (raw.includes('124') || raw.includes('MILK')) return 'YGS-FD-124';
    return 'YGS-FD-001';
  }, [userProfile?.assignedProductId, activeItem?.id]);

  const [deviceStatus, setDeviceStatus] = React.useState<'online' | 'offline'>(() =>
    socketTelemetryService.getLatestStatus(targetDeviceId)
  );

  React.useEffect(() => {
    setDeviceStatus(socketTelemetryService.getLatestStatus(targetDeviceId));
    const unsub = socketTelemetryService.subscribeStatus(targetDeviceId, (status) => {
      setDeviceStatus(status);
    });
    return () => unsub();
  }, [targetDeviceId]);

  interface NavItem {
    name: string;
    path: string;
    icon: React.ComponentType<{ className?: string }>;
    matchPrefix?: string;
    badge?: number;
    isAction?: boolean;
  }

  const adminNavItems: NavItem[] = [
    { name: 'Devices', path: '/devices', icon: Cpu },
    { name: 'Thresholds', path: '/thresholds', icon: Sliders },
    { name: 'Analytics', path: '/analytics', icon: BarChart3 },
    { name: 'Users', path: '/profile', icon: Users },
  ];

  const userNavItems: NavItem[] = [
    { name: 'Dashboard', path: '/dashboard', icon: Home },
    { name: 'Live Reading', path: '/live-data', matchPrefix: '/live-data', icon: Activity },
  ];

  const warehouseNavItems: NavItem[] = [
    { name: 'Warehouse', path: '/warehouse', matchPrefix: '/warehouse', icon: Warehouse },
  ];

  const navItems = isWarehouseView
    ? warehouseNavItems
    : isAdmin
    ? adminNavItems
    : userNavItems;

  const handleLogout = async () => {
    if (isWarehouseView) {
      await logoutWarehouse();
    } else {
      await logout();
    }
    navigate('/login');
    if (onCloseMobile) onCloseMobile();
  };

  return (
    <aside className="w-full md:w-64 bg-[#07221A] flex flex-col justify-between h-full select-none z-20 font-sans border-r border-[#13493B]/20 shrink-0">
      {/* Top Section with responsive scrollability so nothing is ever clipped */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between overflow-y-auto overflow-x-hidden min-h-0 [scrollbar-width:thin] [scrollbar-color:#13493B_transparent]">
        <div className="flex-1 flex flex-col min-h-0">
          {/* Brand Logo with integrated mobile close button */}
          <div className="pb-4 sm:pb-5 mb-1 sm:mb-2 border-b border-[#13493B]/30 flex items-center justify-between gap-2 shrink-0">
            <Logo
              size="md"
              variant="dark"
              showTagline={true}
              linkTo={isWarehouseView ? '/warehouse' : isAdmin ? '/devices' : '/dashboard'}
            />
            {onCloseMobile && (
              <button
                type="button"
                onClick={onCloseMobile}
                aria-label="Close navigation menu"
                className="md:hidden w-9 h-9 rounded-xl bg-[#13493B]/40 hover:bg-[#13493B]/80 text-[#8FA39E] hover:text-white border border-[#20E79A]/25 flex items-center justify-center transition-colors cursor-pointer shrink-0"
              >
                <X className="w-4 h-4 text-[#20E79A]" />
              </button>
            )}
          </div>

          {/* Navigation Items */}
          <nav className="space-y-1 pt-2 sm:pt-3">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isAddDeviceAction = item.path.includes('action=add');
              const isActive = isAddDeviceAction
                ? (location.pathname.includes('devices') && location.search.includes('action=add'))
                : item.name === 'Devices'
                ? (location.pathname.startsWith('/admin/devices') || location.pathname === '/devices') && !location.search.includes('action=add')
                : item.matchPrefix 
                ? location.pathname.startsWith(item.matchPrefix) 
                : location.pathname === item.path;

              return (
                <div key={item.name}>
                  <NavLink
                    to={item.path}
                    onClick={onCloseMobile}
                    className="relative block group outline-none"
                  >
                    <div
                      className={`flex items-center gap-3 px-3.5 py-2.5 min-h-[42px] rounded-xl font-medium text-xs transition-colors duration-150 relative z-10 overflow-hidden ${
                        isActive
                          ? 'text-white font-bold'
                          : 'text-[#8FA39E] hover:text-white hover:bg-[#13493B]/20'
                      }`}
                    >
                      {/* Fluid Sliding Active Pill Background across selections */}
                      {isActive && (
                        <motion.div
                          layoutId="activeSidebarPill"
                          className="absolute inset-0 rounded-xl bg-gradient-to-r from-[#13493B] via-[#104033] to-[#0D3429] border border-[#20E79A]/30 shadow-[0_4px_20px_rgba(32,231,154,0.18)]"
                          transition={{
                            type: 'spring',
                            stiffness: 420,
                            damping: 32,
                            mass: 0.8
                          }}
                        />
                      )}

                      {/* Sliding Emerald Accent Indicator Bar */}
                      {isActive && (
                        <motion.div
                          layoutId="activeSidebarIndicator"
                          className="absolute left-0 top-2 bottom-2 w-1 rounded-r-full bg-[#20E79A] shadow-[0_0_12px_#20E79A]"
                          transition={{
                            type: 'spring',
                            stiffness: 450,
                            damping: 32,
                          }}
                        />
                      )}

                      {/* Icon */}
                      <div className="relative z-10 flex items-center justify-center shrink-0">
                        <Icon
                          className={`w-4 h-4 transition-colors duration-200 ${
                            isActive 
                              ? 'text-[#20E79A] drop-shadow-[0_0_8px_rgba(32,231,154,0.7)]' 
                              : 'text-[#5C7F75] group-hover:text-[#20E79A]'
                          }`}
                        />
                      </div>

                      {/* Label */}
                      <span className="relative z-10 tracking-wide truncate">
                        {item.name}
                      </span>

                      {/* Add Device Action Indicator Badge */}
                      {item.isAction && (
                        <span className="ml-auto px-1.5 py-0.5 rounded-md text-[8px] font-mono font-black bg-[#20E79A]/15 text-[#20E79A] border border-[#20E79A]/30 tracking-tight z-10 shrink-0">
                          + ADD
                        </span>
                      )}

                      {/* Notification Count Badge */}
                      {item.badge !== undefined && item.badge > 0 && (
                        <span className="ml-auto px-1.5 py-0.5 rounded-full text-[9px] font-black bg-red-500 text-white relative z-10 shadow-sm shrink-0">
                          {item.badge}
                        </span>
                      )}

                      {/* Live Reading Status Badge synced with Admin Panel */}
                      {item.name === 'Live Reading' && (
                        <span
                          className={`ml-auto px-2 py-0.5 rounded-full text-[9px] font-black border relative z-10 shrink-0 flex items-center gap-1 ${
                            deviceStatus === 'online'
                              ? 'bg-[#20E79A]/15 text-[#20E79A] border-[#20E79A]/30'
                              : 'bg-rose-500/15 text-rose-400 border-rose-500/30'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              deviceStatus === 'online' ? 'bg-[#20E79A] animate-pulse' : 'bg-rose-400'
                            }`}
                          />
                          {deviceStatus === 'online' ? 'Live' : 'Offline'}
                        </span>
                      )}

                      {/* Live Device Telemetry Active Ping */}
                      {item.name === 'Devices' && activeItem && (
                        <span className="ml-auto relative flex h-2 w-2 z-10 shrink-0">
                          <span
                            className={`absolute inline-flex h-full w-full rounded-full opacity-75 ${
                              deviceStatus === 'online' ? 'animate-ping bg-[#20E79A]' : 'bg-rose-500'
                            }`}
                          />
                          <span
                            className={`relative inline-flex rounded-full h-2 w-2 ${
                              deviceStatus === 'online'
                                ? 'bg-[#20E79A] shadow-[0_0_8px_#20E79A]'
                                : 'bg-rose-500'
                            }`}
                          />
                        </span>
                      )}
                    </div>
                  </NavLink>
                </div>
              );
            })}
          </nav>
        </div>

        {/* Misty Pine Forest Bottom Decorative Card */}
        <div className="mt-3 sm:mt-4 mb-1 relative rounded-2xl overflow-hidden bg-gradient-to-t from-[#041410] to-[#07221A] border border-[#13493B]/30 flex flex-col justify-end p-3 sm:p-3.5 text-center group cursor-default shrink-0 shadow-sm">
          <div 
            className="absolute inset-0 bg-cover bg-center opacity-35 mix-blend-overlay pointer-events-none"
            style={{ backgroundImage: `url("${farmLandscapeImg}")` }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#07221A] via-transparent to-transparent pointer-events-none" />

          <div className="relative z-10 space-y-1">
            <div className="space-y-0.5">
              <span className="block font-serif italic text-white text-sm sm:text-[15px] leading-tight tracking-wide drop-shadow-md">
                Good Food
              </span>
              <span className="block font-serif italic text-[#20E79A] text-base sm:text-[18px] leading-tight font-black tracking-wide drop-shadow-md">
                Brighter
              </span>
              <span className="block font-serif italic text-white text-sm sm:text-[15px] leading-tight tracking-wide drop-shadow-md">
                Futures
              </span>
            </div>

            <div className="flex justify-center text-[#20E79A]/80">
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5">
                <path d="M12 2C12 2 8 5 6 9C4 13 6 17 9 18C10 16 11 13 12 10C13 13 14 16 15 18C18 17 20 13 18 9C16 5 12 2 12 2Z" />
              </svg>
            </div>

            <p className="text-[9px] sm:text-[10px] text-[#8FA39E] font-medium leading-relaxed max-w-[160px] mx-auto italic">
              "A healthier planet starts with safer food."
            </p>
          </div>
        </div>
      </div>

      {/* Bottom User Profile Section */}
      <div className="p-3 sm:p-4 border-t border-[#13493B]/30 bg-[#041410]/70 shrink-0">
        <motion.div 
          whileHover={{ scale: 1.02, y: -1 }}
          transition={{ type: 'spring', stiffness: 400, damping: 25 }}
          className="flex items-center justify-between p-2.5 rounded-2xl bg-[#092019]/90 border border-[#20E79A]/25 shadow-[0_8px_20px_rgba(0,0,0,0.4),inset_0_1px_1px_rgba(255,255,255,0.1)]"
        >
          <div className="flex items-center gap-2.5 min-w-0">
            {/* Avatar Pill with Glow */}
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#13493B] via-[#20E79A] to-[#10B981] flex items-center justify-center font-black text-[#07221A] text-xs shrink-0 shadow-[0_0_12px_rgba(32,231,154,0.4)] border border-white/40">
              {isWarehouseView ? 'W' : userProfile?.name?.charAt(0) || 'A'}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-white truncate">
                {isWarehouseView
                  ? 'Warehouse Operator'
                  : userProfile?.name || (isAdmin ? 'Admin' : 'Product Access')}
              </p>
              <span className="text-[9px] font-semibold text-[#20E79A] block uppercase tracking-wider truncate">
                {isWarehouseView
                  ? `Device ${warehouseSession?.deviceId || 'RFID Verified'}`
                  : isAdmin
                  ? 'Administrator'
                  : `Device ${userProfile?.assignedProductId || 'Assigned'}`}
              </span>
            </div>
          </div>

          {/* Logout Action with Micro-interaction */}
          <motion.button
            whileHover={{ scale: 1.15, rotate: 6 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleLogout}
            title={isWarehouseView ? 'Warehouse Logout' : 'Log Out'}
            className="p-2 text-[#5C7F75] hover:text-[#FF5A67] hover:bg-[#FF5A67]/15 rounded-xl transition-colors cursor-pointer border border-transparent hover:border-[#FF5A67]/30 shadow-sm"
          >
            <LogOut className="w-3.5 h-3.5" />
          </motion.button>
        </motion.div>
      </div>
    </aside>
  );
};

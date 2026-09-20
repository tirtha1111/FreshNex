import React from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'motion/react';
import { 
  Home, 
  QrCode, 
  Activity, 
  History, 
  BarChart3, 
  Bell,
  User, 
  Settings, 
  LogOut,
  Sparkles,
  Radio
} from 'lucide-react';
import { Logo } from '../common/Logo';
import { useAuth } from '../../context/AuthContext';
import { useFreshness } from '../../context/FreshnessContext';

interface SidebarProps {
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ onCloseMobile }) => {
  const { userProfile, logout } = useAuth();
  const { activeItem, unreadCount } = useFreshness();
  const navigate = useNavigate();
  const location = useLocation();

  const liveDataPath = activeItem ? `/live-data/${activeItem.id}` : '/live-data';

  const navItems = [
    { name: 'Home', path: '/dashboard', icon: Home },
    { name: 'Scan', path: '/scan', icon: QrCode },
    { name: 'Live Data', path: liveDataPath, icon: Activity, matchPrefix: '/live-data' },
    { name: 'Alerts', path: '/alerts', icon: Bell, badge: unreadCount },
    { name: 'History', path: '/history', icon: History },
    { name: 'Analytics', path: '/analytics', icon: BarChart3 },
    { name: 'Profile', path: '/profile', icon: User },
    { name: 'Settings', path: '/settings', icon: Settings },
  ];

  const handleLogout = async () => {
    await logout();
    navigate('/login');
    if (onCloseMobile) onCloseMobile();
  };

  return (
    <aside className="w-64 bg-slate-950 border-r border-slate-800/80 flex flex-col justify-between h-full select-none shadow-xl z-20">
      {/* Top Section */}
      <div className="p-5">
        {/* Brand Logo with subtle hover motion */}
        <motion.div 
          className="pb-6 mb-2 border-b border-slate-800/60"
          whileHover={{ scale: 1.02 }}
          transition={{ type: 'spring', stiffness: 400, damping: 20 }}
        >
          <Logo size="md" linkTo="/dashboard" />
        </motion.div>

        {/* Navigation Items */}
        <nav className="space-y-1.5 pt-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = item.matchPrefix 
              ? location.pathname.startsWith(item.matchPrefix) 
              : location.pathname === item.path;

            return (
              <NavLink
                key={item.name}
                to={item.path}
                onClick={onCloseMobile}
                className="relative block"
              >
                <motion.div
                  whileHover={{ x: 4 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 28 }}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 relative z-10 ${
                    isActive
                      ? 'text-[#4ADE80] font-semibold'
                      : 'text-[#94A3B8] hover:text-[#F8FAFC] hover:bg-slate-800/60'
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="sidebarActiveBackground"
                      className="absolute inset-0 bg-[#4ADE80]/15 rounded-xl border border-[#4ADE80]/30 shadow-[0_0_20px_rgba(74,222,128,0.18)]"
                      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                    />
                  )}

                  <Icon
                    className={`w-4 h-4 transition-transform duration-200 relative z-10 ${
                      isActive ? 'text-[#4ADE80]' : 'text-[#64748B]'
                    }`}
                  />
                  <span className="relative z-10">{item.name}</span>

                  {item.badge !== undefined && item.badge > 0 && (
                    <span className="ml-auto px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-[#3B82F6] text-white relative z-10 animate-pulse">
                      {item.badge}
                    </span>
                  )}

                  {item.name === 'Live Data' && activeItem && (
                    <span className="ml-auto relative flex h-2 w-2 z-10">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#20E79A] opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-[#20E79A]"></span>
                    </span>
                  )}
                </motion.div>
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Bottom User Profile Section */}
      <div className="p-4 border-t border-slate-800/60 bg-slate-950/80">
        <motion.div 
          whileHover={{ scale: 1.02 }}
          className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900 border border-slate-800 shadow-md"
        >
          <div className="flex items-center gap-2.5 min-w-0">
            {/* Avatar Pill */}
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#3B82F6] to-[#4ADE80] flex items-center justify-center font-bold text-white text-xs shrink-0 shadow-md">
              {userProfile?.name?.charAt(0) || userProfile?.email?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-[#F8FAFC] truncate">
                {userProfile?.name || userProfile?.email || 'User'}
              </p>
              <span className="text-[10px] font-medium text-[#64748B] block uppercase tracking-wider">
                {userProfile?.role === 'admin' ? 'Admin' : 'User'}
              </span>
            </div>
          </div>

          {/* Logout Action */}
          <motion.button
            whileHover={{ scale: 1.15, rotate: 5 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleLogout}
            title="Log Out"
            className="p-1.5 text-[#64748B] hover:text-[#FF5A67] hover:bg-[#FF5A67]/15 rounded-lg transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
          </motion.button>
        </motion.div>
      </div>
    </aside>
  );
};


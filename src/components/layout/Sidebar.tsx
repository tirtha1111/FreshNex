import React from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'motion/react';
import { 
  Home, 
  QrCode, 
  Cpu,
  Package,
  BarChart3, 
  Bell,
  Users, 
  Settings, 
  LogOut
} from 'lucide-react';
import { Logo } from '../common/Logo';
import { useAuth } from '../../context/AuthContext';
import { useFreshness } from '../../context/FreshnessContext';

interface SidebarProps {
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ onCloseMobile }) => {
  const { userProfile, logout } = useAuth();
  const { activeItem } = useFreshness();
  const navigate = useNavigate();
  const location = useLocation();

  const liveDataPath = activeItem ? `/live-data/${activeItem.id}` : '/live-data';
  const isAdmin = userProfile?.role === 'admin';

  const adminNavItems = [
    { name: 'Dashboard', path: '/dashboard', icon: Home },
    { name: 'Scan Product', path: '/scan', icon: QrCode },
    { name: 'Devices', path: liveDataPath, icon: Cpu, matchPrefix: '/live-data' },
    { name: 'Products', path: '/history', icon: Package },
    { name: 'Analytics', path: '/analytics', icon: BarChart3 },
    { name: 'Notifications', path: '/alerts', icon: Bell, badge: 3 },
    { name: 'Users', path: '/profile', icon: Users },
    { name: 'Settings', path: '/settings', icon: Settings },
  ];

  const userNavItems = [
    { name: 'Dashboard', path: '/dashboard', icon: Home },
    { name: 'Scanner', path: '/scan', icon: QrCode },
    { name: 'Live Readings', path: liveDataPath, icon: Cpu, matchPrefix: '/live-data' },
    { name: 'Analytics', path: '/analytics', icon: BarChart3 },
    { name: 'Settings', path: '/settings', icon: Settings },
  ];

  const navItems = isAdmin ? adminNavItems : userNavItems;

  const handleLogout = async () => {
    await logout();
    navigate('/login');
    if (onCloseMobile) onCloseMobile();
  };

  return (
    <aside className="w-64 bg-[#07221A] flex flex-col justify-between h-full select-none z-20 font-sans border-r border-[#13493B]/20 shrink-0">
      {/* Top Section */}
      <div className="p-5 flex-1 flex flex-col justify-between min-h-0">
        <div>
          {/* Brand Logo with exact leaves and subtitle */}
          <div className="pb-6 mb-2">
            <Logo size="md" linkTo="/dashboard" />
          </div>

          {/* Navigation Items */}
          <nav className="space-y-1 pt-4">
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
                    className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium text-xs transition-all duration-200 relative z-10 ${
                      isActive
                        ? 'text-white font-bold bg-[#134336]'
                        : 'text-[#8FA39E] hover:text-white hover:bg-[#134336]/40'
                    }`}
                  >
                    <Icon
                      className={`w-4 h-4 transition-transform duration-200 relative z-10 ${
                        isActive ? 'text-[#20E79A]' : 'text-[#5C7F75]'
                      }`}
                    />
                    <span className="relative z-10">{item.name}</span>

                    {item.badge !== undefined && item.badge > 0 && (
                      <span className="ml-auto px-1.5 py-0.5 rounded-full text-[9px] font-black bg-red-500 text-white relative z-10">
                        {item.badge}
                      </span>
                    )}

                    {item.name === 'Devices' && activeItem && (
                      <span className="ml-auto relative flex h-1.5 w-1.5 z-10">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#20E79A] opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[#20E79A]"></span>
                      </span>
                    )}
                  </motion.div>
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Misty Pine Forest Bottom Decorative Card - Exact replica of the image */}
        <div className="mt-8 mb-4 relative rounded-2xl overflow-hidden aspect-[16/10] bg-gradient-to-t from-[#041410] to-[#07221A] border border-[#13493B]/30 flex flex-col justify-end p-4 text-center">
          {/* Unsplash beautiful dark pine forest image backplate */}
          <div 
            className="absolute inset-0 bg-cover bg-center opacity-40 mix-blend-overlay pointer-events-none"
            style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1511497584788-876760111969?w=300&q=80")' }}
          />
          {/* Subtle green vignette overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#07221A] via-transparent to-transparent pointer-events-none" />

          {/* Slogan with script handwriting style */}
          <div className="relative z-10 space-y-3">
            <div className="space-y-0.5">
              <span className="block font-serif italic text-white text-[17px] leading-tight tracking-wide drop-shadow-md">
                Good Food
              </span>
              <span className="block font-serif italic text-[#20E79A] text-[20px] leading-tight font-black tracking-wide drop-shadow-md">
                Brighter
              </span>
              <span className="block font-serif italic text-white text-[17px] leading-tight tracking-wide drop-shadow-md">
                Futures
              </span>
            </div>

            {/* Tiny leaf icon */}
            <div className="flex justify-center text-[#20E79A]/70">
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                <path d="M12 2C12 2 8 5 6 9C4 13 6 17 9 18C10 16 11 13 12 10C13 13 14 16 15 18C18 17 20 13 18 9C16 5 12 2 12 2Z" />
              </svg>
            </div>

            {/* Quote copy from the image */}
            <p className="text-[10px] text-[#8FA39E] font-medium leading-relaxed max-w-[170px] mx-auto italic">
              "A healthier planet starts with safer food."
            </p>
          </div>
        </div>
      </div>

      {/* Bottom User Profile Section */}
      <div className="p-4 border-t border-[#13493B]/20 bg-[#041410]/50">
        <div className="flex items-center justify-between p-2 rounded-xl bg-[#07221A] border border-[#13493B]/30 shadow-md">
          <div className="flex items-center gap-2.5 min-w-0">
            {/* Avatar Pill matching Admin style in the image */}
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#13493B] to-[#20E79A] flex items-center justify-center font-bold text-white text-xs shrink-0 shadow-md border border-[#20E79A]/20">
              {userProfile?.name?.charAt(0) || 'A'}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-white truncate">
                {userProfile?.name || (isAdmin ? 'Admin' : 'Product Access')}
              </p>
              <span className="text-[9px] font-semibold text-[#8FA39E] block uppercase tracking-wider truncate">
                {isAdmin ? 'Administrator' : `Tag #${userProfile?.assignedProductId || 'MILK'}`}
              </span>
            </div>
          </div>

          {/* Logout Action */}
          <motion.button
            whileHover={{ scale: 1.15, rotate: 5 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleLogout}
            title="Log Out"
            className="p-1.5 text-[#5C7F75] hover:text-[#FF5A67] hover:bg-[#FF5A67]/15 rounded-lg transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
          </motion.button>
        </div>
      </div>
    </aside>
  );
};

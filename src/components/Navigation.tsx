import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { motion } from 'motion/react';
import { 
  Home, 
  QrCode, 
  History, 
  PackageCheck, 
  User, 
  ShieldCheck, 
  LayoutDashboard, 
  Cpu, 
  Users, 
  Bell, 
  Settings, 
  LogOut
} from 'lucide-react';

export const UserBottomNav: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { label: 'HOME', path: '/', icon: Home },
    { label: 'HISTORY', path: '/scan-history', icon: History },
    { label: 'SCAN', path: '/scan', icon: QrCode, isCenter: true },
    { label: 'PRODUCTS', path: '/products', icon: PackageCheck },
    { label: 'PROFILE', path: '/profile', icon: User },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 px-3 pb-3 pt-1 pointer-events-none">
      <div className="max-w-md mx-auto pointer-events-auto">
        <div className="glass-card px-3 py-2 flex items-center justify-around shadow-2xl border border-[#FF6A00]/30 bg-[#140E0A]/90 backdrop-blur-2xl rounded-2xl">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));
            const Icon = item.icon;

            if (item.isCenter) {
              return (
                <div key={item.label} className="relative -top-5">
                  <motion.button
                    whileTap={{ scale: 0.92 }}
                    whileHover={{ scale: 1.05 }}
                    onClick={() => navigate('/scan')}
                    className="w-14 h-14 rounded-full bg-gradient-to-tr from-[#FF6A00] to-[#FFAA00] text-[#120A05] flex items-center justify-center shadow-xl shadow-[#FF6A00]/40 ring-4 ring-[#0D0A08] border border-white/40"
                  >
                    <QrCode className="w-7 h-7 stroke-[2.5px]" />
                  </motion.button>
                  <span className="text-[10px] font-black text-[#FFAA00] tracking-wider text-center block mt-1 drop-shadow-sm">
                    SCAN
                  </span>
                </div>
              );
            }

            return (
              <button
                key={item.label}
                onClick={() => navigate(item.path)}
                className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all duration-200 ${
                  isActive ? 'text-[#FFAA00] font-extrabold scale-105' : 'text-[#B8A89E] hover:text-[#FDF8F5]'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5px] text-[#FFAA00] drop-shadow-[0_0_8px_rgba(255,170,0,0.6)]' : ''}`} />
                <span className={`text-[10px] mt-1 ${isActive ? 'font-bold text-[#FFAA00]' : 'font-medium'}`}>
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export const UserHeader: React.FC = () => {
  const { userRecord } = useApp();
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-30 glass-nav px-4 py-3 shadow-lg">
      <div className="max-w-5xl mx-auto flex items-center justify-between">
        <div 
          onClick={() => navigate('/')} 
          className="flex items-center gap-2.5 cursor-pointer group"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#FF6A00] to-[#FFAA00] text-[#120A05] flex items-center justify-center shadow-md shadow-[#FF6A00]/30 group-hover:scale-105 transition-transform">
            <ShieldCheck className="w-5 h-5 stroke-[2.5px]" />
          </div>
          <div>
            <h1 className="text-lg font-black text-[#FDF8F5] tracking-tight leading-none">
              Fresh<span className="text-[#FF7B00]">Nex</span>
            </h1>
            <p className="text-[10px] font-bold text-[#FFAA00] tracking-widest uppercase mt-0.5 opacity-90">
              IoT Freshness Matrix
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => navigate('/notifications')}
            className="w-9 h-9 rounded-xl glass-card text-[#FFAA00] flex items-center justify-center hover:bg-[#FF6A00]/10 transition-colors relative border border-[#FF6A00]/20"
          >
            <Bell className="w-4 h-4" />
          </button>

          <button
            onClick={() => navigate('/profile')}
            className="flex items-center gap-2 pl-2 pr-3 py-1 rounded-xl glass-card hover:bg-[#FF6A00]/10 transition-colors border border-[#FF6A00]/20"
          >
            <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-[#FF6A00] to-[#FFAA00] text-[#120A05] text-xs font-black flex items-center justify-center shadow-sm">
              {userRecord?.name ? userRecord.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <span className="text-xs font-bold text-[#FDF8F5] max-w-[100px] truncate hidden sm:inline">
              {userRecord?.name || 'User'}
            </span>
          </button>
        </div>
      </div>
    </header>
  );
};

export const AdminLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { userRecord, logout } = useApp();
  const navigate = useNavigate();
  const location = useLocation();

  const adminNav = [
    { label: 'Dashboard', path: '/admin', icon: LayoutDashboard },
    { label: 'Devices', path: '/admin/devices', icon: Cpu },
    { label: 'Users', path: '/admin/users', icon: Users },
    { label: 'Products', path: '/admin/products', icon: PackageCheck },
    { label: 'Alerts', path: '/admin/alerts', icon: Bell },
    { label: 'Settings', path: '/admin/settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-[#0D0A08] text-[#FDF8F5] flex flex-col md:flex-row">
      {/* Sidebar for Desktop / Header for Mobile */}
      <aside className="w-full md:w-64 glass-nav border-r border-[#FF6A00]/20 flex-shrink-0 flex flex-col justify-between p-4 md:min-h-screen">
        <div>
          {/* Admin Header */}
          <div className="flex items-center justify-between md:justify-start gap-3 pb-4 mb-4 border-b border-[#FF6A00]/20">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#FF6A00] to-[#FFAA00] text-[#120A05] flex items-center justify-center shadow-lg shadow-[#FF6A00]/30">
                <ShieldCheck className="w-6 h-6 stroke-[2.5px]" />
              </div>
              <div>
                <h2 className="text-lg font-black tracking-tight text-[#FDF8F5]">
                  Fresh<span className="text-[#FF7B00]">Nex</span>
                </h2>
                <span className="inline-block px-2 py-0.5 text-[9px] font-black uppercase tracking-widest bg-[#FF6A00]/20 text-[#FFAA00] rounded-full border border-[#FF6A00]/30">
                  ADMIN CONSOLE
                </span>
              </div>
            </div>
          </div>

          {/* Admin Navigation Links */}
          <nav className="space-y-1.5">
            {adminNav.map((item) => {
              const isActive = location.pathname === item.path || (item.path !== '/admin' && location.pathname.startsWith(item.path));
              const Icon = item.icon;
              return (
                <button
                  key={item.label}
                  onClick={() => navigate(item.path)}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-bold text-xs transition-all duration-200 ${
                    isActive
                      ? 'bg-gradient-to-r from-[#FF6A00] to-[#FFAA00] text-[#120A05] shadow-lg shadow-[#FF6A00]/30 font-extrabold'
                      : 'text-[#B8A89E] hover:bg-white/5 hover:text-[#FFAA00]'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* User Badge & Logout */}
        <div className="pt-4 mt-4 border-t border-[#FF6A00]/20 flex items-center justify-between">
          <div className="flex items-center gap-2 overflow-hidden">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#FF6A00] to-[#FFAA00] text-[#120A05] font-black text-xs flex items-center justify-center shrink-0 shadow-sm">
              {userRecord?.name ? userRecord.name.charAt(0).toUpperCase() : 'A'}
            </div>
            <div className="truncate">
              <p className="text-xs font-bold text-white truncate">{userRecord?.name || 'Admin'}</p>
              <p className="text-[10px] text-[#FFAA00] font-medium truncate">{userRecord?.email}</p>
            </div>
          </div>
          <button
            onClick={() => logout()}
            title="Log Out"
            className="p-2 rounded-xl text-[#B8A89E] hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-4 sm:p-6 md:p-8 overflow-y-auto pb-24 md:pb-8">
        {children}
      </main>
    </div>
  );
};

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { userRole } = useApp();

  if (userRole === 'admin') {
    return <AdminLayout>{children}</AdminLayout>;
  }

  return (
    <div className="min-h-screen bg-[#0D0A08] text-[#FDF8F5] flex flex-col pb-24 relative overflow-hidden">
      {/* Background ambient glowing orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-[#FF6A00]/10 blur-[140px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-[#FFAA00]/10 blur-[140px] pointer-events-none" />
      
      <UserHeader />
      <main className="flex-1 max-w-5xl w-full mx-auto p-4 sm:p-6 relative z-10">
        {children}
      </main>
      <UserBottomNav />
    </div>
  );
};

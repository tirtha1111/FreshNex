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
  LogOut,
  Sparkles
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
        <div className="glass-card rounded-2xl px-3 py-2 flex items-center justify-around shadow-xl border border-white/80 bg-white/85 backdrop-blur-2xl">
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
                    className="w-14 h-14 rounded-full bg-gradient-to-tr from-[#1267D6] via-[#1A73E8] to-[#2196F3] text-white flex items-center justify-center shadow-xl shadow-sky-500/40 ring-4 ring-white/90 border border-sky-200"
                  >
                    <QrCode className="w-7 h-7" />
                  </motion.button>
                  <span className="text-[10px] font-black text-[#1267D6] tracking-wider text-center block mt-1">
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
                  isActive ? 'text-[#1267D6] font-extrabold' : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5px] scale-110 text-[#1267D6]' : ''}`} />
                <span className={`text-[10px] mt-1 ${isActive ? 'font-bold text-[#1267D6]' : 'font-medium'}`}>
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
  const { userRecord, logout } = useApp();
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-30 bg-white/70 backdrop-blur-xl border-b border-sky-100/80 px-4 py-3 shadow-xs">
      <div className="max-w-5xl mx-auto flex items-center justify-between">
        <div 
          onClick={() => navigate('/')} 
          className="flex items-center gap-2.5 cursor-pointer group"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#1267D6] to-[#2196F3] text-white flex items-center justify-center shadow-md shadow-sky-500/20 group-hover:scale-105 transition-transform">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg font-black text-[#082A52] leading-none">
              Fresh<span className="text-[#1267D6]">Nex</span>
            </h1>
            <p className="text-[10px] font-bold text-sky-600 tracking-wider uppercase mt-0.5">
              IoT Food Freshness
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate('/notifications')}
            className="w-9 h-9 rounded-xl bg-sky-50 border border-sky-100 text-sky-700 flex items-center justify-center hover:bg-sky-100 transition-colors relative"
          >
            <Bell className="w-4 h-4" />
          </button>

          <button
            onClick={() => navigate('/profile')}
            className="flex items-center gap-2 pl-2 pr-3 py-1 rounded-xl bg-sky-50/80 border border-sky-100 hover:bg-sky-100 transition-colors"
          >
            <div className="w-6 h-6 rounded-lg bg-[#1267D6] text-white text-xs font-black flex items-center justify-center">
              {userRecord?.name ? userRecord.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <span className="text-xs font-bold text-[#082A52] max-w-[100px] truncate hidden sm:inline">
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
    <div className="min-h-screen bg-[#F5F9FF] flex flex-col md:flex-row">
      {/* Sidebar for Desktop / Header for Mobile */}
      <aside className="w-full md:w-64 bg-[#082A52] text-white flex-shrink-0 flex flex-col justify-between p-4 md:min-h-screen">
        <div>
          {/* Admin Header */}
          <div className="flex items-center justify-between md:justify-start gap-3 pb-4 mb-4 border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#1267D6] to-[#2196F3] text-white flex items-center justify-center shadow-lg shadow-sky-500/30">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-lg font-black tracking-tight text-white">
                  Fresh<span className="text-sky-400">Nex</span>
                </h2>
                <span className="inline-block px-2 py-0.5 text-[9px] font-black uppercase tracking-widest bg-sky-500/20 text-sky-300 rounded-full border border-sky-400/30">
                  ADMIN CONSOLE
                </span>
              </div>
            </div>
          </div>

          {/* Admin Navigation Links */}
          <nav className="space-y-1">
            {adminNav.map((item) => {
              const isActive = location.pathname === item.path || (item.path !== '/admin' && location.pathname.startsWith(item.path));
              const Icon = item.icon;
              return (
                <button
                  key={item.label}
                  onClick={() => navigate(item.path)}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-bold text-xs transition-all duration-200 ${
                    isActive
                      ? 'bg-gradient-to-r from-[#1267D6] to-[#2196F3] text-white shadow-lg shadow-sky-600/30'
                      : 'text-slate-300 hover:bg-white/5 hover:text-white'
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
        <div className="pt-4 mt-4 border-t border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2 overflow-hidden">
            <div className="w-8 h-8 rounded-full bg-sky-500 text-white font-black text-xs flex items-center justify-center shrink-0">
              {userRecord?.name ? userRecord.name.charAt(0).toUpperCase() : 'A'}
            </div>
            <div className="truncate">
              <p className="text-xs font-bold text-white truncate">{userRecord?.name || 'Admin'}</p>
              <p className="text-[10px] text-sky-300 font-medium truncate">{userRecord?.email}</p>
            </div>
          </div>
          <button
            onClick={() => logout()}
            title="Log Out"
            className="p-2 rounded-xl text-slate-300 hover:text-rose-400 hover:bg-white/10 transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-4 sm:p-6 md:p-8 overflow-y-auto pb-20 md:pb-8">
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
    <div className="min-h-screen bg-[#F5F9FF] text-[#082A52] flex flex-col pb-24">
      <UserHeader />
      <main className="flex-1 max-w-5xl w-full mx-auto p-4 sm:p-6">
        {children}
      </main>
      <UserBottomNav />
    </div>
  );
};

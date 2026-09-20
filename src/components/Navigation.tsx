import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { motion } from 'motion/react';
import { 
  Home, 
  QrCode, 
  History, 
  User, 
  ShieldCheck, 
  LayoutDashboard, 
  Cpu, 
  Users, 
  Bell, 
  PackageCheck,
  Settings, 
  LogOut,
  Leaf
} from 'lucide-react';

export const UserBottomNav: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { label: 'Home', path: '/', icon: Home },
    { label: 'Scan', path: '/scan', icon: QrCode },
    { label: 'History', path: '/scan-history', icon: History },
    { label: 'Profile', path: '/profile', icon: User },
  ];

  return (
    <div className="fixed bottom-4 left-4 right-4 z-40 bg-[#141416]/85 backdrop-blur-2xl border border-white/10 shadow-2xl rounded-3xl px-4 py-2.5 select-none max-w-md mx-auto">
      <div className="flex items-center justify-around">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));
          const Icon = item.icon;

          return (
            <button
              key={item.label}
              onClick={() => navigate(item.path)}
              className={`flex flex-col items-center justify-center py-1 px-3 rounded-2xl transition-all duration-200 cursor-pointer ${
                isActive 
                  ? 'text-[#21c55d] font-extrabold' 
                  : 'text-slate-400 hover:text-slate-200 font-semibold'
              }`}
            >
              <div className={`relative p-1 rounded-xl transition-all ${isActive ? 'scale-110' : ''}`}>
                <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5px] text-[#21c55d]' : 'stroke-[1.75px]'}`} />
                {isActive && (
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-[#21c55d] rounded-full shadow-[0_0_10px_#21c55d]" />
                )}
              </div>
              <span className={`text-[9px] mt-1 tracking-tight uppercase font-mono ${isActive ? 'font-black text-[#21c55d]' : 'font-semibold text-slate-500'}`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export const UserHeader: React.FC = () => {
  const { userRecord, logout } = useApp();
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-30 bg-[#0b0b0c]/85 backdrop-blur-xl border-b border-white/5 px-4 py-3 select-none">
      <div className="max-w-md md:max-w-4xl mx-auto flex items-center justify-between">
        <div 
          onClick={() => navigate('/')} 
          className="flex items-center gap-2 cursor-pointer group"
        >
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-[#1267D6] to-[#21c55d] text-white flex items-center justify-center shadow-lg shadow-emerald-500/10">
            <Leaf className="w-4.5 h-4.5 text-white" />
          </div>
          <div>
            <h1 className="text-sm font-black text-[#edeff2] leading-none tracking-tight">
              Fresh<span className="text-[#38bdf8]">Nex</span>
            </h1>
            <p className="text-[8px] font-mono font-black text-slate-500 tracking-wider uppercase mt-0.5">
              IoT Telemetry
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => navigate('/alerts')}
            className="w-8 h-8 rounded-xl bg-white/5 border border-white/10 text-slate-300 flex items-center justify-center hover:bg-white/10 transition-colors relative"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-red-500 ring-1 ring-[#0b0b0c]" />
          </button>

          <button
            onClick={() => navigate('/profile')}
            className="flex items-center gap-2 pl-2 pr-2 py-1 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
          >
            <div className="w-5 h-5 rounded-lg bg-gradient-to-tr from-[#1267D6] to-[#21c55d] text-white text-[9px] font-black flex items-center justify-center">
              {userRecord?.name ? userRecord.name.charAt(0).toUpperCase() : 'A'}
            </div>
            <span className="text-[10px] font-bold text-[#edeff2] max-w-[80px] truncate hidden sm:inline-block">
              {userRecord?.name || 'Alex'}
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
    <div className="min-h-screen bg-[#0b0b0c] text-[#edeff2] flex flex-col md:flex-row">
      {/* Sidebar - Matching Mockup aside */}
      <aside className="w-full md:w-[280px] bg-[#141416] border-b md:border-b-0 md:border-r border-white/5 flex-shrink-0 flex flex-col justify-between p-6 select-none">
        <div>
          {/* Logo Area */}
          <div className="logo-area mb-8 md:mb-10">
            <div className="logo-flex flex items-center gap-3">
              <div className="logo-icon w-10 h-10 bg-gradient-to-tr from-[#1267D6] to-[#21c55d] rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/10">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"></path>
                  <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"></path>
                </svg>
              </div>
              <div>
                <h2 className="text-sm font-black text-[#edeff2] tracking-tight">
                  Fresh<span className="text-[#38bdf8]">Nex</span>
                </h2>
                <span className="admin-badge font-mono text-[9px] text-[#38bdf8] uppercase tracking-widest block mt-0.5">
                  SYSTEM INFRASTRUCTURE
                </span>
              </div>
            </div>
          </div>

          {/* Admin Navigation list */}
          <nav className="space-y-1.5 flex flex-row md:flex-col overflow-x-auto md:overflow-visible pb-2 md:pb-0 gap-1 md:gap-0">
            {adminNav.map((item) => {
              const isActive = location.pathname === item.path;
              const Icon = item.icon;

              return (
                <button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  className={`nav-item w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all duration-200 whitespace-nowrap cursor-pointer text-left ${
                    isActive
                      ? 'bg-[rgba(33,197,93,0.1)] text-[#21c55d]'
                      : 'text-slate-400 hover:text-[#edeff2] hover:bg-white/5'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* User panel - Matching Mockup */}
        <div className="user-panel pt-6 mt-6 border-t border-white/5 hidden md:block">
          <div className="user-info flex items-center gap-2.5 mb-4">
            <div className="avatar w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center font-extrabold text-[11px] text-white">
              {userRecord?.name ? userRecord.name.charAt(0).toUpperCase() : 'T'}
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-black text-white truncate leading-none mb-1">
                {userRecord?.name?.toUpperCase() || 'TIRTHARAJ'}
              </p>
              <p className="text-[10px] text-slate-400 truncate leading-none">
                {userRecord?.email || 'realtirtharaj@gmail.com'}
              </p>
            </div>
          </div>

          <button
            onClick={() => navigate('/')}
            className="w-full h-10 rounded-xl bg-white/5 hover:bg-white/10 text-[11px] font-black text-slate-300 border border-white/5 transition-colors flex items-center justify-center mb-2 cursor-pointer"
          >
            Switch to Consumer View
          </button>

          <button
            onClick={logout}
            className="w-full h-10 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-[11px] font-black text-red-300 transition-colors flex items-center justify-center cursor-pointer"
          >
            Log Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-6 md:p-10 overflow-y-auto max-w-6xl w-full">
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
    <div className="min-h-screen bg-[#0b0b0c] text-[#edeff2] flex flex-col justify-between">
      <UserHeader />
      <main className="flex-1 p-4 pb-24 md:pb-8 max-w-md md:max-w-4xl mx-auto w-full">
        {children}
      </main>
      <UserBottomNav />
    </div>
  );
};

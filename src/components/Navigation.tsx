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

  // Exactly matching the 4 tabs from image screens 5, 8, 9:
  // 1: Home
  // 2: Scan
  // 3: History
  // 4: Profile
  const navItems = [
    { label: 'Home', path: '/', icon: Home },
    { label: 'Scan', path: '/scan', icon: QrCode },
    { label: 'History', path: '/scan-history', icon: History },
    { label: 'Profile', path: '/profile', icon: User },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-xl border-t border-slate-100 shadow-[0_-4px_20px_rgba(0,0,0,0.04)] px-4 py-2 select-none">
      <div className="max-w-md mx-auto flex items-center justify-around">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));
          const Icon = item.icon;

          return (
            <button
              key={item.label}
              onClick={() => navigate(item.path)}
              className={`flex flex-col items-center justify-center py-1 px-4 rounded-2xl transition-all duration-200 cursor-pointer ${
                isActive 
                  ? 'text-[#1267D6] font-extrabold' 
                  : 'text-slate-400 hover:text-slate-600 font-semibold'
              }`}
            >
              <div className={`relative p-1 rounded-xl transition-all ${isActive ? 'scale-110' : ''}`}>
                <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5px] text-[#1267D6]' : 'stroke-[1.75px]'}`} />
              </div>
              <span className={`text-[10px] mt-0.5 tracking-tight ${isActive ? 'font-black text-[#1267D6]' : 'font-medium text-slate-400'}`}>
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
    <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-xl border-b border-sky-100 px-4 py-3 shadow-xs hidden md:block">
      <div className="max-w-5xl mx-auto flex items-center justify-between">
        <div 
          onClick={() => navigate('/')} 
          className="flex items-center gap-2.5 cursor-pointer group"
        >
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-[#1267D6] to-[#19A463] text-white flex items-center justify-center shadow-md">
            <Leaf className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-base font-black text-[#082A52] leading-none">
              Fresh<span className="text-[#1267D6]">Nex</span>
            </h1>
            <p className="text-[9px] font-bold text-sky-600 tracking-wider uppercase mt-0.5">
              Smarter Food. Safer Tomorrow.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/alerts')}
            className="w-9 h-9 rounded-xl bg-sky-50 border border-sky-100 text-sky-700 flex items-center justify-center hover:bg-sky-100 transition-colors relative"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-red-500 ring-2 ring-white" />
          </button>

          <button
            onClick={() => navigate('/profile')}
            className="flex items-center gap-2 pl-2 pr-3 py-1 rounded-xl bg-sky-50 border border-sky-100 hover:bg-sky-100 transition-colors"
          >
            <div className="w-6 h-6 rounded-lg bg-[#1267D6] text-white text-xs font-black flex items-center justify-center">
              {userRecord?.name ? userRecord.name.charAt(0).toUpperCase() : 'A'}
            </div>
            <span className="text-xs font-bold text-[#082A52] max-w-[120px] truncate">
              {userRecord?.name || 'Alex Johnson'}
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
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#1267D6] to-[#19A463] text-white flex items-center justify-center shadow-lg">
                <Leaf className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-base font-black tracking-tight text-white leading-none">
                  Fresh<span className="text-[#38BDF8]">Nex</span>
                </h2>
                <span className="text-[9px] font-bold text-sky-300 uppercase tracking-widest block mt-0.5">
                  ADMIN CONSOLE
                </span>
              </div>
            </div>

            <button
              onClick={() => navigate('/')}
              className="md:hidden text-[10px] font-black px-2.5 py-1 rounded-lg bg-sky-500/20 text-sky-300 border border-sky-400/30"
            >
              Consumer View
            </button>
          </div>

          {/* Admin Navigation list */}
          <nav className="space-y-1.5 flex flex-row md:flex-col overflow-x-auto md:overflow-visible pb-2 md:pb-0">
            {adminNav.map((item) => {
              const isActive = location.pathname === item.path;
              const Icon = item.icon;

              return (
                <button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 whitespace-nowrap cursor-pointer ${
                    isActive
                      ? 'bg-gradient-to-r from-[#1267D6] to-[#2196F3] text-white shadow-md shadow-sky-500/30'
                      : 'text-slate-300 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* User footer in Admin */}
        <div className="pt-4 mt-4 border-t border-white/10 hidden md:block">
          <div className="flex items-center justify-between mb-3 px-1">
            <div className="flex items-center gap-2 overflow-hidden">
              <div className="w-7 h-7 rounded-lg bg-sky-500/20 border border-sky-400/30 flex items-center justify-center text-sky-300 text-xs font-black">
                A
              </div>
              <div className="overflow-hidden">
                <p className="text-xs font-bold text-white truncate">{userRecord?.name || 'Admin User'}</p>
                <p className="text-[10px] text-slate-400 truncate">{userRecord?.email || 'admin@freshnex.com'}</p>
              </div>
            </div>
          </div>

          <div className="space-y-1">
            <button
              onClick={() => navigate('/')}
              className="w-full py-2 px-3 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-bold text-sky-200 transition-colors flex items-center justify-center gap-2"
            >
              <span>Switch to Consumer View</span>
            </button>
            <button
              onClick={logout}
              className="w-full py-2 px-3 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-xs font-bold text-red-300 transition-colors flex items-center justify-center gap-2"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Log Out</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-4 md:p-8 overflow-y-auto max-w-6xl">
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
    <div className="min-h-screen bg-gradient-to-b from-[#F5F9FF] via-[#EAF4FF] to-[#D9ECFF] text-[#082A52] flex flex-col justify-between">
      <UserHeader />
      <main className="flex-1 p-4 pb-24 md:pb-8 max-w-md md:max-w-4xl mx-auto w-full">
        {children}
      </main>
      <UserBottomNav />
    </div>
  );
};

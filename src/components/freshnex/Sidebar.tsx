import React from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
  Home,
  Radio,
  Cpu,
  Package,
  Boxes,
  BarChart3,
  FileText,
  Bell,
  Users,
  Settings,
  ChevronDown,
  X,
} from 'lucide-react';
import { FreshNexLogo } from './FreshNexLogo';
import { useFreshNex } from '../../context/FreshNexContext';
import { ASSETS } from '../../assets/images';

interface SidebarProps {
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

interface NavItemConfig {
  label: string;
  path: string;
  icon: React.FC<{ className?: string }>;
  hasSubIndicator?: boolean;
  badgeCount?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({ mobileOpen, onCloseMobile }) => {
  const { unreadAlertsCount } = useFreshNex();
  const location = useLocation();
  const navigate = useNavigate();

  const navItems: NavItemConfig[] = [
    { label: 'Dashboard', path: '/', icon: Home },
    { label: 'Live Monitoring', path: '/live-monitoring', icon: Radio },
    { label: 'Devices', path: '/devices', icon: Cpu, hasSubIndicator: true },
    { label: 'Parcels', path: '/parcels', icon: Package, hasSubIndicator: true },
    { label: 'Products', path: '/products', icon: Boxes, hasSubIndicator: true },
    { label: 'Analytics', path: '/analytics', icon: BarChart3, hasSubIndicator: true },
    { label: 'Reports', path: '/reports', icon: FileText },
    {
      label: 'Alerts',
      path: '/alerts',
      icon: Bell,
      badgeCount: unreadAlertsCount > 0 ? unreadAlertsCount : undefined,
    },
    { label: 'Users', path: '/users', icon: Users },
    { label: 'Settings', path: '/settings', icon: Settings },
  ];

  const isPathActive = (itemPath: string) => {
    if (itemPath === '/') {
      return location.pathname === '/' || location.pathname === '/dashboard';
    }
    return location.pathname.startsWith(itemPath);
  };

  const sidebarContent = (
    <aside className="w-[268px] h-full bg-white border-r border-[#DFEAF0] flex flex-col justify-between select-none shrink-0">
      {/* Top Logo & Navigation */}
      <div className="p-5 pb-3">
        <div className="flex items-center justify-between mb-6 px-1">
          <div
            onClick={() => {
              navigate('/');
              onCloseMobile();
            }}
            className="cursor-pointer"
          >
            <FreshNexLogo showTagline={true} />
          </div>
          <button
            onClick={onCloseMobile}
            className="lg:hidden p-1.5 rounded-lg text-[#71869A] hover:text-[#102F46] hover:bg-[#F7FAFC]"
            aria-label="Close navigation menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="space-y-1" aria-label="Main Navigation">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isPathActive(item.path);
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onCloseMobile}
                className={`group flex items-center justify-between px-3.5 py-2.5 rounded-xl text-[14px] transition-all duration-150 ${
                  active
                    ? 'bg-[#E5F8F0] text-[#102F46] font-bold shadow-[inset_0_0_0_1px_rgba(7,155,104,0.15)]'
                    : 'text-[#102F46]/80 font-medium hover:bg-[#F7FAFC] hover:text-[#102F46]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-[18px] h-[18px] transition-colors ${
                      active
                        ? 'text-[#079B68]'
                        : 'text-[#102F46]/70 group-hover:text-[#079B68]'
                    }`}
                  />
                  <span>{item.label}</span>
                </div>

                {item.badgeCount !== undefined && (
                  <span className="min-w-[20px] h-5 px-1.5 rounded-full bg-[#EF5350] text-white text-[11px] font-bold flex items-center justify-center tabular-nums">
                    {item.badgeCount}
                  </span>
                )}

                {item.hasSubIndicator && item.badgeCount === undefined && (
                  <ChevronDown
                    className={`w-3.5 h-3.5 transition-transform ${
                      active ? 'text-[#079B68]' : 'text-[#71869A]'
                    }`}
                  />
                )}
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Bottom Brand Sustainability Card matching reference image */}
      <div className="p-4 pt-2">
        <div className="relative rounded-2xl overflow-hidden border border-[#DFEAF0] shadow-xs bg-[#EAF4F8]">
          {/* Background scenic image with light upper sky overlay for crisp text readability */}
          <img
            src={ASSETS.farmLandscape}
            alt="Sustainable fresh food agriculture"
            className="w-full h-[215px] object-cover object-bottom"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-white/95 via-white/80 to-transparent p-4 flex flex-col justify-between">
            <div>
              {/* Mini Leaf + FreshNex */}
              <div className="flex items-center gap-1.5 mb-1.5">
                <svg className="w-5 h-5 text-[#079B68]" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17 8C8 10 5.9 16.17 3.82 21.34L5.71 22L6.66 19.7C7.14 19.87 7.64 20 8 20C19 20 22 3 22 3C21 5 14 5.25 9 6.25C4 7.25 2 11.5 2 13.5C2 15.5 3.75 17.25 3.75 17.25C7 8 17 8 17 8Z" />
                </svg>
                <span className="text-[16px] font-extrabold tracking-tight">
                  <span className="text-[#102F46]">Fresh</span>
                  <span className="text-[#079B68]">Nex</span>
                </span>
              </div>
              <p className="text-[11.5px] font-semibold text-[#102F46] leading-snug">
                Real-time insights.
                <br />
                Safer food. Healthier tomorrow.
              </p>
            </div>

            <div className="text-center pb-1">
              <div className="inline-block bg-white/85 backdrop-blur-xs px-3 py-1 rounded-xl shadow-xs border border-white/60">
                <p className="font-handwritten text-[19px] leading-tight text-[#102F46] font-bold -rotate-3">
                  Good Food
                  <br />
                  Brighter Future
                </p>
                <div className="h-0.5 w-14 bg-[#079B68] mx-auto mt-0.5 rounded-full -rotate-3" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );

  return (
    <>
      {/* Desktop Sticky Sidebar */}
      <div className="hidden lg:block sticky top-0 h-screen shrink-0 z-30">
        {sidebarContent}
      </div>

      {/* Mobile Drawer Overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-[#102F46]/40 backdrop-blur-xs"
            onClick={onCloseMobile}
          />
          <div className="relative z-10 h-full">{sidebarContent}</div>
        </div>
      )}
    </>
  );
};

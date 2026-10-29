import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';

export const FreshNexLayout: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#F7FAFC] text-[#102F46] flex">
      {/* Left Sidebar Navigation */}
      <Sidebar
        mobileOpen={mobileMenuOpen}
        onCloseMobile={() => setMobileMenuOpen(false)}
      />

      {/* Right Main Area: Top Navigation Bar + Workspace */}
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar onOpenMobileMenu={() => setMobileMenuOpen(true)} />
        <main className="flex-1 p-4 sm:p-5 lg:p-6 max-w-[1640px] w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

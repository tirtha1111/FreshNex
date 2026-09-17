import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider, useApp } from './context/AppContext';
import { Splash } from './components/Splash';
import { Layout } from './components/Navigation';
import { Login, SignUp, ForgotPassword } from './components/Auth';
import { Dashboard } from './components/Dashboard';
import { ScanProduct } from './components/ScanProduct';
import { ProductDetails } from './components/ProductDetails';
import { Products } from './components/Products';
import { HistoryPage } from './components/History';
import { Alerts } from './components/Alerts';
import { ProfileSettings } from './components/ProfileSettings';

// Admin Components
import { AdminDashboard } from './components/AdminDashboard';
import { AdminDevices } from './components/AdminDevices';
import { AdminProducts } from './components/AdminProducts';
import { AdminUsers } from './components/AdminUsers';
import { AdminAlerts } from './components/AdminAlerts';
import { AdminSettings } from './components/AdminSettings';

const AppContent: React.FC = () => {
  const { currentUser, userRole, isLoading } = useApp();
  const [showSplash, setShowSplash] = useState<boolean>(true);

  if (showSplash) {
    return <Splash onFinish={() => setShowSplash(false)} />;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F5F9FF] flex flex-col items-center justify-center p-4">
        <div className="w-12 h-12 border-4 border-[#1267D6] border-t-transparent rounded-full animate-spin" />
        <p className="text-xs text-[#082A52] font-black mt-4 tracking-wider uppercase">
          Initializing FreshNex Telemetry Engine...
        </p>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  return (
    <Layout>
      <Routes>
        {userRole === 'admin' ? (
          <>
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/devices" element={<AdminDevices />} />
            <Route path="/admin/products" element={<AdminProducts />} />
            <Route path="/admin/users" element={<AdminUsers />} />
            <Route path="/admin/alerts" element={<AdminAlerts />} />
            <Route path="/admin/settings" element={<AdminSettings />} />
            <Route path="*" element={<Navigate to="/admin" replace />} />
          </>
        ) : (
          <>
            <Route path="/" element={<Dashboard />} />
            <Route path="/scan" element={<ScanProduct />} />
            <Route path="/products/:productId" element={<ProductDetails />} />
            <Route path="/products" element={<Products />} />
            <Route path="/scan-history" element={<HistoryPage />} />
            <Route path="/notifications text-slate-500" element={<Alerts />} />
            <Route path="/alerts" element={<Alerts />} />
            <Route path="/profile" element={<ProfileSettings />} />
            <Route path="/settings" element={<ProfileSettings />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </>
        )}
      </Routes>
    </Layout>
  );
};

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </AppProvider>
  );
}

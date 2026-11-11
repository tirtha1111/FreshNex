import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AppProvider } from './context/AppContext';
import { FreshnessProvider } from './context/FreshnessContext';
import { AppLayout } from './components/layout/AppLayout';
import { WarehouseRFIDListener } from './components/WarehouseRFIDListener';

// Pages
import { LoginPage } from './pages/LoginPage';
import { SignUpPage } from './pages/SignUpPage';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage';
import { AboutPage } from './pages/AboutPage';

import { ScanPage } from './pages/ScanPage';
import { DashboardPage } from './pages/DashboardPage';
import { LiveDataPage } from './pages/LiveDataPage';
import { AlertsPage } from './pages/AlertsPage';
import { HistoryPage } from './pages/HistoryPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { ProfilePage } from './pages/ProfilePage';
import { SettingsPage } from './pages/SettingsPage';
import { ThresholdsPage } from './pages/ThresholdsPage';
import { WarehousePage } from './pages/WarehousePage';
import { AdminDevices } from './components/AdminDevices';

// Protected Route Guard for User and Admin routes
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser, userProfile, warehouseSession, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F4FBF7] flex flex-col items-center justify-center p-4">
        <div className="w-10 h-10 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-xs text-emerald-900/70 font-bold mt-4 tracking-wider uppercase">
          Loading FreshNex Platform...
        </p>
      </div>
    );
  }

  // Warehouse-only sessions cannot access User or Admin routes
  if (!currentUser && warehouseSession) {
    return <Navigate to="/warehouse" replace />;
  }

  if (userProfile?.role === 'warehouse') {
    return <Navigate to="/warehouse" replace />;
  }

  // If user is not authenticated
  if (!currentUser) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

// Dedicated Warehouse Route Guard: strictly requires an active authenticated Warehouse RFID session.
// Arbitrary URL query parameters (?deviceId=...) are not accepted as proof of authentication.
const WarehouseRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { warehouseSession, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F4FBF7] flex flex-col items-center justify-center p-4">
        <div className="w-10 h-10 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-xs text-emerald-900/70 font-bold mt-4 tracking-wider uppercase">
          Verifying Warehouse Session...
        </p>
      </div>
    );
  }

  let activeSession = warehouseSession;
  if (!activeSession && typeof window !== 'undefined') {
    try {
      const raw =
        sessionStorage.getItem('freshnex_warehouse_session') ||
        localStorage.getItem('freshnex_warehouse_session');
      if (raw) {
        activeSession = JSON.parse(raw);
      }
    } catch {
      activeSession = null;
    }
  }

  const isValidWarehouseSession = Boolean(
    activeSession &&
      activeSession.token &&
      activeSession.warehouseId
  );

  if (!isValidWarehouseSession) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

// Admin Route Guard: strictly restricts access to administrators and blocks Warehouse or standard Users
const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser, userProfile, warehouseSession } = useAuth();

  if (!currentUser || userProfile?.role !== 'admin') {
    if (warehouseSession || userProfile?.role === 'warehouse') {
      return <Navigate to="/warehouse" replace />;
    }
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

const RoleDefaultRedirect: React.FC = () => {
  const { currentUser, userProfile, warehouseSession } = useAuth();
  if (!currentUser && warehouseSession) {
    return <Navigate to="/warehouse" replace />;
  }
  const isAdmin = userProfile?.role === 'admin';
  return <Navigate to={isAdmin ? '/devices' : '/dashboard'} replace />;
};

const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Public Entry (Login Page IS the primary entry/landing experience) */}
      <Route path="/" element={<LoginPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/about" element={<AboutPage />} />
      <Route path="/signup" element={<SignUpPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />

      {/* Independent Warehouse Route protected strictly by WarehouseSession */}
      <Route
        element={
          <WarehouseRoute>
            <AppLayout />
          </WarehouseRoute>
        }
      >
        <Route path="/warehouse" element={<WarehousePage />} />
      </Route>

      {/* Protected User & Admin Dashboard Routes */}
      <Route
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<RoleDefaultRedirect />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route
          path="/devices"
          element={
            <AdminRoute>
              <AdminDevices />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/devices"
          element={
            <AdminRoute>
              <Navigate to="/devices" replace />
            </AdminRoute>
          }
        />
        <Route
          path="/thresholds"
          element={
            <AdminRoute>
              <ThresholdsPage />
            </AdminRoute>
          }
        />
        <Route path="/scan" element={<ScanPage />} />
        <Route path="/live-data" element={<LiveDataPage />} />
        <Route path="/live-data/:itemId" element={<LiveDataPage />} />
        <Route path="/alerts" element={<AlertsPage />} />
        <Route path="/history" element={<HistoryPage />} />
        <Route path="/analytics" element={<AnalyticsPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Route>

      {/* Fallback to Login */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <AppProvider>
        <FreshnessProvider>
          <BrowserRouter>
            {/* Active on Login screen and across the application */}
            <WarehouseRFIDListener />
            <AppRoutes />
          </BrowserRouter>
        </FreshnessProvider>
      </AppProvider>
    </AuthProvider>
  );
}

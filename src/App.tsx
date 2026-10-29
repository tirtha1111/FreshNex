import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { FreshNexProvider } from './context/FreshNexContext';
import { FreshNexLayout } from './components/freshnex/FreshNexLayout';

import { DashboardView } from './pages/freshnex/DashboardView';
import { LiveMonitoringView } from './pages/freshnex/LiveMonitoringView';
import { DevicesView } from './pages/freshnex/DevicesView';
import { ParcelsView } from './pages/freshnex/ParcelsView';
import { ProductsView } from './pages/freshnex/ProductsView';
import { AnalyticsView } from './pages/freshnex/AnalyticsView';
import { ReportsView } from './pages/freshnex/ReportsView';
import { AlertsView } from './pages/freshnex/AlertsView';
import { UsersView } from './pages/freshnex/UsersView';
import { SettingsView } from './pages/freshnex/SettingsView';

export default function App() {
  return (
    <FreshNexProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<FreshNexLayout />}>
            <Route path="/" element={<DashboardView />} />
            <Route path="/dashboard" element={<DashboardView />} />
            <Route path="/live-monitoring" element={<LiveMonitoringView />} />
            <Route path="/devices" element={<DevicesView />} />
            <Route path="/parcels" element={<ParcelsView />} />
            <Route path="/products" element={<ProductsView />} />
            <Route path="/analytics" element={<AnalyticsView />} />
            <Route path="/reports" element={<ReportsView />} />
            <Route path="/alerts" element={<AlertsView />} />
            <Route path="/users" element={<UsersView />} />
            <Route path="/settings" element={<SettingsView />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </FreshNexProvider>
  );
}

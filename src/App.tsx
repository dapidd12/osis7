/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import PublicLayout from './components/PublicLayout';
import PapanAspirasi from './pages/PapanAspirasi';
import KirimAspirasi from './pages/KirimAspirasi';
import Mading from './pages/Mading';
import AdminLayout from './components/AdminLayout';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import AntiInspect from './components/AntiInspect';

export default function App() {
  return (
    <AppProvider>
      <AntiInspect />
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<PublicLayout />}>
            <Route index element={<KirimAspirasi />} />
            <Route path="papan" element={<PapanAspirasi />} />
            <Route path="mading" element={<Mading />} />
          </Route>

          {/* Admin Routes */}
          <Route path="/pengurus" element={<AdminLayout />}>
            <Route index element={<Navigate to="/pengurus/dashboard" replace />} />
            <Route path="login" element={<AdminLogin />} />
            <Route path="dashboard" element={<AdminDashboard />} />
          </Route>

          {/* Direct Admin Access via Domain */}
          <Route path="/admin" element={<Navigate to="/pengurus/login" replace />} />
          <Route path="/admin/login" element={<Navigate to="/pengurus/login" replace />} />
          <Route path="/login" element={<Navigate to="/pengurus/login" replace />} />
          <Route path="/portal-admin" element={<Navigate to="/pengurus/login" replace />} />
          
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AppProvider>
  );
}

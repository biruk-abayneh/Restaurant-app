// src/App.jsx — FINAL 100% WORKING VERSION (NO ERRORS)
import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/auth/Login';
import CreateFirstManager from './pages/CreateFirstManager';
import ManagerDashboard from './pages/manager/ManagerDashboard';
import MenuManager from './pages/manager/MenuManager';
import StaffManager from './pages/manager/StaffManager';
import ActiveOrder from './pages/server/ActiveOrder';
import KDS from './pages/kitchen/KDS';

function ProtectedRoute({ children, allowedRoles = ['manager', 'server'] }) {
  const { user, loading } = useAuth();

  if (loading) return <div className="text-center p-10 text-2xl">Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (!allowedRoles.includes(user.role)) return <Navigate to="/login" replace />;

  return children;
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/create-first-manager" element={<CreateFirstManager />} />

          {/* Manager Pages */}
          <Route path="/manager" element={
            <ProtectedRoute allowedRoles={['manager']}>
              <ManagerDashboard />
            </ProtectedRoute>
          } />
          <Route path="/manager/menu" element={
            <ProtectedRoute allowedRoles={['manager']}>
              <MenuManager />
            </ProtectedRoute>
          } />
          <Route path="/manager/staff" element={
            <ProtectedRoute allowedRoles={['manager']}>
              <StaffManager />
            </ProtectedRoute>
          } />

          {/* Server Pages */}
          <Route path="/active-order" element={
            <ProtectedRoute allowedRoles={['server', 'manager']}>
              <ActiveOrder />
            </ProtectedRoute>
          } />

          {/* Kitchen */}
          <Route path="/kds" element={<KDS />} />

          {/* Default */}
          <Route path="/" element={<Navigate to="/login" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
// src/App.jsx — FINAL WORKING VERSION WITH AUTO-LOGIN
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

// Protected Route Component
function ProtectedRoute({ children, allowedRoles = ['manager', 'server'] }) {
  const { user, loading } = useAuth();

  if (loading) return <div style={{ padding: '3rem', textAlign: 'center', fontSize: '2rem' }}> Loading...</div>;
  if (!user) return <Navigate to="/login" />;
  if (!allowedRoles.includes(user.role)) return <Navigate to="/login" />;

  return children;
}

// Main App with Auto-Login
function AppContent() {
  const { user, setUser } = useAuth();

  // AUTO-LOGIN FROM localStorage (THIS IS THE CODE YOU ASKED FOR)
  useEffect(() => {
    const saved = localStorage.getItem('pos-user');
    if (saved && !user) {
      setUser(JSON.parse(saved));
    }
  }, [user, setUser]);

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/create-first-manager" element={<CreateFirstManager />} />

      {/* Manager Routes */}
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

      {/* Server Routes */}
      <Route path="/active-order" element={
        <ProtectedRoute allowedRoles={['server', 'manager']}>
          <ActiveOrder />
        </ProtectedRoute>
      } />

      {/* Kitchen */}
      <Route path="/kds" element={<KDS />} />

      {/* Default */}
      <Route path="/" element={<Navigate to="/login" />} />
    </Routes>
  );
}

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
}
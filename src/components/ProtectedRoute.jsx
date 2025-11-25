// src/components/ProtectedRoute.jsx
import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Navigate, useLocation } from 'react-router-dom';

export function RequireAuth({ children, allowedRoles = [] }) {
  const { user } = useAuth();
  const location = useLocation();

  // Not logged in → redirect to login + remember where they were trying to go
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Logged in but wrong role → redirect to home
  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  // All good → show page
  return children;
}

export function RequireManager({ children }) {
  return <RequireAuth allowedRoles={['manager']}>{children}</RequireAuth>;
}

export function RequireServer({ children }) {
  return <RequireAuth allowedRoles={['server']}>{children}</RequireAuth>;
}
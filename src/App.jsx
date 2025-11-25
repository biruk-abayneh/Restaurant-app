// src/App.jsx
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import { AuthProvider } from './context/AuthContext';
import { MenuProvider } from './context/MenuContext';
import { OrderProvider } from './context/OrderContext';

import Login from './pages/auth/Login';
import ActiveOrder from './pages/server/ActiveOrder';
import ManagerDashboard from './pages/manager/ManagerDashboard';
import MenuManager from './pages/manager/MenuManager';
import StaffManager from './pages/manager/StaffManager';
import KDS from './pages/kitchen/KDS';

import { RequireManager, RequireServer } from './components/ProtectedRoute';

function App() {
  return (
    <AuthProvider>
      <MenuProvider>
        <OrderProvider>
          <BrowserRouter>
            <Routes>
              {/* Public */}
              <Route path="/" element={<Login />} />
              <Route path="/login" element={<Login />} />
              <Route path="/kds" element={<KDS />} />

              {/* Server */}
              <Route
                path="/active-order"
                element={
                  <RequireServer>
                    <ActiveOrder />
                  </RequireServer>
                }
              />

              {/* Manager */}
              <Route
                path="/manager"
                element={
                  <RequireManager>
                    <ManagerDashboard />
                  </RequireManager>
                }
              />

              <Route
                path="/manager/menu"
                element={
                  <RequireManager>
                    <MenuManager />
                  </RequireManager>
                }
              />

              <Route
                path="/manager/staff"
                element={
                  <RequireManager>
                    <StaffManager />
                  </RequireManager>
                }
              />

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
          </BrowserRouter>
        </OrderProvider>
      </MenuProvider>
    </AuthProvider>
  );
}

export default App;
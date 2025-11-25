// src/pages/manager/ManagerDashboard.jsx
import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';

export default function ManagerDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div style={{ padding: '2rem', background: '#f9fafb', minHeight: '100vh' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
          <h1 style={{ fontSize: '3rem', fontWeight: 'bold', color: '#1f2937' }}>
            Manager Dashboard
          </h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <span style={{ fontSize: '1.2rem', color: '#374151' }}>
              Welcome, <strong>{user?.name || 'Manager'}</strong>
            </span>
            <button onClick={handleLogout} style={{ padding: '0.75rem 1.5rem', background: '#ef4444', color: 'white', borderRadius: '12px' }}>
              Logout
            </button>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
          <Link to="/."
            style={{ textDecoration: 'none' }}
          >
            <div style={{
              background: 'white',
              padding: '3rem',
              borderRadius: '20px',
              boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
              textAlign: 'center',
              transition: 'transform 0.2s',
              cursor: 'pointer'
            }}
            onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-8px)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
            >
              <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>Menu</div>
              <h2 style={{ fontSize: '2rem', color: '#1f2937', fontWeight: 'bold' }}>Menu Management</h2>
              <p style={{ color: '#6b7280', marginTop: '1rem' }}>Add, edit, delete items & categories</p>
            </div>
          </Link>

          <Link to="/manager/staff"
            style={{ textDecoration: 'none' }}
          >
            <div style={{
              background: 'white',
              padding: '3rem',
              borderRadius: '20px',
              boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
              textAlign: 'center',
              transition: 'transform 0.2s',
              cursor: 'pointer'
            }}
            onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-8px)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
            >
              <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>People</div>
              <h2 style={{ fontSize: '2rem', color: '#1f2937', fontWeight: 'bold' }}>Staff Management</h2>
              <p style={{ color: '#6b7280', marginTop: '1rem' }}>Create and manage server accounts</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
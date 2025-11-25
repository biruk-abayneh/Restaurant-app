// src/pages/auth/Login.jsx
import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    const result = login(username, password);

    if (result.success) {
      const from = location.state?.from?.pathname;
      const defaultPath = username === 'admin' ? '/manager/menu' : '/active-order';
      navigate(from || defaultPath, { replace: true });
    } else {
      setError('Invalid username or password');
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1rem'
    }}>
      <div style={{
        background: 'white',
        padding: '3rem',
        borderRadius: '16px',
        boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
        width: '100%',
        maxWidth: '420px'
      }}>
        <h1 style={{
          fontSize: '2.8rem',
          fontWeight: 'bold',
          textAlign: 'center',
          marginBottom: '2rem',
          color: '#1f2937'
        }}>
          Restaurant POS
        </h1>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="admin / server1 / server2"
              required
              style={{
                width: '100%',
                padding: '0.875rem',
                borderRadius: '12px',
                border: '2px solid #e5e7eb',
                fontSize: '1rem'
              }}
            />
          </div>

          <div style={{ marginBottom: '2rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="admin → admin | server → 123"
              required
              style={{
                width: '100%',
                padding: '0.875rem',
                borderRadius: '12px',
                border: '2px solid #e5e7eb',
                fontSize: '1rem'
              }}
            />
          </div>

          {error && (
            <div style={{
              background: '#fee2e2',
              color: '#991b1b',
              padding: '1rem',
              borderRadius: '12px',
              textAlign: 'center',
              marginBottom: '1.5rem'
            }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            style={{
              width: '100%',
              padding: '1rem',
              background: '#10b981',
              color: 'white',
              fontSize: '1.3rem',
              fontWeight: 'bold',
              border: 'none',
              borderRadius: '12px',
              cursor: 'pointer'
            }}
          >
            Login
          </button>
        </form>

        <div style={{ marginTop: '2rem', fontSize: '0.9rem', color: '#6b7280', textAlign: 'center' }}>
          <p><strong>Demo Logins:</strong></p>
          <p>Manager: admin / admin</p>
          <p>Server: server1 or server2 / 123</p>
        </div>
      </div>
    </div>
  );
}
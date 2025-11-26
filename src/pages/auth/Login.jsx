// src/pages/Login.jsx
import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const result = await login(username, password);
    if (result.success) {
      navigate('/manager'); // or '/active-order' based on role
    } else {
      setError(result.error || 'Invalid credentials');
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #1e293b, #0f172a)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem'
    }}>
      <div style={{
        background: 'white',
        padding: '3rem',
        borderRadius: '24px',
        boxShadow: '0 25px 50px rgba(0,0,0,0.3)',
        width: '100%',
        maxWidth: '420px'
      }}>
        <h1 style={{
          textAlign: 'center',
          fontSize: '3rem',
          marginBottom: '2rem',
          color: '#1e293b',
          fontWeight: '900'
        }}>
          Restaurant POS
        </h1>

        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '1.5rem' }}>
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            style={{
              padding: '1.2rem',
              fontSize: '1.2rem',
              borderRadius: '12px',
              border: '2px solid #e2e8f0',
              outline: 'none'
            }}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{
              padding: '1.2rem',
              fontSize: '1.2rem',
              borderRadius: '12px',
              border: '2px solid #e2e8f0',
              outline: 'none'
            }}
          />

          {error && (
            <p style={{ color: '#dc2626', textAlign: 'center', fontWeight: 'bold' }}>
              {error}
            </p>
          )}

          <button
            type="submit"
            style={{
              padding: '1.5rem',
              background: '#10b981',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              fontSize: '1.5rem',
              fontWeight: 'bold',
              cursor: 'pointer'
            }}
          >
            LOGIN
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '2rem', color: '#64748b' }}>
          First time? Create manager at /create-first-manager
        </p>
      </div>
    </div>
  );
}
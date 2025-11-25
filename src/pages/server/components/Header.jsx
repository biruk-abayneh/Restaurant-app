// src/pages/server/components/Header.jsx
import React from 'react';
import { useAuth } from '../../../context/AuthContext';  // Fixed import

export default function Header() {
  const { user } = useAuth();  // Now works!

  return (
    <>
      <h1 style={{ fontSize: '2rem', fontWeight: 'bold', margin: '1.5rem 0' }}>
        New Order
      </h1>
      <p style={{ marginBottom: '1.5rem' }}>
        Welcome, <strong>{user?.name || 'Server'}</strong>!
      </p>
    </>
  );
}
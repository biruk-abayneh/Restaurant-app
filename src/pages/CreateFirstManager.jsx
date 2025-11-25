// src/pages/CreateFirstManager.jsx
import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';

export default function CreateFirstManager() {
  const [done, setDone] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if any staff exists
    supabase.from('staff').select('id', { count: 'exact', head: true }).then(({ count }) => {
      if (count && count > 0) setDone(true);
    });
  }, []);

  const create = async (e) => {
    e.preventDefault();
    const form = e.target;
    await supabase.from('staff').insert({
      name: form.name.value,
      username: form.username.value,
      password: form.password.value,
      role: 'manager'
    });
    alert('First manager created! Now login with those credentials.');
    navigate('/login');
  };

  if (done) {
    return (
      <div style={{ padding: '3rem', textAlign: 'center', fontSize: '2rem' }}>
        First manager already created!<br/>
        <a href="/login">Go to Login</a>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '500px', margin: '5rem auto', padding: '3rem', background: 'white', borderRadius: '20px', boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }}>
      <h1 style={{ fontSize: '2.5rem', textAlign: 'center', marginBottom: '2rem' }}>
        Create First Manager
      </h1>
      <form onSubmit={create} style={{ display: 'grid', gap: '1rem' }}>
        <input name="name" placeholder="Your Name" required style={{ padding: '1rem', fontSize: '1.2rem', borderRadius: '12px', border: '2px solid #ddd' }} />
        <input name="username" placeholder="Username (e.g. admin)" defaultValue="admin" required style={{ padding: '1rem', fontSize: '1.2rem', borderRadius: '12px', border: '2px solid #ddd' }} />
        <input name="password" type="password" placeholder="Password" defaultValue="123456" required style={{ padding: '1rem', fontSize: '1.2rem', borderRadius: '12px', border: '2px solid #ddd' }} />
        <button type="submit" style={{ padding: '1.5rem', background: '#10b981', color: 'white', border: 'none', borderRadius: '12px', fontSize: '1.5rem', fontWeight: 'bold' }}>
          Create Manager Account
        </button>
      </form>
      <p style={{ marginTop: '2rem', textAlign: 'center', color: '#666' }}>
        After creating, go to /login
      </p>
    </div>
  );
}
// src/context/AuthContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Auto-login from localStorage (works offline after first login)
  useEffect(() => {
    const saved = localStorage.getItem('pos-user');
    if (saved) {
      setUser(JSON.parse(saved));
    }
    setLoading(false);
  }, []);

  const login = async (username, password) => {
    setLoading(true);

    const { data, error } = await supabase
      .from('staff')
      .select('id, name, username, role, password')
      .eq('username', username)
      .single();

      console.log("Supabase returned:", data, error);

    if (error || !data) {
      setLoading(false);
      return { success: false, error: 'User not found' };
    }

    if (data.password !== password) {
      setLoading(false);
      return { success: false, error: 'Wrong password' };
    }

    const userData = {
      id: data.id,
      name: data.name,
      username: data.username,
      role: data.role || 'server'
    };

    console.log("Logging in with userData:", userData);

    localStorage.setItem('pos-user', JSON.stringify(userData));
    setUser(userData);
    setLoading(false);
    return { success: true };
  };

  const logout = () => {
    localStorage.removeItem('pos-user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
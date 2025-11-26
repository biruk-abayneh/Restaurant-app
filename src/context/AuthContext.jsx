// src/context/AuthContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  const login = async (username, password) => {
  try {
    const { data, error } = await supabase
      .from('staff')
      .select('id, name, username, role')
      .eq('username', username)
      .single();

    if (error || !data) {
      return { success: false, error: 'User not found' };
    }

    if (data.password !== password) {
      return { success: false, error: 'Wrong password' };
    }

    // SUCCESS — store in localStorage + context (no Supabase Auth needed)
    const userData = {
      id: data.id,
      name: data.name,
      username: data.username,
      role: data.role
    };

    localStorage.setItem('pos-user', JSON.stringify(userData));
    setUser(userData);

    return { success: true };
  } catch (err) {
    console.error("Login error:", err);
    return { success: false, error: 'Login failed' };
  }
};

const logout = () => {
  localStorage.removeItem('pos-user');
  setUser(null);
};
  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
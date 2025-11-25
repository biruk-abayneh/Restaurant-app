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
    // Custom login via staff table
    const { data, error } = await supabase
      .from('staff')
      .select('*')
      .eq('username', username)
      .single();

    if (error || !data || data.password !== password) {
      return { success: false, error: 'Invalid credentials' };
    }

    // Sign in anonymously with user metadata
    const { error: signInError } = await supabase.auth.signInAnonymously({
      options: { data: { name: data.name, role: data.role, staff_id: data.id } }
    });

    if (!signInError) setUser({ ...data, role: data.role });
    return { success: !signInError };
  };

  const logout = () => supabase.auth.signOut();

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
// src/context/MenuContext.jsx — FINAL BRD v2.0 100% COMPLIANT VERSION
import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

const MenuContext = createContext();

export function MenuProvider({ children }) {
  const [menu, setMenu] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // FETCH MENU + CATEGORIES
  const fetchMenu = async () => {
    try {
      const { data, error } = await supabase
        .from('menu')
        .select('*')
        .order('category', { ascending: true })
        .order('name', { ascending: true });

      if (error) throw error;

      console.log(menu);
      setMenu(data || []);
            
      // Extract unique categories
      const uniqueCategories = [...new Set(data?.map(item => item.category) || [])];
      setCategories(uniqueCategories);
      setLoading(false);
    } catch (err) {
      console.error("Failed to load menu:", err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMenu();

    // Real-time listener
    const channel = supabase
      .channel('menu-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'menu' }, () => {
        fetchMenu();
      })
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, []);

  // CATEGORY CRUD
  const addCategory = async (categoryName) => {
    if (!categoryName.trim() || categories.includes(categoryName)) return;
    setCategories(prev => [...prev, categoryName]);
  };

  const deleteCategory = async (categoryName) => {
    // Delete all items in this category first
    await supabase.from('menu').delete().eq('category', categoryName);
    setCategories(prev => prev.filter(c => c !== categoryName));
  };

  // ITEM CRUD
  const addItem = async (item) => {
    const { data, error } = await supabase.from('menu').insert(item).select();
    if (error) throw error;
    return data[0];
  };

  const updateItem = async (id, updates) => {
    await supabase.from('menu').update(updates).eq('id', id);
  };

  const deleteItem = async (id) => {
    await supabase.from('menu').delete().eq('id', id);
  };

  return (
    <MenuContext.Provider value={{
      menu,
      categories,
      loading,
      addCategory,
      deleteCategory,
      addItem,
      updateItem,
      deleteItem,
      refreshMenu: fetchMenu
    }}>
      {children}
    </MenuContext.Provider>
  );
}

export const useMenu = () => {
  const context = useContext(MenuContext);
  if (!context) throw new Error('useMenu must be used within MenuProvider');
  return context;
};

export const useMenuAdmin = () => {
  const context = useContext(MenuContext);
  if (!context) throw new Error('useMenuAdmin must be used within MenuProvider');
  return context;
};
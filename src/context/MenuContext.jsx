// src/context/MenuContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

const MenuContext = createContext();

const defaultMenu = { categories: [] };

export function MenuProvider({ children }) {
  const [menu, setMenu] = useState(defaultMenu);

  // Fetch menu + real-time sync
  useEffect(() => {
    fetchMenu();

    const channel = supabase
      .channel('menu-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'menu' }, () => fetchMenu())
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, []);

  const fetchMenu = async () => {
    const { data, error } = await supabase
      .from('menu')
      .select('data')
      .eq('id', 1)
      .single();

    if (error && error.code === 'PGRST116') {
      // First time — create default row
      await supabase.from('menu').insert({ id: 1, data: defaultMenu });
      setMenu(defaultMenu);
    } else {
      setMenu(data?.data || defaultMenu);
    }
  };

  const saveMenu = async (newMenu) => {
    await supabase.from('menu').upsert({ id: 1, data: newMenu });
    setMenu(newMenu); // Optimistic update
  };

  // ——— ALL YOUR EXISTING FUNCTIONS ———
  const addCategory = (name) => {
    const newCat = { id: Date.now().toString(), name, items: [] };
    saveMenu({ ...menu, categories: [...menu.categories, newCat] });
  };

  const deleteCategory = (categoryId) => {
    saveMenu({
      ...menu,
      categories: menu.categories.filter(cat => cat.id !== categoryId)
    });
  };

  const addItem = (categoryId, itemData) => {
    const newItem = { ...itemData, id: Date.now().toString(), enabled: true };
    saveMenu({
      ...menu,
      categories: menu.categories.map(cat =>
        cat.id === categoryId
          ? { ...cat, items: [...cat.items, newItem] }
          : cat
      )
    });
  };

  const updateItem = (categoryId, itemId, updates) => {
    saveMenu({
      ...menu,
      categories: menu.categories.map(cat =>
        cat.id === categoryId
          ? {
              ...cat,
              items: cat.items.map(item =>
                item.id === itemId ? { ...item, ...updates } : item
              )
            }
          : cat
      )
    });
  };

  const deleteItem = (categoryId, itemId) => {
    saveMenu({
      ...menu,
      categories: menu.categories.map(cat =>
        cat.id === categoryId
          ? { ...cat, items: cat.items.filter(item => item.id !== itemId) }
          : cat
      )
    });
  };

  const toggleItem = (categoryId, itemId) => {
    saveMenu({
      ...menu,
      categories: menu.categories.map(cat =>
        cat.id === categoryId
          ? {
              ...cat,
              items: cat.items.map(item =>
                item.id === itemId ? { ...item, enabled: !item.enabled } : item
              )
            }
          : cat
      )
    });
  };

  const value = {
    menu,
    addCategory,
    deleteCategory,
    addItem,
    updateItem,
    deleteItem,
    toggleItem,
    saveMenu,
  };

  return (
    <MenuContext.Provider value={value}>
      {children}
    </MenuContext.Provider>
  );
}

export const useMenu = () => {
  const context = useContext(MenuContext);
  if (!context) throw new Error('useMenu must be used within MenuProvider');
  return { menu: context.menu };
};

export const useMenuAdmin = () => {
  const context = useContext(MenuContext);
  if (!context) throw new Error('useMenuAdmin must be used within MenuProvider');
  return context;
};
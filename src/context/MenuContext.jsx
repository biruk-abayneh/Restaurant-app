// src/context/MenuContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

const MenuContext = createContext();

const defaultMenu = {
  categories: [
    {
      id: 'default-1',
      name: 'Drinks',
      items: [
        { id: 'coca-cola', name: 'Coca Cola', price: 25, enabled: true },
        { id: 'coffee', name: 'Coffee', price: 30, enabled: true }
      ]
    }
  ]
};

export function MenuProvider({ children }) {
  const [menu, setMenu] = useState(defaultMenu);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMenu();

    // Real-time sync
    const channel = supabase
      .channel('menu-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'menu' }, () => fetchMenu())
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, []);

  const fetchMenu = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('menu')
        .select('data')
        .eq('id', 1)
        .single();

      if (error && error.code === 'PGRST116') {
        // First time — create default
        await supabase.from('menu').insert({ id: 1, data: defaultMenu });
        setMenu(defaultMenu);
      } else if (data) {
        setMenu(data.data || defaultMenu);
      } else {
        setMenu(defaultMenu);
      }
      setLoading(false);
    } catch (err) {
      console.error("Menu fetch error:", err);
      setMenu(defaultMenu);
      setLoading(false);
    }
  };

  const saveMenu = async (newMenuData) => {
    try {
      const { error } = await supabase
        .from('menu')
        .upsert({ id: 1, data: newMenuData });

      if (!error) {
        setMenu(newMenuData); // Optimistic update
      } else {
        console.error("Save menu error:", error);
      }
    } catch (err) {
      console.error("Menu save failed:", err);
    }
  };

  // ——— ALL CRUD FUNCTIONS ———
  const addCategory = (name) => {
    const newCategory = { 
      id: Date.now().toString(), 
      name: name.trim(), 
      items: [] 
    };
    const updated = {
      ...menu,
      categories: [...menu.categories, newCategory]
    };
    saveMenu(updated);
  };

  const deleteCategory = (categoryId) => {
    const updated = {
      ...menu,
      categories: menu.categories.filter(cat => cat.id !== categoryId)
    };
    saveMenu(updated);
  };

  const addItem = (categoryId, itemData) => {
    const newItem = {
      ...itemData,
      id: Date.now().toString(),
      enabled: true
    };
    const updated = {
      ...menu,
      categories: menu.categories.map(cat =>
        cat.id === categoryId
          ? { ...cat, items: [...cat.items, newItem] }
          : cat
      )
    };
    saveMenu(updated);
  };

  const updateItem = (categoryId, itemId, updates) => {
    const updated = {
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
    };
    saveMenu(updated);
  };

  const deleteItem = (categoryId, itemId) => {
    const updated = {
      ...menu,
      categories: menu.categories.map(cat =>
        cat.id === categoryId
          ? { ...cat, items: cat.items.filter(item => item.id !== itemId) }
          : cat
      )
    };
    saveMenu(updated);
  };

  const toggleItem = (categoryId, itemId) => {
    const updated = {
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
    };
    saveMenu(updated);
  };

  return (
    <MenuContext.Provider value={{
      menu,
      loading,
      addCategory,
      deleteCategory,
      addItem,
      updateItem,
      deleteItem,
      toggleItem,
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

export const useMenuAdmin = useMenu; // Same for manager
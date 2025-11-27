// src/context/MenuContext.jsx — FINAL VERSION FOR YOUR JSON DATABASE
import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

const MenuContext = createContext();

export function MenuProvider({ children }) {
  const [menu, setMenu] = useState([]);           // flat list of items
  const [categories, setCategories] = useState([]); // list of category names
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMenu();

    const channel = supabase
      .channel('menu-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'menu' }, () => {
        fetchMenu();
      })
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, []);

  const fetchMenu = async () => {
    try {
      const { data, error } = await supabase
        .from('menu')
        .select('data')
        .single();  // only one row

      if (error || !data) {
        console.error("No menu data found:", error);
        setMenu([]);
        setCategories([]);
        setLoading(false);
        return;
      }

      const categoriesArray = data.data.categories || [];

      // Flatten items for easy use
      const flatItems = [];
      const catNames = [];

      categoriesArray.forEach(cat => {
        catNames.push(cat.name);
        cat.items.forEach(item => {
          flatItems.push({
            id: item.id,
            name: item.name,
            price: item.price || 0,
            category: cat.name,
            image: item.image || ''
          });
        });
      });

      setMenu(flatItems);
      setCategories(catNames);
      setLoading(false);
    } catch (err) {
      console.error("Failed to load menu:", err);
      setMenu([]);
      setCategories([]);
      setLoading(false);
    }
  };

  return (
    <MenuContext.Provider value={{
      menu,
      categories,
      loading,
      refresh: fetchMenu
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

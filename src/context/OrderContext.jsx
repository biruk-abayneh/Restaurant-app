// src/context/OrderContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

const OrderContext = createContext();

export function OrderProvider({ children }) {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    fetchOrders();

    const channel = supabase
      .channel('orders-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, payload => {
        if (payload.eventType === 'INSERT') setOrders(prev => [...prev, payload.new]);
        if (payload.eventType === 'UPDATE') setOrders(prev => prev.map(o => o.id === payload.new.id ? payload.new : o));
        if (payload.eventType === 'DELETE') setOrders(prev => prev.filter(o => o.id !== payload.old.id));
      })
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, []);

  const fetchOrders = async () => {
    const { data } = await supabase.from('orders').select('*').order('created_at', { ascending: false });
    setOrders(data || []);
  };

  const addOrder = async (order) => {
    await supabase.from('orders').insert([{ ...order, created_at: new Date().toISOString() }]);
  };

  const updateOrder = async (id, updates) => {
    await supabase.from('orders').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', id);
  };

  return (
    <OrderContext.Provider value={{ orders, addOrder, updateOrder }}>
      {children}
    </OrderContext.Provider>
  );
}

export const useOrder = () => useContext(OrderContext);
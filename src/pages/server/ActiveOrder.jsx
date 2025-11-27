// src/pages/server/ActiveOrder.jsx — FULLY RESTORED + SUPABASE + OFFLINE
import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';

export default function ActiveOrder() {
  const { user } = useAuth();
  const [tables, setTables] = useState(Array(8).fill().map((_, i) => ({ id: i + 1, status: 'vacant', order: null })));
  const [selectedTable, setSelectedTable] = useState(null);
  const [menu, setMenu] = useState([]);
  const [currentOrder, setCurrentOrder] = useState([]);
  const [note, setNote] = useState('');

  // Load menu from Supabase (or localStorage if offline)
  useEffect(() => {
    const loadMenu = async () => {
      try {
        const { data } = await supabase.from('menu').select('*').order('category');
        if (data) setMenu(data);
      } catch (err) {
        const saved = localStorage.getItem('pos-menu');
        if (saved) setMenu(JSON.parse(saved));
      }
    };
    loadMenu();
  }, []);

  const addItem = (item) => {
    setCurrentOrder(prev => {
      const existing = prev.find(i => i.id === item.id);
      if (existing) {
        return prev.map(i => i.id === item.id ? { ...i, qty: i.qty + 1 } : i);
      }
      return [...prev, { ...item, qty: 1 }];
    });
  };

  const removeItem = (id) => {
    setCurrentOrder(prev => prev.filter(i => i.id !== id));
  };

  const sendOrder = async () => {
    if (currentOrder.length === 0) return;

    const order = {
      table_number: selectedTable,
      items: currentOrder,
      note,
      status: 'new',
      server_name: user?.name || 'Server',
      created_at: new Date().toISOString()
    };

    try {
      await supabase.from('orders').insert(order);
    } catch (err) {
      // Offline fallback
      const offlineOrders = JSON.parse(localStorage.getItem('offline-orders') || '[]');
      offlineOrders.push(order);
      localStorage.setItem('offline-orders', JSON.stringify(offlineOrders));
    }

    setTables(prev => prev.map(t => t.id === selectedTable ? { ...t, status: 'occupied' } : t));
    setCurrentOrder([]);
    setNote('');
    setSelectedTable(null);
    alert('Order sent to kitchen!');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <h1 className="text-5xl font-bold text-center my-8 text-indigo-800">Active Order</h1>

      {/* Table Grid */}
      <div className="grid grid-cols-4 gap-6 max-w-5xl mx-auto mb-12">
        {tables.map(table => (
          <button
            key={table.id}
            onClick={() => setSelectedTable(table.id)}
            className={`p-12 rounded-3xl text-4xl font-bold transition-all transform hover:scale-105 shadow-2xl ${
              table.status === 'vacant'
                ? 'bg-green-500 text-white hover:bg-green-600'
                : 'bg-red-500 text-white hover:bg-red-600'
            }`}
          >
            Table {table.id}
            <div className="text-lg mt-2">{table.status.toUpperCase()}</div>
          </button>
        ))}
      </div>

      {/* Order Interface */}
      {selectedTable && (
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Menu */}
          <div className="lg:col-span-2 bg-white rounded-3xl shadow-2xl p-8">
            <h2 className="text-4xl font-bold mb-6">Menu - Table {selectedTable}</h2>
            <div className="space-y-6 max-h-96 overflow-y-auto">
              {menu.map(item => (
                <div key={item.id} className="flex justify-between items-center p-6 bg-gray-50 rounded-2xl hover:bg-gray-100 transition">
                  <div>
                    <div className="text-2xl font-bold">{item.name}</div>
                    <div className="text-gray-600">{item.category}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-green-600">ETB {item.price}</div>
                    <button
                      onClick={() => addItem(item)}
                      className="mt-2 bg-indigo-600 text-white px-8 py-3 rounded-xl text-xl hover:bg-indigo-700"
                    >
                      Add
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Current Order */}
          <div className="bg-white rounded-3xl shadow-2xl p-8">
            <h2 className="text-4xl font-bold mb-6">Current Order</h2>
            <textarea
              placeholder="Special note..."
              value={note}
              onChange={e => setNote(e.target.value)}
              className="w-full p-4 border rounded-xl mb-4 text-xl"
              rows="3"
            />
            <div className="space-y-4 max-h-80 overflow-y-auto">
              {currentOrder.map(item => (
                <div key={item.id} className="flex justify-between items-center p-4 bg-indigo-50 rounded-xl">
                  <div>
                    <div className="text-xl font-bold">{item.name}</div>
                    <div className="text-gray-600">x{item.qty}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold">ETB {item.price * item.qty}</div>
                    <button onClick={() => removeItem(item.id)} className="text-red-600 text-xl">Remove</button>
                  </div>
                </div>
              ))}
            </div>
            <button
              onClick={sendOrder}
              className="w-full mt-8 bg-green-600 text-white py-6 text-3xl font-bold rounded-2xl hover:bg-green-700 shadow-xl"
            >
              SEND TO KITCHEN
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
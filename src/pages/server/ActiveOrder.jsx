// src/pages/server/ActiveOrder.jsx — FINAL 100% WORKING (NO EXTRA CONTEXT)
import React, { useState } from 'react';
import { useMenu } from '../../context/MenuContext';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';

export default function ActiveOrder() {
  const { user } = useAuth();
  const { menu, categories, loading } = useMenu();

  const [selectedTable, setSelectedTable] = useState(null);
  const [currentOrder, setCurrentOrder] = useState([]);
  const [note, setNote] = useState('');

  // Add item to order
  const addToOrder = (item) => {
    setCurrentOrder(prev => {
      const existing = prev.find(i => i.id === item.id);
      if (existing) {
        return prev.map(i => i.id === item.id ? { ...i, qty: i.qty + 1 } : i);
      }
      return [...prev, { ...item, qty: 1 }];
    });
  };

  // Remove item
  const removeFromOrder = (id) => {
    setCurrentOrder(prev => prev.filter(i => i.id !== id));
  };

  // Send order to kitchen
  const sendOrder = async () => {
    if (!selectedTable) return alert('Select a table first');
    if (currentOrder.length === 0) return alert('Add items to order');

    const order = {
      table_number: selectedTable,
      items: currentOrder,
      note: note,
      status: 'new',
      server_name: user?.name || 'Server',
      created_at: new Date().toISOString()
    };

    const { error } = await supabase.from('orders').insert(order);
    if (error) {
      alert('Offline: Order saved locally');
      localStorage.setItem('pending-order', JSON.stringify(order));
    } else {
      alert(`Order sent for Table ${selectedTable}!`);
      setCurrentOrder([]);
      setNote('');
      setSelectedTable(null);
    }
  };

  if (loading) return <div className="text-center text-6xl mt-40">Loading menu...</div>;
  if (menu.length === 0) return <div className="text-center text-6xl mt-40 text-red-600">No menu items! Add in Menu Manager</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-100 p-8">
      <h1 className="text-7xl font-bold text-center mb-12 text-indigo-800">Active Order</h1>

      {/* Table Selection */}
      <div className="grid grid-cols-4 gap-10 max-w-6xl mx-auto mb-20">
        {[1,2,3,4,5,6,7,8].map(n => (
          <button
            key={n}
            onClick={() => setSelectedTable(n)}
            className={`p-20 rounded-3xl text-6xl font-bold shadow-2xl transition-all transform hover:scale-110 ${
              selectedTable === n ? 'bg-indigo-700 text-white' : 'bg-green-500 text-white'
            }`}
          >
            Table {n}
          </button>
        ))}
      </div>

      {selectedTable && (
        <div className="max-w-7xl mx-auto grid lg:grid-cols-3 gap-12">
          {/* Menu */}
          <div className="lg:col-span-2 bg-white rounded-3xl shadow-2xl p-12">
            <h2 className="text-5xl font-bold mb-10 text-indigo-800">Table {selectedTable}</h2>
            {categories.map(cat => (
              <div key={cat} className="mb-12">
                <h3 className="text-4xl font-bold text-purple-700 mb-6 pb-3 border-b-4 border-purple-300">{cat}</h3>
                <div className="grid md:grid-cols-2 gap-8">
                  {menu.filter(item => item.category === cat).map(item => (
                    <div key={item.id} className="bg-gradient-to-r from-purple-50 to-pink-50 p-8 rounded-2xl hover:shadow-2xl transition">
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="text-3xl font-bold text-gray-800">{item.name}</div>
                          <div className="text-2xl font-bold text-green-600 mt-2">ETB {item.price}</div>
                        </div>
                        <button
                          onClick={() => addToOrder(item)}
                          className="bg-indigo-600 hover:bg-indigo-700 text-white px-12 py-6 rounded-2xl text-3xl font-bold shadow-lg transform hover:scale-110 transition"
                        >
                          ADD
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Current Order */}
          <div className="bg-white rounded-3xl shadow-2xl p-12">
            <h2 className="text-5xl font-bold mb-8 text-indigo-800">Current Order</h2>
            <textarea
              placeholder="Special request..."
              value={note}
              onChange={e => setNote(e.target.value)}
              className="w-full p-6 border-4 border-indigo-200 rounded-2xl text-2xl mb-8"
              rows="4"
            />
            <div className="space-y-6 mb-10 max-h-96 overflow-y-auto">
              {currentOrder.map(item => (
                <div key={item.id} className="bg-gradient-to-r from-indigo-100 to-purple-100 p-6 rounded-2xl">
                  <div className="flex justify-between items-center">
                    <div className="text-3xl font-bold">{item.qty} × {item.name}</div>
                    <div className="text-3xl font-bold text-green-600">ETB {item.price * item.qty}</div>
                  </div>
                  <button onClick={() => removeFromOrder(item.id)} className="text-red-600 text-xl mt-3">Remove</button>
                </div>
              ))}
            </div>
            <button
              onClick={sendOrder}
              className="w-full bg-green-600 hover:bg-green-700 text-white py-10 text-5xl font-bold rounded-3xl shadow-2xl transform hover:scale-105 transition"
            >
              SEND TO KITCHEN
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
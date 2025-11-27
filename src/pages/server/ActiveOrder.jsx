// src/pages/server/ActiveOrder.jsx — FINAL 100% BRD v2.0 COMPLIANT
import React, { useState } from 'react';
import { useMenu } from '../../context/MenuContext';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';

export default function ActiveOrder() {
  const { user } = useAuth();
  const menuData = useMenu();

  // SAFELY extract menu (supports both flat & JSON structures)
  const menuObj = menuData.menu?.categories ? menuData.menu : menuData;
  const categories = menuObj.categories || [];
  const loading = menuData.loading || false;

  const [selectedTable, setSelectedTable] = useState(null);
  const [currentOrder, setCurrentOrder] = useState([]);
  const [note, setNote] = useState('');

  const addToOrder = (item) => {
    setCurrentOrder(prev => {
      const exists = prev.find(i => i.id === item.id);
      if (exists) {
        return prev.map(i => i.id === item.id ? { ...i, qty: i.qty + 1 } : i);
      }
      return [...prev, { ...item, qty: 1 }];
    });
  };

  const decreaseQty = (id) => {
    setCurrentOrder(prev => {
      const item = prev.find(i => i.id === id);
      if (!item || item.qty <= 1) {
        return prev.filter(i => i.id !== id);
      }
      return prev.map(i => i.id === id ? { ...i, qty: i.qty - 1 } : i);
    });
  };

  const removeItem = (id) => {
    setCurrentOrder(prev => prev.filter(i => i.id !== id));
  };

  const sendOrder = async () => {
    if (!selectedTable) return alert('Please select a table');
    if (currentOrder.length === 0) return alert('Please add at least one item');

    const orderPayload = {
      table_number: selectedTable,
      items: currentOrder,
      order_note: note.trim() || null,        // CORRECT COLUMN NAME
      status: 'new',
      server_name: user?.name || 'Server',
      created_at: new Date().toISOString()
    };

    const { error } = await supabase
      .from('orders')
      .insert(orderPayload);

    if (error) {
      console.error("Order insert failed:", error);
      alert('Offline: Order saved locally');
      localStorage.setItem(`pending-order-${Date.now()}`, JSON.stringify(orderPayload));
    } else {
      alert(`Order sent to kitchen for Table ${selectedTable}!`);
      setCurrentOrder([]);
      setNote('');
      setSelectedTable(null);
    }
  };

  if (loading) {
    return <div className="text-center text-6xl mt-40 text-indigo-600 font-bold">Loading menu...</div>;
  }

  if (categories.length === 0) {
    return (
      <div className="text-center text-6xl mt-40 text-red-600 font-bold">
        No menu items!<br />
        <span className="text-4xl">Add items in Menu Manager</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-100 p-8">
      <h1 className="text-7xl font-bold text-center mb-12 text-indigo-800">Active Order</h1>

      {/* Table Grid */}
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
              <div key={cat.id || cat.name} className="mb-12">
                <h3 className="text-4xl font-bold text-purple-700 mb-6 pb-3 border-b-4 border-purple-300">
                  {cat.name}
                </h3>
                <div className="grid md:grid-cols-2 gap-8">
                  {(cat.items || []).filter(item => item.enabled !== false).map(item => (
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
              placeholder="Special request (e.g. no onion, extra spicy)"
              value={note}
              onChange={e => setNote(e.target.value)}
              className="w-full p-6 border-4 border-indigo-200 rounded-2xl text-2xl mb-8 resize-none"
              rows="4"
            />
            <div className="space-y-6 mb-10 max-h-96 overflow-y-auto">
              {currentOrder.map(item => (
                <div key={item.id} className="bg-gradient-to-r from-indigo-100 to-purple-100 p-6 rounded-2xl flex justify-between items-center">
                  <div className="flex items-center gap-4">
                    <button onClick={() => decreaseQty(item.id)} className="text-5xl font-bold text-red-600">−</button>
                    <span className="text-4xl font-bold">{item.qty}</span>
                    <button onClick={() => addToOrder(item)} className="text-5xl font-bold text-green-600">+</button>
                    <span className="text-2xl ml-4 font-medium">{item.name}</span>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-green-600">ETB {item.price * item.qty}</div>
                    <button onClick={() => removeItem(item.id)} className="text-red-600 text-lg mt-2 underline">Remove</button>
                  </div>
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
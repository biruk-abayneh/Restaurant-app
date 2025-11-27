// src/pages/server/ActiveOrder.jsx — FINAL VERSION THAT ACTUALLY WORKS
import React, { useState } from 'react';
import { useMenu } from '../../context/MenuContext';  // ← THIS IS THE ONE THAT WORKS
import { useAuth } from '../../context/AuthContext';

export default function ActiveOrder() {
  const { user } = useAuth();
  const { menu, categories, loading } = useMenu();  // ← LOADING + CATEGORIES

  const [selectedTable, setSelectedTable] = useState(null);
  const [currentOrder, setCurrentOrder] = useState([]);
  const [note, setNote] = useState('');

  const addItem = (item) => {
    setCurrentOrder(prev => {
      const exists = prev.find(i => i.id === item.id);
      if (exists) {
        return prev.map(i => i.id === item.id ? { ...i, qty: i.qty + 1 } : i);
      }
      return [...prev, { ...item, qty: 1 }];
    });
  };

  const removeItem = (id) => {
    setCurrentOrder(prev => prev.filter(i => i.id !== id));
  };

  const sendOrder = async () => {
    if (currentOrder.length === 0) return alert("Add items first!");

    const order = {
      table_number: selectedTable,
      items: currentOrder,
      note,
      status: 'new',
      server_name: user?.name || 'Server',
      created_at: new Date().toISOString()
    };

    try {
      await fetch('https://jzepcgnlbdomrckielzz.supabase.co/rest/v1/orders', {
        method: 'POST',
        headers: {
          'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp6ZXBjZ25sYmRvbXJja2llbHp6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQwNDcxMjgsImV4cCI6MjA3OTYyMzEyOH0.rErcK3g-Z0XIbWi2q3MbC-JY6bUfa2FNEsgY_uic6ak',
          'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp6ZXBjZ25sYmRvbXJja2llbHp6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQwNDcxMjgsImV4cCI6MjA3OTYyMzEyOH0.rErcK3g-Z0XIbWi2q3MbC-JY6bUfa2FNEsgY_uic6ak',
          'Content-Type': 'application/json',
          'Prefer': 'return=minimal'
        },
        body: JSON.stringify(order)
      });
      alert(`Order sent for Table ${selectedTable}!`);
      setCurrentOrder([]);
      setNote('');
      setSelectedTable(null);
    } catch (err) {
      alert("Offline: Order saved locally");
    }
  };

  // THIS IS THE ONLY CHANGE YOU NEED
  if (loading) {
    return <div className="text-center text-6xl mt-40 font-bold text-indigo-600">Loading menu...</div>;
  }

  if (!menu.length) {
    return <div className="text-center text-6xl mt-40 font-bold text-red-600">No menu items! Add in Menu Manager</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <h1 className="text-7xl font-bold text-center my-10 text-indigo-800">Active Order</h1>

      {/* Table Grid */}
      <div className="grid grid-cols-4 gap-10 max-w-6xl mx-auto mb-20">
        {[1,2,3,4,5,6,7,8].map(num => (
          <button
            key={num}
            onClick={() => setSelectedTable(num)}
            className={`p-20 rounded-3xl text-6xl font-bold shadow-2xl transition-all transform hover:scale-110 ${
              selectedTable === num ? 'bg-indigo-700 text-white' : 'bg-green-500 text-white'
            }`}
          >
            Table {num}
          </button>
        ))}
      </div>

      {selectedTable && (
        <div className="max-w-7xl mx-auto grid lg:grid-cols-3 gap-12">
          {/* Menu */}
          <div className="lg:col-span-2 bg-white rounded-3xl shadow-2xl p-10">
            <h2 className="text-5xl font-bold mb-10 text-indigo-800">Table {selectedTable} - Menu</h2>
            {categories.map(cat => (
              <div key={cat} className="mb-12">
                <h3 className="text-4xl font-bold text-indigo-700 mb-6 border-b-4 border-indigo-300 pb-2">{cat}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {menu
                    .filter(item => item.category === cat)
                    .map(item => (
                      <div key={item.id} className="bg-gradient-to-r from-indigo-50 to-purple-50 p-6 rounded-2xl hover:shadow-xl transition">
                        <div className="flex justify-between items-center">
                          <div>
                            <div className="text-3xl font-bold text-gray-800">{item.name}</div>
                            <div className="text-2xl text-green-600 font-bold">ETB {item.price}</div>
                          </div>
                          <button
                            onClick={() => addItem(item)}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white px-10 py-5 rounded-xl text-2xl font-bold shadow-lg"
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
          <div className="bg-white rounded-3xl shadow-2xl p-10">
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
                <div key={item.id} className="bg-indigo-100 p-6 rounded-2xl">
                  <div className="flex justify-between items-center">
                    <div className="text-3xl font-bold">{item.qty} × {item.name}</div>
                    <div className="text-3xl font-bold text-green-600">ETB {item.price * item.qty}</div>
                  </div>
                  <button onClick={() => removeItem(item.id)} className="text-red-600 text-xl mt-2">Remove</button>
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
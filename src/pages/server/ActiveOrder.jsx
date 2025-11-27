// src/pages/server/ActiveOrder.jsx — FINAL VERSION USING YOUR WORKING MENU CONTEXT
import React, { useState } from 'react';
import { useMenu } from '../../context/MenuContext';  // ← THIS IS THE KEY
import { useAuth } from '../../context/AuthContext';

export default function ActiveOrder() {
  const { user } = useAuth();
  const { menu, categories } = useMenu(); // ← Gets live menu from MenuManager saves

  const [selectedTable, setSelectedTable] = useState(null);
  const [currentOrder, setCurrentOrder] = useState([]);
  const [note, setNote] = useState('');
  const [tables] = useState(Array(8).fill().map((_, i) => ({ id: i + 1, status: 'vacant' })));

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

    // Save to Supabase
    const { error } = await fetch('https://YOUR-PROJECT.supabase.co/rest/v1/orders', {
      method: 'POST',
      headers: {
        'apikey': 'your-anon-key',
        'Authorization': 'Bearer your-anon-key',
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify(order)
    });

    if (!error) {
      alert(`Order sent for Table ${selectedTable}!`);
      setCurrentOrder([]);
      setNote('');
      setSelectedTable(null);
    }
  };

  if (!menu.length) {
    return <div className="text-center text-4xl mt-20">Loading menu...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <h1 className="text-6xl font-bold text-center my-10 text-indigo-800">Active Order</h1>

      {/* Table Grid */}
      <div className="grid grid-cols-4 gap-8 max-w-6xl mx-auto mb-16">
        {tables.map(table => (
          <button
            key={table.id}
            onClick={() => setSelectedTable(table.id)}
            className={`p-16 rounded-3xl text-5xl font-bold shadow-2xl transition-all transform hover:scale-110 ${
              selectedTable === table.id ? 'bg-indigo-600 text-white' : 'bg-green-500 text-white'
            }`}
          >
            Table {table.id}
          </button>
        ))}
      </div>

      {selectedTable && (
        <div className="max-w-7xl mx-auto grid lg:grid-cols-3 gap-10">
          {/* Menu */}
          <div className="lg:col-span-2 bg-white rounded-3xl shadow-2xl p-10">
            <h2 className="text-5xl font-bold mb-8">Table {selectedTable} - Select Items</h2>
            {categories.map(cat => (
              <div key={cat} className="mb-10">
                <h3 className="text-3xl font-bold text-indigo-700 mb-4">{cat}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {menu
                    .filter(item => item.category === cat)
                    .map(item => (
                      <div key={item.id} className="bg-gray-50 p-6 rounded-2xl mb-4 hover:bg-indigo-50 transition">
                        <div className="flex justify-between items-center">
                          <div>
                            <div className="text-2xl font-bold">{item.name}</div>
                            <div className="text-gray-600">ETB {item.price}</div>
                          </div>
                          <button
                            onClick={() => addItem(item)}
                            className="bg-indigo-600 text-white px-8 py-4 rounded-xl text-xl font-bold hover:bg-indigo-700"
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
            <h2 className="text-5xl font-bold mb-8">Current Order</h2>
            <textarea
              placeholder="Add note (optional)"
              value={note}
              onChange={e => setNote(e.target.value)}
              className="w-full p-4 border-2 rounded-xl text-xl mb-6"
              rows="3"
            />
            <div className="space-y-4 mb-8">
              {currentOrder.map(item => (
                <div key={item.id} className="flex justify-between items-center bg-indigo-50 p-4 rounded-xl">
                  <div>
                    <div className="text-xl font-bold">{item.qty}x {item.name}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold">ETB {item.price * item.qty}</div>
                    <button onClick={() => removeItem(item.id)} className="text-red-600 text-lg">Remove</button>
                  </div>
                </div>
              ))}
            </div>
            <button
              onClick={sendOrder}
              className="w-full bg-green-600 text-white py-8 text-4xl font-bold rounded-3xl hover:bg-green-700 shadow-xl"
            >
              SEND TO KITCHEN
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
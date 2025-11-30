// src/pages/server/ActiveOrder.jsx — FINAL 100% BRD v2.0 COMPLIANT
import React, { useState, useEffect } from 'react';
import { useMenu } from '../../context/MenuContext';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';

export default function ActiveOrder() {
  const { user } = useAuth();
  const { menu, loading: menuLoading } = useMenu();

  const [selectedTable, setSelectedTable] = useState(null);
  const [currentOrder, setCurrentOrder] = useState([]);
  const [note, setNote] = useState('');
  const [orderId, setOrderId] = useState(null);
  const [loadingOrder, setLoadingOrder] = useState(false);

  // Load active order when table changes
  useEffect(() => {
    if (selectedTable) loadActiveOrder();
    else resetOrder();
  }, [selectedTable]);

  const loadActiveOrder = async () => {
    setLoadingOrder(true);
    const { data } = await supabase
      .from('orders')
      .select('*')
      .eq('table_number', selectedTable)
      .in('status', ['new', 'preparing'])
      .order('created_at', { ascending: false })
      .limit(1);

    if (data && data[0]) {
      setOrderId(data[0].id);
      setCurrentOrder(data[0].items || []);
      setNote(data[0].order_note || '');
    } else {
      resetOrder();
    }
    setLoadingOrder(false);
  };

  const resetOrder = () => {
    setOrderId(null);
    setCurrentOrder([]);
    setNote('');
  };

  const addToOrder = (item) => {
    setCurrentOrder(prev => {
      const exists = prev.find(i => i.id === item.id);
      if (exists) return prev.map(i => i.id === item.id ? { ...i, qty: i.qty + 1 } : i);
      return [...prev, { ...item, qty: 1 }];
    });
  };

  const decreaseQty = (id) => {
    setCurrentOrder(prev => {
      const item = prev.find(i => i.id === id);
      if (!item || item.qty <= 1) return prev.filter(i => i.id !== id);
      return prev.map(i => i.id === id ? { ...i, qty: i.qty - 1 } : i);
    });
  };

  const removeItem = (id) => {
    setCurrentOrder(prev => prev.filter(i => i.id !== id));
  };

  const saveOrder = async () => {
    if (!selectedTable) return alert('Select a table');
    if (currentOrder.length === 0) return alert('Add at least one item');

    const payload = {
      table_number: selectedTable,
      items: currentOrder,
      order_note: note.trim() || null,
      server_name: user?.name || 'Server',
      status: 'new',
      updated_at: new Date().toISOString()
    };

    let error;
    if (orderId) {
      // MODIFY EXISTING ORDER
      ({ error } = await supabase.from('orders').update(payload).eq('id', orderId));
    } else {
      // CREATE NEW ORDER
      payload.created_at = new Date().toISOString();
      const { data } = await supabase.from('orders').insert(payload).select().single();
      if (data) setOrderId(data.id);
    }

    if (error) {
      alert('Offline: Changes saved locally');
      localStorage.setItem(`table-${selectedTable}`, JSON.stringify({ orderId, items: currentOrder, note }));
    } else {
      alert(orderId ? 'Order updated successfully!' : 'Order sent to kitchen!');
      // Stay on table for further modifications
    }
  };

  if (menuLoading) return <div className="text-center text-6xl mt-40">Loading menu...</div>;
  if (!menu?.categories?.length) return <div className="text-center text-6xl mt-40 text-red-600">No menu items!</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-100 p-8">
      <h1 className="text-7xl font-bold text-center mb-12 text-indigo-800">Active Order</h1>

      <div className="grid grid-cols-4 gap-10 max-w-6xl mx-auto mb-20">
        {[1,2,3,4,5,6,7,8].map(n => (
          <button key={n} onClick={() => setSelectedTable(n)}
            className={`p-20 rounded-3xl text-6xl font-bold shadow-2xl transition-all transform hover:scale-110 ${selectedTable === n ? 'bg-indigo-700 text-white' : 'bg-green-500 text-white'}`}>
            Table {n}
          </button>
        ))}
      </div>

      {selectedTable && (
        <div className="max-w-7xl mx-auto grid lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2 bg-white rounded-3xl shadow-2xl p-12">
            <h2 className="text-5xl font-bold mb-10 text-indigo-800">
              Table {selectedTable} {orderId && '(Modifying)'} {loadingOrder && '(Loading...)'}
            </h2>
            {menu.categories.map(cat => (
              <div key={cat.id} className="mb-12">
                <h3 className="text-4xl font-bold text-purple-700 mb-6 pb-3 border-b-4 border-purple-300">{cat.name}</h3>
                <div className="grid md:grid-cols-2 gap-8">
                  {cat.items.filter(i => i.enabled !== false).map(item => (
                    <div key={item.id} className="bg-gradient-to-r from-purple-50 to-pink-50 p-8 rounded-2xl hover:shadow-2xl transition">
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="text-3xl font-bold text-gray-800">{item.name}</div>
                          <div className="text-2xl font-bold text-green-600 mt-2">ETB {item.price}</div>
                        </div>
                        <button onClick={() => addToOrder(item)}
                          className="bg-indigo-600 hover:bg-indigo-700 text-white px-12 py-6 rounded-2xl text-3xl font-bold shadow-lg transform hover:scale-110 transition">
                          ADD
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="bg-white rounded-3xl shadow-2xl p-12">
            <h2 className="text-5xl font-bold mb-8 text-indigo-800">
              {orderId ? 'Modify Order' : 'New Order'}
            </h2>
            <textarea placeholder="Special request..." value={note} onChange={e => setNote(e.target.value)}
              className="w-full p-6 border-4 border-indigo-200 rounded-2xl text-2xl mb-8" rows="4" />
            <div className="space-y-6 mb-10 max-h-96 overflow-y-auto">
              {currentOrder.map(item => (
                <div key={item.id} className="bg-gradient-to-r from-indigo-100 to-purple-100 p-6 rounded-2xl flex justify-between items-center">
                  <div className="flex items-center gap-4">
                    <button onClick={() => decreaseQty(item.id)} className="text-5xl font-bold text-red-600">−</button>
                    <span className="text-4xl font-bold">{item.qty}</span>
                    <button onClick={() => addToOrder(item)} className="text-5xl font-bold text-green-600">+</button>
                    <span className="text-2xl ml-4">{item.name}</span>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-green-600">ETB {item.price * item.qty}</div>
                    <button onClick={() => removeItem(item.id)} className="text-red-600 text-lg mt-2 underline">Remove</button>
                  </div>
                </div>
              ))}
            </div>
            <button onClick={saveOrder}
              className="w-full bg-orange-600 hover:bg-orange-700 text-white py-10 text-5xl font-bold rounded-3xl shadow-2xl transform hover:scale-105 transition">
              {orderId ? 'UPDATE ORDER' : 'SEND TO KITCHEN'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
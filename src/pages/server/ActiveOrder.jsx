// src/pages/server/ActiveOrder.jsx
import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';

export default function ActiveOrder() {
  const [orders, setOrders] = useState([]);
  const [selectedTable, setSelectedTable] = useState(null);
  const [currentOrder, setCurrentOrder] = useState({ items: [], note: '' });

  // Fetch all active orders
  useEffect(() => {
    fetchOrders();

    const channel = supabase
      .channel('orders-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => {
        fetchOrders();
      })
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, []);

  const fetchOrders = async () => {
    const { data } = await supabase
      .from('orders')
      .select('*')
      .in('status', ['new', 'in-progress'])
      .order('created_at', { ascending: true });

    setOrders(data || []);
  };

  const sendOrder = async () => {
    if (currentOrder.items.length === 0) return;

    await supabase.from('orders').insert({
      table_number: selectedTable,
      items: currentOrder.items,
      order_note: currentOrder.note,
      status: 'new',
      server_name: 'Server' // You can get this from user later
    });

    setCurrentOrder({ items: [], note: '' });
    setSelectedTable(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-100 p-6">
      <h1 className="text-5xl font-bold text-center mb-8 text-emerald-800">Active Order</h1>

      {/* Table Selection */}
      <div className="grid grid-cols-4 gap-6 mb-10 max-w-4xl mx-auto">
        {[1, 2, 3, 4, 5, 6, 7, 8].map(num => (
          <button
            key={num}
            onClick={() => setSelectedTable(num)}
            className={`p-10 text-3xl font-bold rounded-2xl transition-all ${
              selectedTable === num
                ? 'bg-emerald-600 text-white shadow-2xl scale-110'
                : 'bg-white hover:bg-emerald-100 shadow-xl'
            }`}
          >
            Table {num}
          </button>
        ))}
      </div>

      {selectedTable && (
        <div className="max-w-4xl mx-auto bg-white rounded-3xl shadow-2xl p-8">
          <h2 className="text-4xl font-bold mb-6">Table {selectedTable}</h2>
          {/* Your existing menu items, add to order, etc. */}
          <button
            onClick={sendOrder}
            className="w-full mt-8 bg-emerald-600 text-white py-6 text-3xl font-bold rounded-2xl hover:bg-emerald-700"
          >
            SEND ORDER TO KITCHEN
          </button>
        </div>
      )}

      {/* Live Orders List */}
      <div className="mt-16 max-w-6xl mx-auto">
        <h2 className="text-4xl font-bold mb-6">Active Orders</h2>
        {orders.map(order => (
          <div key={order.id} className="bg-white p-6 rounded-xl shadow mb-4">
            <div className="font-bold text-2xl">Table {order.table_number}</div>
            <div>{order.items.length} items • {order.status}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
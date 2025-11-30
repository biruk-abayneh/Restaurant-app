// src/pages/kitchen/KDS.jsx — FINAL: START button works + no duplicates + bell on modify
import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../../lib/supabase';

export default function KDS() {
  const [orders, setOrders] = useState([]);
  const audioRef = useRef(null);

  useEffect(() => {
    fetchOrders();

    const channel = supabase
      .channel('orders-changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'orders'
      }, (payload) => {
        console.log('Realtime update:', payload);
        fetchOrders();

        // Bell on new order OR when modified back to 'new'
        if (payload.eventType === 'INSERT' || 
            (payload.eventType === 'UPDATE' && payload.new.status === 'new')) {
          if (audioRef.current) {
            audioRef.current.currentTime = 0;
            audioRef.current.play().catch(() => {});
          }
        }
      })
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, []);

  const fetchOrders = async () => {
    const { data } = await supabase
      .from('orders')
      .select('*')
      .in('status', ['new', 'preparing'])
      .order('updated_at', { ascending: false })
      .order('created_at', { ascending: true });

    setOrders(data || []);
  };

  const updateStatus = async (id, status) => {
    const { error } = await supabase
      .from('orders')
      .update({ status })
      .eq('id', id);

    if (error) console.error("Update failed:", error);
  };

  const getColor = (status) => status === 'new' ? 'bg-red-600' : 'bg-yellow-500';

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <audio ref={audioRef} src="https://assets.mixkit.co/sfx/preview/mixkit-alarm-digital-clock-beep-989.mp3" />
      <h1 className="text-6xl font-bold text-center mb-12 text-yellow-400">KITCHEN DISPLAY</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {orders.map(order => (
          <div key={order.id} className={`${getColor(order.status)} rounded-3xl p-8 shadow-2xl transform hover:scale-105 transition-all`}>
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-5xl font-bold">Table {order.table_number}</h2>
                <p className="text-2xl mt-2 opacity-90">by {order.server_name}</p>
              </div>
              <div className="text-3xl font-bold text-white">
                {new Date(order.updated_at || order.created_at).toLocaleTimeString()}
              </div>
            </div>

            {order.order_note && (
              <div className="bg-black bg-opacity-40 rounded-2xl p-4 mb-6">
                <p className="text-xl font-semibold">Note: {order.order_note}</p>
              </div>
            )}

            <div className="space-y-4 mb-8">
              {order.items.map((item, idx) => (
                <div key={idx} className="bg-white bg-opacity-20 rounded-2xl p-4">
                  <span className="text-2xl font-bold">{item.qty} × {item.name}</span>
                </div>
              ))}
            </div>

            <div className="flex gap-4">
              {order.status === 'new' && (
                <button onClick={() => updateStatus(order.id, 'preparing')}
                  className="flex-1 bg-yellow-600 hover:bg-yellow-700 py-6 rounded-2xl text-3xl font-bold transition">
                  START
                </button>
              )}
              {order.status === 'preparing' && (
                <button onClick={() => updateStatus(order.id, 'ready')}
                  className="flex-1 bg-green-600 hover:bg-green-700 py-6 rounded-2xl text-3xl font-bold transition">
                  READY
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {orders.length === 0 && (
        <div className="text-center text-6xl mt-40 text-gray-500">No active orders</div>
      )}
    </div>
  );
}
// src/pages/kitchen/KDS.jsx — ONLY START BUTTON FIXED (100% working now)
import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../../lib/supabase';

export default function KDS() {
  const [orders, setOrders] = useState([]);
  const audioRef = useRef(null);

  useEffect(() => {
    fetchOrders();

    const channel = supabase
      .channel('kitchen-orders')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'orders' },
        () => {
          fetchOrders(); // Re-fetch on any change
          // Bell logic stays the same
          if (audioRef.current) {
            audioRef.current.currentTime = 0;
            audioRef.current.play().catch(() => {});
          }
        }
      )
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, []);

  const fetchOrders = async () => {
    const { data } = await supabase
      .from('orders')
      .select('*')
      .in('status', ['new', 'preparing'])
      .order('created_at', { ascending: true });

    setOrders(data || []);
  };

  // THIS IS THE ONLY CHANGE — FIXED START BUTTON
  const handleStart = async (orderId) => {
    const { error } = await supabase
      .from('orders')
      .update({ status: 'preparing' })
      .eq('id', orderId);

    if (error) {
      console.error('Failed to start order:', error);
      alert('Error starting order. Check console.');
    }
    // No need to fetch again — realtime will update UI instantly
  };

  const handleReady = async (orderId) => {
    await supabase.from('orders').update({ status: 'ready' }).eq('id', orderId);
  };

  const getCardColor = (status) => (status === 'new' ? 'bg-red-600' : 'bg-yellow-500');

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <audio
        ref={audioRef}
        src="https://assets.mixkit.co/sfx/preview/mixkit-alarm-digital-clock-beep-989.mp3"
        preload="auto"
      />

      <h1 className="text-7xl font-bold text-center mb-12 text-yellow-400 tracking-wider">
        KITCHEN DISPLAY SYSTEM
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-10">
        {orders.length === 0 && (
          <div className="col-span-full text-center text-6xl text-gray-500 mt-40">
            No active orders
          </div>
        )}

        {orders.map((order) => (
          <div
            key={order.id}
            className={`${getCardColor(order.status)} rounded-3xl p-10 shadow-2xl transform hover:scale-105 transition-all duration-300 border-4 border-white border-opacity-20`}
          >
            {order.modified && (
              <div className="bg-red-800 text-white text-3xl font-bold text-center py-4 rounded-2xl mb-6 animate-pulse shadow-lg">
                MODIFIED ORDER
              </div>
            )}

            <div className="flex justify-between items-start mb-8">
              <div>
                <h2 className="text-6xl font-bold">Table {order.table_number}</h2>
                <p className="text-3xl opacity-90 mt-2">by {order.server_name}</p>
              </div>
            </div>

            {order.order_note && (
              <div className="bg-black bg-opacity-50 rounded-2xl p-5 mb-6 text-xl font-medium">
                Note: {order.order_note}
              </div>
            )}

            <div className="space-y-5 mb-10">
              {order.items.map((item, idx) => (
                <div key={idx} className="bg-white bg-opacity-20 rounded-2xl p-5 text-3xl font-bold text-center">
                  {item.qty} × {item.name}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 gap-4">
              {order.status === 'new' && (
                <button
                  onClick={() => handleStart(order.id)}  // FIXED HERE
                  className="bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 py-8 rounded-2xl text-4xl font-bold shadow-lg transform hover:scale-105 transition"
                >
                  START COOKING
                </button>
              )}
              {order.status === 'preparing' && (
                <button
                  onClick={() => handleReady(order.id)}
                  className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 py-8 rounded-2xl text-4xl font-bold shadow-lg transform hover:scale-105 transition"
                >
                  READY FOR PICKUP
                </button>
              )}
            </div>

            {order.modified && order.modified_by && (
              <p className="text-center text-sm opacity-80 mt-4">
                Modified by {order.modified_by}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
// src/pages/server/ActiveOrder.jsx
import React, { useState, useEffect } from 'react';
import { useOrder } from '../../context/OrderContext';
import { useAuth } from '../../context/AuthContext';
import { useMenu } from '../../context/MenuContext';

export default function ActiveOrder() {
  const { orders = [], addOrder, updateOrder } = useOrder(); // ← Safe default
  const { user } = useAuth();
  const { menu } = useMenu();

  const [selectedTable, setSelectedTable] = useState(null);
  const [currentOrder, setCurrentOrder] = useState({ items: [], note: '' });
  const [isEditing, setIsEditing] = useState(false);
  const [editingOrderId, setEditingOrderId] = useState(null);

  // Load existing order
  useEffect(() => {
    if (selectedTable && orders.length > 0) {
      const existing = orders.find(o => o.tableNumber === selectedTable && o.status === 'new');
      if (existing) {
        setCurrentOrder({ items: existing.items || [], note: existing.orderNote || '' });
        setIsEditing(true);
        setEditingOrderId(existing.id);
      } else {
        setCurrentOrder({ items: [], note: '' });
        setIsEditing(false);
        setEditingOrderId(null);
      }
    }
  }, [selectedTable, orders]);

  const sendToKitchen = () => {
    if (currentOrder.items.length === 0) return alert('Add at least one item');

    const orderData = {
      id: editingOrderId || Date.now().toString(),
      tableNumber: selectedTable,
      items: currentOrder.items,
      orderNote: currentOrder.note,
      status: 'new',
      timestamp: new Date().toISOString(),
      serverName: user?.name || 'Server',
      modified: isEditing,
      modifiedBy: isEditing ? user?.name : undefined
    };

    if (isEditing) {
      updateOrder(editingOrderId, orderData);
      alert(`Order updated & resent to kitchen!`);
    } else {
      addOrder(orderData);
      alert(`Order sent to kitchen for Table ${selectedTable}!`);
    }

    setCurrentOrder({ items: [], note: '' });
    setSelectedTable(null);
    setIsEditing(false);
    setEditingOrderId(null);
  };

  const addItem = (item) => {
    setCurrentOrder(prev => ({
      ...prev,
      items: [...prev.items, { ...item, qty: 1 }]
    }));
  };

  const removeItem = (index) => {
    setCurrentOrder(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }));
  };

  if (!selectedTable) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <h1>Active Order — {user?.name}</h1>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '1rem', maxWidth: '800px', margin: '3rem auto' }}>
          {[1,2,3,4,5,6,7,8,9,10].map(n => {
            const hasOrder = orders.some(o => o.tableNumber === n && o.status === 'new');
            return (
              <button
                key={n}
                onClick={() => setSelectedTable(n)}
                style={{
                  padding: '3rem',
                  fontSize: '2rem',
                  background: hasOrder ? '#fee2e2' : '#ecfdf5',
                  color: hasOrder ? '#991b1b' : '#166534',
                  border: 'none',
                  borderRadius: '16px',
                  cursor: 'pointer'
                }}
              >
                Table {n}
                {hasOrder && ' • Active'}
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <button onClick={() => setSelectedTable(null)} style={{ padding: '1rem 2rem', background: '#6b7280', color: 'white', borderRadius: '12px' }}>
        ← Back
      </button>

      <h2 style={{ fontSize: '2.5rem', margin: '1rem 0' }}>
        {isEditing ? 'Edit Order' : 'New Order'} — Table {selectedTable}
      </h2>
      {isEditing && <p style={{ color: '#dc2626', fontWeight: 'bold' }}>This will resend to kitchen</p>}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginTop: '2rem' }}>
        <div>
          <h3>Menu</h3>
          {menu.categories.map(cat => (
            <div key={cat.id}>
              <h4>{cat.name}</h4>
              {cat.items.filter(i => i.enabled).map(item => (
                <button
                  key={item.id}
                  onClick={() => addItem(item)}
                  style={{ display: 'block', width: '100%', padding: '1rem', margin: '0.5rem 0', background: '#3b82f6', color: 'white', borderRadius: '8px' }}
                >
                  + {item.name} — ${item.price.toFixed(2)}
                </button>
              ))}
            </div>
          ))}
        </div>

        <div>
          <h3>Current Order</h3>
          <div style={{ background: 'white', padding: '1.5rem', borderRadius: '16px', minHeight: '400px' }}>
            {currentOrder.items.length === 0 ? (
              <p>No items</p>
            ) : (
              currentOrder.items.map((item, i) => (
                <div key={i} style={{ padding: '0.75rem 0', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between' }}>
                  <span>{item.qty || 1}× {item.name}</span>
                  <button onClick={() => removeItem(i)} style={{ color: '#ef4444' }}>Remove</button>
                </div>
              ))
            )}
            <textarea
              placeholder="Note (e.g. No onions)"
              value={currentOrder.note}
              onChange={e => setCurrentOrder({ ...currentOrder, note: e.target.value })}
              style={{ width: '100%', marginTop: '1rem', padding: '1rem' }}
            />
          </div>

          <button
            onClick={sendToKitchen}
            style={{
              width: '100%',
              padding: '1.5rem',
              marginTop: '1rem',
              background: isEditing ? '#f59e0b' : '#10b981',
              color: 'white',
              fontSize: '1.5rem',
              fontWeight: 'bold',
              border: 'none',
              borderRadius: '16px'
            }}
          >
            {isEditing ? 'UPDATE & RESEND' : 'SEND TO KITCHEN'}
          </button>
        </div>
      </div>
    </div>
  );
}
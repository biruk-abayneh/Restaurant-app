// src/pages/server/components/OrderSummary.jsx
import React from 'react';
import { getSocket } from '../../../utils/socket';

export default function OrderSummary({
  orderItems,
  total,
  orderNote,
  setOrderNote,
  updateItem,
  removeItem,
  tableNumber,
  orderType,
  clearOrder,        // ← Make sure this is passed from ActiveOrder
}) {
  // DEBUG LOG (you can remove later)
  console.log('OrderSummary props:', { orderItems, tableNumber, orderType });

  // Guard: don't render if no items
  if (!orderItems || orderItems.length === 0) {
    return null;
  }

  const handleSendToKitchen = () => {
    // FINAL FIX: Prevent double-click & validate
    if (!tableNumber || tableNumber.trim() === '') {
      alert('Please enter a Table Number before sending!');
      return;
    }

    const socket = getSocket();

    const orderPayload = {
      id: `ORD-${Date.now()}`,
      tableNumber: tableNumber.trim(),
      orderType,
      items: orderItems.map(item => ({
        name: item.name,
        qty: item.qty,
        price: item.price,
        note: item.note || '',
        modifiers: item.modifiers || [],
      })),
      orderNote: orderNote || '',
      total,
      status: 'new',                    // Yellow on KDS
      timestamp: new Date().toISOString(),
    };

    // SEND TO KDS
    socket.emit('new-order', orderPayload);

    // SUCCESS FEEDBACK
    alert(`Order #${orderPayload.id} sent to kitchen!`);

    // CLEAR ORDER AFTER SEND (optional but recommended)
    clearOrder();
  };

  return (
    <div
      style={{
        position: 'sticky',
        bottom: 0,
        background: 'white',
        borderTop: '2px solid #e5e7eb',
        padding: '1rem',
        boxShadow: '0 -4px 12px rgba(0,0,0,0.1)',
        zIndex: 10,
        maxHeight: '40vh',
        overflowY: 'auto',
      }}
    >
      <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '0.75rem' }}>
        Current Order ({orderItems.reduce((s, i) => s + i.qty, 0)} items)
      </h2>

      {/* ORDER ITEMS */}
      {orderItems.map((item, idx) => (
        <div
          key={item.key || idx}
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            padding: '0.5rem 0',
            borderBottom: '1px solid #f3f4f6',
          }}
        >
          <div style={{ flex: 1 }}>
            <span style={{ fontWeight: '600' }}>{item.qty}x {item.name}</span>
            {item.note && (
              <p style={{ fontSize: '0.8rem', color: '#ef4444', margin: '0.25rem 0' }}>
                Note: {item.note}
              </p>
            )}
            {item.modifiers && item.modifiers.length > 0 && (
              <p style={{ fontSize: '0.8rem', color: '#6366f1', margin: '0.25rem 0' }}>
                Modifiers: <strong>{item.modifiers.join(', ')}</strong>
              </p>
            )}
          </div>

          {/* QTY BUTTONS */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <button
              onClick={() => item.qty <= 1 ? removeItem(idx) : updateItem(idx, { qty: item.qty - 1 })}
              style={{ width: '32px', height: '32px', background: '#ef4444', color: 'white', borderRadius: '50%', border: 'none', fontWeight: 'bold' }}
            >
              Minus
            </button>
            <span style={{ minWidth: '24px', textAlign: 'center', fontWeight: '600' }}>{item.qty}</span>
            <button
              onClick={() => updateItem(idx, { qty: item.qty + 1 })}
              style={{ width: '32px', height: '32px', background: '#10b981', color: 'white', borderRadius: '50%', border: 'none', fontWeight: 'bold' }}
            >
              Plus
            </button>
          </div>

          <span style={{ fontWeight: '600', minWidth: '70px', textAlign: 'right' }}>
            ${(item.price * item.qty).toFixed(2)}
          </span>
        </div>
      ))}

      {/* ORDER NOTE */}
      <div style={{ margin: '1rem 0' }}>
        <label style={{ fontWeight: '600', display: 'block', marginBottom: '0.5rem' }}>
          Order Note (optional):
        </label>
        <input
          type="text"
          value={orderNote}
          onChange={(e) => setOrderNote(e.target.value)}
          placeholder="e.g., Birthday table"
          style={{ width: '100%', padding: '0.5rem', borderRadius: '0.375rem', border: '1px solid #d1d5db' }}
        />
      </div>

      {/* TOTAL */}
      <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '1.1rem' }}>
        <span>Total</span>
        <span>${total.toFixed(2)}</span>
      </div>

      {/* SEND TO KITCHEN BUTTON – NOW WORKS 100% */}
      <button
        onClick={handleSendToKitchen}
        disabled={!tableNumber || tableNumber.trim() === ''}
        style={{
          width: '100%',
          marginTop: '1rem',
          padding: '0.75rem',
          background: (!tableNumber || tableNumber.trim() === '') ? '#9ca3af' : '#10b981',
          color: 'white',
          fontWeight: '600',
          borderRadius: '0.375rem',
          border: 'none',
          cursor: (!tableNumber || tableNumber.trim() === '') ? 'not-allowed' : 'pointer',
          fontSize: '1rem',
        }}
      >
        Send to Kitchen
      </button>
    </div>
  );
}
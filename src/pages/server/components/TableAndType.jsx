// src/pages/server/components/TableAndType.jsx
import React from 'react';

export default function TableAndType({ tableNumber, setTableNumber, orderType, setOrderType }) {
  return (
    <div className="card" style={{ marginBottom: '1.5rem' }}>
      <div style={{ marginBottom: '1rem' }}>
        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
          Table Number
        </label>
        <input
          type="text"
          value={tableNumber}
          onChange={(e) => setTableNumber(e.target.value)}
          placeholder="e.g. 5 or A1"
          autoFocus
          style={{
            fontSize: '1.1rem',
            padding: '0.5rem',
            width: '100%',
            borderRadius: '0.375rem',
            border: '1px solid #d1d5db',
          }}
        />
      </div>

      <div>
        <label style={{ display: 'block', marginBottom: '0.75rem', fontWeight: '600' }}>
          Order Type
        </label>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            onClick={() => setOrderType('dine-in')}
            style={{
              flex: 1,
              padding: '0.75rem',
              background: orderType === 'dine-in' ? '#3b82f6' : '#e5e7eb',
              color: orderType === 'dine-in' ? 'white' : '#374151',
              fontWeight: '600',
              borderRadius: '0.375rem',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            Dine In
          </button>
          <button
            onClick={() => setOrderType('takeaway')}
            style={{
              flex: 1,
              padding: '0.75rem',
              background: orderType === 'takeaway' ? '#3b82f6' : '#e5e7eb',
              color: orderType === 'takeaway' ? 'white' : '#374151',
              fontWeight: '600',
              borderRadius: '0.375rem',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            Takeaway
          </button>
        </div>
      </div>
    </div>
  );
}
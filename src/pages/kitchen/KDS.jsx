// src/pages/kitchen/KDS.jsx
import React, { useEffect, useState, useRef } from 'react';
import { useOrder } from '../../context/OrderContext';

export default function KDS() {
  const { orders } = useOrder();
  const audioRef = useRef(new Audio('/sounds/kitchen-bell.mp3'));
  const prevNewCount = useRef(0);

  // Filter only active orders (new + in progress)
  const activeOrders = orders.filter(o => o.status === 'new' || o.status === 'in-progress');

  // Play sound when new order arrives
  useEffect(() => {
    const newCount = activeOrders.filter(o => o.status === 'new').length;
    if (newCount > prevNewCount.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(() => {});
    }
    prevNewCount.current = newCount;
  }, [activeOrders]);

  const markAsInProgress = (orderId) => {
    // In real app, emit via socket
    window.dispatchEvent(new CustomEvent('order-status-change', {
      detail: { id: orderId, status: 'in-progress' }
    }));
  };

  const markAsReady = (orderId) => {
    window.dispatchEvent(new CustomEvent('order-status-change', {
      detail: { id: orderId, status: 'ready' }
    }));
  };

  // Sort: New first, then In Progress, then Ready
  const sortedOrders = [...activeOrders].sort((a, b) => {
    if (a.status === 'new' && b.status !== 'new') return -1;
    if (a.status !== 'new' && b.status === 'new') return 1;
    if (a.status === 'in-progress' && b.status === 'ready') return -1;
    if (a.status === 'ready' && b.status === 'in-progress') return 1;
    return new Date(a.timestamp) - new Date(b.timestamp);
  });

  return (
    <div style={{
      minHeight: '100vh',
      background: '#0f172a',
      color: 'white',
      padding: '2rem',
      fontFamily: 'system-ui, sans-serif'
    }}>
      {/* Header */}
      <div style={{
        textAlign: 'center',
        marginBottom: '3rem',
        padding: '2rem',
        background: 'linear-gradient(135deg, #1e293b, #334155)',
        borderRadius: '24px',
        boxShadow: '0 20px 40px rgba(0,0,0,0.4)'
      }}>
        <h1 style={{
          fontSize: '4.5rem',
          fontWeight: '900',
          margin: 0,
          background: 'linear-gradient(to right, #fbbf24, #f59e0b)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent'
        }}>
          KITCHEN DISPLAY SYSTEM
        </h1>
        <p style={{ fontSize: '1.8rem', color: '#94a3b8', marginTop: '1rem' }}>
          {new Date().toLocaleString()}
        </p>
      </div>

      {/* Orders Grid */}
      <div style={{
        display: 'grid',
        gap: '2rem',
        gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))',
        maxWidth: '1600px',
        margin: '0 auto'
      }}>
        {sortedOrders.length === 0 ? (
          <div style={{
            gridColumn: '1 / -1',
            textAlign: 'center',
            padding: '6rem',
            fontSize: '2.5rem',
            color: '#64748b'
          }}>
            No active orders — All caught up!
          </div>
        ) : (
          sortedOrders.map(order => (
            <div
              key={order.id}
              style={{
                background: order.status === 'new' ? '#dc2626' :
                          order.status === 'in-progress' ? '#f59e0b' : '#16a34a',
                color: 'white',
                borderRadius: '24px',
                padding: '2rem',
                boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
                border: order.modified ? '8px solid #fbbf24' : 'none',
                animation: order.status === 'new' ? 'pulse 2s infinite' : 'none',
                position: 'relative'
              }}
            >
              {/* Modified Alert */}
              {order.modified && (
                <div style={{
                  position: 'absolute',
                  top: '-12px',
                  right: '20px',
                  background: '#fbbf24',
                  color: '#000',
                  padding: '0.5rem 1rem',
                  borderRadius: '50px',
                  fontWeight: 'bold',
                  fontSize: '1.1rem',
                  boxShadow: '0 4px 15px rgba(0,0,0,0.3)'
                }}>
                  MODIFIED BY {order.modifiedBy || order.serverName}
                </div>
              )}

              {/* Header */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '1.5rem'
              }}>
                <h2 style={{ fontSize: '3rem', fontWeight: '900', margin: 0 }}>
                  Table {order.tableNumber}
                </h2>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ fontSize: '2rem', fontWeight: 'bold', margin: 0 }}>
                    #{order.id.split('-').pop()}
                  </p>
                  <p style={{ fontSize: '1.2rem', opacity: 0.9 }}>
                    {order.serverName}
                  </p>
                </div>
              </div>

              {/* Items */}
              <div style={{ margin: '1.5rem 0' }}>
                {order.items.map((item, i) => (
                  <div key={i} style={{
                    background: 'rgba(255,255,255,0.15)',
                    padding: '1rem',
                    borderRadius: '12px',
                    margin: '0.75rem 0',
                    backdropFilter: 'blur(10px)'
                  }}>
                    <div style={{ fontSize: '1.8rem', fontWeight: 'bold' }}>
                      {item.qty} × {item.name}
                    </div>
                    {item.modifiers?.length > 0 && (
                      <p style={{ margin: '0.5rem 0', color: '#fbbf24' }}>
                        + {item.modifiers.join(', ')}
                      </p>
                    )}
                    {item.note && (
                      <p style={{ color: '#fca5a5', fontStyle: 'italic', margin: '0.5rem 0' }}>
                        "{item.note}"
                      </p>
                    )}
                  </div>
                ))}
              </div>

              {/* Order Note */}
              {order.orderNote && (
                <div style={{
                  background: 'rgba(0,0,0,0.3)',
                  padding: '1rem',
                  borderRadius: '12px',
                  margin: '1rem 0',
                  fontStyle: 'italic',
                  borderLeft: '5px solid #fbbf24'
                }}>
                  {order.orderNote}
                </div>
              )}

              {/* Action Buttons */}
              <div style={{ marginTop: '2rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                {order.status === 'new' && (
                  <button
                    onClick={() => markAsInProgress(order.id)}
                    style={{
                      padding: '1.5rem',
                      background: '#f59e0b',
                      color: 'white',
                      border: 'none',
                      borderRadius: '16px',
                      fontSize: '1.5rem',
                      fontWeight: 'bold',
                      cursor: 'pointer'
                    }}
                  >
                    START COOKING
                  </button>
                )}
                {order.status !== 'ready' && (
                  <button
                    onClick={() => markAsReady(order.id)}
                    style={{
                      padding: '1.5rem',
                      background: '#16a34a',
                      color: 'white',
                      border: 'none',
                      borderRadius: '16px',
                      fontSize: '1.5rem',
                      fontWeight: 'bold',
                      cursor: 'pointer'
                    }}
                  >
                    READY FOR PICKUP
                  </button>
                )}
                {order.status === 'ready' && (
                  <div style={{
                    padding: '1.5rem',
                    background: '#166534',
                    color: 'white',
                    borderRadius: '16px',
                    fontSize: '1.8rem',
                    fontWeight: 'bold',
                    textAlign: 'center'
                  }}>
                    READY
                  </div>
                )}
              </div>

              {/* Timestamp */}
              <p style={{
                textAlign: 'center',
                marginTop: '1rem',
                opacity: 0.8,
                fontSize: '1.1rem'
              }}>
                {new Date(order.timestamp).toLocaleTimeString()}
                {order.modified && ' → Modified'}
              </p>
            </div>
          ))
        )}
      </div>

      {/* Sound */}
      <audio ref={audioRef} preload="auto" />

      {/* Pulse Animation */}
      <style jsx>{`
        @keyframes pulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.7); }
          50% { box-shadow: 0 0 0 30px rgba(239, 68, 68, 0); }
        }
      `}</style>
    </div>
  );
}
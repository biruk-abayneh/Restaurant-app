// src/pages/server/components/MenuCategories.jsx
import React from 'react';

export default function MenuCategories({ menu, openCategory, toggleCategory, onCustomize }) {
  return (
    <div style={{ marginBottom: '2rem' }}>
      {menu.categories.map((cat) => (
        <div key={cat.id} className="card" style={{ marginBottom: '0.75rem' }}>
          <div
            onClick={() => toggleCategory(cat.id)}
            style={{
              padding: '0.75rem',
              background: '#f3f4f6',
              borderRadius: '0.375rem',
              cursor: 'pointer',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              fontWeight: '600',
            }}
          >
            <span>{cat.name}</span>
            <span style={{ fontSize: '1.2rem' }}>
              {openCategory === cat.id ? 'Down Arrow' : 'Right Arrow'}
            </span>
          </div>

          {openCategory === cat.id && (
            <div style={{ padding: '0.5rem 0' }}>
              {cat.items.length === 0 ? (
                <p style={{ color: '#6b7280', fontSize: '0.875rem', padding: '0.5rem' }}>
                  No items in this category
                </p>
              ) : (
                <div>
                  {cat.items.map((item) => (
                    <div
                      key={item.id}
                      style={{
                        padding: '0.75rem',
                        border: '1px solid #d1d5db',
                        borderRadius: '0.375rem',
                        margin: '0.5rem 0',
                        background: '#f9fafb',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}
                    >
                      <div style={{ flex: 1 }}>
                        <h3 style={{ fontWeight: '600', fontSize: '1.1rem' }}>{item.name}</h3>
                        <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>{item.description}</p>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{ fontWeight: 'bold', color: '#1f2937', minWidth: '60px', textAlign: 'right' }}>
                          ${item.price.toFixed(2)}
                        </div>
                        <button
                          onClick={() => onCustomize(item)}
                          style={{
                            background: '#6366f1',
                            color: 'white',
                            padding: '0.5rem 1rem',
                            borderRadius: '0.375rem',
                            fontWeight: '600',
                            fontSize: '0.875rem',
                            border: 'none',
                            cursor: 'pointer',
                          }}
                        >
                          Customize
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
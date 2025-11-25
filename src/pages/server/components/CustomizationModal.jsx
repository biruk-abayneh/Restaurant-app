// src/pages/server/components/CustomizationModal.jsx
import React from 'react';

export default function CustomizationModal({
    show,
    item,
    index,
    orderItems,
    noteInputRef,
    onConfirm,
    onClose,
}) {
    if (!show) return null;

    return (
        <div
            id="customization-modal"
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'rgba(0,0,0,0.5)',
                zIndex: 1000,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
            }}
            onClick={onClose}
        >
            <div
                style={{
                    background: 'white',
                    borderRadius: '0.5rem',
                    padding: '1.5rem',
                    width: '90%',
                    maxWidth: '400px',
                    maxHeight: '80vh',
                    overflowY: 'auto',
                }}
                onClick={(e) => e.stopPropagation()}
            >
                <h3 style={{ fontWeight: 'bold', marginBottom: '1rem' }}>{item.name}</h3>

                <div style={{ marginBottom: '1rem' }}>
                    <p style={{ fontWeight: '600', marginBottom: '0.5rem' }}>Modifiers:</p>
                    {['Spicy', 'Well Done', 'No Onions', 'Extra Cheese'].map((mod) => (
                        <label
                            key={mod}
                            style={{ display: 'block', margin: '0.5rem 0', fontSize: '0.9rem', cursor: 'pointer' }}
                        >
                            <input
                                type="checkbox"
                                defaultChecked={orderItems[index]?.modifiers?.includes(mod)}
                                style={{ marginRight: '0.5rem' }}
                            />
                            {mod}
                        </label>
                    ))}
                </div>

                <div style={{ marginBottom: '1rem' }}>
                    <label style={{ fontWeight: '600', display: 'block', marginBottom: '0.5rem' }}>
                        Special Request:
                    </label>
                    <textarea
                        ref={noteInputRef}
                        defaultValue={index !== null ? orderItems[index]?.note : ''}
                        placeholder="e.g., No onions, extra spicy"
                        style={{
                            width: '100%',
                            padding: '0.5rem',
                            borderRadius: '0.375rem',
                            border: '1px solid #d1d5db',
                            fontSize: '0.9rem',
                        }}
                        rows="3"
                    />
                </div>

                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button
                        onClick={onConfirm}
                        style={{
                            flex: 1,
                            padding: '0.75rem',
                            background: '#10b981',
                            color: 'white',
                            borderRadius: '0.375rem',
                            fontWeight: '600',
                            border: 'none',
                        }}
                    >
                        {index !== null ? 'Update' : 'Add to Order'}
                    </button>
                    <button
                        onClick={onClose}
                        style={{
                            flex: 1,
                            padding: '0.75rem',
                            background: '#ef4444',
                            color: 'white',
                            borderRadius: '0.375rem',
                            fontWeight: '600',
                            border: 'none',
                        }}
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
}
// src/pages/manager/MenuManager.jsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useMenu, useMenuAdmin } from '../../context/MenuContext';
import { useAuth } from '../../context/AuthContext';

export default function MenuManager() {
  const { menu } = useMenu();
  const { addCategory, deleteCategory, addItem, updateItem, deleteItem, toggleItem } = useMenuAdmin();
  const { user } = useAuth();

  const [newCatName, setNewCatName] = useState('');
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({ name: '', price: '', description: '', image: null });

  const handleAddCategory = () => {
    if (newCatName.trim()) {
      addCategory(newCatName.trim());
      setNewCatName('');
    }
  };

  const handleSaveItem = (catId, itemId = null) => {
    const item = {
      name: formData.name,
      price: parseFloat(formData.price) || 0,
      description: formData.description,
      image: formData.image ? URL.createObjectURL(formData.image) : '',
    };

    if (itemId) {
      updateItem(catId, itemId, item);
    } else {
      addItem(catId, item);
    }
    setEditingItem(null);
    setFormData({ name: '', price: '', description: '', image: null });
  };

  return (
    <div style={{ padding: '2rem', background: '#f9fafb', minHeight: '100vh' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>

        {/* NAVIGATION BAR */}
        <div style={{
          background: 'white',
          padding: '1.5rem 2rem',
          borderRadius: '16px',
          boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
          marginBottom: '2rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
            <Link to="/manager">
              <button style={{
                padding: '0.9rem 2rem',
                background: '#6366f1',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                fontWeight: 'bold',
                fontSize: '1.1rem',
                cursor: 'pointer'
              }}>
                Back to Dashboard
              </button>
            </Link>
            <h1 style={{ fontSize: '2.4rem', fontWeight: 'bold', color: '#1f2937', margin: 0 }}>
              Menu Management
            </h1>
          </div>
          <div style={{ color: '#6b7280', fontSize: '1.1rem' }}>
            Logged in as <strong>{user?.name || 'Manager'}</strong>
          </div>
        </div>

        {/* Add Category */}
        <div style={{ background: 'white', padding: '2rem', borderRadius: '16px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', marginBottom: '3rem' }}>
          <h3 style={{ fontSize: '1.8rem', marginBottom: '1rem' }}>Add New Category</h3>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <input
              value={newCatName}
              onChange={(e) => setNewCatName(e.target.value)}
              placeholder="e.g., Desserts, Drinks"
              style={{ flex: 1, padding: '1rem', borderRadius: '12px', border: '2px solid #e5e7eb' }}
            />
            <button onClick={handleAddCategory} style={{ padding: '1rem 2.5rem', background: '#10b981', color: 'white', borderRadius: '12px', fontWeight: 'bold' }}>
              Add Category
            </button>
          </div>
        </div>

        {/* Categories */}
        {menu.categories.map(cat => (
          <div key={cat.id} style={{ background: 'white', padding: '2.5rem', borderRadius: '20px', boxShadow: '0 15px 35px rgba(0,0,0,0.1)', marginBottom: '3rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
              <h2 style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#1f2937' }}>
                {cat.name}
              </h2>
              <button
                onClick={() => {
                  if (window.confirm(`Delete "${cat.name}" and all ${cat.items.length} items permanently?`)) {
                    deleteCategory(cat.id); // NO RELOAD → NO LOGOUT
                  }
                }}
                style={{
                  padding: '1rem 2rem',
                  background: '#ef4444',
                  color: 'white',
                  borderRadius: '12px',
                  fontWeight: 'bold',
                  border: 'none'
                }}
              >
                Delete Category
              </button>
            </div>

            {/* Add Item Button */}
            <button
              onClick={() => setEditingItem({ catId: cat.id })}
              style={{ padding: '1rem 2rem', background: '#3b82f6', color: 'white', borderRadius: '12px', marginBottom: '2rem', fontWeight: 'bold' }}
            >
              + Add Item
            </button>

            {/* Form & Items Grid (rest of your code) */}
            {editingItem?.catId === cat.id && (
              <div style={{ background: '#f3f4f6', padding: '2rem', borderRadius: '16px', marginBottom: '2rem' }}>
                <h3>Add/Edit Item</h3>
                <input placeholder="Name" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                <input placeholder="Price" type="number" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} />
                <textarea placeholder="Description" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
                <input type="file" onChange={e => setFormData({...formData, image: e.target.files[0]})} />
                <button onClick={() => handleSaveItem(cat.id, editingItem.itemId)}>Save</button>
                <button onClick={() => setEditingItem(null)}>Cancel</button>
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
              {cat.items.map(item => (
                <div key={item.id} style={{ border: '2px solid #e5e7eb', borderRadius: '16px', padding: '1.5rem' }}>
                  <h4>{item.name}</h4>
                  <p>${item.price.toFixed(2)}</p>
                  <button onClick={() => toggleItem(cat.id, item.id)}>
                    {item.enabled ? 'Hide' : 'Show'}
                  </button>
                  <button onClick={() => deleteItem(cat.id, item.id)}>Delete</button>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
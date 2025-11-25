// src/pages/manager/StaffManager.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';

export default function StaffManager() {
  const { user: currentUser } = useAuth();
  const [staff, setStaff] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingStaff, setEditingStaff] = useState(null);
  const [form, setForm] = useState({
    name: '',
    username: '',
    password: '',
    role: 'server'
  });

  // Load staff from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('restaurant-staff');
    if (saved) {
      setStaff(JSON.parse(saved));
    }
  }, []);

  // Save to localStorage
  const saveStaff = (updatedStaff) => {
    localStorage.setItem('restaurant-staff', JSON.stringify(updatedStaff));
    setStaff(updatedStaff);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (editingStaff) {
      // Edit existing
      const updated = staff.map(s =>
        s.id === editingStaff.id
          ? {
            ...s,
            name: form.name,
            username: form.username,
            role: form.role,
            ...(form.password && { password: form.password }) // Only update password if provided
          }
          : s
      );
      saveStaff(updated);
    } else {
      // Create new
      const newStaff = {
        id: Date.now().toString(),
        name: form.name,
        username: form.username,
        password: form.password, // ← CRITICAL: password saved
        role: form.role,
        createdBy: currentUser?.name || 'Manager',
        createdAt: new Date().toLocaleDateString()
      };
      saveStaff([...staff, newStaff]);
    }

    // Reset form
    setForm({ name: '', username: '', password: '', role: 'server' });
    setEditingStaff(null);
    setShowForm(false);
  };

  const handleEdit = (member) => {
    setForm({
      name: member.name,
      username: member.username,
      password: '', // Leave blank so they can keep current password
      role: member.role
    });
    setEditingStaff(member);
    setShowForm(true);
  };

  const handleDelete = (id) => {
    if (window.confirm('Delete this staff member permanently?')) {
      saveStaff(staff.filter(s => s.id !== id));
    }
  };

  return (
    <div style={{ padding: '2rem', background: '#f9fafb', minHeight: '100vh' }}>
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
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)',
              transition: 'all 0.2s'
            }}
              onMouseEnter={e => e.target.style.transform = 'translateY(-2px)'}
              onMouseLeave={e => e.target.style.transform = 'translateY(0)'}
            >
              ← Back to Dashboard
            </button>
          </Link>
          <h1 style={{ fontSize: '2.2rem', fontWeight: 'bold', color: '#1f2937', margin: 0 }}>
            {window.location.pathname.includes('staff') ? 'Staff Management' : 'Menu Management'}
          </h1>
        </div>

        <div style={{ color: '#6b7280', fontSize: '1.1rem' }}>
          Logged in as <strong>{useAuth().user?.name || 'Manager'}</strong>
        </div>
      </div>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '2.8rem', fontWeight: 'bold', color: '#1f2937' }}>
            Staff Management
          </h1>
          <button
            onClick={() => setShowForm(true)}
            style={{
              padding: '1rem 2rem',
              background: '#10b981',
              color: 'white',
              borderRadius: '12px',
              fontWeight: 'bold',
              fontSize: '1.1rem'
            }}
          >
            + Add New Staff
          </button>
        </div>

        {/* Add/Edit Form */}
        {showForm && (
          <div style={{
            background: 'white',
            padding: '2.5rem',
            borderRadius: '20px',
            boxShadow: '0 15px 35px rgba(0,0,0,0.1)',
            marginBottom: '3rem'
          }}>
            <h2 style={{ fontSize: '2rem', marginBottom: '2rem', color: '#1f2937' }}>
              {editingStaff ? 'Edit Staff Member' : 'Create New Staff Account'}
            </h2>
            <form onSubmit={handleSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Full Name</label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    required
                    style={{ width: '100%', padding: '1rem', borderRadius: '12px', border: '2px solid #e5e7eb', fontSize: '1rem' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Username</label>
                  <input
                    type="text"
                    value={form.username}
                    onChange={(e) => setForm({ ...form, username: e.target.value })}
                    required
                    disabled={!!editingStaff}
                    style={{ width: '100%', padding: '1rem', borderRadius: '12px', border: '2px solid #e5e7eb', fontSize: '1rem' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
                    {editingStaff ? 'New Password (leave blank to keep current)' : 'Password'}
                  </label>
                  <input
                    type="password"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    required={!editingStaff}
                    style={{ width: '100%', padding: '1rem', borderRadius: '12px', border: '2px solid #e5e7eb', fontSize: '1rem' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Role</label>
                  <select
                    value={form.role}
                    onChange={(e) => setForm({ ...form, role: e.target.value })}
                    style={{ width: '100%', padding: '1rem', borderRadius: '12px', border: '2px solid #e5e7eb', fontSize: '1rem' }}
                  >
                    <option value="server">Server</option>
                    <option value="manager">Manager</option>
                  </select>
                </div>
              </div>
              <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem' }}>
                <button
                  type="submit"
                  style={{ padding: '1rem 3rem', background: '#10b981', color: 'white', borderRadius: '12px', fontWeight: 'bold' }}
                >
                  {editingStaff ? 'Update Staff' : 'Create Account'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditingStaff(null);
                    setForm({ name: '', username: '', password: '', role: 'server' });
                  }}
                  style={{ padding: '1rem 2rem', background: '#6b7280', color: 'white', borderRadius: '12px' }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Staff List */}
        <div style={{ display: 'grid', gap: '1.5rem' }}>
          {staff.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '4rem', background: 'white', borderRadius: '20px', color: '#6b7280' }}>
              <p style={{ fontSize: '1.5rem' }}>No staff members yet. Create your first one!</p>
            </div>
          ) : (
            staff.map(member => (
              <div
                key={member.id}
                style={{
                  background: 'white',
                  padding: '2rem',
                  borderRadius: '20px',
                  boxShadow: '0 10px 25px rgba(0,0,0,0.08)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <div>
                  <h3 style={{ fontSize: '1.6rem', fontWeight: 'bold', margin: '0 0 0.5rem 0' }}>
                    {member.name}
                  </h3>
                  <p style={{ color: '#4b5563', margin: '0.25rem 0' }}>
                    @{member.username} • <strong>{member.role.toUpperCase()}</strong>
                  </p>
                  <small style={{ color: '#9ca3af' }}>
                    Created by {member.createdBy} on {member.createdAt}
                  </small>
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <button
                    onClick={() => handleEdit(member)}
                    style={{ padding: '0.75rem 1.5rem', background: '#3b82f6', color: 'white', borderRadius: '12px' }}
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(member.id)}
                    style={{ padding: '0.75rem 1.5rem', background: '#ef4444', color: 'white', borderRadius: '12px' }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
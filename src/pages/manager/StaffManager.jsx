// src/pages/manager/StaffManager.jsx — FINAL SUPABASE VERSION
import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';

export default function StaffManager() {
  const [staff, setStaff] = useState([]);
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('server');

  useEffect(() => {
    fetchStaff();
  }, []);

  const fetchStaff = async () => {
    const { data } = await supabase.from('staff').select('*').order('created_at', { ascending: false });
    setStaff(data || []);
  };

  const addStaff = async (e) => {
    e.preventDefault();
    const { error } = await supabase
      .from('staff')
      .insert({ name, username, password, role });

    if (!error) {
      setName(''); setUsername(''); setPassword('');
      fetchStaff();
    } else {
      alert("Error: " + error.message);
    }
  };

  const deleteStaff = async (id) => {
    await supabase.from('staff').delete().eq('id', id);
    fetchStaff();
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-8">Staff Management</h1>

        {/* Add New Staff */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <h2 className="text-2xl font-bold mb-6">Add New Staff</h2>
          <form onSubmit={addStaff} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <input placeholder="Name" value={name} onChange={e=>setName(e.target.value)} required className="p-4 border rounded-xl" />
            <input placeholder="Username" value={username} onChange={e=>setUsername(e.target.value)} required className="p-4 border rounded-xl" />
            <input placeholder="Password" type="password" value={password} onChange={e=>setPassword(e.target.value)} required className="p-4 border rounded-xl" />
            <select value={role} onChange={e=>setRole(e.target.value)} className="p-4 border rounded-xl">
              <option value="server">Server</option>
              <option value="manager">Manager</option>
            </select>
            <button type="submit" className="md:col-span-2 bg-green-600 text-white py-4 rounded-xl text-xl font-bold hover:bg-green-700">
              Add Staff Member
            </button>
          </form>
        </div>

        {/* Staff List */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h2 className="text-2xl font-bold mb-6">Current Staff</h2>
          <div className="space-y-4">
            {staff.map(s => (
              <div key={s.id} className="flex justify-between items-center p-6 border rounded-xl hover:bg-gray-50">
                <div>
                  <div className="text-xl font-bold">{s.name}</div>
                  <div className="text-gray-600">@{s.username} • {s.role.toUpperCase()}</div>
                </div>
                <button onClick={() => deleteStaff(s.id)} className="bg-red-600 text-white px-6 py-3 rounded-xl hover:bg-red-700">
                  Delete
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
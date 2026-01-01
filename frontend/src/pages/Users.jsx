import React, { useEffect, useState } from "react";
import { getUsers, updateUser } from "../services/api";

export default function Users() {
  const [users, setUsers] = useState([]);
  const [editing, setEditing] = useState(null);
  const [formData, setFormData] = useState({});

  useEffect(() => {
    getUsers().then(setUsers).catch(console.error);
  }, []);

  const handleEdit = (user) => {
    setEditing(user.id);
    setFormData({ ...user });
  };

  const handleSave = async () => {
    try {
      await updateUser(editing, formData);
      setUsers(users.map(u => u.id === editing ? formData : u));
      setEditing(null);
    } catch (err) { alert("Failed to update"); }
  };

  return (
    <div className="page-container">
      <div className="mb-8">
        <h1 className="page-title">Team Directory</h1>
        <p className="text-gray-500">Manage user roles and access.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {users.map(user => (
          <div key={user.id} className="glass-panel p-6 relative group">
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center text-blue-600 font-bold text-xl">
                {user.username.charAt(0).toUpperCase()}
              </div>
              <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${
                user.role === 'admin' ? 'bg-purple-100 text-purple-600' : 'bg-green-100 text-green-600'
              }`}>
                {user.role}
              </span>
            </div>

            {editing === user.id ? (
              <div className="space-y-3">
                <input 
                  className="input-glass text-sm" 
                  value={formData.username} 
                  onChange={e => setFormData({...formData, username: e.target.value})} 
                />
                <input 
                  className="input-glass text-sm" 
                  value={formData.email} 
                  onChange={e => setFormData({...formData, email: e.target.value})} 
                />
                <select 
                  className="input-glass text-sm"
                  value={formData.role}
                  onChange={e => setFormData({...formData, role: e.target.value})}
                >
                  <option value="member">Member</option>
                  <option value="admin">Admin</option>
                </select>
                <div className="flex gap-2 mt-2">
                  <button onClick={handleSave} className="flex-1 bg-blue-600 text-white py-1.5 rounded-lg text-sm">Save</button>
                  <button onClick={() => setEditing(null)} className="flex-1 bg-gray-200 text-gray-700 py-1.5 rounded-lg text-sm">Cancel</button>
                </div>
              </div>
            ) : (
              <div>
                <h3 className="font-bold text-gray-800 text-lg">{user.username}</h3>
                <p className="text-gray-500 text-sm mb-4">{user.email}</p>
                <button 
                  onClick={() => handleEdit(user)}
                  className="w-full py-2 rounded-lg border border-gray-200 text-gray-600 text-sm hover:bg-gray-50 transition-colors"
                >
                  Edit Profile
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
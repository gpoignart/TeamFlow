import React, { useEffect, useState } from "react";
import { getUsers, updateUser } from "../services/api";

export default function Users() {
  const [users, setUsers] = useState([]);
  const [editing, setEditing] = useState(null);
  const [formData, setFormData] = useState({});
  const [darkMode, setDarkMode] = useState(false);
  const [currentUser, setCurrentUser] = useState({});
  const [teams, setTeams] = useState([]);

  useEffect(() => {
    const savedPreferences = localStorage.getItem("preferences");
    if (savedPreferences) {
      setDarkMode(JSON.parse(savedPreferences).darkMode);
    }
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    setCurrentUser(user);

    // Load teams for filtering members
    const allTeams = JSON.parse(localStorage.getItem("teams") || "[]");
    const userTeams = allTeams.filter(
      t => t.owner === user.id || (t.members || []).some(m => m.email === user.email)
    );
    setTeams(userTeams);

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

  // Only show users who are in at least one of the current user's teams
  const filteredUsers = users.filter(user => {
    // Owner of any team the current user is in
    if (teams.some(team => team.owner === user.id)) return true;
    // Member of any team the current user is in
    if (teams.some(team => (team.members || []).some(m => m.email === user.email))) return true;
    // The current user themselves
    if (user.id === currentUser.id) return true;
    return false;
  });

  return (
    <div className="page-container">
      <div className="mb-8">
        <h1 className={`page-title ${darkMode ? 'text-white' : ''}`}>Team Members</h1>
        <p className={darkMode ? 'text-gray-400' : 'text-gray-500'}>Manage user roles and access within your teams.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredUsers.map(user => {
          const canEdit = user.id === currentUser.id || currentUser.role === "admin";
          return (
            <div key={user.id} className={`glass-panel p-6 relative group ${darkMode ? 'bg-gray-800 border-gray-700' : ''}`}>
              <div className="flex items-start justify-between mb-4">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-xl ${
                  darkMode 
                    ? 'bg-blue-900/30 text-blue-400' 
                    : 'bg-blue-100 to-blue-200 text-blue-600'
                }`}>
                  {user.username.charAt(0).toUpperCase()}
                </div>
                <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${
                  user.role === 'admin' 
                    ? darkMode ? 'bg-purple-900/30 text-purple-400' : 'bg-purple-100 text-purple-600' 
                    : darkMode ? 'bg-green-900/30 text-green-400' : 'bg-green-100 text-green-600'
                }`}>
                  {user.role}
                </span>
              </div>

              {editing === user.id ? (
                <div className="space-y-3">
                  <input 
                    className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm ${
                      darkMode
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                        : 'border-gray-300'
                    }`}
                    value={formData.username} 
                    onChange={e => setFormData({...formData, username: e.target.value})} 
                    disabled={user.id !== currentUser.id && currentUser.role !== "admin"}
                  />
                  <input 
                    className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm ${
                      darkMode
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                        : 'border-gray-300'
                    }`}
                    value={formData.email} 
                    onChange={e => setFormData({...formData, email: e.target.value})} 
                    disabled={user.id !== currentUser.id && currentUser.role !== "admin"}
                  />
                  <select 
                    className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm ${
                      darkMode
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'border-gray-300'
                    }`}
                    value={formData.role}
                    onChange={e => setFormData({...formData, role: e.target.value})}
                    disabled={currentUser.role !== "admin"}
                  >
                    <option value="member">Member</option>
                    <option value="admin">Admin</option>
                  </select>
                  <div className="flex gap-2 mt-2">
                    <button onClick={handleSave} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-1.5 rounded-lg text-sm">Save</button>
                    <button onClick={() => setEditing(null)} className={`flex-1 py-1.5 rounded-lg text-sm ${darkMode ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-700'}`}>Cancel</button>
                  </div>
                </div>
              ) : (
                <div>
                  <h3 className={`font-bold text-lg ${darkMode ? 'text-white' : 'text-gray-800'}`}>{user.username}</h3>
                  <p className={`text-sm mb-4 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{user.email}</p>
                  {canEdit && (
                    <button 
                      onClick={() => handleEdit(user)}
                      className={`w-full py-2 rounded-lg border text-sm hover:transition-colors ${
                        darkMode
                          ? 'border-gray-600 text-gray-300 hover:bg-gray-700'
                          : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      Edit Profile
                    </button>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
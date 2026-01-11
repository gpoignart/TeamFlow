import React, { useState, useEffect } from "react";

export default function CreateTaskModal({ isOpen, onClose, onCreate, initialData = {}, isEditMode = false }) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    priority: "medium",
    teamId: "",
    dueDate: "",
    ...initialData,
  });
  const [teams, setTeams] = useState([]);
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    // Load dark mode preference
    const savedPreferences = localStorage.getItem("preferences");
    if (savedPreferences) {
      setDarkMode(JSON.parse(savedPreferences).darkMode);
    }
    
    // Load teams from API for the team selector
    const loadTeams = async () => {
      try {
        const { getTeams } = await import('../services/api');
        const userTeams = await getTeams();
        setTeams(userTeams || []);
      } catch (error) {
        console.error('Error loading teams:', error);
        // Fallback to localStorage
        const user = JSON.parse(localStorage.getItem("user") || "{}");
        const allTeams = JSON.parse(localStorage.getItem("teams") || "[]");
        const userTeams = allTeams.filter(
          (t) => t.owner === user.id || (t.members || []).some((m) => m.email === user.email)
        );
        setTeams(userTeams);
      }
    };
    loadTeams();

    if (isOpen) {
      // Normalize dueDate to YYYY-MM-DD format for the date input
      let normalizedDueDate = "";
      if (initialData.dueDate) {
        normalizedDueDate = String(initialData.dueDate).split('T')[0];
      }
      
      setFormData({
        title: initialData.title || "",
        description: initialData.description || "",
        priority: initialData.priority || "medium",
        dueDate: normalizedDueDate,
        teamId: initialData.teamId || (userTeams[0]?.id || ""),
      });
    }
    // eslint-disable-next-line
  }, [initialData, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.title.trim() && formData.teamId) {
      onCreate(formData);
      setFormData({ title: "", description: "", priority: "medium", teamId: formData.teamId, dueDate: "" });
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className={`rounded-2xl shadow-2xl p-8 max-w-md w-full animate-slide-up ${
        darkMode ? 'bg-gray-800' : 'bg-white'
      }`}>
        <h2 className={`text-2xl font-bold mb-4 ${
          darkMode ? 'text-white' : 'text-gray-900'
        }`}>
          {isEditMode ? 'Edit Task' : 'Create New Task'}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className={`block text-sm font-semibold mb-2 ${
              darkMode ? 'text-gray-300' : 'text-gray-700'
            }`}>
              Title
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Task title"
              className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                darkMode 
                  ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                  : 'border-gray-300'
              }`}
              required
            />
          </div>
          <div>
            <label className={`block text-sm font-semibold mb-2 ${
              darkMode ? 'text-gray-300' : 'text-gray-700'
            }`}>
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Task description"
              rows="4"
              className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                darkMode 
                  ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                  : 'border-gray-300'
              }`}
            />
          </div>
          <div>
            <label className={`block text-sm font-semibold mb-2 ${
              darkMode ? 'text-gray-300' : 'text-gray-700'
            }`}>
              Priority
            </label>
            <select
              name="priority"
              value={formData.priority}
              onChange={handleChange}
              className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                darkMode 
                  ? 'bg-gray-700 border-gray-600 text-white'
                  : 'border-gray-300'
              }`}
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>
          <div>
            <label className={`block text-sm font-semibold mb-2 ${
              darkMode ? 'text-gray-300' : 'text-gray-700'
            }`}>
              Team
            </label>
            <select
              name="teamId"
              value={formData.teamId}
              onChange={handleChange}
              className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                darkMode 
                  ? 'bg-gray-700 border-gray-600 text-white'
                  : 'border-gray-300'
              }`}
              required
            >
              <option value="" disabled>Select a team</option>
              {teams.map((team) => (
                <option key={team.id} value={team.id}>{team.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className={`block text-sm font-semibold mb-2 ${
              darkMode ? 'text-gray-300' : 'text-gray-700'
            }`}>
              Due Date (Échéance)
            </label>
            <input
              type="date"
              name="dueDate"
              value={formData.dueDate}
              onChange={handleChange}
              className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                darkMode 
                  ? 'bg-gray-700 border-gray-600 text-white'
                  : 'border-gray-300'
              }`}
            />
          </div>
          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              className="flex-1 bg-blue-600 text-white font-bold py-2.5 rounded-lg hover:bg-blue-700 transition-all"
            >
              {isEditMode ? 'Save Changes' : 'Create Task'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className={`flex-1 font-bold py-2.5 rounded-lg transition-all ${
                darkMode
                  ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

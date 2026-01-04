import React, { useState, useEffect } from 'react';
import '../styles/taskcard.css';

export default function TaskCard({ task, onStatusChange }) {
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const savedPreferences = localStorage.getItem('preferences');
    if (savedPreferences) {
      setDarkMode(JSON.parse(savedPreferences).darkMode);
    }
  }, []);

  const statusOptions = ['todo', 'in-progress', 'done'];
  
  const statusStyles = {
    todo: 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-200 border border-red-200 dark:border-red-700/80',
    'in-progress': 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/50 dark:text-yellow-200 border border-yellow-200 dark:border-yellow-700/80',
    done: 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-200 border border-green-200 dark:border-green-700/80'
  };

  const statusLabels = {
    todo: 'To Do',
    'in-progress': 'In Progress',
    done: 'Done'
  };

  // Fix: Only show date if valid, otherwise show "-"
  let displayDate = "-";
  if (task.createdAt) {
    const d = new Date(task.createdAt);
    if (!isNaN(d.getTime())) {
      displayDate = d.toLocaleDateString();
    }
  }

  return (
    <div className={`rounded-lg p-4 border shadow-sm hover:shadow-md transition-all duration-200 cursor-grab active:cursor-grabbing group animate-scale-up ${
      darkMode 
        ? 'bg-gray-700 border-gray-600 text-white hover:border-gray-500' 
        : 'bg-white border-gray-200 text-gray-900 hover:border-blue-200'
    }`}>
      <div className="flex items-start justify-between mb-3">
        <h4 className={`font-semibold flex-1 group-hover:text-blue-600 transition-colors ${
          darkMode
            ? 'text-white group-hover:text-blue-400'
            : 'text-gray-800'
        }`}>
          {task.title}
        </h4>
        <select
          value={task.status}
          onChange={(e) => onStatusChange(task, e.target.value)}
          className={`text-xs font-bold px-2.5 py-1 rounded border cursor-pointer transition-all duration-300 hover:scale-105 ${
            statusStyles[task.status]
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          {statusOptions.map((status) => (
            <option key={status} value={status}>
              {statusLabels[status]}
            </option>
          ))}
        </select>
      </div>

      <p className={`text-sm mb-3 line-clamp-2 transition-colors ${
        darkMode 
          ? 'text-gray-300' 
          : 'text-gray-600'
      }`}>{task.description}</p>

      <div className={`flex items-center justify-between text-xs transition-colors ${
        darkMode
          ? 'text-gray-400'
          : 'text-gray-500'
      }`}>
        <span>👤 {task.assignedTo || 'Unassigned'}</span>
        <span>{displayDate}</span>
      </div>
    </div>
  );
}
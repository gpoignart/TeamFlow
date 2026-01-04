import React, { useEffect, useMemo, useState } from "react";
import { getTasks, updateTask, createTask, deleteTask } from "../services/api";
import TaskCard from "../components/TaskCard";
import CreateTaskModal from "../components/CreateTaskModal";
import "../styles/tasks.css";

export default function Tasks() {
  const [tasks, setTasks] = useState([]);
  const [q, setQ] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [draggedTask, setDraggedTask] = useState(null);
  const [dragOverColumn, setDragOverColumn] = useState(null);
  const [teams, setTeams] = useState([]);
  const [selectedTeamId, setSelectedTeamId] = useState("");

  useEffect(() => {
    const savedPreferences = localStorage.getItem("preferences");
    if (savedPreferences) {
      setDarkMode(JSON.parse(savedPreferences).darkMode);
    }
    // Load teams
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    const allTeams = JSON.parse(localStorage.getItem("teams") || "[]");
    // User is member if owner or in members
    const userTeams = allTeams.filter(
      t => t.owner === user.id || (t.members || []).some(m => m.email === user.email)
    );
    setTeams(userTeams);
    if (userTeams.length > 0) setSelectedTeamId(userTeams[0].id);
  }, []);

  // When selectedTeamId changes, reset filters and reload tasks
  useEffect(() => {
    setQ("");
    setStatusFilter("");
    if (selectedTeamId) {
      loadTasks();
    }
    // eslint-disable-next-line
  }, [selectedTeamId, isModalOpen]);

  const loadTasks = async () => {
    try {
      const data = await getTasks();
      // Only show tasks for the selected team, and ensure teamId is always a string for comparison
      setTasks(Array.isArray(data) ? data.filter(t => String(t.teamId) === String(selectedTeamId)) : []);
    } catch (e) {
      console.error(e);
    }
  };

  const handleCreate = async (taskData) => {
    const user = JSON.parse(localStorage.getItem('user'));
    // Always set teamId explicitly
    const newTask = { 
        ...taskData, 
        assignedTo: user.username,
        userAllowedIds: [user.id],
        teamId: selectedTeamId // ensure teamId is set
    };
    await createTask(newTask);
    // Always reload tasks after creation
    setTimeout(loadTasks, 100); // slight delay in case of async storage
  };

  const handleStatusChange = async (task, newStatus) => {
    const updated = { ...task, status: newStatus };
    setTasks(prev => prev.map(t => t.id === task.id ? updated : t));
    
    try {
      await updateTask(updated);
    } catch {
      setTasks(prev => prev.map(t => t.id === task.id ? task : t));
    }
  };

  const handleDelete = async (taskId) => {
    if (!window.confirm("Are you sure you want to delete this task?")) return;
    await deleteTask(taskId);
    loadTasks();
  };

  // Drag and Drop Handlers
  const handleDragStart = (e, task) => {
    setDraggedTask(task);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/html", e.currentTarget);
  };

  const handleDragOver = (e, columnStatus) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDragOverColumn(columnStatus);
  };

  const handleDragLeave = () => {
    setDragOverColumn(null);
  };

  const handleDrop = async (e, columnStatus) => {
    e.preventDefault();
    setDragOverColumn(null);
    
    if (draggedTask && draggedTask.status !== columnStatus) {
      await handleStatusChange(draggedTask, columnStatus);
    }
    setDraggedTask(null);
  };

  const filteredTasks = useMemo(() => {
    return tasks.filter(t => {
      if (statusFilter && t.status !== statusFilter) return false;
      if (q && !t.title.toLowerCase().includes(q.toLowerCase())) return false;
      return true;
    });
  }, [tasks, q, statusFilter]);

  const columns = {
    todo: filteredTasks.filter(t => t.status === 'todo'),
    'in-progress': filteredTasks.filter(t => t.status === 'in-progress'),
    done: filteredTasks.filter(t => t.status === 'done'),
  };

  const columnConfig = [
    { key: 'todo', label: 'To do', color: 'red' },
    { key: 'in-progress', label: 'In progress', color: 'yellow' },
    { key: 'done', label: 'Done', color: 'green' },
  ];

  return (
    <div className="tasks-page">
      <div className="tasks-header">
        <h1 className={`mt-6 tasks-title ${darkMode ? 'text-white' : 'text-black'}`}>Task board</h1>
        <div className="mt-2">
          <label className={`mr-2 font-semibold ${darkMode ? "text-gray-300" : "text-gray-700"}`}>Team:</label>
          <select
            className={`px-3 py-2 rounded-lg border ${darkMode ? "bg-gray-800 border-gray-700 text-white" : "bg-white border-gray-300"}`}
            value={selectedTeamId}
            onChange={e => setSelectedTeamId(e.target.value)}
          >
            {teams.map(team => (
              <option key={team.id} value={team.id}>{team.name}</option>
            ))}
          </select>
        </div>
      </div>

      <div className={`filters-bar ${darkMode ? 'dark-mode' : ''}`}>
        <div className="relative">
            <span className={`absolute left-3 top-1/2 -translate-y-1/2 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>🔍</span>
            <input
            className={`search-input pl-10 transition-smooth ${darkMode ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500' : ''}`}
            placeholder="Search a task..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
            />
        </div>

        <select 
            className={`filter-select transition-smooth ${darkMode ? 'bg-gray-800 border-gray-700 text-white' : ''}`}
            value={statusFilter} 
            onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="">All status</option>
          <option value="todo">To do</option>
          <option value="in-progress">In progress</option>
          <option value="done">Done</option>
        </select>

        <button className={`btn-add-task transition-smooth hover:scale-105 ${darkMode ? 'bg-blue-700 hover:bg-blue-800' : ''}`} onClick={() => setIsModalOpen(true)}>
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
          New Task
        </button>
      </div>

      <div className="columns-container">
        {columnConfig.map(({ key, label, color }) => (
          <div 
            key={key}
            className={`task-column col-${color} ${darkMode ? 'bg-gray-800 border-gray-700' : ''} transition-colors duration-300 ${
              dragOverColumn === key ? 'ring-2 ring-blue-400 ring-offset-2 dark:ring-offset-gray-900' : ''
            }`}
            onDragOver={(e) => handleDragOver(e, key)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, key)}
          >
            <div className={`column-header ${darkMode ? 'bg-gray-700/50 border-gray-700 text-white' : ''} transition-colors duration-300`}>
              <span>{label}</span>
              <span className={`task-count text-${color}-600`}>{columns[key].length}</span>
            </div>
            <div className="column-body">
              {columns[key].map(t => (
                <div
                  key={t.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, t)}
                  className={`cursor-grab active:cursor-grabbing transition-all duration-200 ${
                    draggedTask?.id === t.id ? 'opacity-50 scale-95' : 'hover:scale-102'
                  }`}
                >
                  <div className="relative">
                    <TaskCard task={t} onStatusChange={handleStatusChange} />
                    <button
                      onClick={() => handleDelete(t.id)}
                      title="Delete Task"
                      className="absolute top-2 right-2 bg-red-500 hover:bg-red-700 text-white rounded-full w-7 h-7 flex items-center justify-center shadow transition-all"
                      style={{ zIndex: 2 }}
                    >
                      &times;
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <CreateTaskModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onCreate={handleCreate} 
        initialData={{ teamId: selectedTeamId }}
      />
    </div>
  );
}
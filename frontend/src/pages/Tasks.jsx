import React, { useEffect, useMemo, useState } from "react";
import { getTasks, updateTask, createTask } from "../services/api";
import TaskCard from "../components/TaskCard";
import CreateTaskModal from "../components/CreateTaskModal";
import "../styles/tasks.css";

export default function Tasks() {
  const [tasks, setTasks] = useState([]);
  const [q, setQ] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    try {
      const data = await getTasks();
      setTasks(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
    }
  };

  const handleCreate = async (taskData) => {
    const user = JSON.parse(localStorage.getItem('user'));
    const newTask = { 
        ...taskData, 
        assignedTo: user.username,
        userAllowedIds: [user.id] 
    };
    await createTask(newTask);
    loadTasks();
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

  return (
    <div className="tasks-page">
      <div className="tasks-header">
        <h1 className="tasks-title">Task board</h1>
      </div>

      <div className="filters-bar">
        {/* Search */}
        <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
            <input
            className="search-input pl-10"
            placeholder="Search a task..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
            />
        </div>

        {/* Status filter */}
        <select 
            className="filter-select"
            value={statusFilter} 
            onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="">All status</option>
          <option value="todo">To do</option>
          <option value="in-progress">In progress</option>
          <option value="done">Done</option>
        </select>

        {/* Button Add */}
        <button className="btn-add-task" onClick={() => setIsModalOpen(true)}>
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
          New Task
        </button>
      </div>

      <div className="columns-container">
        {/* Colonne TO DO */}
        <div className="task-column col-todo">
          <div className="column-header">
            <span>To do</span>
            <span className="task-count text-red-600">{columns.todo.length}</span>
          </div>
          <div className="column-body">
            {columns.todo.map(t => <TaskCard key={t.id} task={t} onStatusChange={handleStatusChange} />)}
          </div>
        </div>

        {/* Colonne IN PROGRESS */}
        <div className="task-column col-progress">
          <div className="column-header">
            <span>In progress</span>
            <span className="task-count text-yellow-600">{columns['in-progress'].length}</span>
          </div>
          <div className="column-body">
            {columns['in-progress'].map(t => <TaskCard key={t.id} task={t} onStatusChange={handleStatusChange} />)}
          </div>
        </div>

        {/* Colonne DONE */}
        <div className="task-column col-done">
          <div className="column-header">
            <span>Dibe</span>
            <span className="task-count text-green-600">{columns.done.length}</span>
          </div>
          <div className="column-body">
            {columns.done.map(t => <TaskCard key={t.id} task={t} onStatusChange={handleStatusChange} />)}
          </div>
        </div>
      </div>

      <CreateTaskModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onCreate={handleCreate} 
      />
    </div>
  );
}
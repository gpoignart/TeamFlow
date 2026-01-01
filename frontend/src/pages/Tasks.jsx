import React, { useEffect, useMemo, useState } from "react";
import { getTasks, updateTask, createTask } from "../services/api";
import TaskCard from "../components/TaskCard";
import CreateTaskModal from "../components/CreateTaskModal";
import "../styles/tasks.css"; // Import du fichier CSS coloré

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
    // On assigne la tâche à l'utilisateur courant pour qu'il puisse la voir
    const newTask = { 
        ...taskData, 
        assignedTo: user.username,
        userAllowedIds: [user.id] 
    };
    await createTask(newTask);
    loadTasks();
  };

  const handleStatusChange = async (task, newStatus) => {
    // Mise à jour optimiste (immédiate sur l'interface)
    const updated = { ...task, status: newStatus };
    setTasks(prev => prev.map(t => t.id === task.id ? updated : t));
    
    try {
      await updateTask(updated);
    } catch {
      // Revert en cas d'erreur
      setTasks(prev => prev.map(t => t.id === task.id ? task : t));
    }
  };

  // Filtrage
  const filteredTasks = useMemo(() => {
    return tasks.filter(t => {
      if (statusFilter && t.status !== statusFilter) return false;
      if (q && !t.title.toLowerCase().includes(q.toLowerCase())) return false;
      return true;
    });
  }, [tasks, q, statusFilter]);

  // Groupement par colonne
  const columns = {
    todo: filteredTasks.filter(t => t.status === 'todo'),
    'in-progress': filteredTasks.filter(t => t.status === 'in-progress'),
    done: filteredTasks.filter(t => t.status === 'done'),
  };

  return (
    <div className="tasks-page">
      <div className="tasks-header">
        <h1 className="tasks-title">Tableau de Bord</h1>
      </div>

      <div className="filters-bar">
        {/* Recherche */}
        <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
            <input
            className="search-input pl-10"
            placeholder="Rechercher une tâche..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
            />
        </div>

        {/* Filtre Statut */}
        <select 
            className="filter-select"
            value={statusFilter} 
            onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="">Tous les statuts</option>
          <option value="todo">À faire</option>
          <option value="in-progress">En cours</option>
          <option value="done">Terminé</option>
        </select>

        {/* Bouton Ajouter */}
        <button className="btn-add-task" onClick={() => setIsModalOpen(true)}>
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
          Nouvelle Tâche
        </button>
      </div>

      <div className="columns-container">
        {/* Colonne TO DO */}
        <div className="task-column col-todo">
          <div className="column-header">
            <span>À faire</span>
            <span className="task-count text-red-600">{columns.todo.length}</span>
          </div>
          <div className="column-body">
            {columns.todo.map(t => <TaskCard key={t.id} task={t} onStatusChange={handleStatusChange} />)}
          </div>
        </div>

        {/* Colonne IN PROGRESS */}
        <div className="task-column col-progress">
          <div className="column-header">
            <span>En cours</span>
            <span className="task-count text-yellow-600">{columns['in-progress'].length}</span>
          </div>
          <div className="column-body">
            {columns['in-progress'].map(t => <TaskCard key={t.id} task={t} onStatusChange={handleStatusChange} />)}
          </div>
        </div>

        {/* Colonne DONE */}
        <div className="task-column col-done">
          <div className="column-header">
            <span>Terminé</span>
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
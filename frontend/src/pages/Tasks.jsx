import React, { useEffect, useMemo, useState } from "react";
import { getTasks, updateTask } from "../services/api";
import TaskCard from "../components/TaskCard";
import "../styles/tasks.css";

const STATUS_ORDER = ["todo", "in-progress", "done"];
const STATUS_LABELS = {
  todo: "To Do",
  "in-progress": "In Progress",
  done: "Done",
};

export default function Tasks() {
  const [tasks, setTasks] = useState([]);
  const [q, setQ] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [assigneeFilter, setAssigneeFilter] = useState("");

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    const data = await getTasks();
    setTasks(Array.isArray(data) ? data : []);
  };

  const assignees = useMemo(() => {
    const s = new Set();
    tasks.forEach((t) => t.assignee && s.add(t.assignee));
    return [...s];
  }, [tasks]);

  const filtered = useMemo(() => {
    return tasks.filter((t) => {
      if (statusFilter && t.status !== statusFilter) return false;
      if (assigneeFilter && t.assignee !== assigneeFilter) return false;
      if (q && !`${t.title} ${t.description}`.toLowerCase().includes(q.toLowerCase()))
        return false;
      return true;
    });
  }, [tasks, q, statusFilter, assigneeFilter]);

  const grouped = useMemo(() => {
    const m = { todo: [], "in-progress": [], done: [] };
    filtered.forEach((t) => m[t.status]?.push(t));
    return m;
  }, [filtered]);

  const handleStatusChange = async (task, newStatus) => {
    const updated = { ...task, status: newStatus };
    setTasks((prev) => prev.map((t) => (t.id === task.id ? updated : t)));
    try {
      await updateTask(updated);
      fetchTasks();
    } catch (err) {
      setTasks((prev) => prev.map((t) => (t.id === task.id ? task : t)));
      console.error(err);
    }
  };

  return (
    <div className="tasks-page">
      <h1 className="tasks-title">Task Board</h1>

      <div className="filters">
        <input
          className="search-input"
          placeholder="🔍 Search..."
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="">All status</option>
          <option value="todo">To Do</option>
          <option value="in-progress">In Progress</option>
          <option value="done">Done</option>
        </select>
        <select value={assigneeFilter} onChange={(e) => setAssigneeFilter(e.target.value)}>
          <option value="">All assignees</option>
          {assignees.map((a) => (
            <option key={a} value={a}>{a}</option>
          ))}
        </select>
        <button className="btn-refresh" onClick={fetchTasks}>Refresh</button>
      </div>

      <div className="columns-wrap">
        {STATUS_ORDER.map((status) => (
          <div key={status} className={`task-column column--${status}`}>
            <div className="column-header">{STATUS_LABELS[status]}</div>
            <div className="column-body">
              {grouped[status].length === 0 ? (
                <div className="no-tasks">No tasks</div>
              ) : (
                grouped[status].map((t) => (
                  <TaskCard key={t.id} task={t} onStatusChange={handleStatusChange} />
                ))
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

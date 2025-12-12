import React from 'react';
import '../styles/taskcard.css';

const statusLabels = {
  'todo': 'To Do',
  'in-progress': 'In Progress',
  'done': 'Done',
};

const priorityColors = {
  low: '#9ae6b4',
  medium: '#fbd38d',
  high: '#feb2b2',
};

export default function TaskCard({ task, onStatusChange, compact = false }) {
  if (!task) return null;
  const { title, description, assignee, status, priority, dueDate } = task;

  const handleChange = (e) => {
    const newStatus = e.target.value;
    if (onStatusChange) onStatusChange(task, newStatus);
  };

  return (
    <div className={`task-card ${compact ? 'compact' : ''}`}>
      <div className="task-card-header">
        <div className="task-title">{title}</div>

        <div className="task-meta">
          {priority && (
            <div
              className="priority-chip"
              style={{ background: priorityColors[priority] || '#e2e8f0' }}
            >
              {priority}
            </div>
          )}

          <select
            className="status-select"
            value={status || 'todo'}
            onChange={handleChange}
            aria-label="Change status"
          >
            <option value="todo">{statusLabels['todo']}</option>
            <option value="in-progress">{statusLabels['in-progress']}</option>
            <option value="done">{statusLabels['done']}</option>
          </select>
        </div>
      </div>

      {!compact && (
        <div className="task-card-body">
          {description && <div className="task-desc">{description}</div>}

          <div className="task-footer">
            <div className="task-assignee">{assignee ? `👤 ${assignee}` : null}</div>
            <div className="task-due">{dueDate ? `Due: ${new Date(dueDate).toLocaleDateString()}` : null}</div>
          </div>
        </div>
      )}
    </div>
  );
}

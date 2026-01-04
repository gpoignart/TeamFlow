// backend/models/Task.js
const { db } = require("../db");

/**
 * filterTasks({ userId, status, assignedTo, search })
 * - Expects db.read() to have already been called by the caller (routes/tasks.js does this).
 * - Returns an array of tasks filtered by:
 *    - userAllowedIds includes userId (if provided)
 *    - status (if provided)
 *    - assignedTo (if provided)
 *    - search (text matched against title, description, assignedTo)
 */
function filterTasks({ userId, status, assignedTo, search } = {}) {
  const tasks = Array.isArray(db.data && db.data.tasks) ? db.data.tasks : [];

  const q = search ? String(search).trim().toLowerCase() : null;

  return tasks.filter(t => {
    // only return tasks visible to the user if userId provided
    if (userId) {
      const allowed = Array.isArray(t.userAllowedIds)
        ? t.userAllowedIds.map(String).includes(String(userId))
        : false;
      if (!allowed) return false;
    }

    if (status && String(t.status) !== String(status)) return false;

    if (assignedTo && String(t.assignedTo) !== String(assignedTo)) return false;

    if (q) {
      const hay = `${t.title || ""} ${t.description || ""} ${t.assignedTo || ""}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }

    return true;
  });
}

class Task {
  constructor({ id, title, description, status, assignedTo, userAllowedIds = [], priority, dueDate, subtasks = [], teamId }) {
    this.id = id;
    this.title = title;
    this.description = description;
    this.status = status || 'todo';
    this.assignedTo = assignedTo || null;
    this.userAllowedIds = userAllowedIds;
    this.priority = priority || 'medium';
    this.dueDate = dueDate || null;
    this.subtasks = subtasks;
    this.teamId = teamId || null;
  }
}

module.exports = Task;

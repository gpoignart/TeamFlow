// frontend/src/services/api.js

const API_BASE_URL = "http://localhost:5000";

const getToken = () => localStorage.getItem("token");

const api = async (endpoint, options = {}) => {
  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  if (getToken()) {
    headers["Authorization"] = `Bearer ${getToken()}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    throw new Error(`API Error: ${response.statusText}`);
  }

  return response.json();
};

// Auth
export const login = (credentials) =>
  api("/auth/login", { method: "POST", body: JSON.stringify(credentials) });

export const register = (data) =>
  api("/auth/register", { method: "POST", body: JSON.stringify(data) });

// Stats
export const getStats = () => api("/stats");

// Tasks
export const getTasks = () => api("/tasks");

export const createTask = (taskData) =>
  api("/tasks", { method: "POST", body: JSON.stringify(taskData) });

export const updateTask = (task) =>
  api(`/tasks/${task.id}`, { method: "PUT", body: JSON.stringify(task) });

export const deleteTask = (taskId) =>
  api(`/tasks/${taskId}`, { method: "DELETE" });

// Users
export const getUsers = () => api("/users");

export const updateUser = (userId, userData) =>
  api(`/users/${userId}`, { method: "PUT", body: JSON.stringify(userData) });

// Messages
export const getMessages = (teamId) =>
  api(`/messages${teamId ? `?teamId=${encodeURIComponent(teamId)}` : ""}`);

export const sendMessage = (content, teamId) =>
  api("/messages", { method: "POST", body: JSON.stringify({ content, teamId }) });

// Teams
export const getTeams = (scope) => api(`/teams${scope ? `?scope=${scope}` : ""}`);

export const getAllTeams = () => api("/teams?scope=all");

export const createTeam = (teamData) =>
  api("/teams", { method: "POST", body: JSON.stringify(teamData) });

export const updateTeam = (teamId, teamData) =>
  api(`/teams/${teamId}`, { method: "PUT", body: JSON.stringify(teamData) });

export const deleteTeam = (teamId) =>
  api(`/teams/${teamId}`, { method: "DELETE" });

export const joinTeam = (code) =>
  api("/teams/join", { method: "POST", body: JSON.stringify({ code }) });

// frontend/src/services/api.js

import { getAuthToken } from './auth'; 

const API_BASE = 'http://localhost:5000';

/**
 * Helper to add the "Authorization: Bearer <token>" header automatically
 */
const getAuthHeaders = () => {
    const token = getAuthToken(); 
    const headers = {
        'Content-Type': 'application/json',
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    } else {
        console.warn("API Warning: No auth token found in localStorage.");
    }
    
    return headers;
};

async function handleResponse(res) {
  const text = await res.text();
  let data;
  try {
    data = text ? JSON.parse(text) : null;
  } catch (e) {
    data = text;
  }

  if (!res.ok) {
    // If error is 401 (Unauthorized), it might mean the token expired.
    if (res.status === 401) {
        console.error("Authentication failed. You may need to log in again.");
    }
    
    const errorMsg = (data && data.message) ? data.message : res.statusText;
    throw new Error(errorMsg);
  }
  return data;
}

// --- TASKS ---
export async function getTasks() {
  const res = await fetch(`${API_BASE}/tasks`, {
    method: 'GET',
    headers: getAuthHeaders(), // <--- This authenticates the request
  });
  return handleResponse(res);
}

export async function updateTask(task) {
  const res = await fetch(`${API_BASE}/tasks/${task.id}`, { 
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(task),
  });
  return handleResponse(res);
}

/**
 * POST /tasks: Creates a new task.
 */
export async function createTask(task) {
  const res = await fetch(`${API_BASE}/tasks`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(task),
  });
  return handleResponse(res);
}

// --- MESSAGES ---
export const getMessages = async () => {
    const res = await fetch(`${API_BASE}/messages`, {
        method: 'GET',
        headers: getAuthHeaders(),
    });
    return handleResponse(res);
};

export const sendMessage = async (content) => {
    const res = await fetch(`${API_BASE}/messages`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ content }),
    });
    return handleResponse(res);
};

// --- USERS ---
export const getUsers = async () => {
    const res = await fetch(`${API_BASE}/users`, {
        method: 'GET',
        headers: getAuthHeaders(),
    });
    return handleResponse(res);
};

export const updateUser = async (id, data) => {
    const res = await fetch(`${API_BASE}/users/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
    });
    return handleResponse(res);
};

// --- STATS ---
export const getStats = async () => {
    const res = await fetch(`${API_BASE}/stats`, {
        method: 'GET',
        headers: getAuthHeaders(),
    });
    return handleResponse(res);
};


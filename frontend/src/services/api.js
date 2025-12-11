// frontend/services/api.js

import { getAuthToken } from './auth'; 

const API_BASE = (typeof process !== 'undefined' && process.env && process.env.REACT_APP_API_BASE) 
    ? process.env.REACT_APP_API_BASE 
    : 'http://localhost:5000';

/**
 * Builds headers for authenticated requests (includes JWT).
 */
const getAuthHeaders = () => {
    const token = getAuthToken(); 
    
    const headers = {
        'Content-Type': 'application/json',
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }
    
    return headers;
};

/**
 * Handles API response processing (JSON parsing, error handling).
 */
async function handleResponse(res) {
  const text = await res.text();
  let data;
  try {
    data = text ? JSON.parse(text) : null;
  } catch (e) {
    data = text;
  }
  if (!res.ok) {
    const err = new Error(data && data.message ? data.message : res.statusText || 'API Error');
    err.status = res.status;
    err.data = data;
    throw err;
  }
  return data;
}

// ====================================================================
// --- TASK MANAGEMENT FUNCTIONS (UPDATED with AUTH) ---
// ====================================================================

/**
 * GET /tasks: Fetches tasks.
 */
export async function getTasks() {
  const res = await fetch(`${API_BASE}/tasks`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });
  return handleResponse(res);
}

/**
 * PUT /tasks/:id: Updates an existing task.
 */
export async function updateTask(task) {
  // Assumes the task object contains the ID
  const res = await fetch(`${API_BASE}/tasks/${task.id}`, { 
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(task),
  });
  return handleResponse(res);
}

// ====================================================================
// --- MESSAGE FUNCTIONS (NEW - Member 12) ---
// ====================================================================

/**
 * GET /messages: Fetches the list of team messages.
 */
export const getMessages = async () => {
    const response = await fetch(`${API_BASE}/messages`, {
        method: 'GET',
        headers: getAuthHeaders(),
    });

    return handleResponse(response);
};

/**
 * POST /messages: Sends a new message.
 */
export const sendMessage = async (content) => {
    const response = await fetch(`${API_BASE}/messages`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ content }),
    });

    return handleResponse(response);
};

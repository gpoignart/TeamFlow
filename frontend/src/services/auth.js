// ----------------------------------------------------------------------------
// THIS PART IS NOT READY YET, NEED TO BE VERIFIED AND REWORK BY MEMBER 8 !!!!
// It was coded for further work of member 12
// ----------------------------------------------------------------------------

// frontend/services/auth.js

const TOKEN_KEY = 'teamflow_jwt';

/**
 * Retrieves the stored JWT from localStorage.
 * Used by the API service to include the token in requests.
 * @returns {string | null} The JWT or null if not found.
 */
export const getAuthToken = () => {
    return localStorage.getItem(TOKEN_KEY);
};

/**
 * Stores the JWT after a successful login.
 * @param {string} token - The JWT to be stored.
 */
export const storeAuthToken = (token) => {
    localStorage.setItem(TOKEN_KEY, token);
};

/**
 * Removes the JWT and logs the user out.
 */
export const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    // NOTE: Member 7 (App.jsx) is responsible for handling the actual 
    // redirection to the login page after calling this function.
};

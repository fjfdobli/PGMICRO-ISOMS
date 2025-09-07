// API client for communicating with the backend
const API_BASE_URL = 'http://localhost:3002/api';

// Helper function to get auth token from localStorage
const getAuthToken = () => {
  return localStorage.getItem('authToken');
};

// Helper function to create request headers
const createHeaders = (includeAuth = false) => {
  const headers = {
    'Content-Type': 'application/json',
  };

  if (includeAuth) {
    const token = getAuthToken();
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
  }

  return headers;
};

// Helper function to handle API responses
const handleResponse = async (response) => {
  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.error || `HTTP error! status: ${response.status}`);
  }
  
  return data;
};

// Authentication API calls
export const authAPI = {
  // Login user
  login: async (email, password) => {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: createHeaders(),
      body: JSON.stringify({ email, password }),
    });

    const data = await handleResponse(response);
    
    // Store the token in localStorage
    if (data.token) {
      localStorage.setItem('authToken', data.token);
    }
    
    return data;
  },

  // Register new user (admin only)
  register: async (userData) => {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: createHeaders(true), // Include auth for admin-only endpoint
      body: JSON.stringify(userData),
    });

    return handleResponse(response);
  },

  // Get current user info
  getCurrentUser: async () => {
    const response = await fetch(`${API_BASE_URL}/auth/me`, {
      method: 'GET',
      headers: createHeaders(true),
    });

    return handleResponse(response);
  },

  // Logout user
  logout: async () => {
    const response = await fetch(`${API_BASE_URL}/auth/logout`, {
      method: 'POST',
      headers: createHeaders(true),
    });

    // Remove token from localStorage regardless of response
    localStorage.removeItem('authToken');
    
    return handleResponse(response);
  },
};

// User Management API calls (admin only)
export const usersAPI = {
  // Get all users
  getAll: async () => {
    const response = await fetch(`${API_BASE_URL}/auth/users`, {
      method: 'GET',
      headers: createHeaders(true),
    });

    return handleResponse(response);
  },

  // Create new user
  create: async (userData) => {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: createHeaders(true),
      body: JSON.stringify(userData),
    });

    return handleResponse(response);
  },

  // Update user
  update: async (userId, userData) => {
    const response = await fetch(`${API_BASE_URL}/auth/users/${userId}`, {
      method: 'PUT',
      headers: createHeaders(true),
      body: JSON.stringify(userData),
    });

    return handleResponse(response);
  },

  // Delete user
  delete: async (userId) => {
    const response = await fetch(`${API_BASE_URL}/auth/users/${userId}`, {
      method: 'DELETE',
      headers: createHeaders(true),
    });

    return handleResponse(response);
  },
};

// Health check
export const healthAPI = {
  check: async () => {
    const response = await fetch(`${API_BASE_URL}/health`);
    return handleResponse(response);
  },
};

// Future API endpoints (to be implemented later)
export const customersAPI = {
  // TODO: Implement when backend routes are created
};

export const inventoryAPI = {
  // TODO: Implement when backend routes are created
};

export const suppliersAPI = {
  // TODO: Implement when backend routes are created
};

export const ordersAPI = {
  // TODO: Implement when backend routes are created
};

export default {
  auth: authAPI,
  users: usersAPI,
  health: healthAPI,
  customers: customersAPI,
  inventory: inventoryAPI,
  suppliers: suppliersAPI,
  orders: ordersAPI,
};
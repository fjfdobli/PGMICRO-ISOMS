const API_BASE_URL = 'http://localhost:3002/api';
const getAuthToken = () => {
  return localStorage.getItem('authToken');
};

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

const handleResponse = async (response) => {
  const data = await response.json();
  
  if (!response.ok) {
    const error = new Error(data.error || `HTTP error! status: ${response.status}`);
    error.response = { data };
    throw error;
  }
  
  return data;
};

export const authAPI = {
  login: async (email, password) => {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: createHeaders(),
      body: JSON.stringify({ email, password }),
    });

    const data = await handleResponse(response);
    if (data.token) {
      localStorage.setItem('authToken', data.token);
    }
    
    return data;
  },

  register: async (userData) => {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: createHeaders(true),
      body: JSON.stringify(userData),
    });

    return handleResponse(response);
  },

  getCurrentUser: async () => {
    const response = await fetch(`${API_BASE_URL}/auth/me`, {
      method: 'GET',
      headers: createHeaders(true),
    });

    return handleResponse(response);
  },

  checkBootstrapMode: async () => {
    const response = await fetch(`${API_BASE_URL}/auth/bootstrap-check`, {
      method: 'GET',
      headers: createHeaders(false), 
    });

    return handleResponse(response);
  },

  logout: async () => {
    const response = await fetch(`${API_BASE_URL}/auth/logout`, {
      method: 'POST',
      headers: createHeaders(true),
    });

    localStorage.removeItem('authToken');
    
    return handleResponse(response);
  },

  sendContactEmail: async (emailData) => {
    const response = await fetch(`${API_BASE_URL}/auth/contact`, {
      method: 'POST',
      headers: createHeaders(),
      body: JSON.stringify(emailData),
    });

    return handleResponse(response);
  },
};

export const usersAPI = {
  getAll: async () => {
    const response = await fetch(`${API_BASE_URL}/auth/users`, {
      method: 'GET',
      headers: createHeaders(true),
    });

    return handleResponse(response);
  },

  create: async (userData) => {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: createHeaders(true),
      body: JSON.stringify(userData),
    });

    return handleResponse(response);
  },

  update: async (userId, userData) => {
    const response = await fetch(`${API_BASE_URL}/auth/users/${userId}`, {
      method: 'PUT',
      headers: createHeaders(true),
      body: JSON.stringify(userData),
    });

    return handleResponse(response);
  },

  delete: async (userId) => {
    const response = await fetch(`${API_BASE_URL}/auth/users/${userId}`, {
      method: 'DELETE',
      headers: createHeaders(true),
    });

    return handleResponse(response);
  },

  approve: async (userId) => {
    const response = await fetch(`${API_BASE_URL}/auth/users/${userId}/approve`, {
      method: 'PUT',
      headers: createHeaders(true),
    });

    return handleResponse(response);
  },

  reject: async (userId) => {
    const response = await fetch(`${API_BASE_URL}/auth/users/${userId}/reject`, {
      method: 'PUT',
      headers: createHeaders(true),
    });

    return handleResponse(response);
  },

  suspend: async (userId, reason) => {
    const response = await fetch(`${API_BASE_URL}/auth/users/${userId}/suspend`, {
      method: 'PUT',
      headers: createHeaders(true),
      body: JSON.stringify({ reason }),
    });

    return handleResponse(response);
  },

  unsuspend: async (userId) => {
    const response = await fetch(`${API_BASE_URL}/auth/users/${userId}/unsuspend`, {
      method: 'PUT',
      headers: createHeaders(true),
    });

    return handleResponse(response);
  },
};

export const healthAPI = {
  check: async () => {
    const response = await fetch(`${API_BASE_URL}/health`);
    return handleResponse(response);
  },
};

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
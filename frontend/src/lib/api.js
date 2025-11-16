const API_BASE_URL = 'http://localhost:3002/api'
const getAuthToken = () => {
  return localStorage.getItem('authToken')
}

const createHeaders = (includeAuth = false) => {
  const headers = {
    'Content-Type': 'application/json',
  }

  if (includeAuth) {
    const token = getAuthToken()
    if (token) {
      headers.Authorization = `Bearer ${token}`
    }
  }

  return headers
}

const handleResponse = async (response) => {
  const data = await response.json()
  
  if (!response.ok) {
    if (response.status === 401 && (data.code === 'TOKEN_EXPIRED' || data.code === 'TOKEN_INVALID')) {
      localStorage.removeItem('authToken')
      
      if (window.location.pathname !== '/' && window.location.pathname !== '/login') {
        window.location.href = '/'
      }
      
      const error = new Error(data.message || 'Session expired. Please log in again.')
      error.response = { data }
      error.code = data.code
      throw error
    }
    
    const error = new Error(data.error || `HTTP error! status: ${response.status}`)
    error.response = { data }
    throw error
  }
  
  return data
}

export const authAPI = {
  login: async (email, password) => {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: createHeaders(),
      body: JSON.stringify({ email, password }),
    })

    const data = await handleResponse(response)
    if (data.token) {
      localStorage.setItem('authToken', data.token)
    }
    
    return data
  },

  register: async (userData) => {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: createHeaders(true),
      body: JSON.stringify(userData),
    })

    return handleResponse(response)
  },

  getCurrentUser: async () => {
    const response = await fetch(`${API_BASE_URL}/auth/me`, {
      method: 'GET',
      headers: createHeaders(true),
    })

    return handleResponse(response)
  },

  checkBootstrapMode: async () => {
    const response = await fetch(`${API_BASE_URL}/auth/bootstrap-check`, {
      method: 'GET',
      headers: createHeaders(false), 
    })

    return handleResponse(response)
  },

  logout: async () => {
    const response = await fetch(`${API_BASE_URL}/auth/logout`, {
      method: 'POST',
      headers: createHeaders(true),
    })

    localStorage.removeItem('authToken')
    
    return handleResponse(response)
  },

  sendContactEmail: async (emailData) => {
    const response = await fetch(`${API_BASE_URL}/auth/contact`, {
      method: 'POST',
      headers: createHeaders(),
      body: JSON.stringify(emailData),
    })

    return handleResponse(response)
  },

  updateProfile: async (profileData) => {
    const response = await fetch(`${API_BASE_URL}/auth/profile`, {
      method: 'PUT',
      headers: createHeaders(true),
      body: JSON.stringify(profileData),
    })

    return handleResponse(response)
  },

  updateStatus: async (status) => {
    const response = await fetch(`${API_BASE_URL}/auth/status`, {
      method: 'PUT',
      headers: createHeaders(true),
      body: JSON.stringify({ status }),
    })

    return handleResponse(response)
  },

  heartbeat: async () => {
    const response = await fetch(`${API_BASE_URL}/auth/heartbeat`, {
      method: 'POST',
      headers: createHeaders(true),
    })

    return handleResponse(response)
  },

  changePassword: async (passwordData) => {
    const response = await fetch(`${API_BASE_URL}/auth/change-password`, {
      method: 'POST',
      headers: createHeaders(true),
      body: JSON.stringify(passwordData),
    })

    return handleResponse(response)
  },
}

export const usersAPI = {
  getAll: async () => {
    const response = await fetch(`${API_BASE_URL}/auth/users`, {
      method: 'GET',
      headers: createHeaders(true),
    })

    return handleResponse(response)
  },

  create: async (userData) => {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: createHeaders(true),
      body: JSON.stringify(userData),
    })

    return handleResponse(response)
  },

  update: async (userId, userData) => {
    const response = await fetch(`${API_BASE_URL}/auth/users/${userId}`, {
      method: 'PUT',
      headers: createHeaders(true),
      body: JSON.stringify(userData),
    })

    return handleResponse(response)
  },

  delete: async (userId) => {
    const response = await fetch(`${API_BASE_URL}/auth/users/${userId}`, {
      method: 'DELETE',
      headers: createHeaders(true),
    })

    return handleResponse(response)
  },

  approve: async (userId) => {
    const response = await fetch(`${API_BASE_URL}/auth/users/${userId}/approve`, {
      method: 'PUT',
      headers: createHeaders(true),
    })

    return handleResponse(response)
  },

  reject: async (userId) => {
    const response = await fetch(`${API_BASE_URL}/auth/users/${userId}/reject`, {
      method: 'PUT',
      headers: createHeaders(true),
    })

    return handleResponse(response)
  },

  suspend: async (userId, reason) => {
    const response = await fetch(`${API_BASE_URL}/auth/users/${userId}/suspend`, {
      method: 'PUT',
      headers: createHeaders(true),
      body: JSON.stringify({ reason }),
    })

    return handleResponse(response)
  },

  unsuspend: async (userId) => {
    const response = await fetch(`${API_BASE_URL}/auth/users/${userId}/unsuspend`, {
      method: 'PUT',
      headers: createHeaders(true),
    })

    return handleResponse(response)
  },
}

export const healthAPI = {
  check: async () => {
    const response = await fetch(`${API_BASE_URL}/health`)
    return handleResponse(response)
  },
}

export const customersAPI = {
  // TODO: Implement when backend routes are created
}

export const inventoryAPI = {
  // TODO: Implement when backend routes are created
}

export const suppliersAPI = {
  // TODO: Implement when backend routes are created
}

export const ordersAPI = {
  // TODO: Implement when backend routes are created
}

export const settingsAPI = {
  getAll: async () => {
    const response = await fetch(`${API_BASE_URL}/settings`, {
      method: 'GET',
      headers: createHeaders(true),
    })

    return handleResponse(response)
  },

  getByCategory: async (category) => {
    const response = await fetch(`${API_BASE_URL}/settings/${category}`, {
      method: 'GET',
      headers: createHeaders(true),
    })

    return handleResponse(response)
  },

  updateAll: async (settings) => {
    const response = await fetch(`${API_BASE_URL}/settings`, {
      method: 'PUT',
      headers: createHeaders(true),
      body: JSON.stringify({ settings }),
    })

    return handleResponse(response)
  },

  updateSingle: async (key, value) => {
    const response = await fetch(`${API_BASE_URL}/settings/${key}`, {
      method: 'PUT',
      headers: createHeaders(true),
      body: JSON.stringify({ value }),
    })

    return handleResponse(response)
  },

  reset: async () => {
    const response = await fetch(`${API_BASE_URL}/settings/reset`, {
      method: 'POST',
      headers: createHeaders(true),
    })

    return handleResponse(response)
  },
}

export const notificationsAPI = {
  getAll: async (limit = 50, offset = 0, unreadOnly = false) => {
    const params = new URLSearchParams({ limit, offset })
    if (unreadOnly) params.append('unread', 'true')
    
    const response = await fetch(`${API_BASE_URL}/notifications?${params}`, {
      method: 'GET',
      headers: createHeaders(true),
    })

    return handleResponse(response)
  },

  markAsRead: async (notificationId) => {
    const response = await fetch(`${API_BASE_URL}/notifications/${notificationId}/read`, {
      method: 'PATCH',
      headers: createHeaders(true),
    })

    return handleResponse(response)
  },

  markAllAsRead: async () => {
    const response = await fetch(`${API_BASE_URL}/notifications/read-all`, {
      method: 'PATCH',
      headers: createHeaders(true),
    })

    return handleResponse(response)
  },

  delete: async (notificationId) => {
    const response = await fetch(`${API_BASE_URL}/notifications/${notificationId}`, {
      method: 'DELETE',
      headers: createHeaders(true),
    })

    return handleResponse(response)
  },

  deleteAll: async () => {
    const response = await fetch(`${API_BASE_URL}/notifications`, {
      method: 'DELETE',
      headers: createHeaders(true),
    })

    return handleResponse(response)
  },
}

export const chatAPI = {
  getConversations: async () => {
    const response = await fetch(`${API_BASE_URL}/chat/conversations`, {
      method: 'GET',
      headers: createHeaders(true),
    })

    return handleResponse(response)
  },

  getMessages: async (conversationId, limit = 50, offset = 0) => {
    const params = new URLSearchParams({ limit, offset })
    const response = await fetch(`${API_BASE_URL}/chat/conversations/${conversationId}/messages?${params}`, {
      method: 'GET',
      headers: createHeaders(true),
    })

    return handleResponse(response)
  },

  sendMessage: async (conversationId, content, type = 'text', fileUrl = null, metadata = null) => {
    const response = await fetch(`${API_BASE_URL}/chat/conversations/${conversationId}/messages`, {
      method: 'POST',
      headers: createHeaders(true),
      body: JSON.stringify({ content, type, file_url: fileUrl, metadata }),
    })

    return handleResponse(response)
  },

  markAsRead: async (conversationId) => {
    const response = await fetch(`${API_BASE_URL}/chat/conversations/${conversationId}/read`, {
      method: 'PATCH',
      headers: createHeaders(true),
    })

    return handleResponse(response)
  },

  uploadFile: async (file) => {
    const formData = new FormData()
    formData.append('file', file)

    const response = await fetch(`${API_BASE_URL}/chat/upload`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${getAuthToken()}`,
      },
      body: formData,
    })

    return handleResponse(response)
  },

  getUsers: async () => {
    const response = await fetch(`${API_BASE_URL}/chat/users`, {
      method: 'GET',
      headers: createHeaders(true),
    })

    return handleResponse(response)
  },

  createConversation: async (participantIds, isGroup = false, groupName = null) => {
    const response = await fetch(`${API_BASE_URL}/chat/conversations`, {
      method: 'POST',
      headers: createHeaders(true),
      body: JSON.stringify({ participant_ids: participantIds, is_group: isGroup, group_name: groupName }),
    })

    return handleResponse(response)
  },
}

export default {
  auth: authAPI,
  users: usersAPI,
  health: healthAPI,
  customers: customersAPI,
  inventory: inventoryAPI,
  suppliers: suppliersAPI,
  orders: ordersAPI,
  settings: settingsAPI,
  notifications: notificationsAPI,
  chat: chatAPI,
}
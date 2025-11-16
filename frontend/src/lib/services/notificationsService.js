import api from '../axios'

const notificationsAPI = {
  getAll: async (params = {}) => {
    const queryParams = new URLSearchParams(params).toString()
    const response = await api.get(`/notifications${queryParams ? `?${queryParams}` : ''}`)
    return response.data
  },

  getUnreadCount: async () => {
    const response = await api.get('/notifications/unread-count')
    return response.data
  },

  markAsRead: async (notificationId) => {
    const response = await api.patch(`/notifications/${notificationId}/read`)
    return response.data
  },

  markAllAsRead: async () => {
    const response = await api.patch('/notifications/mark-all-read')
    return response.data
  },

  delete: async (notificationId) => {
    const response = await api.delete(`/notifications/${notificationId}`)
    return response.data
  },

  clearRead: async () => {
    const response = await api.delete('/notifications/clear-read')
    return response.data
  },

  create: async (notificationData) => {
    const response = await api.post('/notifications', notificationData)
    return response.data
  },

  broadcast: async (notificationData) => {
    const response = await api.post('/notifications/broadcast', notificationData)
    return response.data
  }
}

export default notificationsAPI

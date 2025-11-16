import api from '../axios'

const chatAPI = {
  getConversations: async () => {
    const response = await api.get('/chat/conversations')
    return response.data
  },

  getOrCreateDirectConversation: async (otherUserId) => {
    const response = await api.post('/chat/conversations/direct', {
      other_user_id: otherUserId
    })
    return response.data
  },

  getMessages: async (conversationId, params = {}) => {
    const queryParams = new URLSearchParams(params).toString()
    const response = await api.get(
      `/chat/conversations/${conversationId}/messages${queryParams ? `?${queryParams}` : ''}`
    )
    return response.data
  },

  sendMessage: async (conversationId, messageData) => {
    const response = await api.post(
      `/chat/conversations/${conversationId}/messages`,
      messageData
    )
    return response.data
  },

  markAsRead: async (conversationId) => {
    const response = await api.patch(`/chat/conversations/${conversationId}/read`)
    return response.data
  },

  getUsers: async () => {
    const response = await api.get('/chat/users')
    return response.data
  },

  getUnreadCount: async () => {
    const response = await api.get('/chat/unread-count')
    return response.data
  },

  deleteMessage: async (messageId) => {
    const response = await api.delete(`/chat/messages/${messageId}`)
    return response.data
  },

  toggleMute: async (conversationId, isMuted) => {
    const response = await api.patch(`/chat/conversations/${conversationId}/mute`, {
      is_muted: isMuted
    })
    return response.data
  },

  uploadFile: async (file) => {
    const formData = new FormData()
    formData.append('file', file)
    
    const response = await api.post('/chat/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
    return response.data
  }
}

export default chatAPI

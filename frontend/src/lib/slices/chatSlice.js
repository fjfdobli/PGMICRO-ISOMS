import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import chatAPI from '../services/chatService'

const initialState = {
  conversations: [],
  activeConversations: {}, 
  users: [],
  unreadCount: 0,
  loading: false,
  error: null,
  lastFetched: null
}

export const fetchConversations = createAsyncThunk(
  'chat/fetchConversations',
  async (_, { rejectWithValue }) => {
    try {
      const response = await chatAPI.getConversations()
      return response.conversations
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch conversations')
    }
  }
)

export const fetchUsers = createAsyncThunk(
  'chat/fetchUsers',
  async (_, { rejectWithValue }) => {
    try {
      const response = await chatAPI.getUsers()
      return response.users
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch users')
    }
  }
)

export const getOrCreateConversation = createAsyncThunk(
  'chat/getOrCreateConversation',
  async (otherUserId, { rejectWithValue }) => {
    try {
      const response = await chatAPI.getOrCreateDirectConversation(otherUserId)
      return response.conversation
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create conversation')
    }
  }
)

export const fetchMessages = createAsyncThunk(
  'chat/fetchMessages',
  async ({ conversationId, before }, { rejectWithValue }) => {
    try {
      const params = before ? { before } : {}
      const response = await chatAPI.getMessages(conversationId, params)
      return { conversationId, messages: response.messages }
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch messages')
    }
  }
)

export const sendMessage = createAsyncThunk(
  'chat/sendMessage',
  async ({ conversationId, message, type = 'text', file_url = null, metadata = null }, { rejectWithValue }) => {
    try {
      const response = await chatAPI.sendMessage(conversationId, { 
        message, 
        type, 
        file_url, 
        metadata 
      })
      return { conversationId, message: response.message }
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to send message')
    }
  }
)

export const markConversationAsRead = createAsyncThunk(
  'chat/markAsRead',
  async (conversationId, { rejectWithValue }) => {
    try {
      await chatAPI.markAsRead(conversationId)
      return conversationId
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to mark as read')
    }
  }
)

export const fetchUnreadCount = createAsyncThunk(
  'chat/fetchUnreadCount',
  async (_, { rejectWithValue }) => {
    try {
      const response = await chatAPI.getUnreadCount()
      return response
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch unread count')
    }
  }
)

export const deleteMessage = createAsyncThunk(
  'chat/deleteMessage',
  async ({ conversationId, messageId }, { rejectWithValue }) => {
    try {
      await chatAPI.deleteMessage(messageId)
      return { conversationId, messageId }
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete message')
    }
  }
)

export const toggleMuteConversation = createAsyncThunk(
  'chat/toggleMute',
  async ({ conversationId, isMuted }, { rejectWithValue }) => {
    try {
      await chatAPI.toggleMute(conversationId, isMuted)
      return { conversationId, isMuted }
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to toggle mute')
    }
  }
)

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    addMessageLocal: (state, action) => {
      const { conversationId, message } = action.payload
      if (state.activeConversations[conversationId]) {
        state.activeConversations[conversationId].messages.push(message)
      }
    },
    setActiveConversation: (state, action) => {
      const { conversationId, isActive } = action.payload
      if (isActive && !state.activeConversations[conversationId]) {
        state.activeConversations[conversationId] = { messages: [], loading: false }
      } else if (!isActive && state.activeConversations[conversationId]) {
        delete state.activeConversations[conversationId]
      }
    },
    toggleConversationMinimized: (state, action) => {
      const conversationId = action.payload
      const conv = state.conversations.find(c => c.id === conversationId)
      if (conv) {
        conv.isMinimized = !conv.isMinimized
      }
    },
    clearError: (state) => {
      state.error = null
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchConversations.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchConversations.fulfilled, (state, action) => {
        state.loading = false
        state.conversations = action.payload
        state.lastFetched = new Date().toISOString()
      })
      .addCase(fetchConversations.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })

      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.users = action.payload
      })

      .addCase(getOrCreateConversation.fulfilled, (state, action) => {
        const existingIndex = state.conversations.findIndex(c => c.id === action.payload.id)
        if (existingIndex === -1) {
          state.conversations.unshift(action.payload)
        }
        if (!state.activeConversations[action.payload.id]) {
          state.activeConversations[action.payload.id] = { messages: [], loading: false }
        }
      })

      .addCase(fetchMessages.pending, (state, action) => {
        const conversationId = action.meta.arg.conversationId
        if (state.activeConversations[conversationId]) {
          state.activeConversations[conversationId].loading = true
        }
      })
      .addCase(fetchMessages.fulfilled, (state, action) => {
        const { conversationId, messages } = action.payload
        if (state.activeConversations[conversationId]) {
          state.activeConversations[conversationId].messages = messages
          state.activeConversations[conversationId].loading = false
        }
      })
      .addCase(fetchMessages.rejected, (state, action) => {
        state.error = action.payload
      })

      .addCase(sendMessage.fulfilled, (state, action) => {
        const { conversationId, message } = action.payload
        if (state.activeConversations[conversationId]) {
          state.activeConversations[conversationId].messages.push(message)
        }

        const conv = state.conversations.find(c => c.id === conversationId)
        if (conv) {
          conv.last_message_preview = message.message
          conv.last_message_at = message.created_at
        }
      })

      .addCase(markConversationAsRead.fulfilled, (state, action) => {
        const conversationId = action.payload
        const conv = state.conversations.find(c => c.id === conversationId)
        if (conv) {
          conv.unread_count = 0
          conv.last_read_at = new Date().toISOString()
        }
      })

      .addCase(fetchUnreadCount.fulfilled, (state, action) => {
        state.unreadCount = action.payload.unread_messages || 0
      })

      .addCase(deleteMessage.fulfilled, (state, action) => {
        const { conversationId, messageId } = action.payload
        if (state.activeConversations[conversationId]) {
          state.activeConversations[conversationId].messages = 
            state.activeConversations[conversationId].messages.filter(m => m.id !== messageId)
        }
      })

      .addCase(toggleMuteConversation.fulfilled, (state, action) => {
        const { conversationId, isMuted } = action.payload
        const conv = state.conversations.find(c => c.id === conversationId)
        if (conv) {
          conv.is_muted = isMuted
        }
      })
  }
})

export const {
  addMessageLocal,
  setActiveConversation,
  toggleConversationMinimized,
  clearError
} = chatSlice.actions

export default chatSlice.reducer

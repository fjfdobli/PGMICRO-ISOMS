import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import notificationsAPI from '../services/notificationsService'

const initialState = {
  notifications: [],
  unreadCount: 0,
  loading: false,
  error: null,
  lastFetched: null
}

export const fetchNotifications = createAsyncThunk(
  'notifications/fetchNotifications',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await notificationsAPI.getAll(params)
      return response.notifications
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch notifications')
    }
  }
)

export const fetchUnreadCount = createAsyncThunk(
  'notifications/fetchUnreadCount',
  async (_, { rejectWithValue }) => {
    try {
      const response = await notificationsAPI.getUnreadCount()
      return response.count
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch unread count')
    }
  }
)

export const markNotificationAsRead = createAsyncThunk(
  'notifications/markAsRead',
  async (notificationId, { rejectWithValue }) => {
    try {
      await notificationsAPI.markAsRead(notificationId)
      return notificationId
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to mark notification as read')
    }
  }
)

export const markAllNotificationsAsRead = createAsyncThunk(
  'notifications/markAllAsRead',
  async (_, { rejectWithValue }) => {
    try {
      await notificationsAPI.markAllAsRead()
      return true
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to mark all as read')
    }
  }
)

export const deleteNotification = createAsyncThunk(
  'notifications/delete',
  async (notificationId, { rejectWithValue }) => {
    try {
      await notificationsAPI.delete(notificationId)
      return notificationId
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete notification')
    }
  }
)

export const clearReadNotifications = createAsyncThunk(
  'notifications/clearRead',
  async (_, { rejectWithValue }) => {
    try {
      const response = await notificationsAPI.clearRead()
      return response.deletedCount
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to clear read notifications')
    }
  }
)

export const createNotification = createAsyncThunk(
  'notifications/create',
  async (notificationData, { rejectWithValue }) => {
    try {
      const response = await notificationsAPI.create(notificationData)
      return response
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create notification')
    }
  }
)

export const broadcastNotification = createAsyncThunk(
  'notifications/broadcast',
  async (notificationData, { rejectWithValue }) => {
    try {
      const response = await notificationsAPI.broadcast(notificationData)
      return response
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to broadcast notification')
    }
  }
)

const notificationSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    addNotificationLocal: (state, action) => {
      state.notifications.unshift(action.payload)
      if (!action.payload.is_read) {
        state.unreadCount += 1
      }
    },
    clearNotificationsLocal: (state) => {
      state.notifications = []
      state.unreadCount = 0
      state.error = null
    },
    clearError: (state) => {
      state.error = null
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchNotifications.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.loading = false
        state.notifications = action.payload
        state.unreadCount = action.payload.filter(n => !n.is_read).length
        state.lastFetched = new Date().toISOString()
      })
      .addCase(fetchNotifications.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      
      .addCase(fetchUnreadCount.fulfilled, (state, action) => {
        state.unreadCount = action.payload
      })
      
      .addCase(markNotificationAsRead.fulfilled, (state, action) => {
        const notification = state.notifications.find(n => n.id === action.payload)
        if (notification && !notification.is_read) {
          notification.is_read = true
          notification.read_at = new Date().toISOString()
          state.unreadCount = Math.max(0, state.unreadCount - 1)
        }
      })
      .addCase(markNotificationAsRead.rejected, (state, action) => {
        state.error = action.payload
      })
      
      .addCase(markAllNotificationsAsRead.fulfilled, (state) => {
        state.notifications.forEach(n => {
          n.is_read = true
          n.read_at = new Date().toISOString()
        })
        state.unreadCount = 0
      })
      .addCase(markAllNotificationsAsRead.rejected, (state, action) => {
        state.error = action.payload
      })
      
      .addCase(deleteNotification.fulfilled, (state, action) => {
        const notification = state.notifications.find(n => n.id === action.payload)
        if (notification && !notification.is_read) {
          state.unreadCount = Math.max(0, state.unreadCount - 1)
        }
        state.notifications = state.notifications.filter(n => n.id !== action.payload)
      })
      .addCase(deleteNotification.rejected, (state, action) => {
        state.error = action.payload
      })
      
      .addCase(clearReadNotifications.fulfilled, (state) => {
        state.notifications = state.notifications.filter(n => !n.is_read)
      })
      .addCase(clearReadNotifications.rejected, (state, action) => {
        state.error = action.payload
      })
  }
})

export const { 
  addNotificationLocal, 
  clearNotificationsLocal,
  clearError
} = notificationSlice.actions

export default notificationSlice.reducer


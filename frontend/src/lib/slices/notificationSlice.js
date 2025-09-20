import { createSlice } from '@reduxjs/toolkit'

const notificationSlice = createSlice({
  name: 'notifications',
  initialState: {
    items: [],
    unreadCount: 0,
  },
  reducers: {
    addNotification: (state, action) => {
      const notification = {
        id: Date.now() + Math.random(), // Simple ID generation
        timestamp: new Date().toISOString(),
        unread: true,
        ...action.payload
      }
      state.items.unshift(notification)
      state.unreadCount += 1
    },
    markAsRead: (state, action) => {
      const notification = state.items.find(n => n.id === action.payload)
      if (notification && notification.unread) {
        notification.unread = false
        state.unreadCount = Math.max(0, state.unreadCount - 1)
      }
    },
    markAllAsRead: (state) => {
      state.items.forEach(notification => {
        notification.unread = false
      })
      state.unreadCount = 0
    },
    removeNotification: (state, action) => {
      const index = state.items.findIndex(n => n.id === action.payload)
      if (index !== -1) {
        const notification = state.items[index]
        if (notification.unread) {
          state.unreadCount = Math.max(0, state.unreadCount - 1)
        }
        state.items.splice(index, 1)
      }
    },
    clearAllNotifications: (state) => {
      state.items = []
      state.unreadCount = 0
    },
    addReorderAlert: (state, action) => {
      const { category, available, reorderPoint } = action.payload
      
      // Remove existing reorder alert for this category
      state.items = state.items.filter(n => 
        !(n.type === 'reorder' && n.category === category)
      )
      
      // Add new reorder alert
      const notification = {
        id: `reorder-${category}-${Date.now()}`,
        type: 'reorder',
        category,
        available,
        reorderPoint,
        message: `${category}: Only ${available} items left (Reorder at ${reorderPoint})`,
        description: `Order ${reorderPoint - available + 10} more items to maintain stock levels`,
        timestamp: new Date().toISOString(),
        unread: true,
        priority: 'high',
        icon: '🚨'
      }
      
      state.items.unshift(notification)
      state.unreadCount += 1
    },
    removeReorderAlert: (state, action) => {
      const category = action.payload
      const initialLength = state.items.length
      
      state.items = state.items.filter(n => {
        const shouldRemove = n.type === 'reorder' && n.category === category
        if (shouldRemove && n.unread) {
          state.unreadCount = Math.max(0, state.unreadCount - 1)
        }
        return !shouldRemove
      })
    }
  }
})

export const {
  addNotification,
  markAsRead,
  markAllAsRead,
  removeNotification,
  clearAllNotifications,
  addReorderAlert,
  removeReorderAlert
} = notificationSlice.actions

export default notificationSlice.reducer

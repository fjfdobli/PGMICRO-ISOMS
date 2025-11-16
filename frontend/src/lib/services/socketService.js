import { io } from 'socket.io-client'

class SocketService {
  constructor() {
    this.socket = null
    this.connected = false
  }

  connect(userId) {
    if (this.socket?.connected) {
      return this.socket
    }

    this.socket = io('http://localhost:3002', {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5
    })

    this.socket.on('connect', () => {
      console.log('Socket.IO connected:', this.socket.id)
      this.connected = true
      
      if (userId) {
        this.socket.emit('join', userId)
      }
    })

    this.socket.on('disconnect', () => {
      console.log('Socket.IO disconnected')
      this.connected = false
    })

    this.socket.on('connect_error', (error) => {
      console.error('Socket.IO connection error:', error)
    })

    return this.socket
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect()
      this.socket = null
      this.connected = false
    }
  }

  joinConversation(conversationId) {
    if (this.socket?.connected) {
      this.socket.emit('join_conversation', conversationId)
    }
  }

  leaveConversation(conversationId) {
    if (this.socket?.connected) {
      this.socket.emit('leave_conversation', conversationId)
    }
  }

  emitTyping(conversationId, userId, userName) {
    if (this.socket?.connected) {
      this.socket.emit('typing', { conversationId, userId, userName })
    }
  }

  emitStopTyping(conversationId, userId) {
    if (this.socket?.connected) {
      this.socket.emit('stop_typing', { conversationId, userId })
    }
  }

  onNewMessage(callback) {
    if (this.socket) {
      this.socket.on('new_message', callback)
    }
  }

  onNewNotification(callback) {
    if (this.socket) {
      this.socket.on('new_notification', callback)
    }
  }

  onMessagesSeen(callback) {
    if (this.socket) {
      this.socket.on('messages_seen', callback)
    }
  }

  onUserTyping(callback) {
    if (this.socket) {
      this.socket.on('user_typing', callback)
    }
  }

  onUserStopTyping(callback) {
    if (this.socket) {
      this.socket.on('user_stop_typing', callback)
    }
  }

  off(event, callback) {
    if (this.socket) {
      this.socket.off(event, callback)
    }
  }
}

export default new SocketService()

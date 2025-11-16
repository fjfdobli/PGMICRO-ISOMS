import React, { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { fetchConversations, fetchUsers, fetchUnreadCount, setActiveConversation, addMessageLocal } from '../../lib/slices/chatSlice'
import { addNotificationLocal, fetchUnreadCount as fetchNotificationCount } from '../../lib/slices/notificationSlice'
import socketService from '../../lib/services/socketService'
import ChatWindow from './ChatWindow'

export default function ChatContainer() {
  const dispatch = useDispatch()
  const { activeConversations, conversations } = useSelector(state => state.chat || {})
  const { user } = useSelector(state => state.auth || {})
  const [minimizedChats, setMinimizedChats] = useState({})

  useEffect(() => {
    dispatch(fetchConversations())
    dispatch(fetchUsers())
    dispatch(fetchUnreadCount())

    if (user?.id) {
      const socket = socketService.connect(user.id)

      socketService.onNewMessage((message) => {
        console.log('New message received via Socket.IO:', message)
        dispatch(addMessageLocal(message))
        dispatch(fetchUnreadCount()) 
      })

      socketService.onNewNotification((notification) => {
        console.log('New notification received via Socket.IO:', notification)
        dispatch(addNotificationLocal(notification))
        dispatch(fetchNotificationCount())
      })

      socketService.onMessagesSeen(({ conversation_id, user_id, read_at }) => {
        console.log('Messages seen via Socket.IO:', conversation_id, user_id)
        dispatch(fetchConversations())
      })

      const pollInterval = setInterval(() => {
        dispatch(fetchConversations())
        dispatch(fetchUsers())
        dispatch(fetchUnreadCount())
      }, 30000)

      return () => {
        clearInterval(pollInterval)
        socketService.disconnect()
      }
    }
  }, [dispatch, user?.id])

  const handleCloseChat = (conversationId) => {
    dispatch(setActiveConversation({ conversationId, isActive: false }))
  }

  const handleToggleMinimize = (conversationId) => {
    setMinimizedChats(prev => ({
      ...prev,
      [conversationId]: !prev[conversationId]
    }))
  }

  const openConversations = Object.keys(activeConversations || {}).map(Number)

  return (
    <div className="fixed bottom-0 right-4 z-50 flex flex-row-reverse gap-2 items-end">
      {openConversations.map((conversationId, index) => {
        const conversation = conversations.find(c => c.id === conversationId)
        if (!conversation) return null

        const isMinimized = minimizedChats[conversationId]

        return (
          <ChatWindow
            key={conversationId}
            conversation={conversation}
            isMinimized={isMinimized}
            onClose={() => handleCloseChat(conversationId)}
            onToggleMinimize={() => handleToggleMinimize(conversationId)}
            style={{ marginRight: `${index * 0}px` }}
          />
        )
      })}
    </div>
  )
}

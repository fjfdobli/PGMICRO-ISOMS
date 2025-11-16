import React, { useEffect, useRef } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { fetchMessages, markConversationAsRead } from '../../lib/slices/chatSlice'
import MessageList from './MessageList'
import MessageInput from './MessageInput'

export default function ChatWindow({ conversation, isMinimized, onClose, onToggleMinimize, style }) {
  const dispatch = useDispatch()
  const { activeConversations } = useSelector(state => state.chat || {})
  const currentUser = useSelector(state => state.auth?.user)
  
  const conversationData = activeConversations?.[conversation.id]
  const messages = conversationData?.messages || []
  const loading = conversationData?.loading || false

  useEffect(() => {
    if (!isMinimized && conversation.id) {
      dispatch(fetchMessages({ conversationId: conversation.id }))
      dispatch(markConversationAsRead(conversation.id))
    }
  }, [conversation.id, isMinimized, dispatch])

  const handleFocus = () => {
    if (!isMinimized) {
      dispatch(markConversationAsRead(conversation.id))
    }
  }

  const getDisplayName = () => {
    if (conversation.type === 'group') {
      return conversation.name || 'Group Chat'
    }
    if (conversation.participants && conversation.participants.length > 0) {
      const participant = conversation.participants[0]
      return `${participant.first_name} ${participant.last_name}`
    }
    return 'Chat'
  }

  const getStatus = () => {
    if (conversation.type === 'group') return null
    if (conversation.participants && conversation.participants.length > 0) {
      const participant = conversation.participants[0]
      return {
        status: participant.status || participant.user_status || 'offline',
        activeTime: participant.activeTime || 'Offline'
      }
    }
    return { status: 'offline', activeTime: 'Offline' }
  }

  const statusInfo = getStatus()

  return (
    <div 
      className="flex flex-col bg-white rounded-t-lg shadow-2xl border border-gray-200 transition-all duration-200"
      style={{ 
        width: '350px',
        height: isMinimized ? '56px' : '500px',
        ...style
      }}
      onClick={handleFocus}
    >
      <div className={`flex items-center justify-between px-4 py-3 ${isMinimized ? 'rounded-t-lg' : ''} bg-blue-600 text-white cursor-pointer`}
        onClick={onToggleMinimize}
      >
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <div className="relative flex-shrink-0">
            <div className="w-8 h-8 rounded-full bg-blue-800 flex items-center justify-center text-sm font-semibold">
              {getDisplayName().charAt(0).toUpperCase()}
            </div>
            {statusInfo?.status === 'online' && (
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
            )}
            {statusInfo?.status === 'idle' && (
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-yellow-400 rounded-full border-2 border-white"></div>
            )}
            {statusInfo?.status === 'dnd' && (
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-red-400 rounded-full border-2 border-white"></div>
            )}
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="font-medium truncate">{getDisplayName()}</div>
            {statusInfo && (
              <div className="text-xs text-blue-100">{statusInfo.activeTime}</div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={(e) => {
              e.stopPropagation()
              onToggleMinimize()
            }}
            className="p-1 hover:bg-blue-700 rounded transition-colors"
            title={isMinimized ? "Expand" : "Minimize"}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isMinimized ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 15l7-7 7 7" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              )}
            </svg>
          </button>
          
          <button
            onClick={(e) => {
              e.stopPropagation()
              onClose()
            }}
            className="p-1 hover:bg-blue-700 rounded transition-colors"
            title="Close"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      {!isMinimized && (
        <>
          <div className="flex-1 overflow-hidden">
            <MessageList 
              messages={messages} 
              loading={loading}
              currentUserId={currentUser?.id}
              conversationId={conversation.id}
            />
          </div>
          <div className="border-t border-gray-200">
            <MessageInput conversationId={conversation.id} />
          </div>
        </>
      )}
    </div>
  )
}

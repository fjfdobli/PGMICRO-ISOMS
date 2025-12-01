import React, { useEffect, useRef, useState } from 'react'
import { useDispatch } from 'react-redux'
import { deleteMessage } from '../../lib/slices/chatSlice'
import { FileText, Image, Film, FileSpreadsheet, File, Download } from 'lucide-react'
import FileViewer from './FileViewer'

export default function MessageList({ messages, loading, currentUserId, conversationId }) {
  const dispatch = useDispatch()
  const messagesEndRef = useRef(null)
  const [viewingFile, setViewingFile] = useState(null)
  
  const getFileUrl = (url) => {
    if (!url) return ''
    return url.startsWith('http') ? url : `http://localhost:3002${url}`
  }

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && viewingFile) {
        setViewingFile(null)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [viewingFile])

  const handleDelete = (messageId) => {
    if (window.confirm('Delete this message?')) {
      dispatch(deleteMessage({ conversationId, messageId }))
    }
  }

  const handleFileClick = (message) => {
    setViewingFile({
      url: message.file_url,
      name: message.file_name,
      type: message.file_type,
      size: message.file_size
    })
  }

  const formatTime = (timestamp) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffInHours = (now - date) / (1000 * 60 * 60)

    if (diffInHours < 24) {
      return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
    } else if (diffInHours < 48) {
      return `Yesterday ${date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })
    }
  }

  const formatFileSize = (bytes) => {
    if (!bytes) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
  }

  const getFileIcon = (fileType) => {
    if (!fileType) return File
    
    if (fileType.startsWith('image/')) return Image
    if (fileType.startsWith('video/')) return Film
    if (fileType.includes('pdf')) return FileText
    if (fileType.includes('word') || fileType.includes('document')) return FileText
    if (fileType.includes('sheet') || fileType.includes('excel')) return FileSpreadsheet
    
    return File
  }

  const isImageFile = (fileType) => {
    return fileType && fileType.startsWith('image/')
  }

  const isVideoFile = (fileType) => {
    return fileType && fileType.startsWith('video/')
  }

  if (loading && messages.length === 0) {
    return (
      <div className="h-full flex items-center justify-center text-gray-500">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p className="text-sm">Loading messages...</p>
        </div>
      </div>
    )
  }

  if (messages.length === 0) {
    return (
      <div className="h-full flex items-center justify-center text-gray-500">
        <div className="text-center px-4">
          <svg className="w-12 h-12 mx-auto mb-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          <p className="text-sm">No messages yet</p>
          <p className="text-xs text-gray-400 mt-1">Start the conversation!</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full overflow-y-auto p-4 space-y-4">
      {messages.map((message) => {
        const isOwn = message.sender_id === currentUserId
        const senderName = message.sender 
          ? `${message.sender.first_name} ${message.sender.last_name}`
          : 'Unknown'

        return (
          <div
            key={message.id}
            className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-4`}
          >
            <div className={`max-w-[75%] ${isOwn ? 'items-end' : 'items-start'} flex flex-col relative group`}>
              {!isOwn && (
                <span className="text-xs text-gray-600 mb-1 px-2">{senderName}</span>
              )}
              
              {message.file_url ? (
                <div>
                  {isImageFile(message.file_type) ? (
                    <div 
                      onClick={() => handleFileClick(message)}
                      className="cursor-pointer"
                    >
                      <div className="relative">
                        <img 
                          src={getFileUrl(message.file_url)} 
                          alt={message.file_name || 'Image'}
                          className="w-full max-w-md rounded-lg hover:opacity-90 transition-opacity shadow-sm"
                          loading="lazy"
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-10 transition-all rounded-lg flex items-center justify-center">
                          <div className="bg-black bg-opacity-50 text-white px-3 py-1 rounded-full text-sm opacity-0 hover:opacity-100 transition-opacity">
                            Click to view
                          </div>
                        </div>
                      </div>
                      <div className="text-xs mt-1 text-gray-600">
                        {message.file_name} {message.file_size && `• ${formatFileSize(message.file_size)}`}
                      </div>
                    </div>
                  ) : isVideoFile(message.file_type) ? (
                    <div 
                      className="max-w-md cursor-pointer"
                      onClick={() => handleFileClick(message)}
                    >
                      <div className="relative">
                        <video 
                          className="w-full rounded-lg shadow-sm hover:opacity-90 transition-opacity"
                          preload="metadata"
                        >
                          <source src={getFileUrl(message.file_url)} type={message.file_type} />
                        </video>
                        <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-20 transition-all rounded-lg flex items-center justify-center pointer-events-none">
                          <div className="bg-black bg-opacity-50 text-white px-3 py-1 rounded-full text-sm opacity-0 hover:opacity-100 transition-opacity">
                            Click to play
                          </div>
                        </div>
                      </div>
                      <div className="text-xs mt-1 text-gray-600">
                        {message.file_name} {message.file_size && `• ${formatFileSize(message.file_size)}`}
                      </div>
                    </div>
                  ) : (
                    <div
                      onClick={() => handleFileClick(message)}
                      className={`flex items-center gap-3 p-3 rounded-lg border transition-colors cursor-pointer min-w-[280px] max-w-md shadow-sm ${
                        isOwn 
                          ? 'bg-blue-500 border-blue-400 hover:bg-blue-400' 
                          : 'bg-white border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <div className={`p-2 rounded flex-shrink-0 ${isOwn ? 'bg-blue-400' : 'bg-blue-100'}`}>
                        {React.createElement(getFileIcon(message.file_type), {
                          className: `w-6 h-6 ${isOwn ? 'text-white' : 'text-blue-600'}`
                        })}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className={`text-sm font-medium truncate ${isOwn ? 'text-white' : 'text-gray-900'}`}>
                          {message.file_name || 'File'}
                        </div>
                        <div className={`text-xs ${isOwn ? 'text-blue-100' : 'text-gray-500'}`}>
                          {formatFileSize(message.file_size)}
                        </div>
                      </div>
                      <Download className={`w-5 h-5 flex-shrink-0 ${isOwn ? 'text-blue-100' : 'text-gray-400'}`} />
                    </div>
                  )}
                  
                  {message.message && !message.message.startsWith('Sent a file:') && (
                    <div className={`rounded-lg px-3 py-2 mt-2 ${
                      isOwn
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 text-gray-900'
                    }`}>
                      <p className="text-sm whitespace-pre-wrap break-words">{message.message}</p>
                    </div>
                  )}
                </div>
              ) : (
                <div
                  className={`rounded-lg px-3 py-2 ${
                    isOwn
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-900'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap break-words">{message.message}</p>
                </div>
              )}

              <div className={`text-xs mt-1 px-2 ${isOwn ? 'text-gray-500' : 'text-gray-500'}`}>
                {formatTime(message.created_at)}
                {message.is_edited && <span className="ml-1">(edited)</span>}
              </div>

              {isOwn && message.read_by && message.read_by.length > 0 && (
                <div className="text-xs text-gray-500 mt-1 px-2">
                  Seen {formatTime(message.read_by[0].read_at)}
                </div>
              )}

              {isOwn && (
                <button
                  onClick={() => handleDelete(message.id)}
                  className="absolute -right-8 top-2 opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-red-600 transition-all"
                  title="Delete message"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              )}
            </div>
          </div>
        )
      })}
      <div ref={messagesEndRef} />

      {viewingFile && (
        <FileViewer 
          file={viewingFile} 
          onClose={() => setViewingFile(null)} 
        />
      )}
    </div>
  )
}

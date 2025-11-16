import React, { useState, useRef } from 'react'
import { useDispatch } from 'react-redux'
import { sendMessage } from '../../lib/slices/chatSlice'
import chatAPI from '../../lib/services/chatService'
import socketService from '../../lib/services/socketService'

export default function MessageInput({ conversationId, currentUserId, currentUserName }) {
  const dispatch = useDispatch()
  const [message, setMessage] = useState('')
  const [sending, setSending] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [selectedFile, setSelectedFile] = useState(null)
  const fileInputRef = useRef(null)
  const typingTimeoutRef = useRef(null)

  const handleTyping = () => {
    socketService.emitTyping(conversationId, currentUserId, currentUserName)
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }
    
    typingTimeoutRef.current = setTimeout(() => {
      socketService.emitStopTyping(conversationId, currentUserId)
    }, 3000)
  }

  const handleFileSelect = (e) => {
    const file = e.target.files[0]
    if (file) {
      setSelectedFile(file)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if ((!message.trim() && !selectedFile) || sending) return
    socketService.emitStopTyping(conversationId, currentUserId)
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }

    setSending(true)
    try {
      let fileUrl = null
      let metadata = null
      if (selectedFile) {
        setUploading(true)
        const uploadResult = await chatAPI.uploadFile(selectedFile)
        fileUrl = uploadResult.file.url
        metadata = {
          filename: uploadResult.file.filename,
          size: uploadResult.file.size,
          type: uploadResult.file.type
        }
        setUploading(false)
      }

      await dispatch(sendMessage({
        conversationId,
        message: message.trim() || (selectedFile ? `Sent a file: ${selectedFile.name}` : ''),
        type: selectedFile ? 'file' : 'text',
        file_url: fileUrl,
        metadata: metadata
      }))
      
      setMessage('')
      setSelectedFile(null)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    } catch (error) {
      console.error('Failed to send message:', error)
    } finally {
      setSending(false)
      setUploading(false)
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="p-3 border-t border-gray-200">
      {selectedFile && (
        <div className="mb-2 p-2 bg-blue-50 rounded flex items-center justify-between">
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
            </svg>
            <span className="text-sm text-gray-700">{selectedFile.name}</span>
          </div>
          <button
            type="button"
            onClick={() => {
              setSelectedFile(null)
              if (fileInputRef.current) fileInputRef.current.value = ''
            }}
            className="text-gray-400 hover:text-red-600"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      <div className="flex items-end gap-2">
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileSelect}
          className="hidden"
          accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt,.zip"
        />
        
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={sending || uploading}
          className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
          title="Attach file"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
          </svg>
        </button>

        <div className="flex-1 relative">
          <textarea
            value={message}
            onChange={(e) => {
              setMessage(e.target.value)
              handleTyping()
            }}
            onKeyPress={handleKeyPress}
            placeholder="Type a message..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none text-sm"
            rows="1"
            style={{ 
              maxHeight: '100px',
              minHeight: '38px',
              height: 'auto'
            }}
            disabled={sending || uploading}
            onInput={(e) => {
              e.target.style.height = 'auto'
              e.target.style.height = Math.min(e.target.scrollHeight, 100) + 'px'
            }}
          />
        </div>
        
        <button
          type="submit"
          disabled={(!message.trim() && !selectedFile) || sending || uploading}
          className={`p-2 rounded-lg transition-colors ${
            (message.trim() || selectedFile) && !sending && !uploading
              ? 'bg-blue-600 hover:bg-blue-700 text-white'
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
          }`}
          title="Send message"
        >
          {(sending || uploading) ? (
            <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          )}
        </button>
      </div>
      
      <p className="text-xs text-gray-400 mt-1">
        {uploading ? 'Uploading file...' : 'Press Enter to send, Shift+Enter for new line'}
      </p>
    </form>
  )
}

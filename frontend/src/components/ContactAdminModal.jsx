import React, { useState, useEffect } from 'react'
import { X, Send, ChevronDown, ChevronUp, Paperclip, Bold, Italic, Underline, List, AlignLeft, AlignCenter, AlignRight } from 'lucide-react'
import { authAPI } from '../lib/api'
import Toast from './Toast'

const ContactAdminModal = ({ isOpen, onClose, adminEmail, userEmail, suspensionReason }) => {
  const [to, setTo] = useState(adminEmail || 'admin@pgmicro.com')
  const [cc, setCc] = useState('')
  const [bcc, setBcc] = useState('')
  const [subject, setSubject] = useState(suspensionReason ? `Regarding Account Suspension - ${suspensionReason}` : 'Contact Request - PG Micro ISOMS')
  const [message, setMessage] = useState(suspensionReason ? 
    `Dear Administrator,\n\nI am writing to inquire about my account suspension. The reason provided was: "${suspensionReason}"\n\nI would appreciate the opportunity to discuss this matter and understand the next steps for resolution.\n\nThank you for your time and consideration.\n\nBest regards,\n${userEmail}` :
    `Dear Administrator,\n\nI am reaching out regarding my PG Micro ISOMS account.\n\nPlease let me know if you need any additional information.\n\nBest regards,\n${userEmail}`
  )
  const [showCc, setShowCc] = useState(false)
  const [showBcc, setShowBcc] = useState(false)
  const [sending, setSending] = useState(false)
  const [messageRef, setMessageRef] = useState(null)
  const [isTyping, setIsTyping] = useState(false)
  const [attachments, setAttachments] = useState([])
  const [toastVisible, setToastVisible] = useState(false)
  const [toastMessage, setToastMessage] = useState('')
  const [toastType, setToastType] = useState('success')

  useEffect(() => {
    if (isOpen && adminEmail) {
      setTo(adminEmail)
    }
  }, [adminEmail, isOpen])

  useEffect(() => {
    if (isOpen) {
      setCc('')
      setBcc('')
      setShowCc(false)
      setShowBcc(false)
      setAttachments([])
    }
  }, [isOpen])

  useEffect(() => {
    if (isOpen && messageRef) {
      const initialMessage = suspensionReason ? 
        `Dear Administrator,<br><br>I am writing to inquire about my account suspension. The reason provided was: "${suspensionReason}"<br><br>I would appreciate the opportunity to discuss this matter and understand the next steps for resolution.<br><br>Thank you for your time and consideration.<br><br>Best regards,<br>${userEmail}` :
        `Dear Administrator,<br><br>I am reaching out regarding my PG Micro ISOMS account.<br><br>Please let me know if you need any additional information.<br><br>Best regards,<br>${userEmail}`
      
      messageRef.innerHTML = initialMessage
      setMessage(initialMessage)
      setTimeout(() => {
        messageRef.focus()
        const range = document.createRange()
        const selection = window.getSelection()
        range.selectNodeContents(messageRef)
        range.collapse(false)
        selection.removeAllRanges()
        selection.addRange(range)
      }, 100)
    }
  }, [isOpen, messageRef, suspensionReason, userEmail])

  const formatText = (command, value = null) => {
    if (messageRef) {
      messageRef.focus()
      document.execCommand(command, false, value)
      setMessage(messageRef.innerHTML)
    }
  }

  const handleAlignment = (alignment) => {
    const alignmentMap = {
      left: 'justifyLeft',
      center: 'justifyCenter', 
      right: 'justifyRight'
    }
    formatText(alignmentMap[alignment])
  }

  const handleList = () => {
    if (messageRef) {
      messageRef.focus()
      
      const selection = window.getSelection()
      const range = selection.getRangeAt(0)
      let parentElement = range.commonAncestorContainer
      if (parentElement.nodeType === Node.TEXT_NODE) {
        parentElement = parentElement.parentElement
      }
      
      const isInList = parentElement.closest('ul') !== null
      
      if (isInList) {
        document.execCommand('insertUnorderedList', false, null)
      } else {
        document.execCommand('insertUnorderedList', false, null)
      }
      
      setMessage(messageRef.innerHTML)
    }
  }

  const handleAttachment = () => {
    const fileInput = document.createElement('input')
    fileInput.type = 'file'
    fileInput.multiple = true
    fileInput.accept = '*/*'
    
    fileInput.onchange = (e) => {
      const files = Array.from(e.target.files)
      if (files.length > 0) {
        const filePromises = files.map(file => {
          return new Promise((resolve, reject) => {
            const reader = new FileReader()
            reader.onload = () => {
              resolve({
                name: file.name,
                type: file.type,
                size: file.size,
                data: reader.result.split(',')[1] 
              })
            }
            reader.onerror = reject
            reader.readAsDataURL(file)
          })
        })
        
        Promise.all(filePromises)
          .then(fileData => {
            setAttachments(prev => [...prev, ...fileData])
         //   console.log('Files attached:', fileData.map(f => f.name))
          })
          .catch(error => {
            console.error('Error reading files:', error)
            alert('Error reading files. Please try again.')
          })
      }
    }
    
    fileInput.click()
  }

  const removeAttachment = (index) => {
    setAttachments(prev => prev.filter((_, i) => i !== index))
  }

  const handleContentChange = (e) => {
    const content = e.target.innerHTML
    setMessage(content)
    setIsTyping(true)
    setTimeout(() => setIsTyping(false), 100)
  }

  const showToast = (message, type = 'success') => {
    setToastMessage(message)
    setToastType(type)
    setToastVisible(true)
  }

  if (!isOpen) return null

  const handleSend = async () => {
    setSending(true)
    try {
      const tempDiv = document.createElement('div')
      tempDiv.innerHTML = message
      const plainTextMessage = tempDiv.textContent || tempDiv.innerText || ''
      const isValidEmailFormat = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
      
      let validCC = undefined
      let validBCC = undefined
      
      if (cc.trim()) {
        if (isValidEmailFormat(cc.trim())) {
          validCC = cc.trim()
        } else {
          alert('Invalid CC email address format')
          setSending(false)
          return
        }
      }
      
      if (bcc.trim()) {
        if (isValidEmailFormat(bcc.trim())) {
          validBCC = bcc.trim()
        } else {
          alert('Invalid BCC email address format')
          setSending(false)
          return
        }
      }

      const emailData = {
        to: to.trim(),
        cc: validCC,
        bcc: validBCC,
        subject: subject.trim(),
        message: plainTextMessage.trim(),
        htmlMessage: message.trim(), 
        from: userEmail,
        attachments: attachments.length > 0 ? attachments : undefined
      }

    //  console.log('Sending email via API:', emailData)
      
      const result = await authAPI.sendContactEmail(emailData)
      
    //  console.log('Email sent successfully:', result)
      
      if (result.simulated) {
        showToast(`Email Simulated - ${result.message}`, 'warning')
     //   console.log('Email Simulated (Not Actually Sent)', result.message, result.details)
      } else {
        showToast('Email sent successfully!', 'success')
      }
      
      setTimeout(() => {
        onClose()
      }, 2000)
    } catch (error) {
      console.error('Failed to send email:', error)
      showToast(`Failed to send email: ${error.message || 'Please try again.'}`, 'error')
      console.error(`Failed to send email: ${error.message || 'Please try again.'}`)
    } finally {
      setSending(false)
    }
  }

  const isValidEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  }

  const getPlainTextFromHtml = (html) => {
    const tempDiv = document.createElement('div')
    tempDiv.innerHTML = html
    return tempDiv.textContent || tempDiv.innerText || ''
  }

  const canSend = to.trim() && subject.trim() && getPlainTextFromHtml(message).trim() && isValidEmail(to)

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
          <h2 className="text-lg font-semibold text-gray-900">New Message</h2>
          <div className="flex items-center space-x-2">
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors rounded-lg p-1 hover:bg-gray-100"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="flex flex-col h-[calc(90vh-120px)]">
          <div className="border-b border-gray-200">
            <div className="flex items-center px-4 py-3 border-b border-gray-100">
              <label className="text-sm font-medium text-gray-600 w-12">To</label>
              <input
                type="email"
                value={to}
                onChange={(e) => setTo(e.target.value)}
                className="flex-1 px-2 py-1 text-sm border-none outline-none bg-transparent"
                placeholder="Enter recipient email"
              />
              <div className="flex items-center space-x-2 text-xs text-gray-500">
                <button
                  onClick={() => setShowCc(!showCc)}
                  className="hover:text-gray-700 transition-colors"
                >
                  Cc
                </button>
                <button
                  onClick={() => setShowBcc(!showBcc)}
                  className="hover:text-gray-700 transition-colors"
                >
                  Bcc
                </button>
              </div>
            </div>

            {showCc && (
              <div className="flex items-center px-4 py-3 border-b border-gray-100">
                <label className="text-sm font-medium text-gray-600 w-12">Cc</label>
                <input
                  type="email"
                  value={cc}
                  onChange={(e) => setCc(e.target.value)}
                  className="flex-1 px-2 py-1 text-sm border-none outline-none bg-transparent"
                  placeholder="Enter CC recipients (comma separated)"
                />
                <button
                  onClick={() => setShowCc(false)}
                  className="text-gray-400 hover:text-gray-600 ml-2"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            {showBcc && (
              <div className="flex items-center px-4 py-3 border-b border-gray-100">
                <label className="text-sm font-medium text-gray-600 w-12">Bcc</label>
                <input
                  type="email"
                  value={bcc}
                  onChange={(e) => setBcc(e.target.value)}
                  className="flex-1 px-2 py-1 text-sm border-none outline-none bg-transparent"
                  placeholder="Enter BCC recipients (comma separated)"
                />
                <button
                  onClick={() => setShowBcc(false)}
                  className="text-gray-400 hover:text-gray-600 ml-2"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            <div className="flex items-center px-4 py-3">
              <label className="text-sm font-medium text-gray-600 w-12">Subject</label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="flex-1 px-2 py-1 text-sm border-none outline-none bg-transparent"
                placeholder="Enter subject"
              />
            </div>
          </div>

          <div className="flex items-center px-4 py-2 border-b border-gray-200 bg-gray-50">
            <div className="flex items-center space-x-1">
              <button 
                onClick={() => formatText('bold')}
                className="p-1 text-gray-600 hover:text-gray-800 hover:bg-gray-200 rounded transition-colors"
                title="Bold (Ctrl+B)"
                type="button"
              >
                <Bold className="w-4 h-4" />
              </button>
              <button 
                onClick={() => formatText('italic')}
                className="p-1 text-gray-600 hover:text-gray-800 hover:bg-gray-200 rounded transition-colors"
                title="Italic (Ctrl+I)"
                type="button"
              >
                <Italic className="w-4 h-4" />
              </button>
              <button 
                onClick={() => formatText('underline')}
                className="p-1 text-gray-600 hover:text-gray-800 hover:bg-gray-200 rounded transition-colors"
                title="Underline (Ctrl+U)"
                type="button"
              >
                <Underline className="w-4 h-4" />
              </button>
              <div className="w-px h-4 bg-gray-300 mx-2"></div>
              <button 
                onClick={() => handleAlignment('left')}
                className="p-1 text-gray-600 hover:text-gray-800 hover:bg-gray-200 rounded transition-colors"
                title="Align Left"
                type="button"
              >
                <AlignLeft className="w-4 h-4" />
              </button>
              <button 
                onClick={() => handleAlignment('center')}
                className="p-1 text-gray-600 hover:text-gray-800 hover:bg-gray-200 rounded transition-colors"
                title="Align Center"
                type="button"
              >
                <AlignCenter className="w-4 h-4" />
              </button>
              <button 
                onClick={() => handleAlignment('right')}
                className="p-1 text-gray-600 hover:text-gray-800 hover:bg-gray-200 rounded transition-colors"
                title="Align Right"
                type="button"
              >
                <AlignRight className="w-4 h-4" />
              </button>
              <div className="w-px h-4 bg-gray-300 mx-2"></div>
              <button 
                onClick={handleList}
                className="p-1 text-gray-600 hover:text-gray-800 hover:bg-gray-200 rounded transition-colors"
                title="Bullet List"
                type="button"
              >
                <List className="w-4 h-4" />
              </button>
              <button 
                onClick={handleAttachment}
                className="p-1 text-gray-600 hover:text-gray-800 hover:bg-gray-200 rounded transition-colors"
                title="Attach Files"
                type="button"
              >
                <Paperclip className="w-4 h-4" />
              </button>
            </div>
          </div>

          {attachments.length > 0 && (
            <div className="px-4 py-2 border-b border-gray-200 bg-gray-50">
              <div className="flex items-center space-x-2 mb-2">
                <Paperclip className="w-4 h-4 text-gray-600" />
                <span className="text-sm font-medium text-gray-700">
                  {attachments.length} attachment{attachments.length > 1 ? 's' : ''}
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {attachments.map((file, index) => (
                  <div key={index} className="flex items-center space-x-2 bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm">
                    <span className="text-gray-700">{file.name}</span>
                    <span className="text-gray-500">({(file.size / 1024).toFixed(1)} KB)</span>
                    <button
                      onClick={() => removeAttachment(index)}
                      className="text-red-500 hover:text-red-700 ml-2"
                      title="Remove attachment"
                      type="button"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex-1 px-4 py-4">
            <div
              ref={setMessageRef}
              contentEditable
              suppressContentEditableWarning={true}
              onInput={handleContentChange}
              onKeyDown={(e) => {
                if (e.ctrlKey || e.metaKey) {
                  switch(e.key) {
                    case 'b':
                      e.preventDefault()
                      formatText('bold')
                      break
                    case 'i':
                      e.preventDefault()
                      formatText('italic')
                      break
                    case 'u':
                      e.preventDefault()
                      formatText('underline')
                      break
                  }
                }
                
                if (e.key === 'Enter') {
                  const selection = window.getSelection()
                  const range = selection.getRangeAt(0)
                  let parentElement = range.commonAncestorContainer
                  if (parentElement.nodeType === Node.TEXT_NODE) {
                    parentElement = parentElement.parentElement
                  }
                  
                  const listItem = parentElement.closest('li')
                  if (listItem && listItem.textContent.trim() === '') {
                    e.preventDefault()
                    document.execCommand('insertUnorderedList', false, null)
                  }
                }
              }}
              className="w-full h-full resize-none border-none outline-none text-sm leading-relaxed overflow-auto focus:ring-0 empty:before:content-[attr(data-placeholder)] empty:before:text-gray-400 empty:before:pointer-events-none"
              style={{ 
                minHeight: '200px',
                maxHeight: '400px'
              }}
              data-placeholder="Compose your message..."
            />
            <style>{`
              [contenteditable] ul {
                margin: 10px 0;
                padding-left: 20px;
              }
              [contenteditable] li {
                margin: 5px 0;
                list-style-type: disc;
              }
              [contenteditable] strong {
                font-weight: bold;
              }
              [contenteditable] em {
                font-style: italic;
              }
              [contenteditable] u {
                text-decoration: underline;
              }
            `}</style>
          </div>

          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200 bg-gray-50">
            <div className="flex items-center space-x-2">
              <button
                onClick={handleSend}
                disabled={!canSend || sending}
                className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {sending ? (
                  <>
                    <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                    <span>Sending...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Send</span>
                  </>
                )}
              </button>
              
              <div className="text-xs text-gray-500">
                From: {userEmail}
              </div>
            </div>

            <div className="flex items-center space-x-2 text-xs text-gray-500">
              {!isValidEmail(to) && to.trim() && (
                <span className="text-red-500">Invalid email format</span>
              )}
              {canSend && (
                <span className="text-green-600">Ready to send</span>
              )}
            </div>
          </div>
        </div>
      </div>
      
      <Toast
        message={toastMessage}
        type={toastType}
        isVisible={toastVisible}
        onClose={() => setToastVisible(false)}
        duration={3000}
      />
    </div>
  )
}

export default ContactAdminModal
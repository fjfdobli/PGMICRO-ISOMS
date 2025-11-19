const express = require('express')
const router = express.Router()
const multer = require('multer')
const path = require('path')
const fs = require('fs')
const { pool } = require('../config/database')
const { authenticateToken } = require('../middleware/auth')

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../uploads/chat')
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true })
    }
    cb(null, uploadDir)
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, uniqueSuffix + path.extname(file.originalname))
  }
})

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 50 * 1024 * 1024
  },
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase().substring(1)
    
    const allowedExtensions = [
      'jpeg', 'jpg', 'png', 'gif', 'bmp', 'svg', 'webp', 'ico', 'tiff', 'tif',
      'pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt', 'csv', 'json', 'xml', 'html', 'css', 'md',
      'zip', 'rar', '7z', 'tar', 'gz',
      'mp3', 'mp4', 'avi', 'mov', 'wmv', 'flv', 'mkv', 'webm', 'wav', 'ogg',
      'sql', 'db', 'mdb', 'accdb',
      'psd', 'ai', 'eps', 'indd',
      'dwg', 'dxf', 'step', 'stl', 'obj', 'fbx', 'blend', 'max', 'ma', 'mb', 'c4d',
      'js', 'ts', 'py', 'java', 'cpp', 'c', 'h', 'rb', 'php', 'go', 'swift', 'kt', 'rs', 'sh', 'bat',
      'exe', 'dll', 'apk', 'ipa', 'dmg', 'iso', 'log', 'bak', 'tmp'
    ]
    
    if (allowedExtensions.includes(ext) || 
        file.mimetype.startsWith('application/') || 
        file.mimetype.startsWith('text/') || 
        file.mimetype.startsWith('image/') || 
        file.mimetype.startsWith('video/') || 
        file.mimetype.startsWith('audio/')) {
      return cb(null, true)
    } else {
      cb(new Error(`File type .${ext} not supported`))
    }
  }
})

router.post('/upload', authenticateToken, (req, res, next) => {
  upload.single('file')(req, res, (err) => {
    if (err) {
      console.error('Multer upload error:', err)
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({
            success: false,
            message: 'File too large. Maximum size is 50MB'
          })
        }
        return res.status(400).json({
          success: false,
          message: `Upload error: ${err.message}`
        })
      }
      return res.status(400).json({
        success: false,
        message: err.message || 'Failed to upload file'
      })
    }
    next()
  })
}, async (req, res) => {
  try {
    if (!req.file) {
      console.error('Upload failed: No file in request')
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      })
    }

    const fileUrl = `/uploads/chat/${req.file.filename}`
    
    console.log('File uploaded successfully:', {
      filename: req.file.originalname,
      size: req.file.size,
      type: req.file.mimetype
    })
    
    res.json({
      success: true,
      file: {
        url: fileUrl,
        filename: req.file.originalname,
        size: req.file.size,
        type: req.file.mimetype
      }
    })
  } catch (error) {
    console.error('File upload error:', error)
    console.error('Error stack:', error.stack)
    res.status(500).json({
      success: false,
      message: 'Failed to upload file',
      error: error.message
    })
  }
})

router.get('/conversations', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id

    const [conversations] = await pool.query(
      `SELECT 
        c.id,
        c.type,
        c.name,
        c.created_at,
        c.last_message_at,
        c.last_message_preview,
        cp.last_read_at,
        cp.is_muted,
        cp.is_archived,
        COUNT(CASE WHEN m.created_at > COALESCE(cp.last_read_at, '1970-01-01') THEN 1 END) as unread_count,
        (SELECT JSON_ARRAYAGG(
          JSON_OBJECT(
            'user_id', u.id,
            'first_name', u.first_name,
            'last_name', u.last_name,
            'email', u.email,
            'account_type', u.account_type,
            'status', u.status
          )
        )
        FROM conversation_participants cp2
        INNER JOIN accounts u ON cp2.user_id = u.id
        WHERE cp2.conversation_id = c.id AND cp2.user_id != ?
        ) as participants
      FROM conversations c
      INNER JOIN conversation_participants cp ON c.id = cp.conversation_id
      LEFT JOIN messages m ON c.id = m.conversation_id AND m.is_deleted = FALSE
      WHERE cp.user_id = ? AND cp.is_archived = FALSE
      GROUP BY c.id, c.type, c.name, c.created_at, c.last_message_at, c.last_message_preview, 
               cp.last_read_at, cp.is_muted, cp.is_archived
      ORDER BY COALESCE(c.last_message_at, '1970-01-01') DESC`,
      [userId, userId]
    )

    const parsedConversations = conversations.map(conv => ({
      ...conv,
      participants: conv.participants ? (typeof conv.participants === 'string' ? JSON.parse(conv.participants) : conv.participants) : [],
      is_muted: Boolean(conv.is_muted),
      is_archived: Boolean(conv.is_archived)
    }))

    res.json({
      success: true,
      conversations: parsedConversations
    })
  } catch (error) {
    console.error('Get conversations error:', error)
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch conversations',
      error: error.message 
    })
  }
})

router.post('/conversations/direct', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id
    const { other_user_id } = req.body

    if (!other_user_id) {
      return res.status(400).json({ 
        success: false, 
        message: 'other_user_id is required' 
      })
    }

    if (userId === other_user_id) {
      return res.status(400).json({ 
        success: false, 
        message: 'Cannot create conversation with yourself' 
      })
    }

    const [otherUser] = await pool.query(
      `SELECT 
        id, 
        first_name, 
        last_name, 
        email,
        user_status,
        last_login,
        TIMESTAMPDIFF(SECOND, last_login, NOW()) as seconds_since_login
      FROM accounts 
      WHERE id = ? AND status = "active"`,
      [other_user_id]
    )

    if (otherUser.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found or inactive' 
      })
    }

    const user = otherUser[0]
    const seconds = user.seconds_since_login || 0
    let activeTime = 'Just now'
    
    if (seconds < 60) {
      activeTime = 'Active now'
    } else if (seconds < 3600) {
      const minutes = Math.floor(seconds / 60)
      activeTime = `Active ${minutes}m ago`
    } else if (seconds < 86400) {
      const hours = Math.floor(seconds / 3600)
      activeTime = `Active ${hours}h ago`
    } else {
      const days = Math.floor(seconds / 86400)
      activeTime = `Active ${days}d ago`
    }

    user.activeTime = activeTime
    user.status = user.user_status || 'offline'
    delete user.seconds_since_login
    delete user.user_status

    const [existing] = await pool.query(
      `SELECT c.id, c.type, c.created_at, c.last_message_at, c.last_message_preview
       FROM conversations c
       INNER JOIN conversation_participants cp1 ON c.id = cp1.conversation_id
       INNER JOIN conversation_participants cp2 ON c.id = cp2.conversation_id
       WHERE c.type = 'direct'
         AND cp1.user_id = ?
         AND cp2.user_id = ?
         AND (SELECT COUNT(*) FROM conversation_participants WHERE conversation_id = c.id) = 2`,
      [userId, other_user_id]
    )

    if (existing.length > 0) {
      return res.json({
        success: true,
        conversation: {
          ...existing[0],
          participants: [otherUser[0]],
          existed: true
        }
      })
    }

    const [result] = await pool.query(
      'INSERT INTO conversations (type, created_by) VALUES (?, ?)',
      ['direct', userId]
    )

    const conversationId = result.insertId

    await pool.query(
      `INSERT INTO conversation_participants (conversation_id, user_id) 
       VALUES (?, ?), (?, ?)`,
      [conversationId, userId, conversationId, other_user_id]
    )

    res.status(201).json({
      success: true,
      conversation: {
        id: conversationId,
        type: 'direct',
        participants: [otherUser[0]],
        created_at: new Date(),
        existed: false
      }
    })
  } catch (error) {
    console.error('Create direct conversation error:', error)
    res.status(500).json({ 
      success: false, 
      message: 'Failed to create conversation',
      error: error.message 
    })
  }
})

router.get('/conversations/:id/messages', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id
    const conversationId = req.params.id
    const limit = parseInt(req.query.limit) || 50
    const before = req.query.before 
    const [participant] = await pool.query(
      'SELECT id FROM conversation_participants WHERE conversation_id = ? AND user_id = ?',
      [conversationId, userId]
    )

    if (participant.length === 0) {
      return res.status(403).json({ 
        success: false, 
        message: 'You are not a participant in this conversation' 
      })
    }

    let query = `
      SELECT 
        m.id,
        m.message,
        m.type,
        m.file_url,
        m.metadata,
        m.is_edited,
        m.edited_at,
        m.created_at,
        m.sender_id,
        u.first_name as sender_first_name,
        u.last_name as sender_last_name,
        u.email as sender_email
      FROM messages m
      INNER JOIN accounts u ON m.sender_id = u.id
      WHERE m.conversation_id = ? 
        AND m.is_deleted = FALSE
    `
    const params = [conversationId]

    if (before) {
      query += ' AND m.created_at < ?'
      params.push(before)
    }

    query += ' ORDER BY m.created_at DESC LIMIT ?'
    params.push(limit)

    const [messages] = await pool.query(query, params)

    const unreadMessageIds = messages
      .filter(msg => msg.sender_id !== userId)
      .map(msg => msg.id)

    if (unreadMessageIds.length > 0) {
      const receiptValues = unreadMessageIds.map(msgId => [msgId, userId])
      await pool.query(
        `INSERT IGNORE INTO message_read_receipts (message_id, user_id) VALUES ?`,
        [receiptValues]
      )
    }

    let readReceipts = []
    if (messages.length > 0) {
      const messageIds = messages.map(m => m.id)
      const [receipts] = await pool.query(
        `SELECT 
          mrr.message_id,
          mrr.user_id,
          mrr.read_at,
          u.first_name,
          u.last_name
        FROM message_read_receipts mrr
        INNER JOIN accounts u ON mrr.user_id = u.id
        WHERE mrr.message_id IN (?)`,
        [messageIds]
      )
      readReceipts = receipts
    }

    const parsedMessages = messages.reverse().map(msg => {
      const metadata = msg.metadata ? (typeof msg.metadata === 'string' ? JSON.parse(msg.metadata) : msg.metadata) : null
      
      return {
        ...msg,
        metadata,
        file_name: metadata?.filename || metadata?.name || metadata?.fileName || metadata?.originalName || null,
        file_type: metadata?.type || metadata?.mimeType || metadata?.mimetype || null,
        file_size: metadata?.size || metadata?.fileSize || null,
        is_edited: Boolean(msg.is_edited),
        sender: {
          id: msg.sender_id,
          first_name: msg.sender_first_name,
          last_name: msg.sender_last_name,
          email: msg.sender_email
        },
        read_by: readReceipts
          .filter(r => r.message_id === msg.id && r.user_id !== msg.sender_id)
          .map(r => ({
            user_id: r.user_id,
            first_name: r.first_name,
            last_name: r.last_name,
            read_at: r.read_at
          }))
      }
    })

    res.json({
      success: true,
      messages: parsedMessages
    })
  } catch (error) {
    console.error('Get messages error:', error)
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch messages',
      error: error.message 
    })
  }
})

router.post('/conversations/:id/messages', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id
    const conversationId = req.params.id
    const { message, type = 'text', file_url = null, metadata = null } = req.body

    if (!message || message.trim() === '') {
      return res.status(400).json({ 
        success: false, 
        message: 'Message cannot be empty' 
      })
    }

    const [participant] = await pool.query(
      'SELECT id FROM conversation_participants WHERE conversation_id = ? AND user_id = ?',
      [conversationId, userId]
    )

    if (participant.length === 0) {
      return res.status(403).json({ 
        success: false, 
        message: 'You are not a participant in this conversation' 
      })
    }

    const [result] = await pool.query(
      `INSERT INTO messages (conversation_id, sender_id, message, type, file_url, metadata) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        conversationId, 
        userId, 
        message.trim(), 
        type, 
        file_url, 
        metadata ? JSON.stringify(metadata) : null
      ]
    )

    const messageId = result.insertId
    const preview = message.length > 100 ? message.substring(0, 100) + '...' : message
    await pool.query(
      'UPDATE conversations SET last_message_at = NOW(), last_message_preview = ? WHERE id = ?',
      [preview, conversationId]
    )

    await pool.query(
      'UPDATE conversation_participants SET last_read_at = NOW() WHERE conversation_id = ? AND user_id = ?',
      [conversationId, userId]
    )

    const [otherParticipants] = await pool.query(
      `SELECT cp.user_id, cp.is_muted, u.first_name, u.last_name
       FROM conversation_participants cp
       INNER JOIN accounts u ON cp.user_id = u.id
       WHERE cp.conversation_id = ? AND cp.user_id != ?`,
      [conversationId, userId]
    )

    if (otherParticipants.length > 0) {
      const senderName = `${req.user.first_name} ${req.user.last_name}`
      const notificationValues = otherParticipants
        .filter(p => !p.is_muted)
        .map(p => [
          p.user_id,
          'chat_message',
          `New message from ${senderName}`,
          preview,
          null, 
          JSON.stringify({ 
            conversation_id: conversationId, 
            message_id: messageId,
            sender_id: userId 
          })
        ])

      if (notificationValues.length > 0) {
        await pool.query(
          `INSERT INTO notifications (user_id, type, title, message, description, data) 
           VALUES ?`,
          [notificationValues]
        )
      }
    }

    const [sender] = await pool.query(
      'SELECT id, first_name, last_name, email FROM accounts WHERE id = ?',
      [userId]
    )

    const newMessage = {
      id: messageId,
      conversation_id: conversationId,
      message: message.trim(),
      type,
      file_url,
      metadata: metadata ? JSON.parse(JSON.stringify(metadata)) : null,
      is_edited: false,
      created_at: new Date(),
      sender_id: userId,
      sender: sender[0],
      read_by: []
    }

    const io = req.app.get('io')
    if (io) {
      io.to(`conversation:${conversationId}`).emit('new_message', newMessage)
      otherParticipants.forEach(p => {
        io.to(`user:${p.user_id}`).emit('new_notification', {
          type: 'chat_message',
          conversation_id: conversationId,
          message_preview: preview,
          sender_name: `${req.user.first_name} ${req.user.last_name}`
        })
      })
    }

    res.status(201).json({
      success: true,
      message: newMessage
    })
  } catch (error) {
    console.error('Send message error:', error)
    res.status(500).json({ 
      success: false, 
      message: 'Failed to send message',
      error: error.message 
    })
  }
})

router.patch('/conversations/:id/read', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id
    const conversationId = req.params.id
    const [participant] = await pool.query(
      'SELECT id FROM conversation_participants WHERE conversation_id = ? AND user_id = ?',
      [conversationId, userId]
    )

    if (participant.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Conversation not found' 
      })
    }

    await pool.query(
      'UPDATE conversation_participants SET last_read_at = NOW() WHERE conversation_id = ? AND user_id = ?',
      [conversationId, userId]
    )

    await pool.query(
      `UPDATE notifications 
       SET is_read = TRUE, read_at = NOW() 
       WHERE user_id = ? 
         AND type = 'chat_message' 
         AND JSON_EXTRACT(data, '$.conversation_id') = ?
         AND is_read = FALSE`,
      [userId, conversationId]
    )

    const [user] = await pool.query(
      'SELECT first_name, last_name FROM accounts WHERE id = ?',
      [userId]
    )

    const io = req.app.get('io')
    if (io && user.length > 0) {
      io.to(`conversation:${conversationId}`).emit('messages_seen', {
        conversation_id: conversationId,
        user_id: userId,
        user_name: `${user[0].first_name} ${user[0].last_name}`,
        read_at: new Date()
      })
    }

    res.json({
      success: true,
      message: 'Conversation marked as read'
    })
  } catch (error) {
    console.error('Mark conversation as read error:', error)
    res.status(500).json({ 
      success: false, 
      message: 'Failed to mark conversation as read',
      error: error.message 
    })
  }
})

router.get('/users', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id

    const [users] = await pool.query(
      `SELECT 
        id,
        first_name,
        last_name,
        email,
        account_type,
        last_login,
        user_status,
        TIMESTAMPDIFF(SECOND, last_login, NOW()) as seconds_since_login
      FROM accounts
      WHERE status = 'active' AND id != ?
      ORDER BY last_login DESC`,
      [userId]
    )

    const usersWithActivity = users.map(user => {
      const seconds = user.seconds_since_login || 0
      let activeTime = 'Just now'
      
      if (seconds < 60) {
        activeTime = 'Active now'
      } else if (seconds < 3600) {
        const minutes = Math.floor(seconds / 60)
        activeTime = `Active ${minutes}m ago`
      } else if (seconds < 86400) {
        const hours = Math.floor(seconds / 3600)
        activeTime = `Active ${hours}h ago`
      } else {
        const days = Math.floor(seconds / 86400)
        activeTime = `Active ${days}d ago`
      }

      return {
        ...user,
        activeTime,
        status: user.user_status || 'offline'
      }
    })

    res.json({
      success: true,
      users: usersWithActivity
    })
  } catch (error) {
    console.error('Get users error:', error)
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch users',
      error: error.message 
    })
  }
})

router.get('/unread-count', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id

    const [result] = await pool.query(
      `SELECT COUNT(DISTINCT c.id) as unread_conversations,
              SUM(CASE WHEN m.created_at > COALESCE(cp.last_read_at, '1970-01-01') THEN 1 ELSE 0 END) as unread_messages
       FROM conversations c
       INNER JOIN conversation_participants cp ON c.id = cp.conversation_id
       LEFT JOIN messages m ON c.id = m.conversation_id AND m.is_deleted = FALSE AND m.sender_id != ?
       WHERE cp.user_id = ? AND cp.is_archived = FALSE`,
      [userId, userId]
    )

    res.json({
      success: true,
      unread_conversations: result[0].unread_conversations || 0,
      unread_messages: result[0].unread_messages || 0
    })
  } catch (error) {
    console.error('Get unread count error:', error)
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch unread count',
      error: error.message 
    })
  }
})

router.delete('/messages/:id', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id
    const messageId = req.params.id
    const [message] = await pool.query(
      'SELECT id, conversation_id FROM messages WHERE id = ? AND sender_id = ? AND is_deleted = FALSE',
      [messageId, userId]
    )

    if (message.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Message not found or already deleted' 
      })
    }

    await pool.query(
      'UPDATE messages SET is_deleted = TRUE, deleted_at = NOW() WHERE id = ?',
      [messageId]
    )

    res.json({
      success: true,
      message: 'Message deleted'
    })
  } catch (error) {
    console.error('Delete message error:', error)
    res.status(500).json({ 
      success: false, 
      message: 'Failed to delete message',
      error: error.message 
    })
  }
})

router.patch('/conversations/:id/mute', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id
    const conversationId = req.params.id
    const { is_muted } = req.body

    await pool.query(
      'UPDATE conversation_participants SET is_muted = ? WHERE conversation_id = ? AND user_id = ?',
      [is_muted, conversationId, userId]
    )

    res.json({
      success: true,
      message: is_muted ? 'Conversation muted' : 'Conversation unmuted'
    })
  } catch (error) {
    console.error('Mute conversation error:', error)
    res.status(500).json({ 
      success: false, 
      message: 'Failed to update mute status',
      error: error.message 
    })
  }
})

module.exports = router

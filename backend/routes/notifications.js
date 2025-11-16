const express = require('express')
const router = express.Router()
const { pool } = require('../config/database')
const { authenticateToken } = require('../middleware/auth')

router.get('/', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id
    const limit = parseInt(req.query.limit) || 50
    const offset = parseInt(req.query.offset) || 0
    const unreadOnly = req.query.unread === 'true'

    let query = `
      SELECT 
        id,
        type,
        title,
        message,
        description,
        data,
        is_read,
        read_at,
        created_at,
        expires_at
      FROM notifications
      WHERE user_id = ?
        AND (expires_at IS NULL OR expires_at > NOW())
    `
    
    const params = [userId]

    if (unreadOnly) {
      query += ' AND is_read = FALSE'
    }

    query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?'
    params.push(limit, offset)

    const [notifications] = await pool.query(query, params)
    const parsedNotifications = notifications.map(notif => ({
      ...notif,
      data: notif.data ? (typeof notif.data === 'string' ? JSON.parse(notif.data) : notif.data) : null,
      is_read: Boolean(notif.is_read)
    }))

    res.json({
      success: true,
      notifications: parsedNotifications,
      total: parsedNotifications.length
    })
  } catch (error) {
    console.error('Get notifications error:', error)
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch notifications',
      error: error.message 
    })
  }
})

router.get('/unread-count', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id

    const [result] = await pool.query(
      `SELECT COUNT(*) as count 
       FROM notifications 
       WHERE user_id = ? 
         AND is_read = FALSE 
         AND (expires_at IS NULL OR expires_at > NOW())`,
      [userId]
    )

    res.json({
      success: true,
      count: result[0].count
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

router.patch('/:id/read', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id
    const notificationId = req.params.id
    const [notification] = await pool.query(
      'SELECT id FROM notifications WHERE id = ? AND user_id = ?',
      [notificationId, userId]
    )

    if (notification.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Notification not found' 
      })
    }

    await pool.query(
      'UPDATE notifications SET is_read = TRUE, read_at = NOW() WHERE id = ? AND user_id = ?',
      [notificationId, userId]
    )

    res.json({
      success: true,
      message: 'Notification marked as read'
    })
  } catch (error) {
    console.error('Mark as read error:', error)
    res.status(500).json({ 
      success: false, 
      message: 'Failed to mark notification as read',
      error: error.message 
    })
  }
})

router.patch('/mark-all-read', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id

    await pool.query(
      'UPDATE notifications SET is_read = TRUE, read_at = NOW() WHERE user_id = ? AND is_read = FALSE',
      [userId]
    )

    res.json({
      success: true,
      message: 'All notifications marked as read'
    })
  } catch (error) {
    console.error('Mark all as read error:', error)
    res.status(500).json({ 
      success: false, 
      message: 'Failed to mark all notifications as read',
      error: error.message 
    })
  }
})

router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id
    const notificationId = req.params.id
    const [notification] = await pool.query(
      'SELECT id FROM notifications WHERE id = ? AND user_id = ?',
      [notificationId, userId]
    )

    if (notification.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Notification not found' 
      })
    }

    await pool.query(
      'DELETE FROM notifications WHERE id = ? AND user_id = ?',
      [notificationId, userId]
    )

    res.json({
      success: true,
      message: 'Notification deleted'
    })
  } catch (error) {
    console.error('Delete notification error:', error)
    res.status(500).json({ 
      success: false, 
      message: 'Failed to delete notification',
      error: error.message 
    })
  }
})

router.delete('/clear-read', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id

    const [result] = await pool.query(
      'DELETE FROM notifications WHERE user_id = ? AND is_read = TRUE',
      [userId]
    )

    res.json({
      success: true,
      message: `Cleared ${result.affectedRows} read notifications`,
      deletedCount: result.affectedRows
    })
  } catch (error) {
    console.error('Clear read notifications error:', error)
    res.status(500).json({ 
      success: false, 
      message: 'Failed to clear read notifications',
      error: error.message 
    })
  }
})

router.post('/', authenticateToken, async (req, res) => {
  try {
    const { user_id, type, title, message, description, data, expires_at } = req.body
    if (!user_id || !title || !message) {
      return res.status(400).json({ 
        success: false, 
        message: 'Missing required fields: user_id, title, message' 
      })
    }

    const [targetUser] = await pool.query(
      'SELECT id FROM accounts WHERE id = ?',
      [user_id]
    )

    if (targetUser.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Target user not found' 
      })
    }

    const [result] = await pool.query(
      `INSERT INTO notifications 
        (user_id, type, title, message, description, data, expires_at) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        user_id,
        type || 'info',
        title,
        message,
        description || null,
        data ? JSON.stringify(data) : null,
        expires_at || null
      ]
    )

    res.status(201).json({
      success: true,
      message: 'Notification created',
      notificationId: result.insertId
    })
  } catch (error) {
    console.error('Create notification error:', error)
    res.status(500).json({ 
      success: false, 
      message: 'Failed to create notification',
      error: error.message 
    })
  }
})

router.post('/broadcast', authenticateToken, async (req, res) => {
  try {
    if (req.user.account_type !== 'admin') {
      return res.status(403).json({ 
        success: false, 
        message: 'Only administrators can broadcast notifications' 
      })
    }

    const { type, title, message, description, data, expires_at } = req.body

    if (!title || !message) {
      return res.status(400).json({ 
        success: false, 
        message: 'Missing required fields: title, message' 
      })
    }

    const [users] = await pool.query(
      'SELECT id FROM accounts WHERE status = "active"'
    )

    if (users.length === 0) {
      return res.json({
        success: true,
        message: 'No active users to notify',
        notificationCount: 0
      })
    }

    const values = users.map(user => [
      user.id,
      type || 'info',
      title,
      message,
      description || null,
      data ? JSON.stringify(data) : null,
      expires_at || null
    ])

    await pool.query(
      `INSERT INTO notifications 
        (user_id, type, title, message, description, data, expires_at) 
       VALUES ?`,
      [values]
    )

    res.status(201).json({
      success: true,
      message: `Notification sent to ${users.length} users`,
      notificationCount: users.length
    })
  } catch (error) {
    console.error('Broadcast notification error:', error)
    res.status(500).json({ 
      success: false, 
      message: 'Failed to broadcast notification',
      error: error.message 
    })
  }
})

module.exports = router

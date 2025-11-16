const express = require('express')
const router = express.Router()
const { pool } = require('../config/database')
const { authenticateToken, requireAdmin } = require('../middleware/auth')

/**
 * GET /api/settings
 * Get all system settings
 * Requires: Admin authentication
 */
router.get('/', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const [settings] = await pool.query(
      `SELECT 
        setting_key,
        setting_value,
        setting_type,
        category,
        description,
        updated_at
      FROM system_settings
      ORDER BY category, setting_key`
    )

    const settingsByCategory = settings.reduce((acc, setting) => {
      const { category, setting_key, setting_value, setting_type } = setting
      
      if (!acc[category]) {
        acc[category] = {}
      }

      let parsedValue = setting_value
      if (setting_type === 'boolean') {
        parsedValue = setting_value === 'true'
      } else if (setting_type === 'number') {
        parsedValue = parseFloat(setting_value)
      } else if (setting_type === 'json') {
        try {
          parsedValue = JSON.parse(setting_value)
        } catch (e) {
          parsedValue = setting_value
        }
      }

      acc[category][setting_key] = parsedValue
      return acc
    }, {})

    res.json({
      success: true,
      data: settingsByCategory,
      raw: settings 
    })
  } catch (error) {
    console.error('Error fetching settings:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to fetch settings'
    })
  }
})

/**
 * GET /api/settings/:category
 * Get settings for a specific category
 * Requires: Admin authentication
 */
router.get('/:category', authenticateToken, requireAdmin, async (req, res) => {
  const { category } = req.params
  
  try {
    const [settings] = await pool.query(
      `SELECT 
        setting_key,
        setting_value,
        setting_type,
        description,
        updated_at
      FROM system_settings
      WHERE category = ?
      ORDER BY setting_key`,
      [category]
    )

    if (settings.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      })
    }

    const settingsObject = settings.reduce((acc, setting) => {
      const { setting_key, setting_value, setting_type } = setting
      
      let parsedValue = setting_value
      if (setting_type === 'boolean') {
        parsedValue = setting_value === 'true'
      } else if (setting_type === 'number') {
        parsedValue = parseFloat(setting_value)
      } else if (setting_type === 'json') {
        try {
          parsedValue = JSON.parse(setting_value)
        } catch (e) {
          parsedValue = setting_value
        }
      }

      acc[setting_key] = parsedValue
      return acc
    }, {})

    res.json({
      success: true,
      category,
      data: settingsObject
    })
  } catch (error) {
    console.error('Error fetching category settings:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to fetch category settings'
    })
  }
})

/**
 * PUT /api/settings
 * Update system settings
 * Requires: Admin authentication
 * Body: { settings: { category: { setting_key: value } } }
 */
router.put('/', authenticateToken, requireAdmin, async (req, res) => {
  const { settings } = req.body
  const userId = req.user.id

  if (!settings || typeof settings !== 'object') {
    return res.status(400).json({
      success: false,
      message: 'Invalid settings object'
    })
  }

  const connection = await pool.getConnection()
  
  try {
    await connection.beginTransaction()

    const updates = []
    
    for (const [category, categorySettings] of Object.entries(settings)) {
      for (const [key, value] of Object.entries(categorySettings)) {
        updates.push({ key, value, category })
      }
    }

    for (const { key, value } of updates) {
      let settingValue
      let settingType

      if (typeof value === 'boolean') {
        settingValue = value.toString()
        settingType = 'boolean'
      } else if (typeof value === 'number') {
        settingValue = value.toString()
        settingType = 'number'
      } else if (typeof value === 'object') {
        settingValue = JSON.stringify(value)
        settingType = 'json'
      } else {
        settingValue = value.toString()
        settingType = 'string'
      }

      await connection.query(
        `UPDATE system_settings 
        SET setting_value = ?, 
            setting_type = ?,
            updated_by = ?
        WHERE setting_key = ?`,
        [settingValue, settingType, userId, key]
      )
    }

    await connection.commit()

    const [updatedSettings] = await pool.query(
      `SELECT 
        setting_key,
        setting_value,
        setting_type,
        category,
        updated_at
      FROM system_settings
      ORDER BY category, setting_key`
    )

    const settingsByCategory = updatedSettings.reduce((acc, setting) => {
      const { category, setting_key, setting_value, setting_type } = setting
      
      if (!acc[category]) {
        acc[category] = {}
      }

      let parsedValue = setting_value
      if (setting_type === 'boolean') {
        parsedValue = setting_value === 'true'
      } else if (setting_type === 'number') {
        parsedValue = parseFloat(setting_value)
      } else if (setting_type === 'json') {
        try {
          parsedValue = JSON.parse(setting_value)
        } catch (e) {
          parsedValue = setting_value
        }
      }

      acc[category][setting_key] = parsedValue
      return acc
    }, {})

    res.json({
      success: true,
      message: 'Settings updated successfully',
      data: settingsByCategory
    })

    const io = req.app.get('io')
    if (io) {
      io.emit('settings_updated', settingsByCategory)
    }

  } catch (error) {
    await connection.rollback()
    console.error('Error updating settings:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to update settings'
    })
  } finally {
    connection.release()
  }
})

/**
 * PUT /api/settings/:key
 * Update a single setting
 * Requires: Admin authentication
 * Body: { value: any }
 */
router.put('/:key', authenticateToken, requireAdmin, async (req, res) => {
  const { key } = req.params
  const { value } = req.body
  const userId = req.user.id

  if (value === undefined) {
    return res.status(400).json({
      success: false,
      message: 'Value is required'
    })
  }

  try {
    const [existing] = await pool.query(
      'SELECT id FROM system_settings WHERE setting_key = ?',
      [key]
    )

    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Setting not found'
      })
    }

    let settingValue
    let settingType

    if (typeof value === 'boolean') {
      settingValue = value.toString()
      settingType = 'boolean'
    } else if (typeof value === 'number') {
      settingValue = value.toString()
      settingType = 'number'
    } else if (typeof value === 'object') {
      settingValue = JSON.stringify(value)
      settingType = 'json'
    } else {
      settingValue = value.toString()
      settingType = 'string'
    }

    await pool.query(
      `UPDATE system_settings 
      SET setting_value = ?, 
          setting_type = ?,
          updated_by = ?
      WHERE setting_key = ?`,
      [settingValue, settingType, userId, key]
    )

    const [updated] = await pool.query(
      `SELECT 
        setting_key,
        setting_value,
        setting_type,
        category,
        updated_at
      FROM system_settings
      WHERE setting_key = ?`,
      [key]
    )

    res.json({
      success: true,
      message: 'Setting updated successfully',
      data: updated[0]
    })

    const io = req.app.get('io')
    if (io) {
      io.emit('setting_updated', { key, value })
    }

  } catch (error) {
    console.error('Error updating setting:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to update setting'
    })
  }
})

/**
 * POST /api/settings/reset
 * Reset all settings to defaults
 * Requires: Admin authentication
 */
router.post('/reset', authenticateToken, requireAdmin, async (req, res) => {
  const userId = req.user.id
  
  try {
    res.json({
      success: true,
      message: 'This endpoint can be implemented to reset settings to defaults'
    })
  } catch (error) {
    console.error('Error resetting settings:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to reset settings'
    })
  }
})

module.exports = router

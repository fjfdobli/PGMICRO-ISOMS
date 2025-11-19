const express = require('express')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { pool } = require('../config/database')
const emailService = require('../services/emailService')
const { authenticateToken } = require('../middleware/auth')
const router = express.Router()
const AVAILABLE_MODULES = [
'dashboard', 'sales', 'purchase-orders', 'returns',
  'inventory', 'customers', 'suppliers' ]

router.get('/bootstrap-check', async (req, res) => {
  try {
    const [result] = await pool.execute(
      'SELECT COUNT(*) as count FROM accounts WHERE account_type = "admin" AND status = "active"'
    )
    
    const isBootstrap = result[0].count === 0
    
    res.json({ 
      isBootstrap,
      message: isBootstrap ? 'Initial setup required' : 'System initialized'
    })
  } catch (error) {
    console.error('Bootstrap check error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

const requireAdmin = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1]
    
    if (!token) {
      return res.status(401).json({ error: 'No token provided' })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    
    const [users] = await pool.execute(
      'SELECT account_type FROM accounts WHERE id = ? AND status = "active"',
      [decoded.userId]
    )

    if (users.length === 0 || users[0].account_type !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' })
    }

    req.user = decoded
    next()
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' })
  }
}

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ 
        error: 'Email and password are required' 
      })
    }

    const [users] = await pool.execute(
      'SELECT a.*, admin.first_name as suspended_by_first_name, admin.last_name as suspended_by_last_name, admin.email as suspended_by_email FROM accounts a LEFT JOIN accounts admin ON a.suspended_by = admin.id WHERE a.email = ?',
      [email]
    )

    if (users.length === 0) {
      return res.status(401).json({ 
        error: 'Invalid email or password' 
      })
    }

    const user = users[0]
    
    const isValidPassword = await bcrypt.compare(password, user.password_hash)
    if (!isValidPassword) {
      return res.status(401).json({ 
        error: 'Invalid email or password' 
      })
    }

    if (user.status === 'pending') {
      return res.status(401).json({ 
        error: 'Your account is pending approval. Please wait for an administrator to approve your access request.',
        status: 'pending'
      })
    }

    if (user.status === 'suspended') {
      const suspensionDetails = {
        suspended_by: user.suspended_by_first_name && user.suspended_by_last_name 
          ? `${user.suspended_by_first_name} ${user.suspended_by_last_name}`
          : 'System Administrator',
        admin_email: user.suspended_by_email || 'admin@pgmicro.com',
        reason: user.suspension_reason || 'No reason provided',
        suspended_at: user.suspended_at
      }
      
      return res.status(401).json({ 
        error: 'Your account has been suspended.',
        suspended: true,
        suspensionDetails
      })
    }

    if (user.status === 'inactive') {
      return res.status(401).json({ 
        error: 'Your account is inactive. Please contact an administrator.',
        status: 'inactive'
      })
    }

    if (user.status !== 'active') {
      return res.status(401).json({ 
        error: 'Your account is not active. Please contact an administrator.',
        status: user.status
      })
    }

    await pool.execute(
      'UPDATE accounts SET last_login = NOW(), user_status = "online" WHERE id = ?',
      [user.id]
    )

    const token = jwt.sign(
      { 
        userId: user.id, 
        email: user.email, 
        accountType: user.account_type 
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    )

    const { password_hash, ...userWithoutPassword } = user
    if (userWithoutPassword.allowed_modules) {
      try {
        userWithoutPassword.allowed_modules = JSON.parse(userWithoutPassword.allowed_modules)
        console.log('Parsed allowed_modules for login:', userWithoutPassword.allowed_modules)
      } catch (e) {
        console.log('Error parsing allowed_modules, using stored value or setting default')
        if (Array.isArray(userWithoutPassword.allowed_modules)) {
          console.log('allowed_modules is already an array:', userWithoutPassword.allowed_modules)
        } else {
          userWithoutPassword.allowed_modules = user.account_type === 'admin' ? AVAILABLE_MODULES : ['dashboard']
        }
      }
    } else {
      console.log('No allowed_modules found, setting defaults')
      userWithoutPassword.allowed_modules = user.account_type === 'admin' ? AVAILABLE_MODULES : ['dashboard']
    }
    
    console.log('User logging in:', userWithoutPassword.email, 'Account Type:', userWithoutPassword.account_type, 'Modules:', userWithoutPassword.allowed_modules)
    
    res.json({
      success: true,
      token,
      user: userWithoutPassword
    })

  } catch (error) {
    console.error('Login error:', error)
    res.status(500).json({ 
      error: 'Internal server error' 
    })
  }
})

router.post('/register', async (req, res) => {
  try {
    const { email, password, firstName, lastName, accountType, phone, address, allowed_modules, allowedModules } = req.body
    
    console.log('Registration request received:', { email, firstName, lastName, accountType, allowed_modules, allowedModules })
    
    if (!email || !password || !firstName || !lastName) {
      return res.status(400).json({ 
        error: 'Email, password, first name, and last name are required' 
      })
    }

    const [adminCheck] = await pool.execute(
      'SELECT COUNT(*) as count FROM accounts WHERE account_type = "admin" AND status = "active"'
    )
    
    const isBootstrap = adminCheck[0].count === 0
    let finalAccountType = 'employee'
    let status = 'active'
    
    if (isBootstrap) {
      finalAccountType = 'admin'
      status = 'active'
      console.log('Bootstrap mode: Creating first admin user')
    } else {
      if (accountType === 'admin') {
        return res.status(403).json({ 
          error: 'Admin accounts can only be created by existing administrators through the User Management system' 
        })
      }
      finalAccountType = 'employee'
      status = 'pending' 
      console.log('Normal mode: Creating employee account pending approval')
    }

    let modulesToSave = []
    const modulesFromRequest = allowed_modules || allowedModules
    
    if (finalAccountType === 'admin') {
      modulesToSave = AVAILABLE_MODULES
    } else if (modulesFromRequest && Array.isArray(modulesFromRequest)) {
      modulesToSave = modulesFromRequest.filter(module => AVAILABLE_MODULES.includes(module))
      if (modulesToSave.length === 0) {
        modulesToSave = ['dashboard'] 
      }
    } else {
      modulesToSave = ['dashboard'] 
    }

    console.log('Modules to save for new user:', modulesToSave)

    const [existingUsers] = await pool.execute(
      'SELECT id FROM accounts WHERE email = ?',
      [email]
    )

    if (existingUsers.length > 0) {
      return res.status(400).json({ 
        error: 'User with this email already exists' 
      })
    }

    const saltRounds = 10
    const passwordHash = await bcrypt.hash(password, saltRounds)
    const modulesJson = JSON.stringify(modulesToSave)
    
    console.log('Saving user with modules JSON:', modulesJson)

    const [result] = await pool.execute(
      `INSERT INTO accounts (email, password_hash, first_name, last_name, account_type, phone, address, allowed_modules, status) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [email, passwordHash, firstName, lastName, finalAccountType, phone || null, address || null, modulesJson, status]
    )

    console.log('User created with ID:', result.insertId)

    const [newUser] = await pool.execute(
      'SELECT id, email, first_name, last_name, account_type, status, created_at, phone, address, allowed_modules FROM accounts WHERE id = ?',
      [result.insertId]
    )

    const user = newUser[0]
    console.log('New user from database:', user)
    console.log('Raw allowed_modules from database:', user.allowed_modules)
    console.log('Type of allowed_modules from new user:', typeof user.allowed_modules)
    
    if (user.allowed_modules) {
      if (typeof user.allowed_modules === 'string') {
        try {
          user.allowed_modules = JSON.parse(user.allowed_modules)
          console.log('Parsed allowed_modules from string:', user.allowed_modules)
        } catch (e) {
          console.log('Error parsing allowed_modules for new user:', e)
          user.allowed_modules = []
        }
      } else if (Array.isArray(user.allowed_modules)) {
        console.log('allowed_modules is already an array:', user.allowed_modules)
      } else {
        console.log('allowed_modules is not string or array, setting to empty array')
        user.allowed_modules = []
      }
    } else {
      console.log('No allowed_modules found for new user, setting to empty array')
      user.allowed_modules = []
    }

    console.log('Final new user object being returned:', user)

    if (isBootstrap) {
      res.status(201).json({
        success: true,
        message: 'Initial administrator account created successfully',
        user: user,
        isBootstrap: true
      })
    } else {
      res.status(201).json({
        success: true,
        message: 'Registration request submitted. Please wait for administrator approval.',
        user: user,
        isBootstrap: false
      })
    }

  } catch (error) {
    console.error('Register error:', error)
    res.status(500).json({ 
      error: 'Internal server error' 
    })
  }
})

router.get('/me', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id
    
    const [users] = await pool.execute(
      'SELECT id, email, first_name, last_name, account_type, status, created_at, last_login, phone, address, allowed_modules, user_status FROM accounts WHERE id = ? AND status = "active"',
      [userId]
    )

    if (users.length === 0) {
      return res.status(404).json({ 
        error: 'User not found' 
      })
    }

    const user = users[0]
 //   console.log('Raw user from /me endpoint:', user)
 //   console.log('User status from DB:', user.user_status)
 //   console.log('Raw allowed_modules from /me:', user.allowed_modules)
 //   console.log('Type of allowed_modules:', typeof user.allowed_modules)

    if (user.allowed_modules) {
      try {
        if (typeof user.allowed_modules === 'string') {
          user.allowed_modules = JSON.parse(user.allowed_modules)
          console.log('Parsed allowed_modules from string:', user.allowed_modules)
        } else if (Array.isArray(user.allowed_modules)) {
          console.log('allowed_modules already an array:', user.allowed_modules)
        } else {
          console.log('allowed_modules is object, converting:', user.allowed_modules)
          user.allowed_modules = Array.isArray(user.allowed_modules) ? user.allowed_modules : (user.account_type === 'admin' ? AVAILABLE_MODULES : ['dashboard'])
        }
      } catch (e) {
        console.log('Error parsing allowed_modules in /me:', e)
        user.allowed_modules = user.account_type === 'admin' ? AVAILABLE_MODULES : ['dashboard']
      }
    } else {
      console.log('No allowed_modules found, setting defaults')
      user.allowed_modules = user.account_type === 'admin' ? AVAILABLE_MODULES : ['dashboard']
    }

    console.log('Final user object from /me:', user)
    console.log('Final allowed_modules from /me:', user.allowed_modules)

    res.json({
      success: true,
      user: user
    })

  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        error: 'Invalid token' 
      })
    }
    
    console.error('Get user error:', error)
    res.status(500).json({ 
      error: 'Internal server error' 
    })
  }
})

router.get('/users', requireAdmin, async (req, res) => {
  try {
    const [users] = await pool.execute(
      'SELECT id, email, first_name, last_name, account_type, status, created_at, last_login, phone, address, allowed_modules, user_status FROM accounts ORDER BY created_at DESC'
    )

    const usersWithParsedModules = users.map(user => {
      console.log(`Processing user ${user.id} for getAll:`, user)
      console.log(`Raw allowed_modules for user ${user.id}:`, user.allowed_modules)
      console.log(`Type of allowed_modules for user ${user.id}:`, typeof user.allowed_modules)
      
      if (user.allowed_modules) {
        if (typeof user.allowed_modules === 'string') {
          try {
            user.allowed_modules = JSON.parse(user.allowed_modules)
            console.log(`Parsed allowed_modules from string for user ${user.id}:`, user.allowed_modules)
          } catch (e) {
            console.log(`Failed to parse allowed_modules for user ${user.id}, setting to default`)
            user.allowed_modules = user.account_type === 'admin' ? AVAILABLE_MODULES : ['dashboard']
          }
        } else if (Array.isArray(user.allowed_modules)) {
          console.log(`allowed_modules is already an array for user ${user.id}:`, user.allowed_modules)
        } else {
          console.log(`allowed_modules is not string or array for user ${user.id}, setting to default`)
          user.allowed_modules = user.account_type === 'admin' ? AVAILABLE_MODULES : ['dashboard']
        }
      } else {
        console.log(`No allowed_modules found for user ${user.id}, setting to default`)
        user.allowed_modules = user.account_type === 'admin' ? AVAILABLE_MODULES : ['dashboard']
      }
      
      console.log(`Final processed allowed_modules for user ${user.id}:`, user.allowed_modules)
      return user
    })

    res.json({
      success: true,
      data: usersWithParsedModules,
      availableModules: AVAILABLE_MODULES
    })

  } catch (error) {
    console.error('Get users error:', error)
    res.status(500).json({ 
      error: 'Internal server error' 
    })
  }
})

router.put('/users/:id', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params
    const { firstName, lastName, accountType, phone, address, allowed_modules, allowedModules, status } = req.body

    console.log('Update user request body:', req.body)
    console.log('Received allowed_modules:', allowed_modules)
    console.log('Received allowedModules:', allowedModules)

    if (!firstName || !lastName || !accountType) {
      return res.status(400).json({ 
        error: 'First name, last name, and account type are required' 
      })
    }

    if (!['admin', 'employee'].includes(accountType)) {
      return res.status(400).json({ 
        error: 'Account type must be either admin or employee' 
      })
    }

    let modulesToSave = []
    const modulesFromRequest = allowed_modules || allowedModules
    
    if (accountType === 'admin') {
      modulesToSave = AVAILABLE_MODULES
    } else if (modulesFromRequest && Array.isArray(modulesFromRequest)) {
      modulesToSave = modulesFromRequest.filter(module => AVAILABLE_MODULES.includes(module))
      if (modulesToSave.length === 0) {
        modulesToSave = ['dashboard']
      }
    } else {
      modulesToSave = ['dashboard']
    }

    console.log('Modules to save:', modulesToSave)

    await pool.execute(
      `UPDATE accounts SET 
       first_name = ?, last_name = ?, account_type = ?, phone = ?, address = ?, allowed_modules = ?, status = ?
       WHERE id = ?`,
      [firstName, lastName, accountType, phone || null, address || null, JSON.stringify(modulesToSave), status || 'active', id]
    )

    const [updatedUser] = await pool.execute(
      'SELECT id, email, first_name, last_name, account_type, status, created_at, last_login, phone, address, allowed_modules FROM accounts WHERE id = ?',
      [id]
    )

    if (updatedUser.length === 0) {
      return res.status(404).json({ error: 'User not found' })
    }

    const user = updatedUser[0]
    console.log('Raw updated user from database:', user)
    console.log('Raw allowed_modules from updated user:', user.allowed_modules)
    console.log('Type of allowed_modules from updated user:', typeof user.allowed_modules)
    
    if (user.allowed_modules) {
      if (typeof user.allowed_modules === 'string') {
        try {
          user.allowed_modules = JSON.parse(user.allowed_modules)
          console.log('Parsed allowed_modules from string:', user.allowed_modules)
        } catch (e) {
          console.log('Failed to parse allowed_modules, setting to empty array')
          user.allowed_modules = []
        }
      } else if (Array.isArray(user.allowed_modules)) {
        console.log('allowed_modules is already an array:', user.allowed_modules)
      } else {
        console.log('allowed_modules is not string or array, setting to empty array')
        user.allowed_modules = []
      }
    } else {
      console.log('No allowed_modules found for updated user, setting to empty array')
      user.allowed_modules = []
    }

    console.log('Final user object being returned:', user)
    res.json({
      success: true,
      message: 'User updated successfully',
      user: user
    })

  } catch (error) {
    console.error('Update user error:', error)
    res.status(500).json({ 
      error: 'Internal server error' 
    })
  }
})

router.delete('/users/:id', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params

    if (parseInt(id) === req.user.userId) {
      return res.status(400).json({ 
        error: 'You cannot delete your own account' 
      })
    }

    const [result] = await pool.execute(
      'DELETE FROM accounts WHERE id = ?',
      [id]
    )

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'User not found' })
    }

    res.json({
      success: true,
      message: 'User deleted successfully'
    })

  } catch (error) {
    console.error('Delete user error:', error)
    res.status(500).json({ 
      error: 'Internal server error' 
    })
  }
})

router.put('/users/:id/approve', requireAdmin, async (req, res) => {
  try {
    const userId = parseInt(req.params.id)
    const adminId = req.user.userId

    const [userCheck] = await pool.execute(
      'SELECT id, status, first_name, last_name FROM accounts WHERE id = ?',
      [userId]
    )

    if (userCheck.length === 0) {
      return res.status(404).json({ error: 'User not found' })
    }

    if (userCheck[0].status !== 'pending') {
      return res.status(400).json({ error: 'User is not pending approval' })
    }

    await pool.execute(
      'UPDATE accounts SET status = "active", approved_at = NOW(), approved_by = ? WHERE id = ?',
      [adminId, userId]
    )

    res.json({
      success: true,
      message: `User ${userCheck[0].first_name} ${userCheck[0].last_name} has been approved`
    })
  } catch (error) {
    console.error('Error approving user:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

router.put('/users/:id/reject', requireAdmin, async (req, res) => {
  try {
    const userId = parseInt(req.params.id)

    const [userCheck] = await pool.execute(
      'SELECT id, status, first_name, last_name FROM accounts WHERE id = ?',
      [userId]
    )

    if (userCheck.length === 0) {
      return res.status(404).json({ error: 'User not found' })
    }

    if (userCheck[0].status !== 'pending') {
      return res.status(400).json({ error: 'User is not pending approval' })
    }

    await pool.execute('DELETE FROM accounts WHERE id = ?', [userId])

    res.json({
      success: true,
      message: `User request for ${userCheck[0].first_name} ${userCheck[0].last_name} has been rejected`
    })
  } catch (error) {
    console.error('Error rejecting user:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

router.put('/users/:id/suspend', requireAdmin, async (req, res) => {
  try {
    const userId = parseInt(req.params.id)
    const { reason } = req.body
    const adminId = req.user.userId

    if (!reason || !reason.trim()) {
      return res.status(400).json({ error: 'Suspension reason is required' })
    }

    const [userCheck] = await pool.execute(
      'SELECT id, status, first_name, last_name, email FROM accounts WHERE id = ?',
      [userId]
    )

    if (userCheck.length === 0) {
      return res.status(404).json({ error: 'User not found' })
    }

    if (userCheck[0].status === 'suspended') {
      return res.status(400).json({ error: 'User is already suspended' })
    }

    if (userCheck[0].status === 'pending') {
      return res.status(400).json({ error: 'Cannot suspend pending users' })
    }

    await pool.execute(
      'UPDATE accounts SET status = "suspended", suspended_at = NOW(), suspended_by = ?, suspension_reason = ? WHERE id = ?',
      [adminId, reason.trim(), userId]
    )

    const [adminInfo] = await pool.execute(
      'SELECT first_name, last_name, email, smtp_host, smtp_port, smtp_password, smtp_enabled FROM accounts WHERE id = ?',
      [adminId]
    )

    let adminEmailConfig = null
    if (adminInfo[0].smtp_enabled && adminInfo[0].smtp_password) {
      adminEmailConfig = {
        email: adminInfo[0].email,
        smtp_host: adminInfo[0].smtp_host,
        smtp_port: adminInfo[0].smtp_port,
        smtp_password: adminInfo[0].smtp_password
      }
    }

    try {
      await emailService.sendSuspensionNotification(
        userCheck[0].email,
        `${userCheck[0].first_name} ${userCheck[0].last_name}`,
        `${adminInfo[0].first_name} ${adminInfo[0].last_name}`,
        reason.trim(),
        adminEmailConfig
      )
      console.log('Suspension notification email sent successfully')
    } catch (emailError) {
      console.error('Failed to send suspension notification email:', emailError)
    }

    res.json({
      success: true,
      message: `User ${userCheck[0].first_name} ${userCheck[0].last_name} has been suspended`
    })
  } catch (error) {
    console.error('Error suspending user:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

router.put('/users/:id/unsuspend', requireAdmin, async (req, res) => {
  try {
    const userId = parseInt(req.params.id)
    const adminId = req.user.userId
    const [userCheck] = await pool.execute(
      'SELECT id, status, first_name, last_name, email FROM accounts WHERE id = ?',
      [userId]
    )

    if (userCheck.length === 0) {
      return res.status(404).json({ error: 'User not found' })
    }

    if (userCheck[0].status !== 'suspended') {
      return res.status(400).json({ error: 'User is not suspended' })
    }

    await pool.execute(
      'UPDATE accounts SET status = "active", suspended_at = NULL, suspended_by = NULL, suspension_reason = NULL WHERE id = ?',
      [userId]
    )

    const [adminInfo] = await pool.execute(
      'SELECT first_name, last_name, email, smtp_host, smtp_port, smtp_password, smtp_enabled FROM accounts WHERE id = ?',
      [adminId]
    )

    let adminEmailConfig = null
    if (adminInfo[0].smtp_enabled && adminInfo[0].smtp_password) {
      adminEmailConfig = {
        email: adminInfo[0].email,
        smtp_host: adminInfo[0].smtp_host,
        smtp_port: adminInfo[0].smtp_port,
        smtp_password: adminInfo[0].smtp_password
      }
    }

    try {
      await emailService.sendAccountReactivationNotification(
        userCheck[0].email,
        `${userCheck[0].first_name} ${userCheck[0].last_name}`,
        `${adminInfo[0].first_name} ${adminInfo[0].last_name}`,
        adminEmailConfig
      )
      console.log('Reactivation notification email sent successfully')
    } catch (emailError) {
      console.error('Failed to send reactivation notification email:', emailError)
    }

    res.json({
      success: true,
      message: `User ${userCheck[0].first_name} ${userCheck[0].last_name} has been unsuspended`
    })
  } catch (error) {
    console.error('Error unsuspending user:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

router.post('/contact', async (req, res) => {
  try {
    const { to, cc, bcc, subject, message, htmlMessage, from, attachments } = req.body

    if (!to || !subject || !message || !from) {
      return res.status(400).json({ 
        error: 'To, subject, message, and from fields are required' 
      })
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(to) || !emailRegex.test(from)) {
      return res.status(400).json({ 
        error: 'Invalid email address format' 
      })
    }

    if (cc && cc.trim() && !emailRegex.test(cc)) {
      return res.status(400).json({ 
        error: 'Invalid CC email address format' 
      })
    }

    if (bcc && bcc.trim() && !emailRegex.test(bcc)) {
      return res.status(400).json({ 
        error: 'Invalid BCC email address format' 
      })
    }

    let emailAttachments = []
    if (attachments && Array.isArray(attachments)) {
      emailAttachments = attachments.map(file => ({
        filename: file.name,
        content: file.data,
        encoding: 'base64',
        contentType: file.type
      }))
    }

    let emailHtmlContent
    if (htmlMessage && htmlMessage.trim()) {
      emailHtmlContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333; border-bottom: 2px solid #007bff; padding-bottom: 10px;">
            Contact Message - PG Micro ISOMS
          </h2>
          
          <div style="background-color: #f8f9fa; padding: 15px; margin: 20px 0; border-left: 4px solid #007bff;">
            <p><strong>From:</strong> ${from}</p>
            <p><strong>Subject:</strong> ${subject}</p>
            ${cc ? `<p><strong>CC:</strong> ${cc}</p>` : ''}
            ${bcc ? `<p><strong>BCC:</strong> ${bcc}</p>` : ''}
            ${attachments && attachments.length > 0 ? `<p><strong>Attachments:</strong> ${attachments.map(f => f.name).join(', ')}</p>` : ''}
          </div>
          
          <div style="background-color: #ffffff; padding: 20px; border: 1px solid #ddd; border-radius: 5px;">
            <h3 style="color: #555; margin-top: 0;">Message:</h3>
            <div style="line-height: 1.6; color: #333;">
              ${htmlMessage}
            </div>
          </div>
          
          <div style="margin-top: 20px; padding: 15px; background-color: #e9ecef; border-radius: 5px; font-size: 12px; color: #666;">
            <p><strong>This email was sent through the PG Micro ISOMS contact system.</strong></p>
            <p>Reply directly to this email to respond to the sender.</p>
          </div>
        </div>
      `
    } else {
      emailHtmlContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333; border-bottom: 2px solid #007bff; padding-bottom: 10px;">
            Contact Message - PG Micro ISOMS
          </h2>
          
          <div style="background-color: #f8f9fa; padding: 15px; margin: 20px 0; border-left: 4px solid #007bff;">
            <p><strong>From:</strong> ${from}</p>
            <p><strong>Subject:</strong> ${subject}</p>
            ${cc ? `<p><strong>CC:</strong> ${cc}</p>` : ''}
            ${bcc ? `<p><strong>BCC:</strong> ${bcc}</p>` : ''}
            ${attachments && attachments.length > 0 ? `<p><strong>Attachments:</strong> ${attachments.map(f => f.name).join(', ')}</p>` : ''}
          </div>
          
          <div style="background-color: #ffffff; padding: 20px; border: 1px solid #ddd; border-radius: 5px;">
            <h3 style="color: #555; margin-top: 0;">Message:</h3>
            <div style="white-space: pre-line; line-height: 1.6; color: #333;">
              ${message}
            </div>
          </div>
          
          <div style="margin-top: 20px; padding: 15px; background-color: #e9ecef; border-radius: 5px; font-size: 12px; color: #666;">
            <p><strong>This email was sent through the PG Micro ISOMS contact system.</strong></p>
            <p>Reply directly to this email to respond to the sender.</p>
          </div>
        </div>
      `
    }

    const [adminResult] = await pool.execute(
      'SELECT email, smtp_host, smtp_port, smtp_password, smtp_enabled FROM accounts WHERE email = ? AND account_type = "admin" AND smtp_enabled = 1',
      [to]
    )

    const adminEmailConfig = adminResult.length > 0 ? adminResult[0] : null

    const result = await emailService.sendEmail(
      to,
      subject,
      emailHtmlContent,
      message, 
      adminEmailConfig,
      cc,
      bcc,
      emailAttachments
    )

    if (result.success) {
      res.json({
        success: true,
        message: result.simulated ? 'Email simulated (SMTP not configured)' : 'Email sent successfully',
        messageId: result.messageId,
        attachmentCount: emailAttachments.length,
        simulated: result.simulated || false,
        details: result.simulated ? 'Email was simulated due to SMTP authentication issues. Check backend logs for details.' : null
      })
    } else {
      res.status(500).json({
        error: 'Failed to send email',
        details: result.message || 'Unknown error'
      })
    }

  } catch (error) {
    console.error('Contact email error:', error)
    res.status(500).json({ 
      error: 'Failed to send contact email',
      details: error.message 
    })
  }
})

router.post('/logout', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id
    await pool.execute(
      'UPDATE accounts SET user_status = "offline" WHERE id = ?',
      [userId]
    )
    
    res.json({
      success: true,
      message: 'Logged out successfully'
    })
  } catch (error) {
    console.error('Logout error:', error)
    res.json({
      success: true,
      message: 'Logged out successfully'
    })
  }
})

router.put('/profile', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id
    const { first_name, last_name, email, phone, address } = req.body
    if (email) {
      const [existingUser] = await pool.query(
        'SELECT id FROM accounts WHERE email = ? AND id != ?',
        [email, userId]
      )
      
      if (existingUser.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'Email already in use by another account'
        })
      }
    }

    await pool.query(
      `UPDATE accounts 
       SET first_name = ?, last_name = ?, email = ?, phone = ?, address = ?, updated_at = NOW()
       WHERE id = ?`,
      [first_name, last_name, email, phone || null, address || null, userId]
    )

    const [updatedUser] = await pool.query(
      `SELECT id, first_name, last_name, email, phone, address, account_type, status, 
              created_at, last_login, allowed_modules
       FROM accounts WHERE id = ?`,
      [userId]
    )

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: updatedUser[0]
    })
  } catch (error) {
    console.error('Update profile error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to update profile',
      error: error.message
    })
  }
})

router.post('/change-password', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id
    const { current_password, new_password } = req.body

    if (!current_password || !new_password) {
      return res.status(400).json({
        success: false,
        message: 'Current password and new password are required'
      })
    }

    if (new_password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 6 characters long'
      })
    }

    const [user] = await pool.query(
      'SELECT password FROM accounts WHERE id = ?',
      [userId]
    )

    if (user.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      })
    }

    const isValidPassword = await bcrypt.compare(current_password, user[0].password)
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect'
      })
    }

    const hashedPassword = await bcrypt.hash(new_password, 10)
    await pool.query(
      'UPDATE accounts SET password = ?, updated_at = NOW() WHERE id = ?',
      [hashedPassword, userId]
    )

    res.json({
      success: true,
      message: 'Password changed successfully'
    })
  } catch (error) {
    console.error('Change password error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to change password',
      error: error.message
    })
  }
})

router.put('/status', authenticateToken, async (req, res) => {
  try {
    const { status } = req.body
    const userId = req.user.id

    const validStatuses = ['online', 'idle', 'dnd', 'invisible', 'offline']
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`
      })
    }

    const [result] = await pool.query(
      'UPDATE accounts SET user_status = ?, last_login = NOW() WHERE id = ?',
      [status, userId]
    )

    console.log(`Status updated for user ${userId}: ${status} (affected rows: ${result.affectedRows})`)

    const [users] = await pool.query(
      'SELECT user_status FROM accounts WHERE id = ?',
      [userId]
    )
    console.log(`Verified user ${userId} status in DB: ${users[0]?.user_status}`)

    res.json({
      success: true,
      message: 'Status updated successfully',
      status
    })
  } catch (error) {
    console.error('Update status error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to update status',
      error: error.message
    })
  }
})

router.post('/heartbeat', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id
    await pool.query(
      'UPDATE accounts SET last_login = NOW() WHERE id = ?',
      [userId]
    )

    res.json({
      success: true,
      message: 'Heartbeat received'
    })
  } catch (error) {
    console.error('Heartbeat error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to process heartbeat',
      error: error.message
    })
  }
})

module.exports = router

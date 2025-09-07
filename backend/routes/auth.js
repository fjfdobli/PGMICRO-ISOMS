const express = require('express')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { pool } = require('../config/database')
const router = express.Router()

// Available modules in the system
const AVAILABLE_MODULES = [
  'dashboard',
  'sales',
  'purchase-orders',
  'returns',
  'inventory',
  'customers',
  'suppliers'
]

// Middleware to verify admin access
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
      'SELECT * FROM accounts WHERE email = ? AND status = "active"',
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

    await pool.execute(
      'UPDATE accounts SET last_login = NOW() WHERE id = ?',
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
    
    // Parse allowed_modules if it exists
    if (userWithoutPassword.allowed_modules) {
      try {
        userWithoutPassword.allowed_modules = JSON.parse(userWithoutPassword.allowed_modules)
        console.log('Parsed allowed_modules for login:', userWithoutPassword.allowed_modules)
      } catch (e) {
        console.log('Error parsing allowed_modules, using stored value or setting default')
        // If parsing fails, check if it's already an array
        if (Array.isArray(userWithoutPassword.allowed_modules)) {
          console.log('allowed_modules is already an array:', userWithoutPassword.allowed_modules)
        } else {
          userWithoutPassword.allowed_modules = user.account_type === 'admin' ? AVAILABLE_MODULES : ['dashboard']
        }
      }
    } else {
      // Only set defaults if there's truly no data
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

router.post('/register', requireAdmin, async (req, res) => {
  try {
    const { email, password, firstName, lastName, accountType, phone, address, allowed_modules, allowedModules } = req.body
    
    console.log('Registration request received:', { email, firstName, lastName, accountType, allowed_modules, allowedModules })
    
    if (!email || !password || !firstName || !lastName || !accountType) {
      return res.status(400).json({ 
        error: 'Email, password, first name, last name, and account type are required' 
      })
    }

    if (!['admin', 'employee'].includes(accountType)) {
      return res.status(400).json({ 
        error: 'Account type must be either admin or employee' 
      })
    }

    // Validate allowed modules - check both field names for compatibility
    let modulesToSave = []
    const modulesFromRequest = allowed_modules || allowedModules
    
    if (accountType === 'admin') {
      modulesToSave = AVAILABLE_MODULES
    } else if (modulesFromRequest && Array.isArray(modulesFromRequest)) {
      modulesToSave = modulesFromRequest.filter(module => AVAILABLE_MODULES.includes(module))
      if (modulesToSave.length === 0) {
        modulesToSave = ['dashboard'] // Default to dashboard if no valid modules
      }
    } else {
      modulesToSave = ['dashboard'] // Default for employees
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
      `INSERT INTO accounts (email, password_hash, first_name, last_name, account_type, phone, address, allowed_modules) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [email, passwordHash, firstName, lastName, accountType, phone || null, address || null, modulesJson]
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
        // Keep it as is, it's already an array
      } else {
        console.log('allowed_modules is not string or array, setting to empty array')
        user.allowed_modules = []
      }
    } else {
      console.log('No allowed_modules found for new user, setting to empty array')
      user.allowed_modules = []
    }

    console.log('Final new user object being returned:', user)
    res.status(201).json({
      success: true,
      message: 'Account created successfully',
      user: user
    })

  } catch (error) {
    console.error('Register error:', error)
    res.status(500).json({ 
      error: 'Internal server error' 
    })
  }
})

router.get('/me', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1]
    
    if (!token) {
      return res.status(401).json({ 
        error: 'No token provided' 
      })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    
    const [users] = await pool.execute(
      'SELECT id, email, first_name, last_name, account_type, status, created_at, last_login, phone, address, allowed_modules FROM accounts WHERE id = ? AND status = "active"',
      [decoded.userId]
    )

    if (users.length === 0) {
      return res.status(404).json({ 
        error: 'User not found' 
      })
    }

    const user = users[0]
    console.log('Raw user from /me endpoint:', user)
    console.log('Raw allowed_modules from /me:', user.allowed_modules)
    console.log('Type of allowed_modules:', typeof user.allowed_modules)

    if (user.allowed_modules) {
      try {
        // Check if it's already parsed (sometimes MySQL returns objects)
        if (typeof user.allowed_modules === 'string') {
          user.allowed_modules = JSON.parse(user.allowed_modules)
          console.log('Parsed allowed_modules from string:', user.allowed_modules)
        } else if (Array.isArray(user.allowed_modules)) {
          console.log('allowed_modules already an array:', user.allowed_modules)
        } else {
          console.log('allowed_modules is object, converting:', user.allowed_modules)
          // If it's an object, try to convert it
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

// Get all users (admin only)
router.get('/users', requireAdmin, async (req, res) => {
  try {
    const [users] = await pool.execute(
      'SELECT id, email, first_name, last_name, account_type, status, created_at, last_login, phone, address, allowed_modules FROM accounts ORDER BY created_at DESC'
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
          // Keep it as is, it's already an array
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

// Update user (admin only)
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

    // Validate allowed modules - check both field names for compatibility
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
        // Keep it as is, it's already an array
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

// Delete user (admin only)
router.delete('/users/:id', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params

    // Prevent admin from deleting themselves
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

router.post('/logout', (req, res) => {
  res.json({
    success: true,
    message: 'Logged out successfully'
  })
})

module.exports = router
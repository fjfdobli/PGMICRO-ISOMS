const express = require('express')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { pool } = require('../config/database')
const router = express.Router()

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
    const { email, password, firstName, lastName, accountType, phone, address } = req.body
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

    const [result] = await pool.execute(
      `INSERT INTO accounts (email, password_hash, first_name, last_name, account_type, phone, address) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [email, passwordHash, firstName, lastName, accountType, phone || null, address || null]
    )

    const [newUser] = await pool.execute(
      'SELECT id, email, first_name, last_name, account_type, status, created_at, phone, address FROM accounts WHERE id = ?',
      [result.insertId]
    )

    res.status(201).json({
      success: true,
      message: 'Account created successfully',
      user: newUser[0]
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
      'SELECT id, email, first_name, last_name, account_type, status, created_at, last_login, phone, address FROM accounts WHERE id = ? AND status = "active"',
      [decoded.userId]
    )

    if (users.length === 0) {
      return res.status(404).json({ 
        error: 'User not found' 
      })
    }

    res.json({
      success: true,
      user: users[0]
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

router.post('/logout', (req, res) => {
  res.json({
    success: true,
    message: 'Logged out successfully'
  })
})

module.exports = router
const jwt = require('jsonwebtoken')
const { pool } = require('../config/database')

const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization
    const token = authHeader && authHeader.split(' ')[1]

    if (!token) {
      return res.status(401).json({ 
        error: 'Access token required' 
      })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    
    const [users] = await pool.execute(
      'SELECT id, email, first_name, last_name, account_type, status FROM accounts WHERE id = ? AND status = "active"',
      [decoded.userId]
    )

    if (users.length === 0) {
      return res.status(401).json({ 
        error: 'Invalid token or user not found' 
      })
    }

    req.user = users[0]
    next()

  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        error: 'Invalid token' 
      })
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        error: 'Token expired' 
      })
    }
    
    console.error('Auth middleware error:', error)
    res.status(500).json({ 
      error: 'Internal server error' 
    })
  }
}

const requireAdmin = (req, res, next) => {
  if (req.user.account_type !== 'admin') {
    return res.status(403).json({ 
      error: 'Admin access required' 
    })
  }
  next()
}

const requireEmployee = (req, res, next) => {
  if (!['admin', 'employee'].includes(req.user.account_type)) {
    return res.status(403).json({ 
      error: 'Employee or admin access required' 
    })
  }
  next()
}

module.exports = {
  authenticateToken,
  requireAdmin,
  requireEmployee
}
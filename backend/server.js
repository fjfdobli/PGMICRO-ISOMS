require('dotenv').config({ quiet: true })
const express = require('express')
const cors = require('cors')
const path = require('path')
const http = require('http')
const socketIO = require('socket.io')
const { testConnection } = require('./config/database')
const { endpoints, stats } = require('./config/apiDocs')
const ejs = require('ejs')
const app = express()
const server = http.createServer(app)
const io = socketIO(server, {
  cors: {
    origin: ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175', 'http://localhost:5176'],
    credentials: true,
    methods: ['GET', 'POST']
  }
})

const PORT = process.env.PORT || 3002
app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, 'views'))

app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175', 'http://localhost:5176'],
  credentials: true
}))

app.use(express.json({ limit: '60mb' })) 
app.use(express.urlencoded({ extended: true, limit: '60mb' }))
app.use(express.static('public'))
app.use('/uploads', express.static(path.join(__dirname, 'uploads')))
app.get('/favicon.ico', (req, res) => res.status(204).end())
app.use('/.well-known/appspecific', (req, res) => res.status(204).end())
app.set('io', io)
app.use('/api/auth', require('./routes/auth'))
app.use('/api/notifications', require('./routes/notifications'))
app.use('/api/chat', require('./routes/chat'))
app.use('/api/settings', require('./routes/settings'))
// app.use('/api/customers', require('./routes/customers'))
// app.use('/api/inventory', require('./routes/inventory'))
// app.use('/api/suppliers', require('./routes/suppliers'))
// app.use('/api/orders', require('./routes/orders'))

app.get('/', (req, res) => {
  const packageJson = require('./package.json')
  const baseUrl = `http://localhost:${PORT}`
  const enrichedEndpoints = endpoints.map(ep => ({
    ...ep,
    fullUrl: baseUrl + ep.path
  }))
  
  res.render('layouts/main', {
    title: 'PGMICRO ISOMS | API',
    version: packageJson.version,
    environment: process.env.NODE_ENV || 'development',
    serverUrl: baseUrl,
    endpoints: enrichedEndpoints,
    activeEndpoint: null,
    stats: stats,
    body: ejs.render(require('fs').readFileSync(path.join(__dirname, 'views/pages/index.ejs'), 'utf8'), { stats })
  })
})

app.get('/docs/:endpointId', (req, res) => {
  const packageJson = require('./package.json')
  const baseUrl = `http://localhost:${PORT}`
  const endpoint = endpoints.find(ep => ep.id === req.params.endpointId)
  
  if (!endpoint) {
    return res.redirect('/')
  }

  const enrichedEndpoints = endpoints.map(ep => ({
    ...ep,
    fullUrl: baseUrl + ep.path
  }))

  res.render('layouts/main', {
    title: `${endpoint.name} - PG Micro ISOMS API`,
    version: packageJson.version,
    environment: process.env.NODE_ENV || 'development',
    serverUrl: baseUrl,
    endpoints: enrichedEndpoints,
    activeEndpoint: endpoint.id,
    stats: stats,
    body: '' 
  })
})

app.get('/api', (req, res) => {
  res.json({ 
    message: 'PG Micro ISOMS API',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      auth: {
        bootstrap: '/api/auth/bootstrap-check',
        register: '/api/auth/register',
        login: '/api/auth/login',
        logout: '/api/auth/logout',
        verify: '/api/auth/verify',
        profile: '/api/auth/profile'
      }
    }
  })
})

app.get('/api/health', (req, res) => {
  res.json({ status: 'Server is running!', timestamp: new Date().toISOString() })
})

app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).json({ 
    error: 'Something went wrong!', 
    message: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error' 
  })
})

app.use((req, res) => {
  console.log(`Route not found: ${req.method} ${req.originalUrl}`)
  res.status(404).json({ 
    error: 'Route not found',
    path: req.originalUrl,
    method: req.method
  })
})

const initializeSettings = async () => {
  const { pool } = require('./config/database')
  
  try {
    const [rows] = await pool.query('SELECT COUNT(*) as count FROM system_settings')
    
    if (rows[0].count === 0) {
     // console.log('No settings found, initializing default settings...')
      
      const settings = [
        ['company_name', 'PGMICRO-ISOMS', 'string', 'general', 'Company name'],
        ['company_email', '', 'string', 'general', 'Company email address'],
        ['company_phone', '', 'string', 'general', 'Company phone number'],
        ['company_address', '', 'string', 'general', 'Company address'],
        ['timezone', 'Asia/Singapore', 'string', 'general', 'System timezone'],
        ['date_format', 'YYYY-MM-DD', 'string', 'general', 'Date display format'],
        ['time_format', '12h & 24h', 'string', 'general', 'Time display format'],
        ['currency', 'PHP', 'string', 'general', 'Default currency'],
        ['language', 'en', 'string', 'general', 'System language'],
        ['email_notifications', 'true', 'boolean', 'notifications', 'Enable email notifications'],
        ['push_notifications', 'true', 'boolean', 'notifications', 'Enable push notifications'],
        ['notification_sound', 'true', 'boolean', 'notifications', 'Enable notification sounds'],
        ['notify_on_new_order', 'true', 'boolean', 'notifications', 'Notify on new orders'],
        ['notify_on_low_stock', 'true', 'boolean', 'notifications', 'Notify on low stock'],
        ['notify_on_new_user', 'true', 'boolean', 'notifications', 'Notify on new user registration'],
        ['session_timeout', '30', 'number', 'security', 'Session timeout in minutes'],
        ['password_min_length', '6', 'number', 'security', 'Minimum password length'],
        ['max_login_attempts', '5', 'number', 'security', 'Maximum login attempts'],
        ['lockout_duration', '15', 'number', 'security', 'Account lockout duration in minutes'],
        ['password_require_special', 'false', 'boolean', 'security', 'Require special characters in passwords'],
        ['enable_2fa', 'false', 'boolean', 'security', 'Enable two-factor authentication'],
        ['theme', 'light', 'string', 'appearance', 'UI theme (light, dark, auto)'],
        ['primary_color', '#3B82F6', 'string', 'appearance', 'Primary color'],
        ['logo_url', '', 'string', 'appearance', 'Company logo URL'],
        ['max_file_size', '50', 'number', 'system', 'Maximum file upload size in MB'],
        ['enable_chat', 'true', 'boolean', 'system', 'Enable chat system'],
        ['enable_file_uploads', 'true', 'boolean', 'system', 'Enable file uploads'],
        ['enable_notifications', 'true', 'boolean', 'system', 'Enable notification system'],
        ['maintenance_mode', 'false', 'boolean', 'system', 'System maintenance mode']
      ]
      
      for (const [key, value, type, category, desc] of settings) {
        await pool.query(
          'INSERT INTO system_settings (setting_key, setting_value, setting_type, category, description) VALUES (?, ?, ?, ?, ?)',
          [key, value, type, category, desc]
        )
      }
      
      console.log(`Initialized ${settings.length} default settings`)
    } else {
    //  console.log(`System settings loaded (${rows[0].count} settings)`)
    }
  } catch (error) {
    console.error('Failed to initialize settings:', error.message)
  }
}

const startServer = async () => {
  try {
    await testConnection()
    await initializeSettings()
    
    io.on('connection', (socket) => {
     // console.log('User connected:', socket.id)
      
      socket.on('join', (userId) => {
        socket.join(`user:${userId}`)
      //  console.log(`User ${userId} joined their room`)
      })
      
      socket.on('join_conversation', (conversationId) => {
        socket.join(`conversation:${conversationId}`)
        // console.log(`Socket joined conversation ${conversationId}`)
      })
      
      socket.on('leave_conversation', (conversationId) => {
        socket.leave(`conversation:${conversationId}`)
        // console.log(`Socket left conversation ${conversationId}`)
      })
      
      socket.on('typing', ({ conversationId, userId, userName }) => {
        socket.to(`conversation:${conversationId}`).emit('user_typing', {
          conversationId,
          userId,
          userName
        })
      })
      
      socket.on('stop_typing', ({ conversationId, userId }) => {
        socket.to(`conversation:${conversationId}`).emit('user_stop_typing', {
          conversationId,
          userId
        })
      })
      
      socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id)
      })
    })
    
    server.listen(PORT, '0.0.0.0', () => {
      console.log(`Server ready on http://localhost:${PORT}`)
     // console.log(`Socket.IO ready for real-time connections`)
    })

    server.on('error', (error) => {
      console.error('Server error:', error)
      process.exit(1)
    })

    process.on('SIGINT', () => {
      console.log('\nShutting down server...')
      server.close(() => {
        console.log('Server closed')
        process.exit(0)
      })
    })

  } catch (error) {
    console.error('Failed to start server:', error)
    process.exit(1)
  }
}

startServer()
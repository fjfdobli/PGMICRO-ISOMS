require('dotenv').config({ quiet: true })
const express = require('express')
const cors = require('cors')
const path = require('path')
const { testConnection } = require('./config/database')
const { endpoints, stats } = require('./config/apiDocs')
const ejs = require('ejs')

const app = express()
const PORT = process.env.PORT || 3002
app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, 'views'))

app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175', 'http://localhost:5176'],
  credentials: true
}))

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(express.static('public'))

// Handle favicon requests to prevent 404 errors
app.get('/favicon.ico', (req, res) => res.status(204).end())
app.use('/.well-known/appspecific', (req, res) => res.status(204).end())

app.use('/api/auth', require('./routes/auth'))
// app.use('/api/customers', require('./routes/customers'))
// app.use('/api/inventory', require('./routes/inventory'))
// app.use('/api/suppliers', require('./routes/suppliers'))
// app.use('/api/orders', require('./routes/orders'))

// Documentation Routes
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

  // Enrich endpoints with full URLs
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
  console.log(`404 - Route not found: ${req.method} ${req.originalUrl}`)
  res.status(404).json({ 
    error: 'Route not found',
    path: req.originalUrl,
    method: req.method
  })
})

const startServer = async () => {
  try {
    await testConnection()
    
    const server = app.listen(PORT, '0.0.0.0', () => {
      console.log(`Server ready on http://localhost:${PORT}`)
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
require('dotenv').config()
const express = require('express')
const cors = require('cors')
const { testConnection } = require('./config/database')

const app = express()
const PORT = process.env.PORT || 3002

app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}))

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use('/api/auth', require('./routes/auth'))
// app.use('/api/customers', require('./routes/customers'))
// app.use('/api/inventory', require('./routes/inventory'))
// app.use('/api/suppliers', require('./routes/suppliers'))
// app.use('/api/orders', require('./routes/orders'))

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
  res.status(404).json({ error: 'Route not found' })
})

const startServer = async () => {
  try {
    await testConnection()
    
    const server = app.listen(PORT, '0.0.0.0', () => {
      console.log(`Server running on http://localhost:${PORT}`)
      console.log(`API endpoints available at http://localhost:${PORT}/api/`)
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
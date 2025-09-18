const mysql = require('mysql2/promise')
require('dotenv').config()

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'pgmicro_isoms',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  acquireTimeout: 60000,
  timeout: 60000
})

const testConnection = async () => {
  try {
    const connection = await pool.getConnection()
    console.log('✅ Database connected successfully')
    console.log(`📊 Connected to: ${process.env.DB_HOST || 'localhost'}`)
    console.log(`👤 User: ${process.env.DB_USER || 'root'}`)
    console.log(`🗄️  Database: ${process.env.DB_NAME || 'pgmicro_isoms'}`)
    connection.release()
  } catch (error) {
    console.error('❌ Database connection failed:', error.message)
    console.error('💡 Make sure to:')
    console.error('   1. Check your .env file has correct DB credentials')
    console.error('   2. Ensure MySQL server is running')
    console.error('   3. Verify the database exists')
    console.error('   4. Check if the user has proper permissions')
    process.exit(1)
  }
};

module.exports = { pool, testConnection }
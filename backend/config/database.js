const mysql = require('mysql2/promise')
require('dotenv').config()

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'ferdinand',
  password: process.env.DB_PASSWORD || 'root',
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
    console.log('Database connected successfully')
    connection.release()
  } catch (error) {
    console.error('Database connection failed:', error.message)
    process.exit(1)
  }
};

module.exports = { pool, testConnection }
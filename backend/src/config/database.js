const mysql = require('mysql2/promise');
require('dotenv').config();

const host = process.env.DB_HOST || 'localhost';
const user = process.env.DB_USER || 'root';
const pass = process.env.DB_PASSWORD || '';
const db = process.env.DB_NAME || 'efacet';

// Create connection pool
const pool = mysql.createPool({
  host: host,
  user: user,
  password: pass,
  database: db,
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Test connection function
const testConnection = async () => {
  try {
    const connection = await pool.getConnection();
    console.log('✅ Database connected successfully to:', db);
    connection.release();
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    console.error('Connection details:', { host, user, database: db });
    return false;
  }
};

// Export pool directly (main export)
module.exports = pool;

// Also export test function if needed
module.exports.testConnection = testConnection;
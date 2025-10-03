const mysql = require('mysql2/promise');
require('dotenv').config();

// Konfigurasi database
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'lapangan_kita_db',
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

// Membuat pool connection untuk efisiensi
const pool = mysql.createPool(dbConfig);

// Fungsi untuk test koneksi database
const testConnection = async () => {
  try {
    const connection = await pool.getConnection();
    console.log('✅ Database connected successfully');
    connection.release();
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    return false;
  }
};

// Fungsi untuk eksekusi query
const executeQuery = async (query, params = []) => {
  try {
    const [results] = await pool.execute(query, params);
    return results;
  } catch (error) {
    console.error('Query execution error:', error);
    throw error;
  }
};

module.exports = {
  pool,
  testConnection,
  executeQuery
};
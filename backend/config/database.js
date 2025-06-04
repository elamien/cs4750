import 'dotenv/config';
import mysql from 'mysql2/promise';

// MySQL Connection Pool
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'adminuser',
  password: process.env.DB_PASSWORD || 'HooJams2024!',
  database: process.env.DB_NAME || 'hoojams',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Test DB Connection
async function testDbConnection() {
  try {
    const connection = await pool.getConnection();
    console.log('Successfully connected to the MySQL database.');
    connection.release();
  } catch (error) {
    console.error('Error connecting to the MySQL database:', error);
    // process.exit(1); // Optional: exit if cannot connect to DB
  }
}

export { pool, testDbConnection }; 
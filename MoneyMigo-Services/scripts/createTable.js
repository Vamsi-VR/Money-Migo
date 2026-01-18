const mysql = require('mysql2/promise');
require('dotenv').config();

async function createTransactionsTable() {
  let connection;
  try {
    // Connect without specifying database first
    connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      port: process.env.DB_PORT
    });
    
    console.log('Connected to MySQL server');
    
    // Create database if it doesn't exist
    await connection.query('CREATE DATABASE IF NOT EXISTS moneymigo');
    console.log('Database created or already exists');
    
    // Use the database
    await connection.query('USE moneymigo');
    
    // Create transactions table
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS transactions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        type VARCHAR(100) NULL,
        category VARCHAR(100),
        amount DECIMAL(10, 2) ,
        description TEXT,
        date DATE ,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `;
    
    await connection.query(createTableQuery);
    console.log('Transactions table created successfully');
    
    await connection.end();
    process.exit(0);
  } catch (error) {
    console.error('Error creating table:', error);
    if (connection) await connection.end();
    process.exit(1);
  }
}

createTransactionsTable();

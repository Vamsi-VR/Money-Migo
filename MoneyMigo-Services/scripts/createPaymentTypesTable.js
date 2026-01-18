const db = require('../config/db');

async function createPaymentTypesTable() {
  try {
    // First, update transactions table to use VARCHAR instead of ENUM
    await db.query("ALTER TABLE transactions MODIFY payment_type VARCHAR(100) NOT NULL");
    console.log('✓ Updated transactions table payment_type to VARCHAR');
    
    // Create payment_types table
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS payment_types (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL UNIQUE,
        is_default BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    
    await db.query(createTableQuery);
    console.log('✓ Payment types table created');
    
    // Insert default payment types
    const defaultTypes = [
      { name: 'cash', is_default: true },
      { name: 'upi', is_default: true },
      { name: 'card', is_default: true },
      { name: 'hdfc_debit', is_default: false }
    ];
    
    for (const type of defaultTypes) {
      await db.query(
        'INSERT IGNORE INTO payment_types (name, is_default) VALUES (?, ?)',
        [type.name, type.is_default]
      );
    }
    
    console.log('✓ Default payment types inserted');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

createPaymentTypesTable();

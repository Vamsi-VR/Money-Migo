const db = require('../config/db');

async function updatePaymentTypes() {
  try {
    await db.query("ALTER TABLE transactions MODIFY payment_type ENUM('cash','upi','card','hdfc_debit')");
    console.log('✓ Payment type updated successfully - added hdfc_debit');
    process.exit(0);
  } catch (error) {
    console.error('Error updating payment types:', error.message);
    process.exit(1);
  }
}

updatePaymentTypes();

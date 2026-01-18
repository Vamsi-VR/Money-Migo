const db = require("../config/db");

async function addWithdrawnColumn() {
  try {
    // Add withdrawn column to transactions table
    const addColumnQuery = `
      ALTER TABLE transactions 
      ADD COLUMN withdrawn TINYINT(1) DEFAULT 0
    `;

    await db.query(addColumnQuery);
    console.log("✓ Added withdrawn column to transactions table");

    process.exit(0);
  } catch (error) {
    console.error("Error adding withdrawn column:", error.message);
    process.exit(1);
  }
}

addWithdrawnColumn();

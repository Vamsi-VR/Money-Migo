const db = require('../config/db');

// Get all payment types
exports.getPaymentTypes = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM payment_types ORDER BY is_default DESC, name ASC');
    res.json(rows);
  } catch (error) {
    console.error('Error fetching payment types:', error);
    res.status(500).json({ error: 'Failed to fetch payment types' });
  }
};

// Add a new payment type
exports.addPaymentType = async (req, res) => {
  try {
    const { name } = req.body;
    
    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Payment type name is required' });
    }
    
    const [result] = await db.query(
      'INSERT INTO payment_types (name, is_default) VALUES (?, FALSE)',
      [name.trim().toLowerCase()]
    );
    
    res.status(201).json({ 
      id: result.insertId, 
      name: name.trim().toLowerCase(),
      is_default: false
    });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ error: 'Payment type already exists' });
    }
    console.error('Error adding payment type:', error);
    res.status(500).json({ error: 'Failed to add payment type' });
  }
};

// Delete a payment type
exports.deletePaymentType = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if it's a default payment type
    const [paymentType] = await db.query('SELECT is_default FROM payment_types WHERE id = ?', [id]);
    
    if (paymentType.length === 0) {
      return res.status(404).json({ error: 'Payment type not found' });
    }
    
    if (paymentType[0].is_default) {
      return res.status(400).json({ error: 'Cannot delete default payment types' });
    }
    
    await db.query('DELETE FROM payment_types WHERE id = ?', [id]);
    res.json({ message: 'Payment type deleted successfully' });
  } catch (error) {
    console.error('Error deleting payment type:', error);
    res.status(500).json({ error: 'Failed to delete payment type' });
  }
};

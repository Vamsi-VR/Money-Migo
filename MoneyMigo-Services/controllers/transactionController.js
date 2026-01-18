const db = require('../config/db');

// Get all transactions with filtering support
exports.getAllTransactions = async (req, res) => {
  try {
    const { startDate, endDate, purpose, month, year, sortOrder, includeWithdrawn } = req.query;
    
    let query = 'SELECT * FROM transactions WHERE 1=1';
    const params = [];
    
    // Filter out withdrawn transactions by default
    if (includeWithdrawn !== 'true') {
      query += ' AND (withdrawn IS NULL OR withdrawn = 0)';
    }
    
    // Date range filter
    if (startDate && endDate) {
      query += ' AND transaction_date BETWEEN ? AND ?';
      params.push(startDate, endDate);
    } else if (startDate) {
      query += ' AND transaction_date >= ?';
      params.push(startDate);
    } else if (endDate) {
      query += ' AND transaction_date <= ?';
      params.push(endDate);
    }
    
    // Month and year filter
    if (month && year) {
      query += ' AND MONTH(transaction_date) = ? AND YEAR(transaction_date) = ?';
      params.push(month, year);
    } else if (month) {
      query += ' AND MONTH(transaction_date) = ?';
      params.push(month);
    } else if (year) {
      query += ' AND YEAR(transaction_date) = ?';
      params.push(year);
    }
    
    // Purpose filter
    if (purpose) {
      query += ' AND purpose = ?';
      params.push(purpose);
    }
    
    // Sort order
    const order = sortOrder === 'asc' ? 'ASC' : 'DESC';
    query += ` ORDER BY transaction_date ${order}, created_at ${order}`;
    
    const [rows] = await db.query(query, params);
    res.json(rows);
  } catch (error) {
    console.error('Error fetching transactions:', error);
    res.status(500).json({ error: 'Failed to fetch transactions' });
  }
};

// Create a transaction
exports.createTransaction = async (req, res) => {
  try {
    const { type, amount, transaction_date, purpose, description, payment_type } = req.body;
    
    const [result] = await db.query(
      'INSERT INTO transactions (type, amount, transaction_date, purpose, description, payment_type) VALUES (?, ?, ?, ?, ?, ?)',
      [type, amount, transaction_date, purpose, description, payment_type]
    );
    
    res.status(201).json({ 
      id: result.insertId, 
      type, 
      amount, 
      transaction_date, 
      purpose, 
      description, 
      payment_type 
    });
  } catch (error) {
    console.error('Error creating transaction:', error);
    res.status(500).json({ error: 'Failed to create transaction' });
  }
};

// Update a transaction
exports.updateTransaction = async (req, res) => {
  try {
    const { id } = req.params;
    const { type, amount, transaction_date, purpose, description, payment_type } = req.body;
    
    await db.query(
      'UPDATE transactions SET type = ?, amount = ?, transaction_date = ?, purpose = ?, description = ?, payment_type = ? WHERE id = ?',
      [type, amount, transaction_date, purpose, description, payment_type, id]
    );
    
    res.json({ 
      id, 
      type, 
      amount, 
      transaction_date, 
      purpose, 
      description, 
      payment_type 
    });
  } catch (error) {
    console.error('Error updating transaction:', error);
    res.status(500).json({ error: 'Failed to update transaction' });
  }
};

// Delete a transaction
exports.deleteTransaction = async (req, res) => {
  try {
    const { id } = req.params;
    await db.query('DELETE FROM transactions WHERE id = ?', [id]);
    res.json({ message: 'Transaction deleted successfully' });
  } catch (error) {
    console.error('Error deleting transaction:', error);
    res.status(500).json({ error: 'Failed to delete transaction' });
  }
};

// Get transaction statistics with filtering support
exports.getTransactionStats = async (req, res) => {
  try {
    const { startDate, endDate, purpose, month, year } = req.query;
    
    let whereClause = ' WHERE 1=1';
    const params = [];
    
    // Exclude withdrawn transactions from stats
    whereClause += ' AND (withdrawn IS NULL OR withdrawn = 0)';
    
    // Date range filter
    if (startDate && endDate) {
      whereClause += ' AND transaction_date BETWEEN ? AND ?';
      params.push(startDate, endDate);
    } else if (startDate) {
      whereClause += ' AND transaction_date >= ?';
      params.push(startDate);
    } else if (endDate) {
      whereClause += ' AND transaction_date <= ?';
      params.push(endDate);
    }
    
    // Month and year filter
    if (month && year) {
      whereClause += ' AND MONTH(transaction_date) = ? AND YEAR(transaction_date) = ?';
      params.push(month, year);
    } else if (month) {
      whereClause += ' AND MONTH(transaction_date) = ?';
      params.push(month);
    } else if (year) {
      whereClause += ' AND YEAR(transaction_date) = ?';
      params.push(year);
    }
    
    // Purpose filter
    if (purpose) {
      whereClause += ' AND purpose = ?';
      params.push(purpose);
    }
    
    const incomeParams = [...params];
    const expenseParams = [...params];
    
    const [income] = await db.query(
      `SELECT COALESCE(SUM(amount), 0) as total FROM transactions${whereClause} AND type = "income"`,
      incomeParams
    );
    const [expense] = await db.query(
      `SELECT COALESCE(SUM(amount), 0) as total FROM transactions${whereClause} AND type = "expense"`,
      expenseParams
    );
    
    const totalIncome = parseFloat(income[0].total) || 0;
    const totalExpense = parseFloat(expense[0].total) || 0;
    const balance = totalIncome - totalExpense;
    
    res.json({
      totalIncome: totalIncome,
      totalExpense: totalExpense,
      balance: balance
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
};

// Withdraw an investment
exports.withdrawInvestment = async (req, res) => {
  try {
    const { id } = req.params;
    await db.query('UPDATE transactions SET withdrawn = 1 WHERE id = ?', [id]);
    res.json({ message: 'Investment withdrawn successfully' });
  } catch (error) {
    console.error('Error withdrawing investment:', error);
    res.status(500).json({ error: 'Failed to withdraw investment' });
  }
};

// Reopen a withdrawn investment
exports.reopenInvestment = async (req, res) => {
  try {
    const { id } = req.params;
    await db.query('UPDATE transactions SET withdrawn = 0 WHERE id = ?', [id]);
    res.json({ message: 'Investment reopened successfully' });
  } catch (error) {
    console.error('Error reopening investment:', error);
    res.status(500).json({ error: 'Failed to reopen investment' });
  }
};

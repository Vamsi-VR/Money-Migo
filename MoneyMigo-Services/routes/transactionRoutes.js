const express = require('express');
const router = express.Router();
const transactionController = require('../controllers/transactionController');

// Get all transactions
router.get('/', transactionController.getAllTransactions);

// Get transaction statistics - MUST be before /:id routes
router.get('/stats', transactionController.getTransactionStats);

// Withdraw an investment - MUST be before /:id routes
router.patch('/:id/withdraw', transactionController.withdrawInvestment);

// Reopen a withdrawn investment - MUST be before /:id routes
router.patch('/:id/reopen', transactionController.reopenInvestment);

// Create a transaction
router.post('/', transactionController.createTransaction);

// Update a transaction
router.put('/:id', transactionController.updateTransaction);

// Delete a transaction
router.delete('/:id', transactionController.deleteTransaction);

module.exports = router;

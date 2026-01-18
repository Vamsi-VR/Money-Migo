const express = require('express');
const router = express.Router();
const paymentTypeController = require('../controllers/paymentTypeController');

// Get all payment types
router.get('/', paymentTypeController.getPaymentTypes);

// Add a new payment type
router.post('/', paymentTypeController.addPaymentType);

// Delete a payment type
router.delete('/:id', paymentTypeController.deletePaymentType);

module.exports = router;

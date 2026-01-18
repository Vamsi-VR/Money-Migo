const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Import routes
const transactionRoutes = require('./routes/transactionRoutes');
const paymentTypeRoutes = require('./routes/paymentTypeRoutes');

// Test route
app.get('/api/health', (req, res) => {
  res.json({ status: 'Server is running' });
});

// Use routes
app.use('/api/transactions', transactionRoutes);
app.use('/api/payment-types', paymentTypeRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});


// Polyfill WebSocket for Node.js serverless runtime
const WebSocket = require('ws');
global.WebSocket = WebSocket;

const express = require('express');
const { LN } = require('@getalby/sdk');
require('dotenv').config();

const app = express();
app.use(express.json());

// Root test route
app.get('/', (req, res) => {
  res.json({ status: 'Backend is active and running!' });
});

app.post('/api/withdraw', async (req, res) => {
  const { destination, amountInSats } = req.body;

  if (!destination) {
    return res.status(400).json({ success: false, error: 'Missing payment destination' });
  }

  try {
    const connectionString = process.env.NWC_CONNECTION_STRING;
    if (!connectionString) {
      return res.status(500).json({ 
        success: false, 
        error: 'NWC_CONNECTION_STRING environment variable is missing in Vercel.' 
      });
    }

    // Initialize LN client using NWC connection string
    const ln = new LN(connectionString);

    // Process payout
    const response = await ln.pay(destination);

    return res.json({ 
      success: true, 
      preimage: response.preimage || 'payment_complete' 
    });
  } catch (error) {
    console.error('Withdrawal error:', error.message);
    return res.status(500).json({ 
      success: false, 
      error: error.message || 'Payment processing failed' 
    });
  }
});

module.exports = app;




const express = require('express');
const { LN } = require('@getalby/sdk');
require('dotenv').config();

const app = express();
app.use(express.json());

app.get('/', (req, res) => {
  res.json({ status: 'Backend is running!' });
});

app.post('/api/withdraw', async (req, res) => {
  const { destination, amountInSats } = req.body;

  if (!destination) {
    return res.status(400).json({ success: false, error: 'Missing destination' });
  }

  try {
    const connectionString = process.env.NWC_CONNECTION_STRING;
    if (!connectionString) {
      return res.status(500).json({ 
        success: false, 
        error: 'NWC_CONNECTION_STRING is missing in Vercel settings.' 
      });
    }

    const ln = new LN({ NostrWalletConnectUrl: connectionString });

    // Use sendPayment for NWC Lightning payouts
    const response = await ln.sendPayment({
      invoice: destination,
      amount: amountInSats ? Number(amountInSats) : undefined
    });

    return res.json({ 
      success: true, 
      preimage: response.preimage || 'payment_sent' 
    });
  } catch (error) {
    console.error('Payout failed:', error.message);
    return res.status(500).json({ 
      success: false, 
      error: error.message || 'Payout failed' 
    });
  }
});

module.exports = app;




const WebSocket = require('ws');
global.WebSocket = WebSocket;

const express = require('express');
const { LN } = require('@getalby/sdk');
require('dotenv').config();

const app = express();
app.use(express.json());

app.get('/', (req, res) => {
  res.json({ status: 'Backend is active and running!' });
});

app.post('/api/withdraw', async (req, res) => {
  // Support both 'destination' and 'invoice' body parameters
  const destination = req.body.destination || req.body.invoice;
  const amountInSats = req.body.amountInSats || req.body.sats || 100;

  if (!destination) {
    return res.status(400).json({ success: false, error: 'Missing destination or invoice' });
  }

  try {
    const connectionString = process.env.NWC_CONNECTION_STRING;
    if (!connectionString) {
      return res.status(500).json({ 
        success: false, 
        error: 'NWC_CONNECTION_STRING environment variable is missing in Vercel settings.' 
      });
    }

    let invoiceToPay = destination;

    // Convert Lightning Address (user@domain.com) to BOLT11 invoice via LNURL
    if (destination.includes('@')) {
      const [username, domain] = destination.split('@');
      const lnurlRes = await fetch(`https://${domain}/.well-known/lnurlp/${username}`);
      const lnurlData = await lnurlRes.json();
      
      if (!lnurlData.callback) {
        throw new Error('Invalid Lightning Address or LNURL callback.');
      }

      const millisats = Number(amountInSats) * 1000;
      const callbackRes = await fetch(`${lnurlData.callback}?amount=${millisats}`);
      const callbackData = await callbackRes.json();

      if (!callbackData.pr) {
        throw new Error('Failed to fetch invoice from Lightning Address provider.');
      }

      invoiceToPay = callbackData.pr;
    }

    // Initialize LN instance and send payout
    const ln = new LN(connectionString);
    const response = await ln.pay(invoiceToPay);

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





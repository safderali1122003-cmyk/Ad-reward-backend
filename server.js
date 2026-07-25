const express = require('express');
const { LN, SAT } = require('@getalby/sdk');
require('dotenv').config();

const app = express();
app.use(express.json());

// Root test route so visiting in browser doesn't throw 404
app.get('/', (req, res) => {
  res.json({ status: 'Backend is live and ready!' });
});

app.post('/api/withdraw', async (req, res) => {
  const { destination, amountInSats } = req.body;

  if (!destination || !amountInSats) {
    return res.status(400).json({ success: false, error: 'Missing destination or amountInSats' });
  }

  try {
    const nwcConnectionString = process.env.NWC_CONNECTION_STRING;
    if (!nwcConnectionString) {
      throw new Error('NWC_CONNECTION_STRING environment variable is missing.');
    }

    // Initialize LN connection per request inside try block
    const ln = new LN(nwcConnectionString);

    const response = await ln.pay({
      invoice: destination, // or invoice / lightning address payment method supported by SDK
    });

    return res.json({ success: true, preimage: response.preimage });
  } catch (error) {
    console.error('Payment Error:', error.message);
    return res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = app;


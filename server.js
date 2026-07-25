const express = require('express');
const { LN, SAT } = require('@getalby/sdk/lnclient');
require('dotenv').config();

const app = express();
app.use(express.json());

const ln = new LN(process.env.NWC_CONNECTION_STRING);

app.post('/api/withdraw', async (req, res) => {
  const { destination, amountInSats } = req.body;

  if (!destination || !amountInSats) {
    return res.status(400).json({ success: false, error: 'Missing parameters' });
  }

  try {
    const response = await ln.pay(destination, SAT(amountInSats));
    return res.json({ success: true, preimage: response.preimage });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

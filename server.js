
const express = require('express');
const app = express();

app.use(express.json());

const APP_SECRET_KEY = "YourSecretAppToken123";

// Webhook endpoint for Flutter payouts
app.post('/api/payout/trigger', (req, res) => {
    const { auth_token, recipient_mobile, amount_pkr } = req.body;

    if (auth_token !== APP_SECRET_KEY) {
        return res.status(401).json({ success: false, message: "Unauthorized Request" });
    }

    const txId = "RST" + Date.now();

    return res.status(200).json({
        success: true,
        status: "COMPLETED",
        transaction_id: txId,
        message: "Payout successful! 0 PKR network fee."
    });
});

module.exports = app;




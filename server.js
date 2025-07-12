const express = require('express');
const app = express();
const port = process.env.PORT || 3000;
require('dotenv').config();

const gpt = require('./gpt');

app.use(express.json());

app.post('/chat', async (req, res) => {
    const { city, state, country, message } = req.body;
    try {
        const response = await gpt.handleMessage(message, city, state, country);
        res.json(response);
    } catch (err) {
        console.error(err);
        res.status(500).send("Internal Server Error");
    }
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
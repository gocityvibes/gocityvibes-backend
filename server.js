const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const OpenAI = require('openai');
require('dotenv').config();

const gptRouter = require('./routes/gpt');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());
app.use('/api/gpt', gptRouter);

app.get('/', (req, res) => {
    res.send('GoCityVibes Backend is Live!');
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
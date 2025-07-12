require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const gptHandler = require('./gpt');

const app = express();
app.use(cors());
app.use(bodyParser.json());

app.post('/chat', gptHandler);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
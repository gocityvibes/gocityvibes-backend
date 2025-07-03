const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

const gptRouter = require('./routes/gpt');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());

app.get('/', (req, res) => {
  res.send('GoCityVibes Backend is Live!');
});

app.use('/api/gpt', gptRouter);

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
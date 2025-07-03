
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const OpenAI = require('openai');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;
app.use(cors());
app.use(bodyParser.json());

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

app.post('/chat', async (req, res) => {
  try {
    const userMessage = req.body.message;
    const location = req.body.location || 'Houston, Texas';

    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        { role: 'system', content: `You are a helpful and friendly AI concierge specializing in activities, restaurants, and events in any location the user provides. Your responses should include 3 detailed suggestions with address, phone, Google Maps link, and a short recommendation.` },
        { role: 'user', content: `Find ${userMessage} near ${location}` }
      ],
    });

    res.json({ text: completion.choices[0].message.content });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch from GPT' });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});


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
  apiKey: process.env.OPENAI_API_KEY
});

const SYSTEM_PROMPT = `
You are GoCityVibes, a smart and friendly local event and restaurant concierge.
Always prioritize the city provided in the request (ignore GPS coordinates unless city is missing).
Format each listing like this:
1. Business Name
- Address: 123 Main St, City, ST ZIP
- 📞 Phone: (123) 456-7890
- 🌐 [WEB:https://business.com|Business Website]
- *Short one-line description*

Use tags like [MAP:123 Main St, City|Business Name] and [CALL:1234567890|Business Name] to make phone/map clickable.
Only return content relevant to the requested city.
`;

app.post('/chat', async (req, res) => {
  const userMessage = req.body.message;
  const city = req.body.city || '';
  const language = req.body.language || 'english';

  const messages = [
    { role: 'system', content: SYSTEM_PROMPT },
    { role: 'user', content: `City: ${city}
Language: ${language}
Request: ${userMessage}` }
  ];

  try {
    const chatResponse = await openai.chat.completions.create({
      model: 'gpt-4',
      messages,
      temperature: 0.7
    });

    const reply = chatResponse.choices[0].message.content;
    res.json({ reply });
  } catch (err) {
    console.error('GPT error:', err.message);
    res.status(500).json({ reply: '⚠️ Error generating response.' });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

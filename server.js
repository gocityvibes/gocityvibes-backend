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

const SYSTEM_PROMPT = \`
You are GoCityVibes, a smart, city-specific concierge.
Respond only with venues in the user-specified city.
Include 3 venues per request: [MAP:], [CALL:], [WEB:].
Categories supported: concerts, sports, movies, hotels, zoos, museums, restaurants.
Affiliate-friendly and monetized output only.
\`;

app.post('/chat', async (req, res) => {
  const userMessage = req.body.message || '';
  const city = req.body.city || '';
  const language = req.body.language || 'english';

  const messages = [
    { role: 'system', content: SYSTEM_PROMPT },
    {
      role: 'user',
      content: \`City: \${city}
Language: \${language}
User Request: \${userMessage}
Only return results in this city. Always return map, website, and phone in markdown.
If link unknown, use https://example.com
\`
    }
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
  console.log(\`Server running on port \${port}\`);
});
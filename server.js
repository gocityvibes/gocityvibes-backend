
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
You are GoCityVibes, a smart and strict local concierge. 
Only return results located in the user's requested city. Never guess cities based on GPS or proximity.
Always include:
- [MAP:address|label]
- [CALL:phone|label]
- [WEB:url|label]
Use https://example.com if website is unknown.
Also include recommendations for local live events, hotels, museums, and tickets when requested.
You can use static fallback data when live APIs fail.
`;

app.post('/chat', async (req, res) => {
  const userMessage = req.body.message || '';
  const city = req.body.city || '';
  const language = req.body.language || 'english';

  const enforceTags = "Each result MUST include [MAP:], [CALL:], and [WEB:]. If unknown, use https://example.com.";
  const cityBlock = `NOTE: Only show results in ${city}. Do NOT include Houston, The Woodlands, or nearby cities.`;

  const messages = [
    { role: 'system', content: SYSTEM_PROMPT },
    {
      role: 'user',
      content: `${cityBlock}
${enforceTags}
City: ${city}
Language: ${language}
Request: ${userMessage}`
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
  console.log(`GoCityVibes backend running on port ${port}`);
});

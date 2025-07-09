
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const OpenAI = require('openai');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());

app.options('/chat', (req, res) => {
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type');
  res.sendStatus(204);
});

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const SYSTEM_PROMPT = `
You are GoCityVibes, a strict and smart local concierge.
Only return businesses and events located in the user's requested city.
NEVER return results from other cities — no guessing based on GPS or proximity.
Always include the following per result:
- [MAP:full address|label]
- [CALL:phone number|label]
- [WEB:website url|label]
If the website is unknown, use https://example.com.
`;

app.post('/chat', async (req, res) => {
  const userMessage = req.body.message || '';
  const city = req.body.city || '';
  const language = req.body.language || 'english';

  const apiSummary = \`
Try to match this request to the correct source:
- Ticketmaster for concerts and large events
- Eventbrite for local events
- Movies from cinema listings (use fallback text for now)
- Zoo and live music from city guides or fallback to GPT
If API fails or doesn’t apply, use GPT.
\`;

  const messages = [
    { role: 'system', content: SYSTEM_PROMPT },
    {
      role: 'user',
      content: \`
Forget previous instructions. ONLY use this city: "\${city}".
Language: \${language}
Request: \${userMessage}
\${apiSummary}
Return results using [MAP:], [CALL:], and [WEB:] format.
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
    res.status(500).json({ reply: '⚠️ Error generating response.' });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

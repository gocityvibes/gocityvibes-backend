
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { OpenAI } = require('openai');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

app.post('/chat', async (req, res) => {
  const { message, location, lang } = req.body;
  const userLoc = location ? `Latitude: ${location.lat}, Longitude: ${location.lon}` : 'Location not provided';
  const userLang = lang === 'es' ? 'Spanish' : 'English';

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: `You are a friendly, concise travel concierge who provides amazing, real-sounding suggestions for restaurants, bars, events, and things to do based on user location and questions. Always reply in ${userLang}. If no live data is available, provide smart fallback suggestions. Format with bullet points, emojis, and short descriptions. Include 3 results max and ask if they want more. Include call buttons or map links when mentioned.`
        },
        {
          role: 'user',
          content: `${message}
User Location: ${userLoc}`
        }
      ]
    });

    res.json({ reply: completion.choices[0].message.content });
  } catch (err) {
    res.status(500).json({ error: 'Failed to contact OpenAI: ' + err.message });
  }
});

app.get('/', (req, res) => {
  res.send('🌍 GoCityVibes Concierge API');
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});

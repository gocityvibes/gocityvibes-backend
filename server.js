
const express = require('express');
const cors = require('cors');
const OpenAI = require('openai');

const app = express();
app.use(cors());
app.use(express.json());

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

app.post('/chat', async (req, res) => {
  try {
    const userMessage = req.body.message || '';
    const userCity = req.body.city || '';
    const userLanguage = req.body.language || 'english';

    const systemPrompt = `
You are a smart, friendly local concierge. Always respond in clean, formatted HTML with emojis, bold labels, helpful tips, and clickable links.
Speak in a natural, conversational tone — like ChatGPT — and provide useful info for events, tickets, restaurants, music, etc.
`;

    const chatResponse = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage }
      ],
      temperature: 0.7,
    });

    const reply = chatResponse.choices[0].message.content;
    res.json({ reply });

  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Something went wrong.' });
  }
});

app.listen(3000, () => {
  console.log('Concierge backend running on port 3000');
});

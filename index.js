require('dotenv').config();
const express = require('express');
const cors = require('cors');
const OpenAI = require('openai');

const app = express();
const PORT = process.env.PORT || 3000;

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const corsOptions = {
  origin: '*', // Replace with your Netlify domain in production
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true,
  optionsSuccessStatus: 204
};

app.use(cors(corsOptions));
app.use(express.json());

app.post('/chat', async (req, res) => {
  const userMessage = req.body.message;
  const location = req.body.location;

  if (!userMessage) {
    return res.status(400).json({ error: 'Message is required in the request body.' });
  }

  try {
    const personaPrompt = `
You are Go City Vibes, a smart concierge chatbot for Houston, Texas and nearby areas like The Woodlands, Spring, Tomball, and Katy.

When someone asks about “bars near me” or “great steak,” respond with:
- Three real business names
- Full addresses
- 📞 Phone numbers
- One-line recommendation (e.g. “great patio”, “perfect steaks”, “known for cocktails”)

If the user shares their location, use it to personalize replies. Don’t just use central Houston — include suburbs if they’re closer. Never say you're limited. Always act confident and friendly like a well-connected local guide.
`;

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: personaPrompt },
        { role: "user", content: userMessage }
      ],
      temperature: 0.7,
      max_tokens: 300,
    });

    const botReply = completion.choices[0].message.content;
    res.json({ reply: botReply });

  } catch (error) {
    console.error('Error calling OpenAI API:', error);
    if (error.response && error.response.status) {
      return res.status(error.response.status).json({
        error: error.response.data.error.message || `OpenAI API error: ${error.response.status}`
      });
    } else if (error.message) {
      return res.status(500).json({ error: `Internal Server Error: ${error.message}` });
    } else {
      return res.status(500).json({ error: 'Failed to get response from AI. Please try again.' });
    }
  }
});

app.get('/', (req, res) => {
  res.send('Go City Vibes Backend is running!');
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});



   
   



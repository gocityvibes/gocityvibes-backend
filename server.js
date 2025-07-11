
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const OpenAI = require('openai');
const app = express();
const port = process.env.PORT || 10000;

app.use(cors());
app.use(bodyParser.json());

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

app.options('/chat', (_, res) => {
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type');
  res.sendStatus(204);
});

app.post('/chat', async (req, res) => {
  const { message, city } = req.body;
  const systemPrompt = `
You are GoCityVibes, an expert local concierge.

Use ONLY real events and businesses. Include the following in every response:
- For each item: name, description, address
- Add these buttons for each item:
  - [MAP:address|View Map]
  - [CALL:phone number|Call]
  - [WEB:website URL|Visit Website]
  - [RIDE:https://www.uber.com/?ref=YOUR_UBER_CODE|Get a Ride]
  - If it's a ticketed event, add:
    - [TICKET:https://ticketmaster.com/example?affiliate=YOUR_TICKETMASTER_CODE|Buy Tickets]

Respond in clear Markdown formatting. Keep tone friendly and local.

Example:
1. **Pappas Bros. Steakhouse**
- 📍 123 Main St, Houston, TX
- 📞 (713) 555-1234
- 🌐 [Visit Website](https://pappasbros.com)
- 🗺️ [View Map](https://www.google.com/maps/search/?api=1&query=Pappas+Bros+Steakhouse,+Houston)
- 📞 [Call](tel:+17135551234)
- 🚗 [Get a Ride](https://www.uber.com/?ref=YOUR_UBER_CODE)
`;

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `${message} in ${city}` }
      ]
    });

    res.json({ reply: completion.choices[0].message.content });
  } catch (err) {
    console.error(err);
    res.status(500).send('Error processing request');
  }
});

app.listen(port, () => {
  console.log(`GoCityVibes backend running on port ${port}`);
});

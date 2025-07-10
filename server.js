const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fetch = require('node-fetch');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 10000;

app.use(cors());
app.use(bodyParser.json());

app.post('/chat', async (req, res) => {
  const { message, city, language } = req.body;
  let eventsSummary = '';

  try {
    const ticketmasterUrl = `https://app.ticketmaster.com/discovery/v2/events.json?apikey=${process.env.TICKETMASTER_API_KEY}&city=${encodeURIComponent(city)}&keyword=${encodeURIComponent(message)}&size=5&sort=date,asc`;
    const ticketmasterRes = await fetch(ticketmasterUrl);
    const ticketmasterData = await ticketmasterRes.json();

    if (ticketmasterData._embedded && ticketmasterData._embedded.events) {
      const events = ticketmasterData._embedded.events;
      const formatted = events.map(e => {
        const name = e.name;
        const url = e.url;
        const venue = e._embedded.venues[0].name;
        const address = e._embedded.venues[0].address.line1;
        const date = e.dates.start.localDate;
        const time = e.dates.start.localTime || 'TBA';
        return `${name} at ${venue}, ${address} on ${date} at ${time}. Get tickets: ${url}`;
      });
      eventsSummary = formatted.join('
');
    }
  } catch (e) {
    eventsSummary = "⚠️ Could not fetch live events.";
  }

  const fullPrompt = `User asked: ${message}

Relevant events:
${eventsSummary}`;

  try {
    const openaiRes = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [
          { role: "system", content: "You are a helpful local event concierge." },
          { role: "user", content: fullPrompt }
        ]
      })
    });

    const data = await openaiRes.json();
    res.json({ reply: data.choices?.[0]?.message?.content || "⚠️ Could not fetch GPT response." });
  } catch (err) {
    res.json({ reply: "⚠️ GPT request failed." });
  }
});

app.get('/', (req, res) => {
  res.send("GoCityVibes backend is running.");
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

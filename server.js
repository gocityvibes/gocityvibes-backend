
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

  try {
    const ticketmasterRes = await fetch(`https://gocityvibes-backend-94lo.onrender.com/events?city=${encodeURIComponent(city)}&keyword=${encodeURIComponent(message)}`);
    const ticketmasterData = await ticketmasterRes.json();  // ✅ Ensure it's defined

    let eventsText = '';
    if (ticketmasterData && ticketmasterData.events && ticketmasterData.events.length > 0) {
      eventsText += 'Here are some live events related to your request:<br>';
      for (const event of ticketmasterData.events) {
        eventsText += `🎟️ <strong>${event.name}</strong><br>📍 ${event.venue}, ${event.address}<br>📅 ${event.date} ⏰ ${event.time}<br>🌐 <a href="${event.url}" target="_blank">Buy Tickets</a><br><br>`;
      }
    }

    const finalReply = eventsText || "Sorry, I couldn't find any matching events. Try another search.";
    res.json({ reply: finalReply });
  } catch (err) {
    console.error(err);
    res.status(500).json({ reply: '⚠️ Error: Failed to fetch events.' });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

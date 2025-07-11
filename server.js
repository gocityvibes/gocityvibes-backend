
async function getEventbriteEvents(city) {
  const url = `https://www.eventbriteapi.com/v3/events/search/?q=events&location.address=${encodeURIComponent(city)}&token=${process.env.EVENTBRITE_TOKEN}&expand=venue`;
  try {
    const res = await fetch(url);
    const data = await res.json();
    if (data.events) {
      return data.events.map(event => ({
        name: event.name.text,
        date: event.start.local.split('T')[0],
        address: event.venue?.address?.localized_address_display || '',
        phone: '', // Eventbrite doesn't typically provide phone
        website: event.url
      }));
    }
  } catch (err) {
    console.error('Eventbrite fetch error:', err);
  }
  return [];
}



async function getTicketmasterEvents(city, keyword) {
  const url = `https://app.ticketmaster.com/discovery/v2/events.json?apikey=${process.env.TICKETMASTER_API_KEY}&city=${encodeURIComponent(city)}&keyword=${encodeURIComponent(keyword)}&size=5&sort=date,asc`;
  try {
    const res = await fetch(url);
    const data = await res.json();
    if (data._embedded && data._embedded.events) {
      return data._embedded.events.map(event => ({
        name: event.name,
        date: event.dates.start.localDate,
        address: event._embedded.venues[0].address?.line1 || '',
        phone: event._embedded.venues[0].boxOfficeInfo?.phoneNumberDetail || '',
        website: event.url
      }));
    }
  } catch (err) {
    console.error('Ticketmaster fetch error:', err);
  }
  return [];
}


const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const OpenAI = require('openai');
require('dotenv').config();
const fetch = require('node-fetch');

const app = express();
const port = process.env.PORT;

app.use(cors());
app.use(bodyParser.json());

// Handle CORS preflight request
app.options('/chat', (req, res) => {
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type');
  res.sendStatus(204);
});

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const SYSTEM_PROMPT = `
You are GoCityVibes, a strict and smart local concierge.
Only return real, live events based on the listings provided to you.
NEVER make up venues like "Ticketmaster Houston" or "StubHub Houston."
Use ONLY the events passed in the user prompt context.

Always return each result like this:
1. **Event Name**
- [MAP:full address|View Map]
- [CALL:phone number|Call Venue]
- [WEB:website URL|Buy Tickets]

If no results are found, say: "No ticketed events found right now in that city. Try a different search."
`;

app.post('/chat', async (req, res) => {
  const ticketmasterEvents = await getTicketmasterEvents(req.body.city, req.body.message);
  const eventbriteEvents = await getEventbriteEvents(req.body.city);
  const events = [...ticketmasterEvents, ...eventbriteEvents];
  let eventText = '';
  if (events.length) {
    eventText += `Here are live events in ${req.body.city} with ticket links:\n`;
    for (const event of events) {
      eventText += `\n**${event.name}** - ${event.date}\n[MAP:${event.address}|View Map]\n[CALL:${event.phone}|Call Venue]\n[WEB:${event.website}|Buy Tickets]\n`;
    }
  }

  const userMessage = req.body.message || '';

    // 🚀 Inject live Ticketmaster events for Astros/game queries
    if (/astros|astros tickets|astros game/i.test(userMessage)) {
        try {
            const eventRes = await fetch(`${req.protocol}://${req.get('host')}/events?city=${encodeURIComponent(city)}&keyword=astros`);
            const eventData = await eventRes.json();
            if (eventData.events && eventData.events.length > 0) {
                const formatted = eventData.events.map(e =>
                  `- 🗓️ ${e.date} ${e.time} – ${e.name} at ${e.venue} [🎟️ Buy Tickets](${e.url})`
                ).join("\n");
                return res.json({ reply: `🎉 Here's what's coming up for the Astros:\n${formatted}` });
            }
        } catch (e) {
            console.error("Event fetch failed:", e);
        }
    }
      const city = req.body.city || '';
  const language = req.body.language || 'english';

  const cityBlock = `NOTE: Only show results in ${city}. Do NOT include Houston, The Woodlands, or any nearby cities.`;

  const messages = [
    { role: 'system', content: SYSTEM_PROMPT },
    {
      role: 'user',
      content: `${cityBlock}
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
    res.status(500).json({ reply: '⚠️ Error generating response.' });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});



const axios = require('axios');

// Ticketmaster Events API
app.get('/events', async (req, res) => {
  const city = req.query.city || 'Houston';
  const keyword = req.query.keyword || '';

  try {
    const response = await axios.get('https://app.ticketmaster.com/discovery/v2/events.json', {
      params: {
        apikey: 'pDApdFiTNEOuWyCAsgIwfxwNnlRzVpVy',
        city,
        keyword,
        size: 5
      }
    });

    const events = response.data._embedded?.events || [];
    const formatted = events.map(evt => ({
      name: evt.name,
      url: evt.url,
      venue: evt._embedded.venues[0].name,
      address: evt._embedded.venues[0].address.line1,
      date: evt.dates.start.localDate,
      time: evt.dates.start.localTime
    }));

    res.json({ events: formatted });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch Ticketmaster events' });
  }
});

// Eventbrite Events API
app.get('/eventbrite', async (req, res) => {
  const city = req.query.city || 'Houston';
  const keyword = req.query.keyword || '';

  try {
    const response = await axios.get('https://www.eventbriteapi.com/v3/events/search/', {
      headers: {
        Authorization: 'Bearer EKUQE6HEO3N2K64RJ3FN'
      },
      params: {
        'location.address': city,
        q: keyword,
        expand: 'venue',
        sort_by: 'date',
        page_size: 5
      }
    });

    const events = response.data.events || [];
    const formatted = events.map(evt => ({
      name: evt.name.text,
      url: evt.url,
      venue: evt.venue?.name || '',
      address: evt.venue?.address?.localized_address_display || '',
      date: evt.start.local.split('T')[0],
      time: evt.start.local.split('T')[1]
    }));

    res.json({ events: formatted });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch Eventbrite events' });
  }
});



app.post('/events', async (req, res) => {
  const ticketmasterEvents = await getTicketmasterEvents(req.body.city, req.body.keyword || '');
  const eventbriteEvents = await getEventbriteEvents(req.body.city);
  res.json([...ticketmasterEvents, ...eventbriteEvents]);
});

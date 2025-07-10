const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const OpenAI = require('openai');
require('dotenv').config();

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

// Ticketmaster Events API
app.get('/events', async (req, res) => {
  const city = req.query.city;
  const keyword = req.query.keyword || '';

  const ticketmasterUrl = \`https://app.ticketmaster.com/discovery/v2/events.json?apikey=\${process.env.TICKETMASTER_API_KEY}&city=\${encodeURIComponent(city)}&keyword=\${encodeURIComponent(keyword)}&size=5&sort=date,asc\`;

  try {
    const response = await axios.get(ticketmasterUrl);
    const events = (response.data._embedded?.events || []).map(event => ({
      name: event.name,
      url: event.url,
      venue: event._embedded.venues[0].name,
      address: event._embedded.venues[0].address.line1,
      date: event.dates.start.localDate,
      time: event.dates.start.localTime
    }));

    res.json({ events });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch events.' });
  }
});

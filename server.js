const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const OpenAI = require('openai');
const fetch = require('node-fetch');
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

async function getTicketmasterEvents(city, keyword) {
  const url = `https://app.ticketmaster.com/discovery/v2/events.json?apikey=${process.env.TICKETMASTER_API_KEY}&city=${encodeURIComponent(city)}&keyword=${encodeURIComponent(keyword)}&size=5&sort=date,asc`;
  try {
    const res = await fetch(url);
    const data = await res.json();
    if (data._embedded && data._embedded.events) {
      return data._embedded.events.map(event => ({
        name: event.name || 'Unnamed Event',
        date: event.dates?.start?.localDate || '',
        address: event._embedded?.venues?.[0]?.address?.line1 || 'Address not available',
        phone: event._embedded?.venues?.[0]?.boxOfficeInfo?.phoneNumberDetail || 'Phone not available',
        website: event.url || 'https://ticketmaster.com'
      }));
    }
  } catch (err) {
    console.error('Ticketmaster fetch error:', err);
  }
  return [];
}

async function getEventbriteEvents(city) {
  const url = `https://www.eventbriteapi.com/v3/events/search/?q=events&location.address=${encodeURIComponent(city)}&token=${process.env.EVENTBRITE_TOKEN}&expand=venue`;
  try {
    const res = await fetch(url);
    const data = await res.json();
    if (data.events) {
      return data.events.map(event => ({
        name: event.name?.text || 'Unnamed Event',
        date: event.start?.local?.split('T')[0] || '',
        address: event.venue?.address?.localized_address_display || 'Address not available',
        phone: '',
        website: event.url || 'https://eventbrite.com'
      }));
    }
  } catch (err) {
    console.error('Eventbrite fetch error:', err);
  }
  return [];
}

app.post('/chat', async (req, res) => {
  const { message, city } = req.body;
  const ticketmasterEvents = await getTicketmasterEvents(city, message);
  const eventbriteEvents = await getEventbriteEvents(city);
  const events = [...ticketmasterEvents, ...eventbriteEvents];

  const ticketKeywords = ["tickets", "concert", "zoo", "museum", "game", "show"];
  if (ticketKeywords.some(keyword => message.toLowerCase().includes(keyword)) && events.length > 0) {
    let reply = "";
    events.forEach((event, index) => {
      reply += `\n${index + 1}. **${event.name}**\n[MAP:${event.address}|View Map]\n[CALL:${event.phone}|Call Venue]\n[WEB:${event.website}|Buy Tickets]\n`;
    });
    return res.json({ reply });
  }

  const completion = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: `${message}\n\nHere are live ticketed events:\n${events.map((event, i) =>
        `\n${i + 1}. **${event.name}**\n[MAP:${event.address}|View Map]\n[CALL:${event.phone}|Call Venue]\n[WEB:${event.website}|Buy Tickets]\n`
      ).join('')}` }
    ],
    temperature: 0.6
  });

  res.json({ reply: completion.choices[0].message.content });
});

app.post('/events', async (req, res) => {
  const ticketmasterEvents = await getTicketmasterEvents(req.body.city, req.body.keyword || '');
  const eventbriteEvents = await getEventbriteEvents(req.body.city);
  res.json([...ticketmasterEvents, ...eventbriteEvents]);
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
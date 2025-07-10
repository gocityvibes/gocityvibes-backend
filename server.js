const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fetch = require('node-fetch');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 10000;

app.use(cors());
app.use(bodyParser.json());

app.get('/', (req, res) => res.send('GoCityVibes Backend Live'));

app.post('/chat', async (req, res) => {
  const { message, city, language } = req.body;
  let contextEvents = [];

  try {
    const keyword = message;
    const ticketmasterUrl = \`https://app.ticketmaster.com/discovery/v2/events.json?apikey=\${process.env.TICKETMASTER_API_KEY}&city=\${encodeURIComponent(city)}&keyword=\${encodeURIComponent(keyword)}&size=5&sort=date,asc\`;

    const tmRes = await fetch(ticketmasterUrl);
    const tmData = await tmRes.json();

    if (tmData._embedded && tmData._embedded.events) {
      contextEvents = tmData._embedded.events.map((e) => ({
        name: e.name,
        url: e.url,
        venue: e._embedded.venues[0].name,
        address: e._embedded.venues[0].address.line1,
        date: e.dates.start.localDate,
        time: e.dates.start.localTime
      }));
    }
  } catch (err) {
    console.error('Ticketmaster error:', err.message);
  }

  try {
    const ebUrl = \`https://www.eventbriteapi.com/v3/events/search/?token=\${process.env.EVENTBRITE_TOKEN}&location.address=\${encodeURIComponent(city)}&q=\${encodeURIComponent(message)}\`;
    const ebRes = await fetch(ebUrl);
    const ebData = await ebRes.json();

    if (ebData.events && ebData.events.length > 0) {
      contextEvents.push(...ebData.events.slice(0, 3).map(e => ({
        name: e.name.text,
        url: e.url,
        venue: e.venue_id || 'Eventbrite Venue',
        address: 'See link for details',
        date: e.start.local.split('T')[0],
        time: e.start.local.split('T')[1].substring(0, 5)
      })));
    }
  } catch (err) {
    console.error('Eventbrite error:', err.message);
  }

  if (contextEvents.length === 0) {
    try {
      const fallback = require('./live-events-fallback.json');
      contextEvents.push(...fallback.events);
    } catch (err) {
      console.error('Fallback JSON error:', err.message);
    }
  }

  const formatted = contextEvents.map((e, i) => {
    return \`\${i + 1}. \${e.name}
- 📍 \${e.venue}, \${e.address}
- 📅 \${e.date} at \${e.time}
- 🎟️ [WEB: \${e.url} | Get Tickets]\`;
  }).join("\n\n");

  const fullPrompt = \`User message: "\${message}"\n\nContextual Events:\n\${formatted}\`;

  try {
    const openaiRes = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': \`Bearer \${process.env.OPENAI_API_KEY}\`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: 'You are a helpful local event concierge that adds ticket links for all live events.' },
          { role: 'user', content: fullPrompt }
        ]
      })
    });

    const openaiData = await openaiRes.json();
    const reply = openaiData.choices?.[0]?.message?.content || 'No response.';
    res.json({ reply });
  } catch (err) {
    console.error('OpenAI error:', err.message);
    res.json({ reply: '⚠️ Error: ' + err.message });
  }
});

app.listen(port, () => {
  console.log('Server running on port ' + port);
});
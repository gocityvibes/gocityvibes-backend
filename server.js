const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();
const { OpenAI } = require('openai');

const app = express();
app.use(cors());
app.use(bodyParser.json());

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const sessionMemory = {};
const priorityListings = {
  tomball: [{
    name: "Joe’s Bar",
    type: "Bar",
    days: ["Monday"],
    special: "$2 drafts and live music",
    address: "123 Main St, Tomball, TX",
    phone: "(281) 555-1234",
    website: "https://joesbartomball.com"
  }],
  katy: [{
    name: "Mama Rosa’s Italian Bistro",
    type: "Restaurant",
    days: ["Friday"],
    special: "2-for-1 pasta and $5 wine",
    address: "555 Bellaire Blvd, Katy, TX",
    phone: "(281) 555-9876",
    website: "https://mamarosakaty.com"
  }]
};

app.post('/api/gpt', async (req, res) => {
  const { message, city = 'Houston', state = '', country = '', sessionId = 'default' } = req.body;

  if (!sessionMemory[sessionId]) {
    sessionMemory[sessionId] = {
      preferences: [],
      lastRecommendation: null
    };
  }

  const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
  const featured = priorityListings[city.toLowerCase()]?.filter(item => item.days.includes(today)) || [];

  const prompt = `
You are the GoCityVibes Concierge AI.
Location: ${city}, ${state}, ${country}
Today is ${today}
Featured Listings: ${featured.map(f => f.name + ' – ' + f.special).join(', ')}

Instructions:
- Use your own access to fetch real events, restaurants, music, shows, hotels, and flights.
- Inject affiliate codes from user for monetization:
    - Ticketmaster: ?affiliate=${process.env.TICKETMASTER_CODE}
    - Eventbrite: ?aff=${process.env.EVENTBRITE_CODE}
    - StubHub: ?aid=${process.env.STUBHUB_CODE}
    - Hotels: ?aid=${process.env.BOOKING_CODE}
    - Flights: ?aff=${process.env.FLIGHTS_CODE}
- Provide full details including name, location, time, and links:
  - 📍 Google Maps
  - 📞 Call
  - 🌐 Website
  - 🚗 Uber deep link
- Add friendly tips if outdoor (e.g. sunscreen, umbrella) when weather is high or rainy.
- Respond in a cool, helpful tone like a smart concierge.
- Track user memory and offer follow-up like:
  "How was that steak at Perry’s the other night?"

User said: "${message}"
`;

  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      { role: "system", content: prompt },
      { role: "user", content: message }
    ],
    temperature: 0.7
  });

  sessionMemory[sessionId].lastRecommendation = message;
  res.json({ reply: response.choices[0].message.content });
});

app.post('/api/adsignup', (req, res) => {
  const adData = req.body;
  console.log("New Ad Signup:", adData);
  res.status(200).json({ message: "Ad signup received." });
});

app.listen(3000, () => {
  console.log('GoCityVibes Affiliate Backend running on port 3000');
});

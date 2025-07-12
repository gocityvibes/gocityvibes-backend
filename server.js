
require('dotenv').config();
const express = require('express');
const app = express();
const cors = require('cors');
const bodyParser = require('body-parser');

app.use(cors());
app.use(bodyParser.json());

const GPT = require('./gpt');

app.post('/api/gpt', async (req, res) => {
    const { message, city, state, country } = req.body;

    // Flight suggestion logic
    if (/flight|ticket.*(to|from)/i.test(message)) {
        const response = {
            reply: `✈️ Here's a couple of flight options:

` +
                   `**Southwest Airlines**
- Departure: Sunday 10:00 AM
- Return: Monday 7:00 PM
- Price: Starting at $150 round-trip
🌐 [Book Your Flight](${process.env.FLIGHT_LINK})

` +
                   `**United Airlines**
- Departure: Sunday 9:30 AM
- Return: Monday 8:00 PM
- Price: Starting at $175 round-trip
🌐 [Book Your Flight](${process.env.FLIGHT_LINK})

` +
                   `🚗 [Get an Uber](https://m.uber.com)`
        };
        return res.json(response);
    }

    // Hotel suggestion logic
    if (/hotel|place to stay/i.test(message)) {
        const response = {
            reply: `🏨 Recommended Hotel:

` +
                   `**The Post Oak Hotel at Uptown Houston**
- Location: 1600 West Loop S, Houston, TX 77027
` +
                   `📍 [Google Maps](https://goo.gl/maps/9T5sE)
📞 (844) 386-1600
` +
                   `🌐 [Book Now](${process.env.BOOKING_LINK})
🚗 [Uber Ride](https://m.uber.com)`
        };
        return res.json(response);
    }

    // Fallback GPT response
    const reply = await GPT.getResponse(message, city, state, country);
    res.json({ reply });
});

app.listen(3000, () => {
    console.log('Server running on port 3000');
});

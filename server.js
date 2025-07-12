
const express = require('express');
const axios = require('axios');
const cors = require('cors');
const bodyParser = require('body-parser');
const app = express();
app.use(cors());
app.use(bodyParser.json());

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

app.post('/chat', async (req, res) => {
    const { message, city, state } = req.body;

    // GPT handles everything, including fetching and formatting
    const gptPrompt = `
You are a friendly, luxury AI concierge. The user is in ${city}, ${state}.
Handle everything: suggest real events, restaurants, concerts, and include ticket + Uber links.

Event API: Ticketmaster + Eventbrite
Output Format:
1. 🎤 Artist Name at Venue
📍 Address
🎫 [Buy Tickets](https://ticketmaster.com/abc?affiliate=YOURCODE)
🚗 [Get a Ride](https://m.uber.com/?dropoff[formatted_address]=VENUE)

User message: ${message}
    `;

    try {
        const completion = await axios.post("https://api.openai.com/v1/chat/completions", {
            model: "gpt-4",
            messages: [{ role: "user", content: gptPrompt }],
            temperature: 0.7
        }, {
            headers: {
                "Authorization": `Bearer ${OPENAI_API_KEY}`,
                "Content-Type": "application/json"
            }
        });

        res.json({ reply: completion.data.choices[0].message.content });
    } catch (err) {
        console.error(err.response?.data || err.message);
        res.status(500).send("GPT Concierge error");
    }
});

app.post('/signup', async (req, res) => {
    const { businessName, phone, email, city } = req.body;
    console.log("New advertiser inquiry:", { businessName, phone, email, city });
    res.send("Thanks! Our team will reach out shortly.");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Concierge server live on ${PORT}`);
});

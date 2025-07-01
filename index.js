
// Load environment variables from .env file in local development (NOT for Render production)
// Render will provide environment variables directly.
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const OpenAI = require('openai');

const app = express();
// Render will provide the PORT env variable; default to 3000 for local development
const PORT = process.env.PORT || 3000;

// Initialize OpenAI client with your API key
// The key is loaded from process.env.OPENAI_API_KEY, which Render provides securely.
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

// Configure CORS
// IMPORTANT: Temporarily set to allow *all* origins to get the backend running.
// We will update this with your specific Netlify URL *after* frontend deployment.
const corsOptions = {
    origin: '*', // This allows all origins for now. We will change this later.
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
    optionsSuccessStatus: 204
};
app.use(cors(corsOptions));
app.use(express.json());

app.post('/chat', async (req, res) => {
    const userMessage = req.body.message;

    if (!userMessage) {
        return res.status(400).json({ error: 'Message is required in the request body.' });
    }

    try {
        const personaPrompt = `You are "Go City Vibes", a friendly and helpful city concierge chatbot for Houston, Texas. Your goal is to provide excellent recommendations for things to do, places to eat, and live music *specifically within Houston, Texas*. Be enthusiastic, concise, and helpful. Always mention that you are a concierge for Houston, Texas when relevant. If you cannot answer a question about a specific location outside Houston, politely state that your expertise is limited to Houston. If asked for a "taco place near me" or "restaurant around me", suggest popular and highly-rated places in Houston, and gently mention that you cannot access real-time user location, so your recommendations are based on general knowledge of Houston's best spots.`;

        const completion = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [
                {"role": "system", "content": personaPrompt},
                {"role": "user", "content": userMessage}
            ],
            temperature: 0.7,
            max_tokens: 200,
        });

        const botReply = completion.choices[0].message.content;
        res.json({ reply: botReply });

    } catch (error) {
        console.error('Error calling OpenAI API:', error);
        if (error.response && error.response.status) {
            return res.status(error.response.status).json({
                error: error.response.data.error.message || `OpenAI API error: ${error.response.status}`
            });
        } else if (error.message) {
            return res.status(500).json({ error: `Internal Server Error: ${error.message}` });
        } else {
            return res.status(500).json({ error: 'Failed to get response from AI. Please try again.' });
        }
    }
});

app.get('/', (req, res) => {
    res.send('Go City Vibes Backend is running!');
});

app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});


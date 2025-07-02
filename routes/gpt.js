const express = require('express');
const router = express.Router();
const OpenAI = require('openai');

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

router.post('/', async (req, res) => {
    try {
        const userInput = req.body.message;

        const chatCompletion = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [{ role: "user", content: userInput }],
        });

        const botReply = chatCompletion.choices[0].message.content;
        res.json({ reply: botReply });
    } catch (error) {
        console.error("GPT Error:", error.message);
        res.status(500).json({ error: "Failed to get GPT response" });
    }
});

module.exports = router;
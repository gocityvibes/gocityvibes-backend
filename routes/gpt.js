const express = require('express');
const router = express.Router();
const OpenAI = require('openai');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

router.post('/', async (req, res) => {
  try {
    const message = req.body.message;
    if (!message || typeof message !== 'string') {
      return res.status(400).json({ reply: "Invalid input." });
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are a friendly city events concierge who can recommend places anywhere, not just Houston. Return responses in casual tone. If user asks for more results, give 3 more. If results have addresses, include Google Maps links. If a place can be called, include a tel: link."
        },
        { role: "user", content: message }
      ]
    });

    const reply = completion.choices[0].message.content;
    res.json({ reply });
  } catch (err) {
    console.error("GPT Error:", err);
    res.status(500).json({ reply: "⚠️ Error: Something went wrong." });
  }
});

module.exports = router;
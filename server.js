
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const OpenAI = require("openai");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

app.post("/api/gpt", async (req, res) => {
  try {
    const userMessage = req.body.message;
    const chat = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: userMessage }],
    });
    res.status(200).json({ reply: chat.choices[0].message.content });
  } catch (err) {
    console.error("GPT Error:", err.message);
    res.status(500).json({ error: "GPT request failed" });
  }
});

app.get("/api/check-key", (req, res) => {
  const key = process.env.OPENAI_API_KEY;
  if (!key) return res.json({ found: false });
  return res.json({ found: true, partial_key: key.slice(0, 8) + "..." + key.slice(-5) });
});

app.listen(port, () => console.log(`Server running on port ${port}`));


const OpenAI = require("openai");

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function getResponse(message, city, state, country) {
  const locationContext = [city, state, country].filter(Boolean).join(', ');
  const fullPrompt = `User is located in ${locationContext}. Respond like a friendly local concierge: ${message}`;

  const completion = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: [{ role: "user", content: fullPrompt }],
    temperature: 0.7,
  });

  return completion.choices[0].message.content;
}

module.exports = { getResponse };

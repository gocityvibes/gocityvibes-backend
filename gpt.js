
const { Configuration, OpenAIApi } = require("openai");

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});

const openai = new OpenAIApi(configuration);

async function getResponse(message, city, state, country) {
  const locationContext = [city, state, country].filter(Boolean).join(', ');
  const fullPrompt = `User is located in ${locationContext}. Respond like a friendly local concierge: ${message}`;

  const completion = await openai.createChatCompletion({
    model: "gpt-3.5-turbo",
    messages: [{ role: "user", content: fullPrompt }],
    temperature: 0.7,
  });

  return completion.data.choices[0].message.content;
}

module.exports = { getResponse };

const { OpenAIApi, Configuration } = require("openai");
const axios = require("axios");

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

module.exports = async (req, res) => {
  const userMessage = req.body.message || "";
  const city = req.body.city || "";
  const keyword = req.body.keyword || "";

  let injectedContent = "";

  // Inject Ticketmaster if keywords match
  if (/astros|tickets|concert|game/i.test(userMessage)) {
    try {
      const response = await axios.get(\`https://app.ticketmaster.com/discovery/v2/events.json?apikey=DEMO_KEY&keyword=\${encodeURIComponent(userMessage)}&city=\${encodeURIComponent(city)}&size=2&sort=date,asc\`);
      const events = response.data._embedded?.events || [];
      injectedContent = events.map(evt => \`🎫 \${evt.name} at \${evt._embedded.venues[0].name} on \${evt.dates.start.localDate}\`).join("\n");
    } catch (err) {
      injectedContent = "⚠️ Could not load ticket information right now.";
    }
  }

  // Construct GPT prompt
  const fullPrompt = \`User asked: "\${userMessage}"\n\n\${injectedContent}\n\nReply like a helpful concierge.\`;

  const gptResponse = await openai.createChatCompletion({
    model: "gpt-3.5-turbo",
    messages: [{ role: "user", content: fullPrompt }],
  });

  res.json({ reply: gptResponse.data.choices[0].message.content });
};
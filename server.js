
const express = require('express');
const cors = require('cors');
const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 10000;

function isVagueCity(city) {
  const vagueCities = ['Smithville', 'Springfield', 'Jackson', 'Greenville'];
  return vagueCities.includes(city.trim().toLowerCase());
}

app.post('/chat', (req, res) => {
  const { message, city } = req.body;

  if (!city) {
    return res.json({ reply: "Please tell me which city and country you're in!" });
  }

  if (isVagueCity(city)) {
    return res.json({ reply: "There are a few places called that! What state or country are you in?" });
  }

  let reply = "";

  if (/steak|restaurant/i.test(message)) {
    reply = "🥩 Absolutely! Here are the top steak restaurants in " + city + ":

" +
      "1. **Steakhouse 101** - 🔗 [Website](https://your-affiliate-link.com/steakhouse)
" +
      "2. **Prime Grill** - 📞 [Call](tel:+123456789)
" +
      "3. **The Meat Co.** - 🗺️ [Map](https://maps.google.com/?q=steak+" + encodeURIComponent(city) + ")";
  } else if (/astros|tickets|baseball/i.test(message)) {
    reply = "⚾ Absolutely! Houston Astros tickets available:

" +
      "1. **Minute Maid Park** - 🎟️ [Buy Tickets](https://your-affiliate-ticket-link.com/astros)
" +
      "2. Need a ride? 🚗 [Book an Uber](https://your-affiliate-uber-link.com)";
  } else {
    reply = "🎉 You got it! Let me dig up the best options in " + city + " for that. Stay tuned...";
  }

  return res.json({ reply });
});

app.post('/signup', (req, res) => {
  const { businessName, phone, email, city } = req.body;
  console.log("📥 New Business Signup:", { businessName, phone, email, city });
  res.json({ message: "Thanks! Our team will reach out shortly." });
});

app.listen(PORT, () => {
  console.log(`✅ GCV Backend running on port ${PORT}`);
});

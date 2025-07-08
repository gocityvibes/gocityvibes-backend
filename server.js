
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());

app.post('/chat', async (req, res) => {
  const { message, location, city } = req.body;

  const baseLocation = location
    ? `Lat: ${location.lat}, Lon: ${location.lon}`
    : city || 'Houston, TX';

  const query = message.toLowerCase();

  let response = '';

  if (query.includes('taco')) {
    response = `For some delicious tacos, check out these spots near you:<br><br>
1. Torchy's Tacos<br>
- [MAP:4747 Research Forest Dr, The Woodlands, TX 77381|📍 Map it]<br>
- [CALL:2814658914|Call]<br>
- *Unique taco creations*<br><br>
2. La Cocina de Roberto<br>
- [MAP:3126 Sawdust Rd, The Woodlands, TX 77380|📍 Map it]<br>
- [CALL:8322996706|Call]<br>
- *Authentic street tacos*<br><br>
3. Baja Sur Fresh-Mex<br>
- [MAP:24 Waterway Ave, The Woodlands, TX 77380|📍 Map it]<br>
- [CALL:2814190303|Call]<br>
- *Upscale taco spot with cocktails*`;
  } else if (query.includes('more')) {
    response = `Here are more suggestions:<br><br>
4. Chuy's<br>
- [MAP:18035 I-45 S, Shenandoah, TX 77385|📍 Map it]<br>
- [CALL:9363210444|Call]<br>
- *Tex-Mex classic with quirky decor*<br><br>
5. Fuego Tacos & Burritos<br>
- [MAP:8021 Research Forest Dr, The Woodlands, TX 77382|📍 Map it]<br>
- [CALL:2812989444|Call]<br>
- *Big portions, bold flavor*`;
  } else {
    response = `Hi there! I can help you find bars, restaurants, live music, family fun, and more in your area. Try asking for “tacos near me,” “best live music,” or “bars in ${baseLocation}.”`;
  }

  res.json({ reply: response });
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});

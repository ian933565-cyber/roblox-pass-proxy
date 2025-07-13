const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const app = express();
const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.send("✅ Gamepass Proxy Running");
});

app.get('/getGamepasses', async (req, res) => {
  const userId = req.query.userId;
  if (!userId) {
    return res.status(400).json({ error: "Missing userId parameter" });
  }

  try {
    const url = `https://www.roblox.com/users/${userId}/game-passes`;
    const response = await axios.get(url);
    const $ = cheerio.load(response.data);

    const passIds = [];

    $('a[href*="/game-pass/"]').each((_, el) => {
      const href = $(el).attr('href');
      const match = href.match(/\/game-pass\/(\d+)\//);
      if (match && match[1]) {
        const id = parseInt(match[1]);
        if (!passIds.includes(id)) {
          passIds.push(id);
        }
      }
    });

    return res.json({ passIds });
  } catch (err) {
    console.error("Scrape error:", err.message);
    return res.status(500).json({ error: "Failed to fetch gamepasses" });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

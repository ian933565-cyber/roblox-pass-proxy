const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const app = express();
const PORT = process.env.PORT || 3000;

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

app.get('/', (req, res) => {
  res.send('✅ Gamepass Scraper Running');
});

app.get('/getGamepasses', async (req, res) => {
  const userId = req.query.userId;
  if (!userId) return res.status(400).json({ error: 'Missing userId parameter' });

  try {
    // Step 1: Get user's public games
    const gamesResponse = await axios.get(`https://games.roblox.com/v2/users/${userId}/games?accessFilter=Public&limit=50`);
    const gameIds = gamesResponse.data.data.map(game => game.id);

    const foundPassIds = new Set();

    for (const gameId of gameIds) {
      try {
        const url = `https://www.roblox.com/games/${gameId}`;
        const pageRes = await axios.get(url);
        const $ = cheerio.load(pageRes.data);

        // Look for game pass links in the store section
        $('a[href*="/game-pass/"]').each((_, el) => {
          const href = $(el).attr('href');
          const match = href.match(/\/game-pass\/(\d+)\//);
          if (match && match[1]) {
            foundPassIds.add(parseInt(match[1]));
          }
        });

        await sleep(500); // rate limit protection
      } catch (err) {
        console.warn(`Failed to scrape game ${gameId}: ${err.message}`);
      }
    }

    res.json({ passIds: Array.from(foundPassIds) });
  } catch (err) {
    console.error('Fatal error:', err.message);
    res.status(500).json({ error: 'Failed to fetch gamepasses' });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

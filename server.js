const express = require('express');
const axios = require('axios');
const app = express();
const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.send('✅ Gamepass API Proxy Running');
});

app.get('/getGamepasses', async (req, res) => {
  const userId = req.query.userId;
  if (!userId) return res.status(400).json({ error: 'Missing userId parameter' });

  try {
    // Step 1: Get all public games from the user
    const gamesResponse = await axios.get(`https://games.roblox.com/v2/users/${userId}/games`, {
      params: { accessFilter: 'Public', limit: 50 }
    });

    const gameIds = gamesResponse.data.data.map(game => game.rootPlace.id);
    const passIds = [];

    for (const placeId of gameIds) {
      try {
        const passRes = await axios.get(`https://games.roblox.com/v1/games/${placeId}/game-passes`, {
          headers: {
            'User-Agent': 'Roblox/WinInet'
          }
        });

        const passes = passRes.data.data;
        for (const pass of passes) {
          if (pass.id && pass.price > 0) {
            passIds.push(pass.id);
          }
        }
      } catch (subErr) {
        console.warn(`Failed to load passes for place ${placeId}: ${subErr.message}`);
      }
    }

    res.json({ passIds });
  } catch (err) {
    console.error('Proxy error:', err.message);
    res.status(500).json({ error: 'Failed to fetch gamepasses' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

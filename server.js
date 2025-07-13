const express = require('express');
const axios = require('axios');
const app = express();
const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.send('✅ Gamepass Proxy Running');
});

app.get('/getGamepasses', async (req, res) => {
  const userId = req.query.userId;
  if (!userId) return res.status(400).json({ error: 'Missing userId parameter' });

  try {
    // Step 1: Get all public games created by the user
    const gamesResponse = await axios.get(`https://games.roblox.com/v2/users/${userId}/games`, {
      params: { accessFilter: 'Public', limit: 50 }
    });

    // ✅ Correct: use game.id, not rootPlace.id
    const gameIds = gamesResponse.data.data.map(game => game.id);
    const passIds = [];

    for (const gameId of gameIds) {
      try {
        const passRes = await axios.get(`https://games.roblox.com/v1/games/${gameId}/game-passes`, {
          headers: {
            'User-Agent': 'Roblox/WinInet' // Spoof Roblox client to avoid empty responses
          }
        });

        const passes = passRes.data.data;
        for (const pass of passes) {
          if (pass.id && pass.price > 0) {
            passIds.push(pass.id);
          }
        }
      } catch (subErr) {
        console.warn(`Error fetching passes for game ${gameId}:`, subErr.message);
      }
    }

    res.json({ passIds });
  } catch (err) {
    console.error('Main proxy error:', err.message);
    res.status(500).json({ error: 'Failed to fetch gamepasses' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

const express = require('express');
const axios = require('axios');
const app = express();

const PORT = process.env.PORT || 3000;

app.get('/getGamepasses', async (req, res) => {
  const userId = req.query.userId;
  if (!userId) return res.status(400).json({ error: "Missing userId parameter" });

  try {
    // Step 1: Get public games owned by user
    const gamesRes = await axios.get(`https://games.roblox.com/v2/users/${userId}/games`, {
      params: {
        accessFilter: 'Public',
        limit: 50,
        sortOrder: 'Asc'
      }
    });

    const gameIds = gamesRes.data.data.map(game => game.id);
    if (gameIds.length === 0) return res.json({ passIds: [] });

    // Step 2: Get game passes for each game using proper endpoint
    const passIds = [];

    for (const gameId of gameIds) {
      try {
        const passesRes = await axios.get(`https://games.roblox.com/v1/games/${gameId}/game-passes`);
        for (const pass of passesRes.data.data) {
          if (pass.id && pass.name && pass.price > 0) {
            passIds.push(pass.id);
          }
        }
      } catch (subErr) {
        console.warn(`Failed to get passes for game ${gameId}:`, subErr.message);
      }
    }

    return res.json({ passIds });
  } catch (err) {
    console.error(err.message);
    return res.status(500).json({ error: "Failed to fetch gamepasses" });
  }
});


app.get('/', (req, res) => {
  res.send("✅ Gamepass Proxy Running");
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});

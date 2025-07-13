const express = require('express');
const axios = require('axios');
const app = express();

const PORT = process.env.PORT || 3000;

app.get('/getGamepasses', async (req, res) => {
  const userId = req.query.userId;

  if (!userId) return res.status(400).json({ error: "Missing userId parameter" });

  try {
    // Step 1: Get public games
    const gamesRes = await axios.get(`https://games.roblox.com/v2/users/${userId}/games`, {
      params: { accessFilter: 'Public', limit: 50 }
    });

    const gameIds = gamesRes.data.data.map(game => game.id);
    if (gameIds.length === 0) return res.json({ passIds: [] });

    // Step 2: Get game passes
    const passIds = [];

    for (const gameId of gameIds) {
      const passesRes = await axios.get('https://catalog.roblox.com/v1/search/items', {
        params: {
          category: 11,
          creatorTargetId: userId,
          creatorType: 'User',
          limit: 30,
          sortOrder: 'Desc',
          subcategory: 6,
          contextCountryRegionId: 0
        }
      });

      for (const item of passesRes.data.data) {
        if (item.assetType === 34) { // 34 = GamePass
          passIds.push(item.id);
        }
      }
    }

    res.json({ passIds });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Failed to fetch gamepasses" });
  }
});

app.get('/', (req, res) => {
  res.send("✅ Gamepass Proxy Running");
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});

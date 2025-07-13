const express = require('express');
const axios = require('axios');
const app = express();

const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.send("✅ Gamepass Proxy Running");
});

app.get('/getGamepasses', async (req, res) => {
  const userId = req.query.userId;
  if (!userId) return res.status(400).json({ error: "Missing userId parameter" });

  try {
    // Step 1: Get all public games owned by user
    const gamesRes = await axios.get(`https://games.roblox.com/v2/users/${userId}/games`, {
      params: { accessFilter: 'Public', limit: 50 }
    });

    const gameIds = gamesRes.data.data.map(game => game.id);
    if (gameIds.length === 0) return res.json({ passIds: [] });

    // Step 2: Get all Game Passes by user
    const passesRes = await axios.get('https://catalog.roblox.com/v1/search/items', {
      params: {
        category: 11,
        subcategory: 6,
        limit: 30,
        creatorTargetId: userId,
        creatorType: 'User',
        sortOrder: 'Desc'
      }
    });

    const validPassIds = passesRes.data.data
      .filter(item => item.assetType === 34 && item.price > 0 && gameIds.includes(item.creatorHasVerifiedBadge ? item.creatorTargetId : item.creatorTargetId))
      .map(item => item.id);

    return res.json({ passIds: validPassIds });
  } catch (err) {
    console.error("Proxy Error:", err.message);
    return res.status(500).json({ error: "Failed to fetch gamepasses" });
  }
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});

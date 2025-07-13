// proxy_server.js (Improved with error handling and rate limit resilience)
const express = require("express");
const axios = require("axios");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());

app.get("/gamepasses", async (req, res) => {
  const userId = req.query.userId;
  if (!userId) return res.status(400).json({ error: "Missing userId" });

  try {
    const gamesUrl = `https://games.roblox.com/v2/users/${userId}/games?sortOrder=Asc&limit=50`;
    const gamesResponse = await axios.get(gamesUrl);
    const games = gamesResponse.data.data || [];

    const allPasses = [];

    for (const game of games) {
      const universeId = game.universeId;
      const passesUrl = `https://apis.roblox.com/game-passes/v1/game-passes?universeId=${universeId}`;

      try {
        const passesResponse = await axios.get(passesUrl, { timeout: 5000 });
        const passes = passesResponse.data;
        passes.forEach(pass => {
          allPasses.push({
            name: pass.name,
            id: pass.id,
            price: pass.price ?? 0
          });
        });
      } catch (err) {
        console.warn(`[Proxy] ⚠️ Failed to get passes for universe ${universeId}:`, err.response?.status || err.message);
      }
    }

    res.json(allPasses);
  } catch (err) {
    console.error("[Proxy] ❌ Failed to fetch games or gamepasses:", err.message);
    res.status(502).json({ error: "Bad Gateway. Failed to retrieve passes." });
  }
});

app.get("/", (req, res) => {
  res.send("✅ GamePass Proxy Server Running");
});

app.listen(PORT, () => {
  console.log(`🚀 Proxy server running on port ${PORT}`);
});

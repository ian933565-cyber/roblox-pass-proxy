// proxy_server.js (Node.js with Express)
// Fetches public games and their GamePasses from a user using Roblox APIs

const express = require("express");
const axios = require("axios");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());

// Get all GamePasses for a user by fetching their public games and the passes per universe
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
        const passesResponse = await axios.get(passesUrl);
        const passes = passesResponse.data;
        passes.forEach(pass => {
          allPasses.push({
            name: pass.name,
            id: pass.id,
            price: pass.price ?? 0
          });
        });
      } catch (err) {
        console.warn(`Failed to get passes for universe ${universeId}:`, err.response?.status);
      }
    }

    res.json(allPasses);
  } catch (err) {
    console.error("Error fetching gamepasses:", err);
    res.status(500).json({ error: "Failed to fetch gamepasses." });
  }
});

app.get("/", (req, res) => {
  res.send("GamePass Proxy Server Running");
});

app.listen(PORT, () => {
  console.log(`Proxy server running on port ${PORT}`);
});

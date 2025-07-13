const express = require('express');
const axios = require('axios');
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
    // Step 1: Get all Game Passes created by the user (browsable from the catalog)
    const response = await axios.get("https://catalog.roblox.com/v1/search/items", {
      params: {
        category: 11, // passes
        subcategory: 6, // gamepasses
        creatorTargetId: userId,
        creatorType: "User",
        limit: 30,
        sortOrder: "Desc"
      }
    });

    const data = response.data;
    if (!data || !data.data || !Array.isArray(data.data)) {
      return res.json({ passIds: [] });
    }

    // Step 2: Filter out any invalid or zero-price passes
    const passIds = data.data
      .filter(item => item.assetType === 34 && item.price > 0)
      .map(item => item.id);

    return res.json({ passIds });
  } catch (err) {
    console.error("Error fetching passes:", err.message);
    return res.status(500).json({ error: "Failed to fetch gamepasses" });
  }
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});

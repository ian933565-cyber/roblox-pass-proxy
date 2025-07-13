const express = require('express');
const axios = require('axios');
const app = express();
const PORT = process.env.PORT || 3000;

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function fetchGamePassesWithRetry(userId, retries = 3) {
  const url = "https://catalog.roblox.com/v1/search/items";
  const params = {
    category: 11,
    subcategory: 6,
    creatorTargetId: userId,
    creatorType: "User",
    limit: 30,
    sortOrder: "Desc"
  };

  for (let i = 0; i < retries; i++) {
    try {
      const response = await axios.get(url, { params });
      return response.data;
    } catch (err) {
      if (err.response && err.response.status === 429) {
        console.warn("Rate limited, retrying in 1s...");
        await sleep(1000); // Wait 1 second then retry
      } else {
        throw err; // Other errors we let fail
      }
    }
  }

  throw new Error("Failed after retries");
}

app.get('/', (req, res) => {
  res.send("✅ Gamepass Proxy Running");
});

app.get('/getGamepasses', async (req, res) => {
  const userId = req.query.userId;
  if (!userId) {
    return res.status(400).json({ error: "Missing userId parameter" });
  }

  try {
    const data = await fetchGamePassesWithRetry(userId);

    if (!data || !Array.isArray(data.data)) {
      return res.json({ passIds: [] });
    }

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

const express = require('express');
const axios = require('axios');
const app = express();
const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.send('✅ Gamepass Proxy Running');
});

app.get('/getGamepasses', async (req, res) => {
  const userId = req.query.userId;
  if (!userId) {
    return res.status(400).json({ error: 'Missing userId parameter' });
  }

  try {
    const url = `https://apis.roblox.com/game-passes/v1/users/${userId}/game-passes?count=100`;
    const response = await axios.get(url);

    const passes = response.data?.data || [];

    const filteredPassIds = passes
      .filter(pass =>
        pass.creatorId?.toString() === userId.toString() && // Only include passes created by the user
        pass.isForSale &&
        pass.price > 0
      )
      .map(pass => pass.id);

    res.json({ passIds: filteredPassIds });
  } catch (err) {
    console.error("Error fetching passes:", err.message);
    res.status(500).json({ error: "Failed to fetch gamepasses" });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

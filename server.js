const express = require('express');
const axios = require('axios');
const app = express();
const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.send('✅ Gamepass Proxy (Open API) Running');
});

app.get('/getGamepasses', async (req, res) => {
  const userId = req.query.userId;
  if (!userId) return res.status(400).json({ error: 'Missing userId parameter' });

  try {
    const response = await axios.get(
      `https://apis.roblox.com/game-passes/v1/users/${userId}/game-passes?count=100`
    );

    const passIds = (response.data.data || [])
      .filter(pass => pass.isForSale && pass.price > 0)
      .map(pass => pass.id);

    res.json({ passIds });
  } catch (err) {
    console.error("Fetch failed:", err.message);
    res.status(500).json({ error: "Failed to fetch gamepasses" });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

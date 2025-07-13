const express = require('express');
const axios = require('axios');
const app = express();
const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.send('✅ Gamepass Proxy Running');
});

app.get('/getGamepasses', async (req, res) => {
  const userId = req.query.userId;
  if (!userId || isNaN(Number(userId))) {
    return res.status(400).json({ error: 'Missing or invalid userId parameter' });
  }

  try {
    const response = await axios.get(
      `https://apis.roblox.com/game-passes/v1/users/${userId}/game-passes?count=100`
    );

    const passes = response.data?.data || [];

    const filteredPassIds = passes
      .filter(pass =>
        Number(pass.creatorId) === Number(userId) && // ✅ Ensure both are numbers
        pass.isForSale &&
        pass.price > 0
      )
      .map(pass => pass.id);

    res.json({ passIds: filteredPassIds });
  } catch (err) {
    console.error('Fetch error:', err.message);
    res.status(500).json({ error: 'Failed to fetch gamepasses' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

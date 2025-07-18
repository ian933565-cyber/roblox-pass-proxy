const express = require("express");
const axios = require("axios");

const app = express();
const PORT = process.env.PORT || 3000;

// ➕ CORS freigeben (optional, für Roblox Studio-Tests im Browser)
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  next();
});

// 📦 API-Endpunkt für Gamepasses
app.get("/gamepasses/:userId", async (req, res) => {
  const userId = req.params.userId;

  try {
    const response = await axios.get(`https://games.roblox.com/v1/users/${userId}/game-passes`);
    res.json({ success: true, gamepasses: response.data.data });
  } catch (error) {
    console.error("❌ Fehler beim Proxy:", error.message);
    res.status(500).json({ success: false, error: "Proxy-Fehler" });
  }
});

// ✅ Server starten
app.listen(PORT, () => {
  console.log(`✅ RoProxy läuft auf http://localhost:${PORT}`);
});

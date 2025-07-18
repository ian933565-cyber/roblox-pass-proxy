const express = require("express");
const fetch = require("node-fetch");
const cors = require("cors");

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());

app.use("/", async (req, res) => {
    const robloxUrl = `https://apis.roblox.com${req.originalUrl}`;
    console.log("→ Anfrage an:", robloxUrl);

    try {
        const response = await fetch(robloxUrl, {
            headers: {
                "User-Agent": "Mozilla/5.0",
                "Accept": "application/json"
            }
        });

        const contentType = response.headers.get("content-type");
        const body = await response.text();

        if (contentType && contentType.includes("application/json")) {
            res.setHeader("Content-Type", "application/json");
        }

        res.status(response.status).send(body);
    } catch (err) {
        console.error("❌ Fehler beim Proxy:", err.message);
        res.status(500).json({ error: "Proxy-Fehler" });
    }
});

app.listen(port, () => {
    console.log(`✅ RoProxy läuft unter http://localhost:${port}`);
});

import express from "express";
import { createServer as createViteServer } from "vite";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Use process.cwd() to ensure we are in the project root
const VIEWS_FILE = path.join(process.cwd(), "views.json");

function getViews() {
    try {
        if (fs.existsSync(VIEWS_FILE)) {
            const data = fs.readFileSync(VIEWS_FILE, "utf-8");
            const parsed = JSON.parse(data);
            return typeof parsed.count === 'number' ? parsed.count : 0;
        }
    } catch (e) {
        console.error("Error reading views file:", e);
    }
    return 0;
}

function incrementViews() {
    const count = getViews() + 1;
    try {
        fs.writeFileSync(VIEWS_FILE, JSON.stringify({ count }), "utf-8");
    } catch (e) {
        console.error("Error writing views file:", e);
    }
    return count;
}

async function startServer() {
    const app = express();
    const PORT = 3000;

    // Initialize views.json if it doesn't exist
    if (!fs.existsSync(VIEWS_FILE)) {
        try {
            fs.writeFileSync(VIEWS_FILE, JSON.stringify({ count: 1337 }), "utf-8");
            console.log("Initialized views.json with 1337");
        } catch (e) {
            console.error("Error initializing views file:", e);
        }
    }

    // API to get and increment views
    app.get("/api/views", (req, res) => {
        try {
            const count = incrementViews();
            res.json({ count });
        } catch (e) {
            console.error("API error:", e);
            res.status(500).json({ error: "Internal server error" });
        }
    });

    // Vite middleware for development
    if (process.env.NODE_ENV !== "production") {
        const vite = await createViteServer({
            server: { middlewareMode: true },
            appType: "spa",
        });
        app.use(vite.middlewares);
    } else {
        const distPath = path.join(process.cwd(), "dist");
        app.use(express.static(distPath));
        app.get("*", (req, res) => {
            res.sendFile(path.join(distPath, "index.html"));
        });
    }

    app.listen(PORT, "0.0.0.0", () => {
        console.log(`Server running on http://localhost:${PORT}`);
    });
}

startServer();

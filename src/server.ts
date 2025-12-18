import express from "express";
import { readFile } from "fs/promises";
import path from "path";

const app = express();
const PORT = 3000;

// Poprawiona ścieżka względem pliku server.ts
const FILE_PATH = path.join(__dirname, "../available.txt");

app.get("/list", async (req, res) => {
  try {
    const data = await readFile(FILE_PATH, "utf-8");
    const lines = data.split("\n").filter(Boolean);
    res.json({ count: lines.length, available: lines });
  } catch (e) {
    res.status(500).json({ error: (e as Error).message });
  }
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running at http://0.0.0.0:${PORT}`);
});

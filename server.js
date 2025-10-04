const express = require("express");
const fs = require("fs");
const path = require("path");
const { v4: uuidv4 } = require("uuid");

const app = express();
const PORT = 3000;

// Pfad zur Originaldatei
const MASTER = path.join(__dirname, "masters", "Widerrufsformular1.pdf");

// Statische Dateien (alle HTML, CSS, JS usw.)
app.use(express.static(__dirname));

// Endpunkt zum Download einer Kopie
app.get("/download/widerruf", (req, res) => {
const copyName = `widerruf_${uuidv4()}.pdf`;
const tmpDir = path.join(__dirname, "tmp");
const tmpPath = path.join(tmpDir, copyName);

fs.mkdirSync(tmpDir, { recursive: true });
fs.copyFileSync(MASTER, tmpPath);

res.download(tmpPath, "Widerrufsformular_Kopie.pdf", (err) => {
if (err) console.error("Fehler:", err);
fs.unlink(tmpPath, () => {}); // temporäre Kopie wieder löschen
});
});

app.listen(PORT, () => {
console.log(`✅ Server läuft unter: http://localhost:${PORT}`);
});
/*
ZENTRA CORE — SNAPSHOT ENGINE
Mission / system durum kaydı
*/

const fs = require("fs");
const path = require("path");

const SNAPSHOT_FILE = path.join(__dirname, "../data/core-snapshots.json");

function ensureFile() {
  const dir = path.dirname(SNAPSHOT_FILE);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  if (!fs.existsSync(SNAPSHOT_FILE)) fs.writeFileSync(SNAPSHOT_FILE, "[]");
}

const SNAPSHOT_ENGINE = {
  create(snapshot) {
    ensureFile();

    const current = JSON.parse(fs.readFileSync(SNAPSHOT_FILE, "utf8"));

    const record = {
      id: "snapshot_" + Date.now(),
      timestamp: new Date().toISOString(),
      ...snapshot
    };

    current.push(record);
    fs.writeFileSync(SNAPSHOT_FILE, JSON.stringify(current, null, 2));

    return record;
  },

  list() {
    ensureFile();
    return JSON.parse(fs.readFileSync(SNAPSHOT_FILE, "utf8"));
  }
};

module.exports = SNAPSHOT_ENGINE;

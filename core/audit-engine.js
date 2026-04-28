/*
ZENTRA CORE — AUDIT ENGINE
Execution iz ve kanıt kayıt katmanı
*/

const fs = require("fs");
const path = require("path");

const AUDIT_FILE = path.join(__dirname, "../data/core-audit-log.json");

function ensureFile() {
  const dir = path.dirname(AUDIT_FILE);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  if (!fs.existsSync(AUDIT_FILE)) fs.writeFileSync(AUDIT_FILE, "[]");
}

const AUDIT_ENGINE = {
  log(entry) {
    ensureFile();

    const current = JSON.parse(fs.readFileSync(AUDIT_FILE, "utf8"));

    const record = {
      id: "audit_" + Date.now(),
      timestamp: new Date().toISOString(),
      ...entry
    };

    current.push(record);
    fs.writeFileSync(AUDIT_FILE, JSON.stringify(current, null, 2));

    return record;
  },

  list() {
    ensureFile();
    return JSON.parse(fs.readFileSync(AUDIT_FILE, "utf8"));
  }
};

module.exports = AUDIT_ENGINE;

const fs = require('fs');
const path = require('path');
const LOG = require('./logger');

const FILE = path.join(__dirname, '../data/core-snapshots.json');

function ensure() {
  const dir = path.dirname(FILE);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  if (!fs.existsSync(FILE)) fs.writeFileSync(FILE, '[]');
}

function safeRead() {
  try {
    ensure();
    return JSON.parse(fs.readFileSync(FILE, 'utf8') || '[]');
  } catch(e) {
    LOG.error('snapshot_read_error', {e: String(e)});
    return [];
  }
}

function safeWrite(arr) {
  const tmp = FILE + '.tmp';
  fs.writeFileSync(tmp, JSON.stringify(arr, null, 2));
  fs.renameSync(tmp, FILE);
}

const SNAPSHOT = {
  create(entry) {
    const cur = safeRead();
    const rec = {
      id: 'snapshot_' + Date.now(),
      ts: new Date().toISOString(),
      ...entry
    };
    cur.push(rec);
    safeWrite(cur);
    LOG.info('snapshot_create', {id: rec.id, type: entry.type});
    return rec;
  },
  list() { return safeRead(); }
};

module.exports = SNAPSHOT;

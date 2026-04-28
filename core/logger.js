const fs = require('fs');
const path = require('path');

const LOG_FILE = path.join(__dirname, '../logs/core.log');

function ensure() {
  const dir = path.dirname(LOG_FILE);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  if (!fs.existsSync(LOG_FILE)) fs.writeFileSync(LOG_FILE, '');
}

function write(level, msg, meta={}) {
  ensure();
  const line = JSON.stringify({
    ts: new Date().toISOString(),
    level,
    msg,
    ...meta
  }) + '\n';
  fs.appendFileSync(LOG_FILE, line);
}

module.exports = {
  info: (m, meta) => write('info', m, meta),
  error: (m, meta) => write('error', m, meta)
};

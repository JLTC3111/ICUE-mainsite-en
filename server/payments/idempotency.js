const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '../../data');
const FILE = path.join(DATA_DIR, 'processed-webhooks.json');
const processed = new Set();

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
}

function load() {
  ensureDataDir();
  if (!fs.existsSync(FILE)) return;
  try {
    const ids = JSON.parse(fs.readFileSync(FILE, 'utf8'));
    if (Array.isArray(ids)) ids.forEach((id) => processed.add(id));
  } catch {
    // ignore
  }
}

function save() {
  ensureDataDir();
  const ids = Array.from(processed).slice(-2000);
  fs.writeFileSync(FILE, JSON.stringify(ids));
}

function claim(eventKey) {
  if (processed.has(eventKey)) return false;
  processed.add(eventKey);
  save();
  return true;
}

load();

module.exports = { claim };

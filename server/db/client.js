const fs = require('fs');
const path = require('path');

let db;

function getDatabasePath() {
  const configured = process.env.DATABASE_PATH;
  if (configured) {
    return path.isAbsolute(configured)
      ? configured
      : path.join(process.cwd(), configured);
  }
  return path.join(__dirname, '../../data/icue-payments.sqlite');
}

function runMigrations(database) {
  const migrationsDir = path.join(__dirname, 'migrations');
  const files = fs
    .readdirSync(migrationsDir)
    .filter((f) => f.endsWith('.sql'))
    .sort();

  database.exec(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      id TEXT PRIMARY KEY,
      applied_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);

  const applied = new Set(
    database.prepare('SELECT id FROM schema_migrations').all().map((r) => r.id)
  );

  for (const file of files) {
    if (applied.has(file)) continue;
    const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf8');
    database.exec(sql);
    database.prepare('INSERT INTO schema_migrations (id) VALUES (?)').run(file);
    console.log('[db] applied migration', file);
  }
}

function initDatabase() {
  if (db) return db;

  const Database = require('better-sqlite3');
  const dbPath = getDatabasePath();
  const dir = path.dirname(dbPath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  db = new Database(dbPath);
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');
  runMigrations(db);
  console.log('[db] ready at', dbPath);
  return db;
}

function getDb() {
  if (!db) initDatabase();
  return db;
}

module.exports = { initDatabase, getDb, getDatabasePath };

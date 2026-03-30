const path = require("path");
const sqlite3 = require("sqlite3");
const { open } = require("sqlite");

let db;

async function initSQLite() {
  db = await open({
    filename: path.join(__dirname, "../chat_history.db"),
    driver: sqlite3.Database,
  });

  await db.exec(`
    CREATE TABLE IF NOT EXISTS chat_sessions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      title TEXT DEFAULT 'New Chat',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await db.exec(`
    CREATE TABLE IF NOT EXISTS messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      session_id INTEGER NOT NULL,
      user_id INTEGER NOT NULL,
      role TEXT NOT NULL CHECK(role IN ('user', 'assistant')),
      content TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (session_id) REFERENCES chat_sessions(id)
    )
  `);

  console.log("✅ SQLite initializat pentru chat history");
}

function getSQLiteDB() {
  if (!db) {
    throw new Error("SQLite nu este inițializat încă.");
  }
  return db;
}

module.exports = { initSQLite, getSQLiteDB };
const { getSQLiteDB } = require("../config/sqlite");

const createSession = async (req, res) => {
  try {
    const { user_id, title } = req.body;

    if (!user_id) {
      return res.status(400).json({ message: "user_id este obligatoriu." });
    }

    const db = getSQLiteDB();

    const result = await db.run(
      `INSERT INTO chat_sessions (user_id, title) VALUES (?, ?)`,
      [user_id, title || "New Chat"],
    );

    const newSession = await db.get(
      `SELECT * FROM chat_sessions WHERE id = ?`,
      [result.lastID],
    );

    return res.status(201).json(newSession);
  } catch (error) {
    console.error("Eroare la createSession:", error);
    return res.status(500).json({ message: "Eroare internă de server." });
  }
};

const getSessionsByUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const db = getSQLiteDB();

    const sessions = await db.all(
      `
      SELECT cs.*
      FROM chat_sessions cs
      WHERE cs.user_id = ?
        AND EXISTS (
          SELECT 1
          FROM messages m
          WHERE m.session_id = cs.id
        )
      ORDER BY cs.updated_at DESC
      `,
      [userId],
    );

    return res.json(sessions);
  } catch (error) {
    console.error("Eroare la getSessionsByUser:", error);
    return res.status(500).json({ message: "Eroare internă de server." });
  }
};

const getMessagesBySession = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const db = getSQLiteDB();

    const messages = await db.all(
      `SELECT * FROM messages WHERE session_id = ? ORDER BY created_at ASC`,
      [sessionId],
    );

    return res.json(messages);
  } catch (error) {
    console.error("Eroare la getMessagesBySession:", error);
    return res.status(500).json({ message: "Eroare internă de server." });
  }
};

const saveMessage = async (req, res) => {
  try {
    const { session_id, user_id, role, content } = req.body;

    if (!session_id || !user_id || !role || !content) {
      return res.status(400).json({ message: "Date incomplete." });
    }

    const db = getSQLiteDB();

    const result = await db.run(
      `INSERT INTO messages (session_id, user_id, role, content) VALUES (?, ?, ?, ?)`,
      [session_id, user_id, role, content],
    );

    await db.run(
      `UPDATE chat_sessions SET updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
      [session_id],
    );

    const newMessage = await db.get(`SELECT * FROM messages WHERE id = ?`, [
      result.lastID,
    ]);

    return res.status(201).json(newMessage);
  } catch (error) {
    console.error("Eroare la saveMessage:", error);
    return res.status(500).json({ message: "Eroare internă de server." });
  }
};

module.exports = {
  createSession,
  getSessionsByUser,
  getMessagesBySession,
  saveMessage,
};

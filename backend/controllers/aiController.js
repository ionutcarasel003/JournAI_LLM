const { execFile } = require("child_process");
const path = require("path");
const { getSQLiteDB } = require("../config/sqlite");

const buildSessionTitle = (text) => {
  const clean = text.replace(/\s+/g, " ").trim();
  if (!clean) return "New Chat";
  return clean.length > 40 ? clean.slice(0, 40) + "..." : clean;
};

const analyzeRisk = async (req, res) => {
  try {
    const { text, session_id, user_id } = req.body;

    if (!text || !text.trim()) {
      return res.status(400).json({ message: "Textul este obligatoriu." });
    }

    if (!session_id || !user_id) {
      return res.status(400).json({ message: "session_id și user_id sunt obligatorii." });
    }

    const db = getSQLiteDB();

    const trimmedText = text.trim();

    await db.run(
      `INSERT INTO messages (session_id, user_id, role, content) VALUES (?, ?, ?, ?)`,
      [session_id, user_id, "user", trimmedText]
    );

    const existingCount = await db.get(
      `SELECT COUNT(*) as count FROM messages WHERE session_id = ?`,
      [session_id]
    );

    if (existingCount.count === 1) {
      const generatedTitle = buildSessionTitle(trimmedText);

      await db.run(
        `UPDATE chat_sessions
         SET title = ?, updated_at = CURRENT_TIMESTAMP
         WHERE id = ?`,
        [generatedTitle, session_id]
      );
    } else {
      await db.run(
        `UPDATE chat_sessions SET updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
        [session_id]
      );
    }

    const scriptPath = path.join(__dirname, "../initializer/initRiskLevel.py");

    execFile("python", [scriptPath, trimmedText], async (error, stdout, stderr) => {
      if (stderr) {
        console.error(stderr);
      }

      if (error) {
        console.error("Eroare la rularea scriptului Python:");
        console.error(error);

        return res.status(500).json({
          message: "Eroare la analizarea textului.",
        });
      }

      try {
        const result = JSON.parse(stdout);

        console.log("Text primit de la frontend:");
        console.log(trimmedText);

        console.log("Risk level detectat:");
        console.log(result.risk_level);

        console.log("Probabilities:");
        console.log(result.probabilities);

        let reply = "Am primit mesajul tău și l-am analizat.";

        await db.run(
          `INSERT INTO messages (session_id, user_id, role, content) VALUES (?, ?, ?, ?)`,
          [session_id, user_id, "assistant", reply]
        );

        await db.run(
          `UPDATE chat_sessions SET updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
          [session_id]
        );

        return res.json({
          reply,
          risk_level: result.risk_level,
          probabilities: result.probabilities,
        });
      } catch (parseError) {
        console.error("Eroare la parsarea răspunsului din Python:");
        console.error(parseError);
        console.error("stdout primit:");
        console.error(stdout);

        return res.status(500).json({
          message: "Răspuns invalid de la model.",
        });
      }
    });
  } catch (error) {
    console.error("Eroare internă în analyzeRisk:", error);
    return res.status(500).json({
      message: "Eroare internă de server.",
    });
  }
};

module.exports = { analyzeRisk };
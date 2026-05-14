const { execFile } = require("child_process");
const util = require("util");
const path = require("path");
const { getSQLiteDB } = require("../config/sqlite");

const execFileAsync = util.promisify(execFile);

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

    const riskScriptPath = path.join(__dirname, "../initializer/initRiskLevel.py");
    const reflectionScriptPath = path.join(__dirname, "../initializer/generate_reflection.py");

    console.log("Se inițiază scriptul Python pentru analiza de risc...");

    let riskResult;
    try {
      riskResult = await execFileAsync("uv", ["run", "python", riskScriptPath, trimmedText]);
    } catch (err) {
      // Dacă scriptul python returnează eroare, execFile va arunca o excepție
      riskResult = { error: err };
    }

    // Proceseaza rezultatul pentru Risk Level
    let risk_level = "unknown";
    let probabilities = { low: 0, medium: 0, high: 0 };

    if (!riskResult.error) {
      try {
        const parsedRisk = JSON.parse(riskResult.stdout);
        risk_level = parsedRisk.risk_level;
        probabilities = parsedRisk.probabilities;
      } catch (e) {
        console.error("Eroare parsare output risk script:", e);
      }
    } else {
      console.error("Eroare rulare risk script:", riskResult.error);
    }

    // Folosim MentalChat în mod implicit conform cerinței utilizatorului
    let adapterName = "MentalChat";
    // Comentat logica veche care alegea EmpatheticDialogues pentru risc scăzut
    // if (risk_level === "low_risk" || risk_level === "no_risk" || risk_level === "unknown") {
    //   adapterName = "EmpatheticDialogues";
    // }

    console.log(`Risc detectat: ${risk_level}. Folosim modelul: ${adapterName}`);

    // Ruleaza generarea reflectiei folosind modelul ales
    let reflectionResult;
    try {
      reflectionResult = await execFileAsync("uv", ["run", "python", reflectionScriptPath, adapterName, trimmedText]);
    } catch (err) {
      reflectionResult = { error: err };
    }

    // Proceseaza rezultatul pentru Generarea Reflectiei
    let reply = "I'm here for you and I hear what you're saying. (Eroare la generare)";

    if (!reflectionResult.error) {
      const stdout = reflectionResult.stdout.trim();
      if (stdout) {
        reply = stdout;
      }
    } else {
      console.error("Eroare rulare reflection script:", reflectionResult.error);
    }

    console.log("Răspuns generat:", reply.substring(0, 100) + "...");

    // Salvează mesajul asistentului în baza de date
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
      risk_level,
      probabilities,
    });

  } catch (error) {
    console.error("Eroare internă în analyzeRisk:", error);
    return res.status(500).json({
      message: "Eroare internă de server.",
    });
  }
};

module.exports = { analyzeRisk };
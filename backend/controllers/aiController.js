const { execFile } = require("child_process");
const path = require("path");

const analyzeRisk = async (req, res) => {
  try {
    const { text } = req.body;

    if (!text || !text.trim()) {
      return res.status(400).json({ message: "Textul este obligatoriu." });
    }

    const scriptPath = path.join(__dirname, "../initializer/initRiskLevel.py");

    execFile("python", [scriptPath, text], (error, stdout, stderr) => {
      if (error) {
        console.error("Eroare la rularea scriptului Python:");
        console.error(error);
        console.error(stderr);

        return res.status(500).json({
          message: "Eroare la analizarea textului.",
        });
      }

      try {
        const result = JSON.parse(stdout);

        console.log("Text primit de la frontend:");
        console.log(text);
        console.log("Risk level detectat:");
        console.log(result.risk_level);

        return res.json({
          reply: "Am primit mesajul tău și l-am analizat.",
        });
      } catch (parseError) {
        console.error("Eroare la parsarea răspunsului din Python:");
        console.error(parseError);
        console.error("stdout primit:", stdout);

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
const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/authRoutes');
const moodRoutes = require('./routes/moodRoutes');
const aiRoutes = require("./routes/aiRoutes");
const chatRoutes = require("./routes/chatRoutes");

const app = express();

const { initSQLite } = require("./config/sqlite");

app.use(cors());
app.use(express.json()); 


app.use('/api/auth', authRoutes);
app.use('/api/moods', moodRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/chat", chatRoutes);

const PORT = 3000;

async function startServer() {
  try {
    await initSQLite();

    app.listen(PORT, () => {
      console.log(`🚀 Serverul backend rulează pe portul ${PORT}`);
    });
  } catch (error) {
    console.error("Eroare la pornirea serverului:", error);
  }
}

startServer();
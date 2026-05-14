const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/authRoutes');
const moodRoutes = require('./routes/moodRoutes');
const emotionRoutes = require('./routes/emotionRoutes');
const chatRoutes = require('./routes/chatRoutes');
const aiRoutes = require('./routes/aiRoutes');
const { initSQLite } = require('./config/sqlite');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/moods', moodRoutes);
app.use('/api/emotions', emotionRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/ai', aiRoutes);

const PORT = 3000;

initSQLite().then(() => {
    app.listen(PORT, () => {
        console.log(`🚀 Serverul backend rulează pe portul ${PORT}`);
    });
}).catch(err => {
    console.error("❌ Eroare la inițializarea SQLite:", err);
});

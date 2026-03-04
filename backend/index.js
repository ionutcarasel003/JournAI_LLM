const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/authRoutes');
const moodRoutes = require('./routes/moodRoutes');

const app = express();

app.use(cors());
app.use(express.json()); 

app.use('/api/auth', authRoutes);
app.use('/api/moods', moodRoutes);

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`🚀 Serverul backend rulează pe portul ${PORT}`);
});
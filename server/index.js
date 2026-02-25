const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const bcrypt = require('bcryptjs');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json({ limit: '50mb' }));

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'admin',
    database: 'asistent_empatic'
});

db.connect((err) => {
    if (err) {
        console.error('Eroare MySQL:', err.message);
    } else {
        console.log('✅ Conectat la MySQL!');
        createTables();
    }
});

function createTables() {
    const usersTable = `
        CREATE TABLE IF NOT EXISTS users (
            id INT AUTO_INCREMENT PRIMARY KEY,
            email VARCHAR(255) NOT NULL UNIQUE,
            password VARCHAR(255) NOT NULL,
            avatar LONGTEXT
        )
    `;

    const moodsTable = `
        CREATE TABLE IF NOT EXISTS moods (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT,
            score INT,
            note TEXT,
            date DATE,
            FOREIGN KEY (user_id) REFERENCES users(id)
        )
    `;

    db.query(usersTable);
    db.query(moodsTable);
}


app.post('/api/register', async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: "Date incomplete!" });

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const sql = `INSERT INTO users (email, password) VALUES (?, ?)`;
        db.query(sql, [email, hashedPassword], (err, result) => {
            if (err) return res.status(400).json({ error: "Email existent!" });
            res.json({ message: "Cont creat!", id: result.insertId });
        });
    } catch (e) { res.status(500).json({ error: "Eroare server" }); }
});

app.post('/api/login', (req, res) => {
    const { email, password } = req.body;
    const sql = `SELECT * FROM users WHERE email = ?`;
    
    db.query(sql, [email], async (err, results) => {
        if (err || results.length === 0) return res.status(401).json({ error: "Credențiale greșite" });

        const user = results[0];
        const match = await bcrypt.compare(password, user.password);

        if (match) {
            res.json({ 
                message: "Login reușit", 
                user: { id: user.id, email: user.email, avatar: user.avatar } 
            });
        } else {
            res.status(401).json({ error: "Parolă greșită" });
        }
    });
});

app.put('/api/users/:id/avatar', (req, res) => {
    const { avatar } = req.body; 
    const userId = req.params.id;

    const sql = `UPDATE users SET avatar = ? WHERE id = ?`;

    db.query(sql, [avatar, userId], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: "Avatar actualizat cu succes!" });
    });
});

app.get('/api/users/:id', (req, res) => {
    const sql = `SELECT id, email, avatar FROM users WHERE id = ?`;
    db.query(sql, [req.params.id], (err, results) => {
        if (err || results.length === 0) return res.status(404).json({ error: "User not found" });
        res.json(results[0]);
    });
});

app.post('/api/moods', (req, res) => {
    const { userId, score, note } = req.body;
    const date = new Date().toISOString().split('T')[0];
    const sql = `INSERT INTO moods (user_id, score, note, date) VALUES (?, ?, ?, ?)`;
    db.query(sql, [userId, score, note, date], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: "Salvat!", id: result.insertId });
    });
});

app.get('/api/moods/:userId', (req, res) => {
    const sql = `SELECT * FROM moods WHERE user_id = ? ORDER BY id DESC LIMIT 7`;
    db.query(sql, [req.params.userId], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

app.delete('/api/moods/:id', (req, res) => {
    const { id } = req.params;
    const sql = 'DELETE FROM moods WHERE id = ?';
    db.query(sql, [id], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Eroare la ștergere' });
        }
        res.json({ message: 'Intrare ștearsă cu succes' });
    });
});

app.listen(PORT, () => {
    console.log(`🚀 Serverul rulează pe portul ${PORT}`);
});
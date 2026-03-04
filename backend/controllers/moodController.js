const db = require('../config/db');

const createMood = (req, res) => {
    const { userId, score, note } = req.body;
    
    if (!userId || score === undefined) {
        return res.status(400).json({ error: 'Date incomplete' });
    }

    const sql = 'INSERT INTO moods (user_id, score, note, date) VALUES (?, ?, ?, NOW())';
    db.query(sql, [userId, score, note], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Eroare la salvarea în baza de date' });
        }
        res.status(201).json({ message: 'Intrare salvată cu succes!' });
    });
};

const getMoods = (req, res) => {
    const { userId } = req.params;
    const sql = 'SELECT * FROM moods WHERE user_id = ? ORDER BY date DESC';
    
    db.query(sql, [userId], (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Eroare la citirea datelor' });
        }
        res.json(results);
    });
};

const deleteMood = (req, res) => {
    const { id } = req.params;
    const sql = 'DELETE FROM moods WHERE id = ?';
    
    db.query(sql, [id], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Eroare la ștergere' });
        }
        res.json({ message: 'Intrare ștearsă cu succes' });
    });
};

module.exports = {
    createMood,
    getMoods,
    deleteMood
};
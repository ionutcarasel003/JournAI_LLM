const db = require('../config/db');
const http = require('http');

const analyzeEmotionInternal = (text) => {
    return new Promise((resolve, reject) => {
        const payload = JSON.stringify({ text });
        const options = {
            hostname: '127.0.0.1',
            port: 5050,
            path: '/analyze',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(payload),
                'User-Agent': 'JournAI-Backend'
            }
        };

        const req = http.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => { data += chunk; });
            res.on('end', () => {
                console.log('[emotion] status:', res.statusCode, '| raw:', data);
                try {
                    if (res.statusCode >= 400) {
                        return reject(new Error(`Status ${res.statusCode}`));
                    }
                    resolve(JSON.parse(data));
                } catch (e) {
                    console.error('[emotion] parse error:', e.message, '| raw:', data);
                    reject(e);
                }
            });
        });

        req.on('error', (err) => {
            reject(err);
        });

        req.write(payload);
        req.end();
    });
};

const createMood = async (req, res) => {
    const { userId, score, note } = req.body;

    if (!userId || score === undefined) {
        return res.status(400).json({ error: 'Incomplete data' });
    }

    let emotions = null;
    if (note && note.trim()) {
        try {
            const emotionResult = await analyzeEmotionInternal(note);
            if (emotionResult && emotionResult.emotions) {
                emotions = JSON.stringify(emotionResult.emotions);
            }
        } catch (err) {
            console.error("⚠️ Emotion detection error:", err.message);
        }
    }

    const sql = 'INSERT INTO moods (user_id, score, note, emotions, date) VALUES (?, ?, ?, ?, NOW())';
    db.query(sql, [userId, score, note, emotions], (err, result) => {
        if (err) {
            console.error('❌ MySQL error (createMood):', err.message);
            return res.status(500).json({ error: 'Error saving to database', detail: err.message });
        }
        res.status(201).json({ 
            message: 'Entry successfully saved!', 
            id: result.insertId,
            emotions: emotions ? JSON.parse(emotions) : null
        });
    });
};

const getMoods = (req, res) => {
    const { userId } = req.params;
    const sql = 'SELECT * FROM moods WHERE user_id = ? ORDER BY date DESC';

    db.query(sql, [userId], (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Error reading data' });
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
            return res.status(500).json({ error: 'Error deleting' });
        }
        res.json({ message: 'Entry successfully deleted' });
    });
};

const saveEmotions = (req, res) => {
    const { id } = req.params;
    const { emotions } = req.body;

    const sql = 'UPDATE moods SET emotions = ? WHERE id = ?';
    db.query(sql, [JSON.stringify(emotions), id], (err) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Error saving emotions' });
        }
        res.json({ message: 'Emotions successfully saved!' });
    });
};

module.exports = {
    createMood,
    getMoods,
    deleteMood,
    saveEmotions
};

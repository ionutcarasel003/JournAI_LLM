const mysql = require('mysql2');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });
const password = process.env["SQL_PASSWORD"]

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: password,
    database: 'asistent_empatic'
});

db.connect((err) => {
    if (err) {
        console.error('❌ Eroare la conectarea la baza de date:', err);
        return;
    }
    console.log('✅ Conectat la MySQL!');

    db.query(
        `ALTER TABLE moods ADD emotions JSON NULL`,
        (alterErr) => {
            if (alterErr) {
                if (alterErr.code === 'ER_DUP_FIELDNAME') {
                    console.log('✅ Coloana emotions există deja.');
                } else {
                    console.error('⚠️ Migrare emotions:', alterErr.message);
                }
            } else {
                console.log('✅ Coloana emotions a fost adăugată cu succes.');
            }
        }
    );
});

module.exports = db;

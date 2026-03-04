const mysql = require('mysql2');

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'admin', 
    database: 'asistent_empatic'
});

db.connect((err) => {
    if (err) {
        console.error('❌ Eroare la conectarea la baza de date:', err);
        return;
    }
    console.log('✅ Conectat la MySQL!');
});

module.exports = db;
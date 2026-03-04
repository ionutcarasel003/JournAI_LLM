const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db'); 
const UserDTO = require('../dtos/userDto');

const SECRET_KEY = "cheia_mea_super_secreta_reflect";

const authService = {
    // Logica de Login
    login: async (email, password) => {
        return new Promise((resolve, reject) => {
            const sql = 'SELECT * FROM users WHERE email = ?';
            
            db.query(sql, [email], async (err, results) => {
                if (err) return reject({ status: 500, message: "Eroare baza de date" });
                if (results.length === 0) return reject({ status: 401, message: "Email sau parolă greșită" });

                const user = results[0];

                const isMatch = await bcrypt.compare(password, user.password);
                if (!isMatch) return reject({ status: 401, message: "Email sau parolă greșită" });

                const token = jwt.sign({ id: user.id, email: user.email }, SECRET_KEY, { expiresIn: '24h' });

                const safeUser = new UserDTO(user);

                resolve({ user: safeUser, token });
            });
        });
    }
};

module.exports = authService;
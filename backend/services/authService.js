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
                if (err) return reject({ status: 500, message: "Database error" });
                if (results.length === 0) return reject({ status: 401, message: "Invalid email or password" });

                const user = results[0];

                const isMatch = await bcrypt.compare(password, user.password);
                if (!isMatch) return reject({ status: 401, message: "Invalid email or password" });

                const token = jwt.sign({ id: user.id, email: user.email }, SECRET_KEY, { expiresIn: '24h' });

                const safeUser = new UserDTO(user);

                resolve({ user: safeUser, token });
            });
        });
    },

     register: async (email, password) => {
        return new Promise((resolve, reject) => {
            const checkSql = 'SELECT * FROM users WHERE email = ?';

            db.query(checkSql, [email], async (err, results) => {
                if (err) return reject({ status: 500, message: "Database error" });
                if (results.length > 0) {
                    return reject({ status: 409, message: "Email is already in use" });
                }

                try {
                    const hashedPassword = await bcrypt.hash(password, 10);
                    const insertSql = 'INSERT INTO users (email, password) VALUES (?, ?)';

                    db.query(insertSql, [email, hashedPassword], (err, result) => {
                        if (err) return reject({ status: 500, message: "Error creating account" });

                        resolve({
                            message: "Account successfully created",
                            userId: result.insertId
                        });
                    });
                } catch (error) {
                    reject({ status: 500, message: "Error hashing password" });
                }
            });
        });
    },
};

module.exports = authService;
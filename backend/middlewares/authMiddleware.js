const jwt = require('jsonwebtoken');
const SECRET_KEY = "cheia_mea_super_secreta_reflect";

const verifyToken = (req, res, next) => {
    const bearerHeader = req.headers['authorization'];
    
    if (!bearerHeader) {
        return res.status(403).json({ error: "Acces interzis. Nu ai token!" });
    }

    const token = bearerHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, SECRET_KEY);
        req.user = decoded; 
        next(); 
    } catch (err) {
        return res.status(401).json({ error: "Token invalid sau expirat!" });
    }
};

module.exports = verifyToken;
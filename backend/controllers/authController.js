const authService = require('../services/authService');

const authController = {
    login: async (req, res) => {
        try {
            const { email, password } = req.body;

            if (!email || !password) {
                return res.status(400).json({ error: "Email și parolă obligatorii!" });
            }

            const result = await authService.login(email, password);
            
            res.status(200).json(result);

        } catch (error) {
            const status = error.status || 500;
            res.status(status).json({ error: error.message });
        }
    }
};

module.exports = authController;
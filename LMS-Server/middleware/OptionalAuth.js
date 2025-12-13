const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key';

module.exports = (req, res, next) => {
    try {
        const token = req.cookies.token || req.headers.authorization?.split(' ')[1];

        if (token) {
            try {
                const decoded = jwt.verify(token, JWT_SECRET);
                req.user = { userId: decoded.userId };
            } catch (err) {
                // Token invalid - ignore and proceed as guest
                console.warn("Optional verification failed:", err.message);
            }
        }
        next();
    } catch (error) {
        next();
    }
};

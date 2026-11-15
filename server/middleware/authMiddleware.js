const jwt = require('jsonwebtoken');

const protect = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];
            // Decode token
            const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
            req.adminId = decoded.id;
            return next();
        } catch (error) {
            console.error(`Admin auth rejected: ${error.name}: ${error.message}`);
            return res.status(401).json({ message: 'Not authorized, token failed' });
        }
    }

    if (!token) {
        return res.status(401).json({ message: 'Not authorized, no token' });
    }
};

module.exports = { protect };

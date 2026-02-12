const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            return res.status(401).json({ error: 'Authentication failed: No token provided' });
        }

        const token = authHeader.split(' ')[1];
        if (!token) {
            return res.status(401).json({ error: 'Authentication failed: Invalid token format' });
        }

        const decodedToken = jwt.verify(token, process.env.JWT_SECRET || "my_super_secret_key");
        
        req.user = { 
            userId: decodedToken.userId || decodedToken.id || decodedToken._id,
            username: decodedToken.username || decodedToken.email 
        };
        
        next();
    } catch (error) {
        return res.status(401).json({ error: 'Authentication failed: Invalid token' });
    }
};
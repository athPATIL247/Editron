const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET;

const authenticate = (req, res, next) => {
    const token = req.cookies.token;
    if (!token) return res.status(401).json({ error: "Unauthorized" });

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded; // attach user info
        next();
    } catch (err) {
        return res.status(403).json({ error: "Invalid token" });
    }
};

module.exports = authenticate;
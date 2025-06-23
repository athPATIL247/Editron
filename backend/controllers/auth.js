const User = require('../models/user');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET;

const handleSignUp = async (req, res) => {
    const { username, email, password } = req.body;
    try {
        const existing = await User.findOne({ email });
        if (existing) return res.status(400).json({ status: "error", error: "Email already exists" });

        const hashed = await bcrypt.hash(password, 10);
        await User.create({ username, email, password: hashed });
        res.status(201).json({ status: "success", message: "User created successfully" });
    } catch (err) {
        res.status(500).json({ error: "Server error" });
    }
}

const handleLogin = async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ status: "error", error: "Invalid email" });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ status: "error", error: "Invalid password" });

        const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '1d' });

        res
            .cookie('token', token, {
                httpOnly: true,
                secure: true,
                sameSite: 'none',
            })
            .cookie('username', user.username, {
                httpOnly: false, // allow access from JS (React)
                secure: true,
                sameSite: 'none',
            })
            .json({ status: "success", message: "Login successful" });
    } catch (err) {
        res.status(500).json({ error: "Server error" });
    }
}

module.exports = { handleSignUp, handleLogin }
const User = require('../models/User');
const jwt = require('jsonwebtoken');

exports.registerUser = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        const user = await User.create({ name, email, password });
        res.status(201).json({ user, token: jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '30d' }) });
    } catch (error) {
        res.status(500).json({ error: 'Error creating user' });
    }
};

exports.loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });

        if (!user || !(await user.matchPassword(password))) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        res.json({ user, token: jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '30d' }) });
    } catch (error) {
        res.status(500).json({ error: 'Login failed' });
    }
};

exports.getUserProfile = async (req, res) => {
    const user = await User.findById(req.user.id);
    res.json(user);
};

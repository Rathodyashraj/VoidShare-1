const User = require('../models/User');
const jwt = require('jsonwebtoken');

import { generateToken } from '../utils/jwtHelper';

exports.registerUser = async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await User.create({ username, password });
        res.status(201).json({ user, token: generateToken(user._id) });
    } catch (error) {
        res.status(500).json({ error: 'Error creating user' });
    }
};

exports.loginUser = async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await User.findOne({ username });

        if (!user || !(await user.matchPassword(password))) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // res.json({ user, token: jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '30d' }) });
        res.json({ user, token: generateToken(user._id) });
    } catch (error) {
        res.status(500).json({ error: 'Login failed' });
    }
};

exports.getUserProfile = async (req, res) => {
    const user = await User.findById(req.user.id);
    res.json(user);
};

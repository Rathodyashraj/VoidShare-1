const User = require('../models/User');
const jwt = require('jsonwebtoken');

import { generateToken } from '../utils/jwtHelper';

exports.registerUser = async (req, res) => {
    try {
        const { username, password } = req.body;

        const check = await User.findOne({ username });
        if (check) {
            return res.status(400).json({ error: 'User already exists' });
        }

        const user = await User.create({ username, password });
        res.status(201).json({ token: generateToken(user._id) });

    } catch (error) {
        res.status(500).json({ error: 'Error creating user' });
    }
};

exports.loginUser = async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await User.findOne({ username });

        if (!user) {
            return res.status(401).json({ error: 'User not found' });
        }

        if (user.password !== password) {
            return res.status(401).json({ error: 'Wrong Password' });
        }

        res.status(200).json({ token: generateToken(user._id) });
    } catch (error) {
        res.status(500).json({ error: 'Login failed' });
    }
};

exports.getUserProfile = async (req, res) => {
    const user = await User.findById(req.user.id);
    res.json(user);
};

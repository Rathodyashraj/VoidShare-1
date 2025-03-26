const jwt = require('jsonwebtoken');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.resolve(__dirname, '../.env') });


const generateToken = (id) => {
    if (!process.env.JWT_SECRET) {
        throw new Error("JWT_SECRET is not defined in the environment variables.");
    }

    console.log("jwt secret:", process.env.JWT_SECRET);
    console.log("id:", id);

    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '45m' });

};

// Generates a JSON Web Token and sets it as a cookie
const generateTokenWithCookie = (userId, res) => {
    if (!process.env.JWT_SECRET) {
        throw new Error("JWT_SECRET is not defined in the environment variables.");
    }

    const token = jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: "7d" });

    res.cookie("jwt", token, {
        expires: new Date(Date.now() +  24 * 60 * 60 * 1000), // 1 days from now
        httpOnly: true, // Prevents client-side JavaScript from accessing the cookie
        sameSite: "strict", // Prevents CSRF attacks
        secure: process.env.NODE_ENV === "production", // Sends the cookie only over HTTPS in production
    });

    return token;
};

module.exports = { generateToken, generateTokenWithCookie };

const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');
const redisClient = require('./config/redis');
const { exec } = require('child_process'); // To execute shell commands

dotenv.config();
connectDB();

const app = express();
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/user', require('./routes/userRoutes'));
app.use('/api/peer', require('./routes/peerRoutes'));

const PORT = process.env.PORT || 7000;
const server = app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

// Function to stop Redis server
const stopRedis = () => {
    console.log('Stopping Redis server...');
    exec('redis-cli shutdown', (error, stdout, stderr) => {
        if (error) {
            console.error(`Error stopping Redis: ${stderr}`);
        } else {
            console.log('Redis server stopped.');
        }
    });
};

// Handle app termination signals
const gracefulShutdown = async () => {
    console.log('Shutting down server...');
    await redisClient.quit(); // Close Redis connection
    stopRedis(); // Stop Redis server
    server.close(() => {
        console.log('Server closed.');
        process.exit(0);
    });
};

process.on('SIGINT', gracefulShutdown);  // Handle Ctrl+C
process.on('SIGTERM', gracefulShutdown); // Handle termination signals

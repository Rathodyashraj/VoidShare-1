const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');

dotenv.config();
connectDB();

const app = express();
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/user', require('./routes/userRoutes'));
app.use('/api/peer', require('./routes/peerRoutes'));


const PORT = process.env.PORT || 7000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

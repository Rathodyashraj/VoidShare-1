// import { createClient } from 'redis';

const { createClient } = require('redis');

const client = createClient({
  url: 'redis://localhost:6379', // Connect to local Redis server
});

client.on('error', (err) => console.error('❌ Redis Error:', err));

const connectRedis = async () => {
  try {
    await client.connect();
    console.log('✅ Connected to Redis');
  } catch (err) {
    console.error('❌ Redis Connection Failed:', err);
  }
};

// Connect Redis when the server starts
connectRedis();

// export default client;
module.exports = client;

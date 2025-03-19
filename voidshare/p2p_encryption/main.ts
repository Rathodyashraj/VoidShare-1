import { Peer } from './p2p/peer';

const sender = new Peer(5001);
const receiver = new Peer(5000);

// Simulate saving public keys
import * as fs from 'fs';
fs.writeFileSync('sender_pub.pem', sender.publicKey);
fs.writeFileSync('receiver_pub.pem', receiver.publicKey);

// Start receiver
receiver.receiveFile('received.txt');

// Simulate file send
setTimeout(() => {
  sender.sendFile('file_to_send.txt', 'localhost', 5000);
}, 2000);

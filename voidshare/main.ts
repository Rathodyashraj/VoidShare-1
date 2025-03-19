import { PeerHandler } from './webRTC/peer';
import * as fs from 'fs';

const sender = new PeerHandler(5001);
const receiver = new PeerHandler(5000);

fs.writeFileSync('sender_pub.pem', sender.publicKey);
fs.writeFileSync('receiver_pub.pem', receiver.publicKey);

// Start receiver
receiver.receiveFile('received.txt');

// Simulate file send
setTimeout(() => {
  const fileToSend = new File([fs.readFileSync('file_to_send.txt')], 'file_to_send.txt');
  sender.sendFile(fileToSend, 'localhost', (progress) => {
    console.log(`Progress: ${progress}%`);
  });
}, 2000);
import * as fs from 'fs';
import * as net from 'net';
import * as crypto from 'crypto';
import { AES256 } from '../lib/aes';
import { RSAKeyExchange } from '../lib/rsa';
import { DigitalSignature } from '../lib/signature';

export class PeerHandler {
  private rsa: RSAKeyExchange;
  public publicKey: string;
  public privateKey: string;
  private connection: any; // Placeholder for the connection object

  constructor(private port: number = 5000, private host: string = 'localhost') {
    this.rsa = new RSAKeyExchange();
    const keys = this.rsa.exportKeys();
    this.publicKey = keys.publicKey;
    this.privateKey = keys.privateKey;
  }

  async sendFile(file: File, receiverPublicKey: string, onProgress: (progress: number) => void): Promise<void> {
    try {
      const sessionKey = crypto.randomBytes(32);
      const aes = new AES256(sessionKey);

      const encryptedData = await aes.encryptFile(file); // Async encryption

      const encryptedSessionKey = this.rsa.encryptSessionKey(sessionKey, receiverPublicKey);

      // Convert encrypted data to a Buffer and then to a Base64 string
      const encryptedDataBuffer = Buffer.from(encryptedData);
      const encryptedDataBase64 = encryptedDataBuffer.toString('base64');

      const signature = DigitalSignature.signFile(encryptedDataBase64, this.privateKey);
      const signatureBase64 = signature.toString('base64');

      const client = new net.Socket();
      client.connect(this.port, this.host, () => {
        console.log('Connected to receiver, sending file...');

        client.write(Buffer.concat([
          encryptedSessionKey,
          Buffer.from('||'),
          Buffer.from(signatureBase64, 'utf-8'),
          Buffer.from('||'),
          encryptedData
        ]));

        client.end();
      });

      client.on('data', (data) => {
        const progress = parseFloat(data.toString());
        onProgress(progress);
      });

    } catch (error) {
      console.error('Error sending file:', error);
    }
  }

  async receiveFile(savePath: string): Promise<void> {
    const server = net.createServer((socket) => {
      console.log('Waiting for incoming file...');

      const chunks: Buffer[] = [];

      socket.on('data', (data) => chunks.push(data));

      socket.on('end', async () => {
        try {
          const receivedData = Buffer.concat(chunks);
          const parts = receivedData.toString().split('||');

          if (parts.length < 3) {
            console.error('Invalid file format received!');
            return;
          }

          const encryptedSessionKey = Buffer.from(parts[0], 'binary');
          const signatureBase64 = parts[1];
          const encryptedData = Buffer.from(parts[2], 'binary');

          const sessionKey = this.rsa.decryptSessionKey(encryptedSessionKey);
          const senderPublicKey = fs.readFileSync('sender_pub.pem', 'utf-8');
          const signature = Buffer.from(signatureBase64, 'base64');

          // Convert encryptedData to Base64 string before verification
          const encryptedDataBase64 = encryptedData.toString('base64');

          const isValid = DigitalSignature.verifySignature(encryptedDataBase64, signature, senderPublicKey);
          if (!isValid) {
            console.error('Signature verification failed! Possible tampering detected.');
            return;
          }

          const aes = new AES256(sessionKey);
          const decryptedData = await aes.decryptFile(encryptedData);

          fs.writeFileSync(savePath, decryptedData);
          console.log('File received, verified, and decrypted successfully!');

        } catch (error) {
          console.error('Error receiving file:', error);
        }
      });
    });

    server.listen(this.port, this.host, () => {
      console.log(`Listening for incoming connections on ${this.host}:${this.port}...`);
    });
  }

  initiateConnection(isInitiator: boolean, config: any, signalCallback: (data: any) => void) {
    this.connection = {}; // Replace with actual connection logic
    signalCallback({}); // Replace with actual signaling data
  }

  signal(data: any) {
    if (this.connection) {
      this.connection.signal(data);
    } else {
      console.error('Connection not initialized.');
    }
  }

  on(event: string, callback: (data: any) => void) {
    if (this.connection) {
      this.connection.on(event, callback);
    } else {
      console.error('Connection not initialized.');
    }
  }

  onData(callback: (data: any) => void) {
    if (this.connection) {
      this.connection.on('data', callback);
    } else {
      console.error('Connection not initialized.');
    }
  }

  destroy() {
    if (this.connection) {
      this.connection.destroy();
      this.connection = null;
    } else {
      console.error('Connection not initialized.');
    }
  }
}

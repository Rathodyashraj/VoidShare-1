import * as fs from 'fs';
import * as net from 'net';
import { AES256 } from '../encryption/aes';
import { RSAKeyExchange } from '../encryption/rsa';
import { DigitalSignature } from '../encryption/signature';

export class Peer {
  private rsa: RSAKeyExchange;
  public publicKey: string;
  public privateKey: string;

  constructor(private port: number = 5000, private host: string = 'localhost') {
    this.rsa = new RSAKeyExchange();
    const keys = this.rsa.exportKeys();
    this.publicKey = keys.publicKey;
    this.privateKey = keys.privateKey;
  }

  sendFile(filePath: string, receiverHost: string, receiverPort: number): void {
    const sessionKey = crypto.randomBytes(32);
    const aes = new AES256(sessionKey);
    const encryptedFile = filePath + '.enc';

    aes.encrypt(filePath, encryptedFile);

    const receiverPublicKey = fs.readFileSync('receiver_pub.pem', 'utf-8');
    const encryptedSessionKey = this.rsa.encryptSessionKey(sessionKey, receiverPublicKey);
    const signature = DigitalSignature.signFile(encryptedFile, this.privateKey);

    const fileBuffer = fs.readFileSync(encryptedFile);

    const client = new net.Socket();
    client.connect(receiverPort, receiverHost, () => {
      const delimiter = Buffer.from('||');
      client.write(Buffer.concat([encryptedSessionKey, delimiter, signature, delimiter, fileBuffer]));
      client.end();
    });
  }

  receiveFile(savePath: string): void {
    const server = net.createServer((socket) => {
      const chunks: Buffer[] = [];

      socket.on('data', (data) => chunks.push(data));

      socket.on('end', () => {
        const receivedData = Buffer.concat(chunks);
        const parts = receivedData.toString().split('||');

        const encryptedSessionKey = Buffer.from(parts[0], 'binary');
        const signature = Buffer.from(parts[1], 'binary');
        const fileContent = Buffer.from(parts[2], 'binary');

        const encryptedFilePath = savePath + '.enc';
        fs.writeFileSync(encryptedFilePath, fileContent);

        const sessionKey = this.rsa.decryptSessionKey(encryptedSessionKey);

        const senderPublicKey = fs.readFileSync('sender_pub.pem', 'utf-8');
        const isValid = DigitalSignature.verifySignature(encryptedFilePath, signature, senderPublicKey);

        if (!isValid) {
          console.error('Signature verification failed!');
          return;
        }

        const aes = new AES256(sessionKey);
        aes.decrypt(encryptedFilePath, savePath);
        console.log('File received and decrypted successfully!');
      });
    });

    server.listen(this.port, this.host);
  }
}

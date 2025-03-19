import * as crypto from 'crypto';
import * as fs from 'fs';

export class AES256 {
  private key: Buffer;

  constructor(key: Buffer) {
    this.key = key;
  }

  encrypt(inputPath: string, outputPath: string): void {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv('aes-256-cbc', this.key, iv);
    const inputData = fs.readFileSync(inputPath);
    const encrypted = Buffer.concat([cipher.update(inputData), cipher.final()]);
    fs.writeFileSync(outputPath, Buffer.concat([iv, encrypted]));
  }

  decrypt(inputPath: string, outputPath: string): void {
    const fileData = fs.readFileSync(inputPath);
    const iv = fileData.slice(0, 16);
    const encrypted = fileData.slice(16);
    const decipher = crypto.createDecipheriv('aes-256-cbc', this.key, iv);
    const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]);
    fs.writeFileSync(outputPath, decrypted);
  }
}


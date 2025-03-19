import * as fs from 'fs';
import * as crypto from 'crypto';

export class DigitalSignature {
  static signFile(filePath: string, privateKey: string): Buffer {
    const data = fs.readFileSync(filePath);
    const signer = crypto.createSign('SHA256');
    signer.update(data);
    signer.end();
    return signer.sign(privateKey);
  }

  static verifySignature(filePath: string, signature: Buffer, publicKey: string): boolean {
    const data = fs.readFileSync(filePath);
    const verifier = crypto.createVerify('SHA256');
    verifier.update(data);
    verifier.end();
    return verifier.verify(publicKey, signature);
  }
}

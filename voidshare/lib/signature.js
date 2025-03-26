const fs = require('fs');
const crypto = require('crypto');

class DigitalSignature {
  static signFile(filePath, privateKey) {
    const data = fs.readFileSync(filePath);
    const signer = crypto.createSign('SHA256');
    signer.update(data);
    signer.end();
    return signer.sign(privateKey);
  }

  static verifySignature(filePath, signature, publicKey) {
    const data = fs.readFileSync(filePath);
    const verifier = crypto.createVerify('SHA256');
    verifier.update(data);
    verifier.end();
    return verifier.verify(publicKey, signature);
  }
}

module.exports = DigitalSignature;

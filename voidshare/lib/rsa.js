const crypto = require('crypto');

class RSAKeyExchange {
  constructor() {
    this.keyPair = crypto.generateKeyPairSync('rsa', {
      modulusLength: 2048,
    });
  }

  exportKeys() {
    return {
      publicKey: this.keyPair.publicKey.export({ type: 'pkcs1', format: 'pem' }).toString(),
      privateKey: this.keyPair.privateKey.export({ type: 'pkcs1', format: 'pem' }).toString(),
    };
  }

  encryptSessionKey(sessionKey, peerPublicKey) {
    return crypto.publicEncrypt(peerPublicKey, sessionKey);
  }

  decryptSessionKey(encryptedKey) {
    return crypto.privateDecrypt(this.keyPair.privateKey, encryptedKey);
  }
}

module.exports = RSAKeyExchange;

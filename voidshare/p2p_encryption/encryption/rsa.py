from Crypto.PublicKey import RSA
from Crypto.Cipher import PKCS1_OAEP

class RSAKeyExchange:
    def __init__(self):
        self.key = RSA.generate(2048)  # Generate 2048-bit RSA key pair
        self.public_key = self.key.publickey()

    def export_keys(self):
        """Export public and private keys"""
        return self.public_key.export_key(), self.key.export_key()

    def encrypt_session_key(self, session_key: bytes, peer_public_key: bytes):
        peer_key = RSA.import_key(peer_public_key)
        cipher_rsa = PKCS1_OAEP.new(peer_key)
        return cipher_rsa.encrypt(session_key)

    def decrypt_session_key(self, encrypted_key: bytes):
        cipher_rsa = PKCS1_OAEP.new(self.key)
        return cipher_rsa.decrypt(encrypted_key)

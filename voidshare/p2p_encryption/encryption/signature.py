from Crypto.Signature import pkcs1_15
from Crypto.Hash import SHA256
from Crypto.PublicKey import RSA

class DigitalSignature:
    @staticmethod
    def sign_file(file_path: str, private_key: bytes):
        with open(file_path, 'rb') as f:
            file_data = f.read()
        
        key = RSA.import_key(private_key)
        h = SHA256.new(file_data)
        signature = pkcs1_15.new(key).sign(h)

        return signature

    @staticmethod
    def verify_signature(file_path: str, signature: bytes, public_key: bytes):
        with open(file_path, 'rb') as f:
            file_data = f.read()

        key = RSA.import_key(public_key)
        h = SHA256.new(file_data)

        try:
            pkcs1_15.new(key).verify(h, signature)
            return True
        except (ValueError, TypeError):
            return False

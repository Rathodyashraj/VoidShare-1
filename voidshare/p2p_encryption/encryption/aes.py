from Crypto.Cipher import AES
from Crypto.Util.Padding import pad, unpad
import os

class AES256:
    def __init__(self, key: bytes):
        self.key = key  # AES-256 key must be 32 bytes

    def encrypt(self, file_path: str, output_path: str):
        iv = os.urandom(16)  # Generate IV for CBC mode
        cipher = AES.new(self.key, AES.MODE_CBC, iv)
        
        with open(file_path, 'rb') as f:
            plaintext = f.read()
        
        ciphertext = cipher.encrypt(pad(plaintext, AES.block_size))

        with open(output_path, 'wb') as f:
            f.write(iv + ciphertext)  # Store IV in the file

    def decrypt(self, file_path: str, output_path: str):
        with open(file_path, 'rb') as f:
            iv = f.read(16)  # Read IV
            ciphertext = f.read()
        
        cipher = AES.new(self.key, AES.MODE_CBC, iv)
        plaintext = unpad(cipher.decrypt(ciphertext), AES.block_size)

        with open(output_path, 'wb') as f:
            f.write(plaintext)

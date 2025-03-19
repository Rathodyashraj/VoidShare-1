import socket
import os
from encryption.aes import AES256
from encryption.rsa import RSAKeyExchange
from encryption.signature import DigitalSignature

class Peer:
    def __init__(self, host='localhost', port=5000):
        self.host = host
        self.port = port
        self.rsa = RSAKeyExchange()
        self.public_key, self.private_key = self.rsa.export_keys()

    def send_file(self, file_path, receiver_host, receiver_port):
        # Generate AES session key
        session_key = os.urandom(32)

        # Encrypt the file using AES
        encrypted_file = file_path + ".enc"
        aes = AES256(session_key)
        aes.encrypt(file_path, encrypted_file)

        # Encrypt AES session key using RSA
        with open("receiver_pub.pem", "rb") as f:
            receiver_public_key = f.read()
        encrypted_session_key = self.rsa.encrypt_session_key(session_key, receiver_public_key)

        # Sign the encrypted file
        signature = DigitalSignature.sign_file(encrypted_file, self.private_key)

        # Send file
        with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
            s.connect((receiver_host, receiver_port))
            s.sendall(encrypted_session_key + b"||" + signature)

            with open(encrypted_file, "rb") as f:
                s.sendall(f.read())

    def receive_file(self, save_path):
        with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
            s.bind((self.host, self.port))
            s.listen(1)
            conn, _ = s.accept()
            with conn:
                data = conn.recv(2048)
                encrypted_session_key, signature = data.split(b"||", 1)

                received_file_path = save_path + ".enc"
                with open(received_file_path, "wb") as f:
                    f.write(conn.recv(1024 * 1024))  # Receive encrypted file

                # Decrypt session key
                session_key = self.rsa.decrypt_session_key(encrypted_session_key)

                # Verify signature
                with open("sender_pub.pem", "rb") as f:
                    sender_public_key = f.read()
                if not DigitalSignature.verify_signature(received_file_path, signature, sender_public_key):
                    print("Signature verification failed!")
                    return

                # Decrypt the file
                aes = AES256(session_key)
                aes.decrypt(received_file_path, save_path)
                print("File received and decrypted successfully!")

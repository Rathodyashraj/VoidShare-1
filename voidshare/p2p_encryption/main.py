from p2p.peer import Peer
import threading

def start_receiver():
    receiver = Peer()
    receiver.receive_file("received.txt")

def start_sender():
    sender = Peer()
    sender.send_file("file_to_send.txt", "localhost", 5000)

# Simulating P2P transfer
receiver_thread = threading.Thread(target=start_receiver)
receiver_thread.start()

sender_thread = threading.Thread(target=start_sender)
sender_thread.start()

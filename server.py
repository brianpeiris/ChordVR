import socketserver
import threading
import time
import sys

class ButtonState():
    left_val = 0
    right_val = 0
    val = 0

DEBUG = False
def debug(*args):
    if not DEBUG:
        return
    print(*args)

class MyTCPHandler(socketserver.BaseRequestHandler):
    def handle(self):
        print("{} connected".format(self.client_address[0]))
        data = self.request.recv(1).strip()
        last_data = data
        hand = data
        while(True):
            if last_data != data:
                debug('data', hand, data)
                if hand == b'L':
                    ButtonState.left_val = ord(data)
                else:
                    ButtonState.right_val = ord(data) << 3
                ButtonState.val = ButtonState.left_val + ButtonState.right_val
                debug('val', ButtonState.val)
                last_data = data
            data = self.request.recv(1).strip()

class ThreadedTCPServer(socketserver.ThreadingMixIn, socketserver.TCPServer):
    pass

button_state_to_key_index = [
    None, 1, 2, 15, 3, None, 19, 28, 4, None, None, 16, None, None, 20, None, 5, None, None, 17, None, None, 21, 
    None, 7, 8, 9, None, 10, None, None, None, 6, None, None, 18, None, None, 22, None, 23, 24, 25, None, 26, None, 
    None, None, 11, 12, 13, None, 14, None, None, None, 27
]

keys = [
    None, 'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 
    'v', 'w', 'x', 'y', 'z', ' ', '\b \b'
]

if __name__ == "__main__":
    HOST, PORT = "0.0.0.0", 9090
    server = ThreadedTCPServer((HOST, PORT), MyTCPHandler)
    server_thread = threading.Thread(target=server.serve_forever)
    server_thread.start()

    last_time = 0
    last_val = 0
    last_key = None
    while(True):
        val = ButtonState.val
        now = time.clock() * 1000
        
        if now - last_time <= 10:
            continue
        last_time = now

        if val == 0:
            if last_key is not None:
                print(last_key, end='')
                sys.stdout.flush()
                last_key = None
                last_val = 0
            continue

        if val <= last_val:
            continue

        if val in button_state_to_key_index and button_state_to_key_index[val] in keys:
            key = keys[button_state_to_key_index[val]]
        else:
            key = None

        debug('key', key);

        last_val = val
        last_key = key

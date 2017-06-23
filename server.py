import socketserver
import threading
import time
import sys
from pywinauto.keyboard import SendKeys

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
    0, 1, 2, 15, 3, 27, 19, 46, 4, 42, 36, 16, 33, 28, 20, 47, 5, 35, 59, 17, 32, 29, 21, 48, 7, 8, 9, 44, 10, 41, 38,
    56, 6, 34, 31, 18, 43, 30, 22, 49, 23, 24, 25, 58, 26, 60, 40, 62, 11, 12, 13, 37, 14, 39, 45, 63, 50, 51, 52, 54,
    53, 55, 57, 61
]
normal_keys = [
    "NULL", "a", "b", "c", "d","e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t", "u", 
    "v", "w", "x", "y", "z", "th", "that ", "the ", "of ", 
    ".", ",", "!", "?", "-", "\'", "\\", "/", "and ", "§", "to ", 
    "{UP}", "{DOWN}", "{PGUP}", "{PGDN}", "{BACKSPACE}", "{LEFT}", "^{LEFT}", "{HOME}", "{SPACE}", "{RIGHT}", "^{RIGHT}", "{END}", 
    "{ENTER}", "{TAB}", "{ESC}", "{DEL}", "{INS}", "_SHIFT_", "_SYMBOL_", None, "{VK_CONTROL}", "{VK_MENU}" 
]
shift_keys = [
    "NULL", "A", "B", "C", "D","E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", 
    "V", "W", "X", "Y", "Z", "Th", "That ", "The ", "Of ", 
    ":", ";", "|", "{~}", "_", "\"", "`", "/", "And ", "§", "To ",
    "{UP}", "{DOWN}", "{PGUP}", "{PGDN}", "{BACKSPACE}", "{LEFT}", "^{LEFT}", "{HOME}", "{SPACE}", "{RIGHT}", "^{RIGHT}", "{END}", 
    "{ENTER}", "{TAB}", "{ESC}", "{DEL}", "{INS}", "_NORMAL_", "_SYMBOL_", None, "{VK_CONTROL}", "{VK_MENU}" 
]
symbol_keys = [
    "NULL", "1", "2", "3", "4","5", "6", "0", "7", "8", "9", "#", "@", "½", "&", "{+}", "{%}", "=", "{^}", "*", "$", "€", 
    "£", "{(}", "[", "<", "{{}", "{)}", "]", ">", "{}}", 
    ":", ";", "|", "{~}", "_", "\"", "`", "´", "μ", "§", "", 
    "{UP}", "{DOWN}", "{PGUP}", "{PGDN}", "{BACKSPACE}", "{LEFT}", "^{LEFT}", "{HOME}", "{SPACE}", "{RIGHT}", "^{RIGHT}", "{END}", 
    "{ENTER}", "{TAB}", "{ESC}", "{DEL}", "{INS}", "_SHIFT_", "_NORMAL_", None, "{VK_CONTROL}", "{VK_MENU}" 
]

if __name__ == "__main__":
    HOST, PORT = "0.0.0.0", 9090
    server = ThreadedTCPServer((HOST, PORT), MyTCPHandler)
    server_thread = threading.Thread(target=server.serve_forever)
    server_thread.start()

    last_time = 0
    last_val = 0
    last_key = None
    mode = '_NORMAL_'
    while(True):
        val = ButtonState.val
        now = time.clock() * 1000
        
        if now - last_time <= 10:
            continue
        last_time = now

        if val == 0:
            if last_key is not None:
                if len(last_key) > 1 and last_key[0] == '_':
                    mode = last_key
                    print(mode, end='')
                else:
                    print(last_key, end='')
                    SendKeys(last_key)
                    sys.stdout.flush()
            last_key = None
            last_val = 0
            continue

        if val <= last_val:
            continue

        try:
            if mode == '_NORMAL_':
                key = normal_keys[button_state_to_key_index[val]]
            elif mode == '_SHIFT_':
                key = shift_keys[button_state_to_key_index[val]]
            else:
                key = symbol_keys[button_state_to_key_index[val]]
        except (IndexError, TypeError):
            key = None

        debug('key', key);

        last_val = val
        last_key = key

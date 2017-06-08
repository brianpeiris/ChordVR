import socketserver
import threading

class MyTCPHandler(socketserver.BaseRequestHandler):
    def handle(self):
        print("{} connected".format(self.client_address[0]))
        data = self.request.recv(1).strip()
        lastData = 0
        hand = data
        while(True):
            if lastData != data:
                print(hand, data)
                lastData = data
            data = self.request.recv(1).strip()

class ThreadedTCPServer(socketserver.ThreadingMixIn, socketserver.TCPServer):
    pass

if __name__ == "__main__":
    HOST, PORT = "0.0.0.0", 9090
    server = ThreadedTCPServer((HOST, PORT), MyTCPHandler)
    server_thread = threading.Thread(target=server.serve_forever)
    server_thread.start()

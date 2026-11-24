# ========================================================
# NITRO TYPER 3D - PYTHON BACKEND & RANDOM TEXT SERVER
# Serves static game files + dynamic Python random text API
# ========================================================

import http.server
import socketserver
import json
import random
import os
import urllib.parse
from generate_texts import generate_random_text, generate_random_words

PORT = 8000
DIRECTORY = os.path.dirname(os.path.abspath(__file__))

class ArcadeHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)

    def do_GET(self):
        parsed = urllib.parse.urlparse(self.path)
        
        # API Endpoint: /api/random-text or /api/text (Car Game)
        if parsed.path in ["/api/random-text", "/api/text"]:
            query_params = urllib.parse.parse_qs(parsed.query)
            level = int(query_params.get("level", [1])[0])
            
            # Use Python's random variable to generate fresh text
            random_sentence = generate_random_text(level)
            
            response_data = {
                "success": True,
                "text": random_sentence,
                "level": level,
                "charCount": len(random_sentence),
                "wordCount": len(random_sentence.split()),
                "source": "python_random_engine"
            }
            
            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.send_header("Access-Control-Allow-Origin", "*")
            self.end_headers()
            self.wfile.write(json.dumps(response_data).encode("utf-8"))
            return

        # API Endpoint: /api/random-words (Bubble / Cyber Word Combat Game)
        if parsed.path in ["/api/random-words", "/api/words"]:
            query_params = urllib.parse.parse_qs(parsed.query)
            count = int(query_params.get("count", [12])[0])
            category = query_params.get("category", ["medium"])[0]
            
            words = generate_random_words(count, category)
            response_data = {
                "success": True,
                "words": words,
                "count": len(words),
                "category": category,
                "source": "python_random_engine"
            }
            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.send_header("Access-Control-Allow-Origin", "*")
            self.end_headers()
            self.wfile.write(json.dumps(response_data).encode("utf-8"))
            return

        # Fallback to standard static file server
        return super().do_GET()

def start_server(port=PORT):
    # Allow address reuse
    socketserver.TCPServer.allow_reuse_address = True
    with socketserver.TCPServer(("", port), ArcadeHTTPRequestHandler) as httpd:
        print(f"==================================================", flush=True)
        print(f"  TYPING ARCADE PYTHON SERVER STARTED", flush=True)
        print(f"  URL: http://localhost:{port}", flush=True)
        print(f"  API: http://localhost:{port}/api/random-text", flush=True)
        print(f"==================================================", flush=True)
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\nShutting down server...")

if __name__ == "__main__":
    start_server(PORT)

from flask import Flask, jsonify
import sys

app = Flask(__name__)

@app.route("/", methods=["GET"])
def home():
    print("=== HOME ROUTE CALLED ===", flush=True)
    sys.stdout.flush()
    return jsonify({"message": "Server is working", "status": "OK"})

@app.route("/test", methods=["GET"])
def test():
    print("=== TEST ROUTE CALLED ===", flush=True)
    sys.stdout.flush()
    return jsonify({"message": "Test successful"})

if __name__ == "__main__":
    print("=== MINIMAL SERVER STARTING ===", flush=True)
    print("URL: http://127.0.0.1:4000", flush=True)
    sys.stdout.flush()
    app.run(port=4000, debug=False, host='127.0.0.1', use_reloader=False)
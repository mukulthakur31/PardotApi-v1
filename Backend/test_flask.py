from flask import Flask, jsonify

app = Flask(__name__)

@app.route("/", methods=["GET"])
def root():
    print("ROOT ROUTE HIT!")
    return "Test Flask server is working!"

@app.route("/test", methods=["GET"])
def test():
    print("TEST ROUTE HIT!")
    return jsonify({"message": "Test successful"})

if __name__ == "__main__":
    print("=== STARTING TEST FLASK SERVER ===")
    print("Server starting on http://127.0.0.1:4001")
    
    # Print all registered routes
    print("\n=== REGISTERED ROUTES ===")
    for rule in app.url_map.iter_rules():
        print(f"{rule.endpoint}: {rule.rule} [{', '.join(rule.methods)}]")
    print("=== END ROUTES ===")
    
    print("=== TEST SERVER READY ===")
    app.run(port=4001, debug=True, use_reloader=False, host='127.0.0.1')
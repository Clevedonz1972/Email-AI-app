from flask import Flask, jsonify, request
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

# Mock data store (replace with database later)
MOCK_SETTINGS = {
    "default": {
        "theme": "light",
        "sortBy": "date",
        "priorityFilters": ["HIGH", "MEDIUM", "LOW"]
    }
}

@app.route("/api/settings", methods=["GET"])
def get_settings():
    user_id = request.args.get("user_id", "default")
    return jsonify(MOCK_SETTINGS.get(user_id, MOCK_SETTINGS["default"]))

@app.route("/api/settings", methods=["POST"])
def update_settings():
    user_id = request.args.get("user_id", "default")
    settings = request.json
    MOCK_SETTINGS[user_id] = settings
    return jsonify({"status": "success", "data": settings})

if __name__ == "__main__":
    app.run(debug=True, port=5000)

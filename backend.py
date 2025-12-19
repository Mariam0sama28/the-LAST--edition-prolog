from flask import Flask
from flask_cors import CORS
from frontend import bp as frontend_bp

app = Flask(__name__)
CORS(app)

app.register_blueprint(frontend_bp)

if __name__ == "__main__":
    app.run(port=5000, debug=True, threaded=False, processes=1)
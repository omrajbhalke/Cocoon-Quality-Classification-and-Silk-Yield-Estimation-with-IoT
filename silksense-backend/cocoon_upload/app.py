import os
import socket
import qrcode
from datetime import datetime
from flask import Flask, request, jsonify, render_template, send_from_directory
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

UPLOAD_FOLDER = "uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs("static", exist_ok=True)

# ─── helpers ────────────────────────────────────────────────
def get_local_ip():
    s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    try:
        s.connect(("8.8.8.8", 80))
        return s.getsockname()[0]
    finally:
        s.close()

def generate_qr(url: str):
    qr = qrcode.QRCode(
        version=1,
        error_correction=qrcode.constants.ERROR_CORRECT_H,
        box_size=10,
        border=4,
    )
    qr.add_data(url)
    qr.make(fit=True)
    img = qr.make_image(fill_color="black", back_color="white")
    path = os.path.join("static", "qr.png")
    img.save(path)
    return path

# ─── routes ─────────────────────────────────────────────────
@app.route("/")
def index():
    """PC dashboard — shows QR code and live upload log."""
    ip   = get_local_ip()
    url  = f"http://{ip}:5001/upload"
    generate_qr(url)
    images = sorted(os.listdir(UPLOAD_FOLDER), reverse=True)[:20]
    return render_template("index.html", qr_url=url, images=images)

@app.route("/upload", methods=["GET"])
def upload_page():
    """Mobile-friendly upload page."""
    return render_template("upload.html")

@app.route("/upload", methods=["POST"])
def receive_image():
    """Receive image from mobile and save it."""
    if "image" not in request.files:
        return jsonify({"status": "error", "message": "No image sent"}), 400

    file = request.files["image"]
    if file.filename == "":
        return jsonify({"status": "error", "message": "Empty filename"}), 400

    ext       = os.path.splitext(file.filename)[1] or ".jpg"
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    filename  = f"cocoon_{timestamp}{ext}"
    save_path = os.path.join(UPLOAD_FOLDER, filename)
    file.save(save_path)

    print(f"[+] Saved: {filename}")
    return jsonify({"status": "success", "filename": filename})

@app.route("/uploads/<path:filename>")
def serve_upload(filename):
    return send_from_directory(UPLOAD_FOLDER, filename)

@app.route("/images")
def list_images():
    """API used by dashboard to refresh the image list."""
    images = sorted(os.listdir(UPLOAD_FOLDER), reverse=True)[:20]
    return jsonify(images)

# ─── entry point ────────────────────────────────────────────
if __name__ == "__main__":
    ip  = get_local_ip()
    url = f"http://{ip}:5001/upload"
    generate_qr(url)
    print(f"\n{'='*50}")
    print(f"  Cocoon Image Upload System")
    print(f"{'='*50}")
    print(f"  Dashboard : http://{ip}:5001")
    print(f"  Mobile URL: {url}")
    print(f"  Scan the QR code at the dashboard!")
    print(f"{'='*50}\n")
    app.run(host="0.0.0.0", port=5001, debug=True)

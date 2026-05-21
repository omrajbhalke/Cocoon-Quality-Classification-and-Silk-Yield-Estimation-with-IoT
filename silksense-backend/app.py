# SilkSense AI v3.0 — IoT + AI Backend
# New: /sensor route, live moisture compensation, temp+humidity correction

# python -m http.server 3000

from flask import Flask, request, send_file, jsonify
from flask_cors import CORS
from ultralytics import YOLO
from torchvision import transforms
from PIL import Image
import torch, os, uuid, cv2
import timm
import numpy as np
import traceback
import joblib
from datetime import datetime

UPLOAD_FOLDER = 'uploads'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

app = Flask(__name__)
CORS(app)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

# ── Live sensor store (updated by ESP32 every 5s) ─────────────────────
latest_sensor_data = {
    "temperature": 25.0,
    "humidity":    70.0,
    "moisture":    12.0,
    "timestamp":   None
}

# ── Load Models ───────────────────────────────────────────────────────
print("=" * 55)
print("SilkSense AI v3.0 — Loading Models")
print("=" * 55)

try:
    yolo = YOLO('models/best_seg.pt')
    print("✓ YOLO loaded")
except Exception as e:
    print("✗ YOLO:", e); yolo = None

device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
print(f"  Device: {device}")

try:
    clf = timm.create_model('efficientnet_b0', pretrained=False, num_classes=2)
    clf.load_state_dict(torch.load('models/best_classifier.pth', map_location=device))
    clf.to(device).eval()
    print("✓ EfficientNet loaded")
except Exception as e:
    print("✗ EfficientNet:", e); clf = None

try:
    poly_transform = joblib.load('models/poly_transform.pkl')
    print("✓ Poly transform loaded")
except Exception as e:
    print("✗ Poly transform:", e); poly_transform = None

try:
    renditta_model = joblib.load('models/best_model.pkl')
    print("✓ Renditta model loaded")
except Exception as e:
    print("✗ Renditta model:", e); renditta_model = None

preprocess = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225])
])
print("=" * 55)


# ── Correction Factors (from research) ────────────────────────────────
def humidity_factor(rh):
    if rh < 50:   return 0.98
    elif rh <= 70: return 1.00
    elif rh <= 80: return 1.02
    elif rh <= 90: return 1.05
    else:          return 1.08

def temperature_factor(temp):
    if temp < 20:   return 1.03
    elif temp <= 28: return 1.00
    elif temp <= 35: return 0.98
    else:            return 0.95

def moisture_status(m):
    if m < 8:    return "Dry"
    elif m < 15: return "Normal"
    elif m < 20: return "Moist"
    elif m < 25: return "Wet"
    else:        return "Excess Moisture"


# ── Image Processing (unchanged) ──────────────────────────────────────
def process_image(image):
    if yolo is None: raise Exception("YOLO model not loaded")
    if clf  is None: raise Exception("Classifier model not loaded")

    orig = np.array(image)
    bgr  = cv2.cvtColor(orig, cv2.COLOR_RGB2BGR)
    results = yolo(bgr)[0]
    boxes   = results.boxes.xyxy.cpu().int().tolist() if results.boxes else []

    total = len(boxes)
    qualified = 0

    for i, (x1, y1, x2, y2) in enumerate(boxes):
        crop = bgr[y1:y2, x1:x2]
        if crop.size == 0: continue
        try:
            crop_pil = Image.fromarray(cv2.cvtColor(crop, cv2.COLOR_BGR2RGB))
            inp      = preprocess(crop_pil).unsqueeze(0).to(device)
            with torch.no_grad():
                logits = clf(inp)
            prob  = torch.softmax(logits, dim=1)[0, 1].item()
            label = 1 if prob > 0.5 else 0
            qualified += label
            color = (0, 255, 0) if label == 1 else (0, 0, 255)
            cv2.rectangle(orig, (x1, y1), (x2, y2), color, 4)
            cv2.putText(orig, f"{'OK' if label==1 else 'Defect'} {prob:.2f}",
                        (x1, y1-5), cv2.FONT_HERSHEY_SIMPLEX, 0.7, color, 2)
        except Exception as e:
            print(f"  Crop {i+1} error: {e}")

    defect        = total - qualified
    qualified_pct = (qualified / total * 100) if total > 0 else 0.0
    defect_pct    = (defect   / total * 100) if total > 0 else 0.0
    grade = 'A' if qualified_pct >= 70 else ('B' if qualified_pct >= 50 else 'C')

    stats = {
        "Total Detections":       total,
        "Qualified Cocoon Count": qualified,
        "Defect Count":           defect,
        "Qualified Cocoon %":     round(qualified_pct, 2),
        "Defect %":               round(defect_pct, 2),
        "Sample Grade":           grade
    }

    return Image.fromarray(cv2.cvtColor(orig, cv2.COLOR_BGR2RGB)), stats


def predict_renditta(defect_pct):
    if renditta_model is None or poly_transform is None:
        raise Exception("Renditta model not loaded")
    X      = np.array([[defect_pct]])
    X_poly = poly_transform.transform(X)
    return round(float(renditta_model.predict(X_poly)[0]), 4)


# ══════════════════════════════════════════════════════════════════════
# ROUTES
# ══════════════════════════════════════════════════════════════════════

# ── NEW: ESP32 sensor data intake ─────────────────────────────────────
@app.route('/sensor', methods=['POST'])
def sensor_data():
    global latest_sensor_data
    data = request.get_json()
    if not data:
        return jsonify({"error": "No JSON data"}), 400

    latest_sensor_data = {
        "temperature": float(data.get('temperature', 25.0)),
        "humidity":    float(data.get('humidity',    70.0)),
        "moisture":    float(data.get('moisture',    12.0)),
        "timestamp":   datetime.now().isoformat()
    }
    print(f"\n[Sensor] Temp={latest_sensor_data['temperature']}°C "
          f"Humidity={latest_sensor_data['humidity']}% "
          f"Moisture={latest_sensor_data['moisture']}%")
    return jsonify({"status": "success"})


# ── NEW: Frontend polls this to display live sensor panel ─────────────
@app.route('/sensor/latest', methods=['GET'])
def sensor_latest():
    return jsonify({
        **latest_sensor_data,
        "moisture_status": moisture_status(latest_sensor_data['moisture'])
    })


# ── UNCHANGED: /classify ──────────────────────────────────────────────
@app.route('/classify', methods=['POST'])
def classify_cocoon():
    print("\n" + "=" * 55)
    print("Classification request")
    if 'image' not in request.files:
        return jsonify({"error": "No image file provided"}), 400
    file = request.files['image']
    if file.filename == '':
        return jsonify({"error": "No image selected"}), 400

    filename   = f"{uuid.uuid4().hex}.jpg"
    image_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)

    try:
        file.save(image_path)
        image = Image.open(image_path).convert('RGB')
        annotated_image, stats = process_image(image)
        result_filename = 'result_' + filename
        annotated_image.save(os.path.join(app.config['UPLOAD_FOLDER'], result_filename))
        print(f"  Stats: {stats}")
        print("=" * 55)
        return jsonify({"image_url": f"/uploads/{result_filename}", "stats": stats})
    except Exception as e:
        traceback.print_exc()
        return jsonify({"error": f"Processing failed: {str(e)}"}), 500


# ── UPGRADED: /yield — moisture now from ESP32, + Ct×Ch correction ────
@app.route('/yield', methods=['POST'])
def yield_estimate():
    data = request.get_json(silent=True) or {}

    # ── Batch weight ──────────────────────────────────────────────
    batch_weight_kg = data.get('batch_weight_kg')
    if batch_weight_kg is None:
        return jsonify({"error": "batch_weight_kg is required"}), 400
    try:
        batch_weight_kg = float(batch_weight_kg)
    except (TypeError, ValueError):
        return jsonify({"error": "batch_weight_kg must be a number"}), 400

    # ── Defect % ──────────────────────────────────────────────────
    defect_pct = float(data.get('defect_pct', 0))

    # ── Sensor readings: prefer request body, fall back to live sensor ──────
    moisture_pct = data.get('moisture_pct')
    temperature  = data.get('temperature')
    humidity     = data.get('humidity')

    if moisture_pct is None:
        moisture_pct = latest_sensor_data.get('moisture', 10)
    if temperature is None:
        temperature  = latest_sensor_data.get('temperature', 25)
    if humidity is None:
        humidity     = latest_sensor_data.get('humidity', 70)

    moisture_pct = float(moisture_pct)
    temperature  = float(temperature)
    humidity     = float(humidity)

    # ── Moisture correction ───────────────────────────────────────
    M  = moisture_pct / 100.0

    # Temperature correction factor (from moisture_info.md table)
    if   temperature < 20:    Ct = 1.03
    elif temperature <= 28:   Ct = 1.00
    elif temperature <= 35:   Ct = 0.98
    else:                     Ct = 0.95

    # Humidity correction factor
    if   humidity < 50:       Ch = 0.98
    elif humidity <= 70:      Ch = 1.00
    elif humidity <= 80:      Ch = 1.02
    elif humidity <= 90:      Ch = 1.05
    else:                     Ch = 1.08

    W_final = batch_weight_kg * (1 - M) * Ct * Ch

    # ── Renditta model ────────────────────────────────────────────
    # Use the pre-loaded model if available, else linear fallback
    effective_weight = W_final * (1 - defect_pct / 100.0)

    if renditta_model and poly_transform:
        X_in  = poly_transform.transform([[effective_weight]])
        ratio = float(renditta_model.predict(X_in)[0]) / 100.0
    else:
        # Simple linear approximation: ~13% base yield
        ratio = max(0.08, 0.13 - (defect_pct / 100.0) * 0.05)

    silk_kg = effective_weight * ratio

    # ── Grade ─────────────────────────────────────────────────────
    qualified_pct = 100 - defect_pct
    if   qualified_pct >= 90: grade = 'A'
    elif qualified_pct >= 75: grade = 'B'
    elif qualified_pct >= 60: grade = 'C'
    else:                     grade = 'D'

    # ── Improvement opportunity ───────────────────────────────────
    # How much extra silk if moisture were 5% (optimal dry)
    W_optimal  = batch_weight_kg * (1 - 0.05) * Ct * Ch
    silk_opt   = W_optimal * (1 - defect_pct / 100.0) * ratio
    improvement = round(max(0, silk_opt - silk_kg), 3)

    weight_inflation = round((M / (1 - M)) * 100, 2) if M < 1 else 0
    moisture_removed = round(batch_weight_kg - W_final / (Ct * Ch), 3)

    return jsonify({
        "batch_weight_kg":    batch_weight_kg,
        "effective_weight_kg": round(effective_weight, 3),
        "silk_produced_kg":    round(silk_kg, 3),
        "silk_yield_ratio_pct": round(ratio * 100, 2),
        "grade":               grade,
        "improvement_kg":      improvement,
        "sensor_used": {
            "moisture_pct":        moisture_pct,
            "temperature":         temperature,
            "humidity":            humidity,
            "Ct":                  round(Ct, 3),
            "Ch":                  round(Ch, 3),
            "moisture_status":     moisture_status(moisture_pct),
            "weight_inflation_pct": weight_inflation,
            "moisture_removed_kg": moisture_removed,
        }
    })


@app.route('/uploads/<filename>')
def send_uploaded_file(filename):
    file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
    if not os.path.exists(file_path):
        return jsonify({"error": "File not found"}), 404
    response = send_file(file_path, mimetype='image/jpeg')
    response.headers['Access-Control-Allow-Origin'] = '*'
    response.headers['Cache-Control'] = 'no-cache, no-store, must-revalidate'
    return response


@app.route('/status')
def status():
    return jsonify({
        "yolo_loaded":       yolo is not None,
        "classifier_loaded": clf is not None,
        "renditta_model":    renditta_model is not None,
        "poly_transform":    poly_transform is not None,
        "device":            str(device),
        "sensor_connected":  latest_sensor_data['timestamp'] is not None,
        "latest_sensor":     latest_sensor_data
    })

@app.route('/ping')
def ping():
    return jsonify({"status": "ok", "message": "SilkSense AI v3.0 backend alive"})


if __name__ == '__main__':
    print("\nStarting SilkSense AI v3.0...")
    print("Server → http://0.0.0.0:5000\n")
    app.run(debug=True, host='0.0.0.0', port=5000)
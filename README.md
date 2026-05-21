# 🐛 SilkSense AI — Automated Cocoon Quality Assessment & Moisture-Corrected Silk Yield Estimation

**Version:** 3.0 | **Status:** Production-Ready | **License:** MIT

---

## 📋 Table of Contents

- [Project Overview](#project-overview)
- [Key Features](#key-features)
- [Tech Stack](#tech-stack)
- [System Architecture](#system-architecture)
- [Installation & Setup](#installation--setup)
- [Running the Project](#running-the-project)
- [Project Structure](#project-structure)
- [API Documentation](#api-documentation)
- [Configuration & Environment](#configuration--environment)
- [Development Guide](#development-guide)
- [Troubleshooting](#troubleshooting)
- [Roadmap](#roadmap)
- [Credits](#credits)

---

## 🎯 Project Overview

**SilkSense AI** is an end-to-end automated system for **cocoon quality assessment and silk yield prediction** designed for the sericulture industry. The system combines **computer vision (YOLOv8 + EfficientNet-B0)** with **IoT sensor integration (ESP32)** to provide accurate, moisture-corrected cocoon grading and silk production estimates.

### Problem Statement

Manual cocoon inspection is:
- **Slow & Labor-Intensive**: Takes hours to grade a batch
- **Inconsistent**: Varies between operators (70–80% accuracy)
- **Inaccurate**: Ignores critical factors like moisture, temperature, and humidity
- **Scalability Challenge**: Cannot handle high-volume production

### Solution

SilkSense automates the entire workflow:

1. **Image Capture** — Upload cocoon batch photos via mobile or desktop
2. **AI Detection & Segmentation** — YOLOv8 isolates individual cocoons
3. **Quality Classification** — EfficientNet-B0 categorizes 6 cocoon types
4. **Sensor Integration** — IoT readings (moisture, temperature, humidity) correct batch weight
5. **Yield Prediction** — Renditta model estimates final silk output per kilogram

**Result**: Consistent, science-backed grading in seconds with production-ready accuracy.

---

## ✨ Key Features

### 🤖 AI & Computer Vision
- **YOLOv8 Segmentation**: 96.1% mAP — precise cocoon detection in dense trays
- **EfficientNet-B0 Classification**: 97% accuracy — identifies 6 quality categories
- **Real-time Processing**: Analyzes 100+ cocoons per image in <5 seconds
- **Batch Analytics**: Aggregates individual cocoon stats into batch-level metrics

### 🌡️ IoT & Environmental Correction
- **ESP32 Microcontroller**: Collects sensor data every 5 seconds
- **DHT22 Sensor**: Temperature and humidity monitoring
- **Soil Moisture Sensor**: Relative moisture index (calibrated experimentally)
- **Load Cell Integration**: Batch weight measurement
- **Moisture Compensation**: Removes artificial weight inflation from humidity

### 📊 Advanced Yield Prediction
- **Renditta Calculation**: Industry-standard kg cocoons → 1 kg raw silk conversion
- **Quality-Aware Weighting**: Defect percentage directly impacts yield
- **Environmental Correction**: Temperature & humidity factors adjust final estimates
- **Improvement Opportunity**: Suggests optimal moisture level for maximum yield

### 📱 User Experience
- **Mobile-First Design**: QR code for easy batch photo uploads
- **Dashboard**: Real-time monitoring of cocoon counts, defects, and grades
- **Live Sensor Panel**: Environmental conditions at a glance
- **Annotated Images**: Visual feedback with bounding boxes and confidence scores
- **PDF Export**: Batch reports with detailed analytics

### 🎓 Educational Value
- **Research-Backed Models**: Trained on 3,068 cocoon samples (Bivoltine & Cross-Breed)
- **Open-Source Algorithms**: Transparent ML pipeline
- **Detailed Documentation**: Learn sericulture + AI integration

---

## 🛠️ Tech Stack

### **Backend**
| Component | Technology | Purpose |
|-----------|-----------|---------|
| Server | Flask 2.0+ | REST API & route handling |
| Deep Learning | PyTorch + Ultralytics | YOLOv8 segmentation & inference |
| Classification | timm (EfficientNet-B0) | Cocoon defect classification |
| ML Models | scikit-learn + joblib | Renditta prediction model |
| Image Processing | OpenCV + Pillow | Crop extraction & annotation |
| Serialization | NumPy | Tensor operations |

### **Frontend**
| Component | Technology | Purpose |
|-----------|-----------|---------|
| Framework | React 19 | UI component library |
| Routing | React Router v7 | Multi-page navigation |
| Build Tool | Vite 8 | Fast dev server & bundling |
| Styling | CSS3 | Custom responsive design |
| HTTP | Fetch API | Backend communication |

### **IoT & Hardware**
| Component | Device | Purpose |
|-----------|--------|---------|
| Microcontroller | ESP32 | Sensor data collection & transmission |
| Temperature/Humidity | DHT22 | Environmental monitoring |
| Moisture Sensor | Capacitive Soil Sensor | Relative moisture detection |
| Weight | Load Cell + HX711 Amplifier | Batch weight measurement |
| Communication | WiFi (ESP32) | Data transmission to backend |

### **Database & Storage**
- **Uploads**: File-based (local `uploads/` directory)
- **Models**: Pre-trained weights (PyTorch `.pth` + scikit-learn `.pkl`)
- **QR Cache**: Static PNG generation for mobile links

### **DevOps & Deployment**
- **Python**: 3.9+
- **Package Manager**: pip
- **Node.js**: 18+ (frontend)
- **Port Configuration**: Backend (5000), Upload Server (5001), Frontend (3000)

---

## 🏗️ System Architecture

### **Data Flow Diagram**

```
┌─────────────────┐
│   Mobile Phone  │  (1) Scan QR → Upload image
└────────┬────────┘
         │
         ↓
┌──────────────────────┐
│  Flask Upload Server │  (2) Receive & store image
│   (Port 5001)        │
└──────────┬───────────┘
           │
           ↓
┌──────────────────────┐
│  YOLOv8 Segmentation │  (3) Detect cocoons
└──────────┬───────────┘
           │
           ↓
┌──────────────────────┐
│ EfficientNet-B0 CNN  │  (4) Classify defects
└──────────┬───────────┘
           │
           ↓
┌──────────────────────┐
│   Compute Stats      │  (5) Count qualified/defect
└──────────┬───────────┘
           │
           ↓
┌──────────────────────────────────────┐
│  ESP32 IoT Sensors  ←→ Backend API   │  (6) Moisture, temp, humidity
└──────────┬───────────────────────────┘
           │
           ↓
┌──────────────────────┐
│  Yield Estimation    │  (7) Renditta calc + Ct, Ch correction
│  & Grading          │
└──────────┬───────────┘
           │
           ↓
┌──────────────────────┐
│  React Dashboard     │  (8) Display results
│  (Port 3000)         │
└──────────────────────┘
```

### **Processing Pipeline**

```
Image Upload
    ↓
[YOLOv8 Detection] → Bounding Boxes (xyxy coordinates)
    ↓
For each cocoon crop:
    ├─ Extract region → Resize to 224×224 → Normalize
    ├─ [EfficientNet-B0] → Confidence score (qualified/defective)
    ├─ Draw box + label on original
    └─ Accumulate stats
    ↓
Batch Statistics
    ├─ Total detections
    ├─ Qualified count & %
    ├─ Defect count & %
    └─ Grade (A/B/C/D)
    ↓
Fetch Latest Sensor Data (or use submitted values)
    ├─ Moisture %
    ├─ Temperature °C
    └─ Humidity %
    ↓
Yield Calculation
    ├─ Apply moisture correction: W_final = W_batch × (1 - M) × Ct × Ch
    ├─ Apply quality weighting: W_effective = W_final × (1 - defect%)
    ├─ Query Renditta model (polynomial): ratio = f(W_effective)
    ├─ Estimate silk: silk_kg = W_effective × ratio
    └─ Calculate improvement if moisture were optimal (5%)
    ↓
Final Report
    ├─ Batch weight (measured & corrected)
    ├─ Silk output (kg)
    ├─ Yield ratio (%)
    ├─ Grade
    ├─ Improvement opportunity
    └─ Environmental context
```

### **API Architecture**

```
┌─────────────────────────────────────────┐
│       FRONTEND (React + Vite)           │
│  Port 3000                              │
└─────────────────────────────────────────┘
         ↑  /api/classify
         ↓  /api/yield
         ↑  /api/sensor/latest
┌─────────────────────────────────────────┐
│     BACKEND (Flask)                     │
│     Port 5000                           │
├─────────────────────────────────────────┤
│ POST /classify    → Image → Stats       │
│ POST /yield       → Batch data → Silk   │
│ POST /sensor      → ESP32 → Store       │
│ GET  /sensor/latest → Return live data  │
│ GET  /uploads/<file>                    │
└─────────────────────────────────────────┘
         ↓ Sensor Data (JSON)
┌─────────────────────────────────────────┐
│     ESP32 Microcontroller               │
│  DHT22, Soil Moisture, Load Cell        │
│  WiFi → HTTP POST to /sensor            │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│  UPLOAD SERVER (Flask)                  │
│  Port 5001                              │
├─────────────────────────────────────────┤
│ GET  /upload      → Mobile upload page  │
│ POST /upload      → Save image file     │
│ GET  /           → PC dashboard + QR    │
│ GET  /uploads/<file>                    │
└─────────────────────────────────────────┘
```

---

## 📥 Installation & Setup

### **Prerequisites**

- **Python 3.9+** (with pip)
- **Node.js 18+** (with npm)
- **Git**
- **4GB+ RAM** (for GPU: CUDA 11.8+ recommended)
- **2GB disk space** (for models)

### **Step 1: Clone Repository**

```bash
git clone https://github.com/yourusername/silksense-ai.git
cd silksense-ai
```

### **Step 2: Backend Setup**

#### Create Virtual Environment
```bash
cd silksense-backend
python -m venv venv

# Activate venv
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate
```

#### Install Dependencies
```bash
pip install --upgrade pip
pip install flask flask-cors ultralytics torch torchvision timm scikit-learn opencv-python pillow numpy joblib
```

> **Note:** PyTorch installation varies by OS and GPU availability. See [PyTorch official installation guide](https://pytorch.org/get-started/locally/) for your setup.

#### Pre-trained Models

The trained models are included in the repository:

```
silksense-backend/models/
├── best_seg.pt              # YOLOv8s segmentation (96.1% mAP)
├── best_classifier.pth      # EfficientNet-B0 classifier (97% accuracy)
├── poly_transform.pkl       # PolynomialFeatures scaler
└── best_model.pkl           # Renditta prediction model
```

**No download needed** — models are already in the repository after cloning.

> These models were trained on 3,068 cocoon samples (Bivoltine & Cross-Breed varieties) as described in the research paper.

#### Configure Flask
```bash
# Set environment variables (Windows)
set FLASK_APP=app.py
set FLASK_ENV=development
set FLASK_DEBUG=1

# macOS/Linux
export FLASK_APP=app.py
export FLASK_ENV=development
export FLASK_DEBUG=1
```

### **Step 3: Frontend Setup**

```bash
cd ../silksense-frontend

# Install dependencies
npm install

# Verify Vite configuration (port 3000 for dev server)
cat vite.config.js
```

### **Step 4: IoT Setup (Optional)**

#### Flash ESP32 with Sensor Code
```cpp
// ESP32 Arduino Sketch
#include <WiFi.h>
#include <HTTPClient.h>
#include "DHT.h"

#define DHTPIN 4
#define DHTTYPE DHT22
#define MOISTURE_PIN A0

DHT dht(DHTPIN, DHTTYPE);

void setup() {
  Serial.begin(115200);
  WiFi.begin("SSID", "PASSWORD");
  dht.begin();
}

void loop() {
  if (WiFi.status() == WL_CONNECTED) {
    HTTPClient http;
    http.begin("http://<BACKEND_IP>:5000/sensor");
    http.addHeader("Content-Type", "application/json");
    
    float temp = dht.readTemperature();
    float humidity = dht.readHumidity();
    int moisture = analogRead(MOISTURE_PIN);
    
    String payload = "{\"temperature\":" + String(temp) + 
                     ",\"humidity\":" + String(humidity) + 
                     ",\"moisture\":" + String(moisture) + "}";
    
    http.POST(payload);
    http.end();
  }
  delay(5000); // Post every 5 seconds
}
```

---

## 🚀 Running the Project

### **Terminal 1: Flask Backend (Port 5000)**

```bash
cd silksense-backend
source venv/bin/activate  # or venv\Scripts\activate on Windows
python app.py
```

**Expected Output:**
```
=======================================================
SilkSense AI v3.0 — Loading Models
=======================================================
✓ YOLO loaded
✓ EfficientNet loaded
✓ Poly transform loaded
✓ Renditta model loaded
Device: cuda (or cpu)
=======================================================
```

### **Terminal 2: Upload Server (Port 5001)**

```bash
cd silksense-backend/cocoon_upload
source venv/bin/activate
python app.py
```

**Expected Output:**
```
==================================================
  Cocoon Image Upload System
==================================================
  Dashboard : http://192.168.x.x:5001
  Mobile URL: http://192.168.x.x:5001/upload
  Scan the QR code at the dashboard!
==================================================
```

### **Terminal 3: React Frontend (Port 3000)**

```bash
cd silksense-frontend
npm run dev
```

**Expected Output:**
```
  VITE v8.0.12  ready in XXX ms

  ➜  Local:   http://localhost:3000/
  ➜  press h to show help
```

### **Access the Application**

| Service | URL | Purpose |
|---------|-----|---------|
| Frontend | http://localhost:3000 | Web UI (dashboard, cocoons page) |
| Backend API | http://localhost:5000 | Classification & yield endpoints |
| Upload Server | http://localhost:5001 | Mobile upload + PC dashboard |

---

## 📁 Project Structure

```
silksense-ai/
├── README.md
├── moisture_info.md                           # Moisture correction reference
├── Research Paper.txt                         # Full research documentation
│
├── silksense-backend/                         # Flask backend (Python)
│   ├── app.py                                 # Main API (classify, yield, sensor routes)
│   ├── requirements.txt                       # Backend dependencies
│   │
│   ├── cocoon_upload/                         # Image upload server (separate Flask app)
│   │   ├── app.py                            # Upload routes & QR generation
│   │   ├── requirements.txt                  # Upload server deps
│   │   ├── templates/
│   │   │   ├── index.html                    # PC dashboard (shows QR, live uploads)
│   │   │   └── upload.html                   # Mobile upload page
│   │   ├── static/
│   │   │   └── qr.png                        # Generated QR code (dynamic)
│   │   └── uploads/                          # Temp storage for uploaded images
│   │
│   ├── models/                                # Pre-trained ML models
│   │   ├── best_seg.pt                       # YOLOv8s segmentation weights
│   │   ├── best_classifier.pth               # EfficientNet-B0 classification weights
│   │   ├── poly_transform.pkl                # PolynomialFeatures scaler
│   │   └── best_model.pkl                    # Renditta prediction model
│   │
│   └── uploads/                               # Processed image outputs
│       ├── cocoon_YYYYMMDD_HHMMSS.jpg       # Original uploads
│       └── result_cocoon_*.jpg               # Annotated results (w/ boxes)
│
├── silksense-frontend/                        # React frontend (JavaScript)
│   ├── package.json                          # npm dependencies & scripts
│   ├── vite.config.js                        # Vite configuration (proxy setup)
│   ├── index.html                            # HTML entry point
│   │
│   ├── src/
│   │   ├── main.jsx                          # React root
│   │   ├── App.jsx                           # Route configuration
│   │   ├── styles/
│   │   │   └── global.css                    # Global theme (colors, fonts)
│   │   │
│   │   ├── components/                        # Reusable React components
│   │   │   ├── Navbar.jsx / Navbar.css       # Navigation bar
│   │   │   ├── ImageInput.jsx / ImageInput.css # Image upload widget
│   │   │   ├── AnalysisResults.jsx / AnalysisResults.css # Display results
│   │   │   ├── MoistureCapture.jsx / MoistureCapture.css # Sensor form
│   │   │   ├── YieldEstimation.jsx / YieldEstimation.css # Yield panel
│   │   │   └── SensorStrip.jsx / SensorStrip.css # Live sensor display
│   │   │
│   │   ├── hooks/
│   │   │   └── useSensor.js                  # Custom hook: polls /sensor/latest
│   │   │
│   │   ├── pages/                            # Full page components
│   │   │   ├── Home.jsx / Home.css           # Landing page + pipeline explainer
│   │   │   ├── Cocoons.jsx / Cocoons.css     # Cocoon defect reference guide
│   │   │   └── Dashboard.jsx / Dashboard.css # Main dashboard (upload → results)
│   │   │
│   │   └── assets/                           # Static images
│   │       ├── qualified.jpg
│   │       ├── double.jpg
│   │       ├── crushed.jpg
│   │       ├── decayed.jpg
│   │       ├── pierced.jpg
│   │       ├── yellow-spotted.jpg
│   │       └── silkworm-lifecycle.png
│   │
│   └── dist/                                  # Build output (npm run build)
│
└── .gitignore
```

### **Key Directories Explained**

| Directory | Purpose | Contents |
|-----------|---------|----------|
| `silksense-backend/` | Main ML pipeline | Flask API, YOLO, EfficientNet inference |
| `silksense-backend/models/` | Pre-trained weights | `.pt` (PyTorch), `.pth`, `.pkl` (scikit-learn) |
| `silksense-backend/uploads/` | Image storage | Uploaded + annotated cocoon images |
| `silksense-backend/cocoon_upload/` | Separate upload server | QR generation, mobile page, temp storage |
| `silksense-frontend/src/pages/` | React page components | Home, Cocoons reference, Dashboard |
| `silksense-frontend/src/components/` | Reusable UI modules | Forms, displays, sensor panels |
| `silksense-frontend/src/hooks/` | React custom hooks | Sensor polling, API integration |

---

## 🔗 API Documentation

### **Base URLs**
- **Backend API**: `http://localhost:5000`
- **Frontend Proxy**: `/api` → proxies to backend

### **Endpoints**

#### **1. Classify Cocoons (Image Analysis)**

**Request:**
```http
POST /api/classify
Content-Type: multipart/form-data

image: <binary JPG/PNG>
```

**Response:**
```json
{
  "image_url": "/uploads/result_abc123.jpg",
  "stats": {
    "Total Detections": 45,
    "Qualified Cocoon Count": 38,
    "Defect Count": 7,
    "Qualified Cocoon %": 84.44,
    "Defect %": 15.56,
    "Sample Grade": "A"
  }
}
```

**Status Codes:**
- `200` — Success
- `400` — No image provided
- `500` — Processing error (model not loaded, invalid image)

---

#### **2. Estimate Silk Yield**

**Request:**
```http
POST /api/yield
Content-Type: application/json

{
  "batch_weight_kg": 25.5,
  "defect_pct": 15.56,
  "moisture_pct": 12.0,
  "temperature": 25.5,
  "humidity": 72.0
}
```

**Response:**
```json
{
  "batch_weight_kg": 25.5,
  "effective_weight_kg": 21.384,
  "silk_produced_kg": 3.125,
  "silk_yield_ratio_pct": 14.62,
  "grade": "A",
  "improvement_kg": 0.384,
  "weight_inflation_pct": 13.65,
  "moisture_removed_kg": 4.116,
  "sensor_summary": {
    "moisture_pct": 12.0,
    "temperature": 25.5,
    "humidity": 72.0,
    "moisture_status": "Normal"
  }
}
```

**Calculation Details:**
```
1. Moisture Correction:
   W_final = W_batch × (1 - M) × Ct × Ch
   Where M = moisture_pct / 100
   Ct = temperature correction factor (1.00 @ 25°C)
   Ch = humidity correction factor (1.00 @ 70% RH)

2. Effective Weight:
   W_effective = W_final × (1 - defect_pct/100)

3. Renditta (Polynomial Model):
   ratio = poly_model.predict(X)
   Estimated silk = W_effective × ratio

4. Improvement:
   Assumes moisture = 5% (optimal)
   silk_optimal = W_optimal × ratio
   improvement = silk_optimal - silk_produced
```

---

#### **3. Receive Sensor Data (ESP32)**

**Request:**
```http
POST /sensor
Content-Type: application/json

{
  "temperature": 24.8,
  "humidity": 71.5,
  "moisture": 11.3
}
```

**Response:**
```json
{
  "status": "success"
}
```

**Usage:** Called by ESP32 every 5 seconds. Data is stored globally and used as fallback in `/yield` if no values provided.

---

#### **4. Get Latest Sensor Data**

**Request:**
```http
GET /sensor/latest
```

**Response:**
```json
{
  "temperature": 24.8,
  "humidity": 71.5,
  "moisture": 11.3,
  "timestamp": "2024-05-21T14:32:10.123456",
  "moisture_status": "Normal"
}
```

---

#### **5. Serve Uploaded Image**

**Request:**
```http
GET /uploads/result_abc123.jpg
```

**Response:** Binary JPG image with bounding boxes and labels

---

### **Error Handling**

**Example Error Response:**
```json
{
  "error": "Processing failed: YOLO model not loaded"
}
```

**Common Errors:**
| Error | Cause | Fix |
|-------|-------|-----|
| `No image file provided` | Missing multipart file | Include `image` in form data |
| `Processing failed: YOLO model not loaded` | Model file missing | Download `best_seg.pt` to `models/` |
| `batch_weight_kg must be a number` | Invalid input type | Send numeric value, not string |
| `Connection refused (port 5000)` | Backend not running | Run `python app.py` in terminal |

---

## ⚙️ Configuration & Environment

### **Environment Variables**

Create a `.env` file in `silksense-backend/`:

```bash
# Flask Configuration
FLASK_ENV=development
FLASK_DEBUG=1
FLASK_APP=app.py

# Model Paths
MODEL_SEGMENTATION=models/best_seg.pt
MODEL_CLASSIFIER=models/best_classifier.pth
MODEL_RENDITTA=models/best_model.pkl
SCALER_POLYNOMIAL=models/poly_transform.pkl

# File Upload
UPLOAD_FOLDER=uploads
MAX_UPLOAD_SIZE_MB=10

# CORS
CORS_ORIGINS=http://localhost:3000,http://localhost:5001

# Device
CUDA_VISIBLE_DEVICES=0
```

### **Moisture Correction Factors**

These are hardcoded in `app.py` based on research:

```python
# Temperature Correction (Ct)
if temperature < 20:    Ct = 1.03
elif temperature <= 28: Ct = 1.00
elif temperature <= 35: Ct = 0.98
else:                   Ct = 0.95

# Humidity Correction (Ch)
if humidity < 50:       Ch = 0.98
elif humidity <= 70:    Ch = 1.00
elif humidity <= 80:    Ch = 1.02
elif humidity <= 90:    Ch = 1.05
else:                   Ch = 1.08

# Moisture Status Labels
if moisture < 8:    status = "Dry"
elif moisture < 15: status = "Normal"
elif moisture < 20: status = "Moist"
elif moisture < 25: status = "Wet"
else:               status = "Excess Moisture"
```

**To adjust:** Edit values in `silksense-backend/app.py` and restart server.

### **Vite Proxy Configuration**

In `silksense-frontend/vite.config.js`:

```javascript
proxy: {
  '/api': {
    target: 'http://127.0.0.1:5000',  // Backend server
    changeOrigin: true,
    rewrite: (path) => path.replace(/^\/api/, ''),
  },
  '/qr': {
    target: 'http://127.0.0.1:5001',  // Upload server
    changeOrigin: true,
    rewrite: (path) => path.replace(/^\/qr/, ''),
  },
}
```

**To redirect to production:** Change `target` URLs and update CORS in Flask.

---

## 👨‍💻 Development Guide

### **Coding Standards**

#### **Python (Backend)**
```python
# Use snake_case for functions/variables
def process_image(image_path):
    # Docstrings for all functions
    """Process cocoon image and return stats."""
    pass

# Type hints
from typing import Dict, List, Tuple
def classify_crop(crop: Image.Image) -> Tuple[float, int]:
    """Returns (confidence, label)"""
    pass

# Error handling
try:
    model.eval()
except RuntimeError as e:
    print(f"✗ Model load failed: {e}")
    model = None
```

#### **JavaScript/React (Frontend)**
```javascript
// Use camelCase for variables/functions
const processImageData = (imageUrl) => {
  // JSDoc comments
  /** Processes image and updates state */
};

// Component naming: PascalCase
export default function ImageInput() {
  const [image, setImage] = useState(null);
  
  // Descriptive prop names
  return <ImageDisplay image={image} onUpload={handleUpload} />;
}

// Custom hooks: useXxx convention
export function useSensor() {
  const [data, setData] = useState(null);
  return { data };
}
```

### **Git Workflow**

```bash
# Create feature branch
git checkout -b feature/cocoon-segmentation

# Commit with descriptive messages
git commit -m "feat: improve YOLOv8 confidence threshold to 0.5"
git commit -m "fix: handle edge case for empty crop regions"
git commit -m "docs: update API documentation for /yield endpoint"

# Push and create PR
git push origin feature/cocoon-segmentation
```

**Branch Naming:**
- `feature/` — New feature
- `fix/` — Bug fix
- `docs/` — Documentation
- `refactor/` — Code cleanup
- `hotfix/` — Production emergency

### **Best Practices**

| Practice | Why | Example |
|----------|-----|---------|
| Keep models in `/models` | Organized, easy to update | Download new YOLOv8 weights |
| Log to console | Debug training & inference | `print(f"  Detections: {len(boxes)}")` |
| Use environment variables | Avoid hardcoding secrets | `API_KEY = os.getenv('API_KEY')` |
| Write docstrings | Self-documenting code | `"""Classify crop: input (224×224) → confidence"""` |
| Test with small batches | Catch errors early | Use 1–2 images before production |
| Validate inputs | Prevent crashes | Check image size, value ranges |
| Version models | Reproduce results | Name as `best_model_v2.pkl` |

### **Adding New Features**

**Example: Add confidence threshold adjustment**

1. **Backend (`app.py`):**
```python
# Add to config
CONFIDENCE_THRESHOLD = 0.5

# Use in processing
if prob > CONFIDENCE_THRESHOLD:
    qualified += 1
```

2. **Frontend (Dashboard):**
```jsx
const [threshold, setThreshold] = useState(0.5);
const handleUpload = () => {
  const formData = new FormData();
  formData.append('image', image);
  formData.append('confidence_threshold', threshold);
  // POST to /api/classify
};
```

3. **API (`app.py`):**
```python
@app.route('/classify', methods=['POST'])
def classify():
    threshold = request.form.get('confidence_threshold', 0.5)
    # Use threshold in process_image()
```

---

## 🐛 Troubleshooting

### **Common Issues**

#### **Issue: "YOLO model not loaded"**
```
Error: Processing failed: YOLO model not loaded
```
**Cause:** `models/best_seg.pt` not found

**Fix:**
```bash
cd silksense-backend
mkdir -p models
# Download model
wget https://github.com/ultralytics/assets/releases/download/v8.2.0/yolov8s-seg.pt -O models/best_seg.pt
python app.py
```

---

#### **Issue: "Port 5000 already in use"**
```
OSError: [Errno 48] Address already in use
```
**Cause:** Flask already running or another app using port 5000

**Fix:**
```bash
# Find process using port 5000
lsof -i :5000  # macOS/Linux
netstat -ano | findstr :5000  # Windows

# Kill process
kill -9 <PID>  # macOS/Linux
taskkill /PID <PID> /F  # Windows

# Or use different port
python app.py --port 5002
```

---

#### **Issue: "Connection refused" from frontend**
```
Failed to fetch from http://localhost:5000
```
**Cause:** Backend not running or proxy misconfigured

**Fix:**
```bash
# 1. Start backend
cd silksense-backend && python app.py

# 2. Check vite.config.js proxy target
cat vite.config.js | grep target

# 3. Verify CORS enabled
# In app.py: CORS(app)

# 4. Restart frontend
cd silksense-frontend && npm run dev
```

---

#### **Issue: "CUDA out of memory"**
```
RuntimeError: CUDA out of memory. Tried to allocate 512.00 MiB
```
**Cause:** GPU insufficient VRAM for batch processing

**Fix:**
```python
# In app.py: use CPU
device = torch.device('cpu')  # Force CPU

# Or batch images
# Process 1 image at a time instead of 10
```

---

#### **Issue: "No module named 'ultralytics'"**
```
ModuleNotFoundError: No module named 'ultralytics'
```
**Cause:** Dependencies not installed

**Fix:**
```bash
pip install ultralytics
# Or reinstall all
pip install -r requirements.txt
```

---

#### **Issue: Image not uploading to backend**
```
Error: No image file provided
```
**Cause:** Multipart form data not correctly formatted

**Fix (Frontend):**
```javascript
const handleUpload = async (file) => {
  const formData = new FormData();
  formData.append('image', file);  // ← Key must be 'image'
  
  const res = await fetch('/api/classify', {
    method: 'POST',
    body: formData,  // ← Don't set Content-Type header
  });
};
```

---

#### **Issue: Yield calculation returning wrong values**
**Cause:** Sensor data not sent or models not loaded

**Fix:**
```python
# Check if models loaded
python
>>> import joblib
>>> joblib.load('models/best_model.pkl')  # Should not raise error

# Manually provide sensor values in request
curl -X POST http://localhost:5000/api/yield \
  -H "Content-Type: application/json" \
  -d '{
    "batch_weight_kg": 25.0,
    "defect_pct": 15.0,
    "moisture_pct": 12.0,
    "temperature": 25.0,
    "humidity": 70.0
  }'
```

---

### **Performance Optimization**

| Issue | Solution |
|-------|----------|
| Slow classification | Use GPU: `CUDA_VISIBLE_DEVICES=0 python app.py` |
| Slow startup | Pre-load models on server start ✓ (already done) |
| High memory usage | Process images one at a time (avoid batching) |
| API timeout | Increase Flask timeout: `@app.route(..., timeout=60)` |

---

## 🗺️ Roadmap

### **Completed (v3.0)**
- ✅ YOLOv8 segmentation + EfficientNet-B0 classification
- ✅ IoT sensor integration (ESP32, DHT22, moisture sensor)
- ✅ Moisture + temperature + humidity correction factors
- ✅ Renditta yield estimation
- ✅ React dashboard with real-time sensor monitoring
- ✅ Mobile QR-based upload system

### **Planned (v3.1+)**
- 🔄 **Database Integration**: PostgreSQL for historical batch tracking
- 🔄 **Advanced Analytics**: Trend visualization, seasonal analysis
- 🔄 **Model Retraining**: Automated pipeline for updating classifiers
- 🔄 **Multi-language UI**: Support for Hindi, Marathi, Tamil
- 🔄 **Offline Mode**: Process images without internet
- 🔄 **Export Reports**: PDF/CSV batch summaries
- 🔄 **Batch Management**: Track cocoon lots across harvest cycles
- 🔄 **Mobile App**: Native React Native or Flutter version
- 🔄 **Edge Deployment**: Run inference on mobile device (TensorFlow Lite)

### **Future Enhancements**
- 🚀 Real-time cocoon tracking via computer vision
- 🚀 Integration with sericulture ERP systems
- 🚀 Predictive models for yield optimization
- 🚀 Automated defect pattern analysis
- 🚀 Quality control certification system

---

## 📄 License

This project is licensed under the **MIT License** — see `LICENSE` file for details.

**You are free to:**
- ✅ Use commercially
- ✅ Modify and distribute
- ✅ Use privately

**You must:**
- ⚠️ Include original license
- ⚠️ State significant changes

---

## ❓ FAQ

**Q: Can I run this without GPU?**  
A: Yes, but slower. Set `device = torch.device('cpu')` in `app.py`.

**Q: What's the accuracy on custom cocoon varieties?**  
A: Trained on Bivoltine & Cross-Breed. Other varieties need retraining.

**Q: How do I integrate with my ERP system?**  
A: Export batch reports as JSON from `/api/yield` and POST to your system's API.

**Q: Can I deploy this in production?**  
A: Yes. Use Docker + Kubernetes for scaling. Replace Flask dev server with Gunicorn/uWSGI.

**Q: How often should ESP32 send sensor data?**  
A: Every 5 seconds is default. Adjust `delay(5000)` in ESP32 sketch.

---

## 📧 Support & Contact

For questions, issues, or contributions:

- **GitHub Issues**: [silksense-ai/issues](https://github.com/yourusername/silksense-ai/issues)
- **Email**: silksense.ai@example.com
- **Documentation**: [Full Docs](./docs/)

---

**Last Updated:** May 2024 | **Version:** 3.0 | **Status:** Stable ✅

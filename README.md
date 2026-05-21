# 🐛 SilkSense AI — Cocoon Quality Assessment & Moisture-Corrected Silk Yield Estimation

This project automates cocoon quality grading and silk-yield estimation using computer vision and simple IoT sensors. It's built as a local Python (Flask) backend, a small upload server for mobile photos, and a React frontend dashboard.

---

## Table of Contents
- Project Overview
- Home & Cocoons Page Summary
- Key Features
- Tech Stack
- System Architecture
- Installation & Setup
- Running the Project
- Using Mobile to Upload Cocoon Images
- Project Structure
- Troubleshooting
- License

---

## Project Overview

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

## Home & Cocoons Page Summary

The application includes two informative front-end pages that explain how SilkSense works and why moisture matters:

- **Home page**
  - Presents the workflow: capture, analyse, measure, estimate.
  - Highlights that AI is used for cocoon detection and defect classification.
  - Describes the importance of moisture correction using averaged sensor readings from the batch.
  - Shows the formula used to convert measured weight into corrected weight: `W_final = W_measured × (1 − M) × Ct × Ch`.
  - Explains why high humidity inflates raw cocoon weight and how corrected weight leads to more accurate silk yield estimates.

- **Cocoons page**
  - Defines each cocoon category: qualified, double, crushed, decayed, pierced, and yellow-spotted.
  - Shows batch grading thresholds and their quality meaning (A/B/C/D).
  - Explains Renditta as the cocoon-to-silk conversion efficiency, where higher defect rates increase actual raw weight required.
  - Reinforces that moisture, temperature, and humidity affect raw weight interpretation and yield estimation.

---

## Key Features

- YOLOv8 segmentation for cocoon detection
- EfficientNet-B0 classifier for defect categories
- Batch analytics and annotated result images
- IoT sensor integration (ESP32, DHT22, moisture sensor, load cell)
- Moisture/temperature/humidity corrections applied to batch weight
- Renditta-based silk yield estimation

---

## Tech Stack

**Backend**
- Flask — API and inference routes
- PyTorch + Ultralytics — YOLOv8 segmentation
- timm (EfficientNet-B0) — classification
- scikit-learn / joblib — Renditta model
- OpenCV / Pillow / NumPy — image handling

**Frontend**
- React + Vite — dashboard and UI

**IoT & Hardware**
- ESP32 — sensor data POSTs
- DHT22 — temperature & humidity
- Load cell + HX711 — batch weight

**Storage**
- Local `uploads/` for images and annotated results

---

## System Architecture

Data Flow Diagram

```
PC / Mobile → Upload Server (QR) → Flask backend → YOLOv8 segmentation → classifier → Batch stats → Frontend dashboard
                    ↑
                    └─ ESP32 sensors → Backend (/sensor)
```

---

## Installation & Setup

Follow these steps if you've never run a Python + React project before. Windows notes are included.

Prerequisites:

- Python 3.9 or higher — download from https://www.python.org
- Node.js 18 or higher — download from https://nodejs.org
- Git — download from https://git-scm.com

Step 1: Clone the repository

```bash
git clone https://github.com/omrajbhalke/Cocoon-Quality-Classification-and-Silk-Yield-Estimation-with-IoT
cd Cocoon-Quality-Classification-and-Silk-Yield-Estimation-with-IoT
```

Step 2: Set up the Python backend

1. Open a terminal (PowerShell or Command Prompt on Windows).
2. Change into the backend folder and install required packages:

```bash
cd silksense-backend
pip install flask flask-cors ultralytics torch torchvision timm scikit-learn opencv-python pillow numpy joblib qrcode
```

Note about PyTorch: If `pip install` fails for `torch`, visit https://pytorch.org/get-started/locally/ and follow the instructions for your OS. The CPU-only torch build works fine for this project.

Step 3: Set up the QR upload server

```bash
cd cocoon_upload
pip install flask qrcode pillow
cd ..
```

Step 4: Set up the React frontend

```bash
cd ../silksense-frontend
npm install
```

That's it. No database setup, no environment variables, no Docker required.

Windows notes:

- Use `venv\Scripts\activate` to activate a Python virtual environment (optional but recommended).
- If permission errors occur while installing packages, run your terminal as Administrator.

---

## Running the Project

You need to open 3 separate terminal windows and keep them running while using the app.

Terminal 1 — Main Flask backend (Port 5000):

```bash
cd silksense-backend
python app.py
```

Wait until you see a message like "SilkSense AI v3.0 — Models Loaded" before continuing.

Terminal 2 — QR upload server (Port 5001):

```bash
cd silksense-backend/cocoon_upload
python app.py
```

This prints the Dashboard URL and a QR link. Keep this running for mobile uploads.

Terminal 3 — React frontend (Port 3000):

```bash
cd silksense-frontend
npm run dev
```

Open http://localhost:3000 in your browser.

Quick check (confirm each part is running):

- `http://localhost:5000/sensor/latest` → should return JSON sensor data
- `http://localhost:5001` → should show the QR upload dashboard
- `http://localhost:3000` → should open the React app

Make sure all 3 terminals are running at the same time. Do not close any of them while using the app.

---

## Using Mobile to Upload Cocoon Images

1. Ensure your phone and PC are on the same Wi‑Fi network.
2. Terminal 2 (QR upload server) must be running.
3. In the React app dashboard, open the "Scan QR / Mobile" tab.
4. Scan the QR code on the dashboard with your phone camera.
5. The mobile page opens in your phone browser — take a photo or choose from the gallery.
6. Tap "Upload to PC" — the image will appear automatically in the dashboard on your PC.

If the mobile page doesn't load:

- Confirm both devices use the same Wi‑Fi network.
- Check the QR URL: it should start with your PC's local IP (like `http://192.168.x.x`), not `localhost` or `127.0.0.1`.
- On Windows, open PowerShell as Administrator and run:

```powershell
netsh advfirewall firewall add rule name="Cocoon Upload 5001" dir=in action=allow protocol=TCP localport=5001
```

- You can also type the URL printed by Terminal 2 directly into your phone browser to test.

---

## Project Structure

Top-level layout (kept short):

```
silksense-backend/
  app.py
  cocoon_upload/
    app.py
    templates/
    uploads/
  models/
  uploads/
silksense-frontend/
  src/
    components/
    pages/
  package.json
README.md
```

---

## Troubleshooting

Issue: Mobile page not loading after scanning QR

Cause: Phone and PC on different networks, or Windows firewall blocking port 5001

Fix:

1. Confirm both phone and PC are on the same Wi‑Fi network.
2. Ensure the URL in the QR code uses your PC's local IP (e.g., `http://192.168.x.x:5001`). If it shows `localhost` or `127.0.0.1`, it won't work from the phone.
3. On Windows, run (Admin PowerShell):

```powershell
netsh advfirewall firewall add rule name="Cocoon Upload 5001" dir=in action=allow protocol=TCP localport=5001
```
4. Try the URL from Terminal 2 directly in your phone browser.

---

Issue: "Processing failed: YOLO model not loaded"

Cause: The segmentation model file is missing from `silksense-backend/models/`.

Fix:

1. Ensure `best_seg.pt` is present in `silksense-backend/models/`.
2. If missing, download the model and place it in that folder (follow project notes or ask for the file).
3. Restart the Flask backend.

---

Issue: "Port 5000 already in use"

Cause: Another process is using port 5000.

Fix (Windows):

```powershell
netstat -ano | findstr :5000
taskkill /PID <PID> /F
```

Or run the backend on a different port by editing the run command in `app.py`.

---

Issue: "Connection refused (port 5000)" from frontend

Cause: Backend not running or proxy misconfigured.

Fix:

1. Start the backend (`python app.py`) and confirm it reports models loaded.
2. Check `silksense-frontend/vite.config.js` proxy target points to `http://127.0.0.1:5000`.
3. Restart the frontend (`npm run dev`).

---

Issue: "No module named 'ultralytics'"

Cause: Missing Python dependency.

Fix:

```bash
pip install ultralytics
```

Restart the backend after installing.

---

Issue: Yield calculation returning unexpected values

Cause: Sensor data missing or models not loaded.

Fix:

1. Confirm the Renditta model files are present in `silksense-backend/models/` (e.g., `best_model.pkl`, `poly_transform.pkl`).
2. Provide sensor values manually when calling `/api/yield` (the frontend also has a moisture form).
3. Restart the backend and verify there are no model load errors in the terminal.

---

## License

This project is licensed under the MIT License — see `LICENSE` file for details.

---

If you'd like, I can now run a quick check that `README.md` exists and open it for review. Would you like me to do that?

# Cocoon Image Upload System
## Setup (one time only)

```bash
cd cocoon_upload
pip install flask qrcode pillow
```

## Run

```bash
python app.py
```

Then open the dashboard in your browser:
```
http://localhost:5000
```

A QR code will appear on the dashboard.
Scan it with your phone (same Wi-Fi) → take photo → auto-saves to /uploads folder.

## Folder structure

```
cocoon_upload/
├── app.py              ← Flask server
├── requirements.txt
├── uploads/            ← saved images go here
├── static/
│   └── qr.png          ← auto-generated QR
└── templates/
    ├── index.html      ← PC dashboard
    └── upload.html     ← mobile upload page
```

## How images are named

Each image is auto-named:
```
cocoon_YYYYMMDD_HHMMSS.jpg
```
Example: `cocoon_20250520_143201.jpg`

## Troubleshooting

- Phone not loading the page? Make sure both devices are on the **same Wi-Fi network**.
- QR not working? Type the URL shown on the dashboard directly into your phone browser.
- Port 5000 busy? Change `port=5000` in app.py to `port=5001`.

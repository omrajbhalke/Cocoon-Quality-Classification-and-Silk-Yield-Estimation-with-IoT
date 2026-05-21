import { useState, useRef, useCallback, useEffect } from 'react';
import './ImageInput.css';

const API_BASE      = '/api';
const QR_PREFIX     = '/qr';
const POLL_INTERVAL = 3000;

export default function ImageInput({ imageFile, onImageReady, onAnalysisDone }) {
  const [tab,          setTab]       = useState('upload');   // 'upload' | 'qr'
  const [preview,      setPreview]   = useState(null);
  const [file,         setFile]      = useState(null);
  const [dragOver,     setDragOver]  = useState(false);
  const [processing,   setProcessing] = useState(false);
  const [procStep,     setProcStep]  = useState(0);
  const [qrSrc,        setQrSrc]     = useState(`${QR_PREFIX}/static/qr.png`);
  const [lastImageName, setLastImageName] = useState(null);
  const [qrPolling,    setQrPolling] = useState(false);

  const fileInputRef = useRef(null);
  const pollRef      = useRef(null);

  // ── File handlers ──────────────────────────────────────────────
  function loadFile(f) {
    if (!f || !f.type.startsWith('image/')) return;
    setFile(f);
    const reader = new FileReader();
    reader.onload = e => setPreview(e.target.result);
    reader.readAsDataURL(f);
    onImageReady(f);
  }

  function handleChange(e) { if (e.target.files[0]) loadFile(e.target.files[0]); }
  function handleDrop(e) {
    e.preventDefault(); setDragOver(false);
    const f = e.dataTransfer.files[0];
    if (f) loadFile(f);
  }
  function resetPreview() { setPreview(null); setFile(null); onImageReady(null); }

  // ── QR polling: watches /images on cocoon_upload server ────────
  const startPolling = useCallback(() => {
    setQrPolling(true);
    pollRef.current = setInterval(async () => {
      try {
        const res    = await fetch(`${QR_PREFIX}/images`);
        const images = await res.json();
        if (images.length > 0 && images[0] !== lastImageName) {
          const newName = images[0];
          setLastImageName(newName);
          // Fetch the image blob and convert to File
          const imgRes  = await fetch(`${QR_PREFIX}/uploads/${newName}`);
          const blob    = await imgRes.blob();
          const newFile = new File([blob], newName, { type: 'image/jpeg' });
          loadFile(newFile);
          stopPolling();
        }
      } catch { /* server might not be running — silently ignore */ }
    }, POLL_INTERVAL);
  }, [lastImageName]);

  function stopPolling() {
    clearInterval(pollRef.current);
    setQrPolling(false);
  }

  useEffect(() => {
    if (tab === 'qr' && !preview) startPolling();
    else stopPolling();
    return stopPolling;
  }, [tab]);

  // ── Analysis ───────────────────────────────────────────────────
  const STEPS_LABELS = [
    'Uploading image…',
    'Running YOLO segmentation…',
    'Classifying each cocoon…',
    'Generating quality report…',
  ];

  async function runAnalysis() {
    if (!file) return;
    setProcessing(true);
    setProcStep(0);

    const form = new FormData();
    form.append('image', file);

    try {
      setProcStep(1);
      const res = await fetch(`${API_BASE}/classify`, { method: 'POST', body: form });
      setProcStep(2);
      if (!res.ok) { const e = await res.json(); throw new Error(e.error || 'Server error'); }
      setProcStep(3);
      const data = await res.json();
      setProcStep(4);
      await new Promise(r => setTimeout(r, 500));
      setProcessing(false);
      onAnalysisDone(data);
    } catch (err) {
      setProcessing(false);
      alert('Analysis failed: ' + err.message);
    }
  }

  // ── Render ─────────────────────────────────────────────────────
  return (
    <div className="image-input">

      <div className="section-header">
        <div className="section-badge">01</div>
        <div>
          <h2 className="section-title">Image Input</h2>
          <p className="section-desc">Upload from your computer or scan the QR to send from your phone.</p>
        </div>
      </div>

      {/* Tab switcher */}
      <div className="input-tabs">
        <button
          className={`input-tab ${tab === 'upload' ? 'tab-active' : ''}`}
          onClick={() => setTab('upload')}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M2 11v2a1 1 0 001 1h10a1 1 0 001-1v-2M8 2v8M5 5l3-3 3 3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Upload from PC
        </button>
        <button
          className={`input-tab ${tab === 'qr' ? 'tab-active' : ''}`}
          onClick={() => setTab('qr')}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <rect x="1" y="1" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.5"/>
            <rect x="10" y="1" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.5"/>
            <rect x="1" y="10" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.5"/>
            <rect x="3" y="3" width="1" height="1" fill="currentColor"/>
            <rect x="12" y="3" width="1" height="1" fill="currentColor"/>
            <rect x="3" y="12" width="1" height="1" fill="currentColor"/>
            <path d="M10 10h2v2h-2zM12 12h2M12 10v2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
          Scan QR / Mobile
        </button>
      </div>

      {/* ── Upload Tab ── */}
      {tab === 'upload' && !processing && (
        <div
          className={`upload-zone ${dragOver ? 'drag-over' : ''} ${preview ? 'has-preview' : ''}`}
          onDragOver={e => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => !preview && fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            hidden
            onChange={handleChange}
          />

          {!preview ? (
            <div className="upload-empty">
              <div className="upload-icon-ring">
                <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                  <path d="M16 22V10M16 10L10 16M16 10L22 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M6 26h20" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              </div>
              <p className="upload-title">Drop your cocoon image here</p>
              <p className="upload-sub">or <span className="upload-link" onClick={e => { e.stopPropagation(); fileInputRef.current?.click(); }}>browse files</span></p>
              <p className="upload-formats">JPG · PNG · WEBP — up to 20 MB</p>
            </div>
          ) : (
            <div className="upload-preview">
              <img src={preview} alt="Preview" className="preview-img" />
              <div className="preview-overlay">
                <button className="preview-change-btn" onClick={e => { e.stopPropagation(); resetPreview(); }}>
                  ↩ Change Image
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── QR Tab ── */}
      {tab === 'qr' && !processing && (
        <div className="qr-panel">
          {!preview ? (
            <>
              <div className="qr-instructions">
                <p>Make sure your phone and PC are on the <strong>same Wi-Fi</strong>.<br/>
                Start the <code>cocoon_upload</code> Flask server, then scan this QR code.</p>
              </div>
              <div className="qr-card">
                <img
                  src={qrSrc}
                  alt="QR code to open mobile upload page"
                  className="qr-img"
                  onError={() => setQrSrc('')}
                />
                <div className={`qr-poll-status ${qrPolling ? 'polling' : ''}`}>
                  <span className="qr-poll-dot" />
                  {qrPolling ? 'Waiting for image from phone…' : 'Not polling'}
                </div>
              </div>
              <div className="qr-steps">
                <div className="qr-step"><span className="qr-step-num">1</span>Scan the QR with your phone's camera</div>
                <div className="qr-step"><span className="qr-step-num">2</span>Take a photo of the cocoon batch</div>
                <div className="qr-step"><span className="qr-step-num">3</span>Tap "Upload to PC" — it appears here automatically</div>
              </div>
            </>
          ) : (
            <div className="qr-received">
              <div className="qr-received-badge">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M2.5 8L6 11.5L13.5 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Image received from phone
              </div>
              <div className="upload-preview" style={{ marginTop: 16 }}>
                <img src={preview} alt="Received from phone" className="preview-img" />
                <div className="preview-overlay">
                  <button className="preview-change-btn" onClick={resetPreview}>↩ Retake</button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Processing overlay ── */}
      {processing && (
        <div className="processing-panel">
          <div className="proc-spinner">
            <svg viewBox="0 0 60 60" className="spin-svg">
              <circle cx="30" cy="30" r="26" fill="none" stroke="var(--green)" strokeWidth="3" strokeDasharray="163" strokeDashoffset="40"/>
            </svg>
          </div>
          <div className="proc-steps-list">
            {STEPS_LABELS.map((label, i) => (
              <div key={i} className={`proc-step-item ${procStep === i+1 ? 'proc-active' : ''} ${procStep > i+1 ? 'proc-done' : ''}`}>
                <span className="proc-dot" />
                {label}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Analyse button ── */}
      {!processing && (
        <button
          className={`analyse-btn ${preview ? 'analyse-btn--ready' : ''}`}
          disabled={!preview}
          onClick={runAnalysis}
        >
          <span>Analyse Cocoons</span>
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path d="M3 9h12M11 5l4 4-4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      )}

    </div>
  );
}

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Home.css';

const STEPS = [
  { label: 'Capture', title: 'Upload or scan QR from phone', icon: '📷' },
  { label: 'Analyse', title: 'AI detects cocoons and defects', icon: '🧠' },
  { label: 'Measure', title: 'Collect 5-point moisture data', icon: '💧' },
  { label: 'Estimate', title: 'Yield with moisture correction', icon: '📈' },
];

const DEFECT_BARS = [
  { grade: 'A', range: '≥ 90%', color: 'var(--green)' },
  { grade: 'B', range: '75–89%', color: 'var(--gold)' },
  { grade: 'C', range: '60–74%', color: '#ff8c00' },
  { grade: 'D', range: '< 60%', color: 'var(--red)' },
];

export default function Home() {
  const navigate = useNavigate();
  const [weight, setWeight] = useState(15);
  const [moisture, setMoisture] = useState(18);
  const corrected = (weight * (1 - moisture / 100) * 0.98 * 1.02).toFixed(2);

  return (
    <div className="home-page">
      <section className="hero-section">
        <div className="hero-copy">
          <div className="eyebrow">SilkSense AI</div>
          <h1>AI-powered cocoon quality assessment & moisture-corrected silk yield estimation</h1>
          <p>Assess every batch with vision, sensor data, and environmental correction. From mobile photo upload to yield prediction, SilkSense brings smart sericulture to your fingertips.</p>
          <div className="hero-actions">
            <button className="btn-primary" onClick={() => navigate('/dashboard')}>Go to Dashboard</button>
            <button className="btn-secondary" onClick={() => navigate('/cocoons')}>Learn About Cocoons</button>
          </div>
        </div>
        <div className="hero-visual">
          <div className="hero-card">
            <span className="hero-tag">Dark theme, smart insights</span>
            <h2>One platform for cocoon grading, moisture correction and silk yield.</h2>
            <p>Upload batch photos, capture moisture readings, and estimate silk output with quality-aware, moisture-aware AI.</p>
          </div>
        </div>
      </section>

      <section className="how-it-works">
        <div className="section-head">
          <span className="section-overline">How it works</span>
          <h2>Four steps to dependable silk yield</h2>
        </div>
        <div className="steps-grid">
          {STEPS.map(step => (
            <article key={step.label} className="step-card">
              <div className="step-icon">{step.icon}</div>
              <h3>{step.label}</h3>
              <p>{step.title}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="technical-pipeline">
        <div className="section-head">
          <span className="section-overline">Technical pipeline</span>
          <h2>AI model flow for automated cocoon assessment</h2>
        </div>
        <div className="pipeline-flow">
          <div className="pipeline-step">
            <div className="step-number">1</div>
            <h3>Segmentation</h3>
            <p>YOLOv8 detects and isolates individual cocoons from batch tray images. Each cocoon is separated and prepared for quality analysis.</p>
          </div>
          <div className="pipeline-arrow">→</div>
          <div className="pipeline-step">
            <div className="step-number">2</div>
            <h3>Classification</h3>
            <p>EfficientNet-B0 classifier analyzes each segmented cocoon and assigns it to one of six quality categories: qualified, double, crushed, decayed, pierced, or yellow-spotted.</p>
          </div>
          <div className="pipeline-arrow">→</div>
          <div className="pipeline-step">
            <div className="step-number">3</div>
            <h3>Moisture & IoT</h3>
            <p>Sensor network measures batch weight, ambient temperature, and moisture levels. These readings are averaged across 5-point spatial sampling to ensure accuracy.</p>
          </div>
          <div className="pipeline-arrow">→</div>
          <div className="pipeline-step">
            <div className="step-number">4</div>
            <h3>Yield Prediction</h3>
            <p>Corrected batch weight combined with quality distribution (% qualified cocoons) determines Renditta value, which estimates raw silk yield per kilogram.</p>
          </div>
        </div>
      </section>

      <section className="moisture-matter">
        <div className="section-head">
          <span className="section-overline">Why moisture matters</span>
          <h2>Batch weight is only meaningful after moisture correction</h2>
        </div>
        <div className="moisture-grid">
          <div className="moisture-copy">
            <p>Higher moisture inflates raw cocoon weight and overestimates silk yield. SilkSense compensates with averaged sensor readings and environmental factors so your final result reflects true silk potential.</p>
            <div className="formula-panel">
              <div className="formula-label">Applied formula</div>
              <div className="formula-text">W_final = W_measured × (1 − M) × Ct × Ch</div>
            </div>
            <div className="example-card">
              <div className="example-row">
                <label>Batch weight</label>
                <input type="number" value={weight} onChange={e => setWeight(Number(e.target.value))} />
                <span>kg</span>
              </div>
              <div className="example-row">
                <label>Measured moisture</label>
                <input type="number" value={moisture} onChange={e => setMoisture(Number(e.target.value))} />
                <span>%</span>
              </div>
              <div className="example-result">Corrected weight: <strong>{corrected} kg</strong></div>
            </div>
          </div>
          <div className="moisture-table-card">
            <div className="table-title">Moisture effect example</div>
            <table>
              <thead>
                <tr><th>Moisture %</th><th>RH</th><th>Temp</th><th>Weight effect</th></tr>
              </thead>
              <tbody>
                <tr><td>5%</td><td>60%</td><td>25°C</td><td>Minimal</td></tr>
                <tr><td>10%</td><td>70%</td><td>25°C</td><td>Slight Increase</td></tr>
                <tr><td>15%</td><td>80%</td><td>24°C</td><td>Moderate Increase</td></tr>
                <tr><td>20%</td><td>85%</td><td>22°C</td><td>High False Weight</td></tr>
                <tr><td>25%</td><td>90%</td><td>20°C</td><td>Severe Inflation</td></tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section className="impact-card">
        <div>
          <span className="section-overline">Defect impact</span>
          <h2>Defective cocoons reduce usable silk and increase waste.</h2>
          <p>Double cocoons, parasites, stains and holes all prevent smooth reeling. SilkSense identifies defects so you can isolate low-quality batches before processing.</p>
        </div>
        <div className="bar-legend">
          {DEFECT_BARS.map(item => (
            <div key={item.grade} className="bar-row">
              <span>{item.grade}</span>
              <div className="bar-fill" style={{ width: item.grade === 'A' ? '95%' : item.grade === 'B' ? '70%' : item.grade === 'C' ? '55%' : '35%', background: item.color }} />
              <span>{item.range}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="sensor-overview">
        <div className="section-head">
          <span className="section-overline">Sensor overview</span>
          <h2>Every component plays a role</h2>
        </div>
        <div className="sensor-grid">
          <article><span>🧪</span><h3>DHT11</h3><p>Measures ambient temperature and humidity for environmental correction.</p></article>
          <article><span>💧</span><h3>Soil Moisture Sensor</h3><p>Tracks relative moisture level across the cocoon batch.</p></article>
          <article><span>⚖️</span><h3>Load Cell</h3><p>Captures gross batch weight used for yield estimation.</p></article>
          <article><span>📷</span><h3>Camera + AI</h3><p>Detects and classifies each cocoon in the image to compute quality metrics.</p></article>
        </div>
      </section>
    </div>
  );
}

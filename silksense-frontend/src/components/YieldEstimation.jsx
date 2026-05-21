import { useState } from 'react';
import './YieldEstimation.css';

const API_BASE = '/api';

function ResultRow({ label, value, accent, large }) {
  return (
    <div className={`result-row ${accent ? 'result-row--accent' : ''} ${large ? 'result-row--large' : ''}`}>
      <span className="result-label">{label}</span>
      <span className="result-value">{value}</span>
    </div>
  );
}

function SensorUsedCard({ sensor }) {
  if (!sensor) return null;
  return (
    <div className="sensor-used-card">
      <div className="suc-label">Sensor values used</div>
      <div className="suc-row">
        <span>Moisture</span><span>{sensor.moisture_pct?.toFixed(2)}%</span>
      </div>
      <div className="suc-row">
        <span>Temperature</span><span>{sensor.temperature?.toFixed(1)} °C (Ct = {sensor.Ct})</span>
      </div>
      <div className="suc-row">
        <span>Humidity</span><span>{sensor.humidity?.toFixed(1)}% (Ch = {sensor.Ch})</span>
      </div>
      <div className="suc-row">
        <span>Weight inflation</span><span>{sensor.weight_inflation_pct?.toFixed(2)}%</span>
      </div>
      <div className="suc-row">
        <span>Moisture removed</span><span>{sensor.moisture_removed_kg?.toFixed(3)} kg</span>
      </div>
    </div>
  );
}

export default function YieldEstimation({ defectPct, grade, readings, onYieldDone, onReset }) {
  const [weight, setWeight] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult]   = useState(null);
  const [error,  setError]    = useState(null);

  const averages = readings?.averages ?? {};

  async function estimate() {
    const w = parseFloat(weight);
    if (isNaN(w) || w <= 0) { setError('Please enter a valid batch weight.'); return; }
    setError(null);
    setLoading(true);
    try {
      const payload = {
        batch_weight_kg: w,
        defect_pct:      defectPct,
        moisture_pct:    averages.moisture,
        temperature:     averages.temperature,
        humidity:        averages.humidity,
      };
      const res  = await fetch(`${API_BASE}/yield`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(payload),
      });
      if (!res.ok) { const e = await res.json(); throw new Error(e.error || 'Server error'); }
      const data = await res.json();
      setResult(data);
      onYieldDone(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const gradeColour = { A: 'var(--green)', B: 'var(--gold)', C: '#ff8c00', D: 'var(--red)' };

  return (
    <div className="yield-estimation">

      <div className="section-header">
        <div className="section-badge" style={{ background:'rgba(120,120,255,0.1)', borderColor:'#7878ff' }}>04</div>
        <div>
          <h2 className="section-title">Yield Estimation</h2>
          <p className="section-desc">
            Enter the gross batch weight. The moisture-corrected silk yield will be calculated using the averaged sensor readings.
          </p>
        </div>
      </div>

      <div className="ye-layout">

        {/* Left: input + averaged sensor context */}
        <div className="ye-left">

          {/* Sensor averages summary */}
          <div className="avg-context">
            <div className="ac-label">Averaged sensor readings (from 5 captures)</div>
            <div className="ac-pills">
              <span className="ac-pill">
                🌡️ {averages.temperature?.toFixed(1) ?? '—'} °C
              </span>
              <span className="ac-pill">
                💧 {averages.humidity?.toFixed(1) ?? '—'} %
              </span>
              <span className="ac-pill ac-pill--accent">
                🌱 {averages.moisture?.toFixed(1) ?? '—'} % moisture
              </span>
              {grade && (
                <span className="ac-pill" style={{ color: gradeColour[grade] || 'var(--text)', borderColor: gradeColour[grade] || 'var(--border)' }}>
                  Grade {grade}
                </span>
              )}
            </div>
          </div>

          {/* Weight input */}
          <div className="weight-input-wrap">
            <label className="weight-label" htmlFor="batch-weight">Gross Batch Weight</label>
            <div className="weight-field">
              <input
                id="batch-weight"
                type="number"
                min="0.1"
                step="0.1"
                placeholder="e.g. 15.0"
                value={weight}
                onChange={e => setWeight(e.target.value)}
                className="weight-input"
              />
              <span className="weight-unit">kg</span>
            </div>
            {error && <p className="input-error">{error}</p>}
          </div>

          {/* Formula reference */}
          <div className="formula-card">
            <div className="fc-label">Formula applied</div>
            <div className="fc-formula">W<sub>final</sub> = W<sub>measured</sub> × (1 − M) × C<sub>t</sub> × C<sub>h</sub></div>
            <div className="fc-sub">Where M = moisture fraction, Ct = temperature factor, Ch = humidity factor</div>
          </div>

          <button
            className={`estimate-btn ${loading ? 'estimate-btn--loading' : ''}`}
            onClick={estimate}
            disabled={loading || !weight}
          >
            {loading ? (
              <>
                <svg className="btn-spin" width="18" height="18" viewBox="0 0 18 18" fill="none">
                  <circle cx="9" cy="9" r="7" stroke="currentColor" strokeWidth="2" strokeDasharray="44" strokeDashoffset="11"/>
                </svg>
                Calculating…
              </>
            ) : (
              <>
                Calculate Silk Yield
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                  <path d="M3 9h12M11 5l4 4-4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </>
            )}
          </button>
        </div>

        {/* Right: results */}
        <div className="ye-right">
          {!result ? (
            <div className="result-placeholder">
              <div className="rp-icon">⚗️</div>
              <p>Results will appear here after calculation.</p>
            </div>
          ) : (
            <div className="result-card">
              <div className="rc-header">
                <span>Yield Report</span>
                <span
                  className="rc-grade"
                  style={{ color: gradeColour[result.grade] || 'var(--text)' }}
                >
                  Grade {result.grade}
                </span>
              </div>

              <ResultRow label="Gross Batch Weight"   value={`${result.batch_weight_kg} kg`} />
              <ResultRow label="Effective Weight"     value={`${result.effective_weight_kg} kg`} />
              <ResultRow label="Silk Produced"        value={`${result.silk_produced_kg} kg`} accent large />
              <ResultRow label="Silk Yield Ratio"     value={`${result.silk_yield_ratio_pct}%`} />

              {result.improvement_kg > 0 && (
                <div className="improvement-note">
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path d="M7 2v10M3 6l4-4 4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  Reducing moisture could recover ~{result.improvement_kg} kg of silk
                </div>
              )}

              <SensorUsedCard sensor={result.sensor_used} />

              <button className="reset-btn" onClick={onReset}>
                ↩ New Analysis
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

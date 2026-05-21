import { useState } from 'react';
import { useSensor } from '../hooks/useSensor';
import './MoistureCapture.css';

const MAX_READINGS = 5;

const POSITION_LABELS = [
  'Top-left corner',
  'Top-right corner',
  'Centre of batch',
  'Bottom-left corner',
  'Bottom-right corner',
];

function avg(arr, key) {
  const vals = arr.map(r => r[key]).filter(v => v !== null && !isNaN(v));
  if (!vals.length) return null;
  return vals.reduce((a, b) => a + b, 0) / vals.length;
}

function MoistureStatusBadge({ status }) {
  const cls = {
    Dry:              'badge-dry',
    Normal:           'badge-normal',
    Moist:            'badge-moist',
    Wet:              'badge-wet',
    'Excess Moisture':'badge-excess',
  };
  return <span className={`m-badge ${cls[status] || 'badge-dry'}`}>{status || '—'}</span>;
}

export default function MoistureCapture({ onDone }) {
  const sensor    = useSensor(2000);
  const [readings, setReadings] = useState([]);
  const [capturing, setCapturing] = useState(false);

  const count    = readings.length;
  const done     = count >= MAX_READINGS;
  const nextPos  = POSITION_LABELS[count] || '';

  function capture() {
    if (done || !sensor.connected) return;
    setCapturing(true);
    setTimeout(() => {
      setReadings(prev => [
        ...prev,
        {
          id:          prev.length + 1,
          position:    POSITION_LABELS[prev.length],
          temperature: sensor.temperature,
          humidity:    sensor.humidity,
          moisture:    sensor.moisture,
          status:      sensor.moisture_status,
        },
      ]);
      setCapturing(false);
    }, 400); // brief visual feedback
  }

  function removeReading(id) {
    setReadings(prev => prev.filter(r => r.id !== id));
  }

  const avgTemp     = avg(readings, 'temperature');
  const avgHumidity = avg(readings, 'humidity');
  const avgMoisture = avg(readings, 'moisture');

  function proceed() {
    onDone({
      readings,
      averages: {
        temperature: avgTemp,
        humidity:    avgHumidity,
        moisture:    avgMoisture,
      },
    });
  }

  return (
    <div className="moisture-capture">

      <div className="section-header">
        <div className="section-badge" style={{ background:'rgba(255,200,66,0.12)', borderColor:'var(--gold)' }}>03</div>
        <div>
          <h2 className="section-title">5-Point Moisture Capture</h2>
          <p className="section-desc">
            Place the sensor at each position on the cocoon batch, then press Capture. Repeat for all 5 positions.
            The averaged readings will be used for yield estimation.
          </p>
        </div>
      </div>

      <div className="mc-layout">

        {/* Left: capture panel */}
        <div className="capture-panel">

          {/* Diagram of batch positions */}
          <div className="batch-diagram">
            <div className="bd-label">Batch positions</div>
            <div className="bd-grid">
              {POSITION_LABELS.map((pos, i) => {
                const captured = i < count;
                const next     = i === count;
                return (
                  <div
                    key={i}
                    className={`bd-cell ${captured ? 'bd-done' : ''} ${next ? 'bd-next' : ''}`}
                    title={pos}
                  >
                    {captured ? (
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                        <path d="M2.5 7L5.5 10L11.5 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    ) : (
                      <span>{i + 1}</span>
                    )}
                  </div>
                );
              })}
            </div>
            <div className="bd-progress">
              <div
                className="bd-progress-fill"
                style={{ width: `${(count / MAX_READINGS) * 100}%` }}
              />
            </div>
            <div className="bd-progress-label">{count} / {MAX_READINGS} captured</div>
          </div>

          {/* Live sensor readout */}
          <div className="live-readout">
            <div className="lr-header">
              <span className={`lr-dot ${sensor.connected ? 'lr-dot--live' : ''}`} />
              <span className="lr-title">Live sensor reading</span>
            </div>
            <div className="lr-values">
              <div className="lr-val">
                <span className="lr-num">{sensor.temperature !== null ? sensor.temperature.toFixed(1) : '—'}</span>
                <span className="lr-unit">°C</span>
                <span className="lr-lbl">Temperature</span>
              </div>
              <div className="lr-divider" />
              <div className="lr-val">
                <span className="lr-num">{sensor.humidity !== null ? sensor.humidity.toFixed(1) : '—'}</span>
                <span className="lr-unit">%</span>
                <span className="lr-lbl">Humidity</span>
              </div>
              <div className="lr-divider" />
              <div className="lr-val">
                <span className="lr-num">{sensor.moisture !== null ? sensor.moisture.toFixed(1) : '—'}</span>
                <span className="lr-unit">%</span>
                <span className="lr-lbl">Moisture</span>
              </div>
            </div>
            {sensor.moisture_status && (
              <div className="lr-status-row">
                Status: <MoistureStatusBadge status={sensor.moisture_status} />
              </div>
            )}
          </div>

          {/* Next position instruction */}
          {!done && (
            <div className="next-pos-hint">
              <div className="nph-num">{count + 1}</div>
              <div>
                <div className="nph-label">Next: {nextPos}</div>
                <div className="nph-sub">Place the sensor at this position, then press Capture</div>
              </div>
            </div>
          )}

          {/* Capture button */}
          <button
            className={`capture-btn ${done ? 'capture-btn--done' : ''} ${capturing ? 'capture-btn--capturing' : ''}`}
            onClick={capture}
            disabled={done || !sensor.connected || capturing}
          >
            {capturing ? (
              <>
                <svg className="capture-spin" width="18" height="18" viewBox="0 0 18 18" fill="none">
                  <circle cx="9" cy="9" r="7" stroke="currentColor" strokeWidth="2" strokeDasharray="44" strokeDashoffset="11"/>
                </svg>
                Capturing…
              </>
            ) : done ? (
              <>All 5 captured ✓</>
            ) : (
              <>
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                  <circle cx="9" cy="9" r="7" stroke="currentColor" strokeWidth="1.5"/>
                  <circle cx="9" cy="9" r="3" fill="currentColor"/>
                </svg>
                Capture Reading {count + 1} / 5
              </>
            )}
          </button>

          {!sensor.connected && (
            <p className="sensor-offline-note">⚠ ESP32 sensor offline — connect the sensor to capture readings.</p>
          )}
        </div>

        {/* Right: captured readings table */}
        <div className="readings-panel">
          <div className="rp-header">Captured Readings</div>

          {readings.length === 0 ? (
            <div className="rp-empty">No readings captured yet. Place sensor and press Capture.</div>
          ) : (
            <table className="readings-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Position</th>
                  <th>Temp (°C)</th>
                  <th>Humidity (%)</th>
                  <th>Moisture (%)</th>
                  <th>Status</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {readings.map(r => (
                  <tr key={r.id}>
                    <td className="td-num">{r.id}</td>
                    <td className="td-pos">{r.position}</td>
                    <td>{r.temperature?.toFixed(1) ?? '—'}</td>
                    <td>{r.humidity?.toFixed(1) ?? '—'}</td>
                    <td>{r.moisture?.toFixed(1) ?? '—'}</td>
                    <td><MoistureStatusBadge status={r.status} /></td>
                    <td>
                      <button className="rm-btn" onClick={() => removeReading(r.id)} title="Remove">✕</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {/* Average summary */}
          {done && (
            <div className="avg-summary">
              <div className="avg-title">5-Point Average</div>
              <div className="avg-row">
                <span className="avg-lbl">Avg. Temperature</span>
                <span className="avg-val">{avgTemp?.toFixed(2) ?? '—'} °C</span>
              </div>
              <div className="avg-row">
                <span className="avg-lbl">Avg. Humidity</span>
                <span className="avg-val">{avgHumidity?.toFixed(2) ?? '—'} %</span>
              </div>
              <div className="avg-row avg-row--accent">
                <span className="avg-lbl">Avg. Moisture</span>
                <span className="avg-val avg-val--accent">{avgMoisture?.toFixed(2) ?? '—'} %</span>
              </div>
              <p className="avg-note">
                These averaged values will be used to compute the moisture-corrected yield.
              </p>

              <button className="proceed-btn" onClick={proceed}>
                Proceed to Yield Estimation
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                  <path d="M3 9h12M11 5l4 4-4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

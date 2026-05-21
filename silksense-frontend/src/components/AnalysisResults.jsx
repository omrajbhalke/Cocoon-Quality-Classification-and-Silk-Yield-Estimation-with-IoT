import './AnalysisResults.css';

const API_BASE = '/api';

function StatCard({ label, value, sub, accent }) {
  return (
    <div className={`stat-card ${accent ? 'stat-card--accent' : ''}`}>
      <span className="stat-value">{value}</span>
      <span className="stat-label">{label}</span>
      {sub && <span className="stat-sub">{sub}</span>}
    </div>
  );
}

function DonutChart({ qualified, defective }) {
  const r   = 52;
  const cx  = 70;
  const cy  = 70;
  const circ = 2 * Math.PI * r;
  const qPct = Math.max(0, Math.min(100, Number(qualified)));
  const dPct = 100 - qPct;
  const qDash = (qPct / 100) * circ;
  const dDash = (dPct / 100) * circ;

  return (
    <svg viewBox="0 0 140 140" className="donut-svg">
      {/* Background ring */}
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="var(--border)" strokeWidth="14"/>
      {/* Qualified arc */}
      <circle
        cx={cx} cy={cy} r={r}
        fill="none"
        stroke="var(--green)"
        strokeWidth="14"
        strokeDasharray={`${qDash} ${circ}`}
        strokeLinecap="round"
        transform={`rotate(-90 ${cx} ${cy})`}
      />
      {/* Defective arc */}
      {dPct > 0 && (
        <circle
          cx={cx} cy={cy} r={r}
          fill="none"
          stroke="var(--red)"
          strokeWidth="14"
          strokeDasharray={`${dDash} ${circ}`}
          strokeDashoffset={-qDash}
          strokeLinecap="round"
          transform={`rotate(-90 ${cx} ${cy})`}
        />
      )}
      {/* Centre text */}
      <text x={cx} y={cy - 8} textAnchor="middle" className="donut-big">{Math.round(qPct)}%</text>
      <text x={cx} y={cy + 14} textAnchor="middle" className="donut-small">Qualified</text>
    </svg>
  );
}

function GradeBadge({ grade }) {
  const colours = { A: 'grade-a', B: 'grade-b', C: 'grade-c', D: 'grade-d' };
  return <span className={`grade-badge ${colours[grade] || ''}`}>{grade}</span>;
}

export default function AnalysisResults({ result, onProceed }) {
  const stats = result?.stats ?? {};
  const annotated = result?.image_url
    ? `${API_BASE}${result.image_url}`
    : null;

  // Backend returns keys produced in silksense-backend/app.py
  const total     = stats['Total Detections']         ?? '—';
  const qualified = stats['Qualified Cocoon Count']  ?? '—';
  const defective = stats['Defect Count']            ?? '—';
  const qPct      = parseFloat(stats['Qualified Cocoon %'] ?? 0);
  const dPct      = parseFloat(stats['Defect %']            ?? 0);
  const grade     = stats['Sample Grade']             ?? '—';
  const renditta  = stats['Est. Renditta']           ?? '—';

  return (
    <div className="analysis-results">

      <div className="section-header">
        <div className="section-badge" style={{ background:'rgba(0,229,160,0.12)', borderColor:'var(--green)' }}>02</div>
        <div>
          <h2 className="section-title">Quality Report</h2>
          <p className="section-desc">AI detection complete. Review results before proceeding to moisture capture.</p>
        </div>
      </div>

      <div className="results-layout">

        {/* Annotated image */}
        <div className="annotated-card">
          <div className="card-label">Annotated Output</div>
          {annotated ? (
            <img src={annotated} alt="Annotated cocoon detection" className="annotated-img" />
          ) : (
            <div className="annotated-placeholder">No annotated image returned</div>
          )}
          <div className="img-legend">
            <span className="leg-item"><span className="leg-dot leg-ok" />Qualified</span>
            <span className="leg-item"><span className="leg-dot leg-def" />Defective</span>
          </div>
        </div>

        {/* Right column */}
        <div className="metrics-col">

          {/* Donut + grade */}
          <div className="donut-card">
            <DonutChart qualified={qPct} defective={dPct} />
            <div className="donut-meta">
              <div className="grade-row">
                <span className="grade-label">Sample Grade</span>
                <GradeBadge grade={grade} />
              </div>
              <div className="donut-legend">
                <span className="dl-item"><span className="dl-dot dl-green"/>Qualified: {qPct.toFixed(1)}%</span>
                <span className="dl-item"><span className="dl-dot dl-red"/>Defective: {dPct.toFixed(1)}%</span>
              </div>
            </div>
          </div>

          {/* Stat cards */}
          <div className="stat-grid">
            <StatCard label="Total Detected" value={total}          />
            <StatCard label="Qualified"       value={qualified}      />
            <StatCard label="Defective"       value={defective}      />
            <StatCard label="Est. Renditta"   value={renditta} sub="kg silk / kg cocoon" accent />
          </div>

          {/* Defect breakdown if present */}
          {result?.defect_counts && Object.keys(result.defect_counts).length > 0 && (
            <div className="defect-breakdown">
              <div className="card-label">Defect Breakdown</div>
              {Object.entries(result.defect_counts).map(([type, count]) => (
                <div key={type} className="defect-row">
                  <span className="defect-name">{type}</span>
                  <span className="defect-count">{count}</span>
                </div>
              ))}
            </div>
          )}

          <button className="proceed-btn" onClick={onProceed}>
            Proceed to Moisture Capture
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M3 9h12M11 5l4 4-4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

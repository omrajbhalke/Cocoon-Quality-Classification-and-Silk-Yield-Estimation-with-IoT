import { useNavigate } from 'react-router-dom';
import './Cocoons.css';
import qualifiedImg from '../assets/qualified.jpg';
import doubleImg from '../assets/double.jpg';
import crushedImg from '../assets/crushed.jpg';
import decayedImg from '../assets/decayed.jpg';
import piercedImg from '../assets/pierced.jpg';
import yellowSpottedImg from '../assets/yellow-spotted.jpg';
import silkwormLifecycleImg from '../assets/silkworm-lifecycle.png';

const DEFECT_CARDS = [
  { title: 'Qualified Cocoon', description: 'Healthy, intact cocoon suitable for silk reeling; meets quality standards.', note: 'Selected for premium silk production.', image: qualifiedImg },
  { title: 'Double Cocoon', description: 'Two larvae spun together; produces uneven silk and difficult reeling.', note: 'Why disqualified: uneven thread and low reel quality.', image: doubleImg },
  { title: 'Crushed Cocoon', description: 'Shell damaged by pressure or mishandling; fiber continuity is broken.', note: 'Why disqualified: physical damage prevents consistent reeling.', image: crushedImg },
  { title: 'Decayed Cocoon', description: 'Rotten or fungus-infected cocoon; silk quality is severely degraded.', note: 'Why disqualified: decay weakens the fiber and lowers yield.', image: decayedImg },
  { title: 'Pierced Cocoon', description: 'Physical hole in the shell that destroys the fiber path.', note: 'Why disqualified: thread continuity is lost, making reeling impossible.', image: piercedImg },
  { title: 'Yellow-Spotted Cocoon', description: 'Discoloration from infection or moisture; damages fibre quality.', note: 'Why disqualified: spots indicate internal defects and weak silk.', image: yellowSpottedImg },
];

const GRADE_TABLE = [
  { grade: 'A', range: '≥ 90%', meaning: 'Premium batch — maximum silk yield' },
  { grade: 'B', range: '75–89%', meaning: 'Good batch — minor losses' },
  { grade: 'C', range: '60–74%', meaning: 'Acceptable batch — moderate correction needed' },
  { grade: 'D', range: '< 60%', meaning: 'Poor batch — significant waste' },
];

export default function Cocoons() {
  const navigate = useNavigate();

  return (
    <div className="cocoons-page">
      <section className="intro-card">
        <div>
          <span className="section-overline">What is a silk cocoon?</span>
          <h1>The cocoon is the foundation of raw silk quality.</h1>
          <p>Silkworms spin their cocoons from a single filament. Each cocoon is carefully graded so only the strongest, cleanest fibers are used for reeling.</p>
          <button className="btn-primary" onClick={() => navigate('/dashboard')}>Start Quality Assessment</button>
        </div>
        <div className="intro-visual">
          <div className="visual-placeholder">
            <img src={silkwormLifecycleImg} alt="Silkworm lifecycle" />
          </div>
          <p>Lifecycle: egg → larva → pupa → cocoon → silk moth</p>
        </div>
      </section>

      <section className="defect-grid-section">
        <div className="section-head">
          <span className="section-overline">Quality categories</span>
          <h2>Silk cocoon quality categories used in this study</h2>
        </div>
        <div className="defect-grid">
          {DEFECT_CARDS.map(card => (
            <article key={card.title} className="defect-card">
              {card.image && (
                <div className="defect-image">
                  <img src={card.image} alt={card.title} />
                </div>
              )}
              <h3>{card.title}</h3>
              <p>{card.description}</p>
              <div className="defect-note">{card.note}</div>
            </article>
          ))}
        </div>
      </section>

      <section className="grading-table-section">
        <div className="section-head">
          <span className="section-overline">Batch grading</span>
          <h2>Grade thresholds and meaning</h2>
        </div>
        <div className="grading-table-wrapper">
          <table className="grading-table">
            <thead>
              <tr><th>Grade</th><th>Qualified %</th><th>Meaning</th></tr>
            </thead>
            <tbody>
              {GRADE_TABLE.map(row => (
                <tr key={row.grade}>
                  <td>{row.grade}</td>
                  <td>{row.range}</td>
                  <td>{row.meaning}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="renditta-section">
        <div className="section-head">
          <span className="section-overline">Renditta explainer</span>
          <h2>Renditta measures cocoon efficiency.</h2>
        </div>
        <p>Renditta is the kg of raw cocoons required to produce 1 kg of raw silk. Good quality batches have lower renditta; defects increase waste and raise the required raw weight.</p>
        <div className="renditta-bar">
          <div className="renditta-item"><span>A</span><div className="renditta-fill" style={{ width: '92%', background: 'var(--green)' }}>8–9</div></div>
          <div className="renditta-item"><span>B</span><div className="renditta-fill" style={{ width: '74%', background: 'var(--gold)' }}>9–10</div></div>
          <div className="renditta-item"><span>C</span><div className="renditta-fill" style={{ width: '60%', background: '#ff8c00' }}>10–11</div></div>
          <div className="renditta-item"><span>D</span><div className="renditta-fill" style={{ width: '42%', background: 'var(--red)' }}>11–12+</div></div>
        </div>
      </section>

      <section className="moisture-effect-section">
        <div className="section-head">
          <span className="section-overline">Moisture effect</span>
          <h2>Humidity and temperature change raw weight interpretation.</h2>
        </div>
        <table className="moisture-effect-table">
          <thead>
            <tr><th>Moisture %</th><th>RH%</th><th>Temperature</th><th>Weight Effect</th></tr>
          </thead>
          <tbody>
            <tr><td>5%</td><td>60%</td><td>25°C</td><td>Minimal</td></tr>
            <tr><td>10%</td><td>70%</td><td>25°C</td><td>Slight Increase</td></tr>
            <tr><td>15%</td><td>80%</td><td>24°C</td><td>Moderate Increase</td></tr>
            <tr><td>20%</td><td>85%</td><td>22°C</td><td>High False Weight</td></tr>
            <tr><td>25%</td><td>90%</td><td>20°C</td><td>Severe Inflation</td></tr>
          </tbody>
        </table>
      </section>
    </div>
  );
}

import { useState, useRef } from 'react';
import SensorStrip from '../components/SensorStrip';
import ImageInput from '../components/ImageInput';
import AnalysisResults from '../components/AnalysisResults';
import MoistureCapture from '../components/MoistureCapture';
import YieldEstimation from '../components/YieldEstimation';
import './Dashboard.css';

const STEPS = [
  { id: 1, label: 'Image Input',      desc: 'Upload or scan from mobile' },
  { id: 2, label: 'Analysis',         desc: 'AI detection & grading'     },
  { id: 3, label: 'Moisture Capture', desc: '5-point sensor readings'     },
  { id: 4, label: 'Yield Estimation', desc: 'Corrected silk output'       },
];

export default function Dashboard() {
  const [activeStep, setActiveStep]   = useState(1);
  const [imageFile,  setImageFile]    = useState(null);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [readings,   setReadings]     = useState([]);   // up to 5 captured sensor snapshots
  const [yieldResult, setYieldResult] = useState(null);

  const stepsRef = useRef(null);

  function advanceTo(step) {
    setActiveStep(step);
    setTimeout(() => {
      stepsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 80);
  }

  function handleImageReady(file) {
    setImageFile(file);
  }

  function handleAnalysisDone(result) {
    setAnalysisResult(result);
    advanceTo(2);
  }

  function handleReadingsDone(capturedReadings) {
    setReadings(capturedReadings);
    advanceTo(4);
  }

  function handleYieldDone(result) {
    setYieldResult(result);
  }

  function resetAll() {
    setActiveStep(1);
    setImageFile(null);
    setAnalysisResult(null);
    setReadings([]);
    setYieldResult(null);
  }

  const defectPct = analysisResult?.stats?.['Defect %'] ?? 0;
  const grade     = analysisResult?.stats?.['Sample Grade'] ?? null;

  return (
    <div className="dashboard-page">

      {/* Always-visible live sensor strip at the top */}
      <SensorStrip />

      {/* Step progress bar */}
      <div className="step-bar" ref={stepsRef}>
        {STEPS.map((s, i) => (
          <div
            key={s.id}
            className={[
              'step-item',
              activeStep === s.id  ? 'step-active'    : '',
              activeStep >  s.id   ? 'step-done'      : '',
              activeStep <  s.id   ? 'step-locked'    : '',
            ].join(' ')}
          >
            <div className="step-circle">
              {activeStep > s.id
                ? <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path d="M2.5 7L5.5 10L11.5 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                : <span>{String(s.id).padStart(2, '0')}</span>
              }
            </div>
            <div className="step-text">
              <span className="step-label">{s.label}</span>
              <span className="step-desc">{s.desc}</span>
            </div>
            {i < STEPS.length - 1 && <div className="step-connector" />}
          </div>
        ))}
      </div>

      {/* Step content panels */}
      <div className="dashboard-content">

        {/* ── Step 1: Image Input ── */}
        {activeStep === 1 && (
          <ImageInput
            imageFile={imageFile}
            onImageReady={handleImageReady}
            onAnalysisDone={handleAnalysisDone}
          />
        )}

        {/* ── Step 2: Analysis Results ── */}
        {activeStep === 2 && (
          <AnalysisResults
            result={analysisResult}
            onProceed={() => advanceTo(3)}
          />
        )}

        {/* ── Step 3: 5-point moisture capture ── */}
        {activeStep === 3 && (
          <MoistureCapture
            onDone={handleReadingsDone}
          />
        )}

        {/* ── Step 4: Yield estimation ── */}
        {activeStep === 4 && (
          <YieldEstimation
            defectPct={defectPct}
            grade={grade}
            readings={readings}
            yieldResult={yieldResult}
            onYieldDone={handleYieldDone}
            onReset={resetAll}
          />
        )}

      </div>
    </div>
  );
}

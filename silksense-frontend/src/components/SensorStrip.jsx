import { useSensor } from '../hooks/useSensor';
import './SensorStrip.css';

function Tile({ icon, label, value, unit }) {
  return (
    <div className="ss-tile">
      <span className="ss-icon">{icon}</span>
      <div className="ss-body">
        <span className="ss-label">{label}</span>
        <span className="ss-value">
          {value !== null ? `${Number(value).toFixed(1)}${unit}` : '—'}
        </span>
      </div>
    </div>
  );
}

function StatusBadge({ status }) {
  const colorMap = {
    Dry:              'badge-dry',
    Normal:           'badge-normal',
    Moist:            'badge-moist',
    Wet:              'badge-wet',
    'Excess Moisture':'badge-excess',
  };
  return (
    <div className="ss-tile">
      <span className="ss-icon">📊</span>
      <div className="ss-body">
        <span className="ss-label">Status</span>
        {status
          ? <span className={`ss-status-badge ${colorMap[status] || ''}`}>{status}</span>
          : <span className="ss-value">—</span>
        }
      </div>
    </div>
  );
}

export default function SensorStrip() {
  const sensor = useSensor(5000);

  return (
    <div className="sensor-strip">
      <div className="ss-left">
        <div className={`ss-dot ${sensor.connected ? 'ss-dot--live' : ''}`} />
        <span className="ss-live-label">
          {sensor.connected ? 'ESP32 Live' : 'Sensor Offline'}
        </span>
      </div>

      <div className="ss-tiles">
        <Tile icon="🌡️" label="Temperature" value={sensor.temperature} unit=" °C" />
        <div className="ss-divider" />
        <Tile icon="💧" label="Humidity"    value={sensor.humidity}    unit=" %"  />
        <div className="ss-divider" />
        <Tile icon="🌱" label="Moisture"    value={sensor.moisture}    unit=" %"  />
        <div className="ss-divider" />
        <StatusBadge status={sensor.moisture_status} />
      </div>
    </div>
  );
}

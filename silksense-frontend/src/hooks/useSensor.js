import { useState, useEffect } from 'react';

const API_BASE = '/api';

const DEFAULT = {
  temperature: null,
  humidity: null,
  moisture: null,
  moisture_status: null,
  timestamp: null,
  connected: false,
};

export function useSensor(intervalMs = 5000) {
  const [data, setData] = useState(DEFAULT);

  async function fetchLatest() {
    try {
      const res  = await fetch(`${API_BASE}/sensor/latest`);
      if (!res.ok) throw new Error('bad response');
      const json = await res.json();
      setData({ ...json, connected: !!json.timestamp });
    } catch {
      setData(prev => ({ ...prev, connected: false }));
    }
  }

  useEffect(() => {
    fetchLatest();
    const id = setInterval(fetchLatest, intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);

  return data;
}

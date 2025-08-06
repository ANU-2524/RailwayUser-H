'use client';

import React, { useState } from 'react';
import { cardStyle, sectionTitleStyle } from '../styles/commonStyles';

interface SensorData {
  temperature: number;
  vibration: number;
  speed: number;
}

interface AnomalyResult {
  index: number;
  temperature: number;
  vibration: number;
  speed: number;
  anomaly: boolean;
  score: number;
}

export default function Predictor() {
  const [sensorData, setSensorData] = useState<SensorData>({
    temperature: 25,
    vibration: 0.1,
    speed: 70,
  });
  const [results, setResults] = useState<AnomalyResult[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSensorData((prev) => ({
      ...prev,
      [name]: Number(value),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResults(null);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/predict`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify([sensorData]),
        }
      );
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      setResults(data.anomalies);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch prediction');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section style={cardStyle}>
      <h2 style={sectionTitleStyle}>Predict Fault from Sensor Data</h2>
      <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', alignItems: 'center', marginBottom: '1.5rem' }}>
        <label>
          Temperature (°C):
          <input
            type="number"
            name="temperature"
            step="0.1"
            value={sensorData.temperature}
            onChange={handleChange}
            required
            style={{ marginLeft: '0.5rem', width: '5rem' }}
          />
        </label>
        <label>
          Vibration:
          <input
            type="number"
            name="vibration"
            step="0.01"
            value={sensorData.vibration}
            onChange={handleChange}
            required
            style={{ marginLeft: '0.5rem', width: '5rem' }}
          />
        </label>
        <label>
          Speed (km/hr):
          <input
            type="number"
            name="speed"
            step="0.1"
            value={sensorData.speed}
            onChange={handleChange}
            required
            style={{ marginLeft: '0.5rem', width: '5rem' }}
          />
        </label>
        <button type="submit" disabled={loading} style={{ padding: '0.5rem 1.5rem' }}>
          {loading ? 'Predicting...' : 'Predict'}
        </button>
      </form>
      {error && <p style={{ color: 'red' }}>Error: {error}</p>}
      {results && (
        <div>
          <h3 style={{ margin: '1rem 0 0.5rem 0', color: '#2563eb' }}>Prediction Results</h3>
          {results.length === 0 && <p>No anomalies detected.</p>}
          {results.map((res) => (
            <div
              key={res.index}
              style={{
                marginBottom: '1rem',
                background: res.anomaly ? '#fff7f7' : '#eef7ee',
                border: `2px solid ${res.anomaly ? '#d32f2f' : '#4caf50'}`,
                borderRadius: 8,
                padding: '0.9rem 1.2rem',
              }}
            >
              <div>
                <b style={{ color: res.anomaly ? '#d32f2f' : '#388e3c' }}>
                  {res.anomaly ? '⚠️ Anomaly' : 'All clear'}
                </b>
                <span> — Score: {(res.score * 100).toFixed(2)}%</span>
              </div>
              <div><b>Temperature:</b> {res.temperature} °C</div>
              <div><b>Vibration:</b> {res.vibration}</div>
              <div><b>Speed:</b> {res.speed} km/hr</div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

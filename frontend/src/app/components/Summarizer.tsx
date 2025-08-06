'use client';

import React, { useState } from 'react';
import { cardStyle, sectionTitleStyle } from '../styles/commonStyles';

interface SensorData {
  temperature: number;
  vibration: number;
  speed: number;
}

export default function Summarizer() {
  const [data, setData] = useState<SensorData[]>([
    { temperature: 25, vibration: 0.1, speed: 70 },
  ]);
  const [summary, setSummary] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (i: number, field: keyof SensorData, value: number) => {
    setData((prev) =>
      prev.map((row, idx) => (idx === i ? { ...row, [field]: value } : row))
    );
  };

  const addRow = () =>
    setData((prev) => [...prev, { temperature: 25, vibration: 0.1, speed: 70 }]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSummary(null);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/summarize`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error(`Server error: ${res.status}`);
      const json = await res.json();
      setSummary(json.summary || 'No summary returned.');
    } catch (err: any) {
      setError(err.message || 'Failed to fetch summary.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section style={cardStyle}>
      <h2 style={sectionTitleStyle}>Summarize Sensor Data</h2>
      <form onSubmit={handleSubmit} style={{ marginBottom: '1rem' }}>
        {data.map((row, i) => (
          <div
            key={i}
            style={{
              display: 'flex',
              gap: '1rem',
              marginBottom: '0.75rem',
              alignItems: 'center',
              flexWrap: 'wrap',
            }}
          >
            <label style={{ flex: '1 1 150px' }}>
              Temperature:
              <input
                type="number"
                step="0.1"
                value={row.temperature}
                onChange={(e) =>
                  handleChange(i, 'temperature', Number(e.target.value))
                }
                required
                style={{ marginLeft: '0.25rem', width: '100%' }}
              />
            </label>
            <label style={{ flex: '1 1 150px' }}>
              Vibration:
              <input
                type="number"
                step="0.01"
                value={row.vibration}
                onChange={(e) =>
                  handleChange(i, 'vibration', Number(e.target.value))
                }
                required
                style={{ marginLeft: '0.25rem', width: '100%' }}
              />
            </label>
            <label style={{ flex: '1 1 150px' }}>
              Speed:
              <input
                type="number"
                step="0.1"
                value={row.speed}
                onChange={(e) =>
                  handleChange(i, 'speed', Number(e.target.value))
                }
                required
                style={{ marginLeft: '0.25rem', width: '100%' }}
              />
            </label>
          </div>
        ))}
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={addRow}
            style={{
              backgroundColor: '#2563eb',
              color: '#fff',
              padding: '0.5rem 1rem',
              borderRadius: 6,
              cursor: 'pointer',
              border: 'none',
              flex: '1 1 150px',
            }}
            disabled={loading}
          >
            Add Row
          </button>
          <button
            type="submit"
            disabled={loading}
            style={{
              backgroundColor: '#4caf50',
              color: '#fff',
              padding: '0.5rem 1rem',
              borderRadius: 6,
              cursor: loading ? 'default' : 'pointer',
              border: 'none',
              flex: '1 1 150px',
            }}
          >
            {loading ? 'Summarizing...' : 'Summarize'}
          </button>
        </div>
      </form>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {summary && (
        <div
          style={{
            marginTop: 16,
            backgroundColor: '#e0f2fe',
            padding: '1rem',
            borderRadius: 8,
            color: '#0369a1',
            fontWeight: 'bold',
          }}
        >
          <b>Summary:</b> {summary}
        </div>
      )}
    </section>
  );
}

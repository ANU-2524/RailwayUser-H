'use client';

import React, { useEffect, useState } from 'react';
import { cardStyle, sectionTitleStyle } from '../styles/commonStyles';

interface SensorData {
  temperature: string;
  vibration: string;
  speed: string;
  timestamp: string;
}

export default function LiveMetrics() {
  const [data, setData] = useState<SensorData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const socket = new WebSocket('wss://railwayuser-h-5.onrender.com');

    socket.onmessage = (event) => {
      try {
        setData(JSON.parse(event.data));
        setError(null);
      } catch {
        setError('Invalid data received');
      }
    };

    socket.onerror = () => {
      setError('WebSocket error');
    };

    return () => socket.close();
  }, []);

  return (
    <section style={cardStyle}>
      <h2 style={sectionTitleStyle}>Live Metrics</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}

      {data ? (
        <div style={{ lineHeight: 1.5 }}>
          <p><strong>Temperature:</strong> {data.temperature} °C</p>
          <p><strong>Vibration:</strong> {data.vibration}</p>
          <p><strong>Speed:</strong> {data.speed} km/hr</p>
          <small style={{ color: '#718096' }}>
            {new Date(data.timestamp).toLocaleString()}
          </small>
        </div>
      ) : (
        <p>Waiting for live sensor data...</p>
      )}
    </section>
  );
}

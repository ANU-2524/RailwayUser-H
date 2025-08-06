'use client';
import React, { useEffect, useState } from 'react';
import {
  LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, ReferenceLine
} from 'recharts';
import { cardStyle, sectionTitleStyle } from '../styles/commonStyles';

interface Metric {
  timestamp: string;
  temperature: number;
  vibration: number;
  speed: number;
}

export default function MetricsChart() {
  const [history, setHistory] = useState<Metric[]>([]);

  useEffect(() => {
    const socket = new WebSocket('ws://localhost:8080');
    socket.onmessage = (event) => {
      const metric = JSON.parse(event.data);
      setHistory(prev => [...prev.slice(-29), {
        timestamp: metric.timestamp,
        temperature: Number(metric.temperature),
        vibration: Number(metric.vibration),
        speed: Number(metric.speed)
      }]);
    };
    return () => socket.close();
  }, []);

  return (
    <section style={cardStyle}>
      <h2 style={sectionTitleStyle}>Live Sensor Data Chart</h2>
      <ResponsiveContainer width="100%" height={260}>
        <LineChart data={history}>
          <XAxis dataKey="timestamp" hide={true} />
          <YAxis />
          <Tooltip />
          <Legend />
          <ReferenceLine y={60} stroke="#e53e3e" strokeDasharray="3 3" label="Temp Danger" />
          <Line type="monotone" dataKey="temperature" stroke="#ef4444" dot={false} name="Temperature (°C)" />
          <Line type="monotone" dataKey="vibration" stroke="#0ea5e9" dot={false} name="Vibration" />
          <Line type="monotone" dataKey="speed" stroke="#4caf50" dot={false} name="Speed (km/hr)" />
        </LineChart>
      </ResponsiveContainer>
      <small style={{ color: '#e53e3e', fontWeight: 'bold' }}>Red dashed line = temperature danger threshold</small>
    </section>
  );
}

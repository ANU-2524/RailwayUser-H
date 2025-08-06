'use client';
import React, { useEffect, useState } from 'react';
import { cardStyle, sectionTitleStyle } from '../styles/commonStyles';

interface Alert {
  message: string;
  time: string;
  severity: string;
}

function severityColor(severity: string) {
  switch (severity.toLowerCase()) {
    case 'high': return '#e53e3e'; // red
    case 'medium': return '#d69e2e'; // orange
    case 'low': return '#38a169'; // green
    default: return '#718096'; // gray
  }
}

export default function AlertFeed() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAlerts() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/alerts`);
        const data = await res.json();
        if (Array.isArray(data)) {
          setAlerts(data);
        } else {
          setAlerts([]);
          setError("Unexpected response format from server.");
        }
      } catch (err) {
        setError("Failed to fetch alerts.");
        setAlerts([]);
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchAlerts();
  }, []);

  return (
    <section style={cardStyle}>
      <h2 style={sectionTitleStyle}>Alert Feed</h2>
      {loading ? (
        <p>Loading alerts...</p>
      ) : error ? (
        <p style={{ color: 'red' }}>{error}</p>
      ) : alerts.length === 0 ? (
        <p>No alerts yet</p>
      ) : (
        <ul style={{ listStyle: 'none', paddingLeft: 0 }}>
          {alerts.map((alert, idx) => (
            <li key={idx} style={{ marginBottom: '1em', borderLeft: `6px solid ${severityColor(alert.severity)}`, paddingLeft: '0.75rem' }}>
              <strong style={{ color: severityColor(alert.severity), textTransform: 'capitalize' }}>{alert.severity}</strong>: {alert.message} <br />
              <small style={{ color: '#718096' }}>{new Date(alert.time).toLocaleString()}</small>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

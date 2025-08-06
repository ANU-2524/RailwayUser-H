'use client';

import React, { useState } from 'react';
import { cardStyle, sectionTitleStyle } from '../styles/commonStyles';

function getUrgencyColor(score: number) {
  if (score >= 0.85) return '#e53e3e';
  if (score >= 0.6) return '#d69e2e';
  return '#22c55e';
}

interface ReportParserProps {
  onPrefillLog?: (logData: {
    date: string;
    zone: string;
    description: string;
    engineer: string;
  }) => void;
}

export default function ReportParser({ onPrefillLog }: ReportParserProps) {
  const [text, setText] = useState('');
  const [parsed, setParsed] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setParsed(null);

    try {
      const resp = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/parse-report`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ report: text }),
      });
      if (!resp.ok) throw new Error('Server error: ' + resp.status);
      const data = await resp.json();
      setParsed(data);
    } catch (err: any) {
      setError(err.message || 'Failed to analyze report.');
    }
    setLoading(false);
  };

  const prefillLog = () => {
    if (!parsed) return;
    onPrefillLog?.({
      date: new Date().toISOString().slice(0,10),
      zone: parsed.extracted_entities?.find((e: string) => /zone/i.test(e)) || '',
      description: parsed.summary || text,
      engineer: '',
    });
  };

  return (
    <section style={cardStyle}>
      <h2 style={sectionTitleStyle}>Operator Report NLP</h2>
      <form onSubmit={handleSubmit} style={{ marginBottom: '1rem' }}>
        <textarea
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder="Paste inspection report or shift note here"
          rows={5}
          style={{
            width: '100%',
            maxWidth: 500,
            padding: '0.5rem',
            borderRadius: 8,
            borderColor: '#ccc',
            fontSize: '1rem',
            fontFamily: 'inherit',
          }}
          required
        />
        <br />
        <button
          type="submit"
          disabled={loading || !text.trim()}
          style={{
            marginTop: '0.75rem',
            padding: '0.5rem 1.5rem',
            backgroundColor: '#2563eb',
            color: '#fff',
            border: 'none',
            borderRadius: 6,
            cursor: loading || !text.trim() ? 'not-allowed' : 'pointer',
          }}
        >
          {loading ? 'Parsing...' : 'Parse Report'}
        </button>
      </form>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {parsed && (
        <div
          style={{
            backgroundColor: '#e0f2fe',
            padding: '1rem',
            borderRadius: 8,
            color: '#0369a1',
            fontWeight: '500',
          }}
        >
          <div style={{
            fontWeight: 700, fontSize: 18, marginBottom: 6,
            color: parsed.urgency_score >= 0.85 ? '#e53e3e'
              : parsed.urgency_score >= 0.6 ? '#d69e2e'
              : '#0369a1'
          }}>
            Summary: {parsed.summary}
          </div>
          <div style={{ marginBottom: 6 }}>
            <b>Urgency:</b>
            <span style={{
              fontWeight: 600,
              color: getUrgencyColor(parsed.urgency_score ?? 0),
              marginLeft: 6,
            }}>
              {parsed.urgency_score !== undefined
                ? `${Math.round(parsed.urgency_score * 100)}%`
                : '—'}
            </span>
          </div>
          <div>
            <b>Entities:</b> {parsed.extracted_entities?.length > 0
              ? parsed.extracted_entities.join(', ')
              : 'None found'}
          </div>
          {parsed.suggested_actions?.length > 0 ? (
            <ul style={{ marginTop: 6 }}>
              {parsed.suggested_actions.map((a: string, i: number) => (
                <li key={i}>{a}</li>
              ))}
            </ul>
          ) : (
            <div style={{ marginTop: 6, color: '#555' }}>
              No explicit actions suggested.
            </div>
          )}
          {onPrefillLog && (
            <button
              onClick={prefillLog}
              style={{
                marginTop: 10,
                padding: '0.5rem 1.2rem',
                backgroundColor: '#2563eb',
                color: '#fff',
                border: 'none',
                borderRadius: 6,
                cursor: 'pointer',
                fontWeight: 600,
              }}
            >
              Create Maintenance Log from Report
            </button>
          )}
        </div>
      )}
    </section>
  );
}

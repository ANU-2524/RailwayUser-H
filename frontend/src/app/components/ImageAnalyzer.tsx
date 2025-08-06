'use client';
import React, { useState, ChangeEvent } from 'react';
import { cardStyle, sectionTitleStyle } from '../styles/commonStyles';

export default function ImageAnalyzer() {
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<{ defect_probability: number; defect_type: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFile(e.target.files && e.target.files[0] ? e.target.files[0] : null);
    setResult(null);
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    setLoading(true);
    setError(null);
    setResult(null);

    const formData = new FormData();
    formData.append('image', file);

    try {
      const resp = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/analyze-image`, {
        method: 'POST',
        body: formData,
      });
      const data = await resp.json();
      setResult(data);
    } catch (err) {
      setError('Failed to analyze image');
    }
    setLoading(false);
  };

  return (
    <section style={cardStyle}>
      <h2 style={sectionTitleStyle}>Analyze Rail Track Image for Defects</h2>
      <form onSubmit={handleSubmit} style={{ marginBottom: '1rem' }}>
        <input type="file" accept="image/*" onChange={handleFileChange} required />
        <button type="submit" disabled={loading || !file} style={{ marginLeft: '1rem', padding: '0.5rem 1rem' }}>
          {loading ? 'Analyzing...' : 'Analyze'}
        </button>
      </form>
      {error && <div style={{ color: 'red' }}>{error}</div>}
{result && (
  <div style={{ marginTop: 10 }}>
    <b>Defect Probability:</b> {
      typeof result.defect_probability === 'number' && !isNaN(result.defect_probability)
        ? (result.defect_probability * 100).toFixed(2) + '%'
        : 'Could not analyze'
    }<br />
    <b>Defect Type:</b> {
      result.defect_type || 'No defect detected'
    }
    {result.defect_type && result.defect_type.includes("Obstruction") && (
      <div style={{ color: '#e53e3e', fontWeight: 700 }}>
        Warning: Obstruction detected! Flag for urgent attention.
      </div>
    )}
    {result.defect_type && result.defect_type.includes("No defect") && (
      <div style={{ color: '#22c55e' }}>
        Track appears clear.
      </div>
    )}
    {result.defect_type && result.defect_type.includes("Image unclear") && (
      <div style={{ color: '#d69e2e' }}>
        Could not analyze: Try a clearer, unobstructed rail track image.
      </div>
    )}
  </div>
)}


    </section>
  );
}

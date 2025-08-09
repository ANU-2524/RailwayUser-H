'use client';
import React, { useState } from 'react';

import AlertFeed from './components/AlertFeed';
import LiveMetrics from './components/LiveMetrics';
import MetricsChart from './components/MetricsChart';
import MaintenanceLogs from './components/MaintenanceLogs';
import Predictor from './components/Predictor';
import Summarizer from './components/Summarizer';
import ImageAnalyzer from './components/ImageAnalyzer';
import ReportParser from './components/ReportParser';
import ChatBot from './components/ChatBot';

interface LogData {
  date: string;
  zone: string;
  description: string;
  engineer: string;
}

export default function Home() {
  const [prefillData, setPrefillData] = useState<LogData | null>(null);

  const pageStyle: React.CSSProperties = {
    padding: '2rem',
    maxWidth: 1100,
    margin: 'auto',
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    color: '#222',
    userSelect: 'none',
  };

  const headerStyle: React.CSSProperties = {
    textAlign: 'center',
    letterSpacing: 2,
    marginBottom: 40,
    fontWeight: 700,
    fontSize: '2.75rem',
    color: '#0f172a',
    textShadow: '0 2px 4px rgb(59 130 246 / 0.4)', // subtle blue glow
  };

  const sectionWrapper: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '1.5rem',
    marginBottom: '2rem',
  };

  const fullWidthSection: React.CSSProperties = {
    marginBottom: '2rem',
    maxWidth: '100%',
  };

  const cardStyle: React.CSSProperties = {
    background: 'linear-gradient(135deg, #e0eaff, #f7faff)',
    padding: '1.3rem 1.8rem',
    borderRadius: 14,
    boxShadow: '0 6px 15px rgb(59 130 246 / 0.15)',
    transition: 'transform 0.3s ease, box-shadow 0.3s ease',
  };

  const cardHover: React.CSSProperties = {
    transform: 'translateY(-4px)',
    boxShadow: '0 10px 30px rgb(59 130 246 / 0.3)',
  };

  // State to handle card hover effects if you want, else static cards

  return (
    <main style={pageStyle}>
      <h1 style={headerStyle}>
        RailVisionAI Dashboard
      </h1>

      {/* Top row: Alerts + Live Metrics */}
      <div style={sectionWrapper}>
        <div style={{ ...cardStyle }}>
          <AlertFeed />
        </div>
        <div style={{ ...cardStyle }}>
          <LiveMetrics />
        </div>
      </div>

      {/* Middle row: Predictor + Summarizer */}
      <div style={sectionWrapper}>
        <div style={{ ...cardStyle }}>
          <Predictor />
        </div>
        <div style={{ ...cardStyle }}>
          <Summarizer />
        </div>
      </div>
      
  <div style={{
    ...fullWidthSection,
    ...cardStyle,
    border: '2px solid #3b82f6',
    background: 'linear-gradient(135deg, #dbeafe, #eff6ff)', // lighter blue bg
  }}>
    <ChatBot />
  </div>

      {/* Full width: Metrics Chart */}
      <div style={{ ...fullWidthSection, ...cardStyle }}>
        <MetricsChart />
      </div>

      {/* Next section: Image Analyzer + Report Parser side-by-side */}
      <div style={sectionWrapper}>
        <div style={{ ...cardStyle }}>
          <ImageAnalyzer />
        </div>
        <div style={{ ...cardStyle }}>
          <ReportParser onPrefillLog={setPrefillData} />
        </div>
      </div>

      {/* Maintenance Logs full width */}
      <div style={{ ...fullWidthSection, ...cardStyle }}>
        <MaintenanceLogs prefillData={prefillData} setPrefillData={setPrefillData} />
      </div>

      {/* ChatBot full width with a highlight border */}

    </main>
  );
}

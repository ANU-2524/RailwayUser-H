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

export default function Home() {
  // State to hold AI-prefilled maintenance log data (from NLP Report Parser)
  const [prefillData, setPrefillData] = useState(null);

  return (
    <main style={{ padding: '2rem', maxWidth: 900, margin: 'auto' }}>
      <h1 style={{ textAlign: 'center', letterSpacing: 1, marginBottom: 32 }}>
        RailVisionAI Dashboard
      </h1>
      <AlertFeed />
      <Summarizer />
      <Predictor />
      <ImageAnalyzer />
      <ReportParser onPrefillLog={setPrefillData} />
<MaintenanceLogs prefillData={prefillData} setPrefillData={setPrefillData} />
      <LiveMetrics />
      <MetricsChart />
    </main>
  );
}

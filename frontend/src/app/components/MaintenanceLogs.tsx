'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { cardStyle, sectionTitleStyle } from '../styles/commonStyles';

interface Log {
  id: number;
  date: string; // ISO string date
  zone: string;
  description: string;
  engineer: string;
}

interface MaintenanceLogsProps {
  prefillData?: {
    date?: string;
    zone?: string;
    description?: string;
    engineer?: string;
  } | null;
  setPrefillData?: (data: null) => void;
}

export default function MaintenanceLogs({ prefillData, setPrefillData }: MaintenanceLogsProps) {
  const [logs, setLogs] = useState<Log[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastFetched, setLastFetched] = useState<Date | null>(null);

  // State for creating new logs (form)
  const [newLog, setNewLog] = useState({
    date: '',
    zone: '',
    description: '',
    engineer: '',
  });
  const [adding, setAdding] = useState(false);

  // Prefill form when prefillData changes
  useEffect(() => {
    if (
      prefillData &&
      (prefillData.date || prefillData.zone || prefillData.description || prefillData.engineer)
    ) {
      setNewLog({
        date: prefillData.date || '',
        zone: prefillData.zone || '',
        description: prefillData.description || '',
        engineer: prefillData.engineer || '',
      });
    }
  }, [prefillData]);

  // States for editing logs
  const [editLogId, setEditLogId] = useState<number | null>(null);
  const [editLogData, setEditLogData] = useState<Partial<Log>>({});
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  // Fetch logs function with useCallback for stable reference
  const fetchLogs = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/logs`);
      if (!res.ok) throw new Error(`Failed to fetch logs (Status: ${res.status})`);
      const data = await res.json();
      setLogs(data);
      setLastFetched(new Date());
    } catch (err: any) {
      setError(err.message || 'Error fetching logs');
      setLogs([]);
      setLastFetched(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  // Handle new log form submission
  const handleNewLogSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdding(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/logs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newLog),
      });
      if (!res.ok) throw new Error('Failed to create log');
      setNewLog({ date: '', zone: '', description: '', engineer: '' });
      await fetchLogs();

      // Clear the prefillData once submitted
      if (typeof prefillData !== 'undefined' && setPrefillData) {
        setPrefillData(null);
      }
    } catch (error: any) {
      alert('Error adding log: ' + (error.message || error));
    }
    setAdding(false);
  };

  // Handle saving edited log
  const handleSaveEdit = async () => {
    if (editLogId === null) return;
    setSaving(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/logs/${editLogId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editLogData),
      });
      if (!res.ok) throw new Error('Failed to update log');
      setEditLogId(null);
      setEditLogData({});
      await fetchLogs();
    } catch (error: any) {
      alert('Error updating log: ' + (error.message || error));
    }
    setSaving(false);
  };

  // Handle deleting a log
  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this log?')) return;
    setDeletingId(id);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/logs/${id}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Failed to delete log');
      await fetchLogs();
    } catch (error: any) {
      alert('Error deleting log: ' + (error.message || error));
    }
    setDeletingId(null);
  };

  return (
    <section style={cardStyle} aria-label="Maintenance Logs Section">
      <h2 style={sectionTitleStyle}>Maintenance Logs</h2>

      {/* New Log Form */}
      <form
        onSubmit={handleNewLogSubmit}
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '0.5rem',
          marginBottom: '1.2rem',
          alignItems: 'center',
          background: '#f1f5f9',
          padding: '1rem',
          borderRadius: 10,
          boxShadow: '0 1px 3px #e0e6ed',
        }}
      >
        <input
          type="date"
          required
          value={newLog.date}
          onChange={e => setNewLog(l => ({ ...l, date: e.target.value }))}
          style={{ flex: '1 1 120px' }}
        />
        <input
          type="text"
          required
          placeholder="Zone"
          value={newLog.zone}
          onChange={e => setNewLog(l => ({ ...l, zone: e.target.value }))}
          style={{ flex: '1 1 100px' }}
        />
        <input
          type="text"
          required
          placeholder="Description"
          value={newLog.description}
          onChange={e => setNewLog(l => ({ ...l, description: e.target.value }))}
          style={{ flex: '2 1 220px' }}
        />
        <input
          type="text"
          required
          placeholder="Engineer"
          value={newLog.engineer}
          onChange={e => setNewLog(l => ({ ...l, engineer: e.target.value }))}
          style={{ flex: '1 1 120px' }}
        />
        <button
          type="submit"
          disabled={adding}
          style={{
            flex: '0 0 auto',
            padding: '0.5rem 1.2rem',
            backgroundColor: '#2563eb',
            color: '#fff',
            border: 'none',
            borderRadius: 6,
            cursor: adding ? 'not-allowed' : 'pointer',
            fontWeight: 600,
          }}
        >
          {adding ? 'Adding...' : 'Add Log'}
        </button>
      </form>

      {/* Refresh Button */}
      <button
        onClick={fetchLogs}
        disabled={loading}
        style={{
          marginBottom: '1rem',
          padding: '0.5rem 1rem',
          backgroundColor: '#2563eb',
          color: '#fff',
          border: 'none',
          borderRadius: 6,
          cursor: loading ? 'not-allowed' : 'pointer',
        }}
        aria-label="Refresh Maintenance Logs"
      >
        {loading ? 'Refreshing...' : 'Refresh Logs'}
      </button>

      {/* Last fetched timestamp */}
      {lastFetched && !loading && !error && (
        <div style={{ fontSize: 12, color: '#555', marginBottom: 12 }}>
          Last updated: {lastFetched.toLocaleString()}
        </div>
      )}

      {/* Loading spinner */}
      {loading && (
        <div style={{ display: 'flex', justifyContent: 'center', margin: '1rem 0' }}>
          <div
            style={{
              border: '4px solid #ccc',
              borderTop: '4px solid #2563eb',
              borderRadius: '50%',
              width: 30,
              height: 30,
              animation: 'spin 1s linear infinite',
            }}
          />
          <style>{`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}</style>
        </div>
      )}

      {/* Error message */}
      {error && (
        <p role="alert" style={{ color: 'red' }}>
          {error}. Please try refreshing using the above button.
        </p>
      )}

      {/* Empty state */}
      {!loading && !error && logs.length === 0 && (
        <p style={{ fontStyle: 'italic', color: '#777', marginTop: 12 }}>
          No maintenance logs found yet. Use the Refresh button to check again.
        </p>
      )}

      {/* Logs list */}
      {!loading && !error && logs.length > 0 && (
        <ul
          style={{ listStyle: 'none', paddingLeft: 0, marginTop: '1rem' }}
          aria-live="polite"
          aria-relevant="additions"
        >
          {logs.map((log, idx) => (
            <li
              key={log.id}
              style={{
                backgroundColor: idx % 2 === 0 ? '#f9fafb' : '#ffffff',
                padding: '0.75rem',
                borderRadius: 6,
                marginBottom: '0.5rem',
                boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                transition: 'background-color 0.3s ease',
              }}
              tabIndex={0}
              aria-label={`Maintenance log: Date ${new Date(log.date).toLocaleDateString()}, Zone ${log.zone}, Description: ${log.description}, Engineer: ${log.engineer}`}
            >
              {editLogId === log.id ? (
                <>
                  <input
                    type="date"
                    value={editLogData.date?.slice(0, 10) || ''}
                    onChange={e =>
                      setEditLogData(prev => ({ ...prev, date: e.target.value }))
                    }
                    style={{ marginBottom: 4 }}
                  />
                  <input
                    type="text"
                    value={editLogData.zone || ''}
                    onChange={e =>
                      setEditLogData(prev => ({ ...prev, zone: e.target.value }))
                    }
                    placeholder="Zone"
                    style={{ marginBottom: 4, width: '100%' }}
                  />
                  <textarea
                    value={editLogData.description || ''}
                    onChange={e =>
                      setEditLogData(prev => ({ ...prev, description: e.target.value }))
                    }
                    placeholder="Description"
                    style={{ marginBottom: 4, width: '100%' }}
                    rows={3}
                  />
                  <input
                    type="text"
                    value={editLogData.engineer || ''}
                    onChange={e =>
                      setEditLogData(prev => ({ ...prev, engineer: e.target.value }))
                    }
                    placeholder="Engineer"
                    style={{ marginBottom: 4 }}
                  />
                  <button
                    disabled={saving}
                    onClick={handleSaveEdit}
                    style={{ marginRight: 8, padding: '0.25rem 0.75rem' }}
                  >
                    Save
                  </button>
                  <button
                    disabled={saving}
                    onClick={() => setEditLogId(null)}
                    style={{ padding: '0.25rem 0.75rem' }}
                  >
                    Cancel
                  </button>
                </>
              ) : (
                <>
                  <div style={{ fontWeight: 600, marginBottom: 4 }}>
                    {new Date(log.date).toLocaleDateString()} — {log.zone}
                  </div>
                  <div style={{ marginBottom: 4 }}>{log.description}</div>
                  <div
                    style={{ fontStyle: 'italic', color: '#555', marginBottom: 4 }}
                  >
                    Engineer: {log.engineer}
                  </div>
                  <button
                    onClick={() => {
                      setEditLogId(log.id);
                      setEditLogData({
                        date: log.date?.slice(0, 10) || '',
                        zone: log.zone,
                        description: log.description,
                        engineer: log.engineer,
                      });
                    }}
                    style={{ marginRight: 8, padding: '0.25rem 0.75rem', cursor: 'pointer' }}
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(log.id)}
                    disabled={deletingId === log.id}
                    style={{
                      padding: '0.25rem 0.75rem',
                      cursor: 'pointer',
                      backgroundColor: '#e53e3e',
                      color: '#fff',
                    }}
                  >
                    {deletingId === log.id ? 'Deleting...' : 'Delete'}
                  </button>
                </>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

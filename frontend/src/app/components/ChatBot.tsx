'use client';
import React, { useState } from 'react';
import { cardStyle } from '../styles/commonStyles';

export default function ChatBot() {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Hi! I am your RailVisionAI assistant. Ask me about track status, defects, or maintenance.' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const onSend = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!input.trim()) return;
    setLoading(true);
    setMessages(msgs => [...msgs, { role: 'user', content: input }]);
    try {
      const resp = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: input, history: messages }),
      });
      const data = await resp.json();
      setMessages(msgs => [...msgs, { role: 'assistant', content: data.content }]);
    } catch {
      setMessages(msgs => [...msgs, { role: 'assistant', content: 'Sorry, chatbot is currently unavailable.' }]);
    }
    setInput('');
    setLoading(false);
  };

  return (
    <section style={cardStyle}>
      <h2 style={{ marginBottom: 8 }}>AI Chatbot Assistant</h2>
      <div style={{
        minHeight: 120, marginBottom: 10, background: '#f9fafb', padding: 10,
        borderRadius: 8, fontSize: 15, maxHeight: 200, overflowY: 'auto'
      }}>
        {messages.map((msg, i) => (
          <div key={i} style={{
            marginBottom: 7,
            color: msg.role === 'assistant' ? '#234e70' : '#1b7c34',
            fontWeight: msg.role === 'assistant' ? 600 : 500
          }}>
            <span style={{ marginRight: 5 }}>{msg.role === 'assistant' ? '🤖' : '👷'}</span>{msg.content}
          </div>
        ))}
      </div>
      <form onSubmit={onSend} style={{ display: 'flex', gap: 5 }}>
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Ask about track status, logs, maintenance..."
          style={{ flex: 1, padding: 8, borderRadius: 6, border: '1px solid #ccc' }}
          disabled={loading}
        />
        <button disabled={loading} style={{
          background: '#3832ce', color: '#fff', border: 'none', borderRadius: 6, padding: '0.4em 1em'
        }}>
          {loading ? '...' : 'Send'}
        </button>
      </form>
    </section>
  );
}

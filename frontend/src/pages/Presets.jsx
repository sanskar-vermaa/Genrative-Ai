import { useEffect, useState } from 'react';
import * as presetsApi from '../api/presets.js';

export default function Presets() {
  const [presets, setPresets] = useState([]);
  const [name, setName] = useState('');
  const [systemPrompt, setSystemPrompt] = useState('');
  const [temperature, setTemperature] = useState(0.7);
  const [error, setError] = useState('');

  useEffect(() => {
    presetsApi.listPresets().then(setPresets);
  }, []);

  async function handleCreate(e) {
    e.preventDefault();
    setError('');
    try {
      const preset = await presetsApi.createPreset({ name, systemPrompt, temperature: Number(temperature) });
      setPresets((prev) => [preset, ...prev]);
      setName('');
      setSystemPrompt('');
      setTemperature(0.7);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create preset');
    }
  }

  async function handleDelete(id) {
    await presetsApi.deletePreset(id);
    setPresets((prev) => prev.filter((p) => p._id !== id));
  }

  return (
    <div>
      <h1 className="glow-title">Presets</h1>
      <p className="muted">Reusable system prompts and temperature settings for new chats.</p>

      <div className="card" style={{ margin: '1.25rem 0' }}>
        <form className="form" onSubmit={handleCreate}>
          <label>
            Name
            <input value={name} onChange={(e) => setName(e.target.value)} required />
          </label>
          <label>
            System prompt
            <textarea rows={3} value={systemPrompt} onChange={(e) => setSystemPrompt(e.target.value)} required />
          </label>
          <label>
            Temperature ({temperature})
            <input
              type="range"
              min="0"
              max="2"
              step="0.1"
              value={temperature}
              onChange={(e) => setTemperature(e.target.value)}
            />
          </label>
          {error && <span className="error-text">{error}</span>}
          <button className="btn-primary" type="submit">Create preset</button>
        </form>
      </div>

      <div className="preset-grid">
        {presets.map((p) => (
          <div key={p._id} className="card preset-card">
            <div className="page-header">
              <strong>{p.name}</strong>
              <button className="btn-danger" onClick={() => handleDelete(p._id)}>Delete</button>
            </div>
            <p className="muted">{p.systemPrompt}</p>
            <span className="badge">temp {p.temperature}</span>
          </div>
        ))}
        {presets.length === 0 && <p className="muted">No presets yet.</p>}
      </div>
    </div>
  );
}

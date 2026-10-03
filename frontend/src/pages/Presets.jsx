import { useState } from 'react';
import * as store from '../lib/store.js';

export default function Presets() {
  const [presets, setPresets] = useState(() => store.listPresets());
  const [name, setName] = useState('');
  const [systemPrompt, setSystemPrompt] = useState('');
  const [temperature, setTemperature] = useState(0.7);

  function handleCreate(e) {
    e.preventDefault();
    store.createPreset({ name: name.trim(), systemPrompt: systemPrompt.trim(), temperature: Number(temperature) });
    setPresets(store.listPresets());
    setName('');
    setSystemPrompt('');
    setTemperature(0.7);
  }

  function handleDelete(id) {
    store.deletePreset(id);
    setPresets(store.listPresets());
  }

  return (
    <div>
      <h1 className="glow-title">Presets</h1>
      <p className="muted">Reusable system prompts and temperature settings. Pick one in the chat to use it.</p>

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

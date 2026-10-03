import { useState } from 'react';
import * as store from '../lib/store.js';

export default function Usage() {
  const [summary] = useState(() => store.getUsageSummary());

  return (
    <div>
      <h1 className="glow-title">Usage</h1>
      <p className="muted">
        Free to use — up to {store.DAILY_MESSAGE_LIMIT} messages per day. Stats are stored only in this browser.
      </p>

      <div className="stat-grid">
        <StatCard label="Messages today" value={summary.today.messages} />
        <StatCard label="Prompt tokens today" value={summary.today.promptTokens} />
        <StatCard label="Completion tokens today" value={summary.today.completionTokens} />
        <StatCard label="Total messages" value={summary.allTime.messages} />
        <StatCard label="Total prompt tokens" value={summary.allTime.promptTokens} />
        <StatCard label="Total completion tokens" value={summary.allTime.completionTokens} />
      </div>
    </div>
  );
}

function StatCard({ label, value }) {
  return (
    <div className="card stat">
      <span className="muted">{label}</span>
      <strong className="glow-title">{value}</strong>
    </div>
  );
}

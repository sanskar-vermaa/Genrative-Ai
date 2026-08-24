import { useEffect, useState } from 'react';
import { getUsageSummary } from '../api/usage.js';
import { useAuth } from '../context/AuthContext.jsx';

export default function Usage() {
  const { user } = useAuth();
  const [summary, setSummary] = useState(null);

  useEffect(() => {
    getUsageSummary().then(setSummary);
  }, []);

  if (!summary) return <p className="muted">Loading usage...</p>;

  return (
    <div>
      <h1 className="glow-title">Usage</h1>
      <p className="muted">
        You're on the <strong>{user?.plan}</strong> plan.
        {user?.plan === 'free' && ' Free plan is limited to 30 messages per day.'}
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

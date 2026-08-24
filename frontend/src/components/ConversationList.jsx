export default function ConversationList({ conversations, activeId, onSelect, onNew, onDelete }) {
  return (
    <div className="conv-list">
      <button className="btn-primary conv-new" onClick={onNew}>+ New chat</button>
      {conversations.map((c) => (
        <div key={c._id} className={`conv-item ${c._id === activeId ? 'active' : ''}`}>
          <button className="conv-item-btn" onClick={() => onSelect(c._id)}>
            {c.title}
          </button>
          <button className="conv-delete" title="Delete" onClick={() => onDelete(c._id)}>×</button>
        </div>
      ))}
      {conversations.length === 0 && <p className="muted">No conversations yet.</p>}
    </div>
  );
}

export default function ChatMessage({ role, content }) {
  const isUser = role === 'user';
  return (
    <div className={`chat-msg ${isUser ? 'chat-msg-user' : 'chat-msg-assistant'}`}>
      <div className="chat-bubble">{content}</div>
    </div>
  );
}

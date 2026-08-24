import { useEffect, useRef, useState } from 'react';
import * as conversationsApi from '../api/conversations.js';
import { sendMessage } from '../api/messages.js';
import ConversationList from '../components/ConversationList.jsx';
import ChatMessage from '../components/ChatMessage.jsx';

export default function Chat() {
  const [conversations, setConversations] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const bottomRef = useRef(null);

  useEffect(() => {
    conversationsApi.listConversations().then((list) => {
      setConversations(list);
      if (list.length) setActiveId(list[0]._id);
    });
  }, []);

  useEffect(() => {
    if (!activeId) {
      setMessages([]);
      return;
    }
    conversationsApi.getConversation(activeId).then((data) => setMessages(data.messages));
  }, [activeId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function handleNew() {
    const conversation = await conversationsApi.createConversation();
    setConversations((prev) => [conversation, ...prev]);
    setActiveId(conversation._id);
  }

  async function handleDelete(id) {
    await conversationsApi.deleteConversation(id);
    setConversations((prev) => prev.filter((c) => c._id !== id));
    if (activeId === id) setActiveId(null);
  }

  async function handleSend(e) {
    e.preventDefault();
    if (!draft.trim()) return;

    let conversationId = activeId;
    if (!conversationId) {
      const conversation = await conversationsApi.createConversation();
      setConversations((prev) => [conversation, ...prev]);
      conversationId = conversation._id;
      setActiveId(conversationId);
    }

    const pendingText = draft;
    setDraft('');
    setMessages((prev) => [...prev, { role: 'user', content: pendingText, _id: `local-${Date.now()}` }]);
    setSending(true);
    setError('');

    try {
      const { assistantMessage } = await sendMessage(conversationId, pendingText);
      setMessages((prev) => [...prev, assistantMessage]);
      const updated = await conversationsApi.listConversations();
      setConversations(updated);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to send message');
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="chat-layout">
      <div className="chat-sidebar card">
        <ConversationList
          conversations={conversations}
          activeId={activeId}
          onSelect={setActiveId}
          onNew={handleNew}
          onDelete={handleDelete}
        />
      </div>
      <div className="chat-main card">
        <div className="chat-thread">
          {messages.map((m) => (
            <ChatMessage key={m._id} role={m.role} content={m.content} />
          ))}
          {messages.length === 0 && (
            <p className="muted">Start the conversation by sending a message below.</p>
          )}
          <div ref={bottomRef} />
        </div>
        {error && <span className="error-text">{error}</span>}
        <form className="chat-composer" onSubmit={handleSend}>
          <textarea
            rows={2}
            placeholder="Message GenStudio..."
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend(e);
              }
            }}
          />
          <button className="btn-primary" type="submit" disabled={sending || !draft.trim()}>
            {sending ? 'Thinking...' : 'Send'}
          </button>
        </form>
      </div>
    </div>
  );
}

import { useEffect, useRef, useState } from 'react';
import * as store from '../lib/store.js';
import { generateReply } from '../api/chat.js';
import ConversationList from '../components/ConversationList.jsx';
import ChatMessage from '../components/ChatMessage.jsx';

export default function Chat() {
  const [conversations, setConversations] = useState(() => store.listConversations());
  const [activeId, setActiveId] = useState(() => store.listConversations()[0]?._id || null);
  const [messages, setMessages] = useState([]);
  const [presets] = useState(() => store.listPresets());
  const [presetId, setPresetId] = useState('');
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const bottomRef = useRef(null);

  const refresh = () => setConversations(store.listConversations());

  useEffect(() => {
    if (!activeId) {
      setMessages([]);
      return;
    }
    const { conversation, messages } = store.getConversation(activeId);
    setMessages(messages);
    setPresetId(conversation?.preset || '');
  }, [activeId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  function handleNew() {
    const conversation = store.createConversation({ presetId: presetId || null });
    refresh();
    setActiveId(conversation._id);
  }

  function handleDelete(id) {
    store.deleteConversation(id);
    refresh();
    if (activeId === id) setActiveId(store.listConversations()[0]?._id || null);
  }

  function handlePresetChange(value) {
    setPresetId(value);
    if (activeId) store.updateConversation(activeId, { preset: value || null });
  }

  async function handleSend(e) {
    e.preventDefault();
    const text = draft.trim();
    if (!text || sending) return;

    if (store.messagesToday() >= store.DAILY_MESSAGE_LIMIT) {
      setError(`Daily limit reached (${store.DAILY_MESSAGE_LIMIT} messages). Please come back tomorrow.`);
      return;
    }

    let conversationId = activeId;
    if (!conversationId) {
      conversationId = store.createConversation({ presetId: presetId || null })._id;
      setActiveId(conversationId);
    }

    setDraft('');
    setError('');
    store.addMessage(conversationId, 'user', text);
    const history = store.getConversation(conversationId).messages;
    setMessages(history);
    refresh();
    setSending(true);

    try {
      const preset = presetId ? store.getPreset(presetId) : null;
      const reply = await generateReply({
        history: history.map((m) => ({ role: m.role, content: m.content })),
        systemPrompt: preset?.systemPrompt,
        temperature: preset?.temperature,
      });
      store.addMessage(conversationId, 'assistant', reply.text, { tokenCount: reply.completionTokens });
      store.logUsage(conversationId, reply.promptTokens, reply.completionTokens);
      setMessages(store.getConversation(conversationId).messages);
      refresh();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to get a reply. Please try again.');
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
        {presets.length > 0 && (
          <label className="preset-picker">
            Preset
            <select value={presetId} onChange={(e) => handlePresetChange(e.target.value)}>
              <option value="">None</option>
              {presets.map((p) => (
                <option key={p._id} value={p._id}>
                  {p.name}
                </option>
              ))}
            </select>
          </label>
        )}
        <div className="chat-thread">
          {messages.map((m) => (
            <ChatMessage key={m._id} role={m.role} content={m.content} />
          ))}
          {messages.length === 0 && (
            <p className="muted">Start the conversation by sending a message below. No sign-up needed.</p>
          )}
          {sending && <ChatMessage role="assistant" content="Thinking…" />}
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

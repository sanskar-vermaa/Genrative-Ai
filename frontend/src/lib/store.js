// Browser-only data store: conversations, messages, presets and usage live in localStorage.
// No account needed — each visitor's data stays on their own device.

const KEY = 'genstudio_data_v1';
export const DAILY_MESSAGE_LIMIT = 30;

const empty = () => ({ conversations: [], messages: {}, presets: [], usage: [] });

function load() {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? { ...empty(), ...JSON.parse(raw) } : empty();
  } catch {
    return empty();
  }
}

function save(data) {
  try {
    localStorage.setItem(KEY, JSON.stringify(data));
  } catch {
    /* storage full or blocked — keep working in memory */
  }
}

let state = load();
const commit = () => save(state);
const id = () => (crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(16).slice(2)}`);
const now = () => new Date().toISOString();
const byUpdated = (a, b) => (a.updatedAt < b.updatedAt ? 1 : -1);

// ---- Conversations ----
export function listConversations() {
  return [...state.conversations].sort(byUpdated);
}

export function createConversation({ presetId = null } = {}) {
  const c = { _id: id(), title: 'New conversation', preset: presetId, createdAt: now(), updatedAt: now() };
  state.conversations.push(c);
  state.messages[c._id] = [];
  commit();
  return c;
}

export function getConversation(conversationId) {
  const conversation = state.conversations.find((c) => c._id === conversationId) || null;
  return { conversation, messages: state.messages[conversationId] || [] };
}

export function updateConversation(conversationId, patch) {
  const c = state.conversations.find((x) => x._id === conversationId);
  if (!c) return null;
  Object.assign(c, patch, { updatedAt: now() });
  commit();
  return c;
}

export function deleteConversation(conversationId) {
  state.conversations = state.conversations.filter((c) => c._id !== conversationId);
  delete state.messages[conversationId];
  commit();
}

export function addMessage(conversationId, role, content, extra = {}) {
  const m = { _id: id(), role, content, createdAt: now(), ...extra };
  (state.messages[conversationId] ||= []).push(m);
  const c = state.conversations.find((x) => x._id === conversationId);
  if (c) {
    if (role === 'user' && c.title === 'New conversation') c.title = content.trim().slice(0, 60);
    c.updatedAt = now();
  }
  commit();
  return m;
}

// ---- Presets ----
export function listPresets() {
  return [...state.presets].sort(byUpdated);
}

export function getPreset(presetId) {
  return state.presets.find((p) => p._id === presetId) || null;
}

export function createPreset({ name, systemPrompt, temperature }) {
  const p = { _id: id(), name, systemPrompt, temperature, createdAt: now(), updatedAt: now() };
  state.presets.push(p);
  commit();
  return p;
}

export function deletePreset(presetId) {
  state.presets = state.presets.filter((p) => p._id !== presetId);
  state.conversations.forEach((c) => {
    if (c.preset === presetId) c.preset = null;
  });
  commit();
}

// ---- Usage ----
export function logUsage(conversationId, promptTokens, completionTokens) {
  state.usage.push({ conversation: conversationId, promptTokens, completionTokens, createdAt: now() });
  commit();
}

function startOfToday() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d.toISOString();
}

export function messagesToday() {
  const since = startOfToday();
  return state.usage.filter((u) => u.createdAt >= since).length;
}

export function getUsageSummary() {
  const since = startOfToday();
  const sum = (list) => ({
    messages: list.length,
    promptTokens: list.reduce((n, u) => n + (u.promptTokens || 0), 0),
    completionTokens: list.reduce((n, u) => n + (u.completionTokens || 0), 0),
  });
  return { today: sum(state.usage.filter((u) => u.createdAt >= since)), allTime: sum(state.usage) };
}

// ---- Reset ----
export function clearAll() {
  state = empty();
  commit();
}

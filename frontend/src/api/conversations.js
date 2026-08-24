import client from './client.js';

export function listConversations() {
  return client.get('/conversations').then((res) => res.data);
}

export function createConversation(payload = {}) {
  return client.post('/conversations', payload).then((res) => res.data);
}

export function getConversation(id) {
  return client.get(`/conversations/${id}`).then((res) => res.data);
}

export function renameConversation(id, title) {
  return client.put(`/conversations/${id}`, { title }).then((res) => res.data);
}

export function deleteConversation(id) {
  return client.delete(`/conversations/${id}`);
}

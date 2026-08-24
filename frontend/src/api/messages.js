import client from './client.js';

export function sendMessage(conversationId, content) {
  return client.post(`/messages/${conversationId}`, { content }).then((res) => res.data);
}

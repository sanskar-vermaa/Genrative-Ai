import client from './client.js';

// Ask the serverless /api/chat function for the assistant's next reply.
export function generateReply({ history, systemPrompt, temperature }) {
  return client.post('/chat', { history, systemPrompt, temperature }).then((res) => res.data);
}

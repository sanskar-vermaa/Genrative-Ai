import { GoogleGenAI } from '@google/genai';

let client = null;

function getClient() {
  if (!client) {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY is not configured');
    }
    client = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  }
  return client;
}

// Rough token estimate used for usage accounting when the SDK response
// doesn't carry a usage block (kept deliberately simple: ~4 chars/token).
export function estimateTokens(text) {
  return Math.ceil((text || '').length / 4);
}

export async function generateReply({ systemPrompt, history, temperature }) {
  const ai = getClient();

  const contents = history.map((m) => ({
    role: m.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: m.content }],
  }));

  const response = await ai.models.generateContent({
    model: 'gemini-2.0-flash',
    contents,
    config: {
      systemInstruction: systemPrompt || undefined,
      temperature: temperature ?? 0.7,
    },
  });

  const text = response.text ?? '';
  const usage = response.usageMetadata || {};

  return {
    text,
    promptTokens: usage.promptTokenCount ?? estimateTokens(JSON.stringify(contents)),
    completionTokens: usage.candidatesTokenCount ?? estimateTokens(text),
  };
}

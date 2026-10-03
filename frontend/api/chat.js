// Vercel serverless function: POST /api/chat
// Keeps the Gemini API key on the server. Set GEMINI_API_KEY in the Vercel project settings.
// Body: { history: [{ role: 'user'|'assistant', content }], systemPrompt?, temperature? }

const MAX_MESSAGES = 40; // most recent turns sent as context
const MAX_CHARS_PER_MESSAGE = 8000;

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'GEMINI_API_KEY is not configured on the server.' });
  }

  const { history, systemPrompt, temperature } = req.body || {};
  if (!Array.isArray(history) || history.length === 0) {
    return res.status(400).json({ error: 'history is required' });
  }

  const contents = history
    .slice(-MAX_MESSAGES)
    .filter((m) => m && typeof m.content === 'string' && m.content.trim())
    .map((m) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content.slice(0, MAX_CHARS_PER_MESSAGE) }],
    }));

  if (!contents.length || contents[contents.length - 1].role !== 'user') {
    return res.status(400).json({ error: 'The last message must be from the user.' });
  }

  const temp = Number.isFinite(Number(temperature)) ? Math.min(2, Math.max(0, Number(temperature))) : 0.7;
  const model = process.env.GEMINI_MODEL || 'gemini-2.5-flash';

  const body = {
    contents,
    generationConfig: { temperature: temp, maxOutputTokens: 2048 },
  };
  if (typeof systemPrompt === 'string' && systemPrompt.trim()) {
    body.systemInstruction = { parts: [{ text: systemPrompt.slice(0, MAX_CHARS_PER_MESSAGE) }] };
  }

  try {
    const r = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey },
        body: JSON.stringify(body),
      },
    );
    const data = await r.json().catch(() => ({}));
    if (!r.ok) {
      const message = data?.error?.message || `Gemini request failed (${r.status})`;
      return res.status(r.status === 429 ? 429 : 502).json({ error: message });
    }

    const text = (data.candidates?.[0]?.content?.parts || []).map((p) => p.text || '').join('');
    const usage = data.usageMetadata || {};
    return res.status(200).json({
      text: text || '(No response)',
      promptTokens: usage.promptTokenCount ?? 0,
      completionTokens: usage.candidatesTokenCount ?? 0,
    });
  } catch (err) {
    return res.status(502).json({ error: 'Could not reach the Gemini API.' });
  }
}

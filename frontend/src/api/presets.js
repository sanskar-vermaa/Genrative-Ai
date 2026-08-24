import client from './client.js';

export function listPresets() {
  return client.get('/presets').then((res) => res.data);
}

export function createPreset(payload) {
  return client.post('/presets', payload).then((res) => res.data);
}

export function updatePreset(id, payload) {
  return client.put(`/presets/${id}`, payload).then((res) => res.data);
}

export function deletePreset(id) {
  return client.delete(`/presets/${id}`);
}

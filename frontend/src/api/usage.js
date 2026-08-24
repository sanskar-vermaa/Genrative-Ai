import client from './client.js';

export function getUsageSummary() {
  return client.get('/usage/summary').then((res) => res.data);
}

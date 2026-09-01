const API_URL = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');

const cache = new Map<string, Promise<any>>();

export function apiUrl(path: string) {
  return `${API_URL}${path}`;
}

export function getJson<T = any>(path: string): Promise<T> {
  const key = apiUrl(path);
  const cached = cache.get(key);
  if (cached) return cached as Promise<T>;

  const request = fetch(key, { headers: { Accept: 'application/json' } }).then(async response => {
    if (!response.ok) throw new Error(`API request failed (${response.status})`);
    return response.json();
  }).catch(error => {
    cache.delete(key);
    throw error;
  });

  cache.set(key, request);
  return request;
}

export function clearApiCache() {
  cache.clear();
}

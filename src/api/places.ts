import type { Place, PlaceCreate, PlaceUpdate } from '../types/place';

const API_URL = import.meta.env.VITE_API_URL as string;

async function http<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers ?? {}),
    },
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(text || `HTTP ${res.status}`);
  }

  // 204 No Content
  if (res.status === 204) return undefined as T;

  return (await res.json()) as T;
}

// JSON + fetch — стандартный подход.
export const placesApi = {
  list: () => http<Place[]>('/places', { method: 'GET' }),
  create: (payload: PlaceCreate) =>
    http<Place>('/places', { method: 'POST', body: JSON.stringify(payload) }),
  update: (id: number, payload: PlaceUpdate) =>
    http<Place>(`/places/${id}`, { method: 'PUT', body: JSON.stringify(payload) }),
  remove: (id: number) => http<void>(`/places/${id}`, { method: 'DELETE' }),
};
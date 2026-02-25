import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { placesApi } from '../../api/places';
import type { Place, PlaceCreate } from '../../types/place';

const mockPlace: Place = {
  id: 1,
  title: 'Эрмитаж',
  type: { id: 3, title: 'museum' },
  address: 'Дворцовая пл., 2',
  description: 'Крупнейший художественный музей',
  architect: 'Растрелли',
  popularityScore: 5,
};

const mockFetch = vi.fn();

beforeEach(() => {
  vi.stubGlobal('fetch', mockFetch);
  // Устанавливаем VITE_API_URL через import.meta.env
  // В vitest нет реального Vite env, поэтому API_URL будет undefined,
  // поэтому мы проверяем структуру запроса, а не полный URL
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.clearAllMocks();
});

function makeFetchResponse(body: unknown, status = 200): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: () => Promise.resolve(body),
    text: () => Promise.resolve(typeof body === 'string' ? body : JSON.stringify(body)),
  } as unknown as Response;
}

function makeFetchError(status: number, errorText: string): Response {
  return {
    ok: false,
    status,
    json: () => Promise.reject(new Error('not json')),
    text: () => Promise.resolve(errorText),
  } as unknown as Response;
}

describe('placesApi.list()', () => {
  it('выполняет GET запрос и возвращает массив мест', async () => {
    const places = [mockPlace];
    mockFetch.mockResolvedValue(makeFetchResponse(places));

    const result = await placesApi.list();

    expect(result).toEqual(places);
    expect(mockFetch).toHaveBeenCalledOnce();

    const [, init] = mockFetch.mock.calls[0] as [string, RequestInit];
    expect(init.method).toBe('GET');
  });

  it('выбрасывает ошибку при неуспешном ответе', async () => {
    mockFetch.mockResolvedValue(makeFetchError(500, 'Internal Server Error'));

    await expect(placesApi.list()).rejects.toThrow('Internal Server Error');
  });

  it('выбрасывает ошибку с HTTP статусом если тело пустое', async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      status: 503,
      text: () => Promise.resolve(''),
    } as unknown as Response);

    await expect(placesApi.list()).rejects.toThrow('HTTP 503');
  });
});

describe('placesApi.create()', () => {
  const payload: PlaceCreate = {
    title: 'Петергоф',
    type: { id: 7, title: 'palace' },
    address: 'Разводная ул., 2',
    description: 'Дворцово-парковый ансамбль',
    architect: null,
    popularityScore: 4,
  };

  it('выполняет POST запрос с JSON телом и возвращает созданное место', async () => {
    const created = { ...payload, id: 2 };
    mockFetch.mockResolvedValue(makeFetchResponse(created));

    const result = await placesApi.create(payload);

    expect(result).toEqual(created);
    expect(mockFetch).toHaveBeenCalledOnce();

    const [url, init] = mockFetch.mock.calls[0] as [string, RequestInit];
    expect(url).toContain('/places');
    expect(init.method).toBe('POST');
    expect(init.body).toBe(JSON.stringify(payload));
    const headers = init.headers as Record<string, string>;
    expect(headers['Content-Type']).toBe('application/json');
  });
});

describe('placesApi.update()', () => {
  it('выполняет PUT запрос на /places/{id} и возвращает обновлённое место', async () => {
    const payload: PlaceCreate = { ...mockPlace };
    const updated = { ...mockPlace, title: 'Эрмитаж (обновлён)' };
    mockFetch.mockResolvedValue(makeFetchResponse(updated));

    const result = await placesApi.update(1, payload);

    expect(result).toEqual(updated);
    expect(mockFetch).toHaveBeenCalledOnce();

    const [url, init] = mockFetch.mock.calls[0] as [string, RequestInit];
    expect(url).toContain('/places/1');
    expect(init.method).toBe('PUT');
    expect(init.body).toBe(JSON.stringify(payload));
  });
});

describe('placesApi.remove()', () => {
  it('выполняет DELETE запрос и при 204 возвращает undefined без ошибки', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      status: 204,
      json: () => Promise.resolve(undefined),
      text: () => Promise.resolve(''),
    } as unknown as Response);

    const result = await placesApi.remove(1);

    expect(result).toBeUndefined();
    expect(mockFetch).toHaveBeenCalledOnce();

    const [url, init] = mockFetch.mock.calls[0] as [string, RequestInit];
    expect(url).toContain('/places/1');
    expect(init.method).toBe('DELETE');
  });

  it('выбрасывает ошибку при 404', async () => {
    mockFetch.mockResolvedValue(makeFetchError(404, 'Not Found'));

    await expect(placesApi.remove(999)).rejects.toThrow('Not Found');
  });
});
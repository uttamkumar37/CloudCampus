import { describe, expect, it, vi } from 'vitest';

import { AUTH_SESSION_EXPIRED_EVENT } from './authHeaders';
import { httpClient } from './httpClient';

function storageWithToken(token: string | null = null) {
  const values = new Map<string, string>();
  if (token) {
    values.set('cloudcampus.auth.accessToken', token);
  }
  return {
    getItem: vi.fn((key: string) => values.get(key) ?? null),
    removeItem: vi.fn((key: string) => {
      values.delete(key);
    }),
    setItem: vi.fn((key: string, value: string) => {
      values.set(key, value);
    }),
  };
}

describe('httpClient', () => {
  it('attaches the stored Bearer token to protected API calls', async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify([]), {
      headers: { 'content-type': 'application/json' },
    }));
    vi.stubGlobal('fetch', fetchMock);

    await httpClient.get('/v1/school-admin/students', { storage: storageWithToken('stored-token') });

    expect(fetchMock).toHaveBeenCalledWith('/v1/school-admin/students', expect.objectContaining({
      headers: expect.objectContaining({
        Authorization: 'Bearer stored-token',
      }),
    }));
    vi.unstubAllGlobals();
  });

  it('surfaces parsed API errors', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(
      JSON.stringify({ message: 'Students API failed' }),
      { status: 500, headers: { 'content-type': 'application/json' } },
    )));

    await expect(httpClient.get('/v1/school-admin/students', {
      storage: storageWithToken('stored-token'),
    })).rejects.toThrow('Students API failed');
    vi.unstubAllGlobals();
  });

  it('clears stale protected sessions when refresh cannot recover', async () => {
    const storage = storageWithToken('stale-token');
    const listener = vi.fn();
    globalThis.addEventListener(AUTH_SESSION_EXPIRED_EVENT, listener);
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(
      JSON.stringify({ message: 'Bearer access token is invalid.' }),
      { status: 401, headers: { 'content-type': 'application/json' } },
    )));

    await expect(httpClient.get('/v1/super-admin/tenants', { storage })).rejects.toThrow('Bearer access token is invalid.');

    expect(storage.removeItem).toHaveBeenCalledWith('cloudcampus.auth.accessToken');
    expect(storage.removeItem).toHaveBeenCalledWith('cloudcampus.auth.refreshToken');
    expect(listener).toHaveBeenCalledTimes(1);
    globalThis.removeEventListener(AUTH_SESSION_EXPIRED_EVENT, listener);
    vi.unstubAllGlobals();
  });
});

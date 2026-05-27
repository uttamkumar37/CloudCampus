export const ACCESS_TOKEN_STORAGE_KEY = 'cloudcampus.auth.accessToken';
export const REFRESH_TOKEN_STORAGE_KEY = 'cloudcampus.auth.refreshToken';
export const AUTH_SESSION_EXPIRED_EVENT = 'cloudcampus:auth-session-expired';

type TokenStorage = Pick<Storage, 'getItem'>;

export function getStoredAccessToken(storage: TokenStorage = globalThis.sessionStorage) {
  return storage.getItem(ACCESS_TOKEN_STORAGE_KEY);
}

export function getStoredRefreshToken(storage: TokenStorage = globalThis.sessionStorage) {
  return storage.getItem(REFRESH_TOKEN_STORAGE_KEY);
}

export function buildAuthHeaders(accessToken?: string | null): HeadersInit {
  if (!accessToken) {
    return {};
  }

  return {
    Authorization: `Bearer ${accessToken}`,
  };
}

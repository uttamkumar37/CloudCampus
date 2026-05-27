import { apiErrorFromResponse } from './apiError';
import { buildApiUrl } from './apiBase';
import {
  ACCESS_TOKEN_STORAGE_KEY,
  AUTH_SESSION_EXPIRED_EVENT,
  buildAuthHeaders,
  getStoredAccessToken,
  getStoredRefreshToken,
  REFRESH_TOKEN_STORAGE_KEY,
} from './authHeaders';

type TokenStorage = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>;

type HttpClientOptions = Omit<RequestInit, 'body'> & {
  accessToken?: string | null;
  body?: unknown;
  retryOnUnauthorized?: boolean;
  storage?: TokenStorage;
};

type RefreshResponse = {
  accessToken: string | null;
  refreshToken: string | null;
};

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL?.trim() ?? '';

export async function apiRequest<T>(path: string, options: HttpClientOptions = {}): Promise<T> {
  const {
    accessToken,
    body,
    headers,
    retryOnUnauthorized = true,
    storage = globalThis.sessionStorage,
    ...requestOptions
  } = options;

  const resolvedToken = Object.prototype.hasOwnProperty.call(options, 'accessToken')
    ? accessToken
    : getStoredAccessToken(storage);
  const response = await fetch(buildApiUrl(path, apiBaseUrl), {
    ...requestOptions,
    headers: {
      ...jsonHeaders(body),
      ...buildAuthHeaders(resolvedToken),
      ...headers,
    },
    body: serializeBody(body),
  });

  if (response.status === 401 && retryOnUnauthorized) {
    const refreshedToken = await refreshAccessToken(storage);
    if (refreshedToken) {
      return apiRequest<T>(path, {
        ...options,
        accessToken: refreshedToken,
        retryOnUnauthorized: false,
        storage,
      });
    }
    clearStoredTokens(storage);
    notifyAuthExpired();
  }

  if (!response.ok) {
    throw await apiErrorFromResponse(response);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  const contentType = response.headers.get('content-type') ?? '';
  if (contentType.includes('application/json')) {
    return response.json() as Promise<T>;
  }

  return response.text() as Promise<T>;
}

export const httpClient = {
  get<T>(path: string, options?: HttpClientOptions) {
    return apiRequest<T>(path, { ...options, method: 'GET' });
  },
  post<T>(path: string, body?: unknown, options?: HttpClientOptions) {
    return apiRequest<T>(path, { ...options, method: 'POST', body });
  },
  patch<T>(path: string, body?: unknown, options?: HttpClientOptions) {
    return apiRequest<T>(path, { ...options, method: 'PATCH', body });
  },
  put<T>(path: string, body?: unknown, options?: HttpClientOptions) {
    return apiRequest<T>(path, { ...options, method: 'PUT', body });
  },
  delete<T>(path: string, options?: HttpClientOptions) {
    return apiRequest<T>(path, { ...options, method: 'DELETE' });
  },
};

async function refreshAccessToken(storage: TokenStorage) {
  const refreshToken = getStoredRefreshToken(storage);
  if (!refreshToken) {
    clearStoredTokens(storage);
    return null;
  }

  try {
    const refreshed = await apiRequest<RefreshResponse>('/v1/auth/refresh', {
      method: 'POST',
      body: { refreshToken },
      retryOnUnauthorized: false,
      storage,
    });

    if (!refreshed.accessToken) {
      clearStoredTokens(storage);
      return null;
    }

    storage.setItem(ACCESS_TOKEN_STORAGE_KEY, refreshed.accessToken);
    if (refreshed.refreshToken) {
      storage.setItem(REFRESH_TOKEN_STORAGE_KEY, refreshed.refreshToken);
    }

    return refreshed.accessToken;
  } catch {
    clearStoredTokens(storage);
    return null;
  }
}

function clearStoredTokens(storage: TokenStorage) {
  storage.removeItem(ACCESS_TOKEN_STORAGE_KEY);
  storage.removeItem(REFRESH_TOKEN_STORAGE_KEY);
}

function notifyAuthExpired() {
  if (typeof globalThis.dispatchEvent === 'function' && typeof CustomEvent !== 'undefined') {
    globalThis.dispatchEvent(new CustomEvent(AUTH_SESSION_EXPIRED_EVENT));
  }
}

function jsonHeaders(body: unknown): HeadersInit {
  if (body === undefined || body instanceof FormData) {
    return {};
  }

  return {
    'Content-Type': 'application/json',
  };
}

function serializeBody(body: unknown): BodyInit | undefined {
  if (body === undefined) {
    return undefined;
  }

  if (body instanceof FormData || typeof body === 'string') {
    return body;
  }

  return JSON.stringify(body);
}

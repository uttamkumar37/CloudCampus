type FetchInput = Parameters<typeof fetch>[0];
type FetchInit = Parameters<typeof fetch>[1];

const API_PATH_PREFIXES = ['/v1/', '/actuator/health'];

function configuredApiBaseUrl(): string {
  return import.meta.env.VITE_API_BASE_URL?.trim() ?? '';
}

function normalizeApiBaseUrl(baseUrl: string): string {
  return baseUrl.trim().replace(/\/+$/, '');
}

function isRelativeApiPath(value: string): boolean {
  return API_PATH_PREFIXES.some((prefix) => value === prefix.slice(0, -1) || value.startsWith(prefix));
}

export function buildApiUrl(path: string, baseUrl = configuredApiBaseUrl()): string {
  if (!baseUrl || !isRelativeApiPath(path) || /^https?:\/\//i.test(path)) {
    return path;
  }

  const normalizedBaseUrl = normalizeApiBaseUrl(baseUrl);
  if (!normalizedBaseUrl) {
    return path;
  }

  return `${normalizedBaseUrl}${path.startsWith('/') ? path : `/${path}`}`;
}

function rewriteFetchInput(input: FetchInput, baseUrl: string): FetchInput {
  if (typeof input === 'string') {
    return buildApiUrl(input, baseUrl);
  }

  if (input instanceof URL && isRelativeApiPath(input.pathname)) {
    return new URL(buildApiUrl(`${input.pathname}${input.search}${input.hash}`, baseUrl));
  }

  return input;
}

export function configureCloudCampusApiFetch(baseUrl = configuredApiBaseUrl()): () => void {
  if (!baseUrl || typeof window === 'undefined') {
    return () => undefined;
  }

  const originalFetch = window.fetch.bind(window);

  window.fetch = ((input: FetchInput, init?: FetchInit) => {
    return originalFetch(rewriteFetchInput(input, baseUrl), init);
  }) as typeof fetch;

  return () => {
    window.fetch = originalFetch;
  };
}

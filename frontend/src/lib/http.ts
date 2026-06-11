export type ApiRequestOptions = {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: unknown;
  token?: string | null;
  signal?: AbortSignal;
};

export class ApiError extends Error {
  readonly status: number;
  readonly code?: string;

  constructor(message: string, status: number, code?: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
  }
}

const rawApiBase = import.meta.env.VITE_CLOUDCAMPUS_API_BASE_URL || "";

export const apiBaseUrl = rawApiBase.replace(/\/$/, "");

function requestUrl(path: string) {
  if (path.startsWith("http")) {
    return path;
  }
  return `${apiBaseUrl}${path.startsWith("/") ? path : `/${path}`}`;
}

function correlationId() {
  const randomPart = Math.random().toString(36).slice(2, 10);
  return `web-portal:${Date.now().toString(36)}-${randomPart}`;
}

async function readError(response: Response) {
  const fallback = `Request failed with status ${response.status}.`;
  try {
    const payload = (await response.json()) as { message?: string; code?: string };
    return {
      message: payload.message || fallback,
      code: payload.code
    };
  } catch {
    return { message: fallback, code: undefined };
  }
}

export async function apiRequest<T>(path: string, options: ApiRequestOptions = {}): Promise<T> {
  const headers = new Headers();
  headers.set("Accept", "application/json");
  headers.set("X-Correlation-Id", correlationId());

  if (options.body !== undefined) {
    headers.set("Content-Type", "application/json");
  }

  if (options.token) {
    headers.set("Authorization", `Bearer ${options.token}`);
  }

  const response = await fetch(requestUrl(path), {
    method: options.method || "GET",
    headers,
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
    signal: options.signal
  });

  if (!response.ok) {
    const error = await readError(response);
    throw new ApiError(error.message, response.status, error.code);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}

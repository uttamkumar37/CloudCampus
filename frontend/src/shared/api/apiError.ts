export type ApiErrorBody = {
  message?: string;
  error?: string;
  code?: string;
  details?: unknown;
};

export class ApiError extends Error {
  status: number;
  code?: string;
  details?: unknown;
  body?: unknown;

  constructor(message: string, status: number, body?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.body = body;

    if (isApiErrorBody(body)) {
      this.code = body.code;
      this.details = body.details;
    }
  }
}

export async function apiErrorFromResponse(response: Response): Promise<ApiError> {
  const body = await parseErrorBody(response);
  const message = errorMessage(response, body);
  return new ApiError(message, response.status, body);
}

function errorMessage(response: Response, body: unknown) {
  if (isApiErrorBody(body)) {
    return body.message ?? body.error ?? `Request failed with HTTP ${response.status}`;
  }
  if (typeof body === 'string' && body.trim()) {
    return body;
  }
  return `Request failed with HTTP ${response.status}`;
}

async function parseErrorBody(response: Response): Promise<unknown> {
  const contentType = response.headers.get('content-type') ?? '';
  if (contentType.includes('application/json')) {
    try {
      return await response.json();
    } catch {
      return undefined;
    }
  }

  try {
    return await response.text();
  } catch {
    return undefined;
  }
}

function isApiErrorBody(value: unknown): value is ApiErrorBody {
  return typeof value === 'object' && value !== null;
}

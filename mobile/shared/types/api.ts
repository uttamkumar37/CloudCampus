export interface ApiResponse<T> {
  correlationId: string | null;
  data: T | null;
  error: string | null;
}

export interface PageResponse<T> {
  items: T[];
  offset: number;
  limit: number;
  total: number;
}

export interface ApiError {
  correlationId: string | null;
  status: number;
  error: string;
  message: string;
  path: string;
  timestamp: string;
}

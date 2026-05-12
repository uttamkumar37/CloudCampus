/**
 * Mirrors the backend ApiResponse<T> and PageResponse<T> shapes exactly.
 * Keep in sync with:
 *   com.cloudcampus.common.api.ApiResponse
 *   com.cloudcampus.common.web.PageResponse
 */
export interface ApiResponse<T> {
  correlationId: string | null;
  data: T | null;
  error: string | null;
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  page: number;
  size: number;
}

export interface ApiError {
  correlationId: string | null;
  status: number;
  error: string;
  message: string;
  path: string;
  timestamp: string;
}

export interface LoginRequest {
  username: string;
  password: string;
  tenantSlug: string;
  role?: string;
}

export interface LoginResponse {
  accessToken: string;
  tokenType: string;
  expiresIn: number;
  username: string;
  role: string;
  roles: string[];
  tenantSlug: string;
  schoolName: string;
}

export interface AuthSession {
  token: string;
  username: string;
  role: string;
  tenantSlug: string;
  schoolName: string;
}

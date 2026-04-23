export interface LoginRequest {
  username: string
  password: string
  tenantId: string
}

export interface LoginResponse {
  accessToken: string
  tokenType: string
  expiresIn: number
}

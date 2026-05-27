export const BACKEND_USER_ROLES = [
  'SUPER_ADMIN',
  'TENANT_ADMIN',
  'SCHOOL_ADMIN',
  'TEACHER',
  'FINANCE_STAFF',
  'STAFF',
  'PARENT',
  'STUDENT',
] as const;

export type UserRole = (typeof BACKEND_USER_ROLES)[number];

export type SchoolAccess = {
  schoolId: string;
  code: string;
  name: string;
  role: UserRole;
  primaryAccess: boolean;
};

export type CurrentUser = {
  userId: string;
  email: string;
  displayName: string;
  role: UserRole;
  tenantId: string;
  activeSchool: SchoolAccess | null;
  allowedSchools: SchoolAccess[];
};

export type LoginRequest = {
  email: string;
  password: string;
};

export type AuthSession = {
  accessToken: string | null;
  refreshToken: string | null;
  tokenType: 'Bearer' | null;
  expiresAt: string | null;
  user: CurrentUser | null;
  mfaRequired: boolean;
  mfaChallengeId: string | null;
  mfaCode: string | null;
  mfaExpiresAt: string | null;
};

export type AuthMessage = {
  message: string;
};

export type ForgotPasswordResponse = {
  message: string;
  resetToken: string;
  expiresAt: string;
};

export async function login(payload: LoginRequest): Promise<AuthSession> {
  const response = await fetch('/v1/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error('Login failed.');
  }

  return response.json() as Promise<AuthSession>;
}

export async function verifyMfa(challengeId: string, code: string): Promise<AuthSession> {
  const response = await fetch('/v1/auth/mfa/verify', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ challengeId, code }),
  });

  if (!response.ok) {
    throw new Error('MFA verification failed.');
  }

  return response.json() as Promise<AuthSession>;
}

export async function refreshSession(refreshToken: string): Promise<AuthSession> {
  const response = await fetch('/v1/auth/refresh', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ refreshToken }),
  });

  if (!response.ok) {
    throw new Error('Session refresh failed.');
  }

  return response.json() as Promise<AuthSession>;
}

export async function logout(accessToken: string, refreshToken?: string): Promise<AuthMessage> {
  const response = await fetch('/v1/me/logout', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ refreshToken }),
  });

  if (!response.ok) {
    throw new Error('Logout failed.');
  }

  return response.json() as Promise<AuthMessage>;
}

export async function forgotPassword(email: string): Promise<ForgotPasswordResponse> {
  const response = await fetch('/v1/auth/forgot-password', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email }),
  });

  if (!response.ok) {
    throw new Error('Password reset request failed.');
  }

  return response.json() as Promise<ForgotPasswordResponse>;
}

export async function resetPassword(token: string, password: string): Promise<AuthMessage> {
  const response = await fetch('/v1/auth/reset-password', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ token, password }),
  });

  if (!response.ok) {
    throw new Error('Password reset failed.');
  }

  return response.json() as Promise<AuthMessage>;
}

export async function changePassword(
  accessToken: string,
  currentPassword: string,
  newPassword: string,
): Promise<AuthMessage> {
  const response = await fetch('/v1/me/change-password', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ currentPassword, newPassword }),
  });

  if (!response.ok) {
    throw new Error('Password change failed.');
  }

  return response.json() as Promise<AuthMessage>;
}

export async function getCurrentUser(accessToken: string): Promise<CurrentUser> {
  const response = await fetch('/v1/me', {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    throw new Error('Current user lookup failed.');
  }

  return response.json() as Promise<CurrentUser>;
}

export async function getMySchools(accessToken: string): Promise<SchoolAccess[]> {
  const response = await fetch('/v1/me/schools', {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    throw new Error('School access lookup failed.');
  }

  return response.json() as Promise<SchoolAccess[]>;
}

export async function activateSchool(accessToken: string, schoolId: string): Promise<AuthSession> {
  const response = await fetch(`/v1/me/schools/${schoolId}/activate`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    throw new Error('School activation failed.');
  }

  return response.json() as Promise<AuthSession>;
}

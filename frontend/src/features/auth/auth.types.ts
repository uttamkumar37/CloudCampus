export type UserRole =
  | "SUPER_ADMIN"
  | "TENANT_ADMIN"
  | "SCHOOL_ADMIN"
  | "PRINCIPAL"
  | "TEACHER"
  | "STUDENT"
  | "PARENT"
  | "FINANCE_STAFF"
  | "OFFICE_STAFF"
  | "STAFF"
  | "GUEST";

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

export type AuthSessionResponse = {
  accessToken: string | null;
  refreshToken: string | null;
  tokenType: string;
  expiresAt: string | null;
  user: CurrentUser | null;
  mfaRequired: boolean;
  mfaChallengeId: string | null;
  mfaCode: string | null;
  mfaExpiresAt: string | null;
};

export type StoredSession = {
  accessToken: string;
  refreshToken: string | null;
  expiresAt: string | null;
  user: CurrentUser | null;
};

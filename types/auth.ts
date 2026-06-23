export type UserRole = "student" | "lecturer" | "admin";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  isOnboarded?: boolean;
}

export interface SessionPayload {
  sub: string;
  email: string;
  role: UserRole;
  iat?: number;
  exp?: number;
}

export interface ApiErrorBody {
  success: false;
  error: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
}

export interface AuthResponse {
  user: AuthUser;
  accessToken: string;
}

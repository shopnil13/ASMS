export type UserRole = "Student" | "Teacher" | "Admin";

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

export interface AuthUser {
  token: string;
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
}

export type LoginResponse = AuthUser;

export interface RegisterResponse {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
}

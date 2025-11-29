// src/features/auth/api/authApi.ts
import { api } from "@/lib/api";

const API_URL = import.meta.env.VITE_API_URL;

export interface User {
  id: number;
  name: string;
  email: string;
  avatar_url?: string;
  created_at: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
  remember?: boolean;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

// Get CSRF cookie (required before login/register for Sanctum SPA)
export async function getCsrfCookie(): Promise<void> {
  await fetch(`${API_URL}/sanctum/csrf-cookie`, {
    credentials: "include",
  });
}

// Login
export async function login(
  credentials: LoginCredentials
): Promise<AuthResponse> {
  await getCsrfCookie();

  const response = await api.post<{ data: User; token: string }>(
    "/api/login",
    credentials
  );

  if (response.token) {
    localStorage.setItem("token", response.token);
  }

  return { user: response.data, token: response.token };
}

// Register
export async function register(data: RegisterData): Promise<AuthResponse> {
  await getCsrfCookie();

  const response = await api.post<{ data: User; token: string }>(
    "/api/register",
    data
  );

  if (response.token) {
    localStorage.setItem("token", response.token);
  }

  return { user: response.data, token: response.token };
}

// Logout
export async function logout(): Promise<void> {
  try {
    await api.post("/api/logout");
  } finally {
    localStorage.removeItem("token");
  }
}

// Get current user
export async function fetchCurrentUser(): Promise<User | null> {
  const token = localStorage.getItem("token");

  if (!token) {
    return null;
  }

  try {
    const response = await api.get<{ data: User }>("/api/user");
    return response.data;
  } catch {
    localStorage.removeItem("token");
    return null;
  }
}

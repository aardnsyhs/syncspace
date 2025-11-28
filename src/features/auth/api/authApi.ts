// src/features/auth/api/authApi.ts
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

export interface ValidationError {
  message: string;
  errors: Record<string, string[]>;
}

// Helper untuk fetch dengan credentials
async function authFetch<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const res = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    credentials: "include",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  // Handle different error types
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));

    if (res.status === 422) {
      // Validation error
      const error = new Error(data.message || "Validation failed") as Error & {
        errors?: Record<string, string[]>;
        status?: number;
      };
      error.errors = data.errors;
      error.status = 422;
      throw error;
    }

    if (res.status === 401) {
      const error = new Error(data.message || "Unauthorized") as Error & {
        status?: number;
      };
      error.status = 401;
      throw error;
    }

    if (res.status === 419) {
      // CSRF token mismatch
      const error = new Error("Session expired. Please refresh.") as Error & {
        status?: number;
      };
      error.status = 419;
      throw error;
    }

    throw new Error(data.message || "Request failed");
  }

  return res.json();
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
  // Get CSRF cookie first
  await getCsrfCookie();

  const response = await authFetch<{ data: User; token: string }>(
    "/api/login",
    {
      method: "POST",
      body: JSON.stringify(credentials),
    }
  );

  // Store token for API calls
  if (response.token) {
    localStorage.setItem("token", response.token);
  }

  return { user: response.data, token: response.token };
}

// Register
export async function register(data: RegisterData): Promise<AuthResponse> {
  // Get CSRF cookie first
  await getCsrfCookie();

  const response = await authFetch<{ data: User; token: string }>(
    "/api/register",
    {
      method: "POST",
      body: JSON.stringify(data),
    }
  );

  // Store token for API calls
  if (response.token) {
    localStorage.setItem("token", response.token);
  }

  return { user: response.data, token: response.token };
}

// Logout
export async function logout(): Promise<void> {
  const token = localStorage.getItem("token");

  try {
    await fetch(`${API_URL}/api/logout`, {
      method: "POST",
      credentials: "include",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });
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
    const response = await fetch(`${API_URL}/api/user`, {
      credentials: "include",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      if (response.status === 401) {
        localStorage.removeItem("token");
        return null;
      }
      throw new Error("Failed to fetch user");
    }

    return response.json();
  } catch {
    localStorage.removeItem("token");
    return null;
  }
}

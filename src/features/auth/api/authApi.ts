import { api } from "@/lib/api";
import { TOKEN_KEY } from "@/lib/constants";

const API_URL = import.meta.env.VITE_API_URL;

export interface User {
  id: number;
  name: string;
  email: string;
  avatar_url?: string;
  email_notifications?: boolean;
  desktop_notifications?: boolean;
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

export interface ForgotPasswordData {
  email: string;
}

export interface ResetPasswordData {
  email: string;
  password: string;
  password_confirmation: string;
  token: string;
}

export interface VerifyOTPData {
  email: string;
  otp: string;
}

export interface ResendOTPData {
  email: string;
}

export async function getCsrfCookie(): Promise<void> {
  await fetch(`${API_URL}/sanctum/csrf-cookie`, {
    credentials: "include",
  });
}

export async function login(
  credentials: LoginCredentials
): Promise<AuthResponse> {
  await getCsrfCookie();

  const response = await api.post<{ data: User; token: string }>(
    "/api/login",
    credentials
  );

  if (response.token) {
    localStorage.setItem(TOKEN_KEY, response.token);
  }

  return { user: response.data, token: response.token };
}

export async function register(data: RegisterData): Promise<AuthResponse> {
  await getCsrfCookie();

  const response = await api.post<{ data: User; token: string }>(
    "/api/register",
    data
  );

  if (response.token) {
    localStorage.setItem(TOKEN_KEY, response.token);
  }

  return { user: response.data, token: response.token };
}

export async function logout(): Promise<void> {
  try {
    await api.post("/api/logout");
  } finally {
    localStorage.removeItem(TOKEN_KEY);
  }
}

export async function fetchCurrentUser(): Promise<User | null> {
  const token = localStorage.getItem(TOKEN_KEY);

  if (!token) {
    return null;
  }

  try {
    const response = await api.get<{ data: User }>("/api/user");
    return response.data;
  } catch {
    localStorage.removeItem(TOKEN_KEY);
    return null;
  }
}

export async function forgotPassword(
  data: ForgotPasswordData
): Promise<{ message: string }> {
  await getCsrfCookie();

  const response = await api.post<{ message: string }>(
    "/api/forgot-password",
    data
  );

  return response;
}

export async function resetPassword(
  data: ResetPasswordData
): Promise<{ message: string }> {
  await getCsrfCookie();

  const response = await api.post<{ message: string }>(
    "/api/reset-password",
    data
  );

  return response;
}

export async function verifyOTP(
  data: VerifyOTPData
): Promise<{ message: string; data: User; token: string }> {
  await getCsrfCookie();

  const response = await api.post<{
    message: string;
    data: User;
    token: string;
  }>("/api/verify-otp", data);

  if (response.token) {
    localStorage.setItem(TOKEN_KEY, response.token);
  }

  return response;
}

export async function resendOTP(
  data: ResendOTPData
): Promise<{ message: string }> {
  await getCsrfCookie();

  const response = await api.post<{ message: string }>("/api/resend-otp", data);

  return response;
}

export function getGoogleAuthUrl(): string {
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
  const redirectUri = `${window.location.origin}/auth/google/callback`;
  const scope = "openid email profile";

  const params = new URLSearchParams({
    client_id: clientId ?? "",
    redirect_uri: redirectUri,
    response_type: "code",
    scope: scope,
    access_type: "offline",
    prompt: "select_account",
  });

  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
}

export async function googleCallback(code: string): Promise<AuthResponse> {
  await getCsrfCookie();

  const response = await api.post<{ data: User; token: string }>(
    "/api/auth/google/callback",
    { code }
  );

  if (response.token) {
    localStorage.setItem(TOKEN_KEY, response.token);
  }

  return { user: response.data, token: response.token };
}

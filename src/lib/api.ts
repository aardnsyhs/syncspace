const API_URL = import.meta.env.VITE_API_URL;

interface RequestConfig extends RequestInit {
  params?: Record<string, string | number | boolean | undefined>;
}

interface ApiError extends Error {
  status: number;
  data?: unknown;
}

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private getToken(): string | null {
    return localStorage.getItem("token");
  }

  private buildUrl(endpoint: string, params?: RequestConfig["params"]): string {
    const url = new URL(`${this.baseUrl}${endpoint}`);

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          url.searchParams.append(key, String(value));
        }
      });
    }

    return url.toString();
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      const error = new Error("API Error") as ApiError;
      error.status = response.status;

      try {
        error.data = await response.json();
        error.message =
          (error.data as { message?: string })?.message ||
          `HTTP ${response.status}`;
      } catch {
        error.message = `HTTP ${response.status}`;
      }

      if (response.status === 401) {
        localStorage.removeItem("token");
        window.location.href = "/login";
      }

      throw error;
    }

    if (response.status === 204) {
      return null as T;
    }

    return response.json();
  }

  async request<T>(endpoint: string, config: RequestConfig = {}): Promise<T> {
    const { params, ...init } = config;
    const token = this.getToken();

    const headers: HeadersInit = {
      Accept: "application/json",
      ...init.headers,
    };

    if (init.body && !(init.body instanceof FormData)) {
      (headers as Record<string, string>)["Content-Type"] = "application/json";
    }

    if (token) {
      (headers as Record<string, string>)["Authorization"] = `Bearer ${token}`;
    }

    const response = await fetch(this.buildUrl(endpoint, params), {
      ...init,
      headers,
    });

    return this.handleResponse<T>(response);
  }

  get<T>(endpoint: string, params?: RequestConfig["params"]): Promise<T> {
    return this.request<T>(endpoint, { method: "GET", params });
  }

  post<T>(endpoint: string, data?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: "POST",
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  put<T>(endpoint: string, data?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: "PUT",
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  patch<T>(endpoint: string, data?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: "PATCH",
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: "DELETE" });
  }

  upload<T>(endpoint: string, formData: FormData): Promise<T> {
    return this.request<T>(endpoint, {
      method: "POST",
      body: formData,
    });
  }
}

export const api = new ApiClient(API_URL);

export type { ApiError, RequestConfig };

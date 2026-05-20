import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import {
  login as apiLogin,
  register as apiRegister,
  logout as apiLogout,
  fetchCurrentUser,
  getGoogleAuthUrl,
  googleCallback as apiGoogleCallback,
  type User,
  type LoginCredentials,
  type RegisterData,
} from "../api/authApi";
import { initializeEcho, disconnectEcho } from "@/lib/echo";
import { TOKEN_KEY } from "@/lib/constants";

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
}

interface AuthContextValue extends AuthState {
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
  updateUser: (updates: Partial<User>) => void;
  /** Call this after OTP verification to boot the WebSocket with the new token. */
  initEchoAfterVerification: () => void;
  loginWithGoogle: () => void;
  handleGoogleCallback: (code: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    isLoading: true,
    isAuthenticated: false,
    error: null,
  });

  // On mount: restore session from stored token and initialise Echo if valid.
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const user = await fetchCurrentUser();
        if (user) {
          const token = localStorage.getItem(TOKEN_KEY);
          if (token) {
            try {
              initializeEcho(token);
            } catch {
              // WebSocket failure is non-fatal — user is still authenticated.
            }
          }
        }
        setState({
          user,
          isLoading: false,
          isAuthenticated: !!user,
          error: null,
        });
      } catch {
        setState({
          user: null,
          isLoading: false,
          isAuthenticated: false,
          error: null,
        });
      }
    };

    checkAuth();

    return () => {
      disconnectEcho();
    };
  }, []);

  const login = useCallback(async (credentials: LoginCredentials) => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      const response = await apiLogin(credentials);

      setState({
        user: response.user,
        isLoading: false,
        isAuthenticated: true,
        error: null,
      });

      // Boot WebSocket AFTER setting auth state so a connection failure
      // never blocks a successful login or shows a false "invalid credentials" error.
      const token = localStorage.getItem(TOKEN_KEY) ?? response.token;
      try {
        initializeEcho(token);
      } catch (echoErr) {
        console.warn("[AuthContext] WebSocket init failed (non-fatal):", echoErr);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Login failed";
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: message,
      }));
      throw err;
    }
  }, []);

  const register = useCallback(async (data: RegisterData) => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      await apiRegister(data);
      // Registration does not issue a token — OTP verification does.
      // Echo is initialised in handleGoogleCallback / after OTP verification
      // via the VerifyOTPPage calling login() or the token being stored.
      setState((prev) => ({
        ...prev,
        isLoading: false,
      }));
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Registration failed";
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: message,
      }));
      throw err;
    }
  }, []);

  const logout = useCallback(async () => {
    setState((prev) => ({ ...prev, isLoading: true }));

    try {
      await apiLogout();
    } finally {
      // Disconnect WebSocket BEFORE clearing state so any in-flight
      // channel leave messages can still use the token.
      disconnectEcho();

      setState({
        user: null,
        isLoading: false,
        isAuthenticated: false,
        error: null,
      });
    }
  }, []);

  const clearError = useCallback(() => {
    setState((prev) => ({ ...prev, error: null }));
  }, []);

  const updateUser = useCallback((updates: Partial<User>) => {
    setState((prev) => ({
      ...prev,
      user: prev.user ? { ...prev.user, ...updates } : null,
    }));
  }, []);

  /**
   * Initialise Echo using the token that was just stored in localStorage
   * by `verifyOTP()`. Call this from VerifyOTPPage after a successful
   * verification so the WebSocket is ready before the user hits /app.
   */
  const initEchoAfterVerification = useCallback(() => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (token) initializeEcho(token);
  }, []);

  const loginWithGoogle = useCallback(() => {
    const url = getGoogleAuthUrl();
    window.location.href = url;
  }, []);

  const handleGoogleCallback = useCallback(async (code: string) => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      const response = await apiGoogleCallback(code);

      setState({
        user: response.user,
        isLoading: false,
        isAuthenticated: true,
        error: null,
      });

      const token = localStorage.getItem(TOKEN_KEY) ?? response.token;
      try {
        initializeEcho(token);
      } catch (echoErr) {
        console.warn("[AuthContext] WebSocket init failed (non-fatal):", echoErr);
      }
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Google login failed";
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: message,
      }));
      throw err;
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        ...state,
        login,
        register,
        logout,
        clearError,
        updateUser,
        initEchoAfterVerification,
        loginWithGoogle,
        handleGoogleCallback,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

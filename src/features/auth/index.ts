// src/features/auth/index.ts

// Pages
export { LoginPage } from "./pages/LoginPage";
export { RegisterPage } from "./pages/RegisterPage";

// Components
export { AuthLayout } from "./components/AuthLayout";
export { ProtectedRoute } from "./components/ProtectedRoute";
export { GuestRoute } from "./components/GuestRoute";

// Store/Context
export { AuthProvider, useAuth } from "./store/AuthContext";

// API
export {
  login,
  register,
  logout,
  fetchCurrentUser,
  type User,
  type LoginCredentials,
  type RegisterData,
} from "./api/authApi";

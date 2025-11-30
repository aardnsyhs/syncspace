export { LoginPage } from "./pages/LoginPage";
export { RegisterPage } from "./pages/RegisterPage";

export { AuthLayout } from "./components/AuthLayout";
export { ProtectedRoute } from "./components/ProtectedRoute";
export { GuestRoute } from "./components/GuestRoute";

export { AuthProvider, useAuth } from "./store/AuthContext";

export {
  login,
  register,
  logout,
  fetchCurrentUser,
  type User,
  type LoginCredentials,
  type RegisterData,
} from "./api/authApi";

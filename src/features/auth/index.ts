export { LoginPage } from "./pages/LoginPage";
export { RegisterPage } from "./pages/RegisterPage";
export { ForgotPasswordPage } from "./pages/ForgotPasswordPage";
export { ResetPasswordPage } from "./pages/ResetPasswordPage";
export { VerifyOTPPage } from "./pages/VerifyOTPPage";

export { AuthLayout } from "./components/AuthLayout";
export { ProtectedRoute } from "./components/ProtectedRoute";
export { GuestRoute } from "./components/GuestRoute";

export { AuthProvider, useAuth } from "./store/AuthContext";

export {
  login,
  register,
  logout,
  fetchCurrentUser,
  forgotPassword,
  resetPassword,
  verifyOTP,
  resendOTP,
  type User,
  type LoginCredentials,
  type RegisterData,
  type ForgotPasswordData,
  type ResetPasswordData,
  type VerifyOTPData,
  type ResendOTPData,
} from "./api/authApi";

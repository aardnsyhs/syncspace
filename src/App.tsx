import {
  BrowserRouter,
  Routes,
  Route,
  useParams,
  Navigate,
} from "react-router-dom";
import { Toaster } from "sonner";

import { ErrorBoundary } from "@/components/ErrorBoundary";
import { MainLayout } from "@/components/layout";
import { BoardPage, PublicBoardPage } from "@/features/boards";
import {
  AuthProvider,
  LoginPage,
  RegisterPage,
  ProtectedRoute,
  GuestRoute,
} from "@/features/auth";

function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<Navigate to="/app" replace />} />

            {/* Auth routes (guest only) */}
            <Route
              path="/login"
              element={
                <GuestRoute>
                  <LoginPage />
                </GuestRoute>
              }
            />
            <Route
              path="/register"
              element={
                <GuestRoute>
                  <RegisterPage />
                </GuestRoute>
              }
            />

            {/* Public board route - no auth required */}
            <Route path="/p/:token" element={<PublicBoardWrapper />} />

            {/* Protected routes */}
            <Route
              path="/app/*"
              element={
                <ProtectedRoute>
                  <MainLayout>
                    <BoardPage />
                  </MainLayout>
                </ProtectedRoute>
              }
            />

            {/* Catch all - redirect to app */}
            <Route path="*" element={<Navigate to="/app" replace />} />
          </Routes>

          <Toaster position="top-right" richColors />
        </AuthProvider>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

// Wrapper to extract token from URL params
function PublicBoardWrapper() {
  const { token } = useParams<{ token: string }>();
  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Invalid board link</p>
      </div>
    );
  }
  return <PublicBoardPage publicToken={token} />;
}

export default App;

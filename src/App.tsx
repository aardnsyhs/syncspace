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

// Simple placeholder pages
function DashboardPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <p className="text-muted-foreground">Welcome to Syncspace!</p>
    </div>
  );
}

function MembersPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Team Members</h1>
      <p className="text-muted-foreground">Manage your team members here.</p>
    </div>
  );
}

function SettingsPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Settings</h1>
      <p className="text-muted-foreground">
        Configure your workspace settings.
      </p>
    </div>
  );
}

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
              path="/app"
              element={
                <ProtectedRoute>
                  <MainLayout>
                    <DashboardPage />
                  </MainLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/app/boards"
              element={
                <ProtectedRoute>
                  <MainLayout>
                    <DashboardPage />
                  </MainLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/app/boards/:boardId"
              element={
                <ProtectedRoute>
                  <MainLayout>
                    <BoardPageWrapper />
                  </MainLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/app/members"
              element={
                <ProtectedRoute>
                  <MainLayout>
                    <MembersPage />
                  </MainLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/app/settings"
              element={
                <ProtectedRoute>
                  <MainLayout>
                    <SettingsPage />
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

// Wrapper to extract boardId from URL params
function BoardPageWrapper() {
  const { boardId } = useParams<{ boardId: string }>();
  return <BoardPage boardId={boardId ? parseInt(boardId) : undefined} />;
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

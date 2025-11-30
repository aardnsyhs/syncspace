import { lazy, Suspense, useState, useEffect } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  useParams,
  Navigate,
} from "react-router-dom";
import { Toaster } from "sonner";
import { Loader2 } from "lucide-react";

import { ErrorBoundary } from "@/components/ErrorBoundary";
import { MainLayout } from "@/components/layout";
import { AuthProvider, ProtectedRoute, GuestRoute } from "@/features/auth";

const LoginPage = lazy(() =>
  import("@/features/auth").then((m) => ({ default: m.LoginPage }))
);
const RegisterPage = lazy(() =>
  import("@/features/auth").then((m) => ({ default: m.RegisterPage }))
);
const DashboardPage = lazy(() =>
  import("@/features/dashboard").then((m) => ({ default: m.DashboardPage }))
);
const BoardsListPage = lazy(() =>
  import("@/features/boards").then((m) => ({ default: m.BoardsListPage }))
);
const BoardPage = lazy(() =>
  import("@/features/boards").then((m) => ({ default: m.BoardPage }))
);
const PublicBoardPage = lazy(() =>
  import("@/features/boards").then((m) => ({ default: m.PublicBoardPage }))
);
const MembersPage = lazy(() =>
  import("@/features/members").then((m) => ({ default: m.MembersPage }))
);
const SettingsPage = lazy(() =>
  import("@/features/settings").then((m) => ({ default: m.SettingsPage }))
);
const ProfilePage = lazy(() =>
  import("@/features/profile").then((m) => ({ default: m.ProfilePage }))
);

function PageLoader() {
  return (
    <div className="flex items-center justify-center h-screen">
      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
    </div>
  );
}

function App() {
  const [theme, setTheme] = useState<"light" | "dark">("dark");

  useEffect(() => {
    const checkTheme = () => {
      const isDark = document.documentElement.classList.contains("dark");
      setTheme(isDark ? "dark" : "light");
    };

    checkTheme();

    const observer = new MutationObserver(checkTheme);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => observer.disconnect();
  }, []);

  return (
    <ErrorBoundary>
      <BrowserRouter>
        <AuthProvider>
          <Suspense fallback={<PageLoader />}>
            <Routes>
              {}
              <Route path="/" element={<Navigate to="/app" replace />} />

              {}
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

              {}
              <Route path="/p/:token" element={<PublicBoardWrapper />} />

              {}
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
                      <BoardsListPage />
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
              <Route
                path="/app/profile"
                element={
                  <ProtectedRoute>
                    <MainLayout>
                      <ProfilePage />
                    </MainLayout>
                  </ProtectedRoute>
                }
              />

              {}
              <Route path="*" element={<Navigate to="/app" replace />} />
            </Routes>
          </Suspense>

          <Toaster
            position="top-right"
            theme={theme}
            toastOptions={{
              classNames: {
                toast: "bg-card text-card-foreground border-border",
                success: "border-green-500/50",
                error: "border-destructive/50",
                warning: "border-yellow-500/50",
                info: "border-blue-500/50",
              },
            }}
          />
        </AuthProvider>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

function BoardPageWrapper() {
  const { boardId } = useParams<{ boardId: string }>();
  return <BoardPage boardId={boardId ? parseInt(boardId) : undefined} />;
}

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

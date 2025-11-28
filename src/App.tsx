import { BrowserRouter, Routes, Route, useParams } from "react-router-dom";
import { MainLayout } from "@/components/layout";
import { BoardPage, PublicBoardPage } from "@/features/boards";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public board route - no auth required */}
        <Route path="/p/:token" element={<PublicBoardWrapper />} />

        {/* Protected routes */}
        <Route
          path="/*"
          element={
            <MainLayout>
              <BoardPage />
            </MainLayout>
          }
        />
      </Routes>
    </BrowserRouter>
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

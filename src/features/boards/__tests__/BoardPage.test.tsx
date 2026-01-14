// src/features/boards/__tests__/BoardPage.test.tsx
import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import { render } from "@/test/utils";
import { BoardPage } from "../pages/BoardPage";
import { TeamProvider } from "@/features/team";

// Mock useParams
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => vi.fn(),
    useParams: () => ({ boardId: "1" }),
  };
});

// Wrapper with TeamProvider
function TestWrapper({ children }: { children: React.ReactNode }) {
  return <TeamProvider>{children}</TeamProvider>;
}

describe("BoardPage", () => {
  beforeEach(() => {
    localStorage.setItem("token", "mock-token-12345");
  });

  it("shows board content after loading", async () => {
    render(
      <TestWrapper>
        <BoardPage />
      </TestWrapper>
    );

    // Wait for board name to appear after loading
    await waitFor(
      () => {
        expect(screen.getByText("Test Board")).toBeInTheDocument();
      },
      { timeout: 3000 }
    );
  });

  it("fetches and displays board data", async () => {
    render(
      <TestWrapper>
        <BoardPage />
      </TestWrapper>
    );

    await waitFor(
      () => {
        expect(screen.getByText("Test Board")).toBeInTheDocument();
      },
      { timeout: 3000 }
    );
  });

  it("displays column headers", async () => {
    render(
      <TestWrapper>
        <BoardPage />
      </TestWrapper>
    );

    await waitFor(
      () => {
        expect(screen.getByText("To Do")).toBeInTheDocument();
        expect(screen.getByText("In Progress")).toBeInTheDocument();
      },
      { timeout: 3000 }
    );
  });

  it("displays cards in columns", async () => {
    render(
      <TestWrapper>
        <BoardPage />
      </TestWrapper>
    );

    await waitFor(
      () => {
        expect(screen.getByText("Test Card 1")).toBeInTheDocument();
      },
      { timeout: 3000 }
    );
  });
});

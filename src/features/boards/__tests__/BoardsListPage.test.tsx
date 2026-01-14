// src/features/boards/__tests__/BoardsListPage.test.tsx
import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import { render } from "@/test/utils";
import { BoardsListPage } from "../pages/BoardsListPage";
import { TeamProvider } from "@/features/team";

// Mock useNavigate
const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useParams: () => ({ teamId: "1" }),
  };
});

// Wrapper with TeamProvider
function TestWrapper({ children }: { children: React.ReactNode }) {
  return <TeamProvider>{children}</TeamProvider>;
}

describe("BoardsListPage", () => {
  beforeEach(() => {
    localStorage.setItem("token", "mock-token-12345");
    mockNavigate.mockClear();
  });

  it("renders page header with title", async () => {
    render(
      <TestWrapper>
        <BoardsListPage />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(
        screen.getByRole("heading", { name: /boards/i })
      ).toBeInTheDocument();
    });
  });

  it("shows loading state initially", () => {
    render(
      <TestWrapper>
        <BoardsListPage />
      </TestWrapper>
    );

    // Should show loader while team data is loading
    expect(document.querySelector(".animate-spin")).toBeInTheDocument();
  });

  it("has New Board button", async () => {
    render(
      <TestWrapper>
        <BoardsListPage />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: /new board/i })
      ).toBeInTheDocument();
    });
  });
});

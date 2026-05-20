/**
 * TeamContext
 * ===========
 * Provides the list of workspaces (teams) the authenticated user belongs to,
 * the currently-selected workspace, and real-time updates for each workspace.
 *
 * ─── WebSocket strategy ─────────────────────────────────────────────────────
 * Each team gets its own private channel subscription. Subscriptions are
 * managed incrementally: when a new team is added to the list we subscribe
 * to its channel; when a team is removed we leave only that channel.
 *
 * This avoids the "full reconnect storm" that occurred when the previous
 * implementation used `teams.length` as a dependency and tore down ALL
 * channels on every list change.
 *
 * A `subscribedTeamIds` ref tracks which channels are currently open so we
 * never double-subscribe and always clean up the correct set on unmount.
 */

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  useCallback,
  type ReactNode,
} from "react";
import { api } from "@/lib/api";
import { getEcho } from "@/lib/echo";
import { SELECTED_WORKSPACE_KEY, TOKEN_KEY } from "@/lib/constants";
import { useAuth } from "@/features/auth/store/AuthContext";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface Board {
  id: number;
  name: string;
  description?: string | null;
  color?: string | null;
  cards_count?: number;
  members_count?: number;
  created_at?: string;
}

interface Team {
  id: number;
  name: string;
  slug: string;
  owner_id: number;
  members_count?: number;
  boards_count?: number;
  boards?: Board[];
}

interface TeamContextType {
  teams: Team[];
  selectedTeam: Team | null;
  isLoading: boolean;
  setSelectedTeam: (team: Team) => void;
  refreshTeams: () => Promise<void>;
  createTeam: (name: string) => Promise<Team | null>;
}

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

const TeamContext = createContext<TeamContextType | undefined>(undefined);

const SELECTED_TEAM_KEY = SELECTED_WORKSPACE_KEY;

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------

export function TeamProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth();
  const [teams, setTeams] = useState<Team[]>([]);
  const [selectedTeam, setSelectedTeamState] = useState<Team | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  /**
   * Tracks which team IDs currently have an active channel subscription.
   * Using a ref (not state) so mutations don't trigger re-renders.
   */
  const subscribedTeamIds = useRef<Set<number>>(new Set());

  // ---------------------------------------------------------------------------
  // Data fetching
  // ---------------------------------------------------------------------------

  const fetchTeams = useCallback(async () => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) {
      setIsLoading(false);
      return;
    }

    try {
      const data = await api.get<{ data: Team[] }>("/api/teams");
      const fetchedTeams = data.data || [];
      setTeams(fetchedTeams);

      const savedTeamId = localStorage.getItem(SELECTED_TEAM_KEY);
      if (savedTeamId) {
        const savedTeam = fetchedTeams.find(
          (t) => t.id === parseInt(savedTeamId)
        );
        if (savedTeam) {
          setSelectedTeamState(savedTeam);
          return;
        }
      }

      if (fetchedTeams.length > 0) {
        setSelectedTeamState((prev) => {
          if (prev) return prev; // keep existing selection
          localStorage.setItem(
            SELECTED_TEAM_KEY,
            fetchedTeams[0].id.toString()
          );
          return fetchedTeams[0];
        });
      }
    } catch (error) {
      console.error("Failed to fetch teams:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      fetchTeams();
    } else {
      // User logged out — clear team state.
      setTeams([]);
      setSelectedTeamState(null);
      setIsLoading(false);
    }
  }, [fetchTeams, isAuthenticated]);

  // ---------------------------------------------------------------------------
  // Incremental WebSocket subscriptions
  // ---------------------------------------------------------------------------

  /**
   * Subscribe to a single team's private channel.
   * Registers all team-level event handlers and records the team ID in the
   * `subscribedTeamIds` ref so we can clean up precisely later.
   */
  const subscribeToTeam = useCallback(
    (team: Team) => {
      const echo = getEcho();
      if (!echo || subscribedTeamIds.current.has(team.id)) return;

      const channel = echo.private(`team.${team.id}`);
      subscribedTeamIds.current.add(team.id);

      channel.listen(".BoardCreated", (payload: { board: Board }) => {
        setTeams((prev) =>
          prev.map((t) =>
            t.id === team.id
              ? { ...t, boards: [...(t.boards ?? []), payload.board] }
              : t
          )
        );
        setSelectedTeamState((prev) =>
          prev?.id === team.id
            ? { ...prev, boards: [...(prev.boards ?? []), payload.board] }
            : prev
        );
      });

      channel.listen(".BoardDeleted", (payload: { board_id: number }) => {
        setTeams((prev) =>
          prev.map((t) =>
            t.id === team.id
              ? {
                  ...t,
                  boards: (t.boards ?? []).filter(
                    (b) => b.id !== payload.board_id
                  ),
                }
              : t
          )
        );
        setSelectedTeamState((prev) =>
          prev?.id === team.id
            ? {
                ...prev,
                boards: (prev.boards ?? []).filter(
                  (b) => b.id !== payload.board_id
                ),
              }
            : prev
        );
      });

      channel.listen(".TeamUpdated", (payload: { team: Team }) => {
        setTeams((prev) =>
          prev.map((t) =>
            t.id === payload.team.id ? { ...t, ...payload.team } : t
          )
        );
        setSelectedTeamState((prev) =>
          prev?.id === payload.team.id ? { ...prev, ...payload.team } : prev
        );
      });

      channel.listen(".TeamDeleted", (payload: { team_id: number }) => {
        setTeams((prev) => {
          const remaining = prev.filter((t) => t.id !== payload.team_id);
          setSelectedTeamState((sel) => {
            if (sel?.id !== payload.team_id) return sel;
            return remaining.length > 0 ? remaining[0] : null;
          });
          return remaining;
        });
        // Clean up the subscription for the deleted team.
        unsubscribeFromTeam(payload.team_id);
      });

      channel.listen(".TeamMemberAdded", () => fetchTeams());
      channel.listen(".TeamMemberRemoved", () => fetchTeams());
    },
    [fetchTeams] // eslint-disable-line react-hooks/exhaustive-deps
  );

  /** Leave a single team channel and remove it from the tracking ref. */
  const unsubscribeFromTeam = useCallback((teamId: number) => {
    const echo = getEcho();
    if (echo) {
      try {
        echo.leave(`team.${teamId}`);
      } catch {
        // Echo may already be disconnected (e.g. on logout).
      }
    }
    subscribedTeamIds.current.delete(teamId);
  }, []);

  /**
   * When the teams list changes, subscribe to any NEW teams and leave any
   * channels for teams that are no longer in the list.
   */
  useEffect(() => {
    if (teams.length === 0) return;

    const currentIds = new Set(teams.map((t) => t.id));

    // Subscribe to teams we haven't subscribed to yet.
    teams.forEach((team) => {
      if (!subscribedTeamIds.current.has(team.id)) {
        subscribeToTeam(team);
      }
    });

    // Unsubscribe from teams that were removed from the list.
    subscribedTeamIds.current.forEach((id) => {
      if (!currentIds.has(id)) {
        unsubscribeFromTeam(id);
      }
    });
  }, [teams, subscribeToTeam, unsubscribeFromTeam]);

  // Leave ALL channels on unmount (e.g. full app teardown / logout).
  useEffect(() => {
    return () => {
      subscribedTeamIds.current.forEach((id) => unsubscribeFromTeam(id));
    };
  }, [unsubscribeFromTeam]);

  // ---------------------------------------------------------------------------
  // Public actions
  // ---------------------------------------------------------------------------

  const setSelectedTeam = useCallback((team: Team) => {
    setSelectedTeamState(team);
    localStorage.setItem(SELECTED_TEAM_KEY, team.id.toString());
  }, []);

  const refreshTeams = useCallback(async () => {
    setIsLoading(true);
    await fetchTeams();
  }, [fetchTeams]);

  const createTeam = useCallback(
    async (name: string): Promise<Team | null> => {
      try {
        const data = await api.post<{ data: Team }>("/api/teams", { name });
        const newTeam = data.data;
        setTeams((prev) => [...prev, newTeam]);
        setSelectedTeam(newTeam);
        return newTeam;
      } catch (error) {
        console.error("Failed to create team:", error);
        return null;
      }
    },
    [setSelectedTeam]
  );

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <TeamContext.Provider
      value={{
        teams,
        selectedTeam,
        isLoading,
        setSelectedTeam,
        refreshTeams,
        createTeam,
      }}
    >
      {children}
    </TeamContext.Provider>
  );
}

export function useTeam() {
  const context = useContext(TeamContext);
  if (context === undefined) {
    throw new Error("useTeam must be used within a TeamProvider");
  }
  return context;
}

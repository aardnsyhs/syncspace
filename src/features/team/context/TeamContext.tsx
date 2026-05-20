import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import { api } from "@/lib/api";
import { getEcho, initializeEcho } from "@/lib/echo";
import { SELECTED_WORKSPACE_KEY, TOKEN_KEY } from "@/lib/constants";

interface Team {
  id: number;
  name: string;
  slug: string;
  owner_id: number;
  members_count?: number;
  boards_count?: number;
  boards?: Board[];
}

interface Board {
  id: number;
  name: string;
  description?: string | null;
  color?: string | null;
  cards_count?: number;
  members_count?: number;
  created_at?: string;
}

interface TeamContextType {
  teams: Team[];
  selectedTeam: Team | null;
  isLoading: boolean;
  setSelectedTeam: (team: Team) => void;
  refreshTeams: () => Promise<void>;
  createTeam: (name: string) => Promise<Team | null>;
}

const TeamContext = createContext<TeamContextType | undefined>(undefined);

const SELECTED_TEAM_KEY = SELECTED_WORKSPACE_KEY;

export function TeamProvider({ children }: { children: ReactNode }) {
  const [teams, setTeams] = useState<Team[]>([]);
  const [selectedTeam, setSelectedTeamState] = useState<Team | null>(null);
  const [isLoading, setIsLoading] = useState(true);

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

      if (fetchedTeams.length > 0 && !selectedTeam) {
        setSelectedTeamState(fetchedTeams[0]);
        localStorage.setItem(SELECTED_TEAM_KEY, fetchedTeams[0].id.toString());
      }
    } catch (error) {
      console.error("Failed to fetch teams:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTeams();
  }, [fetchTeams]);

  useEffect(() => {
    if (teams.length === 0) return;

    const echo = getEcho() || initializeEcho();
    const channels: ReturnType<typeof echo.private>[] = [];

    teams.forEach((team) => {
      const channel = echo.private(`team.${team.id}`);
      channels.push(channel);

      channel.listen(".BoardCreated", (payload: { board: Board }) => {
        setTeams((prev) =>
          prev.map((t) =>
            t.id === team.id
              ? { ...t, boards: [...(t.boards || []), payload.board] }
              : t
          )
        );
        setSelectedTeamState((prev) =>
          prev?.id === team.id
            ? { ...prev, boards: [...(prev.boards || []), payload.board] }
            : prev
        );
      });

      channel.listen(".BoardDeleted", (payload: { board_id: number }) => {
        setTeams((prev) =>
          prev.map((t) =>
            t.id === team.id
              ? {
                  ...t,
                  boards: (t.boards || []).filter(
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
                boards: (prev.boards || []).filter(
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
        setTeams((prev) => prev.filter((t) => t.id !== payload.team_id));
        setSelectedTeamState((prev) => {
          if (prev?.id === payload.team_id) {
            const remaining = teams.filter((t) => t.id !== payload.team_id);
            return remaining.length > 0 ? remaining[0] : null;
          }
          return prev;
        });
      });

      channel.listen(".TeamMemberAdded", () => {
        fetchTeams();
      });

      channel.listen(".TeamMemberRemoved", () => {
        fetchTeams();
      });
    });

    return () => {
      teams.forEach((team) => {
        echo.leave(`team.${team.id}`);
      });
    };
  }, [teams.length, fetchTeams]);

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

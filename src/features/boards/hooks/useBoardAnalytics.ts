import { useState, useEffect, useCallback } from "react";

const API_URL = import.meta.env.VITE_API_URL;

// Types
export interface ColumnStat {
  id: number;
  name: string;
  position: number;
  card_count: number;
}

export interface AnalyticsSummary {
  total_cards: number;
  columns: ColumnStat[];
  completed_last_7_days: number;
  completed_last_30_days: number;
  avg_cycle_time_days: number | null;
  avg_lead_time_days: number | null;
  wip_count: number;
}

export interface ThroughputData {
  week_start: string;
  week_end: string;
  completed_count: number;
}

export interface CumulativeFlowDay {
  date: string;
  columns: Record<number, number>;
}

export interface CumulativeFlowData {
  data: CumulativeFlowDay[];
  columns: { id: number; name: string; position: number }[];
}

export interface AssigneeData {
  assignee_id: number | null;
  assignee_name: string;
  assignee_avatar: string | null;
  card_count: number;
}

// Hook for summary analytics
export function useBoardAnalyticsSummary(
  boardId: number | null,
  token: string | null
) {
  const [data, setData] = useState<AnalyticsSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!boardId || !token) {
      setData(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `${API_URL}/api/boards/${boardId}/analytics/summary`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        }
      );

      if (!response.ok) throw new Error("Failed to fetch analytics summary");

      const json = await response.json();
      setData(json.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setIsLoading(false);
    }
  }, [boardId, token]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, isLoading, error, refetch: fetchData };
}

// Hook for throughput data
export function useBoardThroughput(
  boardId: number | null,
  token: string | null,
  weeks = 6
) {
  const [data, setData] = useState<ThroughputData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!boardId || !token) {
      setData([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `${API_URL}/api/boards/${boardId}/analytics/throughput?weeks=${weeks}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        }
      );

      if (!response.ok) throw new Error("Failed to fetch throughput data");

      const json = await response.json();
      setData(json.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setIsLoading(false);
    }
  }, [boardId, token, weeks]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, isLoading, error, refetch: fetchData };
}

// Hook for cumulative flow data
export function useBoardCumulativeFlow(
  boardId: number | null,
  token: string | null,
  days = 30
) {
  const [data, setData] = useState<CumulativeFlowData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!boardId || !token) {
      setData(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `${API_URL}/api/boards/${boardId}/analytics/cumulative-flow?days=${days}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        }
      );

      if (!response.ok) throw new Error("Failed to fetch cumulative flow data");

      const json = await response.json();
      setData(json);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setIsLoading(false);
    }
  }, [boardId, token, days]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, isLoading, error, refetch: fetchData };
}

// Hook for assignee distribution
export function useBoardAssigneeDistribution(
  boardId: number | null,
  token: string | null
) {
  const [data, setData] = useState<AssigneeData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!boardId || !token) {
      setData([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `${API_URL}/api/boards/${boardId}/analytics/assignees`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        }
      );

      if (!response.ok)
        throw new Error("Failed to fetch assignee distribution");

      const json = await response.json();
      setData(json.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setIsLoading(false);
    }
  }, [boardId, token]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, isLoading, error, refetch: fetchData };
}

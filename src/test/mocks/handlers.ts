import { http, HttpResponse } from "msw";

const API_URL = "http://syncspace-api.test";

const mockUser = {
  id: 1,
  name: "Test User",
  email: "test@example.com",
  created_at: "2025-01-01T00:00:00.000Z",
};

const mockBoard = {
  id: 1,
  name: "Test Board",
  description: "A test board",
  team_id: 1,
  is_public: false,
  columns: [
    {
      id: 1,
      name: "To Do",
      position: 0,
      wip_limit: null,
      cards: [
        {
          id: 1,
          title: "Test Card 1",
          description: "Description 1",
          position: 0,
          due_date: null,
          labels: [],
        },
      ],
    },
    {
      id: 2,
      name: "In Progress",
      position: 1,
      wip_limit: 3,
      cards: [],
    },
  ],
};

const mockTeam = {
  id: 1,
  name: "Test Team",
  slug: "test-team",
  owner_id: 1,
  created_at: "2025-01-01T00:00:00.000Z",
  boards: [
    {
      id: 1,
      name: "Test Board",
      description: "A test board",
      color: "#3b82f6",
      cards_count: 5,
      members_count: 3,
      created_at: "2025-01-01T00:00:00.000Z",
    },
    {
      id: 2,
      name: "Another Board",
      description: null,
      color: "#10b981",
      cards_count: 0,
      members_count: 1,
      created_at: "2025-01-02T00:00:00.000Z",
    },
  ],
  pivot: { role: "owner" },
};

const mockEmptyTeam = {
  id: 2,
  name: "Empty Team",
  slug: "empty-team",
  owner_id: 1,
  created_at: "2025-01-01T00:00:00.000Z",
  boards: [],
  pivot: { role: "owner" },
};

export const mockTeams = [mockTeam, mockEmptyTeam];

export const handlers = [
  http.get(`${API_URL}/sanctum/csrf-cookie`, () => {
    return new HttpResponse(null, { status: 204 });
  }),

  http.post(`${API_URL}/api/login`, async ({ request }) => {
    const body = (await request.json()) as { email: string; password: string };

    if (body.email === "test@example.com" && body.password === "password123") {
      return HttpResponse.json({
        data: mockUser,
        token: "mock-token-12345",
      });
    }

    return HttpResponse.json(
      {
        message: "The provided credentials are incorrect.",
        errors: {
          email: ["The provided credentials are incorrect."],
        },
      },
      { status: 422 }
    );
  }),

  http.post(`${API_URL}/api/register`, async ({ request }) => {
    const body = (await request.json()) as {
      name: string;
      email: string;
      password: string;
    };

    if (body.email === "existing@example.com") {
      return HttpResponse.json(
        {
          message: "The email has already been taken.",
          errors: {
            email: ["The email has already been taken."],
          },
        },
        { status: 422 }
      );
    }

    return HttpResponse.json(
      {
        data: {
          id: 2,
          name: body.name,
          email: body.email,
          created_at: new Date().toISOString(),
        },
        token: "mock-token-new-user",
      },
      { status: 201 }
    );
  }),

  http.post(`${API_URL}/api/logout`, () => {
    return HttpResponse.json({ message: "Logged out successfully." });
  }),

  http.get(`${API_URL}/api/user`, ({ request }) => {
    const authHeader = request.headers.get("Authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return HttpResponse.json(
        { message: "Unauthenticated." },
        { status: 401 }
      );
    }

    return HttpResponse.json(mockUser);
  }),

  http.get(`${API_URL}/api/teams`, () => {
    return HttpResponse.json({ data: mockTeams });
  }),

  http.get(`${API_URL}/api/teams/:teamId`, () => {
    return HttpResponse.json({ data: mockTeams[0] });
  }),

  http.get(`${API_URL}/api/teams/:teamId/boards`, () => {
    return HttpResponse.json({ data: mockTeams[0].boards });
  }),

  http.post(`${API_URL}/api/teams/:teamId/boards`, async ({ request }) => {
    const body = (await request.json()) as {
      name: string;
      description?: string;
    };
    return HttpResponse.json(
      {
        data: {
          id: 3,
          name: body.name,
          description: body.description || null,
          color: "#3b82f6",
          cards_count: 0,
          members_count: 1,
          created_at: new Date().toISOString(),
        },
      },
      { status: 201 }
    );
  }),

  http.get(`${API_URL}/api/teams/:teamId/members`, () => {
    return HttpResponse.json({
      data: [
        { id: 1, name: "Test User", email: "test@example.com", role: "owner" },
      ],
    });
  }),

  http.get(`${API_URL}/api/boards/:boardId/activities`, () => {
    return HttpResponse.json({ data: [] });
  }),

  http.get(`${API_URL}/api/boards/:boardId`, () => {
    return HttpResponse.json({ data: mockBoard });
  }),

  http.get(`${API_URL}/api/boards/:boardId/cards`, () => {
    return HttpResponse.json({
      data: {
        cards: mockBoard.columns.flatMap((col) =>
          col.cards.map((card) => ({ ...card, column_id: col.id }))
        ),
        columns: mockBoard.columns.map((col) => ({
          id: col.id,
          name: col.name,
          position: col.position,
          wip_limit: col.wip_limit,
          card_count: col.cards.length,
          wip_exceeded: col.wip_limit
            ? col.cards.length > col.wip_limit
            : false,
        })),
      },
    });
  }),

  http.get(`${API_URL}/api/cards/:cardId`, () => {
    return HttpResponse.json({
      data: {
        id: 1,
        title: "Test Card 1",
        description: "Description 1",
        column_id: 1,
        position: 0,
        due_date: null,
        labels: [{ id: 1, name: "Bug", color: "#ef4444", board_id: 1 }],
        checklists: [],
        attachments: [],
      },
    });
  }),

  http.get(`${API_URL}/api/cards/:cardId/checklists`, () => {
    return HttpResponse.json({
      data: [
        {
          id: 1,
          title: "Tasks",
          items: [
            { id: 1, title: "Task 1", is_completed: true, position: 0 },
            { id: 2, title: "Task 2", is_completed: false, position: 1 },
          ],
          progress: { total: 2, completed: 1, percentage: 50 },
        },
      ],
    });
  }),

  http.get(`${API_URL}/api/cards/:cardId/attachments`, () => {
    return HttpResponse.json({ data: [] });
  }),

  http.get(`${API_URL}/api/boards/:boardId/labels`, () => {
    return HttpResponse.json({
      data: [
        { id: 1, name: "Bug", color: "#ef4444", board_id: 1 },
        { id: 2, name: "Feature", color: "#22c55e", board_id: 1 },
      ],
    });
  }),
];

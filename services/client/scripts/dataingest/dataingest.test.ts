import {
  parseSessions,
  groupDataByRelevance,
  groupSessionsByUser,
  calculateSessionStats,
} from "./dataingest";
import { SessionEvent, GroupedSession } from "./types";

// Mock fs module
jest.mock("fs", () => ({
  readFileSync: jest.fn().mockReturnValue(`
    {"uuid":"1","user_id":"user1","session_id":"session1","path":"/home","css":"body","text":"Welcome","value":null,"event_time":"2025-01-01T10:00:00Z"}
    {"uuid":"2","user_id":"user1","session_id":"session1","path":"/products","css":"#search-bar","text":"Search","value":"laptop","event_time":"2025-01-01T10:01:00Z"}
    {"uuid":"3","user_id":"user2","session_id":"session2","path":"/home","css":"body","text":"Welcome","value":null,"event_time":"2025-01-01T11:00:00Z"}
    {"uuid":"4","user_id":"user2","session_id":"session2","path":"/products/1","css":".product","text":"Product A","value":null,"event_time":"2025-01-01T11:01:00Z"}
    {"uuid":"5","user_id":"user1","session_id":"session1","path":"/error","css":"error-message","text":"Error occurred","value":null,"event_time":"2025-01-01T10:02:00Z"}
  `),
}));

// Mock path module
jest.mock("path", () => ({
  dirname: jest.fn().mockReturnValue("/mock/dir"),
  join: jest.fn().mockImplementation((...args) => args.join("/")),
}));

// Mock fileURLToPath
jest.mock("url", () => ({
  fileURLToPath: jest.fn().mockReturnValue("/mock/dir/dataingest.ts"),
}));

describe("parseSessions", () => {
  it("should parse sessions from JSON file", () => {
    const sessions = parseSessions();
    expect(sessions).toHaveLength(5);
    expect(sessions[0]).toHaveProperty("uuid", "1");
    expect(sessions[0]).toHaveProperty("user_id", "user1");
  });
});

describe("groupDataByRelevance", () => {
  it("should group data by user sessions", () => {
    const sessions = parseSessions();
    const groupedData = groupDataByRelevance(sessions);

    expect(Object.keys(groupedData.userSessions)).toHaveLength(2);
    expect(groupedData.userSessions["user1"]).toHaveLength(3);
    expect(groupedData.userSessions["user2"]).toHaveLength(2);
  });

  it("should count page views correctly", () => {
    const sessions = parseSessions();
    const groupedData = groupDataByRelevance(sessions);

    expect(groupedData.pageViews["/home"]).toBe(2);
    expect(groupedData.pageViews["/products"]).toBe(1);
  });

  it("should track search queries", () => {
    const sessions = parseSessions();
    const groupedData = groupDataByRelevance(sessions);

    expect(groupedData.searchQueries["laptop"]).toBe(1);
  });

  it("should track product interactions", () => {
    const sessions = parseSessions();
    const groupedData = groupDataByRelevance(sessions);

    expect(groupedData.productInteractions["Product A"]).toBe(1);
  });

  it("should track errors", () => {
    const sessions = parseSessions();
    const groupedData = groupDataByRelevance(sessions);

    expect(groupedData.errors["Error occurred"]).toBe(1);
  });
});

describe("groupSessionsByUser", () => {
  it("should group sessions by user and session ID", () => {
    const mockEvents: SessionEvent[] = [
      {
        uuid: "1",
        user_id: "user1",
        session_id: "session1",
        path: "/home",
        css: "body",
        text: "Welcome",
        value: null,
        event_time: "2025-01-01T10:00:00Z",
      },
      {
        uuid: "2",
        user_id: "user1",
        session_id: "session1",
        path: "/products",
        css: "#search-bar",
        text: "Search",
        value: "laptop",
        event_time: "2025-01-01T10:01:00Z",
      },
    ];

    const groupedSessions = groupSessionsByUser(mockEvents);
    expect(groupedSessions).toHaveLength(1);
    expect(groupedSessions[0].events).toHaveLength(2);
    expect(groupedSessions[0].paths).toHaveLength(2);
    expect(groupedSessions[0].unique_paths).toHaveLength(2);
  });

  it("should calculate session duration correctly", () => {
    const mockEvents: SessionEvent[] = [
      {
        uuid: "1",
        user_id: "user1",
        session_id: "session1",
        path: "/home",
        css: "body",
        text: "Welcome",
        value: null,
        event_time: "2025-01-01T10:00:00Z",
      },
      {
        uuid: "2",
        user_id: "user1",
        session_id: "session1",
        path: "/products",
        css: "#search-bar",
        text: "Search",
        value: "laptop",
        event_time: "2025-01-01T10:01:00Z",
      },
    ];

    const groupedSessions = groupSessionsByUser(mockEvents);
    expect(groupedSessions[0].duration).toBe(60); // 1 minute in seconds
  });

  it("should track errors correctly", () => {
    const mockEvents: SessionEvent[] = [
      {
        uuid: "1",
        user_id: "user1",
        session_id: "session1",
        path: "/error",
        css: "error-message",
        text: "Error occurred",
        value: null,
        event_time: "2025-01-01T10:00:00Z",
      },
    ];

    const groupedSessions = groupSessionsByUser(mockEvents);
    expect(groupedSessions[0].error_count).toBe(1);
    expect(groupedSessions[0].errors).toContain("Error occurred");
  });
});

describe("calculateSessionStats", () => {
  it("should calculate session statistics correctly", () => {
    const mockGroupedSessions: GroupedSession[] = [
      {
        session_id: "session1",
        user_id: "user1",
        events: [],
        start_time: "2025-01-01T10:00:00Z",
        end_time: "2025-01-01T10:01:00Z",
        duration: 65,
        error_count: 1,
        errors: ["Error occurred"],
        paths: ["/home", "/error"],
        unique_paths: ["/home", "/error"],
        error_rate: 0.5,
        is_error_session: true,
      },
      {
        session_id: "session2",
        user_id: "user2",
        events: [],
        start_time: "2025-01-01T11:00:00Z",
        end_time: "2025-01-01T11:01:00Z",
        duration: 60,
        error_count: 0,
        errors: [],
        paths: ["/home"],
        unique_paths: ["/home"],
        error_rate: 0,
        is_error_session: false,
      },
    ];

    const stats = calculateSessionStats(mockGroupedSessions);
    expect(stats.total_sessions).toBe(2);
    expect(stats.unique_users).toBe(2);
    expect(stats.total_errors).toBe(1);
    expect(stats.error_rate).toBe(50);
    expect(stats.average_sessions_per_user).toBe(1);
    expect(stats.average_session_duration).toBe(62.5);
    expect(stats.most_active_time).toBe("11:00");
  });
});

import fs from "fs";
import path from "path";
import {
  SessionEvent,
  GroupedSession,
  GroupedData,
  SessionStats,
} from "./types";

// Utiliser un chemin relatif au lieu de __dirname
const SESSIONS_FILE_PATH = path.join(
  process.cwd(),
  "scripts/dataingest/data/sessions.json"
);

export function parseSessions(): SessionEvent[] {
  try {
    const data = fs.readFileSync(SESSIONS_FILE_PATH, "utf8");
    const jsonLines = data.trim().split("\n");
    const sessions: SessionEvent[] = jsonLines.map((line: string) =>
      JSON.parse(line)
    );
    return sessions;
  } catch (error) {
    console.error("Erreur lors de la lecture du fichier sessions.json:", error);
    return [];
  }
}

export function groupDataByRelevance(sessions: SessionEvent[]): GroupedData {
  const groupedData: GroupedData = {
    userSessions: {},
    pageViews: {},
    searchQueries: {},
    productInteractions: {},
    errors: {},
  };

  sessions.forEach((session) => {
    // Grouper par utilisateur
    if (!groupedData.userSessions[session.user_id]) {
      groupedData.userSessions[session.user_id] = [];
    }
    groupedData.userSessions[session.user_id].push(session);

    // Compter les vues de pages
    groupedData.pageViews[session.path] =
      (groupedData.pageViews[session.path] || 0) + 1;

    // Analyser les recherches
    if (session.css === "#search-bar" && session.value) {
      groupedData.searchQueries[session.value] =
        (groupedData.searchQueries[session.value] || 0) + 1;
    }

    // Analyser les interactions avec les produits
    if (session.path.startsWith("/products/")) {
      const productName = session.text;
      groupedData.productInteractions[productName] =
        (groupedData.productInteractions[productName] || 0) + 1;
    }

    // Analyser les erreurs
    if (session.css.includes("error-message")) {
      groupedData.errors[session.text] =
        (groupedData.errors[session.text] || 0) + 1;
    }
  });

  return groupedData;
}

export function groupSessionsByUser(events: SessionEvent[]): GroupedSession[] {
  const sessionsByUser = new Map<string, GroupedSession>();

  events.forEach((event) => {
    const sessionKey = `${event.user_id}-${event.session_id}`;
    let session = sessionsByUser.get(sessionKey);

    if (!session) {
      session = {
        session_id: event.session_id,
        user_id: event.user_id,
        events: [],
        start_time: event.event_time,
        end_time: event.event_time,
        duration: 0,
        error_count: 0,
        errors: [],
        paths: [],
        unique_paths: [],
        error_rate: 0,
        is_error_session: false,
      };
      sessionsByUser.set(sessionKey, session);
    }

    session.events.push(event);
    session.paths.push(event.path);
    session.unique_paths = [...new Set(session.paths)];

    if (event.text.toLowerCase().includes("error")) {
      session.error_count++;
      session.errors.push(event.text);
    }

    const startTime = new Date(session.start_time);
    const endTime = new Date(event.event_time);
    session.duration = (endTime.getTime() - startTime.getTime()) / 1000;
    session.end_time = event.event_time;
  });

  return Array.from(sessionsByUser.values());
}

export function calculateSessionStats(
  groupedSessions: GroupedSession[]
): SessionStats {
  const totalSessions = groupedSessions.length;
  const uniqueUsers = new Set(groupedSessions.map((session) => session.user_id))
    .size;
  const totalErrors = groupedSessions.reduce(
    (sum, session) => sum + session.error_count,
    0
  );
  const errorRate = (totalErrors / totalSessions) * 100;
  const averageSessionsPerUser = totalSessions / uniqueUsers;
  const averageSessionDuration =
    groupedSessions.reduce((sum, session) => sum + session.duration, 0) /
    totalSessions;

  // Calculer la période la plus active
  const timeSlots = new Map<string, number>();
  groupedSessions.forEach((session) => {
    const hour = new Date(session.start_time).getHours();
    const slot = `${hour.toString().padStart(2, "0")}:00`;
    timeSlots.set(slot, (timeSlots.get(slot) || 0) + 1);
  });

  const mostActiveTime = Array.from(timeSlots.entries()).sort(
    (a, b) => b[1] - a[1]
  )[0][0];

  return {
    total_sessions: totalSessions,
    unique_users: uniqueUsers,
    total_errors: totalErrors,
    error_rate: errorRate,
    average_sessions_per_user: averageSessionsPerUser,
    average_session_duration: averageSessionDuration,
    most_active_time: mostActiveTime,
    session_distribution: "Multiple sessions per user",
  };
}

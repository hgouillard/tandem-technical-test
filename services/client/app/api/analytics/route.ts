import { NextResponse } from "next/server";
import {
  parseSessions,
  groupDataByRelevance,
  groupSessionsByUser,
  calculateSessionStats,
} from "@/scripts/dataingest/dataingest";

export async function GET() {
  try {
    const sessions = parseSessions();
    const groupedData = groupDataByRelevance(sessions);
    const groupedSessions = groupSessionsByUser(sessions);
    const sessionStats = calculateSessionStats(groupedSessions);

    // Formater les données pour correspondre à l'interface attendue par le frontend
    const formattedData = {
      userSessions: groupedData.userSessions,
      pageViews: groupedData.pageViews,
      searchQueries: groupedData.searchQueries,
      productInteractions: groupedData.productInteractions,
      errors: groupedData.errors,
      stats: {
        total_sessions: sessionStats.total_sessions,
        unique_users: sessionStats.unique_users,
        total_errors: sessionStats.total_errors,
        error_rate: sessionStats.error_rate,
        average_sessions_per_user: sessionStats.average_sessions_per_user,
        average_session_duration: sessionStats.average_session_duration,
        most_active_time: sessionStats.most_active_time,
        session_distribution: sessionStats.session_distribution,
      },
    };

    return NextResponse.json(formattedData);
  } catch (error) {
    console.error("Erreur lors de la récupération des données:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des données" },
      { status: 500 }
    );
  }
}

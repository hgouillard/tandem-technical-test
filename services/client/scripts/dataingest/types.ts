export interface SessionEvent {
  uuid: string;
  user_id: string;
  session_id: string;
  path: string;
  css: string;
  text: string;
  value: string | null;
  event_time: string;
}

export interface GroupedSession {
  session_id: string;
  user_id: string;
  events: SessionEvent[];
  start_time: string;
  end_time: string;
  duration: number;
  error_count: number;
  errors: string[];
  paths: string[];
  unique_paths: string[];
  error_rate: number;
  is_error_session: boolean;
}

export interface SessionStats {
  total_sessions: number;
  unique_users: number;
  total_errors: number;
  error_rate: number;
  average_sessions_per_user: number;
  average_session_duration: number;
  most_active_time: string;
  session_distribution: string;
}

export interface GroupedData {
  userSessions: { [key: string]: SessionEvent[] };
  pageViews: { [key: string]: number };
  searchQueries: { [key: string]: number };
  productInteractions: { [key: string]: number };
  errors: { [key: string]: number };
}

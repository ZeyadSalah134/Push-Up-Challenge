export interface User {
  id: number;
  username: string;
  created_at: string;
}

export interface PushUpEntry {
  id: number;
  user_id: number;
  count: number;
  entry_date: string;
  created_at: string;
}

export interface LeaderboardItem {
  rank: number;
  userId: number;
  username: string;
  todayCount: number;
  totalCount: number;
  isCurrentUser: boolean;
}

export interface UserStats {
  todayPushups: number;
  totalPushups: number;
  currentRank: number;
  todayRank: number;
  challengeDays: number;
  bestDay: {
    date: string;
    count: number;
  } | null;
  averagePerDay: number;
}

export interface DailyActivityItem {
  date: string;
  day: string;
  count: number;
}

export interface DailyHistoryItem {
  date: string;
  count: number;
  entriesCount: number;
  accumulated: number;
}

import {
  getStoredUsers,
  saveStoredUsers,
  getStoredEntries,
  saveStoredEntries,
} from './storageEngine';
import type { StoredUser, StoredPushup } from './storageEngine';

const API_BASE_URL = import.meta.env.VITE_API_URL || '';

export function getAuthToken(): string | null {
  return localStorage.getItem('pushup_token');
}

export function setAuthToken(token: string) {
  localStorage.setItem('pushup_token', token);
}

export function clearAuthToken() {
  localStorage.removeItem('pushup_token');
}

// Current logged in user object cached in storage
export function getCurrentUser(): { id: number; username: string; created_at: string } | null {
  const raw = localStorage.getItem('pushup_current_user');
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    return {
      id: parsed.id,
      username: parsed.username,
      created_at: parsed.created_at || new Date().toISOString(),
    };
  } catch {
    return null;
  }
}

export function setCurrentUser(user: { id: number; username: string; created_at?: string } | null) {
  if (user) {
    const fullUser = {
      id: user.id,
      username: user.username,
      created_at: user.created_at || new Date().toISOString(),
    };
    localStorage.setItem('pushup_current_user', JSON.stringify(fullUser));
  } else {
    localStorage.removeItem('pushup_current_user');
  }
}

export function getLocalDateString(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Universal API Dispatcher:
// 1. If backend server is reachable (e.g. localhost or external API), it uses real Express/SQLite endpoints.
// 2. If running on GitHub Pages (static host where /api yields 405 Method Not Allowed), it seamlessly handles auth,
//    push-up submissions, leaderboards, stats, and history right in the browser!
export const api = {
  // Authentication
  register: async (body: { username: string; password: string; confirmPassword?: string }) => {
    // Try backend if API_BASE_URL is configured
    if (API_BASE_URL) {
      try {
        const res = await fetch(`${API_BASE_URL}/auth/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });
        if (res.ok) {
          const data = await res.json();
          setCurrentUser(data.user);
          return data;
        }
      } catch {
        // Fallback to local storage engine
      }
    }

    // Client-side fallback engine (perfect for GitHub Pages)
    const trimmed = body.username.trim();
    if (!trimmed || trimmed.length < 2) {
      throw new Error('Username must be at least 2 characters.');
    }
    if (body.password.length < 6) {
      throw new Error('Password must be at least 6 characters.');
    }
    if (body.confirmPassword && body.password !== body.confirmPassword) {
      throw new Error('Passwords do not match.');
    }

    const users = getStoredUsers();
    if (users.some((u) => u.username.toLowerCase() === trimmed.toLowerCase())) {
      throw new Error('Username already exists.');
    }

    const newUser: StoredUser = {
      id: Date.now(),
      username: trimmed,
      password_hash: body.password,
      created_at: new Date().toISOString(),
    };
    users.push(newUser);
    saveStoredUsers(users);

    const token = `token_${newUser.id}`;
    const userRes = { id: newUser.id, username: newUser.username, created_at: newUser.created_at };
    setCurrentUser(userRes);
    return { message: 'Account created successfully', token, user: userRes };
  },

  login: async (body: { username: string; password: string }) => {
    if (API_BASE_URL) {
      try {
        const res = await fetch(`${API_BASE_URL}/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });
        if (res.ok) {
          const data = await res.json();
          setCurrentUser(data.user);
          return data;
        }
      } catch {
        // Fallback to local storage engine
      }
    }

    // Fallback authentication
    const users = getStoredUsers();
    const user = users.find((u) => u.username.toLowerCase() === body.username.trim().toLowerCase());
    if (!user || user.password_hash !== body.password) {
      throw new Error('Incorrect username or password.');
    }

    const token = `token_${user.id}`;
    const userRes = { id: user.id, username: user.username, created_at: user.created_at };
    setCurrentUser(userRes);
    return { message: 'Logged in successfully', token, user: userRes };
  },

  me: async () => {
    const cur = getCurrentUser();
    if (!cur) throw new Error('Not logged in');
    return { user: cur };
  },

  // Add push-ups
  addPushups: async (count: number) => {
    const user = getCurrentUser();
    if (!user) throw new Error('Please log in first.');

    const parsedCount = Number(count);
    if (!Number.isInteger(parsedCount) || parsedCount <= 0) {
      throw new Error('Please enter a valid positive whole number of push-ups.');
    }

    if (API_BASE_URL) {
      try {
        const res = await fetch(`${API_BASE_URL}/pushups`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${getAuthToken()}`,
          },
          body: JSON.stringify({ count: parsedCount, clientDate: getLocalDateString() }),
        });
        if (res.ok) return await res.json();
      } catch {
        // Fall through
      }
    }

    // Local Storage logic
    const today = getLocalDateString();
    const entries = getStoredEntries();
    const newEntry: StoredPushup = {
      id: Date.now(),
      user_id: user.id,
      count: parsedCount,
      entry_date: today,
      created_at: new Date().toISOString(),
    };
    entries.unshift(newEntry);
    saveStoredEntries(entries);

    const userEntries = entries.filter((e) => e.user_id === user.id);
    const todayTotal = userEntries.filter((e) => e.entry_date === today).reduce((sum, e) => sum + e.count, 0);
    const overallTotal = userEntries.reduce((sum, e) => sum + e.count, 0);

    return {
      message: `+${parsedCount} push-ups added`,
      entry: newEntry,
      today_total: todayTotal,
      overall_total: overallTotal,
    };
  },

  getToday: async () => {
    const user = getCurrentUser();
    if (!user) return { today_total: 0, entries: [] };
    const today = getLocalDateString();
    const entries = getStoredEntries().filter((e) => e.user_id === user.id && e.entry_date === today);
    const total = entries.reduce((acc, e) => acc + e.count, 0);
    return { date: today, today_total: total, entries };
  },

  getRecent: async (limit = 10) => {
    const user = getCurrentUser();
    if (!user) return { entries: [] };
    const entries = getStoredEntries()
      .filter((e) => e.user_id === user.id)
      .slice(0, limit);
    return { entries };
  },

  getHistory: async () => {
    const user = getCurrentUser();
    if (!user) return { history: [], totalPushups: 0 };
    const userEntries = getStoredEntries().filter((e) => e.user_id === user.id);

    // Group by date
    const dateMap = new Map<string, { count: number; entriesCount: number }>();
    userEntries.forEach((e) => {
      const prev = dateMap.get(e.entry_date) || { count: 0, entriesCount: 0 };
      dateMap.set(e.entry_date, {
        count: prev.count + e.count,
        entriesCount: prev.entriesCount + 1,
      });
    });

    const sortedDates = Array.from(dateMap.keys()).sort().reverse();
    const totalPushups = userEntries.reduce((acc, e) => acc + e.count, 0);

    let runningAccumulated = totalPushups;
    const history = sortedDates.map((d) => {
      const info = dateMap.get(d)!;
      const item = {
        date: d,
        count: info.count,
        entriesCount: info.entriesCount,
        accumulated: runningAccumulated,
      };
      runningAccumulated -= info.count;
      return item;
    });

    return { history, totalPushups };
  },

  getLeaderboard: async (type: 'today' | 'overall') => {
    const curUser = getCurrentUser();
    const today = getLocalDateString();
    const users = getStoredUsers();
    const entries = getStoredEntries();

    const stats = users.map((u) => {
      const uEntries = entries.filter((e) => e.user_id === u.id);
      const todayTotal = uEntries.filter((e) => e.entry_date === today).reduce((sum, e) => sum + e.count, 0);
      const overallTotal = uEntries.reduce((sum, e) => sum + e.count, 0);

      return {
        userId: u.id,
        username: u.username,
        todayCount: todayTotal,
        totalCount: overallTotal,
        isCurrentUser: curUser ? u.id === curUser.id : false,
      };
    });

    if (type === 'today') {
      stats.sort((a, b) => b.todayCount - a.todayCount || b.totalCount - a.totalCount);
    } else {
      stats.sort((a, b) => b.totalCount - a.totalCount || b.todayCount - a.todayCount);
    }

    const leaderboard = stats.map((item, idx) => ({
      ...item,
      rank: idx + 1,
    }));

    return { type, leaderboard };
  },

  getMyStats: async () => {
    const user = getCurrentUser();
    if (!user) {
      return {
        todayPushups: 0,
        totalPushups: 0,
        currentRank: 1,
        todayRank: 1,
        challengeDays: 0,
        bestDay: null,
        averagePerDay: 0,
      };
    }

    const today = getLocalDateString();
    const allUsers = getStoredUsers();
    const allEntries = getStoredEntries();

    const userEntries = allEntries.filter((e) => e.user_id === user.id);
    const todayPushups = userEntries.filter((e) => e.entry_date === today).reduce((sum, e) => sum + e.count, 0);
    const totalPushups = userEntries.reduce((sum, e) => sum + e.count, 0);

    // Leaderboard ranks
    const overallList = allUsers
      .map((u) => ({
        id: u.id,
        total: allEntries.filter((e) => e.user_id === u.id).reduce((sum, e) => sum + e.count, 0),
      }))
      .sort((a, b) => b.total - a.total);
    const currentRank = Math.max(overallList.findIndex((u) => u.id === user.id) + 1, 1);

    const todayList = allUsers
      .map((u) => ({
        id: u.id,
        total: allEntries.filter((e) => e.user_id === u.id && e.entry_date === today).reduce((sum, e) => sum + e.count, 0),
      }))
      .sort((a, b) => b.total - a.total);
    const todayRank = Math.max(todayList.findIndex((u) => u.id === user.id) + 1, 1);

    // Distinct challenge days
    const daysSet = new Set(userEntries.map((e) => e.entry_date));
    const challengeDays = daysSet.size;

    // Best day
    const dayMap = new Map<string, number>();
    userEntries.forEach((e) => {
      dayMap.set(e.entry_date, (dayMap.get(e.entry_date) || 0) + e.count);
    });

    let bestDay: { date: string; count: number } | null = null;
    dayMap.forEach((count, date) => {
      if (!bestDay || count > bestDay.count) {
        bestDay = { date, count };
      }
    });

    const averagePerDay = challengeDays > 0 ? Math.round(totalPushups / challengeDays) : 0;

    return {
      todayPushups,
      totalPushups,
      currentRank,
      todayRank,
      challengeDays,
      bestDay,
      averagePerDay,
    };
  },

  getActivity: async (days = 7) => {
    const user = getCurrentUser();
    const dates: string[] = [];
    const now = new Date();
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      dates.push(`${year}-${month}-${day}`);
    }

    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const userEntries = user ? getStoredEntries().filter((e) => e.user_id === user.id) : [];

    const activity = dates.map((dateStr) => {
      const parts = dateStr.split('-');
      const d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
      const dayLabel = dayNames[d.getDay()];
      const dayCount = userEntries.filter((e) => e.entry_date === dateStr).reduce((sum, e) => sum + e.count, 0);

      return {
        date: dateStr,
        day: dayLabel,
        count: dayCount,
      };
    });

    return { activity };
  },
};

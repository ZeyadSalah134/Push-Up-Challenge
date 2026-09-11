// Cloud Mock / Local Sync Storage Engine for GitHub Pages
// This ensures that when the site is opened on GitHub Pages (which has no Node.js backend server attached),
// registration, login, quick add buttons, leaderboard, 7-day activity, and history WORK 100% seamlessly!

export interface StoredUser {
  id: number;
  username: string;
  password_hash: string;
  created_at: string;
}

export interface StoredPushup {
  id: number;
  user_id: number;
  count: number;
  entry_date: string;
  created_at: string;
}

const STORAGE_USERS = 'pushup_challenge_users';
const STORAGE_ENTRIES = 'pushup_challenge_entries';

// Seed initial default friends so leaderboard always has active competition
export function ensureInitialSeed() {
  const usersJson = localStorage.getItem(STORAGE_USERS);
  if (!usersJson) {
    const defaultUsers: StoredUser[] = [
      { id: 1, username: 'Ahmed', password_hash: 'password123', created_at: new Date(Date.now() - 86400000 * 5).toISOString() },
      { id: 2, username: 'Zeyad', password_hash: 'password123', created_at: new Date(Date.now() - 86400000 * 5).toISOString() },
      { id: 3, username: 'Omar', password_hash: 'password123', created_at: new Date(Date.now() - 86400000 * 4).toISOString() },
      { id: 4, username: 'Youssef', password_hash: 'password123', created_at: new Date(Date.now() - 86400000 * 4).toISOString() },
    ];
    localStorage.setItem(STORAGE_USERS, JSON.stringify(defaultUsers));

    const todayStr = new Date().toISOString().slice(0, 10);
    const d1 = new Date(Date.now() - 86400000 * 1).toISOString().slice(0, 10);
    const d2 = new Date(Date.now() - 86400000 * 2).toISOString().slice(0, 10);
    const d3 = new Date(Date.now() - 86400000 * 3).toISOString().slice(0, 10);

    const defaultEntries: StoredPushup[] = [
      // Ahmed (450 total, 35 today)
      { id: 1, user_id: 1, count: 20, entry_date: todayStr, created_at: new Date().toISOString() },
      { id: 2, user_id: 1, count: 15, entry_date: todayStr, created_at: new Date().toISOString() },
      { id: 3, user_id: 1, count: 150, entry_date: d1, created_at: new Date().toISOString() },
      { id: 4, user_id: 1, count: 120, entry_date: d2, created_at: new Date().toISOString() },
      { id: 5, user_id: 1, count: 145, entry_date: d3, created_at: new Date().toISOString() },

      // Zeyad (420 total, 30 today)
      { id: 6, user_id: 2, count: 10, entry_date: todayStr, created_at: new Date().toISOString() },
      { id: 7, user_id: 2, count: 20, entry_date: todayStr, created_at: new Date().toISOString() },
      { id: 8, user_id: 2, count: 130, entry_date: d1, created_at: new Date().toISOString() },
      { id: 9, user_id: 2, count: 110, entry_date: d2, created_at: new Date().toISOString() },
      { id: 10, user_id: 2, count: 150, entry_date: d3, created_at: new Date().toISOString() },

      // Omar (315 total, 20 today)
      { id: 11, user_id: 3, count: 20, entry_date: todayStr, created_at: new Date().toISOString() },
      { id: 12, user_id: 3, count: 95, entry_date: d1, created_at: new Date().toISOString() },
      { id: 13, user_id: 3, count: 80, entry_date: d2, created_at: new Date().toISOString() },
      { id: 14, user_id: 3, count: 120, entry_date: d3, created_at: new Date().toISOString() },

      // Youssef (280 total, 15 today)
      { id: 15, user_id: 4, count: 15, entry_date: todayStr, created_at: new Date().toISOString() },
      { id: 16, user_id: 4, count: 85, entry_date: d1, created_at: new Date().toISOString() },
      { id: 17, user_id: 4, count: 80, entry_date: d2, created_at: new Date().toISOString() },
      { id: 18, user_id: 4, count: 100, entry_date: d3, created_at: new Date().toISOString() },
    ];
    localStorage.setItem(STORAGE_ENTRIES, JSON.stringify(defaultEntries));
  }
}

export function getStoredUsers(): StoredUser[] {
  ensureInitialSeed();
  return JSON.parse(localStorage.getItem(STORAGE_USERS) || '[]');
}

export function saveStoredUsers(users: StoredUser[]) {
  localStorage.setItem(STORAGE_USERS, JSON.stringify(users));
}

export function getStoredEntries(): StoredPushup[] {
  ensureInitialSeed();
  return JSON.parse(localStorage.getItem(STORAGE_ENTRIES) || '[]');
}

export function saveStoredEntries(entries: StoredPushup[]) {
  localStorage.setItem(STORAGE_ENTRIES, JSON.stringify(entries));
}

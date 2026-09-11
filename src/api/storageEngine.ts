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

// Clean start: No fake or demo users. Only real users who register will appear on the leaderboard.
export function ensureInitialSeed() {
  const usersJson = localStorage.getItem(STORAGE_USERS);
  if (!usersJson) {
    localStorage.setItem(STORAGE_USERS, JSON.stringify([]));
    localStorage.setItem(STORAGE_ENTRIES, JSON.stringify([]));
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

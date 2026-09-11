import React, { useState, useEffect } from 'react';
import { getStoredUsers, saveStoredUsers, getStoredEntries, saveStoredEntries } from '../api/storageEngine';
import type { StoredUser, StoredPushup } from '../api/storageEngine';
import { useAuth } from '../context/AuthContext';
import { Trash2, Shield, AlertCircle, CheckCircle, Search, RefreshCw } from 'lucide-react';

export const AdminPage: React.FC = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState<StoredUser[]>([]);
  const [entries, setEntries] = useState<StoredPushup[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [statusType, setStatusType] = useState<'success' | 'error'>('success');

  const loadData = () => {
    setUsers(getStoredUsers());
    setEntries(getStoredEntries());
  };

  useEffect(() => {
    loadData();
  }, []);

  const notify = (msg: string, type: 'success' | 'error' = 'success') => {
    setStatusMessage(msg);
    setStatusType(type);
    setTimeout(() => setStatusMessage(null), 4000);
  };

  // Remove a user completely
  const handleRemoveUser = (userId: number, username: string) => {
    if (confirm(`Are you sure you want to remove user "${username}" and all their push-up entries?`)) {
      const updatedUsers = users.filter((u) => u.id !== userId);
      const updatedEntries = entries.filter((e) => e.user_id !== userId);

      saveStoredUsers(updatedUsers);
      saveStoredEntries(updatedEntries);

      setUsers(updatedUsers);
      setEntries(updatedEntries);

      notify(`User "${username}" has been removed.`, 'success');
    }
  };

  // Reset/Clear user's push-up entries without deleting account
  const handleClearEntries = (userId: number, username: string) => {
    if (confirm(`Clear all logged push-up reps for "${username}"?`)) {
      const updatedEntries = entries.filter((e) => e.user_id !== userId);
      saveStoredEntries(updatedEntries);
      setEntries(updatedEntries);
      notify(`Cleared entries for "${username}".`, 'success');
    }
  };

  const getUserTotal = (userId: number) => {
    return entries.filter((e) => e.user_id === userId).reduce((sum, e) => sum + e.count, 0);
  };

  const getUserTodayTotal = (userId: number) => {
    const today = new Date().toISOString().slice(0, 10);
    return entries.filter((e) => e.user_id === userId && e.entry_date === today).reduce((sum, e) => sum + e.count, 0);
  };

  const filteredUsers = users.filter((u) =>
    u.username.toLowerCase().includes(searchTerm.trim().toLowerCase())
  );

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-light-primary dark:text-dark-primary" />
            <h1 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-light-text dark:text-dark-text">
              Challenge Admin Panel
            </h1>
          </div>
          <p className="text-xs sm:text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary mt-1">
            View everyone who created an account, track their activity, and manage/remove participants.
          </p>
        </div>

        <button
          onClick={loadData}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg border text-xs sm:text-sm font-bold transition-all
            bg-light-surface dark:bg-dark-surface border-light-border dark:border-dark-border text-light-text dark:text-dark-text hover:bg-light-surface-secondary dark:hover:bg-dark-surface-secondary"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Refresh List
        </button>
      </div>

      {statusMessage && (
        <div
          className={`flex items-center gap-2 px-4 py-3 rounded-xl border text-xs sm:text-sm font-semibold transition-all ${
            statusType === 'success'
              ? 'bg-light-surface dark:bg-dark-surface border-light-success/40 dark:border-dark-success/40 text-light-text dark:text-dark-text'
              : 'bg-light-surface dark:bg-dark-surface border-red-500/40 text-red-600 dark:text-red-400'
          }`}
        >
          {statusType === 'success' ? (
            <CheckCircle className="w-4 h-4 text-light-success dark:text-dark-success flex-shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
          )}
          <span>{statusMessage}</span>
        </div>
      )}

      {/* Search Bar */}
      <div className="relative">
        <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-light-text-secondary dark:text-dark-text-secondary" />
        <input
          type="text"
          placeholder="Search by username..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm font-medium outline-none transition-all
            bg-light-surface dark:bg-dark-surface border-light-border dark:border-dark-border text-light-text dark:text-dark-text
            focus:ring-2 focus:ring-light-primary/30 dark:focus:ring-dark-primary/30"
        />
      </div>

      {/* Users Management Table */}
      <div className="bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border rounded-xl shadow-subtle-light dark:shadow-subtle-dark overflow-hidden">
        <div className="grid grid-cols-12 px-5 py-3.5 border-b border-light-border dark:border-dark-border text-[11px] font-bold uppercase tracking-wider text-light-text-secondary dark:text-dark-text-secondary">
          <div className="col-span-4 sm:col-span-3">User</div>
          <div className="col-span-3 sm:col-span-3">Joined Date</div>
          <div className="col-span-2 sm:col-span-2 text-right">Today</div>
          <div className="col-span-2 sm:col-span-2 text-right">Lifetime</div>
          <div className="col-span-1 sm:col-span-2 text-right">Actions</div>
        </div>

        {filteredUsers.length === 0 ? (
          <div className="py-12 text-center text-xs text-light-text-secondary dark:text-dark-text-secondary">
            {searchTerm ? 'No registered users match your search.' : 'No users have joined the challenge yet.'}
          </div>
        ) : (
          <div className="divide-y divide-light-border/60 dark:divide-dark-border/60">
            {filteredUsers.map((u) => {
              const isMe = user?.id === u.id;
              const todayTotal = getUserTodayTotal(u.id);
              const lifetimeTotal = getUserTotal(u.id);

              return (
                <div
                  key={u.id}
                  className="grid grid-cols-12 items-center px-5 py-3.5 text-xs sm:text-sm transition-colors hover:bg-light-surface-secondary/40 dark:hover:bg-dark-surface-secondary/40"
                >
                  <div className="col-span-4 sm:col-span-3 flex items-center gap-2">
                    <span className="font-bold text-light-text dark:text-dark-text truncate">
                      {u.username}
                    </span>
                    {isMe && (
                      <span className="text-[10px] uppercase font-bold px-1.5 py-0.2 rounded bg-light-primary text-white dark:bg-dark-primary dark:text-dark-bg">
                        You
                      </span>
                    )}
                  </div>

                  <div className="col-span-3 sm:col-span-3 text-xs text-light-text-secondary dark:text-dark-text-secondary">
                    {new Date(u.created_at).toLocaleDateString()}
                  </div>

                  <div className="col-span-2 sm:col-span-2 text-right font-semibold text-light-primary dark:text-dark-primary">
                    {todayTotal}
                  </div>

                  <div className="col-span-2 sm:col-span-2 text-right font-black text-light-text dark:text-dark-text">
                    {lifetimeTotal}
                  </div>

                  <div className="col-span-1 sm:col-span-2 flex items-center justify-end gap-1.5">
                    <button
                      onClick={() => handleClearEntries(u.id, u.username)}
                      title="Reset push-up count"
                      className="p-1.5 rounded-lg border text-light-text-secondary dark:text-dark-text-secondary hover:text-amber-600 dark:hover:text-amber-400 hover:bg-amber-500/10 border-light-border dark:border-dark-border transition-all"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleRemoveUser(u.id, u.username)}
                      title="Remove participant"
                      className="p-1.5 rounded-lg border text-light-text-secondary dark:text-dark-text-secondary hover:text-red-600 dark:hover:text-red-400 hover:bg-red-500/10 border-light-border dark:border-dark-border transition-all"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

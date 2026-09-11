import React from 'react';
import type { PushUpEntry } from '../types';
import { Clock } from 'lucide-react';

interface RecentActivityProps {
  entries: PushUpEntry[];
  isLoading?: boolean;
}

export const RecentActivity: React.FC<RecentActivityProps> = ({ entries, isLoading = false }) => {
  const formatTimeAgo = (createdAt: string, entryDate: string) => {
    try {
      const today = new Date().toISOString().slice(0, 10);
      const isToday = entryDate === today;
      
      const date = new Date(createdAt);
      let hours = date.getHours();
      const minutes = String(date.getMinutes()).padStart(2, '0');
      const ampm = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12 || 12;
      const timeStr = `${hours}:${minutes} ${ampm}`;

      if (isToday) {
        return `Today · ${timeStr}`;
      }

      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().slice(0, 10);

      if (entryDate === yesterdayStr) {
        return `Yesterday · ${timeStr}`;
      }

      return `${entryDate} · ${timeStr}`;
    } catch {
      return entryDate;
    }
  };

  return (
    <div className="bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border rounded-xl p-5 sm:p-6 shadow-subtle-light dark:shadow-subtle-dark">
      <div className="flex items-center justify-between mb-3 pb-2 border-b border-light-border dark:border-dark-border">
        <h2 className="text-xs font-bold uppercase tracking-wider text-light-text-secondary dark:text-dark-text-secondary">
          Recent Activity
        </h2>
        <Clock className="w-3.5 h-3.5 text-light-text-secondary dark:text-dark-text-secondary opacity-60" />
      </div>

      {isLoading ? (
        <div className="py-6 text-center text-xs text-light-text-secondary dark:text-dark-text-secondary">
          Loading entries...
        </div>
      ) : entries.length === 0 ? (
        <div className="py-6 text-center text-xs text-light-text-secondary dark:text-dark-text-secondary">
          No activity yet.<br />Add your first push-ups to start tracking.
        </div>
      ) : (
        <div className="divide-y divide-light-border/60 dark:divide-dark-border/60">
          {entries.map((entry) => (
            <div key={entry.id} className="py-2.5 flex items-center justify-between text-xs sm:text-sm">
              <span className="font-bold text-light-primary dark:text-dark-primary flex items-center gap-1.5">
                <span className="text-xs font-semibold px-1.5 py-0.5 rounded bg-light-primary/10 dark:bg-dark-primary/15">
                  +{entry.count}
                </span>
                <span className="text-light-text dark:text-dark-text font-medium">push-ups</span>
              </span>

              <span className="text-xs text-light-text-secondary dark:text-dark-text-secondary">
                {formatTimeAgo(entry.created_at, entry.entry_date)}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

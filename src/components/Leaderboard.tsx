import React from 'react';
import type { LeaderboardItem } from '../types';

interface LeaderboardProps {
  items: LeaderboardItem[];
  type: 'today' | 'overall';
  setType: (type: 'today' | 'overall') => void;
  isLoading?: boolean;
}

export const Leaderboard: React.FC<LeaderboardProps> = ({
  items,
  type,
  setType,
  isLoading = false,
}) => {
  const getBadge = (rank: number) => {
    switch (rank) {
      case 1:
        return (
          <span className="inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-black bg-amber-400/20 text-amber-600 dark:text-amber-300 border border-amber-400/40">
            1
          </span>
        );
      case 2:
        return (
          <span className="inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-black bg-slate-300/25 text-slate-700 dark:text-slate-300 border border-slate-300/40">
            2
          </span>
        );
      case 3:
        return (
          <span className="inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-black bg-amber-700/20 text-amber-800 dark:text-amber-400 border border-amber-700/30">
            3
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center justify-center w-6 h-6 text-xs font-bold text-light-text-secondary dark:text-dark-text-secondary">
            {rank}
          </span>
        );
    }
  };

  return (
    <div className="bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border rounded-xl p-5 sm:p-6 shadow-subtle-light dark:shadow-subtle-dark flex flex-col justify-between">
      <div>
        {/* Header & Switch */}
        <div className="flex items-center justify-between mb-4 pb-2 border-b border-light-border dark:border-dark-border">
          <h2 className="text-xs font-bold uppercase tracking-wider text-light-text-secondary dark:text-dark-text-secondary">
            Leaderboard
          </h2>

          <div className="inline-flex p-0.5 rounded-lg bg-light-surface-secondary dark:bg-dark-surface-secondary">
            <button
              onClick={() => setType('today')}
              className={`px-3 py-1 rounded-md text-xs font-semibold transition-all ${
                type === 'today'
                  ? 'bg-light-surface dark:bg-dark-surface text-light-text dark:text-dark-text shadow-sm'
                  : 'text-light-text-secondary dark:text-dark-text-secondary hover:text-light-text dark:hover:text-dark-text'
              }`}
            >
              Today
            </button>
            <button
              onClick={() => setType('overall')}
              className={`px-3 py-1 rounded-md text-xs font-semibold transition-all ${
                type === 'overall'
                  ? 'bg-light-surface dark:bg-dark-surface text-light-text dark:text-dark-text shadow-sm'
                  : 'text-light-text-secondary dark:text-dark-text-secondary hover:text-light-text dark:hover:text-dark-text'
              }`}
            >
              Overall
            </button>
          </div>
        </div>

        {/* Table Header */}
        <div className="grid grid-cols-12 text-[11px] font-bold uppercase tracking-wider text-light-text-secondary dark:text-dark-text-secondary px-3 py-1.5 mb-1">
          <div className="col-span-2">#</div>
          <div className="col-span-6">User</div>
          <div className="col-span-2 text-right">Today</div>
          <div className="col-span-2 text-right">Total</div>
        </div>

        {/* Rows */}
        {isLoading ? (
          <div className="py-8 text-center text-xs text-light-text-secondary dark:text-dark-text-secondary">
            Loading leaderboard...
          </div>
        ) : items.length === 0 ? (
          <div className="py-8 text-center text-xs text-light-text-secondary dark:text-dark-text-secondary">
            No push-ups recorded yet.<br />Be the first to start the challenge.
          </div>
        ) : (
          <div className="space-y-1">
            {items.map((item) => (
              <div
                key={item.userId}
                className={`grid grid-cols-12 items-center px-3 py-2.5 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                  item.isCurrentUser
                    ? 'bg-light-primary/10 dark:bg-dark-primary/15 border border-light-primary/30 dark:border-dark-primary/30 font-semibold text-light-text dark:text-dark-text'
                    : 'hover:bg-light-surface-secondary/60 dark:hover:bg-dark-surface-secondary/60 text-light-text dark:text-dark-text'
                }`}
              >
                <div className="col-span-2 flex items-center">
                  {getBadge(item.rank)}
                </div>
                <div className="col-span-6 truncate flex items-center gap-1.5">
                  <span className="truncate">{item.username}</span>
                  {item.isCurrentUser && (
                    <span className="text-[10px] uppercase font-bold px-1.5 py-0.2 rounded bg-light-primary text-white dark:bg-dark-primary dark:text-dark-bg">
                      You
                    </span>
                  )}
                </div>
                <div className={`col-span-2 text-right font-semibold ${type === 'today' ? 'text-light-primary dark:text-dark-primary font-bold' : 'text-light-text-secondary dark:text-dark-text-secondary'}`}>
                  {item.todayCount}
                </div>
                <div className={`col-span-2 text-right font-bold ${type === 'overall' ? 'text-light-primary dark:text-dark-primary' : 'text-light-text dark:text-dark-text'}`}>
                  {item.totalCount}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

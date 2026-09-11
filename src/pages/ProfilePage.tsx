import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';
import type { UserStats } from '../types';
import { ShieldCheck } from 'lucide-react';

export const ProfilePage: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<UserStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      try {
        const res = await api.getMyStats();
        setStats(res);
      } catch (err) {
        console.error('Failed to load profile stats:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadStats();
  }, []);

  const formatDate = (isoStr?: string) => {
    if (!isoStr) return '—';
    try {
      return new Date(isoStr).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return isoStr;
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-light-text dark:text-dark-text">
          User Profile
        </h1>
        <p className="text-xs sm:text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary">
          Personal performance and challenge credentials.
        </p>
      </div>

      {isLoading ? (
        <div className="py-12 text-center text-xs text-light-text-secondary dark:text-dark-text-secondary">
          Loading profile statistics...
        </div>
      ) : (
        <>
          {/* User Information Card */}
          <div className="bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border rounded-xl p-6 shadow-subtle-light dark:shadow-subtle-dark space-y-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-xl flex items-center justify-center font-black text-xl bg-light-primary text-white dark:bg-dark-primary dark:text-dark-bg">
            {user?.username.slice(0, 2).toUpperCase()}
          </div>
          <div>
            <h2 className="text-lg font-bold text-light-text dark:text-dark-text">
              {user?.username}
            </h2>
            <p className="text-xs text-light-text-secondary dark:text-dark-text-secondary">
              Member since {formatDate(user?.created_at)}
            </p>
          </div>
        </div>

        {/* Minimal metrics grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-4 border-t border-light-border dark:border-dark-border">
          <div className="p-3 rounded-lg bg-light-surface-secondary/50 dark:bg-dark-surface-secondary/50">
            <span className="block text-[11px] font-bold uppercase tracking-wider text-light-text-secondary dark:text-dark-text-secondary mb-1">
              Total Push-Ups
            </span>
            <span className="text-xl font-extrabold text-light-text dark:text-dark-text">
              {stats?.totalPushups ?? 0}
            </span>
          </div>

          <div className="p-3 rounded-lg bg-light-surface-secondary/50 dark:bg-dark-surface-secondary/50">
            <span className="block text-[11px] font-bold uppercase tracking-wider text-light-text-secondary dark:text-dark-text-secondary mb-1">
              Current Rank
            </span>
            <span className="text-xl font-extrabold text-light-text dark:text-dark-text">
              #{stats?.currentRank ?? 1}
            </span>
          </div>

          <div className="p-3 rounded-lg bg-light-surface-secondary/50 dark:bg-dark-surface-secondary/50">
            <span className="block text-[11px] font-bold uppercase tracking-wider text-light-text-secondary dark:text-dark-text-secondary mb-1">
              Active Days
            </span>
            <span className="text-xl font-extrabold text-light-text dark:text-dark-text">
              {stats?.challengeDays ?? 0}
            </span>
          </div>

          <div className="p-3 rounded-lg bg-light-surface-secondary/50 dark:bg-dark-surface-secondary/50">
            <span className="block text-[11px] font-bold uppercase tracking-wider text-light-text-secondary dark:text-dark-text-secondary mb-1">
              Daily Average
            </span>
            <span className="text-xl font-extrabold text-light-text dark:text-dark-text">
              {stats?.averagePerDay ?? 0}
            </span>
          </div>

          <div className="p-3 rounded-lg bg-light-surface-secondary/50 dark:bg-dark-surface-secondary/50 col-span-2 sm:col-span-2">
            <span className="block text-[11px] font-bold uppercase tracking-wider text-light-text-secondary dark:text-dark-text-secondary mb-1">
              Best Day
            </span>
            <span className="text-xl font-extrabold text-light-text dark:text-dark-text">
              {stats?.bestDay ? `${stats.bestDay.count} reps (${stats.bestDay.date})` : '—'}
            </span>
          </div>
        </div>
      </div>

      {/* Challenge Rules Section */}
      <div className="bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border rounded-xl p-6 shadow-subtle-light dark:shadow-subtle-dark">
        <div className="flex items-center gap-2 mb-3">
          <ShieldCheck className="w-5 h-5 text-light-primary dark:text-dark-primary" />
          <h3 className="text-sm font-bold uppercase tracking-wider text-light-text dark:text-dark-text">
            The Challenge Rules
          </h3>
        </div>

        <p className="text-xs sm:text-sm text-light-text-secondary dark:text-dark-text-secondary leading-relaxed mb-4">
          Complete as many push-ups as you can. You can log push-ups multiple times throughout the day.
          Every entry is added to your daily total and overall total. Your ranking is based on total push-ups.
        </p>

        <ul className="space-y-2 text-xs font-medium text-light-text-secondary dark:text-dark-text-secondary">
          <li className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-light-primary dark:bg-dark-primary" />
            Every new submission is added to your existing total (never overwrites).
          </li>
          <li className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-light-primary dark:bg-dark-primary" />
            The leaderboard syncs in real-time between you and your friends.
          </li>
          <li className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-light-primary dark:bg-dark-primary" />
            Keep your form strict and consistent.
          </li>
        </ul>
      </div>
        </>
      )}
    </div>
  );
};

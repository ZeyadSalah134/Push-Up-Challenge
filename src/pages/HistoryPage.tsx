import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import type { DailyHistoryItem } from '../types';
import { Calendar, TrendingUp } from 'lucide-react';

export const HistoryPage: React.FC = () => {
  const [history, setHistory] = useState<DailyHistoryItem[]>([]);
  const [totalPushups, setTotalPushups] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadHistory() {
      try {
        const res = await api.getHistory();
        setHistory(res.history);
        setTotalPushups(res.totalPushups);
      } catch (err) {
        console.error('Failed to load history:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadHistory();
  }, []);

  const formatDate = (dateStr: string) => {
    try {
      const [year, month, day] = dateStr.split('-').map(Number);
      const date = new Date(year, month - 1, day);
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <h1 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-light-text dark:text-dark-text">
            History & Logs
          </h1>
          <p className="text-xs sm:text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary">
            Daily logs and accumulated repetition totals.
          </p>
        </div>

        <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg border bg-light-surface dark:bg-dark-surface border-light-border dark:border-dark-border text-xs sm:text-sm font-bold">
          <TrendingUp className="w-4 h-4 text-light-primary dark:text-dark-primary" />
          <span className="text-light-text-secondary dark:text-dark-text-secondary">Lifetime:</span>
          <span className="text-light-text dark:text-dark-text">{totalPushups}</span>
        </div>
      </div>

      {/* History Table */}
      <div className="bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border rounded-xl shadow-subtle-light dark:shadow-subtle-dark overflow-hidden">
        <div className="grid grid-cols-12 px-5 py-3.5 border-b border-light-border dark:border-dark-border text-[11px] font-bold uppercase tracking-wider text-light-text-secondary dark:text-dark-text-secondary">
          <div className="col-span-4 sm:col-span-5 flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5" />
            Date
          </div>
          <div className="col-span-4 sm:col-span-4 text-right">Push-Ups</div>
          <div className="col-span-4 sm:col-span-3 text-right">Accumulated Total</div>
        </div>

        {isLoading ? (
          <div className="py-12 text-center text-xs text-light-text-secondary dark:text-dark-text-secondary">
            Loading your history logs...
          </div>
        ) : history.length === 0 ? (
          <div className="py-12 text-center text-xs text-light-text-secondary dark:text-dark-text-secondary">
            No push-up history recorded yet.<br />Log your first set on the dashboard!
          </div>
        ) : (
          <div className="divide-y divide-light-border/60 dark:divide-dark-border/60">
            {history.map((row) => (
              <div
                key={row.date}
                className="grid grid-cols-12 items-center px-5 py-3.5 text-xs sm:text-sm transition-colors hover:bg-light-surface-secondary/40 dark:hover:bg-dark-surface-secondary/40"
              >
                <div className="col-span-4 sm:col-span-5 font-semibold text-light-text dark:text-dark-text">
                  {formatDate(row.date)}
                  <span className="ml-2 text-[10px] font-normal text-light-text-secondary dark:text-dark-text-secondary">
                    ({row.entriesCount} {row.entriesCount === 1 ? 'entry' : 'entries'})
                  </span>
                </div>
                <div className="col-span-4 sm:col-span-4 text-right font-bold text-light-primary dark:text-dark-primary">
                  +{row.count}
                </div>
                <div className="col-span-4 sm:col-span-3 text-right font-extrabold text-light-text dark:text-dark-text">
                  {row.accumulated}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

import React from 'react';
import type { DailyActivityItem } from '../types';

interface ActivityChartProps {
  data: DailyActivityItem[];
  isLoading?: boolean;
}

export const ActivityChart: React.FC<ActivityChartProps> = ({ data, isLoading = false }) => {
  const maxCount = Math.max(...data.map((d) => d.count), 10);

  return (
    <div className="bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border rounded-xl p-5 sm:p-6 shadow-subtle-light dark:shadow-subtle-dark">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xs font-bold uppercase tracking-wider text-light-text-secondary dark:text-dark-text-secondary">
          Your Activity
        </h2>
        <span className="text-[11px] font-medium text-light-text-secondary dark:text-dark-text-secondary">
          Last 7 Days
        </span>
      </div>

      {isLoading ? (
        <div className="h-36 flex items-center justify-center text-xs text-light-text-secondary dark:text-dark-text-secondary">
          Loading activity...
        </div>
      ) : (
        <div className="flex items-end justify-between gap-2 sm:gap-4 h-40 pt-4">
          {data.map((item) => {
            const heightPercent = item.count === 0 ? 4 : Math.min(Math.round((item.count / maxCount) * 100), 100);
            return (
              <div key={item.date} className="flex-1 flex flex-col items-center gap-2 group h-full justify-end">
                {/* Reps count tooltip on hover */}
                <span className="text-[11px] font-bold text-light-text dark:text-dark-text opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all">
                  {item.count > 0 ? item.count : '—'}
                </span>

                {/* Bar */}
                <div className="w-full max-w-[36px] bg-light-surface-secondary dark:bg-dark-surface-secondary rounded-t-md h-full flex items-end overflow-hidden p-0.5">
                  <div
                    style={{ height: `${heightPercent}%` }}
                    className={`w-full rounded-t-sm transition-all duration-500 ${
                      item.count > 0
                        ? 'bg-light-primary dark:bg-dark-primary group-hover:brightness-110'
                        : 'bg-transparent'
                    }`}
                  />
                </div>

                {/* Day label */}
                <span className="text-xs font-semibold text-light-text-secondary dark:text-dark-text-secondary">
                  {item.day}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

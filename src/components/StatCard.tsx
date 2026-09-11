import React from 'react';
import type { LucideIcon } from 'lucide-react';

interface StatCardProps {
  label: string;
  value: string | number;
  subValue?: string;
  icon?: LucideIcon;
  highlight?: boolean;
}

export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  subValue,
  icon: Icon,
  highlight = false,
}) => {
  return (
    <div
      className={`rounded-xl p-4 sm:p-5 border transition-all ${
        highlight
          ? 'bg-light-surface dark:bg-dark-surface border-light-primary/40 dark:border-dark-primary/40 shadow-subtle-light dark:shadow-subtle-dark'
          : 'bg-light-surface dark:bg-dark-surface border-light-border dark:border-dark-border'
      }`}
    >
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-[11px] font-bold uppercase tracking-wider text-light-text-secondary dark:text-dark-text-secondary">
          {label}
        </span>
        {Icon && (
          <Icon className="w-4 h-4 text-light-text-secondary dark:text-dark-text-secondary opacity-75" />
        )}
      </div>
      <div className="flex items-baseline gap-2">
        <span className="text-2xl sm:text-3xl font-extrabold tracking-tight text-light-text dark:text-dark-text">
          {value}
        </span>
        {subValue && (
          <span className="text-xs font-medium text-light-text-secondary dark:text-dark-text-secondary">
            {subValue}
          </span>
        )}
      </div>
    </div>
  );
};

import React from 'react';
import { CheckCircle, AlertCircle, X } from 'lucide-react';

interface ToastNotificationProps {
  message: string | null;
  type?: 'success' | 'error';
  onClose: () => void;
}

export const ToastNotification: React.FC<ToastNotificationProps> = ({
  message,
  type = 'success',
  onClose,
}) => {
  if (!message) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-bounce-short">
      <div
        className={`flex items-center gap-3 px-4 py-3 rounded-xl border shadow-lg transition-all ${
          type === 'success'
            ? 'bg-light-surface dark:bg-dark-surface border-light-success/40 dark:border-dark-success/40 text-light-text dark:text-dark-text'
            : 'bg-light-surface dark:bg-dark-surface border-red-500/40 text-light-text dark:text-dark-text'
        }`}
      >
        {type === 'success' ? (
          <CheckCircle className="w-4 h-4 text-light-success dark:text-dark-success flex-shrink-0" />
        ) : (
          <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
        )}
        <span className="text-xs sm:text-sm font-semibold">{message}</span>
        <button
          onClick={onClose}
          className="ml-2 text-light-text-secondary dark:text-dark-text-secondary hover:text-light-text dark:hover:text-dark-text"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};

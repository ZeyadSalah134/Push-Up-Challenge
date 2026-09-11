import React, { useState } from 'react';
import { Plus } from 'lucide-react';

interface PushUpCounterProps {
  todayTotal: number;
  onAdd: (count: number) => Promise<void>;
  isSubmitting?: boolean;
}

export const PushUpCounter: React.FC<PushUpCounterProps> = ({
  todayTotal,
  onAdd,
  isSubmitting = false,
}) => {
  const [customInput, setCustomInput] = useState('');
  const [showCustomModal, setShowCustomModal] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const quickAmounts = [5, 10, 20, 25, 50];

  const handleQuickAdd = async (amount: number) => {
    if (isSubmitting) return;
    try {
      await onAdd(amount);
    } catch (err: any) {
      setError(err.message || 'Failed to add push-ups');
    }
  };

  const handleCustomSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const parsed = parseInt(customInput.trim(), 10);
    if (isNaN(parsed) || parsed <= 0) {
      setError('Please enter a valid positive whole number of push-ups.');
      return;
    }
    if (parsed > 2000) {
      setError('Push-ups cannot exceed 2,000 per entry.');
      return;
    }

    try {
      await onAdd(parsed);
      setCustomInput('');
      setShowCustomModal(false);
    } catch (err: any) {
      setError(err.message || 'Failed to add push-ups');
    }
  };

  return (
    <div className="bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border rounded-xl p-5 sm:p-6 shadow-subtle-light dark:shadow-subtle-dark flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-xs font-bold uppercase tracking-wider text-light-text-secondary dark:text-dark-text-secondary">
            Today's Push-Ups
          </h2>
          <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-light-surface-secondary dark:bg-dark-surface-secondary text-light-text-secondary dark:text-dark-text-secondary">
            Daily Accumulative
          </span>
        </div>

        {/* Big Counter with modern typography */}
        <div className="py-4 my-2 flex items-baseline gap-2">
          <span className="text-5xl sm:text-6xl font-black tracking-tight text-light-text dark:text-dark-text transition-all duration-300">
            {todayTotal}
          </span>
          <span className="text-sm font-semibold text-light-text-secondary dark:text-dark-text-secondary">
            reps today
          </span>
        </div>
      </div>

      {error && (
        <div className="mb-3 text-xs text-red-600 dark:text-red-400 bg-red-500/10 px-3 py-2 rounded-lg">
          {error}
        </div>
      )}

      {/* Quick Add Pills & Add Button */}
      <div className="space-y-3">
        <div className="grid grid-cols-5 gap-1.5 sm:gap-2">
          {quickAmounts.map((amount) => (
            <button
              key={amount}
              type="button"
              disabled={isSubmitting}
              onClick={() => handleQuickAdd(amount)}
              className="py-2.5 px-1 rounded-lg text-xs sm:text-sm font-bold border transition-all active:scale-95 disabled:opacity-50 
                bg-light-surface-secondary hover:bg-light-primary hover:text-white dark:bg-dark-surface-secondary dark:hover:bg-dark-primary dark:hover:text-dark-bg
                border-light-border dark:border-dark-border text-light-text dark:text-dark-text"
            >
              +{amount}
            </button>
          ))}
        </div>

        <button
          type="button"
          disabled={isSubmitting}
          onClick={() => {
            setError(null);
            setShowCustomModal(true);
          }}
          className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-lg text-sm font-bold tracking-wide transition-all shadow-sm active:scale-[0.99] disabled:opacity-50
            bg-light-primary hover:bg-light-primary-hover text-white dark:bg-dark-primary dark:hover:bg-dark-primary-hover dark:text-dark-bg"
        >
          <Plus className="w-4 h-4" />
          Add Custom Push-Ups
        </button>
      </div>

      {/* Clean Modal for Custom Input */}
      {showCustomModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border rounded-2xl p-6 w-full max-w-sm shadow-xl">
            <h3 className="text-lg font-bold text-light-text dark:text-dark-text mb-1">
              Add Push-Ups
            </h3>
            <p className="text-xs text-light-text-secondary dark:text-dark-text-secondary mb-4">
              Enter the number of push-ups you just completed.
            </p>

            <form onSubmit={handleCustomSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-light-text-secondary dark:text-dark-text-secondary mb-1.5">
                  How many push-ups?
                </label>
                <input
                  type="number"
                  min="1"
                  max="2000"
                  step="1"
                  autoFocus
                  required
                  placeholder="e.g. 15"
                  value={customInput}
                  onChange={(e) => setCustomInput(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border text-base font-semibold transition-all outline-none
                    bg-light-surface-secondary/50 dark:bg-dark-surface-secondary/50 border-light-border dark:border-dark-border text-light-text dark:text-dark-text
                    focus:ring-2 focus:ring-light-primary/30 dark:focus:ring-dark-primary/30"
                />
              </div>

              {error && (
                <p className="text-xs text-red-600 dark:text-red-400">{error}</p>
              )}

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCustomModal(false)}
                  className="flex-1 py-2.5 px-4 rounded-lg text-xs sm:text-sm font-semibold border transition-all
                    border-light-border dark:border-dark-border text-light-text dark:text-dark-text hover:bg-light-surface-secondary dark:hover:bg-dark-surface-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !customInput}
                  className="flex-1 py-2.5 px-4 rounded-lg text-xs sm:text-sm font-bold text-white transition-all disabled:opacity-50
                    bg-light-primary hover:bg-light-primary-hover dark:bg-dark-primary dark:hover:bg-dark-primary-hover dark:text-dark-bg"
                >
                  Add Push-Ups
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

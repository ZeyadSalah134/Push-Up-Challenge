import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Moon, Sun } from 'lucide-react';

interface LoginPageProps {
  onSwitchToRegister: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onSwitchToRegister }) => {
  const { login } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      await login(username.trim(), password);
    } catch (err: any) {
      setError(err.message || 'Incorrect username or password.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center px-4 py-12 relative bg-light-bg dark:bg-dark-bg transition-colors">
      {/* Absolute top right theme toggle */}
      <div className="absolute top-6 right-6">
        <button
          onClick={toggleTheme}
          aria-label="Toggle Theme"
          className="p-2.5 rounded-lg border bg-light-surface dark:bg-dark-surface border-light-border dark:border-dark-border text-light-text-secondary dark:text-dark-text-secondary hover:text-light-text dark:hover:text-dark-text transition-all"
        >
          {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4 text-amber-300" />}
        </button>
      </div>

      <div className="w-full max-w-sm">
        {/* Brand Logo & Title */}
        <div className="text-center mb-8">
          <div className="inline-flex w-12 h-12 rounded-xl items-center justify-center font-black tracking-wider text-lg bg-light-primary text-white dark:bg-dark-primary dark:text-dark-bg mb-3 shadow-sm">
            PU
          </div>
          <h1 className="text-2xl font-black tracking-wider uppercase text-light-text dark:text-dark-text">
            PUSHUP
          </h1>
          <p className="text-xs font-medium text-light-text-secondary dark:text-dark-text-secondary mt-1">
            Private Push-Up Challenge for Friends
          </p>
        </div>

        {/* Clean Login Card */}
        <div className="bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border rounded-2xl p-6 sm:p-8 shadow-subtle-light dark:shadow-subtle-dark">
          <h2 className="text-base font-bold text-light-text dark:text-dark-text mb-5">
            Log In
          </h2>

          {error && (
            <div className="mb-4 text-xs font-medium text-red-600 dark:text-red-400 bg-red-500/10 border border-red-500/20 px-3.5 py-2.5 rounded-lg">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-light-text-secondary dark:text-dark-text-secondary mb-1.5">
                Username
              </label>
              <input
                type="text"
                required
                autoCapitalize="none"
                placeholder="Enter username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-lg border text-sm font-medium outline-none transition-all
                  bg-light-surface-secondary/40 dark:bg-dark-surface-secondary/40 border-light-border dark:border-dark-border text-light-text dark:text-dark-text
                  focus:ring-2 focus:ring-light-primary/30 dark:focus:ring-dark-primary/30"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-light-text-secondary dark:text-dark-text-secondary mb-1.5">
                Password
              </label>
              <input
                type="password"
                required
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-lg border text-sm font-medium outline-none transition-all
                  bg-light-surface-secondary/40 dark:bg-dark-surface-secondary/40 border-light-border dark:border-dark-border text-light-text dark:text-dark-text
                  focus:ring-2 focus:ring-light-primary/30 dark:focus:ring-dark-primary/30"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading || !username || !password}
              className="w-full py-2.5 px-4 rounded-lg text-sm font-bold text-white transition-all shadow-sm active:scale-[0.99] disabled:opacity-50 mt-2
                bg-light-primary hover:bg-light-primary-hover dark:bg-dark-primary dark:hover:bg-dark-primary-hover dark:text-dark-bg"
            >
              {isLoading ? 'Logging in...' : 'Log In'}
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-light-border dark:border-dark-border text-center">
            <p className="text-xs text-light-text-secondary dark:text-dark-text-secondary">
              Don't have an account?{' '}
              <button
                onClick={onSwitchToRegister}
                className="font-bold underline text-light-primary dark:text-dark-primary hover:opacity-80 transition-opacity ml-0.5"
              >
                Create account
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

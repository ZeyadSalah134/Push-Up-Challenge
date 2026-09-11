import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Moon, Sun, LogOut, LayoutDashboard, History, User as UserIcon, Shield, Menu, X } from 'lucide-react';

interface NavbarProps {
  currentTab: 'dashboard' | 'history' | 'profile' | 'admin';
  setCurrentTab: (tab: 'dashboard' | 'history' | 'profile' | 'admin') => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentTab, setCurrentTab }) => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleNavClick = (tab: 'dashboard' | 'history' | 'profile' | 'admin') => {
    setCurrentTab(tab);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b transition-colors bg-light-surface/90 dark:bg-dark-surface/90 backdrop-blur-md border-light-border dark:border-dark-border">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <div 
          onClick={() => handleNavClick('dashboard')}
          className="flex items-center gap-2.5 cursor-pointer select-none group"
        >
          <div className="w-8 h-8 rounded-lg flex items-center justify-center font-black tracking-wider text-sm bg-light-primary text-white dark:bg-dark-primary dark:text-dark-bg transition-transform group-hover:scale-105">
            PU
          </div>
          <span className="font-extrabold tracking-wider text-lg text-light-text dark:text-dark-text">
            PUSHUP
          </span>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-1.5">
          <button
            onClick={() => handleNavClick('dashboard')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-md text-sm font-medium transition-all ${
              currentTab === 'dashboard'
                ? 'bg-light-primary/10 text-light-primary dark:bg-dark-primary/15 dark:text-dark-primary font-semibold'
                : 'text-light-text-secondary dark:text-dark-text-secondary hover:text-light-text dark:hover:text-dark-text'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            Dashboard
          </button>

          <button
            onClick={() => handleNavClick('history')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-md text-sm font-medium transition-all ${
              currentTab === 'history'
                ? 'bg-light-primary/10 text-light-primary dark:bg-dark-primary/15 dark:text-dark-primary font-semibold'
                : 'text-light-text-secondary dark:text-dark-text-secondary hover:text-light-text dark:hover:text-dark-text'
            }`}
          >
            <History className="w-4 h-4" />
            History
          </button>

          <button
            onClick={() => handleNavClick('profile')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-md text-sm font-medium transition-all ${
              currentTab === 'profile'
                ? 'bg-light-primary/10 text-light-primary dark:bg-dark-primary/15 dark:text-dark-primary font-semibold'
                : 'text-light-text-secondary dark:text-dark-text-secondary hover:text-light-text dark:hover:text-dark-text'
            }`}
          >
            <UserIcon className="w-4 h-4" />
            <span>{user?.username || 'Profile'}</span>
          </button>

          <button
            onClick={() => handleNavClick('admin')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
              currentTab === 'admin'
                ? 'bg-light-primary/10 text-light-primary dark:bg-dark-primary/15 dark:text-dark-primary font-semibold'
                : 'text-light-text-secondary dark:text-dark-text-secondary hover:text-light-text dark:hover:text-dark-text'
            }`}
          >
            <Shield className="w-4 h-4" />
            Admin
          </button>

          <div className="h-4 w-[1px] mx-2 bg-light-border dark:bg-dark-border" />

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            aria-label="Toggle Theme"
            className="p-2 rounded-md text-light-text-secondary dark:text-dark-text-secondary hover:text-light-text dark:hover:text-dark-text hover:bg-light-surface-secondary dark:hover:bg-dark-surface-secondary transition-all"
            title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
          >
            {theme === 'light' ? (
              <Moon className="w-4 h-4" />
            ) : (
              <Sun className="w-4 h-4 text-amber-300" />
            )}
          </button>

          {/* Logout */}
          <button
            onClick={logout}
            aria-label="Log Out"
            className="p-2 rounded-md text-light-text-secondary dark:text-dark-text-secondary hover:text-red-600 dark:hover:text-red-400 hover:bg-light-surface-secondary dark:hover:bg-dark-surface-secondary transition-all"
            title="Log Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>

        {/* Mobile menu trigger & Theme icon */}
        <div className="flex md:hidden items-center gap-2">
          <button
            onClick={toggleTheme}
            aria-label="Toggle Theme"
            className="p-2 rounded-md text-light-text-secondary dark:text-dark-text-secondary"
          >
            {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5 text-amber-300" />}
          </button>
          
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-md text-light-text dark:text-dark-text hover:bg-light-surface-secondary dark:hover:bg-dark-surface-secondary"
            aria-label="Toggle Menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t px-4 py-3 bg-light-surface dark:bg-dark-surface border-light-border dark:border-dark-border space-y-1">
          <button
            onClick={() => handleNavClick('dashboard')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium ${
              currentTab === 'dashboard'
                ? 'bg-light-primary/10 text-light-primary dark:bg-dark-primary/15 dark:text-dark-primary font-semibold'
                : 'text-light-text-secondary dark:text-dark-text-secondary'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            Dashboard
          </button>
          <button
            onClick={() => handleNavClick('history')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium ${
              currentTab === 'history'
                ? 'bg-light-primary/10 text-light-primary dark:bg-dark-primary/15 dark:text-dark-primary font-semibold'
                : 'text-light-text-secondary dark:text-dark-text-secondary'
            }`}
          >
            <History className="w-4 h-4" />
            History
          </button>
          <button
            onClick={() => handleNavClick('profile')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium ${
              currentTab === 'profile'
                ? 'bg-light-primary/10 text-light-primary dark:bg-dark-primary/15 dark:text-dark-primary font-semibold'
                : 'text-light-text-secondary dark:text-dark-text-secondary'
            }`}
          >
            <UserIcon className="w-4 h-4" />
            Profile ({user?.username})
          </button>
          <button
            onClick={() => handleNavClick('admin')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium ${
              currentTab === 'admin'
                ? 'bg-light-primary/10 text-light-primary dark:bg-dark-primary/15 dark:text-dark-primary font-semibold'
                : 'text-light-text-secondary dark:text-dark-text-secondary'
            }`}
          >
            <Shield className="w-4 h-4" />
            Admin Panel
          </button>
          <div className="pt-2 border-t border-light-border dark:border-dark-border">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                logout();
              }}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-600 dark:text-red-400"
            >
              <LogOut className="w-4 h-4" />
              Log Out
            </button>
          </div>
        </div>
      )}
    </header>
  );
};

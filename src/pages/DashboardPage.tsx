import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';
import type { UserStats, LeaderboardItem, DailyActivityItem, PushUpEntry } from '../types';
import { StatCard } from '../components/StatCard';
import { PushUpCounter } from '../components/PushUpCounter';
import { Leaderboard } from '../components/Leaderboard';
import { ActivityChart } from '../components/ActivityChart';
import { RecentActivity } from '../components/RecentActivity';
import { ToastNotification } from '../components/ToastNotification';
import { Flame, Trophy, Calendar, Zap } from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();

  const [stats, setStats] = useState<UserStats | null>(null);
  const [leaderboardItems, setLeaderboardItems] = useState<LeaderboardItem[]>([]);
  const [leaderboardType, setLeaderboardType] = useState<'today' | 'overall'>('today');
  const [activityData, setActivityData] = useState<DailyActivityItem[]>([]);
  const [recentEntries, setRecentEntries] = useState<PushUpEntry[]>([]);

  const [isAdding, setIsAdding] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<'success' | 'error'>('success');

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToastMessage(msg);
    setToastType(type);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  const loadData = useCallback(async () => {
    try {
      const [statsRes, lbRes, actRes, recentRes] = await Promise.all([
        api.getMyStats(),
        api.getLeaderboard(leaderboardType),
        api.getActivity(7),
        api.getRecent(5),
      ]);

      setStats(statsRes);
      setLeaderboardItems(lbRes.leaderboard);
      setActivityData(actRes.activity);
      setRecentEntries(recentRes.entries);
    } catch (err: any) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setIsLoading(false);
    }
  }, [leaderboardType]);

  useEffect(() => {
    loadData();
    // Background poll every 15 seconds to sync shared friend activity in real-time
    const interval = setInterval(loadData, 15000);
    return () => clearInterval(interval);
  }, [loadData]);

  // Handle push-up additions with instant feedback
  const handleAddPushups = async (count: number) => {
    setIsAdding(true);
    try {
      await api.addPushups(count);
      showToast(`+${count} push-ups added!`, 'success');

      // Optimistically update stats
      setStats((prev) =>
        prev
          ? {
              ...prev,
              todayPushups: prev.todayPushups + count,
              totalPushups: prev.totalPushups + count,
            }
          : null
      );

      // Re-fetch all data to synchronize rank and leaderboard
      await loadData();
    } catch (err: any) {
      showToast(err.message || 'Failed to record push-ups', 'error');
      throw err;
    } finally {
      setIsAdding(false);
    }
  };

  // Get greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header Greeting */}
      <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-1">
        <div>
          <h1 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-light-text dark:text-dark-text">
            {getGreeting()}, {user?.username}
          </h1>
          <p className="text-xs sm:text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary">
            Every repetition counts. Keep going.
          </p>
        </div>
      </div>

      {/* Top Stat Cards Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatCard
          label="Today's Push-Ups"
          value={stats?.todayPushups ?? 0}
          icon={Flame}
          highlight={true}
        />
        <StatCard
          label="Total Push-Ups"
          value={stats?.totalPushups ?? 0}
          icon={Zap}
        />
        <StatCard
          label="Current Rank"
          value={`#${stats?.currentRank ?? 1}`}
          subValue={stats ? `Today: #${stats.todayRank}` : undefined}
          icon={Trophy}
        />
        <StatCard
          label="Challenge Days"
          value={stats?.challengeDays ?? 0}
          subValue={stats?.averagePerDay ? `Avg: ${stats.averagePerDay}/d` : undefined}
          icon={Calendar}
        />
      </div>

      {/* Core Action Area: Push-Up Counter & Leaderboard */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-5 h-full">
          <PushUpCounter
            todayTotal={stats?.todayPushups ?? 0}
            onAdd={handleAddPushups}
            isSubmitting={isAdding}
          />
        </div>

        <div className="lg:col-span-7 h-full">
          <Leaderboard
            items={leaderboardItems}
            type={leaderboardType}
            setType={setLeaderboardType}
            isLoading={isLoading}
          />
        </div>
      </div>

      {/* Activity Graph and Recent Activity Area */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-7">
          <ActivityChart data={activityData} isLoading={isLoading} />
        </div>

        <div className="lg:col-span-5">
          <RecentActivity entries={recentEntries} isLoading={isLoading} />
        </div>
      </div>

      {/* Toast Feedback */}
      <ToastNotification
        message={toastMessage}
        type={toastType}
        onClose={() => setToastMessage(null)}
      />
    </div>
  );
};

import { Router, Response } from 'express';
import { db } from '../db';
import { authenticateToken, AuthRequest } from '../auth';

export const statsRouter = Router();

function getTodayDateStr(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// GET /api/stats/leaderboard?type=today|overall
statsRouter.get('/leaderboard', authenticateToken, (req: AuthRequest, res: Response) => {
  try {
    const type = req.query.type === 'today' ? 'today' : 'overall';
    const clientDate = typeof req.query.date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(req.query.date)
      ? req.query.date
      : getTodayDateStr();

    if (type === 'today') {
      // Leaderboard for today's pushups, sorted by today's count DESC, then overall total DESC
      const rows = db.prepare(`
        SELECT
          u.id as user_id,
          u.username,
          COALESCE(today_sub.today_total, 0) as today_total,
          COALESCE(overall_sub.overall_total, 0) as overall_total
        FROM users u
        LEFT JOIN (
          SELECT user_id, SUM(count) as today_total
          FROM pushup_entries
          WHERE entry_date = ?
          GROUP BY user_id
        ) today_sub ON u.id = today_sub.user_id
        LEFT JOIN (
          SELECT user_id, SUM(count) as overall_total
          FROM pushup_entries
          GROUP BY user_id
        ) overall_sub ON u.id = overall_sub.user_id
        ORDER BY today_total DESC, overall_total DESC, u.username ASC
      `).all(clientDate) as Array<{ user_id: number; username: string; today_total: number; overall_total: number }>;

      const leaderboard = rows.map((row, index) => ({
        rank: index + 1,
        userId: row.user_id,
        username: row.username,
        todayCount: row.today_total,
        totalCount: row.overall_total,
        isCurrentUser: row.user_id === req.user!.id
      }));

      return res.json({ type: 'today', date: clientDate, leaderboard });
    } else {
      // Overall leaderboard: sorted by overall_total DESC, then today_total DESC
      const rows = db.prepare(`
        SELECT
          u.id as user_id,
          u.username,
          COALESCE(overall_sub.overall_total, 0) as overall_total,
          COALESCE(today_sub.today_total, 0) as today_total
        FROM users u
        LEFT JOIN (
          SELECT user_id, SUM(count) as overall_total
          FROM pushup_entries
          GROUP BY user_id
        ) overall_sub ON u.id = overall_sub.user_id
        LEFT JOIN (
          SELECT user_id, SUM(count) as today_total
          FROM pushup_entries
          WHERE entry_date = ?
          GROUP BY user_id
        ) today_sub ON u.id = today_sub.user_id
        ORDER BY overall_total DESC, today_total DESC, u.username ASC
      `).all(clientDate) as Array<{ user_id: number; username: string; overall_total: number; today_total: number }>;

      const leaderboard = rows.map((row, index) => ({
        rank: index + 1,
        userId: row.user_id,
        username: row.username,
        todayCount: row.today_total,
        totalCount: row.overall_total,
        isCurrentUser: row.user_id === req.user!.id
      }));

      return res.json({ type: 'overall', leaderboard });
    }
  } catch (err) {
    console.error('Leaderboard error:', err);
    return res.status(500).json({ error: 'Failed to generate leaderboard.' });
  }
});

// GET /api/stats/me - Current user's summary metrics
statsRouter.get('/me', authenticateToken, (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const clientDate = typeof req.query.date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(req.query.date)
      ? req.query.date
      : getTodayDateStr();

    // 1. Today's push-ups
    const todayRow = db.prepare(`
      SELECT COALESCE(SUM(count), 0) as count
      FROM pushup_entries
      WHERE user_id = ? AND entry_date = ?
    `).get(userId, clientDate) as { count: number };

    // 2. Overall total push-ups
    const overallRow = db.prepare(`
      SELECT COALESCE(SUM(count), 0) as count
      FROM pushup_entries
      WHERE user_id = ?
    `).get(userId) as { count: number };

    // 3. Current overall ranking
    const rankRow = db.prepare(`
      WITH user_totals AS (
        SELECT u.id, COALESCE(SUM(p.count), 0) as total
        FROM users u
        LEFT JOIN pushup_entries p ON u.id = p.user_id
        GROUP BY u.id
      ),
      ranked AS (
        SELECT id, total,
               RANK() OVER (ORDER BY total DESC, id ASC) as rank
        FROM user_totals
      )
      SELECT rank FROM ranked WHERE id = ?
    `).get(userId) as { rank: number } | undefined;

    // 4. Today ranking
    const todayRankRow = db.prepare(`
      WITH user_today AS (
        SELECT u.id, COALESCE(SUM(p.count), 0) as today_total
        FROM users u
        LEFT JOIN pushup_entries p ON u.id = p.user_id AND p.entry_date = ?
        GROUP BY u.id
      ),
      ranked_today AS (
        SELECT id, today_total,
               RANK() OVER (ORDER BY today_total DESC, id ASC) as rank
        FROM user_today
      )
      SELECT rank FROM ranked_today WHERE id = ?
    `).get(clientDate, userId) as { rank: number } | undefined;

    // 5. Challenge days (distinct days user has logged pushups)
    const daysRow = db.prepare(`
      SELECT COUNT(DISTINCT entry_date) as days
      FROM pushup_entries
      WHERE user_id = ?
    `).get(userId) as { days: number };

    // 6. Best day
    const bestDayRow = db.prepare(`
      SELECT entry_date, SUM(count) as total
      FROM pushup_entries
      WHERE user_id = ?
      GROUP BY entry_date
      ORDER BY total DESC
      LIMIT 1
    `).get(userId) as { entry_date: string; total: number } | undefined;

    // 7. Average per active day
    const avgPerDay = daysRow.days > 0 ? Math.round(overallRow.count / daysRow.days) : 0;

    return res.json({
      todayPushups: todayRow.count,
      totalPushups: overallRow.count,
      currentRank: rankRow?.rank || 1,
      todayRank: todayRankRow?.rank || 1,
      challengeDays: daysRow.days,
      bestDay: bestDayRow ? { date: bestDayRow.entry_date, count: bestDayRow.total } : null,
      averagePerDay: avgPerDay
    });
  } catch (err) {
    console.error('Stats me error:', err);
    return res.status(500).json({ error: 'Failed to retrieve stats.' });
  }
});

// GET /api/stats/activity - Activity for the last 7 days (or specific range)
statsRouter.get('/activity', authenticateToken, (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const days = Math.min(Number(req.query.days) || 7, 30);

    // Generate list of dates from (today - days + 1) up to today
    const dates: string[] = [];
    const now = new Date();
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      dates.push(`${year}-${month}-${day}`);
    }

    // Fetch daily aggregates for this user within range
    const minDate = dates[0];
    const maxDate = dates[dates.length - 1];

    const rows = db.prepare(`
      SELECT entry_date, SUM(count) as total
      FROM pushup_entries
      WHERE user_id = ? AND entry_date >= ? AND entry_date <= ?
      GROUP BY entry_date
    `).all(userId, minDate, maxDate) as Array<{ entry_date: string; total: number }>;

    const countMap = new Map<string, number>();
    rows.forEach(r => countMap.set(r.entry_date, r.total));

    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    const activity = dates.map(dateStr => {
      const parts = dateStr.split('-');
      const d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
      const dayLabel = dayNames[d.getDay()];
      return {
        date: dateStr,
        day: dayLabel,
        count: countMap.get(dateStr) || 0
      };
    });

    return res.json({ activity });
  } catch (err) {
    console.error('Stats activity error:', err);
    return res.status(500).json({ error: 'Failed to retrieve activity data.' });
  }
});

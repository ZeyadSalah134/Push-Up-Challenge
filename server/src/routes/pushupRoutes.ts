import { Router, Response } from 'express';
import { db } from '../db';
import { authenticateToken, AuthRequest } from '../auth';

export const pushupRouter = Router();

// Helper to get today's local YYYY-MM-DD string or accept user's local date
function getTodayDateStr(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// POST /api/pushups - Log new push-up count (must be positive integer, creates a NEW row)
pushupRouter.post('/', authenticateToken, (req: AuthRequest, res: Response) => {
  try {
    const { count, clientDate } = req.body;
    const userId = req.user!.id;

    // Strict validation: Reject <= 0, float, NaN, non-number
    const parsedCount = Number(count);
    if (!Number.isInteger(parsedCount) || parsedCount <= 0) {
      return res.status(400).json({ error: 'Please enter a valid positive whole number of push-ups.' });
    }

    if (parsedCount > 2000) {
      return res.status(400).json({ error: 'Maximum 2,000 push-ups per single entry.' });
    }

    // Use client's local date if valid YYYY-MM-DD, otherwise server today
    let entryDate = getTodayDateStr();
    if (clientDate && typeof clientDate === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(clientDate)) {
      entryDate = clientDate;
    }

    const insertStmt = db.prepare(`
      INSERT INTO pushup_entries (user_id, count, entry_date)
      VALUES (?, ?, ?)
    `);
    const result = insertStmt.run(userId, parsedCount, entryDate);
    const entryId = Number(result.lastInsertRowid);

    // Fetch updated totals for quick UI synchronization
    const todayTotalRow = db.prepare(`
      SELECT COALESCE(SUM(count), 0) as today_total
      FROM pushup_entries
      WHERE user_id = ? AND entry_date = ?
    `).get(userId, entryDate) as { today_total: number };

    const overallTotalRow = db.prepare(`
      SELECT COALESCE(SUM(count), 0) as overall_total
      FROM pushup_entries
      WHERE user_id = ?
    `).get(userId) as { overall_total: number };

    return res.status(201).json({
      message: `+${parsedCount} push-ups added`,
      entry: {
        id: entryId,
        user_id: userId,
        count: parsedCount,
        entry_date: entryDate,
        created_at: new Date().toISOString()
      },
      today_total: todayTotalRow.today_total,
      overall_total: overallTotalRow.overall_total
    });
  } catch (err) {
    console.error('Add pushups error:', err);
    return res.status(500).json({ error: 'Failed to record push-ups.' });
  }
});

// GET /api/pushups/today - Get current user's today's total and today's entries
pushupRouter.get('/today', authenticateToken, (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const clientDate = typeof req.query.date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(req.query.date)
      ? req.query.date
      : getTodayDateStr();

    const sumRow = db.prepare(`
      SELECT COALESCE(SUM(count), 0) as today_total
      FROM pushup_entries
      WHERE user_id = ? AND entry_date = ?
    `).get(userId, clientDate) as { today_total: number };

    const entries = db.prepare(`
      SELECT id, count, created_at, entry_date
      FROM pushup_entries
      WHERE user_id = ? AND entry_date = ?
      ORDER BY created_at DESC
    `).all(userId, clientDate);

    return res.json({
      date: clientDate,
      today_total: sumRow.today_total,
      entries
    });
  } catch (err) {
    console.error('Get today pushups error:', err);
    return res.status(500).json({ error: 'Failed to retrieve today\'s push-ups.' });
  }
});

// GET /api/pushups/recent - Get user's recent entries (e.g. last 10 entries)
pushupRouter.get('/recent', authenticateToken, (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const limit = Math.min(Number(req.query.limit) || 10, 50);

    const entries = db.prepare(`
      SELECT id, count, created_at, entry_date
      FROM pushup_entries
      WHERE user_id = ?
      ORDER BY id DESC
      LIMIT ?
    `).all(userId, limit);

    return res.json({ entries });
  } catch (err) {
    console.error('Get recent pushups error:', err);
    return res.status(500).json({ error: 'Failed to retrieve recent entries.' });
  }
});

// GET /api/pushups/history - Grouped daily totals for history page
pushupRouter.get('/history', authenticateToken, (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;

    // Group by entry_date descending
    const dailyRows = db.prepare(`
      SELECT
        entry_date,
        SUM(count) as total_count,
        COUNT(id) as entries_count
      FROM pushup_entries
      WHERE user_id = ?
      GROUP BY entry_date
      ORDER BY entry_date DESC
    `).all(userId) as Array<{ entry_date: string; total_count: number; entries_count: number }>;

    // Compute cumulative sum descending for easy scan
    let overallSum = db.prepare(`
      SELECT COALESCE(SUM(count), 0) as total
      FROM pushup_entries
      WHERE user_id = ?
    `).get(userId) as { total: number };

    let runningAccumulated = overallSum.total;
    const historyWithRunning = dailyRows.map(row => {
      const item = {
        date: row.entry_date,
        count: row.total_count,
        entriesCount: row.entries_count,
        accumulated: runningAccumulated
      };
      runningAccumulated -= row.total_count;
      return item;
    });

    return res.json({
      history: historyWithRunning,
      totalPushups: overallSum.total
    });
  } catch (err) {
    console.error('Get history error:', err);
    return res.status(500).json({ error: 'Failed to retrieve push-up history.' });
  }
});

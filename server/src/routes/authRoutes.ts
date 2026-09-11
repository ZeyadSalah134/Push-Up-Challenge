import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { db } from '../db';
import { generateToken, authenticateToken, AuthRequest } from '../auth';

export const authRouter = Router();

// POST /api/auth/register
authRouter.post('/register', async (req: Request, res: Response) => {
  try {
    const { username, password, confirmPassword } = req.body;

    if (!username || typeof username !== 'string' || username.trim().length === 0) {
      return res.status(400).json({ error: 'Username is required.' });
    }

    const trimmedUsername = username.trim();

    if (trimmedUsername.length < 2 || trimmedUsername.length > 25) {
      return res.status(400).json({ error: 'Username must be between 2 and 25 characters.' });
    }

    if (!/^[a-zA-Z0-9_-]+$/.test(trimmedUsername)) {
      return res.status(400).json({ error: 'Username can only contain letters, numbers, hyphens, and underscores.' });
    }

    if (!password || typeof password !== 'string' || password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters.' });
    }

    if (confirmPassword !== undefined && password !== confirmPassword) {
      return res.status(400).json({ error: 'Passwords do not match.' });
    }

    // Check if user already exists
    const existing = db.prepare('SELECT id FROM users WHERE username = ? COLLATE NOCASE').get(trimmedUsername);
    if (existing) {
      return res.status(409).json({ error: 'Username already exists.' });
    }

    // Hash password securely
    const saltRounds = 10;
    const password_hash = await bcrypt.hash(password, saltRounds);

    const stmt = db.prepare('INSERT INTO users (username, password_hash) VALUES (?, ?)');
    const result = stmt.run(trimmedUsername, password_hash);
    const userId = Number(result.lastInsertRowid);

    const token = generateToken({ id: userId, username: trimmedUsername });

    return res.status(201).json({
      message: 'Account created successfully',
      token,
      user: {
        id: userId,
        username: trimmedUsername,
        created_at: new Date().toISOString()
      }
    });
  } catch (err) {
    console.error('Registration error:', err);
    return res.status(500).json({ error: 'An unexpected error occurred during registration.' });
  }
});

// POST /api/auth/login
authRouter.post('/login', async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Please provide both username and password.' });
    }

    const user = db.prepare('SELECT * FROM users WHERE username = ? COLLATE NOCASE').get(username.trim()) as any;

    if (!user) {
      return res.status(401).json({ error: 'Incorrect username or password.' });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Incorrect username or password.' });
    }

    const token = generateToken({ id: user.id, username: user.username });

    return res.status(200).json({
      message: 'Logged in successfully',
      token,
      user: {
        id: user.id,
        username: user.username,
        created_at: user.created_at
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ error: 'An unexpected error occurred during login.' });
  }
});

// GET /api/auth/me
authRouter.get('/me', authenticateToken, (req: AuthRequest, res: Response) => {
  try {
    const user = db.prepare('SELECT id, username, created_at FROM users WHERE id = ?').get(req.user!.id) as any;
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }
    return res.json({ user });
  } catch (err) {
    console.error('Me endpoint error:', err);
    return res.status(500).json({ error: 'Failed to retrieve session info.' });
  }
});

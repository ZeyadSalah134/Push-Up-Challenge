import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { initDB } from './db';
import { authRouter } from './routes/authRoutes';
import { pushupRouter } from './routes/pushupRoutes';
import { statsRouter } from './routes/statsRoutes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Initialize DB schema
initDB();

// Middlewares
app.use(cors({
  origin: true,
  credentials: true
}));
app.use(express.json());

// Routes
app.use('/api/auth', authRouter);
app.use('/api/pushups', pushupRouter);
app.use('/api/stats', statsRouter);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`Push-Up Challenge Server running on port ${PORT}`);
});

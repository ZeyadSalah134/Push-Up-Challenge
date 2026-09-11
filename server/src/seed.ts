import bcrypt from 'bcryptjs';
import { db, initDB } from './db';

initDB();

async function seed() {
  console.log('Seeding initial challenge users...');

  // Check if users already exist
  const count = db.prepare('SELECT COUNT(*) as count FROM users').get() as { count: number };
  if (count.count > 0) {
    console.log('Database already has users. Skipping seed.');
    return;
  }

  const passwordHash = await bcrypt.hash('password123', 10);

  // Insert seed users: Ahmed, Zeyad, Omar, Youssef
  const insertUser = db.prepare('INSERT INTO users (username, password_hash) VALUES (?, ?)');
  const ahmedId = Number(insertUser.run('Ahmed', passwordHash).lastInsertRowid);
  const zeyadId = Number(insertUser.run('Zeyad', passwordHash).lastInsertRowid);
  const omarId = Number(insertUser.run('Omar', passwordHash).lastInsertRowid);
  const youssefId = Number(insertUser.run('Youssef', passwordHash).lastInsertRowid);

  const today = new Date();
  const formatD = (daysAgo: number) => {
    const d = new Date(today);
    d.setDate(d.getDate() - daysAgo);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  };

  const todayStr = formatD(0);
  const yesterdayStr = formatD(1);
  const d2Str = formatD(2);
  const d3Str = formatD(3);
  const d4Str = formatD(4);

  const insertEntry = db.prepare('INSERT INTO pushup_entries (user_id, count, entry_date) VALUES (?, ?, ?)');

  // Ahmed (450 total, 35 today)
  insertEntry.run(ahmedId, 20, todayStr);
  insertEntry.run(ahmedId, 15, todayStr);
  insertEntry.run(ahmedId, 50, yesterdayStr);
  insertEntry.run(ahmedId, 65, d2Str);
  insertEntry.run(ahmedId, 100, d3Str);
  insertEntry.run(ahmedId, 200, d4Str);

  // Zeyad (420 total, 30 today)
  insertEntry.run(zeyadId, 10, todayStr);
  insertEntry.run(zeyadId, 20, todayStr);
  insertEntry.run(zeyadId, 40, yesterdayStr);
  insertEntry.run(zeyadId, 50, d2Str);
  insertEntry.run(zeyadId, 100, d3Str);
  insertEntry.run(zeyadId, 200, d4Str);

  // Omar (315 total, 20 today)
  insertEntry.run(omarId, 20, todayStr);
  insertEntry.run(omarId, 45, yesterdayStr);
  insertEntry.run(omarId, 50, d2Str);
  insertEntry.run(omarId, 80, d3Str);
  insertEntry.run(omarId, 120, d4Str);

  // Youssef (280 total, 15 today)
  insertEntry.run(youssefId, 15, todayStr);
  insertEntry.run(youssefId, 35, yesterdayStr);
  insertEntry.run(youssefId, 50, d2Str);
  insertEntry.run(youssefId, 80, d3Str);
  insertEntry.run(youssefId, 100, d4Str);

  console.log('Seed completed successfully!');
}

seed().catch(console.error);

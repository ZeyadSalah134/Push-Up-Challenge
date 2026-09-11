# 🏋️‍♂️ PUSHUP — Push-Up Challenge Dashboard

A modern, minimal, sporty, and production-grade full-stack web application designed for a private group of friends to log push-ups, view real-time shared leaderboards, track daily activity, and celebrate streaks.

Built with **React**, **TypeScript**, **Tailwind CSS**, **Node.js**, **Express**, and **persistent SQLite**.

---

## 📸 Key Features

- **Quick Push-Up Logging**: Instant one-tap pills (`+5`, `+10`, `+20`, `+25`, `+50`) and custom modal input with immediate optimistic updates.
- **Additive History**: Multiple entries logged throughout the day accumulate into daily totals without ever overwriting past records.
- **Shared Multi-User Leaderboard**: Real-time ranking toggleable between **Today** and **Overall**, with subtle podium highlights and logged-in user identification.
- **Activity Visualization**: Clean 7-day bar chart showing push-ups per day.
- **Dedicated History Page**: Full daily logs with entry counts and running cumulative totals.
- **Profile & Rules**: Personal statistics (lifetime reps, best day, rank, average per day) plus challenge guidelines.
- **Light & Dark Theme**: Custom curated color palettes with persistent storage.
  - **Light**: Warm `#F7F4EE` background, `#7D8F63` sporty olive primary, `#E7E1D5` surfaces.
  - **Dark**: Deep `#0B1020` night background, `#6F8CFF` crisp royal primary, `#202A45` surfaces.
- **Email-Free Auth**: Clean username & password authentication with secure bcrypt password hashing and JWT sessions.

---

## 🛠 Tech Stack

### Frontend
- **Framework**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS (Strict custom color tokens)
- **Icons**: Lucide React
- **HTTP Client**: Native `fetch` with token interceptor and local date synchronization

### Backend & Database
- **Server**: Node.js, Express, TypeScript (executed with `tsx`)
- **Database**: SQLite via `better-sqlite3` (WAL mode enabled for speed and concurrency)
- **Security**: `bcryptjs` for salt-hashed passwords, `jsonwebtoken` for protected endpoints

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or newer)
- npm

### 1. Clone & Install Dependencies

```bash
# Clone the repository
git clone https://github.com/your-username/pushup-challenge.git
cd pushup-challenge

# Install frontend dependencies
npm install

# Install backend dependencies
cd server
npm install
cd ..
```

### 2. Environment Configuration

Create a `.env` file in the `server/` directory:

```env
PORT=5000
JWT_SECRET=your_super_secret_jwt_key_here
```

Create a `.env` file in the root project directory (optional, defaults to `http://localhost:5000/api`):

```env
VITE_API_URL=http://localhost:5000/api
```

### 3. Seed Initial Demo Users (Optional)

Pre-load challenge participants (`Ahmed`, `Zeyad`, `Omar`, `Youssef`):

```bash
cd server
npm run seed
cd ..
```
*Default password for all seeded accounts is `password123`.*

### 4. Running Locally

You can run both the server and the frontend concurrently:

**Terminal 1 — Backend:**
```bash
cd server
npm run dev
# Server runs on http://localhost:5000
```

**Terminal 2 — Frontend:**
```bash
npm run dev
# Frontend runs on http://localhost:5173
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 📂 Project Structure

```text
├── src/
│   ├── api/
│   │   └── client.ts            # Typed HTTP API client
│   ├── components/
│   │   ├── ActivityChart.tsx    # 7-day activity bar chart
│   │   ├── Leaderboard.tsx      # Today / Overall rankings
│   │   ├── Navbar.tsx           # Responsive header + drawer + theme toggle
│   │   ├── PushUpCounter.tsx    # Counter + Quick-add pills + Modal
│   │   ├── RecentActivity.tsx   # Live timeline of latest entries
│   │   ├── StatCard.tsx         # Metric summary card
│   │   └── ToastNotification.tsx# Toast feedback alerts
│   ├── context/
│   │   ├── AuthContext.tsx      # User authentication session
│   │   └── ThemeContext.tsx     # Light/Dark mode state
│   ├── pages/
│   │   ├── DashboardPage.tsx    # Main challenge dashboard
│   │   ├── HistoryPage.tsx      # Daily totals & accumulated history
│   │   ├── LoginPage.tsx        # Minimal email-free login
│   │   ├── ProfilePage.tsx      # Personal records & challenge rules
│   │   └── RegisterPage.tsx     # Instant registration
│   ├── types/
│   │   └── index.ts             # Domain interfaces
│   ├── App.tsx
│   ├── index.css
│   └── main.tsx
├── server/
│   ├── data/
│   │   └── pushups.db           # Persistent SQLite database
│   ├── src/
│   │   ├── routes/
│   │   │   ├── authRoutes.ts    # /register, /login, /me
│   │   │   ├── pushupRoutes.ts  # /pushups, /today, /recent, /history
│   │   │   └── statsRoutes.ts   # /leaderboard, /me, /activity
│   │   ├── auth.ts              # JWT middleware & bcrypt
│   │   ├── db.ts                # Schema creation & DB connection
│   │   ├── index.ts             # Express application
│   │   └── seed.ts              # Demo seed data
│   ├── package.json
│   └── tsconfig.json
├── tailwind.config.js
└── README.md
```

---

## 🔒 Security & Validation

- Minimum 6-character passwords securely hashed with `bcryptjs`.
- Strict server-side input validation: rejects negative numbers, zero, floats, non-numeric strings, and entries exceeding 2,000 reps.
- Case-insensitive unique usernames with length and character constraints.
- Sensitive error sanitization: no internal server stack traces or database errors exposed to clients.

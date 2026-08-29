# 📊 Ledger - Habit Tracker

A beautiful, full-stack habit tracking application that helps you build and maintain consistent habits. Track your progress with real-time analytics, streaks, and insights.

**Built by Mehakpreet**

---

## ✨ Features

- **User Authentication** - Secure signup/login with JWT tokens
- **Habit Management** - Create, update, and delete habits with ease
- **Daily Logging** - Log your habits and track daily completions
- **Streak Tracking** - Visual representation of your consistency
- **Analytics Dashboard** - 30-day, 90-day, and yearly views with trend analysis
- **Habit Insights** - Deep-dive into each habit's performance and history
- **Beautiful UI** - Responsive design with smooth animations

---

## 🛠️ Tech Stack

### Frontend
- **React** with Vite (fast build tool)
- **Tailwind CSS** for styling
- **Framer Motion** for smooth animations
- **Recharts** for data visualization
- **Lucide Icons** for UI icons
- **Axios** for API calls

### Backend
- **Node.js** runtime
- **Express** web framework
- **MongoDB + Mongoose** for data persistence
- **JWT** for secure authentication
- **Bcrypt** for password hashing

---

## 📁 Project Structure

```
ledger/
├── client/          — React frontend (Vite)
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── context/
│   │   └── services/
│   └── package.json
├── server/          — Express backend API
│   ├── models/
│   ├── controllers/
│   ├── routes/
│   ├── middleware/
│   └── package.json
├── DEPLOYMENT.md    — Easy deployment guide
└── README.md
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js (v14+)
- MongoDB Atlas account (free tier available)
- npm or yarn

### 1. Backend Setup

```bash
cd server
npm install

# Create .env file with:
# MONGO_URI=your_mongodb_connection_string
# JWT_SECRET=your_secret_key
# JWT_EXPIRES_IN=7d
# PORT=5001
# CLIENT_URL=http://localhost:5173

npm run dev
```

Server runs on **http://localhost:5001**

### 2. Frontend Setup

```bash
cd client
npm install
npm run dev
```

Client runs on **http://localhost:5173**

---

## ⚙️ Environment Variables

### Server (.env)

| Variable | Description | Example |
|---|---|---|
| `MONGO_URI` | MongoDB Atlas connection string | `mongodb+srv://user:pass@cluster.mongodb.net/db` |
| `JWT_SECRET` | Secret key for signing tokens | `your-secret-key-here` |
| `JWT_EXPIRES_IN` | Token expiration time | `7d` |
| `PORT` | Server port | `5001` |
| `CLIENT_URL` | Frontend origin for CORS | `http://localhost:5173` |

---

## 📦 Deployment

See [DEPLOYMENT.md](DEPLOYMENT.md) for step-by-step instructions to deploy on:
- **Vercel** (Frontend)
- **Railway** (Backend)
- **Render.com** (Both)

**Recommended**: Vercel + Railway (takes ~10 minutes)

---

## 🎯 Core Features Implemented

- ✅ User authentication (signup/login)
- ✅ Habit CRUD operations
- ✅ Daily habit logging
- ✅ Streak calculation
- ✅ Analytics and trending
- ✅ Responsive UI
- ✅ Data persistence with MongoDB

---

## 📝 API Endpoints

### Auth
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user (protected)

### Habits
- `GET /api/habits` - Get all habits
- `POST /api/habits` - Create habit
- `PUT /api/habits/:id` - Update habit
- `DELETE /api/habits/:id` - Delete habit

### Logs
- `POST /api/habits/:id/log` - Log habit completion
- `GET /api/habits/:id/logs` - Get habit history

### Analytics
- `GET /api/analytics/dashboard` - Get dashboard data
- `GET /api/analytics/habit/:id` - Get habit analytics

---

## 🤝 Contributing

Feel free to fork, modify, and improve this project!

---

## 📄 License

Open source - use freely for personal or commercial projects.

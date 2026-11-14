# CareerNavi AI — Backend (Phase 1)

AI-powered career guidance platform backend. Built with Node.js, Express, MongoDB (Mongoose), JWT auth, and Groq for all AI features.

---

## 1. Tech Stack

- Node.js + Express.js
- MongoDB + Mongoose
- JWT (jsonwebtoken) authentication
- bcryptjs for password hashing
- Groq API (OpenAI-compatible `/chat/completions` endpoint) for AI features
- helmet, cors, morgan for security/logging

---

## 2. Setup & Run

### Prerequisites
- Node.js v18+
- MongoDB running locally or a MongoDB Atlas connection string
- A Groq API key (free at https://console.groq.com)

### Steps

```bash
# 1. Install dependencies
cd backend
npm install

# 2. Create your .env file
cp .env.example .env
# then edit .env and fill in real values (see below)

# 3. Run in development (auto-restart on changes)
npm run dev

# OR run in production mode
npm start
```

The server will start on `http://localhost:5000` (or whatever `PORT` you set).

Health check: `GET http://localhost:5000/api/health`

---

## 3. Required Environment Variables

Copy `.env.example` to `.env` and fill in:

| Variable | Description | Example |
|---|---|---|
| `PORT` | Port the server runs on | `5000` |
| `NODE_ENV` | `development` or `production` | `development` |
| `MONGO_URI` | MongoDB connection string | `mongodb://127.0.0.1:27017/careernavi_ai` |
| `JWT_SECRET` | Long random string for signing JWTs | `super_long_random_string` |
| `JWT_EXPIRES_IN` | Token expiry | `7d` |
| `GROQ_API_KEY` | Your Groq API key | `gsk_xxxxxxxx` |
| `GROQ_MODEL` | Groq model name | `llama-3.3-70b-versatile` |
| `GROQ_API_URL` | Groq chat completions endpoint | `https://api.groq.com/openai/v1/chat/completions` |
| `CLIENT_URL` | Frontend origin for CORS | `http://localhost:3000` |

---

## 4. API Reference & Sample Requests (Postman)

All private routes require header:
```
Authorization: Bearer <token>
```

### 🔐 Auth

**Register**
```
POST /api/auth/register
Content-Type: application/json

{
  "name": "Riya Sharma",
  "email": "riya@example.com",
  "password": "password123",
  "degree": "B.Tech CSE",
  "year": "3rd Year",
  "skills": ["HTML", "CSS", "JavaScript"],
  "interests": ["Web Development", "AI"],
  "careerGoal": "Frontend Developer"
}
```

**Login**
```
POST /api/auth/login
Content-Type: application/json

{
  "email": "riya@example.com",
  "password": "password123"
}
```
Response includes `data.token` — use this in the `Authorization` header for all routes below.

---

### 👤 User Profile

**Get profile**
```
GET /api/users/profile
Authorization: Bearer <token>
```

**Update profile**
```
PUT /api/users/profile
Authorization: Bearer <token>
Content-Type: application/json

{
  "skills": ["HTML", "CSS", "JavaScript", "React"],
  "careerGoal": "Full Stack Developer"
}
```

---

### 🗺️ AI Career Roadmap

**Generate roadmap** (uses your saved profile; you can override the goal)
```
POST /api/roadmap/generate
Authorization: Bearer <token>
Content-Type: application/json

{
  "careerGoal": "Full Stack Developer"
}
```

**Get all your roadmaps**
```
GET /api/roadmap
Authorization: Bearer <token>
```

**Get a specific roadmap**
```
GET /api/roadmap/:id
Authorization: Bearer <token>
```

---

### 📊 Skill Gap Analysis

```
POST /api/skill-gap/analyze
Authorization: Bearer <token>
Content-Type: application/json

{
  "targetRole": "Data Analyst",
  "skills": ["Excel", "SQL"]
}
```
(`skills` is optional — defaults to your saved profile skills if omitted)

---

### 💬 AI Mentor Chat (stateless)

```
POST /api/chat/ask
Authorization: Bearer <token>
Content-Type: application/json

{
  "question": "How do I prepare for a frontend developer internship in 2 months?"
}
```

---

### 📈 Progress Tracking

**Mark a roadmap step complete/incomplete**
```
POST /api/progress/:roadmapId/step
Authorization: Bearer <token>
Content-Type: application/json

{
  "stepId": "<step _id from the roadmap.steps array>",
  "completed": true
}
```

**Add a weekly update note**
```
POST /api/progress/:roadmapId/weekly-update
Authorization: Bearer <token>
Content-Type: application/json

{
  "note": "Completed the HTML/CSS module and started JavaScript basics."
}
```

**Get progress for one roadmap**
```
GET /api/progress/:roadmapId
Authorization: Bearer <token>
```

**Get progress across all roadmaps**
```
GET /api/progress
Authorization: Bearer <token>
```

---

## 5. Folder Structure

```
backend/
├── config/db.js
├── controllers/          # request handlers
├── routes/                # route -> controller mapping
├── models/                 # Mongoose schemas
├── services/ai.service.js  # all Groq prompts + calls
├── middlewares/            # auth, error handling, async wrapper
├── utils/                  # token generation, ApiError class
├── app.js                  # express app + middleware + routes
├── server.js                # entry point
└── .env.example
```

## 6. Notes for Frontend Integration

- All AI endpoints (`/roadmap/generate`, `/skill-gap/analyze`) return **structured JSON only** — never raw text — so they can be mapped directly to UI components.
- All responses follow the shape: `{ success: boolean, message?: string, data: ... }` on success, and `{ success: false, message: string }` on error.
- The chat endpoint (`/chat/ask`) is stateless in Phase 1 — no conversation history is stored or sent. Each call is independent.

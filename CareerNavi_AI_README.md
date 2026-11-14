# CareerNavi AI 🎯

> **AI-powered career guidance platform for students** — helping them discover the right career path, identify skill gaps, generate personalised learning roadmaps, and track their progress — all driven by a real Groq LLM backend.

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Architecture](#2-architecture)
3. [Monorepo Structure](#3-monorepo-structure)
4. [Tech Stack](#4-tech-stack)
5. [Prerequisites](#5-prerequisites)
6. [Quick Start](#6-quick-start)
7. [Environment Variables](#7-environment-variables)
8. [Backend — Deep Dive](#8-backend--deep-dive)
9. [Frontend — Deep Dive](#9-frontend--deep-dive)
10. [API Reference](#10-api-reference)
11. [Pages & Routes](#11-pages--routes)
12. [Theme System](#12-theme-system)
13. [Development Notes](#13-development-notes)

---

## 1. Project Overview

CareerNavi AI is a full-stack web application that acts as a personal AI career mentor for students. It provides:

| Feature | Description |
|---|---|
| 🗺️ **AI Career Roadmap** | Generates a personalised, step-by-step learning roadmap for any career goal using a Groq LLM |
| 📊 **Skill Gap Analysis** | Compares a student's current skills against a target role and identifies what's missing |
| 💬 **AI Mentor Chat** | Stateless Q&A chatbot for career advice powered by Groq |
| 📈 **Progress Tracking** | Mark roadmap steps complete, add weekly update notes, and visualise progress with Recharts charts |
| 👤 **User Profiles** | Persistent profiles with degree, year, skills, interests, and career goal |

All AI responses are structured JSON returned directly from the Groq API via the Express backend — **no mock data, no hardcoded responses**.

---

## 2. Architecture

```
Browser (React + Vite)
        │
        │  HTTP + JWT
        ▼
Express.js API Server (Node.js)
        │            │
        │            ▼
        │     MongoDB / Mongoose
        │     (Users, Roadmaps, Progress)
        │
        ▼
Groq AI API  (llama-3.3-70b-versatile)
(Roadmap, Skill Gap, Chat)
```

**Data flow for AI features:**
`React UI → Axios (JWT) → Express Controller → ai.service.js → Groq API → structured JSON → React UI`

**Auth flow:**
`Register / Login → JWT issued → stored in localStorage → Axios interceptor attaches Bearer token → 401 auto-redirects to /login`

---

## 3. Monorepo Structure

```
CareerNavi-Docs/
├── CareerNavi-AI-Frontend/
│   └── frontend/                   ← React + Vite app
│       ├── public/
│       ├── src/
│       │   ├── api/                # axiosClient + per-resource service files
│       │   ├── components/
│       │   │   ├── layout/         # Sidebar, Topbar, MobileNav, DashboardLayout
│       │   │   ├── ui/             # Button, Card, Input, Skeleton, Badge, ThemeToggle...
│       │   │   ├── mentor/         # MentorFab (floating button), MentorChatWindow
│       │   │   ├── roadmap/        # RoadmapTimeline, StepCard
│       │   │   ├── skillgap/       # ReadinessGauge, SkillPills
│       │   │   └── charts/         # Recharts wrappers
│       │   ├── context/            # AuthContext, ThemeContext, ToastContext
│       │   ├── hooks/              # useAuth, useTheme, useToast
│       │   ├── pages/              # one file per route (11 pages)
│       │   ├── utils/              # formatters, validators
│       │   ├── App.jsx
│       │   ├── main.jsx
│       │   └── index.css           # CSS variable token system (3 themes)
│       ├── .env.example
│       ├── package.json
│       ├── vite.config.js
│       └── tailwind.config.js
│
└── careernavi-ai-backend/
    └── backend/                    ← Express.js API server
        ├── config/
        │   └── db.js               # MongoDB connection
        ├── controllers/            # request handlers (auth, user, roadmap, skillGap, chat, progress)
        ├── routes/                 # route → controller mapping (6 route files)
        ├── models/                 # Mongoose schemas (User, Roadmap, Progress)
        ├── services/
        │   └── ai.service.js       # all Groq prompts + API calls
        ├── middlewares/            # auth.middleware, error.middleware, asyncHandler
        ├── utils/                  # ApiError class, generateToken
        ├── app.js                  # Express app, middlewares, routes
        ├── server.js               # entry point
        └── .env.example
```

---

## 4. Tech Stack

### Backend

| Package | Version | Purpose |
|---|---|---|
| Node.js | v18+ | Runtime |
| Express.js | ^4.19 | HTTP framework |
| Mongoose | ^8.5 | MongoDB ODM |
| jsonwebtoken | ^9.0 | JWT auth |
| bcryptjs | ^2.4 | Password hashing |
| axios | ^1.7 | Groq API calls |
| helmet | ^7.1 | Security headers |
| cors | ^2.8 | Cross-origin policy |
| morgan | ^1.10 | HTTP request logging |
| nodemon | ^3.1 | Dev auto-restart |

**AI Provider:** [Groq](https://console.groq.com) — `llama-3.3-70b-versatile` model via the OpenAI-compatible `/chat/completions` endpoint.

### Frontend

| Package | Version | Purpose |
|---|---|---|
| React | ^18.3 | UI library |
| Vite | ^5.4 | Build tool & dev server |
| Tailwind CSS | ^3.4 | Utility-first styling |
| React Router | ^6.26 | Client-side routing |
| Axios | ^1.7 | HTTP client with JWT interceptor |
| Recharts | ^2.12 | Progress & analytics charts |
| Lucide React | ^0.436 | Icon library |

---

## 5. Prerequisites

- **Node.js** v18 or higher
- **MongoDB** — running locally (`mongodb://127.0.0.1:27017`) **or** a MongoDB Atlas connection string
- **Groq API key** — free at [https://console.groq.com](https://console.groq.com)
- **npm** (bundled with Node.js)

---

## 6. Quick Start

### Step 1 — Start the Backend

```bash
cd careernavi-ai-backend/backend

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Open .env and fill in MONGO_URI, JWT_SECRET, GROQ_API_KEY

# Start dev server (auto-restart on file changes)
npm run dev
```

Backend runs on **http://localhost:5000**

Health check: `GET http://localhost:5000/api/health`

---

### Step 2 — Start the Frontend

```bash
cd CareerNavi-AI-Frontend/frontend

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# VITE_API_URL is already set to http://localhost:5000/api

# Start dev server
npm run dev
```

Frontend runs on **http://localhost:5173**

> ⚠️ Always start the **backend first** — the frontend has no mock data and depends on live API calls.

---

### Other Frontend Scripts

```bash
npm run build     # Production build → dist/
npm run preview   # Preview production build locally
npm run lint      # ESLint check
```

---

## 7. Environment Variables

### Backend — `backend/.env`

| Variable | Description | Default / Example |
|---|---|---|
| `PORT` | Server port | `5000` |
| `NODE_ENV` | Environment | `development` |
| `MONGO_URI` | MongoDB connection string | `mongodb://127.0.0.1:27017/careernavi_ai` |
| `JWT_SECRET` | Long random string for signing JWTs | *(set a strong random value)* |
| `JWT_EXPIRES_IN` | Token lifetime | `7d` |
| `GROQ_API_KEY` | Your Groq API key | `gsk_xxxxxxxx` |
| `GROQ_MODEL` | Groq model identifier | `llama-3.3-70b-versatile` |
| `GROQ_API_URL` | Groq completions endpoint | `https://api.groq.com/openai/v1/chat/completions` |
| `CLIENT_URL` | Frontend origin (CORS) | `http://localhost:5173` |

### Frontend — `frontend/.env`

| Variable | Description | Default / Example |
|---|---|---|
| `VITE_API_URL` | Backend API base URL | `http://localhost:5000/api` |

> 🔒 The Groq API key is **never** exposed to the frontend. All AI calls go through the backend: `React → Express → Groq`.

---

## 8. Backend — Deep Dive

### Entry Point

- **`server.js`** — connects to MongoDB, then starts the Express app.
- **`app.js`** — registers global middleware (helmet, CORS, JSON parser, morgan) and mounts all route prefixes.

### MongoDB Models

| Model | File | Key Fields |
|---|---|---|
| `User` | `models/User.model.js` | name, email, password (hashed), degree, year, skills[], interests[], careerGoal |
| `Roadmap` | `models/Roadmap.model.js` | userId, careerGoal, steps[] (each step has title, description, resources, duration) |
| `Progress` | `models/Progress.model.js` | userId, roadmapId, completedSteps[], weeklyUpdates[] |

### Controllers

| File | Responsibilities |
|---|---|
| `auth.controller.js` | Register, login — returns JWT on success |
| `user.controller.js` | Get/update authenticated user profile |
| `roadmap.controller.js` | Generate roadmap via AI, list all, get by ID |
| `skillGap.controller.js` | Analyse skill gap for a target role |
| `chat.controller.js` | Stateless AI mentor Q&A |
| `progress.controller.js` | Mark steps complete, add weekly notes, get progress per roadmap or all |

### Middlewares

| File | Purpose |
|---|---|
| `auth.middleware.js` | Verifies JWT from `Authorization: Bearer <token>` header |
| `error.middleware.js` | Global 404 handler + structured error response formatter |
| `asyncHandler.js` | Wraps async route handlers to catch rejections automatically |

### AI Service (`services/ai.service.js`)

Single service file containing all Groq API interactions:
- **`generateRoadmap(profile)`** — produces a structured JSON roadmap array of steps
- **`analyzeSkillGap(profile, targetRole)`** — returns missing skills, readiness score, and recommendations
- **`askMentor(question, profile)`** — answers a career question in the context of the user's profile

All prompts instruct the model to return **structured JSON only**, enabling direct mapping to UI components.

### Unified Response Shape

```json
// Success
{ "success": true, "message": "...", "data": { ... } }

// Error
{ "success": false, "message": "Human-readable error description" }
```

---

## 9. Frontend — Deep Dive

### API Layer (`src/api/`)

| File | Purpose |
|---|---|
| `axiosClient.js` | Centralized Axios instance — attaches JWT header, handles 401 auto-logout |
| `auth.service.js` | Register, login |
| `user.service.js` | Get/update profile |
| `roadmap.service.js` | Generate roadmap, list, get by ID |
| `skillGap.service.js` | Skill gap analysis |
| `chat.service.js` | AI mentor chat |
| `progress.service.js` | Progress CRUD |

### Context & Hooks

| Context | Hook | Stored In |
|---|---|---|
| `AuthContext` | `useAuth` | JWT + user object in `localStorage` |
| `ThemeContext` | `useTheme` | Theme key in `localStorage` (`careernavi-theme`) |
| `ToastContext` | `useToast` | In-memory (ephemeral notifications) |

### Component Tree

```
App.jsx (Router + Contexts)
├── Public routes: LandingPage, LoginPage, RegisterPage, NotFoundPage
└── Protected routes (DashboardLayout)
    ├── Sidebar / Topbar / MobileNav
    ├── DashboardPage
    ├── OnboardingPage
    ├── RoadmapPage          → RoadmapTimeline, StepCard
    ├── SkillGapPage         → ReadinessGauge, SkillPills
    ├── MentorPage           → MentorChatWindow
    ├── ProgressPage         → Recharts wrappers
    └── ProfilePage
    
    + MentorFab (floating AI chat button on all protected pages except /mentor)
```

### Route Guard

`ProtectedRoute.jsx` wraps all authenticated routes — redirects to `/login` if no valid token is present.

---

## 10. API Reference

All private routes require the header:
```
Authorization: Bearer <token>
```

### 🔐 Auth

```http
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

```http
POST /api/auth/login
Content-Type: application/json

{ "email": "riya@example.com", "password": "password123" }
```
Response includes `data.token` — use in the `Authorization` header for all subsequent calls.

---

### 👤 User Profile

```http
GET  /api/users/profile              # Get profile
PUT  /api/users/profile              # Update profile (skills, careerGoal, etc.)
```

---

### 🗺️ AI Career Roadmap

```http
POST /api/roadmap/generate           # Generate roadmap (AI)
GET  /api/roadmap                    # Get all user roadmaps
GET  /api/roadmap/:id                # Get specific roadmap
```

---

### 📊 Skill Gap Analysis

```http
POST /api/skill-gap/analyze
{ "targetRole": "Data Analyst", "skills": ["Excel", "SQL"] }
# skills is optional — defaults to profile skills if omitted
```

---

### 💬 AI Mentor Chat

```http
POST /api/chat/ask
{ "question": "How do I prepare for a frontend developer internship in 2 months?" }
```
*Stateless — no conversation history is stored.*

---

### 📈 Progress Tracking

```http
POST /api/progress/:roadmapId/step          # Mark a step complete/incomplete
POST /api/progress/:roadmapId/weekly-update # Add a weekly note
GET  /api/progress/:roadmapId               # Progress for one roadmap
GET  /api/progress                          # Progress across all roadmaps
```

---

## 11. Pages & Routes

| Route | Page | Access | Description |
|---|---|---|---|
| `/` | Landing | Public | Hero + feature overview |
| `/login` | Login | Public | JWT login form |
| `/register` | Register | Public | Account creation |
| `/onboarding` | Onboarding | Protected | Set degree, skills, interests, goal |
| `/dashboard` | Dashboard | Protected | Personalised overview |
| `/roadmap` | Roadmap | Protected | AI roadmap + step completion |
| `/skill-gap` | Skill Gap | Protected | Skill gap analysis |
| `/mentor` | Mentor | Protected | Full AI chat interface |
| `/progress` | Progress | Protected | Charts & weekly updates |
| `/profile` | Profile | Protected | View & edit profile + theme toggle |
| `*` | 404 | Public | Not found page |

A **floating AI mentor button (MentorFab)** is available on every protected page except `/mentor`, providing quick access to the chat overlay without leaving the current page.

---

## 12. Theme System

Three themes — **Light**, **Dark**, and **Fun** — implemented as a CSS-variable token system in `src/index.css`.

- Switched via the `data-theme` attribute on `<html>` — **no duplicated component styles**.
- Managed by `ThemeContext` + `useTheme` hook.
- Persisted in `localStorage` under the key `careernavi-theme`.
- First-time visitors get a theme based on OS `prefers-color-scheme`; explicit choices persist forever.
- Toggle available on the Profile page and in the top bar / auth pages.

---

## 13. Development Notes

- **No mock data anywhere** — the frontend renders exactly what the backend returns. If the backend is offline, all protected pages show appropriate error/empty states.
- **Centralised error handling** — Axios interceptor normalises all API errors into a friendly `message` string; raw network errors are never shown to the user.
- **Structured AI output** — all AI endpoints (`/roadmap/generate`, `/skill-gap/analyze`, `/chat/ask`) return structured JSON so responses can be mapped directly to React components with no further parsing.
- **Security** — CORS is locked to `CLIENT_URL`, helmet adds security headers, bcryptjs hashes passwords, and JWTs are signed with a configurable secret and expiry.
- **Production build** — `npm run build` in the frontend produces a compiled `dist/` with zero compile errors.

---

*Built with ❤️ as CareerNavi AI — Phase 1*

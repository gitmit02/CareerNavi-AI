# CareerNavi AI — Frontend

React + Vite frontend for CareerNavi AI, the AI-powered career mentor platform for students. Connects directly to the CareerNavi AI Express/MongoDB/Groq backend — no mock data, no hardcoded AI responses.

---

## 1. Tech Stack

- React 18 + Vite
- Tailwind CSS (custom 3-theme design token system)
- React Router v6
- Axios (centralized API client with JWT interceptor)
- Recharts (progress & analytics charts)
- Lucide React (icons)

---

## 2. Installation

```bash
cd frontend
npm install
```

## 3. Environment Variables

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

| Variable | Description | Example |
|---|---|---|
| `VITE_API_URL` | Base URL of the CareerNavi AI backend API | `http://localhost:5000/api` |

> The Groq API key is never used or exposed here — all AI calls go through the backend (`React → Express → Groq`).

## 4. Running the Frontend

```bash
npm run dev
```

Runs on `http://localhost:5173` by default. Make sure the backend (from the `backend/` project) is running first — typically on `http://localhost:5000`.

```bash
npm run build     # production build → dist/
npm run preview   # preview the production build locally
```

## 5. Connecting to the Backend

1. Start the CareerNavi AI backend (`npm run dev` inside `backend/`) with a valid `GROQ_API_KEY` set.
2. Set `VITE_API_URL` in `.env` to point at that backend's `/api` path.
3. Register a new account from the frontend — this calls `POST /api/auth/register`, stores the returned JWT in `localStorage`, and every subsequent request automatically attaches `Authorization: Bearer <token>` via the Axios interceptor in `src/api/axiosClient.js`.
4. A 401 response from any endpoint (expired/invalid token) automatically clears the session and redirects to `/login`.

## 6. Available Pages

| Route | Page | Access |
|---|---|---|
| `/` | Landing page | Public |
| `/login` | Login | Public |
| `/register` | Register | Public |
| `/onboarding` | Profile setup (degree, skills, interests, goal) | Protected |
| `/dashboard` | Personalized dashboard | Protected |
| `/roadmap` | AI career roadmap + step tracking | Protected |
| `/skill-gap` | Skill gap analysis | Protected |
| `/mentor` | Full AI mentor chat | Protected |
| `/progress` | Progress tracking & analytics (Recharts) | Protected |
| `/profile` | View/edit profile | Protected |
| `*` | 404 page | Public |

A floating AI mentor button is available on every protected page (except `/mentor` itself, to avoid a duplicate chat UI).

## 7. Theme System

Three themes — **Light**, **Dark**, and **Fun** — implemented as a single CSS-variable token system in `src/index.css`, switched via `data-theme` on `<html>`. No duplicated component code or separate stylesheets per theme.

- Managed by `ThemeContext` (`src/context/ThemeContext.jsx`) and the `useTheme` hook.
- Persisted in `localStorage` under the key `careernavi-theme`.
- First-time visitors get a theme based on their OS preference (`prefers-color-scheme`), afterward their explicit choice always wins.
- Toggle it from the Profile page (`/profile`) or the compact toggle in the top bar / auth pages.

## 8. Project Structure

```
frontend/
├── public/
├── src/
│   ├── api/            # axiosClient + one service file per backend resource
│   ├── components/
│   │   ├── layout/       # Sidebar, Topbar, MobileNav, DashboardLayout
│   │   ├── ui/            # Button, Card, Input, Skeleton, EmptyState, Badge, ThemeToggle...
│   │   ├── mentor/         # MentorFab, MentorChatWindow
│   │   ├── roadmap/         # RoadmapTimeline, StepCard
│   │   ├── skillgap/         # ReadinessGauge, SkillPills
│   │   └── charts/             # Recharts wrappers
│   ├── context/                 # AuthContext, ThemeContext, ToastContext
│   ├── hooks/                    # useAuth, useTheme, useToast
│   ├── pages/                     # one file per route
│   ├── utils/                      # formatters, validators
│   ├── App.jsx / main.jsx / index.css
├── .env.example
├── package.json
├── vite.config.js
└── tailwind.config.js
```

## 9. Notes

- All AI-facing data (roadmap, skill gap, mentor answers) is rendered exactly as returned by the backend — nothing is invented or mocked on the frontend.
- Analytics charts on `/progress` are built only from real data returned by `GET /api/progress`; if a user has no tracked progress yet, the page shows an empty state instead of a fabricated chart.
- Errors from the backend are caught centrally in the Axios interceptor and normalized into a friendly `message` — raw Axios/network errors are never shown to the user.
- Verified with a production build (`npm run build`) with no compile errors before packaging.

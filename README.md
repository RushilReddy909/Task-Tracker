# Task Tracker

A full-stack Task Management System built with the MERN stack (MongoDB, Express, React, Node.js) — JWT authentication, task CRUD with filtering/search/sort/pagination, an analytics dashboard, dark mode, and a responsive UI.

## Features

- **Auth** — signup/login with JWT, passwords hashed with bcrypt, protected routes on both the API and the frontend.
- **Tasks** — create, edit, complete, and delete tasks with title, description, status (`todo` / `in-progress` / `done`), priority (`low` / `medium` / `high`), and due date.
- **Filtering & search** — filter by status and priority, search by title (debounced so typing doesn't fire a request per keystroke).
- **Sorting** — by due date, priority, or creation date, ascending or descending. Priority sorts by actual severity (low → medium → high), not alphabetically.
- **Pagination** — 12 tasks per page, laid out in a responsive grid.
- **Analytics** — a dedicated `/analytics` page with stat cards (total, completed, pending, completion %) and a status breakdown donut chart.
- **UI/UX** — loading skeletons (including during filter changes, not just first load), error states, responsive layout, dark mode with a persisted theme toggle.
- **Backend correctness** — global error handling middleware, per-user data isolation on every query, MongoDB indexes on the fields the UI actually filters/sorts by.

## Tech stack

**Backend:** Node.js, Express, MongoDB with Mongoose, JWT (`jsonwebtoken`), `bcryptjs`, `express-validator`, `express-async-errors`.

**Frontend:** React 19 (Vite), React Router, TanStack Query, Zustand, React Hook Form + Zod, Axios, shadcn/ui (Radix UI + Tailwind CSS v4), Recharts (via shadcn's chart component), `next-themes`, `sonner`.

## Project structure

```
Task-Tracker/
├── backend/           Express API (ESM, "type": "module")
│   └── src/
│       ├── config/db.js
│       ├── models/          User, Task (Mongoose schemas + indexes)
│       ├── controllers/     authController, taskController
│       ├── middleware/      authMiddleware, errorMiddleware, validators
│       └── routes/          authRoutes, taskRoutes
├── frontend/           React app (Vite)
│   └── src/
│       ├── api/              axios instance + interceptors
│       ├── components/       layout/, tasks/, ui/ (shadcn)
│       ├── hooks/             useTasks.js (TanStack Query hooks)
│       ├── pages/             LoginPage, SignupPage, DashboardPage, AnalyticsPage
│       ├── schemas/           Zod schemas (auth, tasks)
│       └── store/             authStore (Zustand)
└── package.json        Root scripts that orchestrate both apps
```

## Setup

Requires Node.js 18+ and a MongoDB connection (local or Atlas).

```bash
# from the repo root — installs root, backend, and frontend dependencies
npm run install:all
```

### Backend environment

```bash
cd backend
cp .env.example .env
```

Fill in `backend/.env`:

| Variable         | Required | Default                          | Notes                                             |
|------------------|----------|-----------------------------------|----------------------------------------------------|
| `PORT`           | no       | `5000`                            |                                                    |
| `MONGO_URI`      | yes      | —                                  | Local or Atlas connection string                  |
| `JWT_SECRET`     | yes      | —                                  | Long random string, e.g. `openssl rand -base64 48`|
| `JWT_EXPIRES_IN` | no       | `7d`                               |                                                    |
| `CLIENT_ORIGIN`  | no       | `http://localhost:5173`           | Comma-separated for multiple allowed origins       |

### Frontend environment

Create `frontend/.env`:

```bash
VITE_API_URL=/api
```

The Vite dev server proxies `/api` to `http://localhost:5000` (see `frontend/vite.config.js`), so the frontend never needs to know the backend's real host in development.

### Run

```bash
# from the repo root — runs backend (nodemon) and frontend (Vite) together
npm run dev
```

Backend: `http://localhost:5000` (health check at `GET /health`). Frontend: `http://localhost:5173`.

### Root scripts

| Script              | What it does                                                        |
|----------------------|----------------------------------------------------------------------|
| `npm run install:all` | Installs dependencies in the root, `backend/`, and `frontend/`      |
| `npm run dev`         | Runs backend and frontend dev servers concurrently, labeled output  |
| `npm run build`       | Builds the frontend (`frontend/dist`) — this is what the backend serves in production |
| `npm start`           | Runs the backend in production mode, serving the built frontend from `frontend/dist` |

### Production mode

In dev, the frontend and backend run as two separate servers (Vite on 5173, Express on 5000), connected via Vite's `/api` proxy. In production there's just one server: after `npm run build` produces `frontend/dist`, `npm start` boots the backend with `NODE_ENV=production`, and Express serves the built frontend directly — static assets via `express.static`, plus a catch-all that returns `index.html` for any non-`/api` route so client-side routes (like `/analytics`) still work on a hard refresh or direct link. `/api/*` routes are unaffected either way.

```bash
npm run build   # builds frontend/dist
npm start       # serves the API and the built frontend together on PORT (default 5000)
```

## API reference

All responses are JSON. Errors follow `{ message, errors? }` with an appropriate HTTP status code, handled by a global error middleware.

### Auth — `/api/auth`

| Method | Path      | Auth | Body                     |
|--------|-----------|------|---------------------------|
| POST   | `/signup` | no   | `{ email, password }`     |
| POST   | `/login`  | no   | `{ email, password }`     |
| GET    | `/me`     | yes  | —                          |

Signup/login responses include `{ user, token }`. Send the token as `Authorization: Bearer <token>` on every `/api/tasks` request.

### Tasks — `/api/tasks` (all routes require the Bearer token)

| Method | Path             | Notes                                                                                                   |
|--------|-------------------|-----------------------------------------------------------------------------------------------------------|
| GET    | `/`               | Query params: `status`, `priority`, `search`, `page`, `limit` (max 100), `sortBy` (`dueDate` \| `priority` \| `createdAt`), `order` (`asc` \| `desc`). Returns `{ tasks, total, page, pages }`. |
| GET    | `/analytics`      | Returns `{ total, completed, pending, inProgress, todo, completionPercent }`                              |
| GET    | `/:id`            | Single task                                                                                                |
| POST   | `/`               | `{ title, description?, status?, priority?, dueDate? }`                                                   |
| PUT    | `/:id`            | Same fields as create, all optional                                                                       |
| PATCH  | `/:id/complete`   | Shortcut to set `status = "done"`                                                                          |
| DELETE | `/:id`            | —                                                                                                           |

Every task query is scoped to the authenticated user (`req.user._id`), so a user can only ever see or modify their own tasks.

**Sorting by priority** ranks by actual severity (`low` = 1, `medium` = 2, `high` = 3) via an aggregation pipeline, rather than a plain string sort — priority is stored as a string enum, and Mongo's default string comparison is alphabetical (`high` < `low` < `medium`), which would otherwise produce a scrambled order.

### Postman collection

A ready-to-run Postman collection ("Task Tracker API") covers every route above, with the JWT auto-captured into a collection variable on signup/login and the created task's ID auto-captured for the update/complete/delete requests — no manual copy-pasting needed to try the API end to end.

## Data model

**User** — `email` (unique), `password` (bcrypt-hashed, never returned in responses).

**Task** — `title`, `description`, `status` (enum), `priority` (enum), `dueDate`, `user` (ref), timestamps.

**Indexes** — `{ user: 1 }`, `{ user: 1, status: 1 }`, `{ user: 1, priority: 1 }`, `{ user: 1, dueDate: 1 }`. Every list/filter/analytics query is scoped by `user`, so that's the primary index; the compound indexes speed up the specific filter/sort combinations the UI exposes.

## Notes

- Passwords are hashed with bcrypt via a Mongoose `pre('save')` hook, and never included in any API response (`select: false` plus a `toJSON` transform).
- The frontend keeps the previous page of results visible during pagination (`keepPreviousData`) but explicitly shows a loading skeleton during filter/search changes, so stale results are never mistaken for fresh ones.
- Search input is debounced 400ms so typing doesn't trigger a request per keystroke.

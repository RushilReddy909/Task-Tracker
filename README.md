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

## Design decisions

Notes on why the stack is put together this way, not just what's in it.

### Frontend

**TanStack Query instead of manual `useEffect` + `useState` fetching, for every server request — including auth.** All task CRUD, analytics, and even login/signup go through `useQuery`/`useMutation` (see `hooks/useTasks.js`, `hooks/useAuth.js`). This buys caching, request de-duplication, and — critically for this app — key-based invalidation: every task mutation invalidates `['tasks']` (catching every cached filter/sort/page combination at once) and `['tasks', 'analytics']` in one call, so the analytics page and task list always stay in sync with each other without any manual "also refetch X" bookkeeping. Login/signup originally bypassed this with a hand-rolled `try/catch` and local `isSubmitting` state; that was inconsistent with every other mutation in the app and got folded into the same pattern for the same reason — one way to handle server state, not two.

**Axios instead of the native `fetch` API.** Two things `fetch` doesn't give you out of the box that this app relies on directly: interceptors and automatic JSON handling. The request interceptor (`api/axiosInstance.js`) attaches the JWT to every outgoing request by reading fresh from the Zustand store each time, so a login/logout mid-session is picked up immediately without threading the token through every call site. The response interceptor clears auth state on any `401`, so an expired/invalid token fails safely everywhere at once instead of needing that check repeated in every hook. `fetch` requires more boilerplate (manual `res.json()`, manual header wiring per call, no built-in interceptor concept) to reach the same behavior.

**React Hook Form + Zod instead of `useState` per field with hand-rolled validation.** Login, signup, and the task form all follow the same `useForm` + `Controller` + `zodResolver` pattern. The alternative — a `useState` per field, a validation function run on submit, manually wiring error messages to each input — is what this replaces; RHF keeps re-renders scoped to the field that actually changed (uncontrolled inputs under the hood) instead of re-rendering the whole form on every keystroke, and Zod schemas double as a single source of truth for validation rules that's easy to keep in sync with the backend's `express-validator` rules, since both describe the same shape.

**Zustand for auth state, TanStack Query for everything else — deliberately not one global store for all state.** `authStore.js` holds only the JWT and user object, persisted to `localStorage` so a page refresh doesn't log the user out. Tasks, analytics, and even the validated "is this token still good" check live in TanStack Query instead, because that data is genuinely server state (it can go stale, needs refetching, needs cache invalidation) — modeling it as client state in a store would mean reimplementing caching/invalidation by hand. Two tools, used for what each is actually good at, rather than one tool stretched to cover both.

**Lazy-loaded routes (`React.lazy` + `Suspense`) instead of one eagerly-loaded bundle.** Every page in `App.jsx` is a dynamic import. This was added specifically because Recharts — the single heaviest dependency in the app — was previously bundled into the initial load for every visitor, including ones who never open `/analytics`. Splitting per route means that chunk (and Recharts with it) only downloads when someone actually visits the analytics page; login/dashboard visitors never pay for it.

**Debounced search (400ms) instead of firing a request per keystroke.** The search input keeps its own local state for instant visual feedback while typing, but only calls the filter-changing callback (and therefore fires the API request) after the user pauses — otherwise a five-character search term means five separate requests, four of which are immediately superseded by the next one.

**`keepPreviousData` for pagination, but not for filter changes.** Changing pages keeps the previous page's results on screen while the next page loads, avoiding a flash of empty state on every click. But because that same mechanism also suppresses `isLoading` on filter/search/sort changes (the query key changes, yet old data stays mounted as a placeholder), the dashboard explicitly also checks `isFetching` and shows a loading skeleton during those changes — otherwise a filter change would silently show stale results with no indication a new request was in flight.

### Backend

**Mongoose schema hooks/methods instead of hashing and comparison logic in the controller.** Password hashing lives in a `pre('save')` hook on `User` (`models/User.js`), and password comparison is a schema method (`comparePassword`), rather than either being inlined in `authController.js`. This means it's structurally impossible to create or update a user document — from any code path, now or added later — without the password getting hashed, since the hook runs at the model layer regardless of which controller triggered the save. Putting that logic in the controller instead would mean every future write path (a password-reset endpoint, an admin script, whatever) has to remember to re-implement or call the same hashing logic; a model hook can't be forgotten because there's nothing to remember to call.

**A `toJSON` transform on `User` instead of manually deleting `password` in every response.** Combined with `select: false` on the schema field (so `password` isn't even fetched unless explicitly requested with `.select('+password')`, as `login` does), this makes leaking a password hash in an API response a non-issue by construction rather than something every controller has to remember to strip.

**JWT signing inlined in the auth controllers, not behind a `generateToken()` utility.** An earlier version factored this into a shared helper; it was collapsed back into `signup`/`login` directly (with a comment explaining the payload/expiry) because the indirection wasn't earning its keep — two call sites, both doing the exact same three-line `jwt.sign(...)`, don't need a shared abstraction to stay in sync.

**Ownership scoping baked into every query's filter object, not checked after the fact.** Every task read/write builds its Mongo filter as `{ ..., user: req.user._id }` from the start (see `taskController.js`), rather than fetching a task by ID and then separately checking `task.user === req.user._id`. This means a user requesting another user's task ID gets an honest 404 ("doesn't exist," from their perspective) instead of a 403 that would confirm the ID belongs to *someone* — and there's no separate authorization check to accidentally omit on a new route, since the scoping is part of how the document is found in the first place.

**An aggregation pipeline for priority sorting, not a plain `.sort()`.** `priority` is stored as a string enum (`low`/`medium`/`high`), and Mongo's default string sort is alphabetical — `high` sorts before `low` sorts before `medium`, which reads as scrambled to a user expecting severity order. `getTasks` only switches to the aggregation pipeline (mapping each value to a numeric rank via `$switch`, then sorting by that) when `sortBy === 'priority'` specifically; `createdAt`/`dueDate` stay on the simpler `find().sort()` path since those are already correctly orderable as real Date values.

**Compound indexes shaped around the UI's actual filter/sort combinations, not indexed generically.** Every list/filter/analytics query is scoped by `user`, so `{ user: 1 }` is the foundational index; `{ user: 1, status: 1 }`, `{ user: 1, priority: 1 }`, and `{ user: 1, dueDate: 1 }` exist because those are the specific filter and sort fields the dashboard actually exposes — not a blanket index on every field, which would cost write performance without a matching query pattern to justify it.

**A global error middleware plus `express-async-errors`, instead of `try/catch` in every controller.** Controllers can `throw` or let a rejected promise propagate, and it reaches `errorMiddleware.js` regardless — `express-async-errors` patches Express's routing so async handler rejections are caught automatically (Express 4 doesn't do this natively), removing the need for a repetitive `try { ... } catch (err) { next(err) }` wrapper around every single route handler.

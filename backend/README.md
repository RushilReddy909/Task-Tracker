# Task Tracker — API

Node.js + Express + MongoDB (Mongoose) backend for the Task Tracker app. JWT-based auth, task CRUD, filtering/search/pagination/sort, and an analytics endpoint.

## Setup

```bash
npm install
cp .env.example .env   # then fill in MONGO_URI and JWT_SECRET
npm run dev            # nodemon, auto-reloads
# or
npm start
```

Server boots on `PORT` (default 5000). Health check: `GET /health`.

## Environment variables

See `.env.example`. Required: `MONGO_URI`, `JWT_SECRET`. Optional: `PORT` (default 5000), `JWT_EXPIRES_IN` (default 7d), `CLIENT_ORIGIN` (default `http://localhost:5173`, comma-separated for multiple).

## API

### Auth — `/api/auth`

| Method | Path      | Auth | Body                       |
|--------|-----------|------|----------------------------|
| POST   | /signup   | no   | `{ email, password }`      |
| POST   | /login    | no   | `{ email, password }`      |
| GET    | /me       | yes  | —                          |

Responses include `{ user, token }` on signup/login. Send the token as `Authorization: Bearer <token>` on all `/api/tasks` requests.

### Tasks — `/api/tasks` (all routes require the Bearer token)

| Method | Path              | Notes                                                                 |
|--------|-------------------|------------------------------------------------------------------------|
| GET    | /                 | Query params: `status`, `priority`, `search`, `page`, `limit`, `sortBy` (`dueDate`\|`priority`\|`createdAt`), `order` (`asc`\|`desc`) |
| GET    | /analytics        | `{ total, completed, pending, inProgress, todo, completionPercent }`  |
| GET    | /:id              | Single task                                                            |
| POST   | /                 | `{ title, description?, status?, priority?, dueDate? }`               |
| PUT    | /:id              | Same body fields, all optional                                        |
| PATCH  | /:id/complete     | Shortcut to set status = done                                          |
| DELETE | /:id              | —                                                                       |

All task queries are scoped to the authenticated user (`req.user._id`), so users can only ever see/modify their own tasks.

## Indexing notes

`Task` has indexes on `user`, `{user, status}`, `{user, priority}`, `{user, dueDate}`, and a text index on `{user, title}` for search — every list/filter/analytics query is scoped by `user`, so that's the primary index, with the compound ones speeding up the filter/sort combinations the UI exposes.

## Error handling

Errors thrown anywhere in an async controller (via `ApiError` or otherwise) are caught by `express-async-errors` and normalized by the global error middleware (`src/middleware/errorMiddleware.js`) into `{ message, errors? }` JSON with an appropriate status code. Mongoose validation errors, cast errors, and duplicate-key errors are all mapped automatically.

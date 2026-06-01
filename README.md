# Educonnect API

Minimal REST API for an educational platform (authentication, authorization, courses, profile).

## Requirements
- Node 18+ (or compatible)
- MySQL server

## Quick start

1. Install dependencies

```bash
npm install
```

2. Copy environment variables

Create `src/.env` (the project loads `src/.env`) and set the following values:

- `PORT` (optional)
- `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`
- `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`
- `JWT_ACCESS_EXPIRES_IN`, `JWT_REFRESH_EXPIRES_IN`

3. Run migrations (use your preferred MySQL client to run SQL in `db/migrations/`).

4. Development

```bash
npm run dev
```

5. Build / Start

```bash
npm run build
npm start
```

## Useful endpoints

- POST `/api/v1/auth/register` — register a user (defaults to role `student`).
- POST `/api/v1/auth/login` — login and returns access + refresh tokens (refresh token is also set as an HttpOnly cookie).
- POST `/api/v1/auth/refresh` — exchange refresh token for access token.
- GET `/api/v1/profile` — protected; requires `Authorization: Bearer <accessToken>`.
- POST `/api/v1/courses` — protected; requires role `instructor` or `admin`.

## Postman / Testing notes

1. Register a test user via `POST /api/v1/auth/register`.
2. Login using `POST /api/v1/auth/login` and copy the `accessToken` from the response body.
3. For protected routes, add header:

```
Authorization: Bearer <accessToken>
```

If you need to test instructor/admin-only routes, either:

- Promote the user in the database (update `users.role` to `instructor` or `admin`) then login again to get a token with the new role; or
- Create a seed/admin user directly in the DB for testing.

## Notes
- The project loads environment variables from `src/.env` for easier local development.
- Keep `JWT_REFRESH_SECRET` and `JWT_ACCESS_SECRET` secure in production.

If you want, I can add a `.env.example` file with the required keys or add a simple migration/seed script to create an instructor user for testing.

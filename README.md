# Educonnect API

Backend API for an educational platform built with Fastify, TypeScript, and MySQL. The current app covers authentication, profiles, courses, and enrollment with JWT-based access control.

## What is in this project

- `src/server.ts` starts the app after checking the database connection.
- `src/app.ts` builds the Fastify instance and registers plugins and routes.
- `src/plugins/` contains database, cookie, JWT, auth, and error-handler plugins.
- `src/modules/auth/` handles register, login, refresh, logout, and token generation.
- `src/modules/profile/` handles `GET /api/v1/profile` and `PATCH /api/v1/profile`.
- `src/modules/courses/` handles course create, list, read, update, delete, and ownership checks.
- `src/modules/enrollment/` handles course enrollment.
- `src/modules/health/` exposes health, JWT test, `/api/v1/me`, and admin test routes.
- `src/db/migrations/001_initial_schema.sql` contains the current MySQL schema.
- `src/modules/lessons/` already exists in the source tree, but it is not registered in `buildApp()` yet.

## Requirements

- Node.js 18+
- MySQL server

## Setup

1. Install dependencies.

```bash
npm install
```

2. Create `src/.env`.

The app loads environment variables from `src/.env`.

```env
PORT=3000
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=educonnect

JWT_ACCESS_SECRET=your_access_secret
JWT_REFRESH_SECRET=your_refresh_secret
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
```

3. Run the SQL in `src/db/migrations/001_initial_schema.sql` against your MySQL database.

4. Start development mode.

```bash
npm run dev
```

5. Build and run production output.

```bash
npm run build
npm start
```

## Available scripts

- `npm run dev` starts `tsx watch src/server.ts`.
- `npm run build` compiles the TypeScript project.
- `npm start` runs the built server.

## Main endpoints

### Health and test

- `GET /health` checks the database.
- `GET /jwt-test` creates a sample JWT.
- `GET /api/v1/me` returns the authenticated user payload.
- `POST /api/v1/admin-test` requires an `admin` role.

### Auth

- `POST /api/v1/auth/register` creates a new user with the default `student` role.
- `POST /api/v1/auth/login` returns access and refresh tokens, and also stores the refresh token in an HttpOnly cookie.
- `POST /api/v1/auth/refresh` exchanges the refresh token cookie for a new access token.
- `POST /api/v1/auth/logout` removes the stored refresh token.

### Profile

- `GET /api/v1/profile` returns the current user's profile.
- `PATCH /api/v1/profile` updates the current user's name.

### Courses

- `POST /api/v1/courses` creates a course for `instructor` or `admin` users.
- `GET /api/v1/courses` lists courses with pagination and filters.
- `GET /api/v1/courses/:id` returns a single course.
- `PATCH /api/v1/courses/:id` updates a course after ownership checks.
- `DELETE /api/v1/courses/:id` deletes a course after ownership checks.

### Enrollment

- `POST /api/v1/courses/:id/enroll` enrolls the authenticated user in a course.

## Database schema

The migration currently creates these tables:

- `users`
- `courses`
- `lessons`
- `enrollments`
- `refresh_tokens`

## Notes

- Protected routes expect `Authorization: Bearer <accessToken>` unless the route uses the refresh token cookie.
- Refresh tokens are stored in the database and also sent as an HttpOnly cookie on login.
- If you want to test instructor or admin routes quickly, update the user role in the database and log in again.

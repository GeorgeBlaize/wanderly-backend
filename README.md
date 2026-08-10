# Wanderly — Backend

Express + PostgreSQL (Prisma) API for [Wanderly](https://github.com/GeorgeBlaize/wanderly-frontend),
a full-stack travel booking platform.

## Tech Stack

- **Express 5**
- **PostgreSQL** via **Prisma ORM**
- **JWT** auth (httpOnly cookie + bearer fallback) with **bcrypt** password hashing
- **Passport Google OAuth 2.0** for social login
- **Zod** request validation on every mutating route
- Centralized error handling with consistent JSON error responses

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```
2. Copy the env example and fill in a real Postgres connection string:
   ```bash
   cp .env.example .env
   ```
   ```
   DATABASE_URL="postgresql://user:password@host:5432/wanderly?sslmode=require"
   JWT_SECRET="a-long-random-string"
   CLIENT_URL=http://localhost:3000
   SERVER_URL=http://localhost:5000
   ```
   A free Postgres instance from [Neon](https://neon.tech) or
   [Supabase](https://supabase.com) works well for both local dev and production.
3. Run migrations and seed realistic demo data (categories, tours, blog posts,
   demo accounts):
   ```bash
   npx prisma migrate dev --name init
   npm run seed
   ```
4. Start the server:
   ```bash
   npm run dev
   ```
   API runs at [http://localhost:5000](http://localhost:5000).

## Demo Credentials (seeded)

| Role    | Email                 | Password     |
| ------- | ---------------------- | ------------ |
| Admin   | admin@wanderly.com     | Password123! |
| Manager | manager@wanderly.com   | Password123! |
| User    | user@wanderly.com      | Password123! |

## Google OAuth (optional)

Social login is fully wired but inactive until you supply your own OAuth
credentials. Create a Google Cloud OAuth client at
[console.cloud.google.com/apis/credentials](https://console.cloud.google.com/apis/credentials)
with an authorized redirect URI of `{SERVER_URL}/api/auth/google/callback`, then
set `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` in `.env`.

## Project Structure

```
index.js              App entry point
config/                Prisma client, Passport strategy
routes/                Route definitions per resource
controllers/            Request handlers
middleware/             Auth (JWT), RBAC, validation, centralized error handler
validators/              Zod schemas
prisma/
  schema.prisma          Data model (User, Tour, Category, Booking, Review, BlogPost, ...)
  seed.js                 Realistic seed data — categories, tours, blog posts, demo users
```

## API Overview

| Resource   | Base route            | Notes                                    |
| ---------- | ---------------------- | ----------------------------------------- |
| Auth       | `/api/auth`            | register, login, logout, me, Google OAuth |
| Tours      | `/api/tours`            | public list/detail/search + admin CRUD    |
| Categories | `/api/categories`       | public list + admin CRUD                  |
| Bookings   | `/api/bookings`         | create/cancel (user), manage (admin)      |
| Reviews    | tours/:id/reviews       | create (booked users only), delete        |
| Blog       | `/api/blog`             | public list/detail + admin CRUD           |
| Contact    | `/api/contact`          | contact form + newsletter signup          |
| Users      | `/api/users`            | profile update + admin user management    |
| Admin      | `/api/admin/analytics`  | dashboard aggregates for charts           |

All admin/manager routes are protected by role-based middleware
(`middleware/role.middleware.js`); passwords are hashed with bcrypt; every
mutating route validates its body with Zod before touching the database.

## Scripts

- `npm run dev` — start with nodemon
- `npm start` — production start
- `npm run seed` — reseed demo data
- `npm run prisma:studio` — browse the database

## Deployment (Render)

1. Push this repo to GitHub (already done if you're reading it there).
2. Go to [render.com](https://render.com) → **New** → **Web Service** → connect
   the `wanderly-backend` repo.
3. Configure:
   - **Runtime**: Node
   - **Build Command**: `npm install && npx prisma generate`
   - **Start Command**: `npm start`
   - **Instance Type**: Free is fine for a demo
4. Add environment variables (Render dashboard → **Environment**), same keys as
   `.env.example`:
   - `DATABASE_URL` — your Neon/Supabase connection string
   - `JWT_SECRET` — a long random string
   - `JWT_EXPIRES_IN` — `7d`
   - `NODE_ENV` — `production`
   - `CLIENT_URL` — your deployed Vercel frontend URL (add once you have it,
     e.g. `https://wanderly.vercel.app`)
   - `SERVER_URL` — this Render service's own URL, e.g.
     `https://wanderly-backend.onrender.com` (needed for the Google OAuth
     callback URL; leave `GOOGLE_CLIENT_ID`/`SECRET` blank if not using Google
     login)
5. Deploy. Once live, run the migration + seed once against production either
   by temporarily setting `DATABASE_URL` in a local `.env` to the same
   production database and running:
   ```bash
   npx prisma migrate deploy
   npm run seed
   ```
6. Copy the Render service URL — you'll set it as `NEXT_PUBLIC_API_URL` in the
   frontend deployment.

Render's free tier spins down after inactivity, so the first request after a
period of idleness can take ~30-50s to wake up — normal for a free demo deploy.

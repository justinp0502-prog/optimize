# Optimize

Optimize is a production-minded MVP for a calm life assistant. It combines daily planning, meals, nudges, reflections, and lightweight progress into a single mobile-first Next.js app.

## Stack

- Next.js App Router
- React + TypeScript
- Tailwind CSS
- shadcn/ui-style component primitives
- Prisma
- SQLite for local development
- Auth.js credentials authentication

## Routes

- `/` dashboard / today view
- `/onboarding` life profile setup
- `/profile` editable profile and goals
- `/meals` weekly meals and grocery list
- `/reflection` reflection logging and history
- `/progress` trends and trajectory
- `/settings` tone, nudges, and assistant preferences
- `/api/daily-plan` generated mock daily plan payload
- `/api/meals` generated mock meal payload

## Local setup

1. Install dependencies:

```bash
npm install
```

2. Create an environment file:

```bash
cp .env.example .env
```

3. Generate the database and Prisma client:

```bash
npm run db:push
```

4. Seed example data:

```bash
npm run db:seed
```

5. Start the app:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Demo login after seeding:

- email: `alex@optimize.app`
- password: `optimize-demo`

## Seeded experience

The seed creates:

- one example user
- a full life profile
- three goals
- build and reduce habits
- daily plan blocks
- a weekly meal plan with groceries
- reflection history
- nudge preferences

## Architecture

- `app/` routes, API endpoints, and page composition
- `components/` reusable UI and dashboard sections
- `lib/actions.ts` server actions for profile, meals, reflections, settings, and day regeneration
- `lib/services/` mock AI generation utilities that can later be replaced with model calls
- `lib/prisma.ts` Prisma singleton
- `prisma/schema.prisma` data model
- `prisma/seed.ts` example content

## Connecting real AI later

The mock generation layer already isolates the replaceable logic:

- `lib/services/daily-plan.ts`
- `lib/services/meal-plan.ts`
- `lib/services/nudges.ts`

To connect a real model later:

1. Add your OpenAI client or server-side SDK wrapper.
2. Replace the mock generation functions with model-backed calls.
3. Keep the route handlers and server actions unchanged so the UI contract stays stable.
4. Add persistence rules if you want generated results versioned or user-editable.

## Multi-user sharing

This codebase is now user-scoped and includes sign-up/sign-in, so each person gets a separate profile and separate data.

To make it shareable outside your computer:

1. Push the repo to GitHub.
2. Create a hosted PostgreSQL database.
   Simple option: [Prisma Postgres](https://docs.prisma.io/docs/postgres)
3. In this repo, set `DATABASE_URL` locally to the hosted Postgres URL and run:

```bash
npm run db:push:prod
```

4. Deploy the repo to [Vercel](https://vercel.com/docs/frameworks/nextjs).
5. Set environment variables in Vercel:
   - `DATABASE_URL`
   - `AUTH_SECRET`
6. Redeploy after adding the environment variables.
7. Create accounts through `/signup`.

Important note:

- The current repo still uses SQLite for local development because it is the easiest local setup.
- Vercel uses the `vercel.json` build command to generate Prisma Client from `prisma/schema.postgres.prisma`.
- For a real shared deployment, use hosted Postgres rather than SQLite.

## Recommended deploy flow

1. Create the database and copy the connection string.
2. Put that connection string in your local terminal temporarily and initialize the production schema:

```bash
DATABASE_URL="your-postgres-url" npm run db:push:prod
```

3. Import the GitHub repo into Vercel.
4. Add `DATABASE_URL` and `AUTH_SECRET` in the Vercel project settings.
5. Push to `main` or deploy through the Vercel dashboard.

Vercel environment variable docs: [Environment variables](https://vercel.com/docs/environment-variables)  
Vercel Next.js docs: [Next.js on Vercel](https://vercel.com/docs/frameworks/nextjs)  
Prisma production schema apply docs: [prisma db push / production workflows](https://docs.prisma.io/docs/cli/migrate/deploy)  
Prisma Postgres docs: [Prisma Postgres overview](https://docs.prisma.io/docs/postgres)

## Notes

- SQLite is configured for local development through `DATABASE_URL="file:./dev.db"`.
- The schema is structured so moving to Postgres later is straightforward.
- Authentication is not included yet, but the current `User` root model keeps that migration path open.

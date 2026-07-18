# Supabase setup

CareBridge stores clinical demo data in **Supabase (Postgres)** and uses **Supabase Auth** for sign-in.

## 1. Create a Supabase project

1. Go to [supabase.com](https://supabase.com) and create a project.
2. Copy your **Project URL** and **anon public key** from **Settings → API**.

## 2. Configure the app

Add your keys to `app.json` under `expo.extra`:

```json
"supabaseUrl": "https://YOUR_PROJECT.supabase.co",
"supabaseAnonKey": "YOUR_ANON_KEY"
```

Or set them via EAS build profiles / environment for staging and production.

## 3. Run database migrations

In the Supabase **SQL Editor**, run in order:

1. `supabase/schema.sql` — creates tables and RLS policies
2. `supabase/seed.sql` — loads synthetic demo clinical data

## 4. Create demo auth users

From your machine (requires the **service role key** — never put this in the app):

```bash
SUPABASE_URL=https://YOUR_PROJECT.supabase.co \
SUPABASE_SERVICE_ROLE_KEY=YOUR_SERVICE_ROLE_KEY \
node scripts/setup-demo-users.mjs
```

Then re-run `supabase/seed.sql` if needed.

## Demo accounts

| Role     | Email                  | Password           |
| -------- | ---------------------- | ------------------ |
| Patient  | patient@demo.health    | DemoPatient#2026   |
| Provider | provider@demo.health   | DemoProvider#2026  |

## Fallback behavior

If `supabaseUrl` and `supabaseAnonKey` are empty, the app falls back to the in-memory mock data layer so it still runs without a backend.

## Tables

- `profiles` — links Supabase Auth users to app roles
- `patients`, `practitioners`
- `appointments`, `medications`, `allergies`, `conditions`
- `observations`, `lab_reports`, `message_threads`

All data is synthetic demo content — no real PHI.

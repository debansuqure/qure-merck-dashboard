# Qure–Merck Partnership Dashboard

A programme tracking dashboard for the Qure.ai × Merck partnership. Built with Next.js 14 App Router, TypeScript, Tailwind CSS, and Supabase.

---

## Stack

| Layer     | Technology                    |
|-----------|-------------------------------|
| Framework | Next.js 14 (App Router)       |
| Language  | TypeScript                    |
| Styling   | Tailwind CSS                  |
| Database  | Supabase (PostgreSQL)         |
| Hosting   | Vercel                        |
| Auth      | Cookie-based (single password)|

---

## Features

- **Executive Dashboard** — KPI cards, attention alerts, programme progress
- **Site Tracker** — 24 sites grouped by programme with expandable milestone chips
- **Action Tracker** — search, filter, sort, overdue highlighting
- **Risk Register** — programme-level risks with impact and mitigation
- **Admin Mode** — inline milestone cycling, notes editing, full CRUD for actions and risks
- **Public View** — read-only, no login required, suitable for Merck stakeholders

---

## Local Development

### Prerequisites

- Node.js 18+
- A Supabase project (free tier is fine)

### 1. Clone the repository

```bash
git clone https://github.com/YOUR_USERNAME/qure-merck-dashboard.git
cd qure-merck-dashboard
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set environment variables

Copy the example file and fill in your values:

```bash
cp .env.example .env.local
```

Edit `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
ADMIN_PASSWORD=your-secure-password
```

### 4. Run the database migrations

Go to your Supabase project → **SQL Editor** → paste and run each file in order:

1. `supabase/migrations/001_schema.sql`
2. `supabase/migrations/002_seed.sql`

Or use the Supabase CLI:

```bash
supabase db push
```

### 5. Start the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Admin panel: [http://localhost:3000/admin](http://localhost:3000/admin)

---

## Supabase Setup

1. Go to [supabase.com](https://supabase.com) and create a new project.
2. Wait for the project to provision (~2 minutes).
3. Go to **Project Settings → API**.
4. Copy:
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role secret` key → `SUPABASE_SERVICE_ROLE_KEY`
5. Run migrations via SQL Editor as described above.

> **Security note:** The `service_role` key bypasses Row Level Security. It is only used in server-side API routes and is never sent to the browser.

---

## GitHub Setup

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR_USERNAME/qure-merck-dashboard.git
git push -u origin main
```

---

## Vercel Deployment

1. Go to [vercel.com](https://vercel.com) → **New Project** → Import your GitHub repo.
2. Vercel auto-detects Next.js. No build config changes needed.
3. Add environment variables in the Vercel dashboard under **Settings → Environment Variables**:

```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
ADMIN_PASSWORD
```

4. Click **Deploy**.

Your dashboard will be live at `https://your-project.vercel.app`.

---

## Environment Variables

| Variable                      | Required | Description                                      |
|-------------------------------|----------|--------------------------------------------------|
| `NEXT_PUBLIC_SUPABASE_URL`    | Yes      | Supabase project URL                             |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes    | Supabase anon/public key (safe for browser)      |
| `SUPABASE_SERVICE_ROLE_KEY`   | Yes      | Supabase service role key (server-only, secret)  |
| `ADMIN_PASSWORD`              | Yes      | Password for `/admin` access                     |

---

## Admin Password Setup

The admin password is stored as a plain environment variable. To change it:

1. Update `ADMIN_PASSWORD` in Vercel → **Settings → Environment Variables**.
2. Trigger a redeploy (or it takes effect on next deployment).

There is no password reset flow — simply update the env var.

---

## Admin Usage

1. Navigate to `/admin` (or click "Admin" in the nav).
2. Enter the `ADMIN_PASSWORD`.
3. A session cookie is set for 7 days.

**Sites tab:**
- Click a programme header to expand/collapse.
- Click a site row to expand it.
- Click any milestone chip to cycle its status: Pending → In Progress → Complete → Blocked → Pending.
- Click "Edit" next to Notes to edit and save site notes.
- Use the status dropdown inline to change site status.

**Actions tab:**
- Click "+ Add Action" to create an action.
- Click "Edit" on any action to update it inline.
- Click "Complete" to mark it done.
- Click "Delete" to remove it (with confirmation).

**Risks tab:**
- Same inline CRUD as actions.

All changes persist to Supabase and are immediately visible to public viewers on refresh.

---

## Assumptions & Defaults

- **NL sites** in qXR are labelled `qXR-NL-1` through `qXR-NL-4` (Netherlands, not EU, to distinguish from qTrack EU sites).
- **qTrack EU** sites use identifier `qTrack-EU-1/2` and country "Europe" as region is unspecified.
- **PAH EU** sites similarly use "Europe".
- Actions and risks start empty — all fields are editable via admin.
- The admin session expires after 7 days and requires re-login.
- There is no email notification system; alerting is visual only (Attention Required section).

# Blurt

Public unfiltered thoughts + private daily digest. Built with React, Vite, and Supabase.

## What's already done
- Database schema (`supabase-schema.sql`) — run this once in your Supabase project
- The app itself, wired to Supabase Auth (real email/password accounts) and Postgres
- PWA setup — installable on phones with a real icon, no browser bar
- Movie/show search uses free public APIs (TVMaze + iTunes) — no API key needed

## One-time setup you still need to do

### 1. Run the database schema
1. Open your Supabase project → **SQL Editor** → **New query**
2. Paste in the entire contents of `supabase-schema.sql`
3. Click **Run**
4. You should see "Success. No rows returned" — that means your tables and security rules are live

### 2. Push this code to GitHub
From a terminal, inside this project folder:
```
git init
git add .
git commit -m "blurt v1"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/blurt.git
git push -u origin main
```
(Create the empty repo on GitHub first — github.com → New repository → name it `blurt`, don't initialize with a README since this folder already has one.)

### 3. Deploy on Vercel
1. Go to vercel.com → **Add New** → **Project**
2. Import your `blurt` GitHub repo
3. Before deploying, open **Environment Variables** and add:
   - `VITE_SUPABASE_URL` → your Supabase project URL (e.g. `https://idknhqboralflyvzymmm.supabase.co`)
   - `VITE_SUPABASE_KEY` → your Supabase publishable key (starts with `sb_publishable_`)
4. Click **Deploy**
5. Vercel gives you a real URL like `blurt-yourname.vercel.app`

### 4. Install it on your phone
1. Open your new `.vercel.app` URL in your phone's browser
2. iPhone (Safari): tap Share → **Add to Home Screen**
3. Android (Chrome): tap ⋮ → **Add to Home screen** / **Install app**
4. It now opens full-screen from your home screen icon, like a real app

## Local development (optional)
```
npm install
cp .env.example .env   # then fill in your real Supabase URL + key
npm run dev
```

## Notes on how the security works
- The public feed (`blurt_posts`) is readable by anyone logged in, and anyone can post — that's the whole point of Blurt
- The private daily digest (`blurt_digest`) is locked down with Postgres Row Level Security tied to `auth.uid()` — only the logged-in user can ever read or write their own rows, enforced by the database itself, not just hidden in the UI
- Flagging is handled through a `flag_post()` database function so users can flag others' posts without getting broad write access to them
- The `sb_publishable_...` key is safe to have in this public repo and in the deployed app's code — it's designed to be public, real protection comes from Row Level Security

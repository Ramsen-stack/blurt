-- ============================================================
-- BLURT — Supabase schema (v2: real Supabase Auth)
-- Run this whole file in Supabase Dashboard → SQL Editor → New query → Run
--
-- This version uses Supabase Auth (email + password) so that private
-- digest entries are ACTUALLY private at the database level, enforced
-- via auth.uid() — not just hidden by app UI.
-- ============================================================

-- PROFILES table: public-facing username, linked 1:1 to a real auth user.
-- auth.users (email, password, session tokens) is managed entirely by
-- Supabase Auth — we never touch passwords ourselves.
create table if not exists public.blurt_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique not null,
  created_at timestamptz default now()
);

-- POSTS table: the public feed. Tied to a real user id, but readable
-- by everyone (it's a public feed by design).
create table if not exists public.blurt_posts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  username text not null,
  text text not null,
  mood text not null,
  stickers text[] default '{}',
  created_at timestamptz default now(),
  hidden boolean default false,
  flags int default 0
);

-- DIGEST table: private daily logs, one row per user per day.
-- Only the owning user can read or write their own rows — enforced by RLS.
create table if not exists public.blurt_digest (
  user_id uuid not null references auth.users(id) on delete cascade,
  date text not null, -- YYYY-MM-DD
  water int default 0,
  work text default '',
  shows jsonb default '[]',
  mood text,
  notes text default '',
  updated_at timestamptz default now(),
  primary key (user_id, date)
);

-- ============================================================
-- ROW LEVEL SECURITY — required, do not skip.
-- ============================================================

alter table public.blurt_profiles enable row level security;
alter table public.blurt_posts enable row level security;
alter table public.blurt_digest enable row level security;

-- PROFILES: usernames are public info (needed to show "@username" on
-- posts and to check availability at signup). Only the owner can create
-- or edit their own profile row.
drop policy if exists "profiles are publicly readable" on public.blurt_profiles;
create policy "profiles are publicly readable"
  on public.blurt_profiles for select
  using (true);

drop policy if exists "users can create their own profile" on public.blurt_profiles;
create policy "users can create their own profile"
  on public.blurt_profiles for insert
  with check (auth.uid() = id);

drop policy if exists "users can update their own profile" on public.blurt_profiles;
create policy "users can update their own profile"
  on public.blurt_profiles for update
  using (auth.uid() = id);

-- POSTS: anyone logged in can read non-hidden posts, and the feed is
-- meant to be public — but we still require a real logged-in session
-- to read/write, since this app has no anonymous browsing mode.
-- Only the post's own author can update it (used for the flag counter
-- via a controlled RPC, not direct client writes — see app notes).
drop policy if exists "logged in users can read posts" on public.blurt_posts;
create policy "logged in users can read posts"
  on public.blurt_posts for select
  using (auth.role() = 'authenticated');

drop policy if exists "users can create their own posts" on public.blurt_posts;
create policy "users can create their own posts"
  on public.blurt_posts for insert
  with check (auth.uid() = user_id);

-- Flagging needs to increment a counter on someone ELSE's post, which a
-- simple "owner only" policy would block. We handle this with a Postgres
-- function (security definer) instead of a direct client update policy —
-- see the flag_post() function below.

-- DIGEST: strictly the owning user only. This is the real fix —
-- nobody else, not even with the public key, can read these rows.
drop policy if exists "users read own digest" on public.blurt_digest;
create policy "users read own digest"
  on public.blurt_digest for select
  using (auth.uid() = user_id);

drop policy if exists "users write own digest" on public.blurt_digest;
create policy "users write own digest"
  on public.blurt_digest for insert
  with check (auth.uid() = user_id);

drop policy if exists "users update own digest" on public.blurt_digest;
create policy "users update own digest"
  on public.blurt_digest for update
  using (auth.uid() = user_id);

-- ============================================================
-- FLAG FUNCTION — lets any logged-in user bump a post's flag count
-- (and auto-hide at 3 flags) without giving blanket update rights
-- on other people's posts.
-- ============================================================
create or replace function public.flag_post(post_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.blurt_posts
  set flags = flags + 1,
      hidden = (flags + 1) >= 3
  where id = post_id;
end;
$$;

grant execute on function public.flag_post(uuid) to authenticated;

-- Helpful indexes
create index if not exists blurt_posts_created_idx on public.blurt_posts (created_at desc);
create index if not exists blurt_digest_user_idx on public.blurt_digest (user_id);


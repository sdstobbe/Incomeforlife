-- Run this in Supabase: SQL Editor → New query → paste this line → Run
-- This lets the API insert new members (fixes "could not create your account").
ALTER TABLE members DISABLE ROW LEVEL SECURITY;

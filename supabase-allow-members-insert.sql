-- Run this in Supabase: SQL Editor → New query → paste → Run
-- This allows the API to insert into the members table (fixes "could not create account" if RLS was blocking).

ALTER TABLE members ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow API full access to members" ON members;
CREATE POLICY "Allow API full access to members"
  ON members FOR ALL
  USING (true)
  WITH CHECK (true);

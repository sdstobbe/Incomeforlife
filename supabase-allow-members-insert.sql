-- Run this in Supabase: SQL Editor → New query → paste → Run
-- Option A: Allow all operations via a policy (keeps RLS on)
ALTER TABLE members ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow API full access to members" ON members;
CREATE POLICY "Allow API full access to members"
  ON members FOR ALL USING (true) WITH CHECK (true);

-- Option B: If Option A doesn't fix it, run this to turn off RLS for members (simplest):
-- ALTER TABLE members DISABLE ROW LEVEL SECURITY;

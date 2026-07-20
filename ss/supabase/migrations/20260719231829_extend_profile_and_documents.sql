/*
# Extend user_profile for the Profile/Dashboard page + Document Vault

## Overview
The profile page needs structured fields beyond name/avatar/gpa: university,
class year, major, research interests (chips), completion %, and two account
setting toggles. It also lists uploaded documents. We add columns to
`user_profile` and a new `documents` table.

## Changes to `user_profile` (all additive)
- university, class_year, major (text)
- research_interests (text[]) — rendered as removable chips
- completion_percent (int) — drives the progress bar
- email_notifications, public_profile (boolean) — account settings toggles

## New table `documents`
Stores the Document Vault entries shown on the profile page.

## Security
- RLS enabled on `documents` with anon+authenticated CRUD (no-auth app pattern,
  matching the rest of the schema).
*/

ALTER TABLE user_profile
  ADD COLUMN IF NOT EXISTS university text NOT NULL DEFAULT 'Stanford University',
  ADD COLUMN IF NOT EXISTS class_year text NOT NULL DEFAULT 'Class of 2025',
  ADD COLUMN IF NOT EXISTS major text NOT NULL DEFAULT 'Computer Science',
  ADD COLUMN IF NOT EXISTS research_interests text[] NOT NULL DEFAULT '{AI,Quantum Computing,Tech Ethics}',
  ADD COLUMN IF NOT EXISTS completion_percent int NOT NULL DEFAULT 85,
  ADD COLUMN IF NOT EXISTS email_notifications boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS public_profile boolean NOT NULL DEFAULT false;

-- Reconcile the single profile row to Alex Chen (the user shown on the profile page),
-- so the avatar/name stay consistent across list, detail, and profile views.
UPDATE user_profile
SET
  name = 'Alex Chen',
  avatar_url = 'https://lh3.googleusercontent.com/aida-public/AB6AXuApKbOjdKmX8c53q6RTCFsIlflsyXDs4BzqfZD4GvYma3iJ_oIIaSmuAbDqlFjmQVlu4D1qaXvEqcT_YjRT3ax2xz7lS72h1EYf33AC-gl7lJJIdltQjCyX09mC8hwE0u1OgmkTq3tOcrUxuem76ULKZneZbgUEUzHqsyehvb--v02-6zNJuoEYphf4cLGDGQFX9MgROIkANb1yrJoXQ3LCvbdferlng7pVaJ99Z0JN8vZJj8FbUO1DRkT-SNWoFZGxbBo7H2UwOg',
  gpa = '3.92/4.0',
  university = 'Stanford University',
  class_year = 'Class of 2025',
  major = 'Computer Science',
  research_interests = ARRAY['AI', 'Quantum Computing', 'Tech Ethics'],
  completion_percent = 85,
  email_notifications = true,
  public_profile = false,
  updated_at = now()
WHERE singleton = true;

CREATE TABLE IF NOT EXISTS documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  icon text NOT NULL DEFAULT 'description',
  updated_at timestamptz NOT NULL DEFAULT now(),
  sort_order int NOT NULL DEFAULT 0
);

ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "select_documents" ON documents FOR SELECT
  TO anon, authenticated USING (true);
CREATE POLICY "insert_documents" ON documents FOR INSERT
  TO anon, authenticated WITH CHECK (true);
CREATE POLICY "update_documents" ON documents FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "delete_documents" ON documents FOR DELETE
  TO anon, authenticated USING (true);

INSERT INTO documents (name, icon, sort_order)
SELECT 'Resume_Final.pdf', 'description', 0
WHERE NOT EXISTS (SELECT 1 FROM documents WHERE name = 'Resume_Final.pdf');

INSERT INTO documents (name, icon, sort_order)
SELECT 'Official_Transcript.pdf', 'article', 1
WHERE NOT EXISTS (SELECT 1 FROM documents WHERE name = 'Official_Transcript.pdf');

INSERT INTO documents (name, icon, sort_order)
SELECT 'Rec_Letter_Prof_Smith.pdf', 'verified', 2
WHERE NOT EXISTS (SELECT 1 FROM documents WHERE name = 'Rec_Letter_Prof_Smith.pdf');

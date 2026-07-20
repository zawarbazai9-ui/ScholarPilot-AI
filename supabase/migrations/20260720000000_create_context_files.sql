-- Context files uploaded by users for AI advisor context
CREATE TABLE IF NOT EXISTS context_files (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  file_type text NOT NULL,
  file_size bigint NOT NULL,
  content text NOT NULL DEFAULT '',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE context_files ENABLE ROW LEVEL SECURITY;

-- Owner-scoped CRUD
CREATE POLICY "Users can view their own context files"
  ON context_files FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own context files"
  ON context_files FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own context files"
  ON context_files FOR DELETE
  USING (auth.uid() = user_id);

-- Index for fast lookups
CREATE INDEX IF NOT EXISTS idx_context_files_user_id ON context_files(user_id);

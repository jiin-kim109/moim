-- Create enum for report types
CREATE TYPE report_type AS ENUM ('chatroom', 'message', 'user');

-- Create simplified reports table
CREATE TABLE reports (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  reporter_id UUID NOT NULL REFERENCES user_profile(id) ON DELETE CASCADE,
  report_type report_type NOT NULL,
  reason TEXT,
  payload JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

-- RLS: Any authenticated user can insert a report for themselves
CREATE POLICY "Authenticated users can create reports" ON reports
  FOR INSERT
  WITH CHECK (
    auth.role() = 'authenticated' AND reporter_id = auth.uid()
  );

-- No UPDATE/DELETE policies -> disallow these operations by default under RLS

-- Comments
COMMENT ON TYPE report_type IS 'Type of entity being reported: chatroom, message, or user';
COMMENT ON TABLE reports IS 'User-submitted reports for moderation';
COMMENT ON COLUMN reports.reporter_id IS 'User who submitted the report (must be the current user)';
COMMENT ON COLUMN reports.report_type IS 'Type of reported entity';
COMMENT ON COLUMN reports.reason IS 'Free-form reason provided by the reporter';
COMMENT ON COLUMN reports.payload IS 'Arbitrary JSON payload with context about the report (e.g., IDs, snapshot data)';

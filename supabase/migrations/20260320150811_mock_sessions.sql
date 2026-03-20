CREATE TABLE mock_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mode TEXT NOT NULL DEFAULT 'locked' CHECK (mode IN ('locked', 'live')),
  schema JSONB NOT NULL,
  rules TEXT[] NOT NULL DEFAULT '{}',
  locked_response JSONB,
  request_count INT NOT NULL DEFAULT 0,
  rate_limit_reset TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now(),
  expires_at TIMESTAMPTZ DEFAULT now() + INTERVAL '1 hour'
);

CREATE INDEX idx_mock_sessions_expires ON mock_sessions (expires_at);

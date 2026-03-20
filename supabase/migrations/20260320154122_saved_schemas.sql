CREATE TABLE saved_schemas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  schema TEXT NOT NULL,
  rules TEXT[] NOT NULL DEFAULT '{}',
  api_key TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
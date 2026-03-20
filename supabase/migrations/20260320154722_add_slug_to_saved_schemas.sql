ALTER TABLE saved_schemas ADD COLUMN slug TEXT UNIQUE;
ALTER TABLE saved_schemas ADD COLUMN locked_response JSONB;

CREATE INDEX idx_saved_schemas_slug ON saved_schemas (slug);

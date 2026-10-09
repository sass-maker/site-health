-- Private brand-evidence store. Lives beside foundry.sqlite on the owner's
-- machine and is never committed, exported with the event-ledger backup, or
-- projected into public artifacts. Raw prompts and answers are retained here
-- deliberately: they are the evidence the owner inspects.

CREATE TABLE IF NOT EXISTS brand_evidence_migrations (
  version INTEGER PRIMARY KEY,
  applied_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS brand_profiles (
  project_id TEXT PRIMARY KEY,
  brand_name TEXT NOT NULL,
  aliases_json TEXT NOT NULL DEFAULT '[]',
  brand_url TEXT,
  competitors_json TEXT NOT NULL DEFAULT '[]',
  keywords_json TEXT NOT NULL DEFAULT '[]',
  target_customer TEXT,
  topics_json TEXT NOT NULL DEFAULT '[]',
  communities_json TEXT NOT NULL DEFAULT '[]',
  schedule TEXT CHECK (schedule IS NULL OR schedule IN ('daily', 'weekly')),
  provider_json TEXT NOT NULL DEFAULT '{"mode":"free-ai"}',
  source TEXT NOT NULL,
  source_record_id TEXT,
  import_batch_id TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS evidence_prompts (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL,
  prompt_text TEXT NOT NULL,
  category TEXT,
  source TEXT NOT NULL,
  source_record_id TEXT,
  import_batch_id TEXT,
  created_at TEXT NOT NULL,
  UNIQUE(source, source_record_id)
);
CREATE INDEX IF NOT EXISTS evidence_prompts_project ON evidence_prompts(project_id, created_at);

CREATE TABLE IF NOT EXISTS evidence_checks (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL,
  channel TEXT NOT NULL CHECK (channel IN ('api-model', 'consumer-assistant')),
  trigger TEXT NOT NULL CHECK (trigger IN ('manual', 'scheduled', 'imported')),
  status TEXT NOT NULL CHECK (status IN ('running', 'completed', 'partial', 'failed', 'incomplete')),
  source_status TEXT,
  attempted INTEGER NOT NULL DEFAULT 0,
  completed INTEGER NOT NULL DEFAULT 0,
  failed INTEGER NOT NULL DEFAULT 0,
  mention_rate REAL,
  summary TEXT,
  started_at TEXT NOT NULL,
  finished_at TEXT,
  source TEXT NOT NULL,
  source_record_id TEXT,
  import_batch_id TEXT,
  UNIQUE(source, source_record_id)
);
CREATE INDEX IF NOT EXISTS evidence_checks_project ON evidence_checks(project_id, started_at DESC);

-- A failed or unavailable provider call keeps its status and carries no mention
-- verdict: brand_mentioned, brand_cited and brand_position stay NULL.
CREATE TABLE IF NOT EXISTS evidence_observations (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL,
  check_id TEXT,
  channel TEXT NOT NULL CHECK (channel IN ('api-model', 'consumer-assistant')),
  provider TEXT NOT NULL,
  model TEXT NOT NULL,
  prompt_id TEXT,
  prompt_text TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('completed', 'unavailable', 'error')),
  error_message TEXT,
  answer_text TEXT,
  citations_json TEXT NOT NULL DEFAULT '[]',
  brand_mentioned INTEGER,
  brand_position INTEGER,
  brand_sentiment TEXT,
  competitors_json TEXT NOT NULL DEFAULT '[]',
  brand_cited INTEGER,
  latency_ms INTEGER,
  observed_at TEXT NOT NULL,
  fingerprint TEXT NOT NULL,
  source TEXT NOT NULL,
  source_record_id TEXT,
  import_batch_id TEXT,
  CHECK (status = 'completed' OR (brand_mentioned IS NULL AND brand_cited IS NULL AND brand_position IS NULL)),
  UNIQUE(source, source_record_id)
);
CREATE INDEX IF NOT EXISTS evidence_observations_project ON evidence_observations(project_id, observed_at DESC);
CREATE INDEX IF NOT EXISTS evidence_observations_fingerprint ON evidence_observations(project_id, fingerprint);

CREATE TABLE IF NOT EXISTS community_findings (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL,
  source TEXT NOT NULL,
  source_record_id TEXT NOT NULL,
  source_name TEXT NOT NULL,
  title TEXT NOT NULL,
  content TEXT,
  url TEXT NOT NULL,
  author TEXT,
  published_at TEXT,
  first_seen_at TEXT NOT NULL,
  last_seen_at TEXT NOT NULL,
  engagement_score INTEGER,
  comment_count INTEGER,
  relevance_score INTEGER NOT NULL DEFAULT 0,
  intent TEXT NOT NULL DEFAULT 'general',
  matched_keywords_json TEXT NOT NULL DEFAULT '[]',
  status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'reviewed', 'dismissed', 'resolved')),
  origin TEXT NOT NULL,
  origin_record_id TEXT,
  import_batch_id TEXT,
  UNIQUE(project_id, source, source_record_id)
);
CREATE INDEX IF NOT EXISTS community_findings_project ON community_findings(project_id, status, relevance_score DESC);

CREATE TABLE IF NOT EXISTS evidence_actions (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL,
  subject_kind TEXT NOT NULL CHECK (subject_kind IN ('observation', 'finding', 'check')),
  subject_id TEXT NOT NULL,
  title TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'completed')),
  created_at TEXT NOT NULL,
  completed_at TEXT,
  source TEXT NOT NULL,
  source_record_id TEXT,
  import_batch_id TEXT,
  UNIQUE(source, source_record_id)
);
CREATE INDEX IF NOT EXISTS evidence_actions_project ON evidence_actions(project_id, status, created_at DESC);

CREATE TABLE IF NOT EXISTS evidence_history (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL,
  subject_kind TEXT NOT NULL,
  subject_id TEXT NOT NULL,
  action TEXT NOT NULL,
  note TEXT,
  created_at TEXT NOT NULL,
  source TEXT NOT NULL,
  source_record_id TEXT,
  import_batch_id TEXT,
  UNIQUE(source, source_record_id)
);
CREATE INDEX IF NOT EXISTS evidence_history_project ON evidence_history(project_id, created_at DESC);

CREATE TABLE IF NOT EXISTS transfer_batches (
  id TEXT PRIMARY KEY,
  source TEXT NOT NULL,
  source_digest TEXT NOT NULL,
  mapping_json TEXT NOT NULL,
  counts_json TEXT NOT NULL,
  state TEXT NOT NULL CHECK (state IN ('applied', 'reverted')),
  applied_at TEXT NOT NULL,
  reverted_at TEXT
);

CREATE TABLE IF NOT EXISTS transfer_links (
  batch_id TEXT NOT NULL,
  entity TEXT NOT NULL,
  source_record_id TEXT NOT NULL,
  local_id TEXT NOT NULL,
  disposition TEXT NOT NULL CHECK (disposition IN ('inserted', 'linked-duplicate', 'already-present')),
  PRIMARY KEY (batch_id, entity, source_record_id)
);

-- Studio Vella v0.1 schema.

-- === leads ===============================================================
CREATE TABLE IF NOT EXISTS leads (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  business_name TEXT,
  business_url TEXT,
  business_type TEXT NOT NULL DEFAULT 'photography',
  project_type TEXT CHECK (project_type IN ('residential','commercial','hospitality','other')),
  when_label TEXT CHECK (when_label IN ('this_month','next_month','q+1','exploring')),
  brief TEXT,
  source TEXT NOT NULL DEFAULT 'form' CHECK (source IN ('form','front-handoff','direct-email')),
  front_transcript_id TEXT,
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  ip TEXT,
  ua TEXT,
  status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new','qualified','quoted','won','lost','declined','spam')),
  notes TEXT,
  version INTEGER NOT NULL DEFAULT 0,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON leads(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_leads_email ON leads(email);

-- === transcripts =========================================================
CREATE TABLE IF NOT EXISTS transcripts (
  id TEXT PRIMARY KEY,
  ip TEXT,
  ua TEXT,
  utm_source TEXT,
  utm_campaign TEXT,
  qualified INTEGER NOT NULL DEFAULT 0,
  handed_off_to_lead_id TEXT,
  project_type TEXT,
  when_label TEXT,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_transcripts_created_at ON transcripts(created_at DESC);

CREATE TABLE IF NOT EXISTS transcript_messages (
  id TEXT PRIMARY KEY,
  transcript_id TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('user','assistant','system')),
  content TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  FOREIGN KEY (transcript_id) REFERENCES transcripts(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_transcript_messages_transcript ON transcript_messages(transcript_id, created_at);

-- === lead_activity (used by customer Timeline) ===========================
CREATE TABLE IF NOT EXISTS lead_activity (
  id TEXT PRIMARY KEY,
  lead_id TEXT NOT NULL,
  kind TEXT NOT NULL CHECK (kind IN ('status_change','note','quote_sent','call_logged','email_sent','build_started','build_completed')),
  from_value TEXT,
  to_value TEXT,
  body TEXT,
  user_id TEXT,
  created_at INTEGER NOT NULL,
  FOREIGN KEY (lead_id) REFERENCES leads(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_lead_activity_lead_id ON lead_activity(lead_id, created_at DESC);

-- === audit_log ===========================================================
CREATE TABLE IF NOT EXISTS audit_log (
  id TEXT PRIMARY KEY,
  user_id TEXT,
  action TEXT NOT NULL,
  target_table TEXT NOT NULL,
  target_id TEXT,
  before_json TEXT,
  after_json TEXT,
  created_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_audit_log_created ON audit_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_log_target ON audit_log(target_table, target_id);

-- === availability (project-specific) =====================================
CREATE TABLE IF NOT EXISTS availability (
  date TEXT PRIMARY KEY,
  status TEXT NOT NULL CHECK (status IN ('open','booked','tentative','blocked')),
  note TEXT,
  updated_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_availability_status ON availability(status);

-- === settings (key-value, edited via /admin/settings) ====================
CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at INTEGER NOT NULL,
  version INTEGER NOT NULL DEFAULT 0
);

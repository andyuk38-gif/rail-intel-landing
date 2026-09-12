<?php

function admin_db(): PDO
{
    static $pdo = null;
    if ($pdo instanceof PDO) {
        return $pdo;
    }

    $cfg = admin_config();
    if (!is_dir($cfg['data_dir'])) {
        mkdir($cfg['data_dir'], 0755, true);
    }
    if (!is_dir($cfg['uploads_dir'])) {
        mkdir($cfg['uploads_dir'], 0755, true);
    }

    $pdo = new PDO('sqlite:' . $cfg['db_path']);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
    $pdo->exec('PRAGMA foreign_keys = ON');
    admin_init_schema($pdo);
    return $pdo;
}

function admin_init_schema(PDO $db): void
{
    $db->exec(<<<'SQL'
CREATE TABLE IF NOT EXISTS admins (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  company_code TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  mfa_enabled INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE TABLE IF NOT EXISTS content_blocks (
  id TEXT PRIMARY KEY,
  key TEXT NOT NULL UNIQUE,
  label TEXT NOT NULL,
  page TEXT,
  field_type TEXT NOT NULL DEFAULT 'text',
  value TEXT NOT NULL DEFAULT '',
  published_value TEXT,
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_by TEXT
);
CREATE TABLE IF NOT EXISTS media_assets (
  id TEXT PRIMARY KEY,
  filename TEXT NOT NULL,
  original_name TEXT NOT NULL,
  mime_type TEXT NOT NULL,
  size_bytes INTEGER NOT NULL,
  alt_text TEXT,
  uploaded_by TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE TABLE IF NOT EXISTS newsletter_subscribers (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'active',
  source TEXT,
  subscribed_at TEXT NOT NULL DEFAULT (datetime('now')),
  unsubscribed_at TEXT
);
CREATE TABLE IF NOT EXISTS newsletter_campaigns (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  subject TEXT NOT NULL,
  preheader TEXT,
  blocks_json TEXT NOT NULL DEFAULT '[]',
  status TEXT NOT NULL DEFAULT 'draft',
  recipient_mode TEXT NOT NULL DEFAULT 'all',
  recipient_emails_json TEXT,
  sent_at TEXT,
  created_by TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE TABLE IF NOT EXISTS newsletter_sends (
  id TEXT PRIMARY KEY,
  campaign_id TEXT NOT NULL,
  subscriber_id TEXT,
  email TEXT NOT NULL,
  status TEXT NOT NULL,
  error TEXT,
  sent_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE TABLE IF NOT EXISTS plugins (
  id TEXT PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  version TEXT NOT NULL,
  enabled INTEGER NOT NULL DEFAULT 1,
  config_json TEXT NOT NULL DEFAULT '{}',
  installed_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE TABLE IF NOT EXISTS audit_log (
  id TEXT PRIMARY KEY,
  actor_email TEXT,
  action TEXT NOT NULL,
  entity_type TEXT,
  entity_id TEXT,
  detail_json TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
SQL);

    admin_seed_content($db);
}

function admin_seed_content(PDO $db): void
{
    $blocks = [
        ['site.tagline', 'Site tagline', 'global', 'text', 'Secure competency management for rail'],
        ['home.hero.title', 'Homepage hero title', 'index', 'text', 'Competency management built for rail'],
        ['home.hero.lead', 'Homepage hero lead', 'index', 'textarea', 'Track cycles, medicals, licences and assessments so expired skills never reach the railway.'],
        ['footer.newsletter.heading', 'Newsletter heading', 'global', 'text', 'Stay in the loop'],
        ['footer.newsletter.text', 'Newsletter description', 'global', 'textarea', 'Product updates, rail compliance insight and release notes — no spam.'],
    ];
    $stmt = $db->prepare('INSERT OR IGNORE INTO content_blocks (id, key, label, page, field_type, value, published_value) VALUES (?, ?, ?, ?, ?, ?, ?)');
    foreach ($blocks as [$key, $label, $page, $type, $value]) {
        $stmt->execute([admin_uuid(), $key, $label, $page, $type, $value, $value]);
    }
}

function admin_uuid(): string
{
    $data = random_bytes(16);
    $data[6] = chr((ord($data[6]) & 0x0f) | 0x40);
    $data[8] = chr((ord($data[8]) & 0x3f) | 0x80);
    return vsprintf('%s%s-%s-%s-%s-%s%s%s', str_split(bin2hex($data), 4));
}

function admin_audit(?string $actor, string $action, ?string $type = null, ?string $id = null, array $detail = []): void
{
    admin_db()->prepare('INSERT INTO audit_log (id, actor_email, action, entity_type, entity_id, detail_json) VALUES (?, ?, ?, ?, ?, ?)')
        ->execute([admin_uuid(), $actor, $action, $type, $id, json_encode($detail)]);
}

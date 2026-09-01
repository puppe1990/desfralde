import type { Client } from '@libsql/client'

async function addColumn(client: Client, sql: string) {
  try {
    await client.execute(sql)
  } catch {
    // Column already exists on upgraded local databases.
  }
}

export async function ensureDesfraldeSchema(client: Client) {
  await client.executeMultiple(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      family_id TEXT,
      created_at INTEGER NOT NULL
    );
    CREATE TABLE IF NOT EXISTS families (
      id TEXT PRIMARY KEY,
      created_by_user_id TEXT NOT NULL,
      created_at INTEGER NOT NULL
    );
    CREATE TABLE IF NOT EXISTS family_adults (
      id TEXT PRIMARY KEY,
      family_id TEXT NOT NULL REFERENCES families(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      role TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS children (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      created_at INTEGER NOT NULL
    );
    CREATE TABLE IF NOT EXISTS pecs_cards (
      id TEXT PRIMARY KEY,
      child_id TEXT NOT NULL REFERENCES children(id) ON DELETE CASCADE,
      slug TEXT NOT NULL,
      kind TEXT NOT NULL,
      label TEXT NOT NULL,
      speak TEXT NOT NULL,
      image_src TEXT NOT NULL,
      tone TEXT NOT NULL,
      sort_order INTEGER NOT NULL
    );
    CREATE TABLE IF NOT EXISTS stars (
      id TEXT PRIMARY KEY,
      child_id TEXT NOT NULL REFERENCES children(id) ON DELETE CASCADE,
      date TEXT NOT NULL,
      kind TEXT NOT NULL
    );
    CREATE UNIQUE INDEX IF NOT EXISTS stars_child_date_kind
      ON stars (child_id, date, kind);
    CREATE TABLE IF NOT EXISTS potty_events (
      id TEXT PRIMARY KEY,
      child_id TEXT NOT NULL REFERENCES children(id) ON DELETE CASCADE,
      kind TEXT NOT NULL,
      occurred_at INTEGER NOT NULL
    );
    CREATE INDEX IF NOT EXISTS potty_events_child_time
      ON potty_events (child_id, occurred_at);
  `)

  await addColumn(client, 'ALTER TABLE children ADD COLUMN family_id TEXT')
  await addColumn(
    client,
    "ALTER TABLE children ADD COLUMN gender TEXT NOT NULL DEFAULT 'menino'",
  )
  await addColumn(
    client,
    "ALTER TABLE children ADD COLUMN skin_tone TEXT NOT NULL DEFAULT 'golden'",
  )
  await addColumn(
    client,
    "ALTER TABLE children ADD COLUMN hair_type TEXT NOT NULL DEFAULT 'wavy'",
  )
  await addColumn(
    client,
    "ALTER TABLE children ADD COLUMN hair_color TEXT NOT NULL DEFAULT 'brown'",
  )
}

import { Pool } from "pg";

let pool;

export function getPool() {
  if (!pool) {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false }
    });
  }
  return pool;
}

export async function ensureSourceRegistryTable() {
  const db = getPool();

  await db.query(`
    create table if not exists source_registry (
      id bigserial primary key,
      name text not null unique,
      category text not null,
      sub_category text,
      scope text not null,
      pricing_model text not null,
      source_class text not null,
      access_type text not null,
      update_frequency text,
      trust_score integer default 3,
      freshness_score text,
      relevance_scope text,
      sensitivity text default 'public',
      license_type text,
      integration_status text default 'pending',
      region text,
      notes text,
      created_at timestamptz not null default now(),
      updated_at timestamptz not null default now()
    );
  `);

  await db.query(`
    create index if not exists source_registry_category_idx
    on source_registry(category);
  `);

  await db.query(`
    create index if not exists source_registry_scope_idx
    on source_registry(scope);
  `);

  await db.query(`
    create index if not exists source_registry_status_idx
    on source_registry(integration_status);
  `);
}

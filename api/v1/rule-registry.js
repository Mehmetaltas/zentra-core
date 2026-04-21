import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

function json(res, status, body) {
  res.status(status).json(body);
}

// 🔥 TABLE + MIGRATION
async function ensureTable() {
  await pool.query(`
    create table if not exists rule_registry (
      id bigserial primary key,
      name text unique,
      field text,
      operator text,
      threshold numeric,
      score numeric,
      description text,
      category text,
      priority text,
      active boolean default true
    )
  `);

  // 🔥 kolon ekleme (varsa geçer)
  await pool.query(`alter table rule_registry add column if not exists category text`);
  await pool.query(`alter table rule_registry add column if not exists priority text`);
}

// 🔥 AUTO SEED
async function seedIfEmpty() {
  const r = await pool.query(`select count(*) from rule_registry`);
  if (Number(r.rows[0].count) > 0) return;

  await pool.query(`
    insert into rule_registry 
    (name, field, operator, threshold, score, description, category, priority)
    values
    ('payment_stress','debt_to_income','>',1,30,'Borç geliri aşıyor','risk','high'),
    ('high_debt','debt','>',50000,20,'Yüksek borç','risk','high'),
    ('fx_pressure','fx','>',30,10,'Kur baskısı','market','medium')
  `);
}

export default async function handler(req, res) {
  try {
    await ensureTable();
    await seedIfEmpty();

    if (req.method === "GET") {
      const r = await pool.query(`select * from rule_registry order by id asc`);
      return json(res, 200, { ok: true, items: r.rows });
    }

    if (req.method === "POST") {
      const body = typeof req.body === "string"
        ? JSON.parse(req.body || "{}")
        : (req.body || {});

      const r = await pool.query(`
        insert into rule_registry
        (name, field, operator, threshold, score, description, category, priority)
        values ($1,$2,$3,$4,$5,$6,$7,$8)
        on conflict (name) do update set
          field = excluded.field,
          operator = excluded.operator,
          threshold = excluded.threshold,
          score = excluded.score,
          description = excluded.description,
          category = excluded.category,
          priority = excluded.priority
        returning *
      `, [
        body.name,
        body.field,
        body.operator,
        body.threshold,
        body.score,
        body.description,
        body.category,
        body.priority
      ]);

      return json(res, 200, { ok: true, item: r.rows[0] });
    }

    return json(res, 405, { ok: false });

  } catch (e) {
    return json(res, 500, { ok: false, error: String(e.message) });
  }
}

import { getPool } from "../../../lib/neon.js";

function json(res, status, body) {
  res.status(status).json(body);
}

async function ensureTable(db) {
  await db.query(`
    create table if not exists knowledge_base (
      id bigserial primary key,
      category text not null,
      name text not null unique,
      description text,
      logic_type text,
      input_fields text,
      output_fields text,
      priority text,
      active boolean default true,
      created_at timestamptz default now(),
      updated_at timestamptz default now()
    );
  `);
}

export default async function handler(req, res) {
  try {
    const db = getPool();
    await ensureTable(db);

    if (req.method === "GET") {
      const result = await db.query(`
        select * from knowledge_base
        order by category asc, name asc
      `);

      return json(res, 200, {
        ok: true,
        count: result.rows.length,
        items: result.rows
      });
    }

    if (req.method === "POST") {
      const body = typeof req.body === "string"
        ? JSON.parse(req.body || "{}")
        : (req.body || {});

      const result = await db.query(`
        insert into knowledge_base (
          category, name, description, logic_type,
          input_fields, output_fields, priority, active
        )
        values ($1,$2,$3,$4,$5,$6,$7,$8)
        on conflict (name)
        do update set
          description = excluded.description,
          logic_type = excluded.logic_type,
          input_fields = excluded.input_fields,
          output_fields = excluded.output_fields,
          priority = excluded.priority,
          active = excluded.active,
          updated_at = now()
        returning *
      `, [
        body.category,
        body.name,
        body.description,
        body.logic_type,
        body.input_fields,
        body.output_fields,
        body.priority || "medium",
        body.active ?? true
      ]);

      return json(res, 200, {
        ok: true,
        item: result.rows[0]
      });
    }

    return json(res, 405, { ok: false });

  } catch (e) {
    return json(res, 500, {
      ok: false,
      error: String(e.message || e)
    });
  }
}

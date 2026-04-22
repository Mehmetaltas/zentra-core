import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

function json(res, status, body) {
  res.status(status).json(body);
}

async function ensureTable() {
  await pool.query(`
    create table if not exists document_rules (
      id bigserial primary key,
      report_type text,
      document_name text,
      required boolean default true,
      weight numeric default 10,
      notes text
    )
  `);
}

async function seed() {
  await pool.query(`
    insert into document_rules (report_type, document_name, required, weight, notes)
    values
    ('credit','income_proof', true, 20, 'gelir belgesi'),
    ('credit','bank_statement', true, 20, 'banka hareketleri'),
    ('credit','debt_report', true, 25, 'borç dökümü'),
    ('trade','invoice', true, 15, 'fatura'),
    ('trade','bill_of_lading', true, 20, 'konşimento'),
    ('trade','customs_record', false, 10, 'gümrük kaydı'),
    ('general','identity_doc', true, 10, 'kimlik')
    on conflict do nothing
  `);
}

export default async function handler(req, res) {
  try {
    await ensureTable();

    if (req.method === "POST") {
      await seed();
      return json(res, 200, { ok: true, seeded: true });
    }

    if (req.method === "GET") {
      const r = await pool.query(`select * from document_rules`);
      return json(res, 200, { ok: true, items: r.rows });
    }

    return json(res, 405, { ok: false });

  } catch (e) {
    return json(res, 500, { ok: false, error: String(e.message) });
  }
}

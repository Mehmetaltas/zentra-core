import { getPool, ensureSourceRegistryTable } from "../../../lib/neon.js";

function json(res, status, body) {
  res.status(status).json(body);
}

export default async function handler(req, res) {
  try {
    if (!process.env.DATABASE_URL) {
      return json(res, 500, {
        ok: false,
        detail: "Missing DATABASE_URL"
      });
    }

    await ensureSourceRegistryTable();
    const db = getPool();

    if (req.method === "GET") {
      const { category, scope, status, q } = req.query || {};

      const conditions = [];
      const values = [];

      if (category) {
        values.push(String(category).trim());
        conditions.push(`category = $${values.length}`);
      }

      if (scope) {
        values.push(String(scope).trim());
        conditions.push(`scope = $${values.length}`);
      }

      if (status) {
        values.push(String(status).trim());
        conditions.push(`integration_status = $${values.length}`);
      }

      if (q) {
        values.push(`%${String(q).trim()}%`);
        conditions.push(`(name ilike $${values.length} or notes ilike $${values.length})`);
      }

      const whereSql = conditions.length ? `where ${conditions.join(" and ")}` : "";

      const result = await db.query(
        `
        select
          id,
          name,
          category,
          sub_category,
          scope,
          pricing_model,
          source_class,
          access_type,
          update_frequency,
          trust_score,
          freshness_score,
          relevance_scope,
          sensitivity,
          license_type,
          integration_status,
          region,
          notes,
          created_at,
          updated_at
        from source_registry
        ${whereSql}
        order by category asc, name asc
        `,
        values
      );

      return json(res, 200, {
        ok: true,
        count: result.rows.length,
        items: result.rows
      });
    }

    if (req.method === "POST") {
      const body = typeof req.body === "string" ? JSON.parse(req.body || "{}") : (req.body || {});

      const payload = {
        name: String(body.name || "").trim(),
        category: String(body.category || "").trim(),
        sub_category: String(body.sub_category || "").trim(),
        scope: String(body.scope || "").trim(),
        pricing_model: String(body.pricing_model || "").trim(),
        source_class: String(body.source_class || "").trim(),
        access_type: String(body.access_type || "").trim(),
        update_frequency: String(body.update_frequency || "").trim(),
        trust_score: Number.isFinite(Number(body.trust_score)) ? Number(body.trust_score) : 3,
        freshness_score: String(body.freshness_score || "").trim(),
        relevance_scope: String(body.relevance_scope || "").trim(),
        sensitivity: String(body.sensitivity || "public").trim(),
        license_type: String(body.license_type || "").trim(),
        integration_status: String(body.integration_status || "pending").trim(),
        region: String(body.region || "").trim(),
        notes: String(body.notes || "").trim()
      };

      if (!payload.name || !payload.category || !payload.scope || !payload.pricing_model || !payload.source_class || !payload.access_type) {
        return json(res, 400, {
          ok: false,
          detail: "Missing required fields"
        });
      }

      const result = await db.query(
        `
        insert into source_registry (
          name,
          category,
          sub_category,
          scope,
          pricing_model,
          source_class,
          access_type,
          update_frequency,
          trust_score,
          freshness_score,
          relevance_scope,
          sensitivity,
          license_type,
          integration_status,
          region,
          notes
        )
        values (
          $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16
        )
        on conflict (name)
        do update set
          category = excluded.category,
          sub_category = excluded.sub_category,
          scope = excluded.scope,
          pricing_model = excluded.pricing_model,
          source_class = excluded.source_class,
          access_type = excluded.access_type,
          update_frequency = excluded.update_frequency,
          trust_score = excluded.trust_score,
          freshness_score = excluded.freshness_score,
          relevance_scope = excluded.relevance_scope,
          sensitivity = excluded.sensitivity,
          license_type = excluded.license_type,
          integration_status = excluded.integration_status,
          region = excluded.region,
          notes = excluded.notes,
          updated_at = now()
        returning *
        `,
        [
          payload.name,
          payload.category,
          payload.sub_category || null,
          payload.scope,
          payload.pricing_model,
          payload.source_class,
          payload.access_type,
          payload.update_frequency || null,
          payload.trust_score,
          payload.freshness_score || null,
          payload.relevance_scope || null,
          payload.sensitivity || "public",
          payload.license_type || null,
          payload.integration_status || "pending",
          payload.region || null,
          payload.notes || null
        ]
      );

      return json(res, 200, {
        ok: true,
        item: result.rows[0]
      });
    }

    return json(res, 405, {
      ok: false,
      detail: "Method Not Allowed"
    });
  } catch (error) {
    return json(res, 500, {
      ok: false,
      detail: "Source registry request failed",
      error: String(error.message || error)
    });
  }
}

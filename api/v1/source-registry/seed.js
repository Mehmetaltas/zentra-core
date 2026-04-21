import { getPool, ensureSourceRegistryTable } from "../../../lib/neon.js";

function json(res, status, body) {
  res.status(status).json(body);
}

const SEED_SOURCES = [
  {
    name: "IMF",
    category: "official",
    sub_category: "macro",
    scope: "global",
    pricing_model: "free",
    source_class: "official",
    access_type: "file",
    update_frequency: "monthly",
    trust_score: 5,
    freshness_score: "medium",
    relevance_scope: "global_macro",
    sensitivity: "public",
    license_type: "open",
    integration_status: "pending",
    region: "global",
    notes: "ülke risk ve makro bağlam raporları"
  },
  {
    name: "World Bank",
    category: "official",
    sub_category: "macro",
    scope: "global",
    pricing_model: "free",
    source_class: "official",
    access_type: "api",
    update_frequency: "monthly",
    trust_score: 5,
    freshness_score: "medium",
    relevance_scope: "global_macro",
    sensitivity: "public",
    license_type: "open",
    integration_status: "pending",
    region: "global",
    notes: "ekonomik göstergeler ve kalkınma verileri"
  },
  {
    name: "UN Comtrade",
    category: "official",
    sub_category: "trade",
    scope: "global",
    pricing_model: "free",
    source_class: "official",
    access_type: "api",
    update_frequency: "monthly",
    trust_score: 5,
    freshness_score: "medium",
    relevance_scope: "trade_flow",
    sensitivity: "public",
    license_type: "open",
    integration_status: "pending",
    region: "global",
    notes: "ürün ve ülke bazlı ticaret akışları"
  },
  {
    name: "TCMB",
    category: "official",
    sub_category: "macro",
    scope: "local",
    pricing_model: "free",
    source_class: "official",
    access_type: "api",
    update_frequency: "daily",
    trust_score: 5,
    freshness_score: "high",
    relevance_scope: "macro",
    sensitivity: "public",
    license_type: "open",
    integration_status: "pending",
    region: "TR",
    notes: "kur, faiz ve yerel makro bağlam"
  },
  {
    name: "GLEIF",
    category: "entity",
    sub_category: "company_id",
    scope: "global",
    pricing_model: "free",
    source_class: "official",
    access_type: "api",
    update_frequency: "daily",
    trust_score: 5,
    freshness_score: "high",
    relevance_scope: "entity",
    sensitivity: "public",
    license_type: "open",
    integration_status: "pending",
    region: "global",
    notes: "LEI ve tüzel kişi referans verisi"
  },
  {
    name: "FX Feed",
    category: "market",
    sub_category: "forex",
    scope: "global",
    pricing_model: "mixed",
    source_class: "market",
    access_type: "api",
    update_frequency: "realtime",
    trust_score: 4,
    freshness_score: "high",
    relevance_scope: "market",
    sensitivity: "public",
    license_type: "licensed",
    integration_status: "pending",
    region: "global",
    notes: "kur verisi"
  },
  {
    name: "AIS Vessel",
    category: "logistics",
    sub_category: "vessel",
    scope: "global",
    pricing_model: "paid",
    source_class: "commercial",
    access_type: "api",
    update_frequency: "realtime",
    trust_score: 4,
    freshness_score: "high",
    relevance_scope: "shipping",
    sensitivity: "public",
    license_type: "licensed",
    integration_status: "pending",
    region: "global",
    notes: "gemi konum ve rota verisi"
  },
  {
    name: "User Contracts",
    category: "document",
    sub_category: "legal_doc",
    scope: "private",
    pricing_model: "internal",
    source_class: "user",
    access_type: "upload",
    update_frequency: "event",
    trust_score: 5,
    freshness_score: "high",
    relevance_scope: "legal",
    sensitivity: "confidential",
    license_type: "internal",
    integration_status: "active",
    region: "local",
    notes: "kullanıcı sözleşme yüklemeleri"
  },
  {
    name: "User Bank Statements",
    category: "document",
    sub_category: "finance_doc",
    scope: "private",
    pricing_model: "internal",
    source_class: "user",
    access_type: "upload",
    update_frequency: "event",
    trust_score: 5,
    freshness_score: "high",
    relevance_scope: "finance",
    sensitivity: "confidential",
    license_type: "internal",
    integration_status: "active",
    region: "local",
    notes: "kullanıcı banka dökümleri"
  }
];

export default async function handler(req, res) {
  try {
    if (req.method !== "POST") {
      return json(res, 405, { ok: false, detail: "Method Not Allowed" });
    }

    await ensureSourceRegistryTable();
    const db = getPool();

    for (const item of SEED_SOURCES) {
      await db.query(
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
        `,
        [
          item.name,
          item.category,
          item.sub_category,
          item.scope,
          item.pricing_model,
          item.source_class,
          item.access_type,
          item.update_frequency,
          item.trust_score,
          item.freshness_score,
          item.relevance_scope,
          item.sensitivity,
          item.license_type,
          item.integration_status,
          item.region,
          item.notes
        ]
      );
    }

    const result = await db.query(`
      select
        id, name, category, sub_category, scope, pricing_model,
        source_class, access_type, update_frequency, trust_score,
        freshness_score, relevance_scope, sensitivity, license_type,
        integration_status, region, notes
      from source_registry
      order by category asc, name asc
    `);

    return json(res, 200, {
      ok: true,
      seeded: result.rows.length,
      items: result.rows
    });
  } catch (error) {
    return json(res, 500, {
      ok: false,
      detail: "Source registry seed failed",
      error: String(error.message || error)
    });
  }
}

import crypto from "crypto";
import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

function json(res, status, body) {
  res.status(status).json(body);
}

async function ensureProofTable() {
  await pool.query(`
    create table if not exists proof_library (
      id serial primary key,
      created_at timestamptz default now(),
      input jsonb,
      derived jsonb,
      triggered jsonb,
      decision text,
      explain jsonb,
      trace jsonb
    )
  `);
}

async function getRules() {
  const r = await pool.query(`
    select * from rule_registry
    where active = true
    order by id asc
  `);
  return r.rows;
}

function evaluate(operator, value, threshold) {
  if (value === undefined || value === null) return false;

  const v = Number(value);
  const t = Number(threshold);

  if (Number.isNaN(v) || Number.isNaN(t)) return false;

  switch (operator) {
    case ">": return v > t;
    case "<": return v < t;
    case ">=": return v >= t;
    case "<=": return v <= t;
    case "==": return v == t;
    default: return false;
  }
}

function buildExplain(input, decision, derived) {
  const explain = [];

  if (derived.debt_to_income > 10) {
    explain.push(`DTI kritik (${derived.debt_to_income.toFixed(0)}x)`);
  }

  if (derived.payment_load > 0.5) {
    explain.push(`Ödeme yükü yüksek (${(derived.payment_load*100).toFixed(0)}%)`);
  }

  if (derived.limit_ratio > 3) {
    explain.push(`Limit oranı yüksek (${derived.limit_ratio.toFixed(1)}x)`);
  }

  if (decision === "Reddet") explain.push("Reddedildi");
  if (decision === "İncele") explain.push("İnceleme gerekli");
  if (decision === "Onay") explain.push("Uygun");

  return explain;
}

function runEngine(input, rules) {
  let score = 0;
  const triggered = [];
  const categoryScore = {};

  const income = Number(input.income || 0);
  const debt = Number(input.debt || 0);
  const monthlyPayment = Number(input.monthly_payment || 0);
  const totalLimit = Number(input.total_limit || 0);

  const derived = {
    debt_to_income: income > 0 ? debt / income : 0,
    payment_load: income > 0 ? monthlyPayment / income : 0,
    limit_ratio: income > 0 ? totalLimit / income : 0
  };

  for (const rule of rules) {
    let value = rule.field === "debt_to_income"
      ? derived.debt_to_income
      : input[rule.field];

    if (evaluate(rule.operator, value, rule.threshold)) {
      const ruleScore = Number(rule.score) || 0;
      const cat = rule.category || "risk";

      score += ruleScore;

      triggered.push({
        name: rule.name,
        field: rule.field,
        value,
        threshold: rule.threshold,
        score: ruleScore,
        category: cat
      });

      categoryScore[cat] = (categoryScore[cat] || 0) + ruleScore;
    }
  }

  let decision = "Onay";
  if (score > 60) decision = "Reddet";
  else if (score > 30) decision = "İncele";

  if (derived.debt_to_income > 10) decision = "Reddet";
  if (derived.payment_load > 0.5) decision = "Reddet";

  const explain = buildExplain(input, decision, derived);

  const trace = {
    input,
    derived,
    triggered,
    score,
    decision,
    explain
  };

  return {
    score,
    decision,
    explain,
    triggered,
    derived,
    trace
  };
}

export default async function handler(req, res) {
  try {
    await ensureProofTable();

    const body = typeof req.body === "string"
      ? JSON.parse(req.body || "{}")
      : (req.body || {});

    const rules = await getRules();
    const result = runEngine(body, rules);

    const token = crypto.randomBytes(24).toString("hex");
    const link = `https://zentra-core.vercel.app/api/v1/report/view?token=${token}`;

    // 🔥 PROOF LIBRARY INSERT
    await pool.query(
      `insert into proof_library (input, derived, triggered, decision, explain, trace)
       values ($1, $2, $3, $4, $5, $6)`,
      [
        JSON.stringify(result.trace.input || {}),
        JSON.stringify(result.trace.derived || {}),
        JSON.stringify(result.trace.triggered || []),
        result.decision,
        JSON.stringify(result.explain || []),
        JSON.stringify(result.trace || {})
      ]
    );

    const token = crypto.randomBytes(24).toString("hex");

    await pool.query(
      `insert into report_links (token, email, subject, report_text, expires_at)
       values ($1, $2, $3, $4, now() + interval '10 minutes')`,
      [token, body.to, "ZENTRA AI Report", JSON.stringify(result)]
    );

    return json(res, 200, { ok: true, result, link });

  } catch (e) {
    return json(res, 500, { ok: false, error: String(e.message) });
  }
}

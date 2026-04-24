import crypto from "crypto";
import { Pool } from "pg";
import { getLiveContext } from "../../lib/live-data.js";

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
    select *
    from rule_registry
    where active = true
    order by id asc
  `);
  return r.rows;
}

function evaluate(operator, value, threshold) {
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

function getPolicyMode(input) {
  const context = String(input.product_context || input.context || "intel").toLowerCase();

  if (context.includes("general")) return "OFF";
  if (context.includes("academia")) return "EXPERIMENTAL";
  if (context.includes("intel")) return "ON";
  if (context.includes("risklens")) return "ON";
  if (context.includes("financial_trade")) return "ON";
  if (context.includes("trade")) return "CONDITIONAL";
  if (context.includes("economic")) return "CONDITIONAL";

  return "ON";
}

function buildDerived(input) {
  const income = Number(input.income || 0);
  const debt = Number(input.debt || 0);
  const monthlyPayment = Number(input.monthly_payment || 0);
  const totalLimit = Number(input.total_limit || 0);

  return {
    debt_to_income: income > 0 ? debt / income : 0,
    payment_load: income > 0 ? monthlyPayment / income : 0,
    limit_ratio: income > 0 ? totalLimit / income : 0
  };
}

function applyPolicy(input, decision, derived) {
  const mode = getPolicyMode(input);
  const policyHits = [];
  let finalDecision = decision;

  if (mode === "OFF") {
    return { decision: finalDecision, mode, policyHits };
  }

  if (derived.payment_load > 0.5) {
    policyHits.push({
      name: "payment_load_policy",
      rule: "payment_load > 0.5",
      value: derived.payment_load,
      action: "Reddet"
    });
    finalDecision = "Reddet";
  }

  if (derived.limit_ratio > 4) {
    policyHits.push({
      name: "income_multiple_limit_policy",
      rule: "limit_ratio > 4",
      value: derived.limit_ratio,
      action: "Reddet"
    });
    finalDecision = "Reddet";
  }

  return { decision: finalDecision, mode, policyHits };
}

function buildExplain(decision, derived, policyResult) {
  const explain = [];

  if (derived.debt_to_income > 10) {
    explain.push(`DTI kritik (${derived.debt_to_income.toFixed(0)}x)`);
  }

  if (derived.payment_load > 0.5) {
    explain.push(`Ödeme yükü yüksek (${(derived.payment_load * 100).toFixed(0)}%)`);
  }

  if (derived.limit_ratio > 3) {
    explain.push(`Limit oranı yüksek (${derived.limit_ratio.toFixed(1)}x)`);
  }

  if (policyResult.policyHits.length) {
    explain.push(`Policy uygulandı: ${policyResult.policyHits.map(p => p.name).join(", ")}`);
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
  const derived = buildDerived(input);

  for (const rule of rules) {
    const value = rule.field === "debt_to_income"
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

  const policy = applyPolicy(input, decision, derived);
  decision = policy.decision;

  const explain = buildExplain(decision, derived, policy);

  const trace = {
    input,
    derived,
    triggered,
    policy,
    score,
    decision,
    explain
  };

  return {
    score,
    decision,
    explain,
    reasons: explain,
    triggered,
    derived,
    policy,
    categoryScore,
    dominantCategory:
      Object.entries(categoryScore).sort((a, b) => Number(b[1]) - Number(a[1]))[0]?.[0] || "risk",
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
    const liveContext = await getLiveContext();
    const result = runEngine(body, rules);

    result.live_context = liveContext;
    if (result.trace) {
      result.trace.live_context = liveContext;
    }

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
    const link = `https://zentra-core.vercel.app/api/v1/report/view?token=${token}`;

    await pool.query(
      `insert into report_links (token, email, subject, report_text, expires_at)
       values ($1, $2, $3, $4, now() + interval '10 minutes')`,
      [token, body.to || null, "ZENTRA AI Report", JSON.stringify(result)]
    );

    return json(res, 200, { ok: true, result, link });
  } catch (e) {
    return json(res, 500, { ok: false, error: String(e.message) });
  }
}

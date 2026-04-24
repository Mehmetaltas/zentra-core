import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

function json(res, status, body) {
  res.status(status).json(body);
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

function runEngine(input, rules) {
  let score = 0;
  const triggered = [];

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
    const value = rule.field === "debt_to_income" ? derived.debt_to_income : input[rule.field];

    if (evaluate(rule.operator, value, rule.threshold)) {
      const ruleScore = Number(rule.score) || 0;
      score += ruleScore;
      triggered.push({
        name: rule.name,
        field: rule.field,
        value,
        threshold: rule.threshold,
        score: ruleScore,
        category: rule.category || "risk"
      });
    }
  }

  let decision = "Onay";
  if (score > 60) decision = "Reddet";
  else if (score > 30) decision = "İncele";

  if (derived.debt_to_income > 10) decision = "Reddet";
  if (derived.payment_load > 0.5) decision = "Reddet";

  return { input, derived, score, decision, triggered };
}

function scenarios() {
  return [
    { name: "clean", income: 120000, debt: 20000, monthly_payment: 2000, total_limit: 50000 },
    { name: "limit_high", income: 20000, debt: 20000, monthly_payment: 2000, total_limit: 80000 },
    { name: "payment_stress", income: 20000, debt: 20000, monthly_payment: 12000, total_limit: 30000 },
    { name: "extreme", income: 15000, debt: 2000000, monthly_payment: 15000, total_limit: 200000 },
    { name: "zero_income", income: 0, debt: 50000, monthly_payment: 5000, total_limit: 20000 },
    { name: "high_limit_low_debt", income: 20000, debt: 5000, monthly_payment: 500, total_limit: 150000 },
    { name: "micro_income", income: 1000, debt: 20000, monthly_payment: 800, total_limit: 5000 }
  ];
}

export default async function handler(req, res) {
  try {
    const rules = await getRules();
    const results = scenarios().map(s => ({
      name: s.name,
      result: runEngine(s, rules)
    }));

    return json(res, 200, {
      ok: true,
      count: results.length,
      results
    });
  } catch (e) {
    return json(res, 500, { ok: false, error: String(e.message) });
  }
}

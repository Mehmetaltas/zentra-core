import crypto from "crypto";
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
    select *
    from rule_registry
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
    case ">":
      return v > t;
    case "<":
      return v < t;
    case ">=":
      return v >= t;
    case "<=":
      return v <= t;
    case "==":
      return v == t;
    default:
      return false;
  }
}

function buildExplain(input, decision) {
  const income = Number(input.income) || 0;
  const debt = Number(input.debt) || 0;
  const dti = income > 0 ? Math.round(debt / income) : 0;

  const explain = [];

  if (dti > 10) {
    explain.push(`Borç/gelir oranı kritik seviyede (${dti}x)`);
    explain.push("Bu seviyede ödeme sürdürülebilirliği yok");
  }

  if (debt > 1000000) {
    explain.push("Toplam borç kritik eşik üzerinde");
  }

  if (decision === "Reddet") {
    explain.push("Sistem yüksek güvenle reddetti");
  }

  if (decision === "İncele") {
    explain.push("Sistem ek inceleme öneriyor");
  }

  if (decision === "Onay") {
    explain.push("Risk kabul edilebilir seviyede");
  }

  return explain;
}

function buildConfidence(score, decision, explain) {
  let confidence = 50;

  if (score > 60) confidence += 20;
  if (score < 20) confidence += 10;

  if (decision === "Reddet") confidence += 20;
  if (decision === "Onay") confidence += 10;

  if (explain.length >= 3) confidence += 10;

  if (confidence > 95) confidence = 95;

  let level = "Medium";
  if (confidence >= 80) level = "High";
  if (confidence < 60) level = "Low";

  return {
    score: confidence,
    level
  };
}

function runEngine(input, rules) {
  let score = 0;
  const reasons = [];
  const triggered = [];
  const categoryScore = {};

  for (const rule of rules) {
    let value;

    if (rule.field === "debt_to_income") {
      const income = Number(input.income) || 1;
      const debt = Number(input.debt) || 0;
      value = debt / income;
    } else {
      value = input[rule.field];
    }

    if (evaluate(rule.operator, value, rule.threshold)) {
      const ruleScore = Number(rule.score) || 0;
      const cat = rule.category || "other";

      score += ruleScore;

      triggered.push({
        name: rule.name,
        field: rule.field,
        value,
        threshold: rule.threshold,
        score: rule.score,
        category: cat
      });

      if (!categoryScore[cat]) {
        categoryScore[cat] = 0;
      }

      categoryScore[cat] += ruleScore;
    }
  }

  let decision = "Onay";
  if (score > 60) decision = "Reddet";
  else if (score > 30) decision = "İncele";

  const income = Number(input.income) || 0;
  const debt = Number(input.debt) || 0;
  const dti = income > 0 ? debt / income : 0;

  if (dti > 10) decision = "Reddet";
  if (debt > 1000000) decision = "Reddet";

  const explain = buildExplain(input, decision);
  const confidence = buildConfidence(score, decision, explain);

  return {
    score,
    decision,
    explain,
    confidence,
    triggered
  };
}

function buildHTML(link, result) {
  return `
  <html>
    <body style="margin:0;padding:24px;background:#081321;font-family:Arial;color:#eaf1fb;">
      <div style="max-width:680px;margin:0 auto;background:#0d1f3b;border-radius:18px;padding:24px;">

        <h2>ZENTRA AI Report</h2>

        <p><b>Karar:</b> ${result.decision}</p>
        <p><b>Skor:</b> ${result.score}</p>
        <p><b>Confidence:</b> ${result.confidence.level} (${result.confidence.score}%)</p>

        <p><b>Açıklama:</b></p>
        <ul>
          ${result.explain.map(e => `<li>${e}</li>`).join("")}
        </ul>

        <a href="${link}">Raporu Aç</a>

      </div>
    </body>
  </html>
  `;
}

export default async function handler(req, res) {
  try {
    const body = typeof req.body === "string"
      ? JSON.parse(req.body || "{}")
      : (req.body || {});

    const rules = await getRules();
    const result = runEngine(body, rules);

    const token = crypto.randomBytes(24).toString("hex");

    await pool.query(
      `insert into report_links (token, email, subject, report_text, expires_at)
       values ($1, $2, $3, $4, now() + interval '10 minutes')`,
      [token, body.to, "ZENTRA AI Report", JSON.stringify(result)]
    );

    const link = `https://zentra-core.vercel.app/api/v1/report/view?token=${token}`;

    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.RESEND_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        from: process.env.REPORT_FROM_EMAIL,
        to: [body.to],
        subject: "ZENTRA AI Report",
        html: buildHTML(link, result)
      })
    });

    return json(res, 200, { ok: true, result, link });

  } catch (e) {
    return json(res, 500, { ok: false, error: String(e.message) });
  }
}

// ===== ZENTRA SAFE ENRICHMENT (NON-BREAKING) =====
try {
  const body = req && req.body ? req.body : {};
  const income = Number(body.income || 0);
  const debt = Number(body.debt || 0);

  // derived metrics
  const debtToIncome = income > 0 ? (debt / income) : null;
  const bands = {
    dti_band:
      debtToIncome == null ? "unknown" :
      debtToIncome < 1 ? "low" :
      debtToIncome < 3 ? "mid" : "high",
    debt_band:
      debt < 50000 ? "low" :
      debt < 250000 ? "mid" : "high"
  };

  // enrich result (kararı bozmadan)
  if (typeof result !== "undefined" && result) {
    const baseExplain = Array.isArray(result.explain) ? result.explain : [];
    const extraExplain = [];
    if (debtToIncome != null) {
      extraExplain.push(`DTI: ${debtToIncome.toFixed(2)}x (${bands.dti_band})`);
    }
    extraExplain.push(`Debt band: ${bands.debt_band}`);

    result = {
      ...result,
      derived: {
        debt_to_income: debtToIncome,
        bands
      },
      explain: baseExplain.concat(extraExplain)
    };
  }

  // light audit log (ephemeral)
  try {
    const fs = require('fs');
    const rec = {
      ts: new Date().toISOString(),
      endpoint: "send-report",
      input: { income, debt },
      output: result ? {
        decision: result.decision,
        score: result.score,
        confidence: result.confidence
      } : null
    };
    fs.appendFileSync('/tmp/zentra_audit.log', JSON.stringify(rec) + "\n");
  } catch (e) {}

} catch (e) {}
// ===== END SAFE ENRICHMENT =====


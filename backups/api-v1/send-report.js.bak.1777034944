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

function buildMetrics(input) {
  const income = Number(input.income) || 0;
  const debt = Number(input.debt) || 0;
  const monthlyPayment = Number(input.monthly_payment || 0);
  const totalLimit = Number(input.total_limit || 0);

  const dti = income > 0 ? debt / income : 0;
  const paymentLoad = income > 0 ? monthlyPayment / income : 0;
  const limitRatio = income > 0 ? totalLimit / income : 0;

  return {
    income,
    debt,
    monthlyPayment,
    totalLimit,
    dti,
    paymentLoad,
    limitRatio
  };
}

function buildExplain(input, decision) {
  const m = buildMetrics(input);
  const explain = [];

  if (m.dti > 10) {
    explain.push(`Borç/gelir oranı kritik seviyede (${Math.round(m.dti)}x)`);
    explain.push("Bu seviyede ödeme sürdürülebilirliği yok");
  }

  if (m.debt > 1000000) {
    explain.push("Toplam borç kritik eşik üzerinde");
  }

  if (m.monthlyPayment > 0) {
    explain.push(`Aylık ödeme yükü: ${(m.paymentLoad * 100).toFixed(0)}%`);
  }

  if (m.totalLimit > 0) {
    explain.push(`Toplam limit oranı: ${m.limitRatio.toFixed(1)}x`);
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

  return { score: confidence, level };
}

function runEngine(input, rules) {
  let score = 0;
  const triggered = [];
  const categoryScore = {};
  const m = buildMetrics(input);

  for (const rule of rules) {
    let value;

    if (rule.field === "debt_to_income") {
      value = m.dti;
    } else {
      value = input[rule.field];
    }

    if (evaluate(rule.operator, value, rule.threshold)) {
      const ruleScore = Number(rule.score) || 0;
      const cat = rule.category || "risk";

      score += ruleScore;

      triggered.push({
        name: rule.name,
        field: rule.field,
        value,
        threshold: rule.threshold,
        score: rule.score,
        category: cat
      });

      categoryScore[cat] = (categoryScore[cat] || 0) + ruleScore;
    }
  }

  let decision = "Onay";
  if (score > 60) decision = "Reddet";
  else if (score > 30) decision = "İncele";

  if (m.paymentLoad > 0.5) decision = "Reddet";
  else if (m.paymentLoad > 0.3 && decision === "Onay") decision = "İncele";

  if (m.limitRatio > 3 && decision === "Onay") decision = "İncele";

  if (m.dti > 10) decision = "Reddet";
  if (m.debt > 1000000) decision = "Reddet";

  const explain = buildExplain(input, decision);
  const confidence = buildConfidence(score, decision, explain);

  const dominantCategory =
    Object.entries(categoryScore).sort((a, b) => Number(b[1]) - Number(a[1]))[0]?.[0] || "risk";

  return {
    score,
    decision,
    explain,
    reasons: explain,
    confidence,
    triggered,
    dominantCategory,
    categoryScore,
    derived: {
      debt_to_income: m.dti,
      payment_load: m.paymentLoad,
      limit_ratio: m.limitRatio,
      debt_band: m.debt > 1000000 ? "critical" : m.debt > 250000 ? "high" : m.debt > 50000 ? "medium" : "low",
      dti_band: m.dti > 10 ? "critical" : m.dti > 3 ? "high" : m.dti > 1 ? "medium" : "low",
      payment_load_band: m.paymentLoad > 0.5 ? "critical" : m.paymentLoad > 0.3 ? "review" : "normal",
      limit_band: m.limitRatio > 3 ? "high" : m.limitRatio >= 2 ? "watch" : "normal"
    }
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
        <ul>${result.explain.map(e => `<li>${e}</li>`).join("")}</ul>
        <a href="${link}">Raporu Aç</a>
      </div>
    </body>
  </html>`;
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

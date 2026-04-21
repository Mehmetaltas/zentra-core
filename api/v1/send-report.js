import crypto from "crypto";
import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

function json(res, status, body) {
  res.status(status).json(body);
}

// 🔥 RULE ÇEK
async function getRules() {
  const r = await pool.query(`
    select * from rule_registry where active = true
  `);
  return r.rows;
}

// 🔥 OPERATOR
function evaluate(operator, value, threshold) {
  if (value === undefined || value === null) return false;

  const v = Number(value);
  const t = Number(threshold);

  switch (operator) {
    case ">": return v > t;
    case "<": return v < t;
    case ">=": return v >= t;
    case "<=": return v <= t;
    case "==": return v == t;
    default: return false;
  }
}

// 🔥 ENGINE
function runEngine(input, rules) {
  let score = 0;
  const reasons = [];
  const triggered = [];

  for (const rule of rules) {
    let value;

    // özel field mapping
    if (rule.field === "debt_to_income") {
      const income = Number(input.income) || 1;
      const debt = Number(input.debt) || 0;
      value = debt / income;
    } else {
      value = input[rule.field];
    }

    if (evaluate(rule.operator, value, rule.threshold)) {
      score += Number(rule.score) || 0;
      reasons.push(rule.description);
      triggered.push({
        name: rule.name,
        field: rule.field,
        value,
        threshold: rule.threshold,
        score: rule.score
      });
    }
  }

  let decision = "Onay";
  if (score > 60) decision = "Reddet";
  else if (score > 30) decision = "İncele";

  return { score, decision, reasons, triggered };
}

function buildHTML(link, result) {
  return `
  <html>
    <body style="font-family:Arial;background:#081321;color:white;padding:24px">
      <h2>ZENTRA AI Report</h2>
      <p><b>Karar:</b> ${result.decision}</p>
      <p><b>Skor:</b> ${result.score}</p>
      <p><b>Gerekçeler:</b></p>
      <ul>
        ${result.reasons.map(r => `<li>${r}</li>`).join("")}
      </ul>
      <p><b>Tetiklenen Kurallar:</b></p>
      <ul>
        ${result.triggered.map(t => `<li>${t.name} (${t.value})</li>`).join("")}
      </ul>
      <a href="${link}">Raporu Aç</a>
    </body>
  </html>
  `;
}

export default async function handler(req, res) {
  try {
    if (req.method !== "POST") {
      return json(res, 405, { ok: false });
    }

    const body = typeof req.body === "string"
      ? JSON.parse(req.body)
      : req.body;

    const rules = await getRules();

    const result = runEngine(body, rules);

    const token = crypto.randomBytes(24).toString("hex");

    await pool.query(`
      insert into report_links (token, email, subject, report_text, expires_at)
      values ($1,$2,$3,$4, now() + interval '10 minutes')
    `, [
      token,
      body.to,
      "ZENTRA AI Report",
      JSON.stringify(result)
    ]);

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

    return json(res, 200, {
      ok: true,
      result,
      link
    });

  } catch (e) {
    return json(res, 500, {
      ok: false,
      error: String(e.message)
    });
  }
}

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
      const priority = rule.priority || null;

      score += ruleScore;
      reasons.push(rule.description);

      triggered.push({
        name: rule.name,
        field: rule.field,
        value,
        threshold: rule.threshold,
        score: rule.score,
        category: cat,
        priority
      });

      if (!categoryScore[cat]) {
        categoryScore[cat] = 0;
      }

      categoryScore[cat] += ruleScore;
    }
  }

  let dominantCategory = null;
  let maxCategoryScore = 0;

  for (const cat in categoryScore) {
    if (categoryScore[cat] > maxCategoryScore) {
      maxCategoryScore = categoryScore[cat];
      dominantCategory = cat;
    }
  }

  let decision = "Onay";
  if (score > 60) {
    decision = "Reddet";
  } else if (score > 30) {
    decision = "İncele";
  }

  // HARD DECISION
  const income = Number(input.income) || 0;
  const debt = Number(input.debt) || 0;
  const dti = income > 0 ? debt / income : 0;

  if (dti > 10) {
    decision = "Reddet";
  }

  if (debt > 1000000) {
    decision = "Reddet";
  }

  const explain = buildExplain(input, decision);

  return {
    score,
    decision,
    reasons,
    triggered,
    dominantCategory,
    categoryScore,
    explain
  };
}

function buildHTML(link, result) {
  const dominant = result.dominantCategory || "other";

  return `
  <html>
    <body style="margin:0;padding:24px;background:#081321;font-family:Arial,Helvetica,sans-serif;color:#eaf1fb;">
      <div style="max-width:680px;margin:0 auto;background:#0d1f3b;border:1px solid #1d3557;border-radius:18px;overflow:hidden;">
        <div style="padding:24px;border-bottom:1px solid #18304d;">
          <div style="font-size:13px;color:#7ea6ff;font-weight:700;">
            ZENTRA Matrix Ecosystem
          </div>
          <div style="margin-top:10px;font-size:28px;font-weight:800;">
            ZENTRA AI Report
          </div>
        </div>

        <div style="padding:24px;">
          <p><b>Karar:</b> ${result.decision}</p>
          <p><b>Skor:</b> ${result.score}</p>

          <p><b>Açıklama:</b></p>
          <ul>
            ${result.explain.map((e) => `<li>${e}</li>`).join("")}
          </ul>

          <p><b>Tetiklenen Kurallar:</b></p>
          <ul>
            ${result.triggered.map((t) => `<li>${t.name}</li>`).join("")}
          </ul>

          <p style="margin-top:20px;">
            <a href="${link}" style="background:#2d6cff;padding:10px 16px;color:#fff;border-radius:8px;text-decoration:none;">
              Raporu Aç
            </a>
          </p>
        </div>
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

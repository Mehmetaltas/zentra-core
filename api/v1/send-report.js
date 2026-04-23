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

async function getDocumentRules(reportType) {
  if (!reportType) return [];

  const r = await pool.query(
    `
    select *
    from document_rules
    where lower(report_type) = lower($1)
    order by id asc
    `,
    [String(reportType).trim()]
  );

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

  return {
    score,
    decision,
    reasons,
    triggered,
    dominantCategory,
    categoryScore
  };
}

function runDocumentIntelligence(reportType, providedDocuments, rules) {
  if (!reportType || !Array.isArray(rules) || rules.length === 0) {
    return null;
  }

  const provided = Array.isArray(providedDocuments)
    ? providedDocuments.map((d) => String(d).toLowerCase())
    : [];

  let totalWeight = 0;
  let obtainedWeight = 0;

  const missing = [];
  const present = [];

  for (const rule of rules) {
    const documentName = String(rule.document_name || "").trim();
    const weight = Number(rule.weight || 0);
    const required = rule.required === true || String(rule.required) === "true";

    totalWeight += weight;

    if (provided.includes(documentName.toLowerCase())) {
      obtainedWeight += weight;
      present.push(documentName);
    } else {
      missing.push({
        name: documentName,
        weight,
        required,
        notes: rule.notes || null
      });
    }
  }

  const score = totalWeight > 0
    ? Math.round((obtainedWeight / totalWeight) * 100)
    : 100;

  return {
    report_type: reportType,
    score,
    present,
    missing,
    total_required: rules.length,
    provided_count: present.length
  };
}

function buildDocumentBlock(documentIntelligence) {
  if (!documentIntelligence) return "";

  return `
    <div style="margin-top:24px;padding-top:18px;border-top:1px solid #18304d;">
      <p><b>Belge Uyum Skoru:</b> ${documentIntelligence.score}</p>
      <p><b>Rapor Türü:</b> ${documentIntelligence.report_type}</p>
      <p><b>Mevcut Belgeler:</b></p>
      <ul>
        ${
          documentIntelligence.present.length > 0
            ? documentIntelligence.present.map((d) => `<li>${d}</li>`).join("")
            : "<li>Belge bilgisi girilmedi</li>"
        }
      </ul>

      <p><b>Eksik Belgeler:</b></p>
      <ul>
        ${
          documentIntelligence.missing.length > 0
            ? documentIntelligence.missing.map((m) => {
                const note = m.notes ? ` — ${m.notes}` : "";
                return `<li>${m.name} (weight: ${m.weight}, required: ${m.required})${note}</li>`;
              }).join("")
            : "<li>Eksik belge yok</li>"
        }
      </ul>
    </div>
  `;
}

function buildHTML(link, result) {
  const dominant = result.dominantCategory || "other";
  const documentBlock = buildDocumentBlock(result.document_intelligence);

  return `
  <html>
    <body style="margin:0;padding:24px;background:#081321;font-family:Arial,Helvetica,sans-serif;color:#eaf1fb;">
      <div style="max-width:680px;margin:0 auto;background:#0d1f3b;border:1px solid #1d3557;border-radius:18px;overflow:hidden;">
        <div style="padding:24px;border-bottom:1px solid #18304d;">
          <div style="font-size:13px;letter-spacing:.08em;text-transform:uppercase;color:#7ea6ff;font-weight:700;">
            ZENTRA Matrix Ecosystem
          </div>
          <div style="margin-top:10px;font-size:28px;font-weight:800;color:#ffffff;">
            ZENTRA AI Report
          </div>
        </div>

        <div style="padding:24px;">
          <p><b>Karar:</b> ${result.decision}</p>
          <p><b>Skor:</b> ${result.score}</p>
          <p><b>Baskın Risk Türü:</b> ${dominant}</p>

          <p><b>Gerekçeler:</b></p>
          <ul>
            ${result.reasons.map((r) => `<li>${r}</li>`).join("")}
          </ul>

          <p><b>Tetiklenen Kurallar:</b></p>
          <ul>
            ${result.triggered.map((t) => `<li>${t.name} (${t.field}: ${t.value})</li>`).join("")}
          </ul>

          ${documentBlock}

          <p style="margin-top:20px;">
            <a href="${link}" style="display:inline-block;padding:12px 20px;background:#2d6cff;color:#fff;border-radius:10px;text-decoration:none;font-weight:700;">
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
    if (req.method !== "POST") {
      return json(res, 405, {
        ok: false,
        detail: "Method Not Allowed"
      });
    }

    const body = typeof req.body === "string"
      ? JSON.parse(req.body || "{}")
      : (req.body || {});

    if (!body.to) {
      return json(res, 400, {
        ok: false,
        detail: "Missing recipient email"
      });
    }

    const rules = await getRules();
    const result = runEngine(body, rules);

    let documentIntelligence = null;
    if (body.report_type) {
      const documentRules = await getDocumentRules(body.report_type);
      documentIntelligence = runDocumentIntelligence(
        body.report_type,
        body.provided_documents,
        documentRules
      );
    }

    const finalResult = {
      ...result,
      document_intelligence: documentIntelligence
    };

    const token = crypto.randomBytes(24).toString("hex");

    await pool.query(
      `
      insert into report_links (token, email, subject, report_text, expires_at)
      values ($1, $2, $3, $4, now() + interval '10 minutes')
      `,
      [
        token,
        String(body.to).trim(),
        "ZENTRA AI Report",
        JSON.stringify(finalResult)
      ]
    );

    const link = `https://zentra-core.vercel.app/api/v1/report/view?token=${token}`;

    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.RESEND_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        from: process.env.REPORT_FROM_EMAIL,
        to: [String(body.to).trim()],
        subject: "ZENTRA AI Report",
        html: buildHTML(link, finalResult),
        text: `Rapor bağlantınız hazır: ${link}`
      })
    });

    const data = await response.json();

    if (!response.ok) {
      return json(res, response.status, {
        ok: false,
        detail: "Resend request failed",
        resend: data
      });
    }

    return json(res, 200, {
      ok: true,
      result: finalResult,
      link
    });
  } catch (e) {
    return json(res, 500, {
      ok: false,
      error: String(e && e.message ? e.message : e)
    });
  }
}

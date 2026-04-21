import crypto from "crypto";
import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

function json(res, status, body) {
  res.status(status).json(body);
}

async function getKnowledge() {
  const result = await pool.query(`
    select * from knowledge_base
    where active = true
    order by category asc, name asc
  `);
  return result.rows;
}

function runEngine(input, knowledge) {
  let score = 0;
  const reasons = [];

  for (const k of knowledge) {
    if (k.name === "payment_stress") {
      if ((Number(input.debt) || 0) > (Number(input.income) || 1)) {
        score += 30;
        reasons.push("Borç geliri aşıyor");
      }
    }

    if (k.name === "debt_pressure") {
      if ((Number(input.debt) || 0) > 50000) {
        score += 20;
        reasons.push("Yüksek borç baskısı");
      }
    }

    if (k.name === "fx_pressure") {
      if ((Number(input.fx) || 0) > 30) {
        score += 10;
        reasons.push("Kur baskısı yüksek");
      }
    }

    if (k.name === "country_risk") {
      if (String(input.country || "").trim().toLowerCase() === "high-risk") {
        score += 25;
        reasons.push("Yüksek ülke riski");
      }
    }

    if (k.name === "shipment_delay") {
      if ((Number(input.delay_days) || 0) > 7) {
        score += 15;
        reasons.push("Shipment gecikmesi");
      }
    }
  }

  let decision = "Onay";
  if (score > 60) decision = "Reddet";
  else if (score > 30) decision = "İncele";

  return {
    score,
    decision,
    reasons
  };
}

function buildHTML(link, result) {
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
          <p><b>Gerekçeler:</b></p>
          <ul>
            ${result.reasons.map((r) => `<li>${r}</li>`).join("")}
          </ul>
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
      return json(res, 405, { ok: false, detail: "Method Not Allowed" });
    }

    const body = typeof req.body === "string"
      ? JSON.parse(req.body || "{}")
      : (req.body || {});

    if (!body.to) {
      return json(res, 400, { ok: false, detail: "Missing recipient email" });
    }

    const knowledge = await getKnowledge();
    const result = runEngine(body, knowledge);

    const token = crypto.randomBytes(24).toString("hex");

    await pool.query(
      `
      insert into report_links (token, email, subject, report_text, expires_at)
      values ($1, $2, $3, $4, now() + interval '10 minutes')
      `,
      [
        token,
        String(body.to || "").trim(),
        "ZENTRA AI Report",
        JSON.stringify(result)
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
        html: buildHTML(link, result),
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
      result,
      link
    });
  } catch (e) {
    return json(res, 500, {
      ok: false,
      error: String(e && e.message ? e.message : e)
    });
  }
}

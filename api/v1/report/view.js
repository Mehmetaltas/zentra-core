import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

function escapeHtml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function normalizeReportText(raw) {
  if (raw == null) return {};

  if (typeof raw === "object") return raw;

  const text = String(raw).trim();

  try {
    return JSON.parse(text);
  } catch {}

  try {
    const cleaned = text
      .replace(/^"+|"+$/g, "")
      .replace(/\\"/g, '"');
    return JSON.parse(cleaned);
  } catch {}

  return { raw_text: text };
}

export default async function handler(req, res) {
  try {
    const { token } = req.query || {};

    if (!token) {
      return res.status(400).send("Eksik token");
    }

    const result = await pool.query(
      `
      select id, email, subject, report_text, created_at, expires_at, consumed_at
      from report_links
      where token = $1
      limit 1
      `,
      [token]
    );

    if (!result.rows.length) {
      return res.status(404).send("Geçersiz link");
    }

    const report = result.rows[0];

    if (report.consumed_at) {
      return res.status(403).send("Bu link daha önce kullanıldı");
    }

    if (new Date(report.expires_at).getTime() < Date.now()) {
      return res.status(403).send("Link süresi doldu");
    }

    const data = normalizeReportText(report.report_text);

    await pool.query(
      `update report_links set consumed_at = now() where id = $1`,
      [report.id]
    );

    const decision = String(data.decision || "Bilinmiyor");
    const score = data.score ?? "-";
    const reasons = Array.isArray(data.reasons) ? data.reasons : [];
    const rawText = data.raw_text ? String(data.raw_text) : "";

    const decisionColor =
      decision === "Reddet"
        ? "#ff5a5f"
        : decision === "İncele"
        ? "#f5b942"
        : decision === "Onay"
        ? "#4cd47a"
        : "#9bb0d1";

    res.setHeader("Content-Type", "text/html; charset=utf-8");

    return res.status(200).send(`
<!DOCTYPE html>
<html lang="tr">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escapeHtml(report.subject || "ZENTRA Raporu")}</title>
  <style>
    * { box-sizing: border-box; }
    body {
      margin: 0;
      padding: 18px;
      background: #07152b;
      color: #ffffff;
      font-family: Arial, sans-serif;
    }
    .wrap {
      width: 100%;
      max-width: 760px;
      margin: 0 auto;
      background: #0d1d3a;
      border: 1px solid #223a63;
      border-radius: 18px;
      padding: 20px;
      overflow: hidden;
    }
    .brand {
      color: #7da0ff;
      font-size: 12px;
      font-weight: 700;
      letter-spacing: .08em;
      text-transform: uppercase;
      margin-bottom: 10px;
    }
    .title {
      font-size: 30px;
      font-weight: 800;
      line-height: 1.15;
      margin: 0;
    }
    .meta {
      margin-top: 10px;
      color: #9bb0d1;
      font-size: 13px;
      line-height: 1.6;
      word-break: break-word;
      overflow-wrap: anywhere;
    }
    .card {
      margin-top: 20px;
      padding: 18px;
      background: #102549;
      border: 1px solid #213f6a;
      border-radius: 14px;
    }
    .decision {
      font-size: 22px;
      font-weight: 800;
      color: ${decisionColor};
      word-break: break-word;
      overflow-wrap: anywhere;
    }
    .score {
      margin-top: 8px;
      font-size: 28px;
      font-weight: 800;
      color: #ffffff;
    }
    .section-title {
      margin-top: 18px;
      margin-bottom: 10px;
      font-size: 14px;
      font-weight: 700;
      color: #9bb0d1;
      text-transform: uppercase;
      letter-spacing: .06em;
    }
    ul {
      margin: 0;
      padding-left: 20px;
    }
    li {
      margin-bottom: 8px;
      line-height: 1.6;
      word-break: break-word;
      overflow-wrap: anywhere;
    }
    .raw {
      margin-top: 18px;
      padding: 14px;
      background: #0b1a33;
      border: 1px solid #1e365b;
      border-radius: 12px;
      white-space: pre-wrap;
      word-break: break-word;
      overflow-wrap: anywhere;
      line-height: 1.7;
      font-size: 14px;
      color: #e4ecfa;
    }
    .footer {
      margin-top: 18px;
      padding-top: 14px;
      border-top: 1px solid #223a63;
      font-size: 12px;
      color: #7f96b6;
      line-height: 1.6;
      word-break: break-word;
      overflow-wrap: anywhere;
    }
  </style>
</head>
<body>
  <div class="wrap">
    <div class="brand">ZENTRA Matrix Ecosystem</div>
    <h1 class="title">ZENTRA Raporu</h1>

    <div class="meta">
      Alıcı: ${escapeHtml(report.email || "-")}<br>
      Oluşturulma: ${escapeHtml(report.created_at || "-")}
    </div>

    <div class="card">
      <div class="decision">Karar: ${escapeHtml(decision)}</div>
      <div class="score">Skor: ${escapeHtml(score)}</div>

      ${
        reasons.length
          ? `
          <div class="section-title">Gerekçeler</div>
          <ul>
            ${reasons.map((r) => `<li>${escapeHtml(r)}</li>`).join("")}
          </ul>
          `
          : ""
      }

      ${
        rawText
          ? `
          <div class="section-title">Rapor Metni</div>
          <div class="raw">${escapeHtml(rawText)}</div>
          `
          : ""
      }
    </div>

    <div class="footer">
      ZENTRA Matrix Ecosystem • Controlled Report Delivery
    </div>
  </div>
</body>
</html>
`);
  } catch (e) {
    return res.status(500).send("Sunucu hatası");
  }
}

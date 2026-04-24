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

function parseReportText(raw) {
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

function getDecisionColors(decision) {
  const normalized = String(decision || "").toLowerCase();

  if (normalized.includes("reddet")) {
    return {
      accent: "#ff5a5f",
      soft: "#3b1619",
      border: "#6b2328"
    };
  }

  if (normalized.includes("incele")) {
    return {
      accent: "#f5b942",
      soft: "#3b2b12",
      border: "#6b5321"
    };
  }

  return {
    accent: "#4cd47a",
    soft: "#123524",
    border: "#24573d"
  };
}

function titleCaseRisk(value) {
  const v = String(value || "").trim();
  if (!v) return "-";
  return v.charAt(0).toUpperCase() + v.slice(1);
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

    const data = parseReportText(report.report_text);

    await pool.query(
      `update report_links set consumed_at = now() where id = $1`,
      [report.id]
    );

    const decision = String(data.decision || "Bilinmiyor");
    const score = data.score ?? "-";
    const reasons = Array.isArray(data.reasons)
  ? data.reasons
  : (Array.isArray(data.explain) ? data.explain : []);
    const triggered = Array.isArray(data.triggered) ? data.triggered : [];
    const dominantCategory = titleCaseRisk(
  data.dominantCategory ||
  (data.triggered && data.triggered[0] && data.triggered[0].category) ||
  "risk"
);
    const categoryScore = (data.categoryScore && typeof data.categoryScore === "object")
  ? data.categoryScore
  : (data.triggered
      ? data.triggered.reduce((acc, t) => {
          const k = t.category || "risk";
          acc[k] = (acc[k] || 0) + Number(t.score || 0);
          return acc;
        }, {})
      : {})
      ? data.categoryScore
      : {};
    const rawText = data.raw_text ? String(data.raw_text) : "";

    const colors = getDecisionColors(decision);

    const categoryEntries = Object.entries(categoryScore);
    const categoryHtml = categoryEntries.length
      ? categoryEntries.map(([key, value]) => {
          return `
            <div class="mini-card">
              <div class="mini-label">${escapeHtml(titleCaseRisk(key))}</div>
              <div class="mini-value">${escapeHtml(value)}</div>
            </div>
          `;
        }).join("")
      : `
        <div class="mini-card">
          <div class="mini-label">Kategori</div>
          <div class="mini-value">-</div>
        </div>
      `;

    const reasonsHtml = reasons.length
      ? reasons.map((item) => `<li>${escapeHtml(item)}</li>`).join("")
      : `<li>Ek gerekçe bulunmuyor.</li>`;

    const triggeredHtml = triggered.length
      ? triggered.map((item) => {
          return `
            <div class="trigger-card">
              <div class="trigger-top">
                <div class="trigger-name">${escapeHtml(item.name || "-")}</div>
                <div class="trigger-chip">${escapeHtml(titleCaseRisk(item.category || "other"))}</div>
              </div>
              <div class="trigger-meta">
                <div><b>Alan:</b> ${escapeHtml(item.field || "-")}</div>
                <div><b>Değer:</b> ${escapeHtml(item.value)}</div>
                <div><b>Eşik:</b> ${escapeHtml(item.threshold)}</div>
                <div><b>Etki:</b> ${escapeHtml(item.score)}</div>
                ${item.priority ? `<div><b>Öncelik:</b> ${escapeHtml(item.priority)}</div>` : ""}
              </div>
            </div>
          `;
        }).join("")
      : `
        <div class="empty-box">Tetiklenen kural bulunmuyor.</div>
      `;

    const rawSection = rawText
      ? `
        <div class="section">
          <div class="section-title">Ham Rapor Metni</div>
          <div class="raw-box">${escapeHtml(rawText)}</div>
        </div>
      `
      : "";

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
      background:
        radial-gradient(circle at top left, rgba(60, 120, 255, 0.15), transparent 28%),
        radial-gradient(circle at bottom right, rgba(0, 200, 160, 0.10), transparent 24%),
        #071321;
      color: #ffffff;
      font-family: Arial, sans-serif;
    }

    .shell {
      width: 100%;
      max-width: 860px;
      margin: 0 auto;
    }

    .report {
      background: linear-gradient(180deg, #0c1d39 0%, #0a1730 100%);
      border: 1px solid #1e3659;
      border-radius: 22px;
      overflow: hidden;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.30);
    }

    .hero {
      padding: 24px 20px 18px 20px;
      border-bottom: 1px solid #18304d;
      background:
        linear-gradient(135deg, rgba(77, 124, 255, 0.12), rgba(77, 124, 255, 0.02)),
        transparent;
    }

    .brand {
      color: #88a8ff;
      font-size: 12px;
      font-weight: 700;
      letter-spacing: .10em;
      text-transform: uppercase;
      margin-bottom: 10px;
    }

    .title {
      margin: 0;
      font-size: 30px;
      line-height: 1.12;
      font-weight: 800;
      color: #ffffff;
    }

    .subtitle {
      margin-top: 8px;
      color: #9eb5d6;
      font-size: 14px;
      line-height: 1.6;
    }

    .meta {
      margin-top: 14px;
      color: #9eb5d6;
      font-size: 13px;
      line-height: 1.8;
      word-break: break-word;
      overflow-wrap: anywhere;
    }

    .content {
      padding: 18px;
    }

    .decision-banner {
      display: flex;
      flex-wrap: wrap;
      gap: 12px;
      align-items: center;
      justify-content: space-between;
      padding: 16px;
      border: 1px solid ${colors.border};
      background: ${colors.soft};
      border-radius: 16px;
    }

    .decision-left {
      min-width: 0;
    }

    .decision-label {
      font-size: 12px;
      color: #a8bdd9;
      text-transform: uppercase;
      letter-spacing: .08em;
      margin-bottom: 6px;
    }

    .decision-value {
      font-size: 28px;
      font-weight: 800;
      color: ${colors.accent};
      line-height: 1.15;
      word-break: break-word;
    }

    .decision-risk {
      margin-top: 8px;
      color: #dce7f7;
      font-size: 14px;
      line-height: 1.5;
    }

    .decision-risk b {
      color: #ffffff;
    }

    .score-badge {
      min-width: 140px;
      padding: 14px 16px;
      border-radius: 14px;
      background: rgba(255,255,255,0.05);
      border: 1px solid rgba(255,255,255,0.08);
      text-align: center;
    }

    .score-badge .label {
      font-size: 12px;
      color: #a8bdd9;
      text-transform: uppercase;
      letter-spacing: .08em;
    }

    .score-badge .value {
      margin-top: 6px;
      font-size: 34px;
      font-weight: 800;
      color: #ffffff;
      line-height: 1.1;
    }

    .grid {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 14px;
      margin-top: 16px;
    }

    .card {
      background: #0e2141;
      border: 1px solid #1b385f;
      border-radius: 16px;
      padding: 16px;
      min-width: 0;
    }

    .card-title {
      margin: 0 0 12px 0;
      font-size: 13px;
      color: #97b0d3;
      text-transform: uppercase;
      letter-spacing: .08em;
      font-weight: 700;
    }

    .list {
      margin: 0;
      padding-left: 20px;
    }

    .list li {
      margin-bottom: 8px;
      line-height: 1.65;
      word-break: break-word;
      overflow-wrap: anywhere;
      color: #edf3fd;
    }

    .mini-grid {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 10px;
    }

    .mini-card {
      background: #0b1a33;
      border: 1px solid #1c3253;
      border-radius: 12px;
      padding: 12px;
      min-width: 0;
    }

    .mini-label {
      color: #91abcf;
      font-size: 12px;
      text-transform: uppercase;
      letter-spacing: .08em;
      margin-bottom: 6px;
    }

    .mini-value {
      color: #ffffff;
      font-size: 20px;
      font-weight: 800;
      line-height: 1.15;
      word-break: break-word;
    }

    .section {
      margin-top: 16px;
      background: #0e2141;
      border: 1px solid #1b385f;
      border-radius: 16px;
      padding: 16px;
    }

    .section-title {
      margin: 0 0 12px 0;
      font-size: 13px;
      color: #97b0d3;
      text-transform: uppercase;
      letter-spacing: .08em;
      font-weight: 700;
    }

    .trigger-stack {
      display: grid;
      gap: 12px;
    }

    .trigger-card {
      background: #0b1a33;
      border: 1px solid #1c3253;
      border-radius: 14px;
      padding: 14px;
      min-width: 0;
    }

    .trigger-top {
      display: flex;
      gap: 10px;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 10px;
    }

    .trigger-name {
      font-size: 16px;
      font-weight: 700;
      color: #ffffff;
      word-break: break-word;
    }

    .trigger-chip {
      background: #17345b;
      border: 1px solid #264b7b;
      color: #b7cdf1;
      font-size: 12px;
      padding: 6px 10px;
      border-radius: 999px;
      white-space: nowrap;
    }

    .trigger-meta {
      color: #cfe0f7;
      font-size: 14px;
      line-height: 1.75;
      word-break: break-word;
      overflow-wrap: anywhere;
    }

    .trigger-meta div {
      margin-bottom: 6px;
    }

    .raw-box {
      background: #0b1a33;
      border: 1px solid #1c3253;
      border-radius: 12px;
      padding: 14px;
      white-space: pre-wrap;
      word-break: break-word;
      overflow-wrap: anywhere;
      line-height: 1.7;
      font-size: 14px;
      color: #e4ecfa;
    }

    .empty-box {
      background: #0b1a33;
      border: 1px dashed #2b466d;
      border-radius: 12px;
      padding: 16px;
      color: #a7bddb;
      font-size: 14px;
      line-height: 1.6;
    }

    .footer {
      padding: 16px 18px 20px 18px;
      border-top: 1px solid #18304d;
      color: #7f96b6;
      font-size: 12px;
      line-height: 1.7;
      word-break: break-word;
      overflow-wrap: anywhere;
    }

    @media (max-width: 720px) {
      .title {
        font-size: 24px;
      }

      .decision-value {
        font-size: 24px;
      }

      .score-badge {
        width: 100%;
      }

      .grid,
      .mini-grid {
        grid-template-columns: 1fr;
      }

      .trigger-top {
        flex-direction: column;
      }

      .trigger-chip {
        white-space: normal;
      }
    }
  </style>
</head>
<body>
  <div class="shell">
    <div class="report">
      <div class="hero">
        <div class="brand">ZENTRA Matrix Ecosystem</div>
        <h1 class="title">ZENTRA AI Report</h1>
        <div class="subtitle">Controlled intelligence delivery • Tek kullanımlık güvenli görüntüleme</div>
        <div class="meta">
          Alıcı: ${escapeHtml(report.email || "-")}<br><br>
          Oluşturulma: ${escapeHtml(report.created_at || "-")}
        </div>
      </div>

      <div class="content">
        <div class="decision-banner">
          <div class="decision-left">
            <div class="decision-label">Karar Özeti</div>
            <div class="decision-value">${escapeHtml(decision)}</div>
            <div class="decision-risk">Baskın Risk Türü: <b>${escapeHtml(dominantCategory)}</b></div>
          </div>
          <div class="score-badge">
            <div class="label">Toplam Skor</div>
            <div class="value">${escapeHtml(score)}</div>
          </div>
        </div>

        <div class="grid">
          <div class="card">
            <div class="card-title">Gerekçeler</div>
            <ul class="list">
              ${reasonsHtml}
            </ul>
          </div>

          <div class="card">
            <div class="card-title">Risk Dağılımı</div>
            <div class="mini-grid">
              ${categoryHtml}
            </div>
          </div>
        </div>

        <div class="section">
          <div class="section-title">Tetiklenen Kurallar</div>
          <div class="trigger-stack">
            ${triggeredHtml}
          </div>
        </div>

        ${rawSection}
      </div>

      <div class="footer">
        ZENTRA Matrix Ecosystem • Controlled Report Delivery<br>
        Bu rapor tek kullanımlık güvenli bağlantı ile sunulmuştur.
      </div>
    </div>
  </div>
</body>
</html>
`);
  } catch (e) {
    return res.status(500).send("Sunucu hatası");
  }
}

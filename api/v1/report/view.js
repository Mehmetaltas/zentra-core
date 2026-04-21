import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

function escapeHtml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

export default async function handler(req, res) {
  try {
    const { token } = req.query || {};

    if (!token) {
      return res.status(400).send("Eksik token");
    }

    const result = await pool.query(
      `
      select id, token, email, subject, report_text, created_at, expires_at, consumed_at
      from report_links
      where token = $1
      limit 1
      `,
      [token]
    );

    if (!result.rows.length) {
      return res.status(404).send("Geçersiz veya bulunamayan rapor linki");
    }

    const report = result.rows[0];

    if (report.consumed_at) {
      return res.status(403).send("Bu link daha önce kullanıldı");
    }

    if (new Date(report.expires_at).getTime() < Date.now()) {
      return res.status(403).send("Link süresi doldu");
    }

    await pool.query(
      `
      update report_links
      set consumed_at = now()
      where id = $1
      `,
      [report.id]
    );

    res.setHeader("Content-Type", "text/html; charset=utf-8");
    return res.status(200).send(`
      <!DOCTYPE html>
      <html lang="tr">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>${escapeHtml(report.subject || "ZENTRA Raporu")}</title>
        <style>
          body {
            margin: 0;
            padding: 24px;
            background: #0b132b;
            color: white;
            font-family: Arial, sans-serif;
          }
          .wrap {
            max-width: 760px;
            margin: 0 auto;
            background: #101c3a;
            border: 1px solid #22345d;
            border-radius: 16px;
            padding: 24px;
          }
          .meta {
            color: #8fa8cc;
            font-size: 13px;
            margin-bottom: 18px;
          }
          h2 {
            margin-top: 0;
          }
          pre {
            white-space: pre-wrap;
            line-height: 1.7;
            font-size: 15px;
            color: #e8eef9;
          }
          .watermark {
            margin-top: 18px;
            padding-top: 18px;
            border-top: 1px solid #22345d;
            font-size: 12px;
            color: #7f96b6;
          }
        </style>
      </head>
      <body>
        <div class="wrap">
          <h2>ZENTRA Raporu</h2>
          <div class="meta">
            Alıcı: ${escapeHtml(report.email || "--")}<br>
            Oluşturulma: ${escapeHtml(report.created_at || "--")}
          </div>
          <pre>${escapeHtml(report.report_text)}</pre>
          <div class="watermark">
            ZENTRA Matrix Ecosystem • Controlled Report Delivery
          </div>
        </div>
      </body>
      </html>
    `);
  } catch (e) {
    return res.status(500).send(`Sunucu hatası: ${String(e && e.message ? e.message : e)}`);
  }
}

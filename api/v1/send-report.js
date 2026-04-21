import crypto from "crypto";
import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

function json(res, status, body) {
  res.status(status).json(body);
}

function buildHTML(link) {
  return `
  <html>
    <body style="margin:0;padding:24px;background:#081321;font-family:Arial,Helvetica,sans-serif;color:#eaf1fb;">
      <div style="max-width:680px;margin:0 auto;background:#0d1f3b;border:1px solid #1d3557;border-radius:18px;overflow:hidden;">
        <div style="padding:24px;border-bottom:1px solid #18304d;">
          <div style="font-size:13px;letter-spacing:.08em;text-transform:uppercase;color:#7ea6ff;font-weight:700;">
            ZENTRA Matrix Ecosystem
          </div>
          <div style="margin-top:10px;font-size:28px;font-weight:800;color:#ffffff;">
            ZENTRA Raporu
          </div>
          <div style="margin-top:8px;font-size:14px;color:#9db2d0;">
            Güvenli görüntüleme bağlantısı
          </div>
        </div>
        <div style="padding:24px;">
          <p style="font-size:15px;line-height:1.7;color:#dce7f7;">
            Raporunuz hazır. Güvenli görüntüleme için aşağıdaki butonu kullanın.
          </p>
          <a href="${link}" style="display:inline-block;padding:12px 20px;background:#2d6cff;color:#fff;border-radius:10px;text-decoration:none;font-weight:700;">
            Raporu Aç
          </a>
          <p style="margin-top:16px;font-size:13px;line-height:1.6;color:#9db2d0;">
            Bu bağlantı tek kullanımlıktır ve sınırlı süre geçerlidir.
          </p>
        </div>
      </div>
    </body>
  </html>
  `;
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return json(res, 405, { ok: false, detail: "Method Not Allowed" });
  }

  try {
    const body = typeof req.body === "string" ? JSON.parse(req.body || "{}") : (req.body || {});
    const to = String(body.to || "").trim();
    const subject = String(body.subject || "ZENTRA Report").trim();
    const text = String(body.text || "").trim();

    if (!to || !text) {
      return json(res, 400, { ok: false, detail: "Missing to or text" });
    }

    const apiKey = process.env.RESEND_API_KEY;
    const from = process.env.REPORT_FROM_EMAIL;
    const databaseUrl = process.env.DATABASE_URL;

    if (!apiKey || !from || !databaseUrl) {
      return json(res, 500, {
        ok: false,
        detail: "Missing RESEND_API_KEY, REPORT_FROM_EMAIL, or DATABASE_URL"
      });
    }

    const token = crypto.randomBytes(24).toString("hex");
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await pool.query(
      `
      insert into report_links (token, email, subject, report_text, expires_at)
      values ($1, $2, $3, $4, $5)
      `,
      [token, to, subject, text, expiresAt]
    );

    const link = `https://zentra-core.vercel.app/api/v1/report/view?token=${token}`;
    const html = buildHTML(link);

    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        from,
        to: [to],
        subject,
        html,
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
      message: "Report sent successfully",
      provider: "resend",
      id: data.id || null,
      link
    });
  } catch (e) {
    return json(res, 500, {
      ok: false,
      detail: "Send report failed",
      error: String(e && e.message ? e.message : e)
    });
  }
}
